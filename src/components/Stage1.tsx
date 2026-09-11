import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Loader2, HelpCircle, Trophy, Award, Sparkles, Volume2, WifiOff } from 'lucide-react';
import { Question } from '../types';
import { useAudio } from './AudioEngine';
import { cn, getAskedQuestions, addAskedQuestion } from '../lib/utils';
import { OFFLINE_STAGE1 } from '../lib/offlineQuestions';

interface PlayerState {
  id: string;
  name: string;
  points: number; // Represents the current "9 à la suite" streak
  isQualified: boolean;
  isVirtual: boolean;
  avatarSeed: number;
  avatarColor: string;
  accuracy: number; // Probability of giving a correct answer
  speed: number;    // Speed multiplier (lower is faster)
}

interface ScheduledBuzz {
  playerId: string;
  buzzTime: number; // Time left (20s to 0s) at which this AI buzzes
  isCorrect: boolean;
}

const INITIAL_AI_PLAYERS: Omit<PlayerState, 'id'>[] = [
  { name: 'Sophie', points: 0, isQualified: false, isVirtual: true, avatarSeed: 1, avatarColor: '#ec4899', accuracy: 0.76, speed: 0.85 },
  { name: 'Jean', points: 0, isQualified: false, isVirtual: true, avatarSeed: 2, avatarColor: '#3b82f6', accuracy: 0.65, speed: 1.05 },
  { name: 'Marie', points: 0, isQualified: false, isVirtual: true, avatarSeed: 3, avatarColor: '#10b981', accuracy: 0.58, speed: 0.75 },
  { name: 'Pierre', points: 0, isQualified: false, isVirtual: true, avatarSeed: 4, avatarColor: '#f59e0b', accuracy: 0.82, speed: 1.35 },
  { name: 'Lucas', points: 0, isQualified: false, isVirtual: true, avatarSeed: 5, avatarColor: '#8b5cf6', accuracy: 0.70, speed: 0.95 },
  { name: 'Julie', points: 0, isQualified: false, isVirtual: true, avatarSeed: 6, avatarColor: '#14b8a6', accuracy: 0.52, speed: 1.25 },
];

const BIBLICAL_FALLBACK_ANSWERS = [
  "Moïse", "Jésus", "L'Arche de Noé", "David", "Goliath", "Samson",
  "Salomon", "Jean-Baptiste", "Abraham", "Noé", "Genèse", "La Mer Rouge", "L'Apocalypse", "Égypte", "Jérusalem", "Marie"
];

