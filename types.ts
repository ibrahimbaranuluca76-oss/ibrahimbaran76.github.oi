export enum GameState {
  IDLE = 'IDLE',             // Menu / Start screen
  SHOWING_BALL = 'SHOWING',  // Revealing ball location before shuffling
  SHUFFLING = 'SHUFFLING',   // Cups are moving
  GUESSING = 'GUESSING',     // User can click
  REVEAL = 'REVEAL',         // Showing result
}

export interface CupData {
  id: number;
  hasBall: boolean;
}