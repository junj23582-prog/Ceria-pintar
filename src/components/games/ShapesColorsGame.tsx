import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Language, Sticker } from '../../types';
import { t } from '../../utils/i18n';
import { soundManager } from '../../utils/sound';
import { CelebrationModal } from '../CelebrationModal';

interface ShapesColorsGameProps {
  lang: Language;
  onReward: (stars: number) => { newTotal: number; newlyUnlocked: Sticker[] };
  onHome: () => void;
}

interface ShapeItem {
  shapeId: string;
  shapeName: { id: string; en: string };
  colorId: string;
  colorName: { id: string; en: string };
  colorHex: string;
  svgPath: string;
}

const SHAPES = [
  {
    id: 'circle',
    name: { id: 'Lingkaran', en: 'Circle' },
    render: (color: string) => (
      <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill={color} stroke="#333" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'square',
    name: { id: 'Persegi', en: 'Square' },
    render: (color: string) => (
      <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" viewBox="0 0 100 100">
        <rect x="12" y="12" width="76" height="76" rx="12" fill={color} stroke="#333" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'triangle',
    name: { id: 'Segitiga', en: 'Triangle' },
    render: (color: string) => (
      <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" viewBox="0 0 100 100">
        <polygon points="50,12 88,85 12,85" strokeLinejoin="round" fill={color} stroke="#333" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'star',
    name: { id: 'Bintang', en: 'Star' },
    render: (color: string) => (
      <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" viewBox="0 0 100 100">
        <polygon
          points="50,5 64,36 98,38 72,60 81,94 50,75 19,94 28,60 2,38 36,36"
          strokeLinejoin="round"
          fill={color}
          stroke="#333"
          strokeWidth="4"
        />
      </svg>
    )
  },
  {
    id: 'heart',
    name: { id: 'Hati', en: 'Heart' },
    render: (color: string) => (
      <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" viewBox="0 0 100 100">
        <path
          d="M 50,30 A 20,20 0 0,0 15,48 C 15,75 50,92 50,92 C 50,92 85,75 85,48 A 20,20 0 0,0 50,30 Z"
          fill={color}
          stroke="#333"
          strokeWidth="4"
        />
      </svg>
    )
  },
  {
    id: 'diamond',
    name: { id: 'Belah Ketupat', en: 'Diamond' },
    render: (color: string) => (
      <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" viewBox="0 0 100 100">
        <polygon points="50,10 90,50 50,90 10,50" strokeLinejoin="round" fill={color} stroke="#333" strokeWidth="4" />
      </svg>
    )
  }
];

const COLORS = [
  { id: 'red', name: { id: 'Merah', en: 'Red' }, hex: '#EF4444' },
  { id: 'blue', name: { id: 'Biru', en: 'Blue' }, hex: '#3B82F6' },
  { id: 'yellow', name: { id: 'Kuning', en: 'Yellow' }, hex: '#FACC15' },
  { id: 'green', name: { id: 'Hijau', en: 'Green' }, hex: '#22C55E' },
  { id: 'purple', name: { id: 'Ungu', en: 'Purple' }, hex: '#A855F7' },
  { id: 'orange', name: { id: 'Oranye', en: 'Orange' }, hex: '#F97316' },
];

export const ShapesColorsGame: React.FC<ShapesColorsGameProps> = ({ lang, onReward, onHome }) => {
  const [round, setRound] = useState(1);
  const maxRounds = 5;

  const [targetShape, setTargetShape] = useState(SHAPES[0]);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [options, setOptions] = useState<Array<{ shape: typeof SHAPES[0]; color: typeof COLORS[0] }>>([]);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newStickers, setNewStickers] = useState<Sticker[]>([]);
  const [starsAwarded, setStarsAwarded] = useState(0);

  const generateRound = () => {
    setSelectedIndex(null);
    setIsCorrect(null);

    const chosenShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    setTargetShape(chosenShape);
    setTargetColor(chosenColor);

    // Create 4 distinct candidate options
    const generated: Array<{ shape: typeof SHAPES[0]; color: typeof COLORS[0] }> = [
      { shape: chosenShape, color: chosenColor }
    ];

    while (generated.length < 4) {
      const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      const alreadyExists = generated.some(g => g.shape.id === s.id && g.color.id === c.id);
      if (!alreadyExists) {
        generated.push({ shape: s, color: c });
      }
    }

    // Shuffle options
    setOptions(generated.sort(() => Math.random() - 0.5));

    // Voice announcement
    const textPrompt = lang === 'id'
      ? `Sentuh ${chosenShape.name.id} berwarna ${chosenColor.name.id}!`
      : `Touch the ${chosenColor.name.en} ${chosenShape.name.en}!`;
    soundManager.speak(textPrompt, lang);
  };

  useEffect(() => {
    generateRound();
  }, [round]);

  const handleSelect = (idx: number) => {
    if (isCorrect !== null) return;
    setSelectedIndex(idx);

    const selected = options[idx];
    const match = selected.shape.id === targetShape.id && selected.color.id === targetColor.id;

    if (match) {
      soundManager.playSuccess();
      soundManager.speak(lang === 'id' ? 'Luar biasa! Benar!' : 'Awesome! Correct!', lang);
      setIsCorrect(true);

      setTimeout(() => {
        if (round >= maxRounds) {
          const stars = 3;
          setStarsAwarded(stars);
          const { newlyUnlocked } = onReward(stars);
          setNewStickers(newlyUnlocked);
          setShowCelebration(true);
        } else {
          setRound(r => r + 1);
        }
      }, 1200);
    } else {
      soundManager.playError();
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedIndex(null);
      }, 900);
    }
  };

  const resetGame = () => {
    setRound(1);
    setShowCelebration(false);
    generateRound();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
              <span>🔷</span> {t(lang, 'gameShapesTitle')}
            </h2>
            <p className="text-sm font-bold text-amber-800">
              {t(lang, 'gameShapesDesc')}
            </p>
          </div>

          <div className="bg-purple-100 px-4 py-1.5 rounded-2xl border-2 border-purple-300 font-black text-purple-900 text-sm">
            {t(lang, 'level')} {round} / {maxRounds}
          </div>
        </div>
      </div>

      {/* Target Question Display */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-yellow-300 flex flex-col items-center text-center">
        <div className="mb-6">
          <p className="text-sm font-extrabold text-amber-700 uppercase tracking-wider mb-1">
            {lang === 'id' ? 'Misi Kamu:' : 'Your Mission:'}
          </p>
          <div className="inline-flex items-center gap-3 bg-amber-100/80 border-3 border-amber-300 px-6 py-2.5 rounded-3xl shadow-sm">
            <span className="text-xl sm:text-2xl font-black text-amber-950">
              {lang === 'id' ? (
                <>
                  Cari <span className="underline decoration-wavy decoration-amber-500">{targetShape.name.id}</span> warna{' '}
                  <span style={{ color: targetColor.hex }} className="drop-shadow-xs font-black">
                    {targetColor.name.id}
                  </span>
                </>
              ) : (
                <>
                  Find the{' '}
                  <span style={{ color: targetColor.hex }} className="drop-shadow-xs font-black">
                    {targetColor.name.en}
                  </span>{' '}
                  <span className="underline decoration-wavy decoration-amber-500">{targetShape.name.en}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* 4 Big Choices */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md mb-6">
          {options.map((opt, idx) => {
            const isMatch = opt.shape.id === targetShape.id && opt.color.id === targetColor.id;
            const isPicked = selectedIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`relative aspect-square rounded-3xl border-4 p-4 flex flex-col items-center justify-center transition-all duration-200 shadow-md ${
                  isPicked
                    ? isMatch
                      ? 'bg-emerald-100 border-emerald-500 scale-105'
                      : 'bg-rose-100 border-rose-500'
                    : 'bg-stone-50 hover:bg-yellow-50 border-amber-200 hover:border-amber-400 active:scale-95'
                }`}
              >
                {opt.shape.render(opt.color.hex)}
                <div className="mt-2 text-xs font-extrabold text-stone-700">
                  {opt.color.name[lang]} {opt.shape.name[lang]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback message indicator */}
        <div className="h-8 flex items-center justify-center">
          {isCorrect === true && (
            <span className="text-emerald-600 font-black text-lg flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {t(lang, 'correct')}
            </span>
          )}
          {isCorrect === false && (
            <span className="text-rose-500 font-black text-lg animate-wiggle">
              {t(lang, 'tryAgain')}
            </span>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        starsEarned={starsAwarded}
        newStickers={newStickers}
        lang={lang}
        onReplay={resetGame}
        onNext={resetGame}
        onHome={onHome}
      />
    </div>
  );
};