export default function Stage1({ playerName, onComplete, offlineMode }: { playerName?: string; onComplete: (points: number) => void; offlineMode?: boolean }) {
  const { playSound, speak } = useAudio();
  
  // Game states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wasOfflineUsed, setWasOfflineUsed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Players state (1 human + 6 virtual)
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [qualifiedRankings, setQualifiedRankings] = useState<string[]>([]);
  
  // Active buzzer state
  type BuzzerState = 'READING' | 'BUZZED' | 'HUMAN_TYPING' | 'AI_ANSWERING' | 'FEEDBACK' | 'ROUND_END';
  const [buzzerState, setBuzzerState] = useState<BuzzerState>('READING');
  const [buzzedPlayer, setBuzzedPlayer] = useState<PlayerState | null>(null);
  const [scheduledBuzzes, setScheduledBuzzes] = useState<ScheduledBuzz[]>([]);
  
  // Timing state
  const [timeLeft, setTimeLeft] = useState(20);
  const [humanAnswerTimeLeft, setHumanAnswerTimeLeft] = useState(20);
  
  // Interactive inputs and visual feedback
  const [humanAnswerInput, setHumanAnswerInput] = useState('');
  const [aiAnswerGiven, setAiAnswerGiven] = useState('');
  const [feedbackResult, setFeedbackResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [statusMessage, setStatusMessage] = useState('La question va être lue. Tenez-vous prêt à buzzer !');
  const [justLostStreakId, setJustLostStreakId] = useState<string | null>(null);

  // Focus ref for text input
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize players
  useEffect(() => {
    const initial: PlayerState[] = [
      {
        id: 'human',
        name: playerName || 'Moi',
        points: 0,
        isQualified: false,
        isVirtual: false,
        avatarSeed: 0,
        avatarColor: '#f1c40f', // gold
        accuracy: 1.0,
        speed: 1.0
      },
      ...INITIAL_AI_PLAYERS.map((p, i) => ({
        ...p,
        id: `ai-${i}`
      }))
    ];
    setPlayers(initial);
    fetchQuestions();

    return () => {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("speechSynthesis.cancel failed in Stage1 clean-up:", e);
        }
      }
    };
  }, [playerName]);

  const currentQ = questions[currentIndex];

  // Mark current question as asked
  useEffect(() => {
    if (currentQ) {
      addAskedQuestion(currentQ.id, currentQ.question, currentQ.answer);
    }
  }, [currentIndex, currentQ]);

  // TTS read question
  useEffect(() => {
    if (currentQ && buzzerState === 'READING' && !loading && !error) {
      speak(currentQ.question);
    } else {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("speechSynthesis.cancel failed in Stage1 text-to-speech effect:", e);
        }
      }
    }
  }, [currentIndex, currentQ, buzzerState, loading, error]);

  // Pre-schedule AI buzzes when a new question starts
  useEffect(() => {
    if (buzzerState === 'READING' && currentQ && players.length > 0) {
      scheduleAiBuzzes();
    }
  }, [currentIndex, buzzerState, players.length]);

  // Main Reading Timer (100ms precision)
  useEffect(() => {
    if (buzzerState !== 'READING' || loading || error) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const nextVal = Math.max(0, Number((prev - 0.1).toFixed(1)));

        // Try to trigger the next scheduled AI buzzer
        const triggered = scheduledBuzzes.find(b => nextVal <= b.buzzTime);
        if (triggered) {
          const matchingPlayer = players.find(p => p.id === triggered.playerId);
          if (matchingPlayer && !matchingPlayer.isQualified) {
            clearInterval(interval);
            handleAiBuzz(matchingPlayer, triggered.isCorrect);
            return prev;
          }
        }

        if (nextVal <= 0) {
          clearInterval(interval);
          handleNobodyBuzzed();
        }
        return nextVal;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [buzzerState, loading, error, scheduledBuzzes, players]);

  // Human Typing Timer
  useEffect(() => {
    if (buzzerState !== 'HUMAN_TYPING') return;

    const interval = setInterval(() => {
      setHumanAnswerTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleHumanTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [buzzerState]);

  // Auto-focus input when human typing starts
  useEffect(() => {
    if (buzzerState === 'HUMAN_TYPING' && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [buzzerState]);

  // Keyboard support: Press Space to buzz when READING
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const isFocusedOnInput = document.activeElement?.tagName === 'INPUT';
        if (!isFocusedOnInput && buzzerState === 'READING') {
          e.preventDefault();
          handleHumanBuzz();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buzzerState]);

  const fetchQuestions = async (isAppend = false) => {
    if (!isAppend) setLoading(true);

    const loadOffline = () => {
      console.log('Loading Stage 1 questions in Offline Mode...');
      setWasOfflineUsed(true);
      const shuffledOffline = [...OFFLINE_STAGE1];
      for (let i = shuffledOffline.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOffline[i], shuffledOffline[j]] = [shuffledOffline[j], shuffledOffline[i]];
      }
      // Re-map format if necessary
      const selected: Question[] = shuffledOffline.slice(0, 15).map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        category: q.category,
        choices: q.choices
      }));
      
      if (isAppend) {
        setQuestions(prev => [...prev, ...selected]);
      } else {
        setQuestions(selected);
        setLoading(false);
        setError(false);
      }
    };

    if (offlineMode) {
      loadOffline();
      return;
    }

    try {
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage: 1,
          exclude: getAskedQuestions()
        })
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (isAppend) {
          setQuestions(prev => [...prev, ...data]);
        } else {
          setQuestions(data);
          setLoading(false);
          setError(false);
        }
      } else {
        throw new Error('Invalid data');
      }
    } catch (err) {
      console.warn('Fetch error, falling back to local files:', err);
      loadOffline();
    }
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // removes accents
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""); // removes punctuation
  };

  const isAnswerCorrect = (userStr: string, correctStr: string): boolean => {
    const normUser = normalizeText(userStr);
    const normCorrect = normalizeText(correctStr);
    if (!normUser || !normCorrect) return false;

    if (normUser === normCorrect) return true;
    
    // Lenient substring check
    if (normCorrect.includes(normUser) && normUser.length >= 3) return true;
    if (normUser.includes(normCorrect) && normCorrect.length >= 3) return true;

    return false;
  };

  const scheduleAiBuzzes = () => {
    const activeAis = players.filter(p => p.isVirtual && !p.isQualified);
    const scheduled: ScheduledBuzz[] = [];

    activeAis.forEach(ai => {
      // 80% willingness to try to buzz
      if (Math.random() < 0.80) {
        const knows = Math.random() < ai.accuracy;
        const reactionTime = knows 
          ? (3.0 + Math.random() * 4.0) * ai.speed
          : (7.0 + Math.random() * 7.0) * ai.speed;

        const triggerTime = 20.0 - reactionTime;
        if (triggerTime > 0.3) {
          scheduled.push({
            playerId: ai.id,
            buzzTime: Number(triggerTime.toFixed(1)),
            isCorrect: knows
          });
        }
      }
    });

    // Sort descending by remain time (faster = bigger time left)
    scheduled.sort((a, b) => b.buzzTime - a.buzzTime);
    setScheduledBuzzes(scheduled);
  };

  // Human buzzes
  const handleHumanBuzz = () => {
    if (buzzerState !== 'READING') return;
    playSound('click');
    setBuzzerState('HUMAN_TYPING');
    setBuzzedPlayer(players.find(p => p.id === 'human') || null);
    setHumanAnswerInput('');
    setHumanAnswerTimeLeft(20);
    setStatusMessage('Vous avez buzzé ! Vous avez 20 secondes pour répondre.');
  };

  // AI buzzes
  const handleAiBuzz = (player: PlayerState, isCorrect: boolean) => {
    setBuzzerState('AI_ANSWERING');
    playSound('system_buzz');
    setBuzzedPlayer(player);
    setStatusMessage(`${player.name} a buzzé !`);

    // Let the AI answer after 1.5s thinking delay
    setTimeout(() => {
      const actualCorrectAnswer = currentQ?.answer || '';
      const chosenAnswer = isCorrect 
        ? actualCorrectAnswer 
        : BIBLICAL_FALLBACK_ANSWERS[Math.floor(Math.random() * BIBLICAL_FALLBACK_ANSWERS.length)];
      
      setAiAnswerGiven(chosenAnswer);
      setFeedbackResult(isCorrect ? 'correct' : 'wrong');

      setTimeout(() => {
        applyAnswerResult(player.id, isCorrect);
      }, 2000);
    }, 1500);
  };

  // Timeout for no buzz
  const handleNobodyBuzzed = () => {
    setBuzzerState('FEEDBACK');
    setBuzzedPlayer(null);
    setFeedbackResult('timeout');
    playSound('fail');
    setStatusMessage('Temps écoulé ! Personne n\'a buzzé.');

    setTimeout(() => {
      advanceToNextQuestion();
    }, 3000);
  };

  // Human validates answer
  const handleHumanSubmit = () => {
    if (buzzerState !== 'HUMAN_TYPING') return;
    const isCorrect = isAnswerCorrect(humanAnswerInput, currentQ?.answer || '');
    
    setBuzzerState('FEEDBACK');
    setFeedbackResult(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      playSound('success');
      setStatusMessage('Bonne réponse ! Vous gagnez 1 point.');
    } else {
      playSound('fail');
      setStatusMessage(`Mauvaise réponse ! La bonne réponse était : "${currentQ?.answer}".`);
    }

    setTimeout(() => {
      applyAnswerResult('human', isCorrect);
    }, 2500);
  };

  // Human typing timeout
  const handleHumanTimeout = () => {
    setBuzzerState('FEEDBACK');
    setFeedbackResult('timeout');
    playSound('fail');
    setStatusMessage(`Temps de réponse écoulé ! La bonne réponse était : "${currentQ?.answer}".`);

    setTimeout(() => {
      applyAnswerResult('human', false);
    }, 3000);
  };

  const applyAnswerResult = (playerId: string, isCorrect: boolean) => {
    setPlayers(prevPlayers => {
      let isFirstTimeQualifying = false;
      let targetPlayerName = '';

      const updated = prevPlayers.map(p => {
        if (p.id === playerId) {
          targetPlayerName = p.name;
          if (isCorrect) {
            const nextPoints = p.points + 1;
            const reachesQualify = nextPoints >= 9 && !p.isQualified;
            if (reachesQualify) {
              isFirstTimeQualifying = true;
            }
            return {
              ...p,
              points: nextPoints,
              isQualified: p.isQualified || nextPoints >= 9
            };
          } else {
            if (p.points > 0) {
              triggerShake(p.id);
            }
            return {
              ...p,
              points: p.points
            };
          }
        }
        return p;
      });

      if (isFirstTimeQualifying && targetPlayerName) {
        setQualifiedRankings(prev => {
          if (prev.includes(targetPlayerName)) {
            return prev;
          }
          const nextRank = [...prev, targetPlayerName];
          playSound('success');
          
          // If exactly 4 spots are filled, wrap up the stage
          if (nextRank.length === 4) {
            setTimeout(() => {
              setBuzzerState('ROUND_END');
              setStatusMessage('Manche terminée ! Nous tenons nos 4 qualifiés !');
            }, 1000);
          }
          return nextRank;
        });
      }

      return updated;
    });

    advanceToNextQuestion();
  };

  const triggerShake = (id: string) => {
    setJustLostStreakId(id);
    setTimeout(() => setJustLostStreakId(null), 805);
  };

  const advanceToNextQuestion = () => {
    // Reset state for next question
    setFeedbackResult(null);
    setBuzzedPlayer(null);
    setHumanAnswerInput('');
    setAiAnswerGiven('');
    setTimeLeft(20);
    
    // Pre-emptively fetch questions if close to end
    if (currentIndex >= questions.length - 3) {
      fetchQuestions(true);
    }

    setPlayers(currentPlayers => {
      // Check if game already has 4 qualifiers
      const qualified = currentPlayers.filter(p => p.isQualified).length;
      if (qualified >= 4) {
        setBuzzerState('ROUND_END');
        return currentPlayers;
      }

      setBuzzerState('READING');
      setCurrentIndex(v => v + 1);
      setStatusMessage('Une nouvelle question se prépare...');
      return currentPlayers;
    });
  };

  const handleFinishRound = () => {
    // Has the human qualified?
    const humanObj = players.find(p => p.id === 'human');
    const hasQualified = humanObj?.isQualified && qualifiedRankings.includes(humanObj.name);

    if (hasQualified) {
      // Collect the 4 qualifiers in order without duplicate names
      const uniqueQualifiedNames = Array.from(new Set(qualifiedRankings));
      const orderedQualifiers = uniqueQualifiedNames.slice(0, 4).map((name) => {
        const found = players.find(p => p.name === name);
        return {
          id: found?.id || (name === (playerName || 'Moi') ? 'human' : `ai-${Math.floor(Math.random() * 1000)}`),
          name: name,
          avatarColor: found?.avatarColor || '#f1c40f',
          isHuman: found ? !found.isVirtual : (name === (playerName || 'Moi')),
          chosenTheme: null as string | null,
          maxStreak: 0
        };
      });

      try {
        localStorage.setItem('alliance_quiz_stage1_qualifiers', JSON.stringify(orderedQualifiers));
      } catch (err) {
        console.error("Failed to save qualifiers to localStorage:", err);
      }

      playSound('success');
      // Pass a victory points value (9) to nextStage inside App.tsx
      onComplete(9);
    } else {
      playSound('fail');
      onComplete(0); // Trigger defeat
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-500/20 blur-xl animate-pulse rounded-full" />
        <Loader2 className="w-14 h-14 text-amber-accent animate-spin relative z-10" />
      </div>
      <p className="font-sans font-black italic text-white text-sm uppercase tracking-widest animate-pulse">Chargement de l'arène des 9 à la suite...</p>
    </div>
  );

  if (error) return (
    <div className="text-center px-6 py-10">
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 mb-6 max-w-sm mx-auto">
        <p className="text-red-400 font-sans font-black uppercase text-sm mb-2">Erreur de Réseau</p>
        <p className="text-slate-300 text-xs leading-relaxed">
          Impossible d'établir une liaison avec le serveur de questions théologiques. Veuillez réessayer.
        </p>
      </div>
      <button 
        onClick={() => fetchQuestions(false)} 
        className="px-10 py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 metal-border"
      >
        Réessayer la connexion
      </button>
    </div>
  );

  // If in Round End (Game Over / Results Summary)
  if (buzzerState === 'ROUND_END') {
    const isHumanQualified = qualifiedRankings.includes(playerName || 'Moi');

    return (
      <div className="w-full max-w-lg z-10 flex flex-col items-center py-6 px-4">
        <div className="text-center mb-8">
          <Trophy className={cn("w-14 h-14 mx-auto mb-3", isHumanQualified ? "text-amber-accent animate-bounce" : "text-slate-500")} />
          <h2 className="text-amber-accent text-[9px] uppercase tracking-[0.4em] mb-1 font-black">RÉSULTATS DE LA MANCHE</h2>
          <h3 className="text-3xl font-serif italic text-white uppercase tracking-tighter font-black">
            {isHumanQualified ? "QUALIFICATION ACQUISE !" : "ÉLIMINATION !"}
          </h3>
        </div>

        <div className="glass-panel p-6 w-full border-slate-700/50 mb-8 space-y-4">
          <p className="text-xs uppercase font-black text-slate-400 mb-2 tracking-widest text-center">Tableau d'Honneur (Top 4 Qualifiés) :</p>
          
          <div className="space-y-3">
            {[1, 2, 3, 4].map((pos) => {
              const name = qualifiedRankings[pos - 1];
              const playerObj = players.find(p => p.name === name);
              
              return (
                <div 
                  key={pos} 
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-lg border",
                    name === (playerName || 'Moi')
                      ? "bg-amber-500/10 border-amber-500/50"
                      : name 
                        ? "bg-slate-900/60 border-slate-800" 
                        : "bg-slate-950/20 border-dashed border-slate-800/80 p-3"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                      pos === 1 ? "bg-amber-500 text-black" : "bg-slate-800 text-slate-400"
                    )}>
                      {pos}
                    </span>
                    {name ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3.5 h-3.5 rounded-full" 
                          style={{ backgroundColor: playerObj?.avatarColor || '#fff' }} 
                        />
                        <span className="font-sans font-black uppercase tracking-tight text-white italic">{name}</span>
                        {name === (playerName || 'Moi') && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-accent px-1.5 py-0.5 rounded font-black uppercase tracking-wide">Moi</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 italic">Emplacement vide...</span>
                    )}
                  </div>
                  <div>
                    {name ? (
                      <span className="text-xs px-2.5 py-1 bg-green-950/40 text-green-400 font-extrabold uppercase rounded-full">QUALIFIÉ(E)</span>
                    ) : (
                      <span className="text-xs text-slate-700">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={handleFinishRound}
          className={cn(
            "w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 metal-border",
            isHumanQualified 
              ? "bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black shadow-amber-500/10"
              : "bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-red-900/15"
          )}
        >
          {isHumanQualified ? "Passer au 4 à la suite" : "Quitter l'Émission"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full z-10 flex flex-col items-center">
      
      {wasOfflineUsed && (
        <div className="w-full max-w-xl mx-auto mb-4 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-center gap-2 text-xs text-amber-accent font-black uppercase tracking-wider animate-pulse">
          <WifiOff className="w-4 h-4 text-amber-accent" /> mode hors-ligne actif (Données locales)
        </div>
      )}
      
      {/* Qualification Spots Tracker Header */}
      <div className="w-full max-w-xl text-center mb-2 md:mb-5">
        <div className="inline-block px-3 py-0.5 md:py-1 bg-slate-900/80 border border-slate-700 rounded-full mb-1.5 md:mb-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
          Places de qualification : <span className="text-amber-accent font-black text-xs">{qualifiedRankings.length} / 4</span> pour la finale
        </div>
        <div className="flex justify-center gap-1.5 md:gap-2">
          {Array.from({ length: 4 }).map((_, i) => {
            const qualifiedName = qualifiedRankings[i];
            const isFilled = !!qualifiedName;
            return (
              <div 
                key={i} 
                className={cn(
                  "px-2 md:px-3 py-1 md:py-1.5 rounded-sm border flex items-center justify-center text-[9px] md:text-[10px] font-black tracking-tight uppercase min-w-[70px] sm:min-w-[85px] md:min-w-[100px] transition-all duration-300 truncate text-ellipsis",
                  isFilled 
                    ? "bg-amber-400/10 border-amber-500 text-amber-accent shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                    : "bg-slate-950/40 border-slate-800 text-slate-600"
                )}
              >
                {isFilled ? `👑 ${qualifiedName}` : "Disponible..."}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-6 w-full max-w-4xl items-start">
        
        {/* Players Sidebar Standing List */}
        <div className="md:col-span-1 space-y-1 md:space-y-2 bg-slate-950/30 p-2 sm:p-2.5 md:p-4 rounded-xl border border-slate-800/50 relative shadow-sm">
          <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1 md:mb-3 px-0.5">CONCURRENTS</p>
          <div className="flex md:flex-col gap-1.5 sm:gap-2 overflow-x-auto md:overflow-visible pb-0.5 md:pb-0 scrollbar-none">
            {players.map((p) => {
              const isFirstTimeQualified = p.isQualified && qualifiedRankings.includes(p.name);
              const lostStreak = justLostStreakId === p.id;
              
              return (
                <motion.div
                  key={p.id}
                  animate={lostStreak ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.8 }}
                  className={cn(
                    "flex-1 md:flex-initial p-2 md:p-3 rounded-lg border-2 flex flex-col md:flex-row items-center md:justify-between gap-1 md:gap-3 transition-all duration-300 min-w-[95px] sm:min-w-[110px] md:min-w-0 md:w-full relative",
                    p.id === 'human' 
                      ? "border-amber-500/60 bg-gradient-to-r from-amber-500/10 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.1)]" 
                      : "border-slate-800 bg-slate-900/60",
                    p.isQualified ? "border-green-500/50 bg-green-500/10" : ""
                  )}
                >
                  <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                    <div 
                      className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-white/30 shadow-sm shrink-0" 
                      style={{ backgroundColor: p.avatarColor }} 
                    />
                    <div className="text-center md:text-left truncate">
                      <p className="font-sans font-black text-xs md:text-xs uppercase tracking-tight text-white inline-flex items-center gap-1 leading-tight">
                        <span className="truncate max-w-[70px] sm:max-w-[90px] md:max-w-none">{p.name}</span>
                        {p.id === 'human' && <span className="text-[7.5px] bg-amber-500 text-black px-1 rounded-xs font-black">MOI</span>}
                      </p>
                      
                      {/* 9 gold streak boxes */}
                      {!p.isQualified ? (
                        <div className="flex gap-0.5 mt-0.5 md:mt-1 justify-center md:justify-start">
                          {Array.from({ length: 9 }).map((_, si) => (
                            <div 
                              key={si} 
                              className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                si < p.points 
                                  ? "bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.6)] scale-110" 
                                  : "bg-slate-700"
                              )}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-[8.5px] md:text-[9px] text-green-400 font-black tracking-widest mt-0.5">QUALIFIÉ(E)</p>
                      )}
                    </div>
                  </div>
                  <div className="font-mono text-[10px] md:text-[11px] font-black italic select-none shrink-0 mt-0.5 md:mt-0">
                    {p.isQualified ? "👑" : `${p.points}/9`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Main Central Game Arena */}
        <div className="md:col-span-3 flex flex-col items-center">
          
          {/* Circular Countdown Progress Ring - Compact vertical gap */}
          <div className="my-1 md:my-0 md:mb-5 flex items-center gap-2.5 md:gap-3">
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full border-3 md:border-4 flex items-center justify-center transition-all duration-300 relative overflow-hidden shrink-0",
              timeLeft <= 4 && buzzerState === 'READING' ? "border-red-600 bg-red-950/20 animate-pulse" : "border-electric-blue/40 bg-slate-900/90 shadow-lg"
            )}>
              <span className={cn(
                "text-sm md:text-base font-sans font-black",
                timeLeft <= 4 && buzzerState === 'READING' ? "text-red-500" : "text-electric-blue"
              )}>{Math.ceil(timeLeft)}</span>
            </div>
            <div className="text-left select-none">
              <p className="text-[7px] uppercase tracking-[0.3em] font-black text-slate-500 leading-tight">CHRONOMÈTRE</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-300 leading-tight">QUESTION EN COURS</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
               key={currentIndex}
               initial={{ x: 30, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -30, opacity: 0 }}
               transition={{ type: "spring", stiffness: 100, damping: 15 }}
               className={cn(
                 "glass-panel p-4 sm:p-6 w-full relative overflow-hidden border-slate-700/60 shadow-3xl transition-all duration-300 metal-border flex flex-col min-h-[260px] sm:min-h-[340px]",
                 feedbackResult === 'correct' ? "border-green-500/40 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : "",
                 feedbackResult === 'wrong' ? "border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : ""
               )}
            >
              <div className="absolute top-0 left-0 h-1 bg-amber-accent transition-all duration-500 ease-out" style={{ width: `${(currentIndex / 40) * 100}%` }} />
              
              {/* Question Category & Text block */}
              <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-6 items-start">
                <div className="p-2 sm:p-3 bg-slate-900 rounded-sm border border-electric-blue/20 shadow-md shrink-0">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue" />
                </div>
                <div className="flex-1">
                   <p className="text-[8px] sm:text-[9px] uppercase text-amber-accent/80 font-black mb-1 sm:mb-1.5 tracking-[0.3em]">{currentQ?.category || 'PROPHÈTES & ROIS'}</p>
                   <h4 className="text-base sm:text-lg md:text-xl font-sans text-white leading-relaxed italic font-bold tracking-tight">
                     "{currentQ?.question}"
                   </h4>
                   
                   {/* Animated audio speaker while reading */}
                   {buzzerState === 'READING' && (
                     <div className="mt-2 flex items-center gap-1.5 text-slate-500 text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider select-none">
                       <Volume2 className="w-3.5 h-3.5 text-amber-accent animate-pulse" />
                       <span className="text-slate-400">Voix off en cours...</span>
                       <div className="flex gap-0.5">
                         <span className="w-1 h-2 bg-amber-500 rounded-xs animate-[bounce_0.8s_infinite]" />
                         <span className="w-1 h-3.5 bg-amber-500 rounded-xs animate-[bounce_0.8s_infinite_0.2s]" />
                         <span className="w-1 h-1.5 bg-amber-500 rounded-xs animate-[bounce_0.8s_infinite_0.4s]" />
                       </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Status banner */}
              <div className="w-full bg-slate-950/40 border border-slate-800 rounded p-2 sm:p-2.5 mb-3 sm:mb-6 text-center text-slate-300 text-xs tracking-wide">
                {statusMessage}
              </div>

              {/* Interaction zone depending on state */}
              <div className="flex-1 flex flex-col items-center justify-center">
                
                {/* 1. Idle and Reading: Show buzzer */}
                {buzzerState === 'READING' && (
                  <div className="w-full text-center py-1 sm:py-2 flex flex-col items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleHumanBuzz}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-red-400 shadow-xl shadow-red-500/20 active:shadow-inner border-4 border-white flex flex-col items-center justify-center relative cursor-cell metal-border transition-all animate-pulse"
                    >
                      <span className="text-black font-black font-sans text-xs sm:text-[13px] tracking-widest uppercase leading-tight">BUZZ</span>
                      <span className="text-[7.5px] sm:text-[8px] text-red-950 font-black tracking-wider uppercase mt-0.5 sm:mt-1">CLIQUEZ</span>
                    </motion.button>
                    <p className="text-[9px] sm:text-[10px] uppercase font-black text-slate-500 mt-2.5 sm:mt-4 tracking-[0.2em]">
                      Astuce : pressez la touche <span className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">[ESPACE]</span> pour buzzer de votre clavier !
                    </p>
                  </div>
                )}

                {/* 2. Human typing his guess */}
                {buzzerState === 'HUMAN_TYPING' && (
                  <div className="w-full max-w-sm flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs font-black uppercase text-amber-accent/80">
                      <span>ENTREZ VOTRE RÉPONSE :</span>
                      <span className={cn(
                        "font-mono font-black text-sm",
                        humanAnswerTimeLeft <= 5 ? "text-red-500 animate-pulse" : "text-amber-accent"
                      )}>
                        {humanAnswerTimeLeft}s
                      </span>
                    </div>

                    {/* Dynamic 20s Progress Bar */}
                    <div className="w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-slate-700/60 shadow-inner">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000 ease-linear rounded-full",
                          humanAnswerTimeLeft <= 5 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-gradient-to-r from-amber-500 to-amber-300"
                        )}
                        style={{ width: `${Math.max(0, Math.min(100, (humanAnswerTimeLeft / 20) * 100))}%` }}
                      />
                    </div>

                    <div className="flex gap-2 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={humanAnswerInput}
                        maxLength={45}
                        onChange={(e) => setHumanAnswerInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleHumanSubmit();
                          }
                        }}
                        placeholder="Tapez et validez..."
                        className="w-full bg-slate-900 border-2 border-amber-500/60 p-3 rounded text-white text-base font-sans italic font-black uppercase focus:outline-none focus:border-amber-400 tracking-wide text-center"
                      />
                      <button
                        onClick={handleHumanSubmit}
                        className="p-3 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-wider rounded border border-amber-400/50"
                      >
                        Valider
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 italic text-center uppercase tracking-wider mt-1">
                      (Noms propres acceptés sans accent ni casse stricte)
                    </p>
                  </div>
                )}

                {/* 3. AI player answering */}
                {buzzerState === 'AI_ANSWERING' && buzzedPlayer && (
                  <div className="w-full flex flex-col items-center gap-4 py-3">
                    <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700 px-6 py-4 rounded-xl shadow-lg relative">
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: buzzedPlayer.avatarColor }} />
                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">A BUZZÉ :</p>
                        <p className="text-xl font-sans font-black text-white italic uppercase tracking-tight">{buzzedPlayer.name}</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {aiAnswerGiven ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mt-2 text-center"
                        >
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">PROPOSITION :</p>
                          <div className={cn(
                            "px-5 py-3 rounded border text-xl font-sans font-black italic uppercase tracking-tighter",
                            feedbackResult === 'correct' 
                              ? "bg-green-950/30 border-green-500 text-green-400" 
                              : "bg-red-950/30 border-red-500 text-red-500"
                          )}>
                            "{aiAnswerGiven}"
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-accent" />
                          <span>Réfléchit...</span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 4. Feedback Result phase */}
                {buzzerState === 'FEEDBACK' && (
                  <div className="w-full flex flex-col items-center justify-center gap-3">
                    {feedbackResult === 'correct' && (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center border border-green-500 mb-3">
                          <Check className="w-6 h-6 text-green-400 stroke-[3px]" />
                        </div>
                        <p className="text-green-400 font-sans font-black text-2xl uppercase tracking-tighter italic">BONNE RÉPONSE !</p>
                      </div>
                    )}
                    {feedbackResult === 'wrong' && (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center border border-red-500 mb-3">
                          <X className="w-6 h-6 text-red-500 stroke-[3px]" />
                        </div>
                        <p className="text-red-500 font-sans font-black text-2xl uppercase tracking-tighter italic">MAUVAISE RÉPONSE !</p>
                        <p className="text-xs text-slate-400 mt-2 text-center">La bonne réponse était : "{currentQ?.answer}"</p>
                      </div>
                    )}
                    {feedbackResult === 'timeout' && (
                      <div className="flex flex-col items-center text-center">
                        <p className="text-amber-accent font-sans font-black text-2xl uppercase tracking-tighter italic">TEMPS ÉCOULÉ !</p>
                        <p className="text-xs text-slate-400 mt-2 max-w-sm">La bonne réponse était : <span className="text-white font-extrabold uppercase italic">"{currentQ?.answer}"</span></p>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </motion.div>
          </AnimatePresence>

          {/* Prompt guide footnote */}
          <div className="mt-6 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
            CONCURRENCE MULTI-JOUEURS <span className="text-amber-accent animate-pulse font-extrabold">• EN DIRECT</span>
          </div>
        </div>

      </div>

    </div>
  );
}
