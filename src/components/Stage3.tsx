import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Zap, ShieldAlert, CheckCircle2, XCircle, RotateCcw, Clock, Sparkles, WifiOff } from 'lucide-react';
import { Question, FaceOffQuestion } from '../types';
import { useAudio } from './AudioEngine';
import { cn, getAskedQuestions, addAskedQuestion } from '../lib/utils';
import { OFFLINE_STAGE3 } from '../lib/offlineQuestions';

// Backup offline questions for the Choc Final (Face-à-Face)
const BACKUP_QUESTIONS: FaceOffQuestion[] = [
  {
    id: 's3-fallback-1',
    answer: 'La Bible',
    clues: [
      "Je suis un recueil de textes sacrés rédigés par différents auteurs sur plusieurs siècles.",
      "Mes deux grandes parties sont l'Ancien et le Nouveau Testament.",
      "Je commence par le livre de la Genèse et je me termine par l'Apocalypse de Jean.",
      "Je suis historiquement le livre le plus traduit et le plus répandu au monde."
    ],
    explanation: "La Bible, du grec 'biblia' (les livres), est le recueil sacré rassemblant l'Ancien et le Nouveau Testament."
  },
  {
    id: 's3-fallback-2',
    answer: 'Moïse',
    clues: [
      "Je suis un prophète hébreux du XIIIe siècle avant JC dont le nom signifie 'sauvé des eaux'.",
      "J'ai mené les tribus d'Israël hors d'Égypte à travers le désert du Sinaï.",
      "J'ai grimpé sur le sommet du Mont Sinaï pour recevoir les Tables de la Loi authentifiées de Dieu.",
      "J'ai levé mon bâton légendaire pour diviser en deux les flots tumultueux de la mer Rouge."
    ],
    explanation: "Moïse est le guide spirituel et législateur d'Israël ayant mené l'Exode et reçu les Dix Commandements."
  },
  {
    id: 's3-fallback-3',
    answer: 'Jérusalem',
    clues: [
      "Je suis une cité millénaire située sur un plateau des monts de Judée au Proche-Orient.",
      "Je suis considérée comme une ville trois fois sainte et abrite de formidables lieux de culte.",
      "J'entoure de mes collines le mont des Oliviers, le jardin de Gethsémané et le Saint-Sépulcre.",
      "Mon nom biblique dérive d'une racine sémitique signifiant traditionnellement 'Cité de la Paix'."
    ],
    explanation: "Jérusalem est une ville sainte absolue du monde monothéiste, théâtre de la révélation biblique."
  },
  {
    id: 's3-fallback-4',
    answer: 'Noé',
    clues: [
      "Je suis un patriarche biblique exemplaire réputé intègre au milieu de ma génération.",
      "Dieu m'a prévenu de la destruction imminente de toute chair par un cataclysme d'eau.",
      "J'ai construit pendant des décennies une gigantesque embarcation de bois résineux appelée arche.",
      "J'ai embarqué un couple de chaque espèce animale afin de repeupler la terre après le déluge."
    ],
    explanation: "Noé est le bâtisseur de l'arche salvatrice lors du Déluge et premier planteur de vigne selon la Genèse."
  },
  {
    id: 's3-fallback-5',
    answer: 'David',
    clues: [
      "Je suis le plus jeune fils d'Isaï, ayant débuté ma vie humblement comme jeune berger à Bethléem.",
      "J'ai terrassé à l'aide d'une simple fronde le géant philistin Goliath qui défiait les armées d'Israël.",
      "Je suis devenu le second roi d'Israël, célèbre pour ma poésie artistique à l'origine du livre des Psaumes.",
      "Mon règne prestigieux a établi Jérusalem comme la capitale religieuse et politique stable du royaume."
    ],
    explanation: "Le roi David est la figure centrale royale de l'Ancien Testament, ancêtre messianique et compositeur inspiré."
  }
];

