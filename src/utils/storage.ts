import { Sticker, UserProgress, PlacedSticker } from '../types';

export const ALL_STICKERS: Sticker[] = [
  { id: 'cat', name: { id: 'Kucing Manis', en: 'Sweet Cat' }, emoji: '🐱', category: 'animals', unlocked: true, requiredStars: 0 },
  { id: 'dog', name: { id: 'Anjing Setia', en: 'Happy Dog' }, emoji: '🐶', category: 'animals', unlocked: true, requiredStars: 0 },
  { id: 'panda', name: { id: 'Panda Lucu', en: 'Cute Panda' }, emoji: '🐼', category: 'animals', unlocked: false, requiredStars: 3 },
  { id: 'lion', name: { id: 'Singa Berani', en: 'Brave Lion' }, emoji: '🦁', category: 'animals', unlocked: false, requiredStars: 6 },
  { id: 'elephant', name: { id: 'Gajah Ceria', en: 'Happy Elephant' }, emoji: '🐘', category: 'animals', unlocked: false, requiredStars: 9 },
  { id: 'rabbit', name: { id: 'Kelinci Imut', en: 'Cute Bunny' }, emoji: '🐰', category: 'animals', unlocked: false, requiredStars: 12 },
  { id: 'dino', name: { id: 'Dino Cilik', en: 'Baby Dino' }, emoji: '🦕', category: 'animals', unlocked: false, requiredStars: 15 },
  { id: 'dolphin', name: { id: 'Lumba-lumba', en: 'Dolphin' }, emoji: '🐬', category: 'animals', unlocked: false, requiredStars: 18 },
  
  { id: 'rocket', name: { id: 'Roket Cepat', en: 'Speedy Rocket' }, emoji: '🚀', category: 'space', unlocked: false, requiredStars: 5 },
  { id: 'star_smile', name: { id: 'Bintang Emas', en: 'Golden Star' }, emoji: '⭐', category: 'space', unlocked: true, requiredStars: 0 },
  { id: 'astronaut', name: { id: 'Astronot Cilik', en: 'Little Astronaut' }, emoji: '👨‍🚀', category: 'space', unlocked: false, requiredStars: 10 },
  { id: 'ufo', name: { id: 'Piring Terbang', en: 'Flying UFO' }, emoji: '🛸', category: 'space', unlocked: false, requiredStars: 16 },
  { id: 'saturn', name: { id: 'Planet Cantik', en: 'Pretty Planet' }, emoji: '🪐', category: 'space', unlocked: false, requiredStars: 22 },

  { id: 'icecream', name: { id: 'Es Krim Lezat', en: 'Yummy Ice Cream' }, emoji: '🍦', category: 'food', unlocked: true, requiredStars: 0 },
  { id: 'cupcake', name: { id: 'Kue Cupcake', en: 'Cupcake' }, emoji: '🧁', category: 'food', unlocked: false, requiredStars: 4 },
  { id: 'strawberry', name: { id: 'Stroberi Manis', en: 'Strawberry' }, emoji: '🍓', category: 'food', unlocked: false, requiredStars: 8 },
  { id: 'watermelon', name: { id: 'Semangka Segar', en: 'Watermelon' }, emoji: '🍉', category: 'food', unlocked: false, requiredStars: 14 },
  { id: 'lollipop', name: { id: 'Permen Pelangi', en: 'Lollipop' }, emoji: '🍭', category: 'food', unlocked: false, requiredStars: 20 },

  { id: 'rainbow', name: { id: 'Pelangi Indah', en: 'Magic Rainbow' }, emoji: '🌈', category: 'nature', unlocked: false, requiredStars: 7 },
  { id: 'unicorn', name: { id: 'Unicorn Ajaib', en: 'Magic Unicorn' }, emoji: '🦄', category: 'nature', unlocked: false, requiredStars: 25 },
  { id: 'flower', name: { id: 'Bunga Mekar', en: 'Bloomy Flower' }, emoji: '🌸', category: 'nature', unlocked: true, requiredStars: 0 },
  { id: 'crown', name: { id: 'Mahkota Juara', en: 'Winner Crown' }, emoji: '👑', category: 'nature', unlocked: false, requiredStars: 30 },
];

const STORAGE_KEY = 'dunia_pintar_progress_v1';

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return {
      stars: 5,
      unlockedStickers: ['cat', 'dog', 'star_smile', 'icecream', 'flower'],
      placedStickers: [
        { id: 'init-1', stickerId: 'cat', emoji: '🐱', x: 25, y: 65, scale: 1.2, rotation: 0 },
        { id: 'init-2', stickerId: 'flower', emoji: '🌸', x: 75, y: 70, scale: 1, rotation: 10 },
      ],
      currentScene: 'meadow',
      highScores: {}
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data;
    }
  } catch {
    // fallback
  }

  const initial: UserProgress = {
    stars: 5,
    unlockedStickers: ['cat', 'dog', 'star_smile', 'icecream', 'flower'],
    placedStickers: [
      { id: 'init-1', stickerId: 'cat', emoji: '🐱', x: 25, y: 65, scale: 1.2, rotation: 0 },
      { id: 'init-2', stickerId: 'flower', emoji: '🌸', x: 75, y: 70, scale: 1, rotation: 10 },
    ],
    currentScene: 'meadow',
    highScores: {}
  };
  saveProgress(initial);
  return initial;
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function addStars(count: number): { newTotal: number; newlyUnlocked: Sticker[] } {
  const current = loadProgress();
  const prevStars = current.stars;
  const newTotal = prevStars + count;
  current.stars = newTotal;

  // Check stickers to unlock
  const newlyUnlocked: Sticker[] = [];
  ALL_STICKERS.forEach(s => {
    if (!current.unlockedStickers.includes(s.id) && newTotal >= s.requiredStars) {
      current.unlockedStickers.push(s.id);
      newlyUnlocked.push(s);
    }
  });

  saveProgress(current);
  return { newTotal, newlyUnlocked };
}

export function savePlacedStickers(stickers: PlacedSticker[], scene: string): void {
  const current = loadProgress();
  current.placedStickers = stickers;
  current.currentScene = scene;
  saveProgress(current);
}
