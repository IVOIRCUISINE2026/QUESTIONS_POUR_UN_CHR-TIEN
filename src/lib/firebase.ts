import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { Player, GameState } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with long polling enabled to prevent WebSocket connections from timing out in containerized/iframe preview boxes
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

// Basic online status checker
let isOnline = true;

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    isOnline = true;
    console.log("Firebase Connection Active.");
  } catch (error) {
    isOnline = false;
    console.warn("Firebase unconfigured or offline. Falling back silently to local storage.");
  }
}
testConnection();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  
  if (errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('insufficient')) {
    isOnline = false;
    console.warn(`[Firebase Fallback Mode] Action "${operationType}" on "${path}" is restricted by database security policy. Falling back entirely to Local Storage.`);
    return;
  }
  
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: null, // Non Auth app
    },
    operationType,
    path
  };
  console.warn('Firestore Fallback Details: ', JSON.stringify(errInfo));
  isOnline = false;
}

/**
 * Save player profile to Firestore (and keep in sync)
 */
export async function savePlayerToFirestore(player: Player): Promise<void> {
  if (!isOnline) return;
  const path = `players/${player.id}`;
  try {
    const playerRef = doc(db, 'players', player.id);
    await setDoc(playerRef, {
      id: player.id,
      name: player.name,
      gamesPlayed: player.gamesPlayed,
      maxStageReached: player.maxStageReached,
      highScore: player.highScore,
      avatarEmoji: player.avatarEmoji || "👤",
      avatarColor: player.avatarColor || "",
      avatarName: player.avatarName || "Pèlerin",
      scoresHistory: player.scoresHistory || []
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Fetch all player profiles from Firestore
 */
export async function getPlayersFromFirestore(): Promise<Player[]> {
  if (!isOnline) return [];
  const path = 'players';
  try {
    const querySnapshot = await getDocs(collection(db, 'players'));
    const players: Player[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      players.push({
        id: data.id,
        name: data.name,
        gamesPlayed: data.gamesPlayed || 0,
        maxStageReached: data.maxStageReached || 'INTRO',
        highScore: data.highScore || 0,
        avatarEmoji: data.avatarEmoji || "👤",
        avatarColor: data.avatarColor || "",
        avatarName: data.avatarName || "Pèlerin",
        scoresHistory: data.scoresHistory || []
      });
    });
    return players;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Delete a player profile from Firestore
 */
export async function deletePlayerFromFirestore(playerId: string): Promise<void> {
  if (!isOnline) return;
  const path = `players/${playerId}`;
  try {
    await deleteDoc(doc(db, 'players', playerId));
    // Also delete any existing save state for this player
    await deleteGameStateFromFirestore(playerId);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Persist Game State to Firestore
 */
export async function saveGameStateToFirestore(playerId: string, state: GameState): Promise<void> {
  if (!isOnline) return;
  const path = `saves/${playerId}`;
  try {
    await setDoc(doc(db, 'saves', playerId), {
      playerId,
      stage: state.stage,
      score: state.score,
      currentPoints: state.currentPoints,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Load Game State from Firestore
 */
export async function getGameStateFromFirestore(playerId: string): Promise<GameState | null> {
  if (!isOnline) return null;
  const path = `saves/${playerId}`;
  try {
    const docSnap = await getDoc(doc(db, 'saves', playerId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        stage: data.stage as any,
        score: data.score || 0,
        currentPoints: data.currentPoints || 0,
        playerId: data.playerId
      };
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

/**
 * Delete Game State from Firestore
 */
export async function deleteGameStateFromFirestore(playerId: string): Promise<void> {
  if (!isOnline) return;
  const path = `saves/${playerId}`;
  try {
    await deleteDoc(doc(db, 'saves', playerId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
