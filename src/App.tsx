
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, BookOpen, Clock, Music, Volume2, Info, LogOut, ShieldAlert, RefreshCw, Phone, User, Users, LineChart, Plus, ChevronRight, Trash2, RotateCcw, Share2, History, Monitor, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { AudioProvider, useAudio } from './components/AudioEngine';
import Stage1 from './components/Stage1';
import Stage2 from './components/Stage2';
import Stage3 from './components/Stage3';
import { GameStage, GameState, Player } from './types';
import { cn, clearAskedQuestions } from './lib/utils';
import confetti from 'canvas-confetti';
import { 
  savePlayerToFirestore, 
  getPlayersFromFirestore, 
  deletePlayerFromFirestore, 
  saveGameStateToFirestore, 
  getGameStateFromFirestore, 
  deleteGameStateFromFirestore 
} from './lib/firebase';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-white text-slate-900 p-8 text-center">
          <div className="max-w-md">
            <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold mb-4">Une interférence divine...</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Le temple numérique a rencontré un obstacle imprévu. Votre progression locale est peut-être préservée.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-8 py-4 bg-amber-600 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-amber-500 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger le temple
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const BIBLE_TIPS = [
  {
    title: "Le plus court verset de la Bible",
    text: "Le verset le plus court se trouve dans l'évangile de Jean et contient seulement deux mots.",
    reference: "Jean 11:35 — \"Jésus pleura.\""
  },
  {
    title: "Le cantique de la poésie divine",
    text: "Le livre des Psaumes est le recueil le plus volumineux de la Bible, réunissant des cantiques hébraïques écrits sur plusieurs siècles.",
    reference: "Psaumes (150 chapitres au total)"
  },
  {
    title: "Une harmonie d'auteurs",
    text: "La Bible a été rédigée sur une période d'environ 1500 ans par plus de 40 auteurs d'époques, d'horizons et de métiers très divers.",
    reference: "Inspiré divinement"
  },
  {
    title: "L'origine hellénique de la Bible",
    text: "L'appellation moderne \"Bible\" tire ses racines du mot grec ancien \"Biblia\", qui se traduit littéralement par \"les livres\" ou \"bibliothèque\".",
    reference: "Étymologie biblique"
  },
  {
    title: "La longévité de Mathusalé",
    text: "Mathusalé détient le record absolu de l'âge le plus avancé rapporté dans les manuscrits bibliques avec 969 ans de vie.",
    reference: "Genèse 5:27"
  },
  {
    title: "La Petite Bible prophétique",
    text: "Certains théologiens appellent le livre d'Isaïe la \"Petite Bible\" car il contient précisément 66 chapitres, résonnant avec les 66 livres de la Bible entière.",
    reference: "Le grand prophète d'Israël"
  },
  {
    title: "Les proportions de l'Arche",
    text: "L'Arche construite par Noé mesurait environ 137 mètres de long, soit l'équivalent d'un terrain de football et demi moderne.",
    reference: "Genèse 6:15"
  },
  {
    title: "Le best-seller intemporel",
    text: "La Bible reste, de très loin, le livre le plus traduit, le plus imprimé et le plus distribué de l'histoire humaine.",
    reference: "Livre des livres"
  },
  {
    title: "Le nom divin dissimulé",
    text: "Le livre d'Esther et le Cantique des Cantiques sont les deux seuls écrits de la Bible hébraïque qui ne contiennent aucune mention explicite du mot \"Dieu\".",
    reference: "Mystères scripturaires"
  },
  {
    title: "La révolution de l'imprimerie",
    text: "C'est la Vulgate latine (la Bible chrétienne) qui fut le tout premier ouvrage imprimé par Johannes Gutenberg à Mayence en 1455.",
    reference: "Début de la typographie moderne"
  },
  {
    title: "Le silence mystique de Sélah",
    text: "Le mot mystérieux \"Sélah\" est répété 71 fois dans les Psaumes. Il s'agissait probablement d'une indication musicale invitant à une pause de méditation spirituelle.",
    reference: "Sélah (Pause de recueillement)"
  },
  {
    title: "L'autre nom de Sinaï",
    text: "Dans de nombreux passages bibliques, le Mont Sinaï, là où Moïse reçut la sainte Loi, est également désigné sous le nom sacré de Mont Horeb.",
    reference: "Exode & Deutéronome"
  },
  {
    title: "L'héritage de l'apôtre Paul",
    text: "L'apôtre Paul est l'auteur le plus prolifique en termes de nombre de livres écrits dans le Nouveau Testament, signant au total 13 lettres pastorales.",
    reference: "Les Épîtres Pauliniennes"
  }
];

export const BIBLE_AVATARS = [
  { emoji: "👑", name: "David", title: "Le Roi Chantre", color: "from-amber-400 to-amber-600 bg-amber-500/10 border-amber-500/30" },
  { emoji: "🦁", name: "Daniel", title: "Le Visionnaire", color: "from-orange-400 to-red-600 bg-orange-500/10 border-orange-500/30" },
  { emoji: "🕊️", name: "Noé", title: "Bâtisseur d'Alliance", color: "from-sky-450 to-blue-600 bg-sky-500/10 border-sky-500/30" },
  { emoji: "📜", name: "Moïse", title: "Le Législateur", color: "from-emerald-400 to-teal-700 bg-emerald-500/10 border-emerald-500/30" },
  { emoji: "🌟", name: "Esther", title: "La Reine Courage", color: "from-pink-400 to-rose-600 bg-pink-500/10 border-pink-500/30" },
  { emoji: "⚔️", name: "Gédéon", title: "Héros Vaillant", color: "from-red-400 to-red-600 bg-red-500/10 border-red-500/30" },
  { emoji: "🧁", name: "Ruth", title: "La Fidèle Étrangère", color: "from-violet-400 to-indigo-600 bg-violet-500/10 border-violet-500/30" },
  { emoji: "🔥", name: "Élie", title: "Prophète de Feu", color: "from-yellow-400 to-red-600 bg-yellow-500/10 border-yellow-500/30" },
  { emoji: "💡", name: "Salomon", title: "Le Sage", color: "from-teal-400 to-indigo-700 bg-teal-500/10 border-teal-500/30" },
  { emoji: "⚓", name: "Pierre", title: "Le Roc de Foi", color: "from-cyan-400 to-blue-700 bg-cyan-500/10 border-cyan-500/30" }
];

