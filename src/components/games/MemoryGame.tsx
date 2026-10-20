import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { Language, Sticker } from '../../types';
import { t } from '../../utils/i18n';
import { soundManager } from '../../utils/sound';
import { CelebrationModal } from '../CelebrationModal';

interface MemoryCard {
  id: number;
  itemKey: string;
  emoji: string;
  name: { id: string; en: string };
  isFlipped: boolean;
  isMatched: boolean;
}

const THEMES = {
  animals: [
    { key: 'cat', emoji: '🐱', name: { id: 'Kucing', en: 'Cat' } },
    { key: 'dog', emoji: '🐶', name: { id: 'Anjing', en: 'Dog' } },
    { key: 'lion', emoji: '🦁', name: { id: 'Singa', en: 'Lion' } },
    { key: 'elephant', emoji: '🐘', name: { id: 'Gajah', en: 'Elephant' } },
    { key: 'panda', emoji: '🐼', name: { id: 'Panda', en: 'Panda' } },
    { key: 'frog', emoji: '🐸', name: { id: 'Katak', en: 'Frog' } },
    { key: 'rabbit', emoji: '🐰', name: { id: 'Kelinci', en: 'Bunny' } },
    { key: 'monkey', emoji: '🐵', name: { id: 'Monyet', en: 'Monkey' } },
  ],
  fruits: [
    { key: 'apple', emoji: '🍎', name: { id: 'Apel', en: 'Apple' } },
    { key: 'banana', emoji: '🍌', name: { id: 'Pisang', en: 'Banana' } },
    { key: 'strawberry', emoji: '🍓', name: { id: 'Stroberi', en: 'Strawberry' } },
    { key: 'grape', emoji: '🍇', name: { id: 'Anggur', en: 'Grapes' } },
    { key: 'watermelon', emoji: '🍉', name: { id: 'Semangka', en: 'Watermelon' } },
    { key: 'orange', emoji: '🍊', name: { id: 'Jeruk', en: 'Orange' } },
    { key: 'pineapple', emoji: '🍍', name: { id: 'Nanas', en: 'Pineapple' } },
    { key: 'cherry', emoji: '🍒', name: { id: 'Ceri', en: 'Cherry' } },
  ],
  vehicles: [
    { key: 'car', emoji: '🚗', name: { id: 'Mobil', en: 'Car' } },
    { key: 'rocket', emoji: '🚀', name: { id: 'Roket', en: 'Rocket' } },
    { key: 'plane', emoji: '✈️', name: { id: 'Pesawat', en: 'Airplane' } },
    { key: 'train', emoji: '🚂', name: { id: 'Kereta', en: 'Train' } },
    { key: 'boat', emoji: '⛵', name: { id: 'Perahu', en: 'Boat' } },
    { key: 'bike', emoji: '🚲', name: { id: 'Sepeda', en: 'Bicycle' } },
    { key: 'helicopter', emoji: '🚁', name: { id: 'Helikopter', en: 'Helicopter' } },
    { key: 'ufo', emoji: '🛸', name: { id: 'Piring Terbang', en: 'UFO' } },
  ]
};

type ThemeKey = keyof typeof THEMES;
type Difficulty = 'easy' | 'medium' | 'hard';

