export type Language = 'id' | 'en';

export type GameId = 
  | 'memory' 
  | 'math' 
  | 'shapes' 
  | 'spelling' 
  | 'balloon' 
  | 'coloring' 
  | 'stickers';

export interface Sticker {
  id: string;
  name: { id: string; en: string };
  emoji: string;
  category: 'animals' | 'space' | 'food' | 'nature';
  unlocked: boolean;
  requiredStars: number;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export interface UserProgress {
  stars: number;
  unlockedStickers: string[];
  placedStickers: PlacedSticker[];
  currentScene: string;
  highScores: Record<string, number>;
}
