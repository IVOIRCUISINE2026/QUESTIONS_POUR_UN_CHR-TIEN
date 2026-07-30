
export interface Question {
  id: string;
  question: string;
  answer: string;
  category?: string;
  difficulty?: number;
  choices?: string[];
}

export interface FaceOffQuestion {
  id: string;
  answer: string;
  clues: string[];
  explanation?: string;
}

export type GameStage = 'INTRO' | 'PLAYER_SETUP' | 'PROFILE' | 'STAGE1' | 'STAGE2' | 'STAGE3' | 'VICTORY' | 'DEFEAT';

export interface Player {
  id: string;
  name: string;
  gamesPlayed: number;
  maxStageReached: GameStage;
  highScore: number;
  avatarEmoji?: string;
  avatarColor?: string;
  avatarName?: string;
  scoresHistory?: Array<{ score: number; date: string; stageReached: GameStage }>;
}

export interface GameState {
  stage: GameStage;
  score: number;
  currentPoints: number;
  playerId?: string;
}