function BibleTipTransition({ stage, tip }: { stage: 'STAGE1' | 'STAGE2' | 'STAGE3'; tip: { title: string; text: string; reference: string } | null }) {
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    const totalDuration = 10000;
    const intervalTime = 30; // 30ms update rate
    const decreaseAmount = (intervalTime / totalDuration) * 100;
    
    const timer = setInterval(() => {
      setPercent(p => Math.max(0, p - decreaseAmount));
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, []);

  const stageLabels = {
    'STAGE1': 'MANCHE 1 — 9 À LA SUITE',
    'STAGE2': 'MANCHE 2 — 4 À LA SUITE',
    'STAGE3': 'MANCHE 3 — LE CHOC FINAL'
  };

  return (
    <motion.div
      key={`transition-${stage}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full flex flex-col items-center justify-center p-4"
    >
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.3)] metal-border max-w-sm w-full text-center overflow-hidden">
        {/* Glowing background rays */}
        <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full scale-125 pointer-events-none animate-pulse" />
        
        {/* Little golden label */}
        <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-accent animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-[9px] font-black text-amber-accent tracking-widest uppercase leading-none">
            {stageLabels[stage]}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-serif font-black text-white italic uppercase tracking-tighter mb-4 drop-shadow-md pb-1 border-b border-amber-500/20">
          {tip?.title || "Sagesse Biblique"}
        </h3>

        {/* Outer frame open book */}
        <div className="my-6 relative flex justify-center text-amber-400">
          <BookOpen className="w-10 h-10 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse" />
        </div>

        {/* Interactive Tip Content */}
        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 relative mb-6">
          <span className="absolute -top-3 left-4 text-4xl font-serif text-amber-500/30 select-none">“</span>
          <p className="text-sm text-slate-200 leading-relaxed font-serif italic relative z-10">
            {tip?.text || "Préparez votre esprit à surmonter les épreuves de cette manche."}
          </p>
          <span className="block mt-3 text-xs font-sans font-bold text-amber-accent/80">
            {tip?.reference || "Sagesse Éternelle"}
          </span>
        </div>

        {/* Pre-launch text */}
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse mb-3">
          Lancement de la manche...
        </p>

        {/* Counting progress bar */}
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-30 animate-pulse" 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function GameContent() {
  const { playMusic, stopMusic, playSound, isMuted, toggleMute } = useAudio();
  const [gameState, setGameState] = useState<GameState>({
    stage: 'INTRO',
    score: 0,
    currentPoints: 0
  });

  const [activeTransitionStage, setActiveTransitionStage] = useState<'STAGE1' | 'STAGE2' | 'STAGE3' | null>(null);
  const [currentTip, setCurrentTip] = useState<{ title: string; text: string; reference: string } | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  const [displayMode, setDisplayMode] = useState<'computer' | 'phone'>(() => {
    try {
      return (localStorage.getItem('app_display_mode') as 'computer' | 'phone') || 'computer';
    } catch {
      return 'computer';
    }
  });

  const handleToggleDisplayMode = (mode: 'computer' | 'phone') => {
    setDisplayMode(mode);
    try {
      localStorage.setItem('app_display_mode', mode);
    } catch (e) {
      console.warn(e);
    }
    playSound('click');
  };

  const [offlineMode, setOfflineMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('app_offline_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleOfflineMode = (value: boolean) => {
    setOfflineMode(value);
    try {
      localStorage.setItem('app_offline_mode', value ? 'true' : 'false');
    } catch (e) {
      console.warn(e);
    }
    playSound('click');
  };

  const [playerNameInput, setPlayerNameInput] = useState('');
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<string | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shareCopied, setShareCopied] = useState(false);
  const [gameLinkCopied, setGameLinkCopied] = useState(false);

  const fallbackCopyToClipboard = (text: string): boolean => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (e) {
      console.error("Fallback copying failed:", e);
      return false;
    }
  };

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed, using fallback:", err);
      }
    }
    return fallbackCopyToClipboard(text);
  };

  const handleCopyCleanGameLink = async () => {
    playSound('click');
    const cleanUrl = "https://ai.studio/apps/74da18b2-f560-4eb1-b7ec-dd3859673fa8";
    const copied = await copyTextToClipboard(cleanUrl);
    if (copied) {
      setGameLinkCopied(true);
      setTimeout(() => setGameLinkCopied(false), 3000);
    } else {
      console.error("Failed to copy link using all methods.");
    }
  };

  const handleShareResult = async (customScore: number, isWin: boolean) => {
    playSound('click');
    const activePlayer = players.find(p => p.id === currentPlayerId);
    const pName = activePlayer?.name || 'Joueur';
    const pEmoji = activePlayer?.avatarEmoji || '👤';
    const pAvatarName = activePlayer?.avatarName || 'Pèlerin';
    
    const shareUrl = "https://ai.studio/apps/74da18b2-f560-4eb1-b7ec-dd3859673fa8";
    let text = "";
    if (isWin) {
      text = `🏆 QUESTIONS POUR UN CHRÉTIEN 🏆\n\nJ'ai remporté la VICTOIRE suprême au quiz biblique avec un score glorieux de ${customScore} points ! 👑✨\n👤 Joueur : ${pEmoji} ${pName} (${pAvatarName})\n\nRelevez le défi chrétien et testez votre savoir biblique ! 📖🕊️\n${shareUrl}`;
    } else {
      text = `📖 QUESTIONS POUR UN CHRÉTIEN 📖\n\nJ'ai joué au quiz biblique et obtenu un score de ${customScore} points ! 🕊️\n👤 Joueur : ${pEmoji} ${pName} (${pAvatarName})\n\nVenez tester votre sagesse biblique et relevez le défi ! ✨\n${shareUrl}`;
    }

    let sharedSuccessfully = false;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Questions pour un Chrétien',
          text: text,
          url: shareUrl
        });
        sharedSuccessfully = true;
      } catch (err) {
        console.warn("navigator.share failed, falling back to copy to clipboard:", err);
      }
    }

    if (!sharedSuccessfully) {
      const copied = await copyTextToClipboard(text);
      if (copied) {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    }
  };

  const handleDeletePlayer = (id: string) => {
    playSound('click');
    setShowDeleteConfirm(id);
  };

  const handleResetPlayer = (id: string) => {
    playSound('click');
    setShowResetConfirm(id);
  };

  const confirmDeletePlayer = async (id: string) => {
    playSound('click');
    const updatedPlayers = players.filter(p => p.id !== id);
    
    // Save locally
    localStorage.setItem('alliance_quiz_players', JSON.stringify(updatedPlayers));
    localStorage.removeItem(`alliance_quiz_save_${id}`);
    
    const currentSaveStr = localStorage.getItem('alliance_quiz_save');
    if (currentSaveStr) {
      try {
        const parsed = JSON.parse(currentSaveStr);
        if (parsed.playerId === id) {
          localStorage.removeItem('alliance_quiz_save');
          setHasSave(false);
        }
      } catch (e) {}
    }
    
    setPlayers(updatedPlayers);
    setShowDeleteConfirm(null);
    if (updatedPlayers.length > 0) {
      setCurrentPlayerId(updatedPlayers[0].id);
    } else {
      setCurrentPlayerId(null);
      setGameState(prev => ({ ...prev, stage: 'PLAYER_SETUP' }));
    }

    try {
      await deletePlayerFromFirestore(id);
    } catch (err) {
      console.error("Firestore delete error:", err);
    }
  };

  const confirmResetPlayer = (id: string) => {
    playSound('click');
    const updatedPlayers = players.map(p => {
      if (p.id === id) {
        return {
          ...p,
          gamesPlayed: 0,
          maxStageReached: 'INTRO' as GameStage,
          highScore: 0,
          scoresHistory: []
        };
      }
      return p;
    });
    savePlayersToLocal(updatedPlayers);
    setShowResetConfirm(null);
  };

  useEffect(() => {
    if (gameState.stage === 'STAGE1' || gameState.stage === 'STAGE2' || gameState.stage === 'STAGE3') {
      const randomIdx = Math.floor(Math.random() * BIBLE_TIPS.length);
      setCurrentTip(BIBLE_TIPS[randomIdx]);
      setActiveTransitionStage(gameState.stage);
      
      const timer = setTimeout(() => {
        setActiveTransitionStage(null);
      }, 10000); // 10 seconds transition
      
      return () => clearTimeout(timer);
    } else {
      setActiveTransitionStage(null);
      setCurrentTip(null);
    }
  }, [gameState.stage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Épurer l'URL en retirant les paramètres (query params) et le hash si présents
    if (window.location.search || window.location.hash) {
      try {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {
        console.warn("Impossible d'épurer l'URL :", e);
      }
    }
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatHistoryDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timePart = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `le ${datePart} à ${timePart}`;
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    if (isMuted) return;
    
    if (gameState.stage === 'INTRO') {
      playMusic('intro');
    } else if (gameState.stage === 'PLAYER_SETUP' || gameState.stage === 'PROFILE') {
      playMusic('profile');
    }
  }, [gameState.stage, isMuted, playMusic]);

  useEffect(() => {
    const initData = async () => {
      // 1. Fast local storage loads
      const savedPlayersLocal = localStorage.getItem('alliance_quiz_players');
      let initialPlayers: Player[] = [];
      if (savedPlayersLocal) {
        try {
          initialPlayers = JSON.parse(savedPlayersLocal) as Player[];
          setPlayers(initialPlayers);
        } catch (e) {
          console.error("Error parsing players:", e);
        }
      }

      if (initialPlayers.length > 0) {
        if (initialPlayers.length === 1) {
          setCurrentPlayerId(initialPlayers[0].id);
          setGameState(prev => ({ ...prev, stage: 'PROFILE', playerId: initialPlayers[0].id }));
        } else {
          setGameState(prev => ({ ...prev, stage: 'PROFILE' }));
        }
      } else {
        setGameState(prev => ({ ...prev, stage: 'PLAYER_SETUP' }));
      }

      setHasSave(!!localStorage.getItem('alliance_quiz_save'));

      // 2. Background Firestore fetch
      try {
        const firestorePlayers = await getPlayersFromFirestore();
        if (firestorePlayers && firestorePlayers.length > 0) {
          setPlayers(firestorePlayers);
          localStorage.setItem('alliance_quiz_players', JSON.stringify(firestorePlayers));
          
          const defaultPlayerId = firestorePlayers.length === 1 ? firestorePlayers[0].id : currentPlayerId;
          if (defaultPlayerId) {
            const fsSave = await getGameStateFromFirestore(defaultPlayerId);
            if (fsSave) {
              const enrichedSave = { ...fsSave, playerId: defaultPlayerId };
              localStorage.setItem(`alliance_quiz_save_${defaultPlayerId}`, JSON.stringify(enrichedSave));
              localStorage.setItem('alliance_quiz_save', JSON.stringify(enrichedSave));
              setHasSave(true);
            }
          }
        } else if (initialPlayers.length > 0) {
          for (const p of initialPlayers) {
            await savePlayerToFirestore(p);
          }
        }
      } catch (err) {
        console.warn("Could not sync with Firestore on mount:", err);
      }
    };

    initData();
  }, []);

  const savePlayersToLocal = (updatedPlayers: Player[]) => {
    localStorage.setItem('alliance_quiz_players', JSON.stringify(updatedPlayers));
    setPlayers(updatedPlayers);
    
    // Save to Firestore background
    updatedPlayers.forEach(p => {
      savePlayerToFirestore(p).catch(err => console.error("Firestore save player profile error", err));
    });
  };

  const proceedToStartFlow = () => {
    if (players.length === 0) {
      setGameState(prev => ({ ...prev, stage: 'PLAYER_SETUP' }));
    } else {
      // Si un seul profil existe, on le sélectionne d'office pour gagner du temps
      if (players.length === 1) {
        setCurrentPlayerId(players[0].id);
        setGameState(prev => ({ ...prev, stage: 'PROFILE', playerId: players[0].id }));
      } else {
        setGameState(prev => ({ ...prev, stage: 'PROFILE' }));
      }
    }
  };

  const handleStartFlow = () => {
    playSound('click');
    if (hasSave) {
      setShowResumeConfirm(true);
    } else {
      proceedToStartFlow();
    }
  };

  const handleAcceptResume = () => {
    loadGame();
    setShowResumeConfirm(false);
  };

  const handleDiscardSaveAndStartNew = async () => {
    playSound('click');
    localStorage.removeItem('alliance_quiz_save');

    const activePlayerId = currentPlayerId || gameState.playerId;
    if (activePlayerId) {
      localStorage.removeItem(`alliance_quiz_save_${activePlayerId}`);
      try {
        await deleteGameStateFromFirestore(activePlayerId);
      } catch (e) {
        console.error("Firestore error deleting game state:", e);
      }
    }

    setHasSave(false);
    setShowResumeConfirm(false);
    proceedToStartFlow();
  };

  const getSaveDetails = () => {
    try {
      const saved = localStorage.getItem('alliance_quiz_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        let stageLabel = parsed.stage || "Inconnu";
        if (stageLabel === 'STAGE1') stageLabel = "Manche 1 (Les 9 à la suite)";
        if (stageLabel === 'STAGE2') stageLabel = "Manche 2 (Le 4 à la suite)";
        if (stageLabel === 'STAGE3') stageLabel = "Manche 3 (Face-à-Face)";
        return {
          score: parsed.score || 0,
          stage: stageLabel
        };
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const handleCreatePlayer = () => {
    if (!playerNameInput.trim()) return;
    
    // Vérification basique de doublon
    const nameExists = players.some(p => p.name.toLowerCase() === playerNameInput.trim().toLowerCase());
    if (nameExists) {
      // On peut ajouter une petite variation ou simplement autoriser
    }
    
    const avatar = BIBLE_AVATARS[selectedAvatarIndex];
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerNameInput.trim(),
      gamesPlayed: 0,
      maxStageReached: 'INTRO',
      highScore: 0,
      avatarEmoji: avatar?.emoji || "👤",
      avatarColor: avatar?.color || "from-amber-400 to-amber-600 bg-amber-500/10 border-amber-500/30",
      avatarName: avatar?.name || "Pèlerin"
    };
    
    const newPlayers = [...players, newPlayer];
    savePlayersToLocal(newPlayers);
    setCurrentPlayerId(newPlayer.id);
    setPlayerNameInput('');
    setSelectedAvatarIndex(0);
    setGameState(prev => ({ ...prev, stage: 'PROFILE', playerId: newPlayer.id }));
    playSound('success');

    savePlayerToFirestore(newPlayer).catch(err => console.error(err));
    setHasSave(false);
  };

  const selectPlayer = async (id: string) => {
    setCurrentPlayerId(id);
    setGameState(prev => ({ ...prev, stage: 'PROFILE', playerId: id }));
    playSound('click');

    // Fetch save game state for selected profile from Firestore
    try {
      const fsSave = await getGameStateFromFirestore(id);
      if (fsSave) {
        const enrichedSave = { ...fsSave, playerId: id };
        localStorage.setItem(`alliance_quiz_save_${id}`, JSON.stringify(enrichedSave));
        localStorage.setItem('alliance_quiz_save', JSON.stringify(enrichedSave));
        setHasSave(true);
      } else {
        const localSave = localStorage.getItem(`alliance_quiz_save_${id}`);
        if (localSave) {
          localStorage.setItem('alliance_quiz_save', localSave);
          setHasSave(true);
        } else {
          setHasSave(false);
        }
      }
    } catch (e) {
      // Offline fallback
      const localSav = localStorage.getItem(`alliance_quiz_save_${id}`);
      if (localSav) {
        localStorage.setItem('alliance_quiz_save', localSav);
        setHasSave(true);
      } else {
        setHasSave(false);
      }
    }
  };

  const updatePlayerStats = (finalScore: number, finalStage: GameStage) => {
    if (!currentPlayerId) return;
    
    const updatedPlayers = players.map(p => {
      if (p.id === currentPlayerId) {
        // Simple logic for maxStageReached
        const stageOrder: GameStage[] = ['INTRO', 'PLAYER_SETUP', 'PROFILE', 'STAGE1', 'STAGE2', 'STAGE3', 'VICTORY'];
        const currentMaxIdx = stageOrder.indexOf(p.maxStageReached);
        const newMaxIdx = stageOrder.indexOf(finalStage);
        const newMaxStage = newMaxIdx > currentMaxIdx ? finalStage : p.maxStageReached;

        const newScoreRecord = {
          score: finalScore,
          date: new Date().toISOString(),
          stageReached: finalStage
        };

        const updatedHistory = [newScoreRecord, ...(p.scoresHistory || [])].slice(0, 5);

        return {
          ...p,
          gamesPlayed: p.gamesPlayed + 1,
          highScore: Math.max(p.highScore, finalScore),
          maxStageReached: newMaxStage,
          scoresHistory: updatedHistory
        };
      }
      return p;
    });
    
    savePlayersToLocal(updatedPlayers);
  };

  const startGame = () => {
    if (!currentPlayerId) {
      setGameState(prev => ({ ...prev, stage: 'PLAYER_SETUP' }));
      return;
    }
    clearAskedQuestions();
    playSound('success');
    setGameState(prev => ({ ...prev, stage: 'STAGE1', playerId: currentPlayerId }));
    playMusic('stage1');
  };

  const loadGame = () => {
    const activePlayerId = currentPlayerId || gameState.playerId;
    const key = activePlayerId ? `alliance_quiz_save_${activePlayerId}` : 'alliance_quiz_save';
    const saved = localStorage.getItem(key) || localStorage.getItem('alliance_quiz_save');
    if (saved) {
      const state = JSON.parse(saved) as GameState;
      setGameState(state);
      if (state.playerId) {
        setCurrentPlayerId(state.playerId);
      }
      playSound('click');
      if (state.stage === 'STAGE1') playMusic('stage1');
      if (state.stage === 'STAGE2') playMusic('stage2');
      if (state.stage === 'STAGE3') playMusic('stage3');
    }
  };

  const saveGame = async () => {
    const activePlayerId = currentPlayerId || gameState.playerId;
    const stateToSave = { ...gameState, playerId: activePlayerId };

    localStorage.setItem('alliance_quiz_save', JSON.stringify(stateToSave));
    if (activePlayerId) {
      localStorage.setItem(`alliance_quiz_save_${activePlayerId}`, JSON.stringify(stateToSave));
    }
    setHasSave(true);

    if (activePlayerId) {
      try {
        await saveGameStateToFirestore(activePlayerId, stateToSave);
      } catch (err) {
        console.error("Firestore save error:", err);
      }
    }
    quitGame();
  };

  const quitGame = () => {
    stopMusic();
    setGameState({ stage: 'INTRO', score: 0, currentPoints: 0 });
    setShowExitConfirm(false);
    playSound('click');
  };

  const handleLogoutClick = () => {
    if (gameState.stage === 'INTRO') {
      // Pour la page d'accueil, on ne fait rien ou on propose de changer de profil
      playSound('click');
    } else if (gameState.stage === 'VICTORY' || gameState.stage === 'DEFEAT') {
      quitGame();
    } else {
      setShowExitConfirm(true);
    }
  };


  const nextStage = (points: number) => {
    if (gameState.stage === 'STAGE1' && points < 9) {
      handleGameOver(false);
      return;
    }
    
    if (gameState.stage === 'STAGE2' && points < 4) {
      handleGameOver(false);
      return;
    }

    const nextMap: Record<GameStage, GameStage> = {
      'INTRO': 'PLAYER_SETUP',
      'PLAYER_SETUP': 'PROFILE',
      'PROFILE': 'STAGE1',
      'STAGE1': 'STAGE2',
      'STAGE2': 'STAGE3',
      'STAGE3': 'VICTORY',
      'VICTORY': 'INTRO',
      'DEFEAT': 'INTRO'
    };

    const newStage = nextMap[gameState.stage];
    
    // Update stats if finishing a game
    if (newStage === 'VICTORY' || newStage === 'INTRO') {
      updatePlayerStats(gameState.score + points, newStage === 'VICTORY' ? 'VICTORY' : gameState.stage);
    }

    setGameState(prev => ({
      ...prev,
      stage: newStage,
      score: prev.score + points
    }));
    
    if (newStage === 'STAGE2') playMusic('stage2');
    if (newStage === 'STAGE3') playMusic('stage3');
    if (newStage === 'VICTORY') {
      playMusic('victory');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFD700', '#FFFFFF']
      });
    }
  };

  const handleGameOver = (isVictory: boolean) => {
    updatePlayerStats(gameState.score, isVictory ? 'VICTORY' : gameState.stage);
    setGameState(prev => ({ ...prev, stage: isVictory ? 'VICTORY' : 'DEFEAT' }));
    
    if (isVictory) {
      playMusic('victory');
      confetti({
        particleCount: 200,
        spread: 100,
      });
    } else {
      playMusic('defeat');
    }
  };

  return (
    <div className="h-screen w-full relative flex flex-col bg-studio-dark text-slate-100 font-sans overflow-hidden select-none studio-gradient">
      {/* Background Studio Light Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-electric-blue/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-accent/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-full scale-150" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-white/5 rounded-full" />
        <div className="absolute inset-0 tv-scanline pointer-events-none opacity-20" />
      </div>

      {/* Header HUD - TV Show Style */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogoutClick}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-red-500/50 hover:bg-red-950/30 transition-all active:scale-90 group metal-border"
            title="Quitter le jeu"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1"></div>
          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center shadow-lg metal-border">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-sans font-black tracking-tighter text-white uppercase italic whitespace-nowrap">
              {gameState.stage === 'INTRO' 
                ? formatDateTime(currentTime) 
                : "QUESTIONS POUR UN CHRÉTIEN"}
            </h1>
            <p className="text-[8px] uppercase tracking-[0.3em] text-amber-accent font-black">
              {gameState.stage === 'INTRO' ? 'ÉDITION SPÉCIALE' : 
               gameState.stage === 'PLAYER_SETUP' ? 'IDENTIFICATION' :
               gameState.stage === 'PROFILE' ? 'TABLEAU DE BORD' :
               gameState.stage.replace('STAGE', 'MANCHE ')}
            </p>
          </div>
        </div>
        
        {gameState.stage !== 'INTRO' && (
          <div className="flex gap-6 items-center">
            <div className="text-center">
              <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5 font-bold">SCORE</p>
              <p className="text-xl font-mono text-amber-accent font-black tracking-tighter leading-none">{gameState.score}</p>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="bg-amber-accent/20 border border-amber-accent/40 rounded-sm px-3 py-0.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="text-[8px] font-black text-amber-accent tracking-[0.1em] uppercase">
                {gameState.stage === 'STAGE1' ? 'OBJ: 9 PTS' : gameState.stage === 'STAGE2' ? 'OBJ: 4 SCÈNES' : 'FACE-À-FACE'}
              </span>
            </div>
            
            <div className="h-8 w-px bg-white/10"></div>
            <button
              type="button"
              onClick={() => handleToggleDisplayMode(displayMode === 'computer' ? 'phone' : 'computer')}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:border-amber-accent hover:bg-amber-500/10 transition-all active:scale-90 flex items-center gap-1.5 metal-border"
              title={displayMode === 'computer' ? "Passer en mode téléphone" : "Passer en mode ordinateur"}
            >
              {displayMode === 'computer' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-accent" />
                  <span className="text-[7.5px] font-black text-amber-accent tracking-wider uppercase hidden sm:inline-block">TÉLÉPHONE</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[7.5px] font-black text-sky-400 tracking-wider uppercase hidden sm:inline-block">ORDINATEUR</span>
                </>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel p-8 max-w-sm w-full text-center border-amber-200"
            >
              <LogOut className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-sky-950 mb-2">Quitter le jeu ?</h3>
              <p className="text-sky-600 mb-8">Voulez-vous sauvegarder votre progression avant de partir ?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={saveGame}
                  className="w-full py-4 rounded-xl bg-amber-600 text-white font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-amber-200 active:scale-[0.98]"
                >
                  Sauvegarder et quitter
                </button>
                <button 
                  onClick={quitGame}
                  className="w-full py-4 rounded-xl bg-red-50 border border-red-200 text-red-500 font-bold hover:bg-red-100 transition-all active:scale-[0.98]"
                >
                  Quitter sans sauvegarder
                </button>
                <button 
                   onClick={() => setShowExitConfirm(false)}
                   className="w-full py-3 rounded-xl bg-transparent text-sky-400 font-medium hover:text-sky-600 transition-colors"
                >
                  Annuler et rester
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Profile Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel p-8 max-w-sm w-full text-center border-red-500/50"
            >
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-semibold text-white mb-2">Supprimer le profil ?</h3>
              <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le profil de <span className="font-extrabold text-amber-accent italic">"{players.find(p => p.id === showDeleteConfirm)?.name}"</span> ? <br/>Toutes les statistiques associées seront effacées.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => confirmDeletePlayer(showDeleteConfirm)}
                  className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-[0.98]"
                >
                  Supprimer définitivement
                </button>
                <button 
                  onClick={() => {
                    playSound('click');
                    setShowDeleteConfirm(null);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Profile Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel p-8 max-w-sm w-full text-center border-amber-500/50"
            >
              <RotateCcw className="w-12 h-12 text-amber-accent mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-semibold text-white mb-2">Réinitialiser le profil ?</h3>
              <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                Voulez-vous remettre à zéro les scores et statistiques de <span className="font-extrabold text-amber-accent italic">"{players.find(p => p.id === showResetConfirm)?.name}"</span> ? Son historique de jeu recommencera du début.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => confirmResetPlayer(showResetConfirm)}
                  className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-[0.98]"
                >
                  Réinitialiser les scores
                </button>
                <button 
                  onClick={() => {
                    playSound('click');
                    setShowResetConfirm(null);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Save Confirmation Modal */}
      <AnimatePresence>
        {showResumeConfirm && (() => {
          const saveDetails = getSaveDetails();
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-panel p-8 max-w-sm w-full text-center border-amber-500/50"
              >
                <Clock className="w-12 h-12 text-amber-accent mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-serif font-black text-white italic uppercase tracking-tighter mb-2 text-balance">Partie sauvegardée !</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Une sauvegarde de votre progression a été détectée. Voulez-vous reprendre là où vous vous étiez arrêté ou démarrer une nouvelle émission ?
                </p>

                {saveDetails && (
                  <div className="glass-panel p-4 border-amber-500/20 mb-6 bg-gradient-to-r from-amber-950/10 via-black/40 to-amber-950/10 text-[11px] uppercase tracking-wider text-slate-400 space-y-1.5 rounded-sm">
                    <div>Étape : <span className="text-white font-extrabold">{saveDetails.stage}</span></div>
                    <div>Score actuel : <span className="text-amber-accent font-extrabold">{saveDetails.score} pts</span></div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleAcceptResume}
                    className="w-full py-4 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] metal-border"
                  >
                    Reprendre la partie
                  </button>
                  <button 
                    onClick={handleDiscardSaveAndStartNew}
                    className="w-full py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-all active:scale-[0.98]"
                  >
                    Nouvelle émission
                  </button>
                  <button 
                    onClick={() => {
                      playSound('click');
                      setShowResumeConfirm(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-transparent text-slate-500 font-medium hover:text-slate-300 transition-colors text-xs uppercase tracking-widest font-bold"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Main Game Stage Container */}
      <main className={cn(
        "flex-1 relative flex flex-col items-center justify-center z-10 overflow-y-auto w-full mx-auto transition-all duration-500 ease-out",
        displayMode === 'phone'
          ? "max-w-[420px] bg-slate-950/60 border-[8px] border-slate-800/95 rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] p-5 my-4 relative"
          : "max-w-5xl p-6 my-2"
      )}>
        {displayMode === 'phone' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center gap-1.5 pointer-events-none border-b border-x border-slate-700/30">
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse" />
            <div className="w-10 h-0.5 bg-slate-900 rounded-full" />
          </div>
        )}
        <AnimatePresence mode="wait">
          {gameState.stage === 'INTRO' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center max-w-[340px] w-full mx-auto"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="mb-2 flex justify-center"
              >
                {/* Stunning 3D Natural Open Bible Frame */}
                <div className="relative w-64 h-44 flex items-center justify-center scale-[0.82]">
                  
                  {/* Glowing Holy Spirit Ambient Backlight */}
                  <div className="absolute inset-x-4 inset-y-2 bg-amber-500/25 blur-3xl rounded-full scale-125 pointer-events-none animate-pulse" />
                  
                  {/* Floating glitter sparkles */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 1, 0.3],
                      y: [-4, 4, -4]
                    }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="absolute top-2 right-4 text-amber-300 pointer-events-none z-30"
                  >
                    <Sparkles className="w-7 h-7 drop-shadow-[0_0_10px_rgba(253,224,71,0.9)]" />
                  </motion.div>

                  <motion.div 
                    animate={{ 
                      scale: [1.3, 0.7, 1.3],
                      opacity: [1, 0.3, 1],
                      x: [4, -4, 4]
                    }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.6 }}
                    className="absolute bottom-4 left-4 text-yellow-250 pointer-events-none z-30"
                  >
                    <Sparkles className="w-6 h-6 drop-shadow-[0_0_8px_rgba(254,240,138,0.8)]" />
                  </motion.div>

                  <motion.div 
                    animate={{ 
                      scale: [0.7, 1.3, 0.7],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.1 }}
                    className="absolute top-10 left-6 text-amber-400 pointer-events-none z-30"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>

                  {/* Complete 3D Open Bible */}
                  <motion.div
                    animate={{ 
                      y: [-3, 3, -3],
                      rotate: [-0.5, 0.5, -0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="relative w-56 h-36 select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
                  >
                    {/* Rich Mahogany Leather Textured Outer Cover overhang */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#4d2d18] via-[#331c0e] to-[#1e0e05] rounded-lg border border-[#6b4227]/40 shadow-2xl" />
                    
                    {/* Gilded/Gold Edge Pages Stack Depth (bottom side stacked leaves effect) */}
                    <div className="absolute left-1.5 right-1.5 bottom-[2px] h-[4px] bg-amber-500/50 rounded-b-md border-t border-amber-600/40" />
                    <div className="absolute left-2.5 right-2.5 bottom-[5px] h-[3px] bg-amber-400/35 rounded-b-sm" />
                    <div className="absolute left-3.5 right-3.5 bottom-[7px] h-[2px] bg-amber-300/20 rounded-b-sm" />
                    
                    {/* Thick side stacks representing layers of previous parchment pages */}
                    {/* Left stack depth */}
                    <div className="absolute left-[4px] right-1/2 top-[4px] bottom-[9px] bg-[#ddd5bc] rounded-l-md rounded-r-[2px] shadow-[inset_-12px_0_15px_rgba(0,0,0,0.2)]" />
                    {/* Right stack depth */}
                    <div className="absolute left-1/2 right-[4px] top-[4px] bottom-[9px] bg-[#ddd5bc] rounded-r-md rounded-l-[2px] shadow-[inset_12px_0_15px_rgba(0,0,0,0.2)]" />

                    {/* Left Active Page Leaf */}
                    <div className="absolute left-[5px] right-1/2 top-[5px] bottom-[11px] mr-[1px] bg-gradient-to-r from-[#fdfbf7] via-[#faf7ee] to-[#ece1c7] rounded-l-[25px] rounded-r-[4px] shadow-[4px_5px_10px_rgba(0,0,0,0.25),_inset_-18px_0_24px_rgba(0,0,0,0.18)] flex flex-col justify-between p-3.5 overflow-hidden">
                      {/* Subtle elegant page frame border */}
                      <div className="absolute inset-2 border border-amber-700/8 rounded-l-[21px] rounded-r-[2px] pointer-events-none" />
                      
                      {/* Left Page Holy text simulation */}
                      <div className="relative z-10 flex flex-col gap-1.5 mt-1.5">
                        {/* Page Header (Golden Miniature Cross or Title) */}
                        <div className="flex justify-center items-center gap-1 mb-2">
                          <div className="h-2 w-12 bg-amber-800/25 rounded" />
                        </div>
                        {/* Faint script rows simulating ancient texts */}
                        <div className="flex flex-col gap-1 w-full">
                          <div className="h-1 w-full bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[92%] bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[96%] bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[85%] bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-full bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[90%] bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[65%] bg-slate-800/15 rounded-full" />
                        </div>
                      </div>
                      
                      {/* Vintage Chapter numeral page indicator */}
                      <div className="relative z-10 self-start text-[8px] font-serif font-bold text-amber-700/50 mt-1 pl-1 select-none">
                        Ps. XXIII
                      </div>
                    </div>
                    
                    {/* Right Active Page Leaf */}
                    <div className="absolute left-1/2 right-[5px] top-[5px] bottom-[11px] ml-[1px] bg-gradient-to-l from-[#fdfbf7] via-[#faf7ee] to-[#ece1c7] rounded-r-[25px] rounded-l-[4px] shadow-[-4px_5px_10px_rgba(0,0,0,0.25),_inset_18px_0_24px_rgba(0,0,0,0.18)] flex flex-col justify-between p-3.5 overflow-hidden">
                      {/* Subtle elegant page frame border */}
                      <div className="absolute inset-2 border border-amber-700/8 rounded-r-[21px] rounded-l-[2px] pointer-events-none" />
                      
                      {/* Right Page Content */}
                      <div className="relative z-10 flex flex-col gap-1.5 items-center mt-1">
                        {/* Centerpiece Cross Emblem */}
                        <div className="text-amber-600/70 py-1 flex justify-center">
                          <svg className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(180,83,9,0.2)]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 2h2v6h5v2h-5v11h-2v-11h-5v-2h5V2z" />
                          </svg>
                        </div>
                        {/* Ancient text lines */}
                        <div className="flex flex-col gap-1 w-full mt-1">
                          <div className="h-1 w-full bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[93%] bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[88%] bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-full bg-slate-800/15 rounded-full" />
                          <div className="h-1 w-[75%] bg-slate-800/15 rounded-full" />
                        </div>
                      </div>
                      
                      {/* Right page numeral */}
                      <div className="relative z-10 self-end text-[8px] font-serif font-bold text-amber-700/50 mt-1 pr-1 select-none">
                        A & Ω
                      </div>
                    </div>

                    {/* Crease Shadows representing folded spine area (mix blend multiply) */}
                    <div className="absolute left-[calc(50%-14px)] w-28 top-[5px] bottom-[11px] bg-gradient-to-r from-transparent via-black/45 to-transparent pointer-events-none mix-blend-multiply z-15" />
                    <div className="absolute left-[calc(50%-3px)] w-6 top-[5px] bottom-[11px] bg-gradient-to-r from-transparent via-black/25 to-transparent pointer-events-none z-15" />

                    {/* Realistic Red Velvet Fabric Bookmark Ribbon hanging from the spine */}
                    <div className="absolute left-[calc(50%-6px)] top-[5px] bottom-[-22px] w-3 z-20 pointer-events-none flex flex-col items-center">
                      {/* Velvet Ribbon Body */}
                      <div className="w-full flex-1 bg-gradient-to-r from-red-700 via-red-600 to-red-800 shadow-[3px_5px_8px_rgba(0,0,0,0.5)] relative">
                        {/* Sleek satin shine highlight stripe */}
                        <div className="absolute inset-y-0 left-[2px] w-[1.5px] bg-white/20" />
                      </div>
                      {/* Fish-tail cut at the bottom ribbon tag */}
                      <div className="w-3 h-2.5 flex flex-shrink-0">
                        <div className="w-1.5 h-full bg-gradient-to-br from-red-700 to-red-800" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                        <div className="w-1.5 h-full bg-gradient-to-bl from-red-800 to-red-900" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                      </div>
                    </div>

                    {/* Shimming holy gleam ray sweep */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none z-25">
                      <motion.div 
                        animate={{ 
                          x: ['-200%', '200%']
                        }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: "linear", repeatDelay: 1.5 }}
                        className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12"
                      />
                    </div>

                  </motion.div>
                </div>
              </motion.div>
              <div className="w-full flex justify-center overflow-visible">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[25px] xs:text-[28px] sm:text-3xl md:text-4xl font-sans font-black mb-1.5 text-white tracking-tighter leading-none italic uppercase whitespace-nowrap drop-shadow-[0_4px_16px_rgba(255,255,255,0.1)] bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent text-center block"
                >
                  QUESTIONS POUR UN CHRÉTIEN
                </motion.h1>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-amber-accent uppercase tracking-[0.4em] font-black mb-5"
              >
                Par Jean Cyrille AHORET
              </motion.p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: BookOpen, text: "9 à la suite", delay: 0.5 },
                  { icon: Clock, text: "4 à la suite", delay: 0.6 },
                  { icon: Trophy, text: "Le Choc Final", delay: 0.7 }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: item.delay, type: "spring", stiffness: 200 }}
                    className="glass-panel p-4 border-slate-700 flex flex-col items-center justify-center cyan-glow"
                  >
                    <item.icon className="w-5 h-5 text-electric-blue mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white text-center leading-tight">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col gap-4 items-center"
              >
                <button
                  onClick={handleStartFlow}
                  className="group relative px-10 py-5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black text-sm uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(245,158,11,0.4)] w-full metal-border"
                >
                  Cliquez ici pour jouer
                </button>
                
                {hasSave && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={loadGame}
                    className="text-amber-700 hover:text-amber-500 font-bold uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2 py-2 w-full"
                  >
                    <Clock className="w-4 h-4" />
                    Reprendre la partie
                  </motion.button>
                )}

                <motion.a
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  href="tel:002250103697499"
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all text-[10px] tracking-widest font-bold uppercase shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Contact: 01 03 69 74 99
                </motion.a>
              </motion.div>
            </motion.div>
          )}

          {gameState.stage === 'PLAYER_SETUP' && (
            <motion.div
              key="player_setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center w-full"
            >
              <div className="glass-panel p-8 metal-border">
                <User className="w-16 h-16 text-amber-accent mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">IDENTIFICATION</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">Mentionnez votre nom pour le show</p>
                
                {/* APERÇU EN TEMPS RÉEL DU JOUEUR */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl border-2 border-amber-500 shadow-lg shrink-0">
                    {BIBLE_AVATARS[selectedAvatarIndex]?.emoji || "👤"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7px] text-slate-400 uppercase font-bold tracking-widest block mb-0.5">Aperçu du Joueur</span>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter truncate leading-none">
                      {playerNameInput.trim() || "(Votre nom...)"}
                    </h3>
                    <span className="mt-1 inline-block bg-amber-500/15 text-amber-accent px-1.5 py-0.5 rounded border border-amber-500/10 font-bold tracking-wide text-[7px] uppercase leading-none">
                      {BIBLE_AVATARS[selectedAvatarIndex]?.name || "Pèlerin"} — {BIBLE_AVATARS[selectedAvatarIndex]?.title || "Aspirant"}
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="VOTRE NOM..."
                  className="w-full bg-black/40 border-2 border-slate-700 p-4 rounded-sm text-center text-white font-black italic uppercase mb-5 focus:border-amber-accent outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && playerNameInput.trim() && handleCreatePlayer()}
                />

                {/* Choix de l'avatar biblique */}
                <div className="mb-6 text-left">
                  <span className="text-[9px] text-amber-accent font-black uppercase tracking-widest block mb-2 px-1">
                    Choisissez votre Avatar Biblique
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 max-h-[155px] overflow-y-auto pr-1">
                    {BIBLE_AVATARS.map((av, index) => {
                      const isSelected = selectedAvatarIndex === index;
                      return (
                        <button
                          key={av.name}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setSelectedAvatarIndex(index);
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center p-1.5 rounded-xl transition-all border text-center cursor-pointer relative",
                            isSelected 
                              ? "bg-amber-500/20 border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.2)] scale-105" 
                              : "bg-black/30 border-white/5 hover:border-slate-700 hover:bg-black/50"
                          )}
                          title={`${av.name} — ${av.title}`}
                        >
                          <span className="text-xl mb-0.5 filter drop-shadow-md">{av.emoji}</span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-tighter truncate w-full",
                            isSelected ? "text-amber-accent" : "text-slate-400"
                          )}>
                            {av.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Petit panneau de l'avatar selectionné */}
                  <div className="mt-3 p-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                    <span className="text-xl shrink-0">{BIBLE_AVATARS[selectedAvatarIndex]?.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-amber-accent uppercase leading-none mb-0.5">
                        {BIBLE_AVATARS[selectedAvatarIndex]?.name}
                      </p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wider leading-none truncate">
                        {BIBLE_AVATARS[selectedAvatarIndex]?.title}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCreatePlayer}
                  disabled={!playerNameInput.trim()}
                  className="w-full py-4 bg-amber-accent text-black font-black uppercase tracking-widest rounded-sm disabled:opacity-50"
                >
                  VALIDER
                </button>
                
                {players.length > 0 && (
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'PROFILE' }))}
                    className="mt-4 text-xs text-slate-400 hover:text-white uppercase tracking-widest font-bold"
                  >
                    Retour aux profils
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {gameState.stage === 'PROFILE' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="glass-panel p-6 metal-border overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2">
                  <button 
                    onClick={() => setGameState(prev => ({ ...prev, stage: 'PLAYER_SETUP' }))}
                    className="p-2 bg-slate-800 rounded-full border border-white/10 hover:bg-slate-700 transition-colors"
                    title="Nouveau profil"
                  >
                    <Plus className="w-4 h-4 text-amber-accent" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mb-5 w-full">
                  {(() => {
                    const activePlayer = players.find(p => p.id === currentPlayerId);
                    const avEmoji = activePlayer?.avatarEmoji || "👤";
                    const avColor = activePlayer?.avatarColor || "from-amber-400 to-amber-600 bg-amber-500/10 border-amber-500/30";
                    const avName = activePlayer?.avatarName || "Pèlerin";
                    const fromClass = avColor.split(' ').find(c => c.startsWith('from-')) || 'from-amber-400';
                    const toClass = avColor.split(' ').find(c => c.startsWith('to-')) || 'to-amber-600';
                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl border-2 border-slate-900 shadow-xl select-none shrink-0",
                          fromClass, toClass
                        )}>
                          {avEmoji}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none truncate pr-1">
                            {activePlayer?.name || 'JOUEUR'}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="bg-amber-500/15 text-amber-accent px-1.5 py-0.5 rounded border border-amber-500/20 font-black tracking-tight leading-none text-[8px] uppercase">
                              {avName}
                            </span>
                            <span className="text-[8px] tracking-widest text-slate-500 font-bold uppercase">PROFIL ACTIF</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {currentPlayerId && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResetPlayer(currentPlayerId)}
                        className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg hover:border-amber-accent hover:bg-amber-500/10 transition-all active:scale-90 group"
                        title="Réinitialiser les scores du profil"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-accent transition-colors" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(currentPlayerId)}
                        className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all active:scale-90 group"
                        title="Supprimer ce profil"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="bg-slate-800/60 p-2.5 border border-white/5 rounded-lg text-center flex flex-col justify-center min-w-0">
                    <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider mb-1 block truncate">PARTIES</span>
                    <p className="text-base font-black text-white leading-none">
                      {players.find(p => p.id === currentPlayerId)?.gamesPlayed || 0}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 border border-white/5 rounded-lg text-center flex flex-col justify-center min-w-0">
                    <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider mb-1 block truncate">RECORD</span>
                    <p className="text-base font-black text-amber-accent leading-none">
                      {players.find(p => p.id === currentPlayerId)?.highScore || 0}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 border border-white/5 rounded-lg text-center flex flex-col justify-center min-w-0">
                    <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider mb-1 block truncate font-black">MEILL. NIV.</span>
                    <p className="text-[9px] font-black text-white uppercase leading-none truncate mt-0.5">
                      {(() => {
                        const scoreStage = players.find(p => p.id === currentPlayerId)?.maxStageReached;
                        if (!scoreStage) return 'NÉANT';
                        if (scoreStage === 'VICTORY') return 'VICTOIRE';
                        if (scoreStage === 'STAGE3') return 'MANCHE 3';
                        if (scoreStage === 'STAGE2') return 'MANCHE 2';
                        if (scoreStage === 'STAGE1') return 'MANCHE 1';
                        return scoreStage.replace('STAGE', 'MANCHE ');
                      })()}
                    </p>
                  </div>
                </div>

                {/* CONFIGURATION (AFFICHAGE ET SERVEUR EN FORMAT CONDENSÉ) */}
                <div className="mb-5 p-3 bg-slate-900/50 border border-white/5 rounded-xl flex flex-col gap-2.5">
                  {/* AFFICHAGE */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Affichage</span>
                    </div>
                    <div className="flex bg-black/40 p-0.5 rounded-lg border border-slate-700/60 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleDisplayMode('computer')}
                        className={cn(
                          "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                          displayMode === 'computer'
                            ? "bg-amber-500/20 text-amber-accent border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                            : "text-slate-400 hover:text-white"
                        )}
                      >
                        ORDINATEUR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleDisplayMode('phone')}
                        className={cn(
                          "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                          displayMode === 'phone'
                            ? "bg-amber-500/20 text-amber-accent border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                            : "text-slate-400 hover:text-white"
                        )}
                      >
                        TÉLÉPHONE
                      </button>
                    </div>
                  </div>

                  {/* CONNEXION / SERVEUR */}
                  <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      {offlineMode ? (
                        <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Wifi className="w-3.5 h-3.5 text-amber-accent animate-pulse" />
                      )}
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Données SQL/IA</span>
                    </div>
                    <div className="flex bg-black/40 p-0.5 rounded-lg border border-slate-700/60 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleOfflineMode(false)}
                        className={cn(
                          "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                          !offlineMode
                            ? "bg-amber-500/20 text-amber-accent border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                            : "text-slate-400 hover:text-white"
                        )}
                      >
                        EN LIGNE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleOfflineMode(true)}
                        className={cn(
                          "px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all",
                          offlineMode
                            ? "bg-amber-500/20 text-amber-accent border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                            : "text-slate-400 hover:text-white"
                        )}
                      >
                        HORS-LIGNE
                      </button>
                    </div>
                  </div>
                </div>


                {players.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-2 px-1 flex items-center gap-2">
                      <Users className="w-3 h-3 text-amber-accent" /> COMPTES DE JEUX ({players.length})
                    </p>
                    <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                      {/* BOUTON AJOUTER NOUVEAU JOUEUR */}
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setGameState(prev => ({ ...prev, stage: 'PLAYER_SETUP' }));
                        }}
                        className="flex items-center gap-1 flex-shrink-0 px-2.5 py-2 rounded-sm text-[9px] font-black uppercase tracking-tight italic transition-all bg-amber-500/15 border border-amber-500/30 text-amber-accent hover:bg-amber-500/30 active:scale-95 shadow-md"
                      >
                        <Plus className="w-3 h-3 text-amber-accent animate-pulse" />
                        <span>NOUVEAU JOUEUR</span>
                      </button>

                      {players.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            playSound('click');
                            selectPlayer(p.id);
                          }}
                          className={cn(
                            "flex items-center gap-1.5 flex-shrink-0 px-2.5 py-2 rounded-sm text-[9px] font-black uppercase tracking-tight italic transition-all",
                            currentPlayerId === p.id 
                              ? "bg-amber-accent text-black font-extrabold" 
                              : "bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700/80"
                          )}
                        >
                          <span className="text-[11px] select-none">{p.avatarEmoji || "👤"}</span>
                          <span>{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={startGame}
                  disabled={!currentPlayerId}
                  className={cn(
                    "w-full py-5 text-white font-black uppercase tracking-widest rounded-sm transition-all",
                    currentPlayerId 
                      ? "bg-gradient-to-r from-electric-blue to-studio-blue shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95" 
                      : "bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed"
                  )}
                >
                  {currentPlayerId ? "Entrer sur scène" : "Veuillez choisir un profil"}
                </button>
              </div>
            </motion.div>
          )}

          {gameState.stage === 'STAGE1' && (
            activeTransitionStage === 'STAGE1' ? (
              <BibleTipTransition stage="STAGE1" tip={currentTip} />
            ) : (
              <motion.div
                key="stage1"
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: -20 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="w-full flex flex-col items-center"
              >
                <Stage1 
                  playerName={players.find(p => p.id === currentPlayerId)?.name || "Moi"} 
                  onComplete={(pts) => nextStage(pts)} 
                  offlineMode={offlineMode}
                />
              </motion.div>
            )
          )}

          {gameState.stage === 'STAGE2' && (
            activeTransitionStage === 'STAGE2' ? (
              <BibleTipTransition stage="STAGE2" tip={currentTip} />
            ) : (
              <motion.div
                key="stage2"
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: -20 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="w-full flex flex-col items-center"
              >
                <Stage2 
                  playerName={players.find(p => p.id === currentPlayerId)?.name || "Moi"} 
                  onComplete={(pts) => nextStage(pts)} 
                  offlineMode={offlineMode}
                />
              </motion.div>
            )
          )}

          {gameState.stage === 'STAGE3' && (
            activeTransitionStage === 'STAGE3' ? (
              <BibleTipTransition stage="STAGE3" tip={currentTip} />
            ) : (
              <motion.div
                key="stage3"
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: -20 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="w-full flex flex-col items-center"
              >
                <Stage3 
                  playerName={players.find(p => p.id === currentPlayerId)?.name || "Moi"}
                  opponentName={localStorage.getItem('alliance_quiz_opponent_name') || "Julie"}
                  opponentColor={localStorage.getItem('alliance_quiz_opponent_color') || "#14b8a6"}
                  onComplete={(pts) => handleGameOver(pts >= 15)} 
                  offlineMode={offlineMode}
                />
              </motion.div>
            )
          )}

          {gameState.stage === 'VICTORY' && (() => {
            const sortedPlayers = [...players].sort((a, b) => b.highScore - a.highScore);
            const firstPlace = sortedPlayers[0] || null;
            const secondPlace = sortedPlayers[1] || null;
            const thirdPlace = sortedPlayers[2] || null;
            const rank = sortedPlayers.findIndex(p => p.id === currentPlayerId) + 1;

            return (
              <motion.div 
                key="victory" 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 14 }}
                className="w-full text-center flex flex-col items-center"
              >
                {/* Top Celebration Logo */}
                <div className="relative mb-2">
                  <Trophy className="w-16 h-16 text-amber-500 mx-auto drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-bounce" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute -inset-1 border-2 border-dashed border-amber-500/30 rounded-full pointer-events-none scale-125"
                  />
                </div>

                <h1 className="text-3xl font-serif font-black text-amber-500 uppercase italic tracking-tighter mb-1 select-none">
                  Triomphe !
                </h1>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black mb-3.5">
                  Félicitations pour votre parcours sans faute
                </p>

                {/* Score Summary Card */}
                <div className="glass-panel p-3 border-amber-500/35 mb-4 w-full flex items-center justify-around bg-gradient-to-r from-amber-950/20 via-black/40 to-amber-950/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Votre Score</span>
                    <span className="text-2xl font-mono text-amber-accent font-black tracking-tighter">{gameState.score} pts</span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Rang Général</span>
                    <span className="text-xl font-mono text-white font-extrabold italic tracking-tight">
                      {rank > 0 ? `${rank}${rank === 1 ? 'er' : 'e'}` : 'Néant'} / {players.length}
                    </span>
                  </div>
                </div>

                {/* Visual 3D Podium Frame */}
                <div className="w-full flex items-end justify-center h-44 px-2 mb-4 bg-gradient-to-t from-black/50 to-transparent rounded-2xl border border-white/5 p-4 overflow-hidden relative">
                  {/* Glowing halo behind 1st spot */}
                  <div className="absolute top-8 left-[calc(50%-32px)] w-16 h-16 bg-amber-500/20 blur-2xl rounded-full animate-pulse pointer-events-none" />

                  {/* 2nd Place Step - Left */}
                  <div className="flex flex-col items-center flex-1 z-10 px-1">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 180, damping: 11, delay: 0.5 }}
                      className="flex flex-col items-center justify-center max-w-full"
                    >
                      <div className="flex items-center gap-1 mb-1 justify-center max-w-full">
                        <span className="text-sm select-none shrink-0">{secondPlace?.avatarEmoji || "👤"}</span>
                        <div className="text-[9px] font-black text-slate-300 truncate select-none italic uppercase">
                          {secondPlace ? secondPlace.name : '---'}
                        </div>
                      </div>
                      {secondPlace && (
                        <div className="text-[8px] font-mono text-sky-400 font-bold mb-1 leading-none">
                          {secondPlace.highScore} pts
                        </div>
                      )}
                    </motion.div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: '48px' }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 140, 
                        damping: 8, 
                        mass: 0.85, 
                        delay: 0.3 
                      }}
                      className="w-full bg-gradient-to-b from-slate-500 via-slate-600 to-slate-800 rounded-t-lg border-t border-slate-400 flex flex-col items-center justify-center relative shadow-lg"
                    >
                      <span className="text-lg font-black text-slate-300 drop-shadow-md">2</span>
                      <div className="absolute inset-x-0 bottom-1 flex justify-center">
                        <div className="w-4 h-4 rounded-full bg-slate-400/20 flex items-center justify-center">
                          <span className="text-[8px] text-slate-300 font-black">🥈</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* 1st Place Step - Center */}
                  <div className="flex flex-col items-center flex-1 z-10 px-1 scale-110 origin-bottom transform translate-y-[-2px]">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.4, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 180, damping: 11, delay: 0.3 }}
                      className="flex flex-col items-center justify-center max-w-full relative"
                    >
                      <div className="absolute -top-4 text-xs animate-bounce" style={{ animationDuration: '3s' }}>👑</div>
                      <div className="flex items-center gap-1 mb-1 justify-center max-w-full">
                        <span className="text-sm select-none shrink-0">{firstPlace?.avatarEmoji || "👤"}</span>
                        <div className="text-[9px] font-black text-amber-accent truncate select-none italic uppercase">
                          {firstPlace ? firstPlace.name : '---'}
                        </div>
                      </div>
                      {firstPlace && (
                        <div className="text-[8px] font-mono text-amber-400 font-bold mb-1 leading-none">
                          {firstPlace.highScore} pts
                        </div>
                      )}
                    </motion.div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: '76px' }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 140, 
                        damping: 8, 
                        mass: 0.85, 
                        delay: 0.1 
                      }}
                      className="w-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 rounded-t-lg border-t-2 border-yellow-300 flex flex-col items-center justify-center relative shadow-[0_4px_20px_rgba(245,158,11,0.3)]"
                    >
                      <span className="text-xl font-black text-black drop-shadow-md">1</span>
                      <div className="absolute inset-x-0 bottom-1 flex justify-center">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                          <span className="text-[9px] text-white font-black">🥇</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* 3rd Place Step - Right */}
                  <div className="flex flex-col items-center flex-1 z-10 px-1">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 180, damping: 11, delay: 0.7 }}
                      className="flex flex-col items-center justify-center max-w-full"
                    >
                      <div className="flex items-center gap-1 mb-1 justify-center max-w-full">
                        <span className="text-sm select-none shrink-0">{thirdPlace?.avatarEmoji || "👤"}</span>
                        <div className="text-[9px] font-black text-amber-600 truncate select-none italic uppercase">
                          {thirdPlace ? thirdPlace.name : '---'}
                        </div>
                      </div>
                      {thirdPlace && (
                        <div className="text-[8px] font-mono text-amber-500 font-bold mb-1 leading-none">
                          {thirdPlace.highScore} pts
                        </div>
                      )}
                    </motion.div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: '36px' }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 140, 
                        damping: 8, 
                        mass: 0.85, 
                        delay: 0.5 
                      }}
                      className="w-full bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 rounded-t-lg border-t border-amber-600 flex flex-col items-center justify-center relative shadow-lg"
                    >
                      <span className="text-base font-black text-amber-500 drop-shadow-md">3</span>
                      <div className="absolute inset-x-0 bottom-1 flex justify-center">
                        <div className="w-4 h-4 rounded-full bg-amber-800/20 flex items-center justify-center">
                          <span className="text-[8px] text-amber-500 font-black">🥉</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Local Leaderboard List */}
                <div className="w-full glass-panel p-3 border-slate-800 flex flex-col text-left mb-5">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5">
                    <Users className="w-4 h-4 text-amber-accent" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Classement des Sages ({players.length})</span>
                  </div>
                  
                  <div className="max-h-[140px] overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin">
                    {sortedPlayers.map((playerItem, index) => {
                      const isCurrent = playerItem.id === currentPlayerId;
                      return (
                        <div 
                          key={playerItem.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg text-xs font-sans transition-all border",
                            isCurrent 
                              ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                              : "bg-black/20 border-white/5"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Medal badge or index */}
                            <span className={cn(
                              "w-5 h-5 flex items-center justify-center font-bold text-[10px] rounded-full shrink-0",
                              index === 0 ? "bg-amber-400 text-black shadow-inner" :
                              index === 1 ? "bg-slate-500 text-white" :
                              index === 2 ? "bg-amber-800 text-slate-100" :
                              "text-slate-500 bg-slate-800/40"
                            )}>
                              {index + 1}
                            </span>
                            <span className="text-sm select-none shrink-0">
                              {playerItem.avatarEmoji || "👤"}
                            </span>
                            <span className={cn(
                              "truncate uppercase font-bold tracking-tight italic",
                              isCurrent ? "text-amber-accent" : "text-white"
                            )}>
                              {playerItem.name} {isCurrent && <span className="text-[8px] not-italic text-amber-400/70 ml-1 font-sans font-medium">(Vous)</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-[9px] text-slate-400 font-medium">Niv. max: <span className="font-bold text-white uppercase">{playerItem.maxStageReached.replace('STAGE', 'MANCHE ')}</span></span>
                            <span className="font-mono font-black text-amber-accent leading-none">{playerItem.highScore} pts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => handleShareResult(gameState.score, true)}
                    className="w-full py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold uppercase text-xs tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 border border-white/10 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {shareCopied ? (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-accent animate-pulse" />
                        <span>Copié dans le presse-papiers !</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-slate-400" />
                        <span>Partager le résultat</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      playSound('click');
                      setGameState({ stage: 'INTRO', score: 0, currentPoints: 0 });
                    }}
                    className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase text-xs tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(245,158,11,0.3)] metal-border flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '6s' }} />
                    Nouvelle émission / Retour
                  </button>
                </div>
              </motion.div>
            );
          })()}

          {gameState.stage === 'DEFEAT' && (
            <motion.div 
              key="defeat" 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 14 }}
              className="w-full text-center flex flex-col items-center"
            >
              <div className="relative mb-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute -inset-1 border-2 border-dashed border-red-500/20 rounded-full pointer-events-none scale-125"
                />
              </div>

              <h1 className="text-3xl font-serif font-black text-red-500 uppercase italic tracking-tighter mb-2 select-none">
                Persévérance...
              </h1>
              <p className="text-sm text-slate-300 font-medium mb-6 text-balance max-w-sm">
                Le chemin de la sagesse chrétienne est parsemé d'études. Ne baissez pas les bras et continuez l'enseignement !
              </p>

              {/* Score Display */}
              <div className="glass-panel p-4 border-red-500/25 mb-6 w-full bg-gradient-to-r from-red-950/10 via-black/40 to-red-950/10 relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Votre Score Final</span>
                <span className="text-3xl font-mono text-red-400 font-black tracking-tighter">{gameState.score} pts</span>
              </div>

              {/* Share and Action buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => handleShareResult(gameState.score, false)}
                  className="w-full py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold uppercase text-xs tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 border border-white/10 flex items-center justify-center gap-2 shadow-lg"
                >
                  {shareCopied ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-accent animate-pulse" />
                      <span>Copié dans le presse-papiers !</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-400" />
                      <span>Partager le résultat</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    setGameState({ stage: 'INTRO', score: 0, currentPoints: 0 });
                  }}
                  className="w-full py-4 bg-gradient-to-b from-slate-200 to-slate-450 hover:from-white hover:to-slate-350 text-slate-950 font-black uppercase text-xs tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-slate-950 animate-pulse" />
                  Réessayer / Retour
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Message - Special Beveled Style from Reference */}
      <footer className="h-20 bg-black/60 border-t border-white/10 px-6 flex items-center z-50 relative overflow-hidden">
        {/* Beveled Green Bar from Reference image bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-1 bg-gradient-to-r from-green-900 via-green-500 to-green-900 rounded-t-full shadow-[0_-5px_15px_rgba(34,197,94,0.4)]" />
        
        <div className="flex-1 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center border border-white/10 shadow-inner metal-border">
            <span className="text-lg">📺</span>
          </div>
          <div>
            <p className="text-white font-sans font-bold italic text-sm md:text-base leading-tight uppercase tracking-tight">
              {gameState.stage === 'INTRO' 
                ? "\"QUE LA SAGESSE VOUS GUIDE\""
                : gameState.stage === 'STAGE1' 
                  ? "\"SOYEZ RAPIDE, SOYEZ PRÉCIS.\""
                  : gameState.stage === 'STAGE2'
                    ? "\"CHOISISSEZ VOTRE DESTIN.\""
                    : "\"C'EST L'HEURE DE VÉRITÉ.\""}
            </p>
            <p className="text-[8px] text-amber-accent uppercase tracking-[0.3em] mt-0.5 font-black">RÉPI DU CHRÉTIEN</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => {
              toggleMute();
              playSound('click');
            }}
            className={cn(
              "p-1.5 rounded border-2 flex flex-col items-center w-16 transition-all active:scale-95 metal-border",
              isMuted ? "bg-red-950/40 border-red-500/50" : "bg-slate-800/80 border-slate-700 hover:border-amber-accent/50"
            )}
          >
            <span className="text-[7px] text-slate-400 uppercase mb-0.5 font-black tracking-widest leading-none">AUDIO</span>
            <div className="flex items-center gap-1">
              {isMuted ? (
                <>
                  <Volume2 className="w-3 h-3 text-red-500 opacity-50" />
                  <span className="text-[8px] text-red-500 font-mono font-black uppercase">OFF</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-amber-accent" />
                  <span className="text-[8px] text-amber-accent font-mono font-black uppercase">LIVE</span>
                </>
              )}
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AudioProvider>
        <GameContent />
      </AudioProvider>
    </ErrorBoundary>
  );
}