interface MemoryGameProps {
  lang: Language;
  onReward: (stars: number) => { newTotal: number; newlyUnlocked: Sticker[] };
  onHome: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ lang, onReward, onHome }) => {
  const [theme, setTheme] = useState<ThemeKey>('animals');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newStickers, setNewStickers] = useState<Sticker[]>([]);
  const [starsAwarded, setStarsAwarded] = useState(0);

  const totalPairs = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 8;

  const initGame = () => {
    const pool = THEMES[theme].slice(0, totalPairs);
    const deck: MemoryCard[] = [];
    
    pool.forEach((item, idx) => {
      deck.push({
        id: idx * 2,
        itemKey: item.key,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: idx * 2 + 1,
        itemKey: item.key,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
    setShowCelebration(false);
  };

  useEffect(() => {
    initGame();
  }, [theme, difficulty]);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    soundManager.playClick();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(prev => prev + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.itemKey === secondCard.itemKey) {
        // Matched!
        setTimeout(() => {
          soundManager.playSuccess();
          soundManager.speak(firstCard.name[lang], lang);
          
          setCards(prev => prev.map((c, i) => {
            if (i === firstIdx || i === secondIdx) {
              return { ...c, isMatched: true };
            }
            return c;
          }));
          
          const newMatchCount = matches + 1;
          setMatches(newMatchCount);
          setFlippedIndices([]);
          setIsLocked(false);

          if (newMatchCount === totalPairs) {
            // Won game!
            const stars = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
            setStarsAwarded(stars);
            const { newlyUnlocked } = onReward(stars);
            setNewStickers(newlyUnlocked);
            setTimeout(() => {
              setShowCelebration(true);
            }, 500);
          }
        }, 400);
      } else {
        // Not matched
        setTimeout(() => {
          soundManager.playPop();
          setCards(prev => prev.map((c, i) => {
            if (i === firstIdx || i === secondIdx) {
              return { ...c, isFlipped: false };
            }
            return c;
          }));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner & Controls */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
              <span>🃏</span> {t(lang, 'gameMemoryTitle')}
            </h2>
            <p className="text-sm font-bold text-amber-800">
              {t(lang, 'gameMemoryDesc')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-100 px-3.5 py-1.5 rounded-2xl border-2 border-amber-300 font-extrabold text-amber-900 text-sm">
              {t(lang, 'score')}: {matches} / {totalPairs}
            </div>
            <div className="bg-sky-100 px-3.5 py-1.5 rounded-2xl border-2 border-sky-300 font-extrabold text-sky-900 text-sm">
              Langkah: {moves}
            </div>
          </div>
        </div>

        {/* Filter / Category Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-amber-100">
          {/* Difficulty pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
              Level:
            </span>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => {
                  soundManager.playPop();
                  setDifficulty(d);
                }}
                className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
                  difficulty === d
                    ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                    : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
                }`}
              >
                {t(lang, d)}
              </button>
            ))}
          </div>

          {/* Theme pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
              {t(lang, 'theme')}:
            </span>
            {(['animals', 'fruits', 'vehicles'] as ThemeKey[]).map(th => (
              <button
                key={th}
                onClick={() => {
                  soundManager.playPop();
                  setTheme(th);
                }}
                className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
                  theme === th
                    ? 'bg-purple-500 border-purple-600 text-white shadow-sm'
                    : 'bg-white border-purple-200 text-purple-800 hover:bg-purple-50'
                }`}
              >
                {t(lang, th)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div
        className={`grid gap-3 sm:gap-4 mx-auto ${
          difficulty === 'easy'
            ? 'grid-cols-3 max-w-md'
            : difficulty === 'medium'
            ? 'grid-cols-3 sm:grid-cols-4 max-w-xl'
            : 'grid-cols-4 max-w-2xl'
        }`}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(idx)}
            className={`relative aspect-[3/4] cursor-pointer rounded-2xl sm:rounded-3xl transition-transform duration-300 transform perspective-1000 ${
              card.isMatched
                ? 'scale-95 opacity-80 pointer-events-none'
                : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div
              className={`w-full h-full rounded-2xl sm:rounded-3xl border-4 transition-all duration-300 flex flex-col items-center justify-center p-2 shadow-lg ${
                card.isFlipped || card.isMatched
                  ? 'bg-white border-yellow-400 rotate-y-180'
                  : 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border-amber-300'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <div className="flex flex-col items-center justify-center animate-scaleUp">
                  <span className="text-4xl sm:text-6xl drop-shadow filter mb-1">
                    {card.emoji}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-950 text-center leading-tight">
                    {card.name[lang]}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white/90">
                  <span className="text-3xl sm:text-5xl drop-shadow-sm font-black">?</span>
                  <Sparkles className="w-4 h-4 text-white/70 mt-1" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Replay Quick Action */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            soundManager.playClick();
            initGame();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 border-2 border-amber-400 font-black text-amber-950 shadow-sm transition-all active:scale-95"
        >
          <span>🔄 Acak Ulang Kartu</span>
        </button>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        starsEarned={starsAwarded}
        newStickers={newStickers}
        lang={lang}
        onReplay={initGame}
        onNext={() => {
          if (difficulty === 'easy') setDifficulty('medium');
          else if (difficulty === 'medium') setDifficulty('hard');
          else initGame();
        }}
        onHome={onHome}
      />
    </div>
  );
};
