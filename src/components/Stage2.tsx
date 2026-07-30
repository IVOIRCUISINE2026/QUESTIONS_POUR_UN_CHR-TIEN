import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Loader2, BookOpen, Check, X, SkipForward, ArrowRight, Sparkles, HelpCircle, User, Award, Trophy, WifiOff } from 'lucide-react';
import { Question } from '../types';
import { useAudio } from './AudioEngine';
import { cn, getAskedQuestions, addAskedQuestion } from '../lib/utils';
import { OFFLINE_STAGE2 } from '../lib/offlineQuestions';

const THEME_OPTIONS = [
  "Les miracles de Jésus",
  "Les rois d'Israël",
  "Les voyages de Paul",
  "Les femmes de la Bible",
  "Les paraboles",
  "Le Pentateuque",
  "Les prophètes majeurs",
  "La Genèse",
  "Les Actes des Apôtres",
  "Les Psaumes et Proverbes",
  "L'Exode et le Désert",
  "Les Juges d'Israël",
  "Villes et cités bibliques",
  "Les commandements et la Loi",
  "L'Apocalypse et la fin des temps",
  "La royauté de Salomon",
  "L'Épître aux Romains",
  "Élie et Élisée, prophètes de feu",
  "La vie de David, de berger à roi",
  "L'Arche d'Alliance",
  "Le temple de Jérusalem",
  "Les disciples et les apôtres",
  "Noé et le Déluge",
  "Le sermon sur la montagne",
  "Abraham et l'alliance divine",
  "Moïse et le Pharaon",
  "Joseph et ses frères en Égypte",
  "Les lettres aux sept Églises",
  "Les songes et les visions bibliques",
  "La reconstruction de Jérusalem",
  "Guerres et batailles célèbres",
  "Prêtres et sacrifices de la Loi",
  "Jean-Baptiste, le précurseur",
  "Le ministère d'Isaïe",
  "Daniel à Babylone",
  "Ruth et Esther, héroïnes de foi",
  "Josué et la conquête de Canaan",
  "Passion et Résurrection du Christ",
  "Les anges et messagers célestes",
  "La Création du monde",
  "Les alliances de l'Ancien Testament",
  "Le tabernacle dans le désert",
  "Samson et les Philistins",
  "Le prophète Jonas et Ninive"
];

interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  isHuman: boolean;
  chosenTheme: string | null;
  maxStreak: number;
}

interface ThemeCardState {
  name: string;
  isMystery: boolean;
  chosenBy: string | null; // Participant name or null
  revealedName?: string; // If mystery theme was chosen, the actual theme name behind it
}