export default function Stage3({ onComplete, playerName, opponentName, opponentColor, offlineMode }: { 
  onComplete: (points: number) => void;
  playerName?: string;
  opponentName?: string;
  opponentColor?: string;
  offlineMode?: boolean;
}) {
  const { playSound, speak } = useAudio();
  const [wasOfflineUsed, setWasOfflineUsed] = useState(false);
  
  // Game states
  const [questions, setQuestions] = useState<FaceOffQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [systemScore, setSystemScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'system_correct' | 'system_wrong' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Turn taking states
  const [handOwner, setHandOwner] = useState<'human' | 'opponent'>('human'); // Who has the priority turn to take the hand
  const [handState, setHandState] = useState<'asking' | 'active' | 'opponent_responding'>('asking');
  const [timeLeftAnswer, setTimeLeftAnswer] = useState(15); // 15 seconds response time
  const [attempts, setAttempts] = useState<{ human: boolean; opponent: boolean }>({ human: false, opponent: false });

  const currentQ = questions[currentIndex];
  
  // Mark current question as asked
  useEffect(() => {
    if (currentQ) {
      addAskedQuestion(currentQ.id, undefined, currentQ.answer);
    }
  }, [currentIndex, currentQ]);

  const pointPotential = 4 - currentClueIndex;
  const showOpponent = opponentName || "Julie";
  const dispOpponentColor = opponentColor || "#14b8a6";

  // Initial load
  useEffect(() => {
    fetchQuestions();
    return () => {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("speechSynthesis.cancel failed in Stage3 clean-up:", e);
        }
      }
    };
  }, []);

  // Fetch from backend
  const fetchQuestions = async () => {
    setError(false);
    setLoading(true);

    const loadOffline = () => {
      console.log('Loading Stage 3 questions in Offline Mode...');
      setWasOfflineUsed(true);
      // Combine pre-loaded and backup lists for ultimate variety
      const allOffline = [...OFFLINE_STAGE3, ...BACKUP_QUESTIONS];
      const shuffledOffline = allOffline.sort(() => 0.5 - Math.random());
      const selected = shuffledOffline.slice(0, 8).map((q, idx) => ({
        id: q.id || `off3-fallback-${idx}`,
        answer: q.answer,
        clues: q.clues,
        explanation: q.explanation
      }));
      setQuestions(selected);
      setLoading(false);
      setHandOwner('human');
      setHandState('asking');
      setTimeLeftAnswer(15);
      setAttempts({ human: false, opponent: false });
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
          stage: 3,
          exclude: getAskedQuestions()
        })
      });
      
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setLoading(false);
        // Start game flow for first question
        setHandOwner('human');
        setHandState('asking');
        setTimeLeftAnswer(15);
        setAttempts({ human: false, opponent: false });
      } else {
        throw new Error('No questions returned');
      }
    } catch (err) {
      console.warn('API error, loading high-quality Stage 3 fallback questions', err);
      loadOffline();
    }
  };

  // Clue delivery / voice control
  useEffect(() => {
    if (currentQ && currentQ.clues && !loading && !feedback && handState === 'asking' && !showAnswer) {
      const clueText = currentQ.clues[currentClueIndex];
      if (clueText) {
        speak(clueText);
      }
    } else if ((feedback || handState !== 'asking' || showAnswer) && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("speechSynthesis.cancel failed in Stage3 feedback/handState effect:", e);
      }
    }
  }, [currentIndex, currentClueIndex, loading, feedback, handState, showAnswer, questions]);

  // Clue expansion timer (progresses every 5 seconds if nobody has taken the hand)
  useEffect(() => {
    if (!loading && !feedback && handState === 'asking' && currentClueIndex < 3 && !showAnswer && !error && questions[currentIndex]) {
      const timer = setTimeout(() => {
        setCurrentClueIndex(v => v + 1);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [loading, feedback, handState, currentClueIndex, showAnswer, error, questions, currentIndex]);

  // Response active timer (counts down 15 seconds for responsive turn)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if ((handState === 'active' || handState === 'opponent_responding') && !feedback && !loading && !error && !showAnswer) {
      interval = setInterval(() => {
        setTimeLeftAnswer(v => {
          if (v <= 1) {
            clearInterval(interval!);
            handleTimeout();
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [handState, feedback, loading, error, showAnswer]);

  // Handle player answer timeout
  const handleTimeout = () => {
    playSound('fail');
    if (handState === 'active') {
      const nextAttempts = { ...attempts, human: true };
      setAttempts(nextAttempts);
      setFeedback('wrong');
      
      setTimeout(() => {
        setFeedback(null);
        handleHandTransfer('human', nextAttempts);
      }, 2500);
    } else if (handState === 'opponent_responding') {
      const nextAttempts = { ...attempts, opponent: true };
      setAttempts(nextAttempts);
      setFeedback('system_wrong');
      
      setTimeout(() => {
        setFeedback(null);
        handleHandTransfer('opponent', nextAttempts);
      }, 2500);
    }
  };

  // Handover switch or transition to next question if both failed
  const handleHandTransfer = (failedPlayer: 'human' | 'opponent', currentAttempts = attempts) => {
    const nextPlayer = failedPlayer === 'human' ? 'opponent' : 'human';
    const nextPlayerHasTried = nextPlayer === 'human' ? currentAttempts.human : currentAttempts.opponent;

    if (nextPlayerHasTried) {
      // Both failed the question! Show answer and move to next
      setShowAnswer(true);
      moveToNextQuestion(true);
    } else {
      // Give the hand to the opponent
      playSound('gong');
      setHandOwner(nextPlayer);
      setHandState('asking');
      setTimeLeftAnswer(15);
      speak(`La main revient à ${nextPlayer === 'human' ? playerName || "Moi" : showOpponent} !`);
    }
  };

  // Automatic opponent decision logic (when it is the opponent's turn, they automatically decide to take the hand)
  useEffect(() => {
    if (!loading && !feedback && handState === 'asking' && handOwner === 'opponent' && !attempts.opponent && !error && questions[currentIndex] && !showAnswer) {
      // Opponent thinks for a short delay and then takes the hand
      const delay = 2000 + Math.random() * 1500;
      const takeHandTimer = setTimeout(() => {
        setHandState('opponent_responding');
        setTimeLeftAnswer(15);
        playSound('system_buzz');
      }, delay);
      return () => clearTimeout(takeHandTimer);
    }
  }, [loading, feedback, handState, handOwner, attempts.opponent, error, currentIndex, questions, showAnswer]);

  // Simulate opponent answering when opponent has the hand active
  useEffect(() => {
    if (handState === 'opponent_responding' && !feedback && !error && questions[currentIndex] && !showAnswer) {
      const typingDelay = 2500 + Math.random() * 1500;
      const answerTimer = setTimeout(() => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;

        // Opponent performance depends on current clue
        const accuracyByClue = [0.4, 0.6, 0.75, 0.9];
        const isCorrect = Math.random() < (accuracyByClue[currentClueIndex] || 0.7);

        if (isCorrect) {
          playSound('fail'); // Bad for the human player
          setFeedback('system_correct');
          const finalOpponentPoints = systemScore + pointPotential;
          setSystemScore(finalOpponentPoints);
          
          if (finalOpponentPoints >= 15) {
            checkGameOver(score, finalOpponentPoints);
          } else {
            moveToNextQuestion(false);
          }
        } else {
          playSound('success'); // Good for the player, opponent failed
          const nextAttempts = { ...attempts, opponent: true };
          setAttempts(nextAttempts);
          setFeedback('system_wrong');
          
          setTimeout(() => {
            setFeedback(null);
            handleHandTransfer('opponent', nextAttempts);
          }, 2500);
        }
      }, typingDelay);
      return () => clearTimeout(answerTimer);
    }
  }, [handState, feedback, error, currentIndex, questions, currentClueIndex, systemScore, score]);

  // Process user taking the hand manually
  const handlePlayerTakeHand = () => {
    if (handState !== 'asking' || handOwner !== 'human' || attempts.human || feedback || showAnswer) return;
    setHandState('active');
    setTimeLeftAnswer(15);
    playSound('gong');
  };

  // Submit hand answer
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !questions[currentIndex] || feedback) return;

    const currentQ = questions[currentIndex];
    const normalizedUser = userInput.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const normalizedAnswer = currentQ.answer.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    // Dynamic verification helper
    const isCorrect = normalizedUser === normalizedAnswer || (normalizedAnswer.includes(normalizedUser) && normalizedUser.length > 3);

    if (isCorrect) {
      playSound('success');
      setFeedback('correct');
      const finalHumanPoints = score + pointPotential;
      setScore(finalHumanPoints);
      
      if (finalHumanPoints >= 15) {
        checkGameOver(finalHumanPoints, systemScore);
      } else {
        moveToNextQuestion(false);
      }
    } else {
      playSound('fail');
      const nextAttempts = { ...attempts, human: true };
      setAttempts(nextAttempts);
      setFeedback('wrong');

      setTimeout(() => {
        setFeedback(null);
        handleHandTransfer('human', nextAttempts);
      }, 2500);
    }
  };

  // Verify game over scores
  const checkGameOver = (pScore: number, sScore: number) => {
    if (pScore >= 15 || sScore >= 15) {
      setTimeout(() => onComplete(pScore), 3000);
    }
  };

  // Advanced index progression
  const moveToNextQuestion = (withDoubleFailDelay: boolean) => {
    const nextQuestionDelay = withDoubleFailDelay ? 4500 : 2500;
    
    setTimeout(() => {
      setFeedback(null);
      setHandState('asking');
      setUserInput('');
      setShowAnswer(false);
      setAttempts({ human: false, opponent: false });
      setTimeLeftAnswer(15);

      // Alternate the default next starting owner
      const nextIdx = currentIndex + 1;
      const nextOwner = (nextIdx % 2 === 0) ? 'human' : 'opponent';
      setHandOwner(nextOwner);

      if (nextIdx < questions.length) {
        setCurrentIndex(nextIdx);
        setCurrentClueIndex(0);
      } else {
        // Recycle or fetch new questions
        fetchQuestions().then(() => {
          setCurrentIndex(0);
          setCurrentClueIndex(0);
        });
      }
    }, nextQuestionDelay);
  };

  if (loading) return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-accent/20 blur-xl animate-pulse rounded-full" />
        <Loader2 className="w-16 h-16 text-amber-accent animate-spin relative z-10" />
      </div>
      <p className="font-sans font-black italic text-white text-xl uppercase tracking-widest animate-pulse">Préparation du grand Face-à-Face...</p>
    </div>
  );

  if (error) return (
    <div className="text-center px-6 py-12">
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 mb-6 max-w-sm mx-auto">
        <p className="text-red-400 font-sans italic text-sm leading-relaxed">
          Une perturbation dans la connexion céleste s'est produite.
        </p>
      </div>
      <button 
        onClick={fetchQuestions} 
        className="px-10 py-4 bg-amber-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg hover:bg-amber-500 transition-all active:scale-95"
      >
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="z-10 w-full px-2 flex flex-col items-center max-w-3xl">
      {wasOfflineUsed && (
        <div className="w-full max-w-xl mx-auto mb-4 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-center gap-2 text-xs text-amber-accent font-black uppercase tracking-wider animate-pulse">
          <WifiOff className="w-4 h-4 text-amber-accent" /> mode hors-ligne actif (Données locales)
        </div>
      )}
      {/* Competitors Header */}
      <div className="w-full grid grid-cols-3 items-center justify-between mb-8 px-4 gap-4">
        {/* Player Score */}
        <div className="flex flex-col items-center text-amber-accent">
           <span className="text-[9px] uppercase font-black tracking-[0.2em] mb-1 opacity-70 truncate max-w-[120px]">{playerName || "CHAMPION"}</span>
           <div className="text-5xl font-sans font-black leading-none italic">{score}</div>
           <div className="w-full h-2.5 bg-slate-900 rounded-full mt-3 overflow-hidden border border-white/10 p-0.5 relative">
              <motion.div 
                className="h-full bg-amber-accent rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((score / 15) * 100, 100)}%` }}
              />
           </div>
           <span className="text-[7px] text-slate-400 font-mono font-medium mt-1 uppercase">Objectif : 15 pts</span>
        </div>

        <div className="text-center flex flex-col justify-center items-center">
          <div className="text-white/25 font-black italic text-xl tracking-tight skew-x-[-15deg] leading-none">CHOC FINAL</div>
          <div className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[7px] text-amber-accent uppercase font-black mt-1.5 tracking-widest">FACE-À-FACE</div>
        </div>

        {/* System Score */}
        <div className="flex flex-col items-center" style={{ color: dispOpponentColor }}>
           <span className="text-[9px] uppercase font-black tracking-[0.2em] mb-1 opacity-70 truncate max-w-[120px]">{showOpponent}</span>
           <div className="text-5xl font-sans font-black leading-none italic">{systemScore}</div>
           <div className="w-full h-2.5 bg-slate-900 rounded-full mt-3 overflow-hidden border border-white/10 p-0.5 relative">
              <motion.div 
                className="h-full rounded-full"
                style={{ backgroundColor: dispOpponentColor, boxShadow: `0 0 10px ${dispOpponentColor}80` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((systemScore / 15) * 100, 100)}%` }}
              />
           </div>
           <span className="text-[7px] text-slate-400 font-mono font-medium mt-1 uppercase">Objectif : 15 pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 w-full">
        {/* Clues Reveal Board */}
        <div className="space-y-4">
          <h4 className="text-electric-blue font-black uppercase text-[8px] tracking-[0.5em] flex items-center gap-3">
             INDICES EN COURS
             <div className="h-px flex-1 bg-white/10"></div>
          </h4>
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {currentQ?.clues?.slice(0, currentClueIndex + 1).map((clue, idx) => {
                const isActive = idx === currentClueIndex;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-4 glass-panel text-sm font-sans font-black italic transition-all duration-300 metal-border relative overflow-hidden uppercase tracking-tight",
                      isActive 
                        ? "border-amber-accent/40 bg-slate-900 text-white shadow-[0_0_15px_rgba(245,158,11,0.05)]" 
                        : "opacity-30 text-slate-400 border-white/5 bg-slate-950/20"
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-accent amber-glow" />
                    )}
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "w-6 h-6 rounded bg-slate-800/80 flex items-center justify-center font-black text-[10px] flex-shrink-0 border border-white/10",
                        isActive ? "text-amber-accent border-amber-accent/30" : "text-slate-500"
                      )}>
                        {4 - idx}
                      </span>
                      <p className="leading-tight text-white/95 text-xs md:text-sm">"{clue}"</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Turn interactive center */}
        <div className="flex flex-col items-center gap-6 justify-center w-full">
          {/* Points indicator and Status Display */}
          <div className="glass-panel p-5 w-full bg-slate-900 border-white/10 relative overflow-hidden metal-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h5 className="text-amber-accent uppercase text-[8px] font-black tracking-[0.3em] mb-1">PROMPT DE LA RÉGIE</h5>
              <div className="text-white text-base font-black uppercase tracking-tight leading-snug">
                {handOwner === 'human' && handState === 'asking' && "C'est à vous de prendre la main !"}
                {handOwner === 'opponent' && handState === 'asking' && `C'est au tour de ${showOpponent} de prendre la main...`}
                {handState === 'active' && `Vous avez la main ! Donnez votre réponse...`}
                {handState === 'opponent_responding' && `${showOpponent} a la main et compose sa réponse...`}
                {showAnswer && `Fin du tour !`}
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 py-2.5 px-6 rounded-lg text-center shrink-0 min-w-[120px]">
              <span className="text-[7px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none mb-1">VALEUR</span>
              <span className="text-3xl font-sans font-black text-amber-accent italic leading-none">{pointPotential} <span className="text-xs uppercase not-italic text-slate-300 ml-0.5">pts</span></span>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-electric-blue/5 blur-3xl rounded-full pointer-events-none" />
          </div>

          {/* Core dynamic interaction area */}
          <div className="relative w-full flex justify-center py-4 bg-slate-950/20 rounded-2xl border border-white/5 p-6">
            
            {/* 1. ASKING COMPONENT (Waiting for someone to take the hand) */}
            {handState === 'asking' && !feedback && !showAnswer && (
              <div className="flex flex-col items-center gap-4 text-center">
                {handOwner === 'human' ? (
                  <>
                    <p className="text-slate-400 text-xs font-medium max-w-sm mb-1 leading-relaxed">
                      Cliquez ci-dessous pour geler les indices à <span className="text-amber-accent font-bold">{pointPotential} points</span> et saisir votre réponse chrétienne !
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePlayerTakeHand}
                      className="w-56 h-14 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-sm tracking-widest rounded-xl shadow-[0_4px_30px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_40px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 metal-border font-sans"
                    >
                      <Zap className="w-5 h-5 text-black" />
                      <span>PRENDRE LA MAIN</span>
                    </motion.button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                    <span className="text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">
                      {showOpponent.toUpperCase()} PRÉPARE SON INTERVENTION...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 2. ACTIVE HUMAN PLAYER INPUT WRAPPER */}
            {handState === 'active' && !feedback && !showAnswer && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md space-y-4 flex flex-col items-center"
              >
                {/* Visual ticking timer countdown */}
                <div className="w-full flex items-center justify-between px-2 text-xs">
                  <span className="text-red-400 uppercase font-black tracking-wider flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-4 h-4" />
                    SAISIE SOUS PRESSION
                  </span>
                  <span className="font-mono font-black text-white text-sm bg-slate-900 border border-white/10 px-2 py-0.5 rounded">
                    {timeLeftAnswer}s
                  </span>
                </div>
                
                {/* Horizontal countdown shrinking bar */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500" 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeftAnswer / 15) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>

                <form onSubmit={handleAnswerSubmit} className="w-full space-y-3">
                   <input
                     autoFocus
                     type="text"
                     value={userInput}
                     onChange={(e) => setUserInput(e.target.value)}
                     placeholder="VOTRE RÉPONSE INITIALE..."
                     className="w-full bg-black/60 border-2 border-amber-accent/50 focus:border-amber-accent p-4 rounded-xl text-xl text-center focus:ring-8 ring-amber-accent/5 outline-none text-white font-sans font-black italic uppercase metal-border transition-all"
                   />
                   <p className="text-center text-slate-400 uppercase text-[9px] tracking-[0.3em] font-black animate-pulse">VALIDER AVEC LA TOUCHE ENTRÉE !</p>
                </form>
              </motion.div>
            )}

            {/* 3. OPPONENT RESPONDING STATUS */}
            {handState === 'opponent_responding' && !feedback && !showAnswer && (
              <div className="flex flex-col items-center gap-4 py-3">
                <div className="w-full flex items-center gap-2 px-2 text-xs text-slate-400 justify-center mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>TEMPS POUR COMPOSER : <span className="font-mono font-bold text-white bg-slate-900/50 px-1.5 py-0.5 rounded border border-white/5">{timeLeftAnswer}s</span></span>
                </div>
                
                <div className="p-4 bg-slate-900 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                  <span className="text-xs text-slate-200 uppercase font-black tracking-widest">
                     « {showOpponent} a pris la main ! Elle analyse les indices... »
                  </span>
                </div>
              </div>
            )}

            {/* 4. TIE / NO FEEDBACK DOUBLE FAILED OVERVIEW */}
            {showAnswer && !feedback && (
              <div className="text-center space-y-2 py-4">
                <ShieldAlert className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
                <h4 className="font-sans font-black text-sm uppercase text-red-400 tracking-wider">DOUBLE PASS / ÉCHEC IMMÉDIAT !</h4>
                <p className="text-xs text-slate-300">
                  Aucun des finalistes n'a réussi à donner la bonne réponse.
                </p>
                <div className="pt-2">
                  <span className="text-xs text-slate-500 font-extrabold uppercase block mb-1">LA RÉPONSE ÉTAIT</span>
                  <span className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-lg font-sans font-black uppercase text-amber-accent italic">{currentQ?.answer}</span>
                </div>
              </div>
            )}
            
          </div>

          {/* Feedbacks overlays */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className={cn(
                  "flex flex-col gap-2.5 p-5 rounded-2xl font-serif text-center shadow-2xl w-full max-w-md border",
                  (feedback === 'correct' || feedback === 'system_wrong') 
                    ? "bg-green-500/10 text-green-400 border-green-500/30" 
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                )}
              >
                <div className="flex items-center justify-center gap-3 text-sm md:text-base">
                  {(feedback === 'correct' || feedback === 'system_wrong') 
                    ? <CheckCircle2 className="w-5.5 h-5.5 text-green-400 flex-shrink-0" /> 
                    : <XCircle className="w-5.5 h-5.5 text-red-400 flex-shrink-0" />}
                  <span className="font-sans font-black tracking-tight uppercase italic leading-tight text-xs md:text-sm">
                    {feedback === 'correct' && `Correct ! Vous marquez +${pointPotential} pts.`}
                    {feedback === 'wrong' && (
                      attempts.opponent 
                        ? `Mauvaise réponse... La réponse était : ${currentQ?.answer}`
                        : `Mauvaise réponse... La main passe à ${showOpponent} !`
                    )}
                    {feedback === 'system_correct' && `${showOpponent} a trouvé ! (${currentQ?.answer}) +${pointPotential} pts.`}
                    {feedback === 'system_wrong' && (
                      attempts.human 
                        ? `${showOpponent} s'est trompée ! La réponse était : ${currentQ?.answer}`
                        : `${showOpponent} s'est trompée ! La main vous est confiée !`
                    )}
                  </span>
                </div>
                
                {/* Explanations block */}
                {(feedback === 'wrong' || feedback === 'system_correct' || feedback === 'correct' || (feedback === 'system_wrong' && attempts.human)) && currentQ?.explanation && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[11px] text-white/70 italic px-2 mt-1 leading-normal font-sans"
                  >
                    {currentQ.explanation}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