export default function Stage2({ playerName, onComplete, offlineMode }: { playerName?: string; onComplete: (points: number) => void; offlineMode?: boolean }) {
  const { playSound, speak } = useAudio();
  const [wasOfflineUsed, setWasOfflineUsed] = useState(false);

  // Option to hide additional times (config & +30s button)
  const [hideAdditionalTime, setHideAdditionalTime] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hide_additional_time_stage2') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hide_additional_time_stage2', hideAdditionalTime ? 'true' : 'false');
    } catch (e) {
      console.warn(e);
    }
    if (hideAdditionalTime) {
      setGameDuration(60);
      setTimeLeft(60);
    }
  }, [hideAdditionalTime]);

  // 1. Core Selection Phase States (Lazily initialized so that they never revert or flash on mount)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem('alliance_quiz_stage1_qualifiers');
      if (saved) {
        const parsed = JSON.parse(saved) as Participant[];
        if (parsed && parsed.length === 4) {
          // Deduplicate IDs immediately to prevent duplicate key errors
          const seenIds = new Set<string>();
          const uniqueParsed = parsed.map((p, idx) => {
            let baseId = p.id || `p-${idx}`;
            if (seenIds.has(baseId)) {
              baseId = `${baseId}-dup-${idx}`;
            }
            seenIds.add(baseId);
            return { ...p, id: baseId };
          });

          let aiIdx = 0;
          return uniqueParsed.map((p) => {
            if (p.isHuman) {
              return { ...p, name: playerName || p.name, maxStreak: 0, chosenTheme: null };
            } else {
              // Distribute simulated streaks among the 3 virtual players:
              // The first AI in the qualified order gets 4, the second gets 3, the third gets 2.
              let assignedStreak = 2;
              if (aiIdx === 0) assignedStreak = 4;
              else if (aiIdx === 1) assignedStreak = 3;
              else assignedStreak = 2;
              aiIdx++;

              return {
                ...p,
                maxStreak: assignedStreak,
                chosenTheme: null
              };
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to read Stage 1 qualifiers from localStorage, falling back to defaults:", e);
    }

    return [
      { id: 'ai-0', name: 'Sophie', avatarColor: '#ec4899', isHuman: false, chosenTheme: null, maxStreak: 3 },
      { id: 'ai-1', name: 'Jean', avatarColor: '#3b82f6', isHuman: false, chosenTheme: null, maxStreak: 2 },
      { id: 'human', name: playerName || 'Moi', avatarColor: '#f1c40f', isHuman: true, chosenTheme: null, maxStreak: 0 },
      { id: 'ai-5', name: 'Julie', avatarColor: '#14b8a6', isHuman: false, chosenTheme: null, maxStreak: 4 },
    ];
  });

  const [selectableThemes, setSelectableThemes] = useState<ThemeCardState[]>(() => {
    const shuffled = [...THEME_OPTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const pickedThemes = shuffled.slice(0, 4);
    return [
      ...pickedThemes.map(theme => ({
        name: theme,
        isMystery: false,
        chosenBy: null
      })),
      {
        name: "Thème Mystère ❓",
        isMystery: true,
        chosenBy: null
      }
    ];
  });

  const [selectionStep, setSelectionStep] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('alliance_quiz_stage1_qualifiers');
      if (saved) {
        const parsed = JSON.parse(saved) as Participant[];
        if (parsed && parsed.length > 0) {
          const first = parsed[0];
          const name = first.isHuman && playerName ? playerName : first.name;
          return `${name}, premier qualifié des 9 à la suite, s'apprête à choisir en premier.`;
        }
      }
    } catch {}
    return "Sophie, première qualifiée des 9 à la suite, s'apprête à choisir en premier.";
  });
  const [isAiChoosing, setIsAiChoosing] = useState<boolean>(false);

  // 2. Gameplay Phase States
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreakAchieved, setMaxStreakAchieved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameDuration, setGameDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [finalStreak, setFinalStreak] = useState<number>(0);

  // 3. Jeu Ultime (Tie-Breaker) States
  const [tieBreakerActive, setTieBreakerActive] = useState<boolean>(false);
  const [tieBreakerOpponent, setTieBreakerOpponent] = useState<Participant | null>(null);
  const [tieBreakerScores, setTieBreakerScores] = useState<{ human: number; ai: number }>({ human: 0, ai: 0 });
  const [tieBreakerTurn, setTieBreakerTurn] = useState<'human' | 'ai'>('human');
  const [tieBreakerStep, setTieBreakerStep] = useState<'intro' | 'play' | 'ai_thinking' | 'ended'>('intro');
  const [tieBreakerQuestions, setTieBreakerQuestions] = useState<Question[]>([]);
  const [tieBreakerQIndex, setTieBreakerQIndex] = useState<number>(0);
  const [tieBreakerInput, setTieBreakerInput] = useState<string>('');
  const [tieBreakerFeedback, setTieBreakerFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [tieBreakerStatus, setTieBreakerStatus] = useState<string>('');
  const [tieBreakerLoading, setTieBreakerLoading] = useState<boolean>(false);

  // Keep refs of selectable themes and participants so async callbacks can read freshest values stably
  const selectableThemesRef = useRef<ThemeCardState[]>(selectableThemes);
  selectableThemesRef.current = selectableThemes;

  const participantsRef = useRef<Participant[]>(participants);
  participantsRef.current = participants;

  const handleStageFinished = (achieved: number) => {
    setFinalStreak(achieved);
    setShowResults(true);
    if (achieved === 4) {
      playSound('success');
      const actualOpponent = participantsRef.current.find(p => !p.isHuman && p.maxStreak === 4) 
                          || participantsRef.current.find(p => !p.isHuman) 
                          || { name: 'Julie', avatarColor: '#14b8a6' };
      localStorage.setItem('alliance_quiz_opponent_name', actualOpponent.name);
      localStorage.setItem('alliance_quiz_opponent_color', actualOpponent.avatarColor);
    } else {
      playSound('fail');
    }
  };

  // Sync human player name changes safely without restarting the theme logic
  useEffect(() => {
    if (playerName) {
      setParticipants(prev => prev.map(p => p.isHuman ? { ...p, name: playerName } : p));
    }
  }, [playerName]);

  // Evaluation variables to detect if the human is tied at the gates of the final
  const playerScores = participants.map(p => ({
    ...p,
    score: p.isHuman ? finalStreak : p.maxStreak
  }));

  const playersWith4 = playerScores.filter(p => p.score === 4);
  const hasPlayerQualifiedDirectly = finalStreak === 4;

  const playersWithUnder4 = playerScores.filter(p => p.score < 4);
  const maxScoreUnder4 = playersWithUnder4.length > 0 ? Math.max(...playersWithUnder4.map(p => p.score)) : 0;
  const tiedPlayers = playersWithUnder4.filter(p => p.score === maxScoreUnder4);

  const isTieActive = playersWith4.length === 1 && tiedPlayers.length >= 2 && !hasPlayerQualifiedDirectly;
  const isHumanTied = isTieActive && tiedPlayers.some(p => p.isHuman);
  const matchedOpponent = isHumanTied ? (tiedPlayers.find(p => !p.isHuman) || participants[0]) : null;

  // Start the Tie-breaker (Jeu Ultime) with General questions
  const startTieBreaker = async () => {
    if (!matchedOpponent) return;
    setTieBreakerOpponent(matchedOpponent);
    setTieBreakerActive(true);
    setTieBreakerStep('intro');
    setTieBreakerScores({ human: 0, ai: 0 });
    setTieBreakerTurn('human');
    setTieBreakerQIndex(0);
    setTieBreakerInput('');
    setTieBreakerFeedback(null);
    setTieBreakerLoading(true);
    setTieBreakerStatus("Chargement des questions du face-à-face...");

    if (offlineMode) {
      setWasOfflineUsed(true);
      setTieBreakerQuestions([
        { id: "tb-1", question: "Dans quel livre de la Bible trouve-t-on l'histoire de la tour de Babel ?", answer: "Genèse" },
        { id: "tb-2", question: "Quel est le nom du premier roi d'Israël ?", answer: "Saül" },
        { id: "tb-3", question: "Combien de jours et de nuits a duré le déluge de Noé ?", answer: "40 jours" },
        { id: "tb-4", question: "Qui a écrit la majorité des épîtres du Nouveau Testament ?", answer: "Paul" },
        { id: "tb-5", question: "Quelle mer Moïse a-t-il séparée sous l'ordre de Dieu ?", answer: "Mer Rouge" },
        { id: "tb-6", question: "Quel est le dernier livre de la Bible ?", answer: "Apocalypse" },
        { id: "tb-7", question: "Dans quelle ville Jésus est-il né ?", answer: "Bethléem" },
        { id: "tb-8", question: "Qui a été jeté dans la fosse aux lions ?", answer: "Daniel" },
        { id: "tb-9", question: "Quel fils d'Abraham a failli être sacrifié sur le mont Morija ?", answer: "Isaac" },
        { id: "tb-10", question: "Quelle femme a trahi Samson en lui coupant les cheveux ?", answer: "Dalila" },
        { id: "tb-11", question: "Combien de commandements de Dieu ont été remis à Moïse ?", answer: "10" },
        { id: "tb-12", question: "Quel apôtre a renié Jésus trois fois avant le chant du coq ?", answer: "Pierre" }
      ]);
      setTieBreakerLoading(false);
      setTieBreakerStatus("Prêt pour le jeu ultime !");
      return;
    }

    try {
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage: 2, 
          theme: 'général',
          exclude: getAskedQuestions()
        })
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTieBreakerQuestions(data);
      } else {
        throw new Error("Questions empty");
      }
    } catch (e) {
      console.warn("Using backup tie-breaker questions:", e);
      setTieBreakerQuestions([
        { id: "tb-1", question: "Dans quel livre de la Bible trouve-t-on l'histoire de la tour de Babel ?", answer: "Genèse" },
        { id: "tb-2", question: "Quel est le nom du premier roi d'Israël ?", answer: "Saül" },
        { id: "tb-3", question: "Combien de jours et de nuits a duré le déluge de Noé ?", answer: "40" },
        { id: "tb-4", question: "Qui a écrit la majorité des épîtres du Nouveau Testament ?", answer: "Paul" },
        { id: "tb-5", question: "Quelle mer Moïse a-t-il séparée sous l'ordre de Dieu ?", answer: "Mer Rouge" },
        { id: "tb-6", question: "Quel est le dernier livre de la Bible ?", answer: "Apocalypse" },
        { id: "tb-7", question: "Dans quelle ville Jésus est-il né ?", answer: "Bethléem" },
        { id: "tb-8", question: "Qui a été jeté dans la fosse aux lions ?", answer: "Daniel" },
        { id: "tb-9", question: "Quel fils d'Abraham a failli être sacrifié sur le mont Morija ?", answer: "Isaac" },
        { id: "tb-10", question: "Quelle femme a trahi Samson en lui coupant les cheveux ?", answer: "Dalila" },
        { id: "tb-11", question: "Combien de commandements de Dieu ont été remis à Moïse ?", answer: "10" },
        { id: "tb-12", question: "Quel apôtre a renié Jésus trois fois avant le chant du coq ?", answer: "Pierre" }
      ]);
    } finally {
      setTieBreakerLoading(false);
      setTieBreakerStatus("Prêt pour le jeu ultime !");
    }
  };

  const handleTieBreakerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tieBreakerFeedback || tieBreakerStep !== 'play' || tieBreakerTurn !== 'human') return;

    const currentQ = tieBreakerQuestions[tieBreakerQIndex];
    if (!currentQ) return;

    const normUser = tieBreakerInput.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normAns = currentQ.answer.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const isCorrect = normUser === normAns || (normAns.includes(normUser) && normUser.length > 2);

    if (isCorrect) {
      playSound('success');
      setTieBreakerFeedback('correct');
      const newScores = { ...tieBreakerScores, human: tieBreakerScores.human + 1 };
      setTieBreakerScores(newScores);
      setTieBreakerStatus("Correct ! Vous marquez 1 point !");

      if (newScores.human >= 2) {
        localStorage.setItem('alliance_quiz_opponent_name', tieBreakerOpponent?.name || 'Julie');
        localStorage.setItem('alliance_quiz_opponent_color', tieBreakerOpponent?.avatarColor || '#14b8a6');
        setTimeout(() => {
          setTieBreakerStep('ended');
          playSound('success');
          speak(`Victoire en Jeu Ultime ! Vous vous qualifiez pour la finale !`);
        }, 1500);
        return;
      }
    } else {
      playSound('fail');
      setTieBreakerFeedback('wrong');
      setTieBreakerStatus(`Hélas... C'était : ${currentQ.answer}`);
    }

    setTimeout(() => {
      setTieBreakerFeedback(null);
      setTieBreakerInput('');
      setTieBreakerTurn('ai');
      setTieBreakerStep('ai_thinking');
      setTieBreakerQIndex(prev => prev + 1);
    }, 2000);
  };

  // Turn-based AI simulator for the tiebreaker
  useEffect(() => {
    if (tieBreakerActive && tieBreakerStep === 'ai_thinking' && tieBreakerTurn === 'ai') {
      const opposingName = tieBreakerOpponent?.name || "Sophie";
      setTieBreakerStatus(`${opposingName} réfléchit intensément à sa question...`);
      const speakQ = tieBreakerQuestions[tieBreakerQIndex];
      if (speakQ) {
        speak(speakQ.question);
      }

      const timer = setTimeout(() => {
        const currentQ = tieBreakerQuestions[tieBreakerQIndex];
        if (!currentQ) {
          setTieBreakerTurn('human');
          setTieBreakerStep('play');
          return;
        }

        // 65% random success probability
        const isAiCorrect = Math.random() < 0.65;
        if (isAiCorrect) {
          playSound('success');
          setTieBreakerFeedback('correct');
          const newScores = { ...tieBreakerScores, ai: tieBreakerScores.ai + 1 };
          setTieBreakerScores(newScores);
          setTieBreakerStatus(`${opposingName} a répondu correctement : "${currentQ.answer}" ! (+1 point)`);

          if (newScores.ai >= 2) {
            setTimeout(() => {
              setTieBreakerStep('ended');
              playSound('fail');
              speak(`Défaite... ${opposingName} remporte le Jeu Ultime.`);
            }, 1800);
            return;
          }
        } else {
          playSound('fail');
          setTieBreakerFeedback('wrong');
          const wrongSuffs = ["Je sais pas trop", "Moïse ?", "David ?", "Je passe", "Jérusalem ?"];
          const guess = wrongSuffs[Math.floor(Math.random() * wrongSuffs.length)];
          setTieBreakerStatus(`${opposingName} s'est trompée ! Elle a répondu : "${guess}" (La réponse était : ${currentQ.answer})`);
        }

        setTimeout(() => {
          setTieBreakerFeedback(null);
          setTieBreakerTurn('human');
          setTieBreakerStep('play');
          setTieBreakerQIndex(prev => prev + 1);
        }, 2500);

      }, 3500);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tieBreakerActive, tieBreakerStep, tieBreakerTurn, tieBreakerQIndex]);

  // Handle speaking our questions during user turns
  useEffect(() => {
    if (tieBreakerActive && tieBreakerStep === 'play' && tieBreakerTurn === 'human') {
      const q = tieBreakerQuestions[tieBreakerQIndex];
      if (q && !tieBreakerFeedback) {
        speak(q.question);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tieBreakerActive, tieBreakerStep, tieBreakerTurn, tieBreakerQIndex]);

  // Clean up any remaining voice synthesis
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("speechSynthesis.cancel failed in Stage2 clean-up:", e);
        }
      }
    };
  }, []);

  // Turn-by-Turn AI choosing engine (Optimized to listen only to step changes, avoiding timer cancels)
  useEffect(() => {
    if (selectionStep >= 4 || isAiChoosing) return;

    const currentChooser = participantsRef.current[selectionStep];
    if (!currentChooser) return;

    if (!currentChooser.isHuman) {
      // It's an AI turn!
      setIsAiChoosing(true);
      setStatusText(`${currentChooser.name} examine la grille des thèmes pour faire son choix...`);

      const timer = setTimeout(() => {
        // Read fresh copy from refs to avoid closure staleness
        const currentThemes = [...selectableThemesRef.current];
        const currentParticipants = [...participantsRef.current];
        const insideChooser = currentParticipants[selectionStep];
        if (!insideChooser) return;

        // Find available themes
        const availableIdxs = currentThemes
          .map((card, idx) => (card.chosenBy === null ? idx : null))
          .filter((v): v is number => v !== null);

        if (availableIdxs.length > 0) {
          // Select a random available index
          const chosenIdx = availableIdxs[Math.floor(Math.random() * availableIdxs.length)];
          const selectedCard = currentThemes[chosenIdx];

          let assignedTheme = selectedCard.name;
          let revealText = '';

          if (selectedCard.isMystery) {
            // Find a completely unique theme that hasn't been displayed, nor chosen
            const displayedAndChosenNames = currentThemes.map(c => c.name);
            const remainingPool = THEME_OPTIONS.filter(t => !displayedAndChosenNames.includes(t));
            const randomMystery = remainingPool[Math.floor(Math.random() * remainingPool.length)] || THEME_OPTIONS[0];
            
            assignedTheme = randomMystery;
            currentThemes[chosenIdx] = {
              ...selectedCard,
              chosenBy: insideChooser.name,
              revealedName: randomMystery
            };
            revealText = ` (Thème Mystère révélé : "${randomMystery}")`;
          } else {
            currentThemes[chosenIdx] = {
              ...selectedCard,
              chosenBy: insideChooser.name
            };
          }

          // Update theme cards and participant choices
          setSelectableThemes(currentThemes);
          setParticipants(prev => prev.map((p, pIdx) => {
            if (pIdx === selectionStep) {
              return { ...p, chosenTheme: assignedTheme };
            }
            return p;
          }));

          playSound('success');
          setStatusText(`${insideChooser.name} a choisi : "${assignedTheme}"${revealText} !`);

          // Go to next turn after 3 seconds of showing the choice
          setTimeout(() => {
            setIsAiChoosing(false);
            setSelectionStep(step => {
              const nextStep = step + 1;
              const nextChooser = currentParticipants[nextStep];
              if (nextChooser) {
                if (nextChooser.isHuman) {
                  setStatusText(`À votre tour ! Choisissez un thème parmi les cartes disponibles.`);
                } else {
                  setStatusText(`C'est au tour de ${nextChooser.name} de choisir son thème.`);
                }
              } else {
                setStatusText(`Tous les concurrents ont fait leur choix. C'est l'heure du grand test !`);
              }
              return nextStep;
            });
          }, 3000);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionStep]);

  // Handle human selecting their theme
  const handleHumanSelectTheme = (cardIdx: number) => {
    // Basic guards
    if (selectionStep >= participants.length) return;
    const currentChooser = participants[selectionStep];
    if (!currentChooser || !currentChooser.isHuman || isAiChoosing) return;

    const selectedCard = selectableThemes[cardIdx];
    if (selectedCard.chosenBy !== null) return; // Already chosen!

    let assignedTheme = selectedCard.name;
    let revealText = '';
    const updatedCards = [...selectableThemes];

    if (selectedCard.isMystery) {
      // Find a completely unique theme that hasn't been displayed, nor chosen
      const displayedAndChosenNames = selectableThemes.map(c => c.name);
      const remainingPool = THEME_OPTIONS.filter(t => !displayedAndChosenNames.includes(t));
      const randomMystery = remainingPool[Math.floor(Math.random() * remainingPool.length)] || THEME_OPTIONS[0];
      
      assignedTheme = randomMystery;
      updatedCards[cardIdx] = {
        ...selectedCard,
        chosenBy: currentChooser.name,
        revealedName: randomMystery
      };
      revealText = ` (Thème Mystère révélé : "${randomMystery}")`;
    } else {
      updatedCards[cardIdx] = {
        ...selectedCard,
        chosenBy: currentChooser.name
      };
    }

    setSelectableThemes(updatedCards);
    setParticipants(prev => prev.map((p, pIdx) => {
      if (pIdx === selectionStep) {
        return { ...p, chosenTheme: assignedTheme };
      }
      return p;
    }));

    playSound('success');
    setStatusText(`Vous avez choisi : "${assignedTheme}"${revealText} !`);

    // Advance turn to Julie
    setTimeout(() => {
      setSelectionStep(step => {
        const nextStep = step + 1;
        const nextChooser = participants[nextStep];
        if (nextChooser) {
          setStatusText(`C'est au tour de ${nextChooser.name} de choisir son thème.`);
        } else {
          setStatusText(`Tous les concurrents ont fait leur choix. C'est l'heure du grand test !`);
        }
        return nextStep;
      });
    }, 2800);
  };

  // 60s Ticking timer during the game phase
  useEffect(() => {
    if (selectedTheme && timeLeft > 0 && !loading && streak < 4 && !error) {
      const timer = setInterval(() => {
        setTimeLeft(v => v - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (selectedTheme && timeLeft === 0 && streak < 4 && !error) {
      // End game on timeout
      playSound('fail');
      handleStageFinished(maxStreakAchieved);
    }
  }, [selectedTheme, timeLeft, loading, streak, error, maxStreakAchieved]);

  // Fetch Questions for chosen theme (classic questions-engine)
  const selectTheme = async (theme: string) => {
    setSelectedTheme(theme);
    setLoading(true);
    setError(false);
    setTimeLeft(gameDuration);

    const loadOffline = () => {
      console.log(`Loading Stage 2 offline questions for theme "${theme}"...`);
      setWasOfflineUsed(true);
      
      let themeCatalog = OFFLINE_STAGE2[theme] || [];
      if (themeCatalog.length < 15) {
        // Backfill with questions from other categories to guarantee a rich pool
        const otherThemesQuestions = Object.keys(OFFLINE_STAGE2)
          .filter(k => k !== theme)
          .flatMap(k => OFFLINE_STAGE2[k]);
        const shuffledOthers = [...otherThemesQuestions].sort(() => Math.random() - 0.5);
        themeCatalog = [...themeCatalog, ...shuffledOthers.slice(0, 15 - themeCatalog.length)];
      }

      const shuffled = [...themeCatalog];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const selected: Question[] = shuffled.slice(0, 15).map((q, idx) => ({
        id: q.id || `off2-fallback-${idx}`,
        question: q.question,
        answer: q.answer
      }));
      setQuestions(selected);
      setLoading(false);
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
          stage: 2, 
          theme,
          exclude: getAskedQuestions()
        })
      });
      
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setLoading(false);
      } else {
        throw new Error('Invalid data');
      }
    } catch (err) {
      console.warn('Fetch error:', err);
      loadOffline();
    }
  };

  // Mark current question as asked
  useEffect(() => {
    const currentQuestion = questions[currentIndex];
    if (currentQuestion) {
      addAskedQuestion(currentQuestion.id, currentQuestion.question, currentQuestion.answer);
    }
  }, [currentIndex, questions]);

  const handleAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || feedback || !questions[currentIndex]) return;

    const currentQuestion = questions[currentIndex];
    const normalizedUser = userInput.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    const normalizedAnswer = currentQuestion.answer.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    const isCorrect = normalizedUser === normalizedAnswer || (normalizedAnswer.includes(normalizedUser) && normalizedUser.length > 2);

    if (isCorrect) {
      playSound('success');
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreakAchieved) {
        setMaxStreakAchieved(newStreak);
      }
      
      if (newStreak === 4) {
        // Instantly win stage (reaches 4 à la suite!)
        setTimeout(() => handleStageFinished(4), 1500);
        return;
      }
    } else {
      playSound('fail');
      setFeedback('wrong');
      // "4 à la suite" mechanic resets to 0 upon wrong answer!
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(v => v + 1);
      } else {
        // No more questions, return high score streak to continue
        handleStageFinished(maxStreakAchieved);
      }
    }, 1800);
  };

  const handlePass = () => {
    if (feedback || !questions[currentIndex]) return;
    
    playSound('fail');
    setFeedback('wrong');
    setStreak(0);
    setUserInput('JE PASSE');

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(v => v + 1);
      } else {
        handleStageFinished(maxStreakAchieved);
      }
    }, 1200);
  };

  // TTS read question
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ && selectedTheme && !loading && !feedback) {
      speak(currentQ.question);
    } else if (feedback && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("speechSynthesis.cancel failed in Stage2 feedback effect:", e);
      }
    }
  }, [currentIndex, selectedTheme, loading, questions, feedback]);

  const humanIndex = participants.findIndex(p => p.isHuman);

  // RENDER PHASE: Results Screen
  if (showResults) {
    if (tieBreakerActive) {
      const opposingName = tieBreakerOpponent?.name || "Sophie";
      const userCorrectSoFar = tieBreakerScores.human;
      const aiCorrectSoFar = tieBreakerScores.ai;
      const currentQ = tieBreakerQuestions[tieBreakerQIndex];

      return (
        <div className="z-10 w-full max-w-2xl bg-slate-900/90 p-8 rounded-2xl border border-white/10 shadow-2xl mt-4 flex flex-col items-center">
          <Trophy className="w-16 h-16 mb-4 text-amber-accent animate-pulse" />

          <h2 className="text-amber-accent text-[8px] uppercase tracking-[0.4em] font-black mb-1">⚡ SÉANCE DE SÉLECTION BILATÉRALE ⚡</h2>
          <h3 className="text-2xl md:text-3xl font-serif italic font-bold mb-4 text-white uppercase tracking-tight">
            Le Jeu Ultime
          </h3>

          <p className="text-xs text-slate-400 mb-6 text-center leading-relaxed">
            Égalité parfaite pour la seconde place qualificative ! Vous affrontez <strong className="text-white">{opposingName}</strong>. 
            Le premier joueur à cumuler <strong className="text-amber-accent">2 bonnes réponses</strong> l'emporte et accède au Choc Final.
          </p>

          {/* Versus Score Card */}
          <div className="grid grid-cols-3 gap-4 items-center w-full bg-slate-950/60 p-5 rounded-2xl border border-white/5 mb-8">
            {/* Player Info */}
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                ME
              </div>
              <span className="font-sans font-black text-xs uppercase tracking-wider text-amber-accent mt-2 block">Vous</span>
              <span className="font-mono text-2xl font-black italic mt-1 block text-white">{userCorrectSoFar} / 2</span>
            </div>

            {/* VS text with glowing ring */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-900 flex items-center justify-center text-[10px] font-black tracking-widest text-slate-400 italic">
                VS
              </div>
            </div>

            {/* AI Opponent Info */}
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-white text-base shadow-lg"
                style={{ backgroundColor: tieBreakerOpponent?.avatarColor + '20', borderColor: tieBreakerOpponent?.avatarColor }}
              >
                {opposingName[0]}
              </div>
              <span className="font-sans font-black text-xs uppercase tracking-wider text-slate-300 mt-2 block" style={{ color: tieBreakerOpponent?.avatarColor }}>{opposingName}</span>
              <span className="font-mono text-2xl font-black italic mt-1 block text-white">{aiCorrectSoFar} / 2</span>
            </div>
          </div>

          {tieBreakerLoading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-10 h-10 text-amber-accent animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{tieBreakerStatus}</span>
            </div>
          ) : tieBreakerStep === 'intro' ? (
            <div className="w-full text-center space-y-6">
              <div className="bg-slate-950/30 p-5 rounded-xl border border-white/5 space-y-2 text-left">
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-accent block">📜 PROTOCOLE DE FINALE</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. Chacun répond à tour de rôle à des questions directes sur la culture biblique.<br/>
                  2. Pas de chronomètre stressant : prenez le temps d'analyser vos questions !<br/>
                  3. Dès qu'un joueur valide <span className="text-amber-accent">2 bonnes réponses</span>, la partie s'achève et il se qualifie.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTieBreakerStep('play')}
                className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95 metal-border flex items-center justify-center gap-2"
              >
                Commencer le Jeu Ultime !
              </button>
            </div>
          ) : tieBreakerStep === 'ended' ? (
            userCorrectSoFar >= 2 ? (
              <div className="w-full text-center space-y-6">
                <div className="p-6 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-400 space-y-3 animate-bounce">
                  <span className="text-3xl block">🏆</span>
                  <h4 className="font-sans font-black text-xl italic uppercase tracking-tight">VICTOIRE SUPRÊME !</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Félicitations, vous avez triomphé de {opposingName} lors de cette manche ultime ! Votre place en finale pour le Choc Final est amplement méritée.
                  </p>
                </div>

                <button
                  onClick={() => onComplete(4)}
                  className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95 metal-border"
                >
                  Lancer le Choc Final !
                </button>
              </div>
            ) : (
              <div className="w-full text-center space-y-6">
                <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 space-y-3">
                  <span className="text-3xl block">💔</span>
                  <h4 className="font-sans font-black text-xl italic uppercase tracking-tight">ÉLIMINATION CRUELLE...</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {opposingName} a été plus rapide à donner ses 2 bonnes réponses. Elle se qualifie et rejoint Julie pour le Choc Final.
                  </p>
                </div>

                <button
                  onClick={() => onComplete(finalStreak)}
                  className="w-full py-4 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-red-500/10 transition-all active:scale-95 metal-border"
                >
                  Retour à l'accueil
                </button>
              </div>
            )
          ) : (
            // Play turn phase
            <div className="w-full space-y-6">
              {/* Turn Banner */}
              {tieBreakerTurn === 'human' ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center animate-pulse">
                  <span className="text-[10px] font-black tracking-widest text-amber-accent uppercase block mb-1">🔮 VOTRE TOUR DE JOUER</span>
                  <span className="text-xs text-slate-300 font-bold">Répondez correctement à la question ci-dessous pour avancer.</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 text-center" style={{ borderColor: tieBreakerOpponent?.avatarColor }}>
                  <span className="text-[10px] font-black tracking-widest uppercase block mb-1" style={{ color: tieBreakerOpponent?.avatarColor }}>🤖 TOUR DE {opposingName.toUpperCase()}</span>
                  <span className="text-xs text-slate-400 font-bold">La candidate adverse analyse la question biblique...</span>
                </div>
              )}

              {/* Question Screen */}
              <div className="min-h-[140px] w-full bg-slate-950/60 p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <BookOpen className="absolute -right-8 -bottom-8 w-24 h-24 text-white/5" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Question {tieBreakerQIndex + 1}</span>
                <p className="text-base text-white font-serif italic leading-relaxed max-w-md">{currentQ?.question}</p>
                
                {tieBreakerStatus && (
                  <div className="mt-4 px-3 py-1 bg-white/5 rounded-full text-[10px] text-amber-accent/90 font-black uppercase tracking-wider">
                    {tieBreakerStatus}
                  </div>
                )}
              </div>

              {/* Feedback Animation Overlay */}
              <AnimatePresence mode="wait">
                {tieBreakerFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-center items-center py-2 gap-2"
                  >
                    {tieBreakerFeedback === 'correct' ? (
                      <div className="px-4 py-2 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-xs font-sans font-black uppercase tracking-wide flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-green-400 animate-bounce" /> BONNE RÉPONSE !
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl text-xs font-sans font-black uppercase tracking-wide flex items-center gap-1.5">
                        <X className="w-4 h-4 text-red-400" /> INCORRECT
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Input controls */}
              {tieBreakerTurn === 'human' && !tieBreakerFeedback && (
                <form onSubmit={handleTieBreakerSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={tieBreakerInput}
                      onChange={(e) => setTieBreakerInput(e.target.value)}
                      placeholder="Saisissez la réponse..."
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl px-5 py-4 text-white text-sm outline-none text-center font-sans tracking-wide uppercase font-bold"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('fail');
                        setTieBreakerFeedback('wrong');
                        setTieBreakerStatus(`Vous avez passé. C'était : ${currentQ?.answer}`);
                        setTimeout(() => {
                          setTieBreakerFeedback(null);
                          setTieBreakerInput('');
                          setTieBreakerTurn('ai');
                          setTieBreakerStep('ai_thinking');
                          setTieBreakerQIndex(prev => prev + 1);
                        }, 2000);
                      }}
                      className="flex-1 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all"
                    >
                      Passer la main
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                    >
                      Valider ma réponse
                    </button>
                  </div>
                </form>
              )}

              {/* AI progress spinner control */}
              {tieBreakerTurn === 'ai' && !tieBreakerFeedback && (
                <div className="flex flex-col items-center justify-center py-6 gap-3 bg-slate-950/30 p-6 rounded-xl border border-white/5 animate-pulse">
                  <Loader2 className="w-7 h-7 text-amber-accent animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{opposingName} compose sa réponse...</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    const gotFour = finalStreak === 4;
    return (
      <div className="z-10 w-full max-w-2xl bg-slate-900/80 p-8 rounded-2xl border border-white/10 shadow-2xl mt-4 flex flex-col items-center">
        <Trophy className={cn("w-16 h-16 mb-4 animate-bounce", gotFour ? "text-amber-accent" : "text-slate-500")} />
        
        <h2 className="text-amber-accent text-[8px] uppercase tracking-[0.4em] font-black mb-1">MANCHE 2 : RÉSULTATS</h2>
        <h3 className="text-2xl md:text-3xl font-serif italic font-bold mb-6 text-white uppercase tracking-tight">
          Tableau du 4 à la suite
        </h3>

        <p className="text-xs text-slate-400 mb-6 text-center leading-relaxed">
          Seul les 2 vainqueurs ayant réalisé un score parfait de <strong className="text-amber-accent">4 à la suite</strong> se qualifient pour le Choc Final.
        </p>

        {/* List of participants with their score results */}
        <div className="w-full space-y-3 mb-8">
          {participants.map((p) => {
            const isMe = p.isHuman;
            const streakToDspl = isMe ? finalStreak : p.maxStreak;
            const hasQualified = streakToDspl === 4;

            return (
              <div
                key={p.id}
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between transition-all duration-300",
                  hasQualified
                    ? "border-green-500 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    : "border-slate-800 bg-slate-950/40 opacity-75"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: p.avatarColor }} />
                  <div className="text-left">
                    <span className="font-sans font-black text-sm uppercase tracking-tight text-white m-0">
                      {p.name} {isMe && "(Moi)"}
                    </span>
                    <span className="block text-[9px] text-slate-500 uppercase font-bold italic">
                      Thème: {p.chosenTheme}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 tracking-wider font-extrabold uppercase block leading-none mb-1">SÉRIE MAX</span>
                    <span className={cn(
                      "font-mono text-lg font-black italic block leading-none",
                      hasQualified ? "text-green-400" : "text-white"
                    )}>
                      {streakToDspl} / 4
                    </span>
                  </div>

                  <div className={cn(
                    "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider text-center min-w-[90px] text-xs",
                    hasQualified
                      ? "bg-green-500/10 text-green-400 border border-green-500/10"
                      : "bg-red-500/10 text-red-300 border border-red-500/10"
                  )}>
                    {hasQualified ? "QUALIFIÉ" : "ÉLIMINÉ"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win/Loss status panel and Next Button */}
        {gotFour ? (
          <div className="w-full text-center space-y-4">
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-green-400 text-xs font-sans font-black tracking-wide uppercase italic">
              ✨ FÉLICITATIONS ! Vous faites partie des 2 qualifiés pour le Choc Final aux côtés de {participants.find(p => !p.isHuman && p.maxStreak === 4)?.name || 'Julie'} ! ✨
            </div>
            <button
              onClick={() => onComplete(4)}
              className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95 metal-border"
            >
              Lancer le Choc Final (Face-à-Face)
            </button>
          </div>
        ) : isHumanTied ? (
          <div className="w-full text-center space-y-4">
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-accent text-xs font-sans font-black tracking-wide uppercase italic">
              🚨 TENSION EXTRÊME : ÉGALITÉ AUX PORTES DE LA FINALE ! 🚨
              <span className="block mt-1.5 text-[10px] text-slate-400 normal-case font-medium leading-relaxed">
                Vous et {matchedOpponent?.name} êtes ex-æquo avec {maxScoreUnder4} point{maxScoreUnder4 > 1 ? 's' : ''} chacun. 
                Un <strong>Jeu Ultime</strong> en 2 points gagnants va vous départager !
              </span>
            </div>
            <button
              onClick={startTieBreaker}
              className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95 metal-border flex items-center justify-center gap-2 animate-[pulse_1.5s_infinite]"
            >
              <Sparkles className="w-4 h-4 text-black animate-spin" /> Débuter le Jeu Ultime face à {matchedOpponent?.name?.toUpperCase()}
            </button>
          </div>
        ) : (
          <div className="w-full text-center space-y-4">
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 text-xs font-sans font-black tracking-wide uppercase italic">
              😞 ÉLIMINATION ! Vous n'avez pas obtenu un '4 à la suite'. {
                (() => {
                  const qualifiedAIs = playerScores.filter(p => !p.isHuman && p.score === 4).map(p => p.name);
                  if (qualifiedAIs.length > 0) {
                    return qualifiedAIs.length === 1 
                      ? `${qualifiedAIs[0]} se qualifie.` 
                      : `${qualifiedAIs.join(' et ')} se qualifient.`;
                  }
                  return "Les autres concurrents se qualifient.";
                })()
              } 😞
            </div>
            <button
              onClick={() => onComplete(finalStreak)}
              className="w-full py-4 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-red-500/10 transition-all active:scale-95 metal-border"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    );
  }

  // RENDER PHASE 1: Theme Selection Screen
  if (!selectedTheme) {
    const humanChooser = participants.find(p => p.isHuman);
    const userThemePicked = humanChooser?.chosenTheme || null;

    return (
      <div className="z-10 w-full max-w-4xl text-center px-4 py-4 flex flex-col items-center">
        {wasOfflineUsed && (
          <div className="w-full max-w-xl mx-auto mb-4 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-center gap-2 text-xs text-amber-accent font-black uppercase tracking-wider animate-pulse">
            <WifiOff className="w-4 h-4 text-amber-accent" /> mode hors-ligne actif (Données locales)
          </div>
        )}
        <h2 className="text-amber-accent text-[8px] uppercase tracking-[0.4em] font-black mb-1">MANCHE 2 : LE 4 À LA SUITE</h2>
        <h3 className="text-xl md:text-2xl font-serif italic font-bold mb-4 text-white uppercase tracking-tight">
          {selectionStep < 4 ? "La Grille des Thèmes" : "Lancement de la Manche"}
        </h3>

        {/* Option d'affichage pour masquer le chrono additionnel d'avance */}
        {selectionStep < 4 && (
          <div className="mb-4 bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2 flex items-center justify-between gap-4 max-w-md w-full">
            <div className="text-left">
              <span className="text-[9px] text-white font-black uppercase tracking-wider block">Option Temps Additionnel</span>
              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 block">Masquer le sélecteur de chrono et le bouton +30s</span>
            </div>
            <button
              type="button"
              onClick={() => setHideAdditionalTime(!hideAdditionalTime)}
              className={cn(
                "relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                hideAdditionalTime ? "bg-amber-500" : "bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  hideAdditionalTime ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        )}

        {/* Dashboard showing 4 participants and their active selections */}
        <div className="grid grid-cols-4 gap-2 w-full mb-4">
          {participants.map((player, idx) => {
            const isActive = selectionStep === idx;
            return (
              <div 
                key={player.id}
                className={cn(
                  "p-2 rounded-lg border transition-all duration-300 flex flex-col items-center text-center justify-center min-w-0 min-h-[50px]",
                  isActive 
                    ? "bg-amber-500/10 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)] scale-102"
                    : "bg-slate-950/40 border-slate-800"
                )}
              >
                <div className="flex items-center gap-1.5 justify-center w-full min-w-0">
                  <div 
                    className="w-2 h-2 rounded-full border border-white/10 shrink-0"
                    style={{ backgroundColor: player.avatarColor }}
                  />
                  <span className="font-sans font-black text-[9px] sm:text-[10px] uppercase tracking-tight text-white leading-none truncate block">
                    {player.name}
                  </span>
                </div>
                
                {isActive && (
                  <div className="flex items-center gap-1 text-[6px] text-amber-accent font-black tracking-wider uppercase mt-1">
                    <Loader2 className="w-2 h-2 animate-spin shrink-0" />
                    <span className="truncate">COURS...</span>
                  </div>
                )}

                {player.chosenTheme ? (
                  <div className="text-[7.5px] text-green-400 font-extrabold max-w-full truncate leading-none uppercase px-1 py-0.5 bg-green-950/25 rounded border border-green-500/10 mt-1">
                    {player.chosenTheme}
                  </div>
                ) : (
                  <span className="text-[7.5px] text-slate-500 italic uppercase mt-1 block">Pas choisi</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic status guide banner (only visible during active selection phase) */}
        {selectionStep < 4 && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-3 rounded-xl mb-4 flex items-center justify-center gap-3 text-slate-300 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-amber-accent shrink-0 select-none animate-pulse" />
            <span>{statusText}</span>
          </div>
        )}

        {/* Turn-by-Turn clickable Selection Board */}
        {selectionStep < 4 ? (
          <div>
            <p className="text-xs uppercase font-black tracking-wider text-slate-400 mb-4 text-center">
              {selectionStep === humanIndex ? "Cliquez sur une carte pour faire votre choix" : "Veuillez patienter pendant la sélection..."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
              {selectableThemes.map((theme, i) => {
                const isTaken = theme.chosenBy !== null;
                const isMyTurn = selectionStep === humanIndex && !isAiChoosing;
                const displayName = theme.isMystery && theme.chosenBy
                  ? `❓ ${theme.revealedName}`
                  : theme.name;

                return (
                  <motion.button
                    key={i}
                    disabled={isTaken || !isMyTurn}
                    onClick={() => handleHumanSelectTheme(i)}
                    whileHover={!isTaken && isMyTurn ? { scale: 1.04 } : {}}
                    whileTap={!isTaken && isMyTurn ? { scale: 0.96 } : {}}
                    className={cn(
                      "p-6 rounded-xl border flex flex-col justify-between items-center text-center transition-all duration-300 min-h-[140px] uppercase font-serif font-black relative overflow-hidden",
                      theme.isMystery 
                        ? isTaken 
                          ? "bg-slate-950/80 border-dashed border-slate-800"
                          : "bg-gradient-to-tr from-purple-900/40 to-indigo-950 border-purple-500/30 hover:border-purple-400 text-purple-200 cursor-help"
                        : isTaken 
                          ? "bg-slate-950/80 border-slate-900"
                          : isMyTurn 
                            ? "bg-slate-900/80 border-slate-700 hover:bg-studio-blue/30 hover:border-electric-blue/60 text-white cursor-pointer"
                            : "bg-slate-950/30 border-slate-900 text-slate-600"
                    )}
                  >
                    {/* Tiny glitter overlay on mystery theme */}
                    {theme.isMystery && !isTaken && (
                      <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_70%) animate-pulse rounded-full" />
                    )}

                    <span className="text-xs leading-snug tracking-tight">
                      {displayName}
                    </span>

                    {isTaken ? (
                      <div className="mt-4 flex flex-col items-center">
                        <span className="text-[8px] bg-red-950/40 text-red-400 px-2.5 py-0.5 rounded border border-red-500/15 font-black uppercase tracking-wider">
                          Pris par : {theme.chosenBy}
                        </span>
                      </div>
                    ) : (
                      isMyTurn && (
                        <div className="mt-4 text-[9px] text-amber-accent font-black tracking-widest flex items-center gap-1">
                          CHOISIR <ArrowRight className="w-3 h-3" />
                        </div>
                      )
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          // Selection phase complete: show ready screen
          <div className="w-full max-w-md bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-2xl mt-4 flex flex-col items-center">
            <h4 className="text-white font-serif font-bold text-xl uppercase tracking-tighter mb-2">Les jeux sont faits !</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Le thème que vous allez affronter est : <span className="text-white font-black italic block text-base mt-1 uppercase">"{userThemePicked}"</span>
            </p>

            {/* Choose Time Limit Selector */}
            {!hideAdditionalTime ? (
              <div className="w-full bg-slate-950/50 p-4 rounded-xl border border-white/5 mb-6 text-left">
                <span className="text-[9px] text-amber-accent font-black tracking-widest uppercase block mb-3">
                  ⏱️ CONFIGURATION DU CHRONOMÈTRE
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "60s (Standard)", value: 60, icon: "⏱️" },
                    { label: "90s (Avantage)", value: 90, icon: "⚡" },
                    { label: "120s (Sérénité)", value: 120, icon: "🧘" },
                    { label: "180s (Méditation)", value: 180, icon: "♾️" }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setGameDuration(opt.value);
                        setTimeLeft(opt.value);
                      }}
                      className={cn(
                        "p-2.5 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all",
                        gameDuration === opt.value
                          ? "bg-amber-500/20 border-amber-500 text-amber-accent shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      )}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-500 mt-2 text-center uppercase tracking-wide font-medium italic">
                  Choisissez le temps de réflexion qui vous convient pour réussir votre "4 à la suite".
                </p>
              </div>
            ) : (
              <div className="w-full mb-6 py-3 px-4 bg-amber-500/5 rounded-xl border border-amber-500/10 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  ⏱️ Chronomètre bloqué : <span className="text-amber-accent font-black">60s (Standard)</span>
                </p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1 font-medium italic">
                  Temps additionnel masqué pour une lisibilité maximale.
                </p>
              </div>
            )}

            <button
              onClick={() => selectTheme(userThemePicked || '')}
              className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95 metal-border"
            >
              Lancer mon épreuve ({gameDuration}s)
            </button>
          </div>
        )}
      </div>
    );
  }

  // RENDER PHASE 2: Standard Active Gameplay (after selecting a theme)
  if (loading) return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-accent/20 blur-xl animate-pulse rounded-full" />
        <Loader2 className="w-12 h-12 text-amber-accent animate-spin relative z-10" />
      </div>
      <p className="font-sans font-black italic text-white text-sm uppercase tracking-widest animate-pulse">Lancement de la manche...</p>
    </div>
  );

  if (error) return (
    <div className="text-center px-6 py-10">
      <div className="glass-panel p-8 border-red-500/30 mb-6 max-w-sm mx-auto">
        <p className="text-red-400 font-sans font-bold italic text-base leading-relaxed uppercase">
          ERREUR DE SIGNAL STUDIO.
        </p>
      </div>
      <button 
        onClick={() => setSelectedTheme(null)} 
        className="px-10 py-4 bg-slate-800 text-white font-black uppercase text-xs tracking-widest rounded-xl border border-slate-600 shadow-lg hover:bg-slate-700 transition-all active:scale-95 metal-border"
      >
        Réessayer le thème
      </button>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="z-10 w-full px-2 max-w-5xl">
      {wasOfflineUsed && (
        <div className="w-full max-w-xl mx-auto mb-4 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-center gap-2 text-xs text-amber-accent font-black uppercase tracking-wider animate-pulse">
          <WifiOff className="w-4 h-4 text-amber-accent" /> mode hors-ligne actif (Données locales)
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Participant standing table on the side */}
        <div className="md:col-span-1 space-y-2 bg-slate-950/20 p-4 rounded-xl border border-slate-800/40 relative">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-3">QUALIFIÉS DE LA MANCHE</p>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
            {participants.map((p) => {
              const isMe = p.isHuman;
              const actualStreakToDspl = isMe ? streak : p.maxStreak;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex-1 md:flex-initial p-3 rounded-lg border flex flex-col items-center md:items-start gap-1 transition-all duration-300 min-w-[120px] md:min-w-0 md:w-full",
                    isMe 
                      ? "border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-transparent" 
                      : "border-slate-800 bg-slate-900/40"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-left w-full">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: p.avatarColor }} />
                    <p className="font-sans font-black text-[11px] uppercase tracking-tight text-white truncate text-ellipsis">
                      {p.name} {isMe && "(Moi)"}
                    </p>
                  </div>
                  
                  {/* Streak and Chosen Theme Recap */}
                  <span className="text-[8px] text-slate-500 uppercase font-black truncate max-w-full italic mt-0.5">
                    Thème: {p.chosenTheme}
                  </span>
                  
                  <div className="flex items-center justify-between w-full mt-2.5">
                    <span className="text-[8px] text-slate-400 tracking-wider font-extrabold uppercase leading-none">STREAK:</span>
                    <span className={cn(
                      "font-mono text-xs font-black italic",
                      actualStreakToDspl >= 4 ? "text-amber-accent" : "text-white"
                    )}>
                      {actualStreakToDspl} / 4
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Active Game Area */}
        <div className="md:col-span-3">
          
          {/* Main Round Header */}
          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6 relative">
            <div className="absolute -bottom-px left-0 w-24 h-0.5 bg-electric-blue cyan-glow" />
            <div>
              <h4 className="text-amber-accent uppercase tracking-[0.3em] font-black text-[7px] mb-1">THÈME DE L'ÉPREUVE</h4>
              <p className="text-2xl font-sans font-black text-white italic uppercase tracking-tighter">{selectedTheme}</p>
            </div>
            
            {/* Timer Ring and extra time control */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group shrink-0">
                <div className={cn(
                  "w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
                  timeLeft < 15 ? "border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-amber-accent bg-amber-accent/10 shadow-lg"
                )}>
                  <div className={cn(
                    "absolute inset-0 rounded-full border-2 border-dashed opacity-20 animate-[spin_10s_linear_infinite]",
                    timeLeft < 15 ? "border-red-400" : "border-amber-accent"
                  )} />
                  <span className="text-[8px] font-black uppercase tracking-widest mb-[-4px]">Temps</span>
                  <span className={cn(
                    "text-3xl font-sans font-black tracking-tighter italic",
                    timeLeft < 15 ? "text-red-500 animate-pulse" : "text-amber-accent"
                  )}>{timeLeft}s</span>
                </div>
                <div className={cn(
                  "absolute inset-0 blur-2xl -z-10 opacity-30",
                  timeLeft < 15 ? "bg-red-500" : "bg-amber-accent"
                )} />
              </div>
              {!hideAdditionalTime && (
                <button
                  type="button"
                  onClick={() => {
                    setTimeLeft(prev => prev + 30);
                    playSound('success');
                  }}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-accent text-[9px] font-black uppercase tracking-widest rounded transition-all active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                >
                  ➕ Ajouter +30s
                </button>
              )}
            </div>
          </div>

          {/* Goal Indicator: 4 à la suite chain link */}
          <div className="flex flex-col items-center mb-8">
            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-black mb-3">SCORE CONSECUTIF (CIBLE: 4 À LA SUITE)</p>
            <div className="flex justify-center gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={i < streak ? { scale: [1, 1.25, 1], backgroundColor: "rgb(245, 158, 11)" } : { scale: 1 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-700 relative",
                    i < streak 
                      ? "border-amber-accent text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]" 
                      : "bg-slate-905/60 border-slate-800 text-slate-500"
                  )}
                >
                  {i < streak && (
                    <motion.div 
                      layoutId="streak-glow"
                      className="absolute inset-0 bg-amber-accent/20 blur-md rounded-full"
                    />
                  )}
                  <span className="font-black text-sm italic">{i + 1}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Question Box */}
          <AnimatePresence mode="wait">
            <motion.div
               key={currentIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className={cn(
                 "glass-panel p-8 text-center border-white/10 shadow-3xl relative transition-all duration-300 metal-border overflow-hidden min-h-[280px] flex flex-col justify-between",
                 feedback === 'correct' ? "bg-green-950/20 border-green-500/30" : ""
               )}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-blue/40 to-transparent" />
              
              <div className="mb-4">
                <span className="px-4 py-1.5 rounded bg-slate-800 text-electric-blue text-[8px] font-black uppercase tracking-[0.3em] border border-electric-blue/30 shadow-[0_0_10px_rgba(14,165,233,0.2)]">
                  QUESTION {currentIndex + 1}
                </span>
              </div>
              
              <h4 className="text-xl md:text-2xl font-serif text-white leading-relaxed italic tracking-tight font-black mb-6">
                "{currentQ?.question}"
              </h4>

              <div className="w-full">
                <form onSubmit={handleAnswer} className="relative max-w-sm mx-auto">
                  <input
                    autoFocus
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={!!feedback}
                    placeholder="Tapez votre réponse et validez..."
                    className={cn(
                      "w-full bg-black/40 border-2 border-slate-700 p-4 rounded text-lg text-center transition-all focus:outline-none focus:border-electric-blue focus:ring-4 ring-electric-blue/10 text-white font-sans font-black italic uppercase tracking-tight",
                      feedback === 'correct' && "border-green-500 bg-green-950/20 text-green-400",
                      feedback === 'wrong' && "border-red-500 bg-red-950/20 text-red-400"
                    )}
                  />
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     <AnimatePresence>
                       {feedback === 'correct' && (
                         <motion.div
                           initial={{ scale: 0, rotate: 90 }}
                           animate={{ scale: 1, rotate: 0 }}
                           className="text-green-400 bg-green-500/20 p-1.5 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse"
                         >
                           <Check className="w-5 h-5 stroke-[4px]" />
                         </motion.div>
                       )}
                       {feedback === 'wrong' && (
                         <motion.div
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="text-red-400 bg-red-500/20 p-1.5 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                         >
                           <X className="w-5 h-5 stroke-[4px]" />
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>

                  {feedback === 'wrong' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-slate-800 rounded border-l-4 border-amber-accent text-center">
                      <p className="text-slate-400 text-[8px] uppercase font-black tracking-widest mb-0.5">Correction :</p>
                      <p className="text-lg font-serif font-black text-white italic uppercase tracking-tight">"{currentQ?.answer}"</p>
                    </motion.div>
                  )}
                </form>

                {!feedback && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={handlePass}
                    className="mt-6 flex items-center justify-center gap-1.5 mx-auto px-6 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-[10px] tracking-widest font-black uppercase italic border border-slate-700 hover:border-white/30"
                  >
                    <SkipForward className="w-4.5 h-4.5" />
                    JE PASSE
                  </motion.button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
