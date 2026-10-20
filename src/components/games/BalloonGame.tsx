import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { Language, Sticker } from '../../types';
import { t } from '../../utils/i18n';
import { soundManager } from '../../utils/sound';
import { CelebrationModal } from '../CelebrationModal';

interface BalloonGameProps {
  lang: Language;
  onReward: (stars: number) => { newTotal: number; newlyUnlocked: Sticker[] };
  onHome: () => void;
}

interface Balloon {
  id: number;
  x: number; // percentage
  y: number; // percentage
  speed: number;
  colorName: { id: string; en: string };
  colorHex: string;
  number: number;
  isPopped: boolean;
}

const BALLOON_COLORS = [
  { name: { id: 'Merah', en: 'Red' }, hex: '#EF4444' },
  { name: { id: 'Biru', en: 'Blue' }, hex: '#3B82F6' },
  { name: { id: 'Kuning', en: 'Yellow' }, hex: '#EAB308' },
  { name: { id: 'Hijau', en: 'Green' }, hex: '#22C55E' },
  { name: { id: 'Ungu', en: 'Purple' }, hex: '#A855F7' },
  { name: { id: 'Oranye', en: 'Orange' }, hex: '#F97316' },
];

export const BalloonGame: React.FC<BalloonGameProps> = ({ lang, onReward, onHome }) => {
  const [targetColor, setTargetColor] = useState(BALLOON_COLORS[0]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const targetGoal = 5;

  const [showCelebration, setShowCelebration] = useState(false);
  const [newStickers, setNewStickers] = useState<Sticker[]>([]);
  const [starsAwarded, setStarsAwarded] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const startNewMission = () => {
    const chosen = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    setTargetColor(chosen);
    setPoppedCount(0);
    setBalloons([]);
    setShowCelebration(false);

    soundManager.speak(
      lang === 'id' ? `Pecahkan 5 balon berwarna ${chosen.name.id}!` : `Pop 5 ${chosen.name.en} balloons!`,
      lang
    );
  };

  useEffect(() => {
    startNewMission();
  }, [lang]);

  // Balloon Spawner & Animation Loop
  useEffect(() => {
    if (showCelebration) return;

    const spawnInterval = setInterval(() => {
      setBalloons(prev => {
        if (prev.length > 12) return prev; // Limit active balloons
        // Ensure at least 40% are target color so kids have plenty to pop
        const isTarget = Math.random() < 0.45;
        const color = isTarget ? targetColor : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];

        const newBalloon: Balloon = {
          id: nextId.current++,
          x: Math.floor(Math.random() * 80) + 10,
          y: 105, // start just below screen
          speed: Math.random() * 0.4 + 0.35,
          colorName: color.name,
          colorHex: color.hex,
          number: Math.floor(Math.random() * 9) + 1,
          isPopped: false,
        };
        return [...prev, newBalloon];
      });
    }, 900);

    const moveInterval = setInterval(() => {
      setBalloons(prev =>
        prev
          .map(b => ({
            ...b,
            y: b.y - b.speed,
          }))
          .filter(b => b.y > -20 && !b.isPopped)
      );
    }, 30);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [targetColor, showCelebration]);

  const handlePop = (balloon: Balloon) => {
    if (balloon.isPopped) return;

    soundManager.playPop();

    // Mark as popped
    setBalloons(prev =>
      prev.map(b => (b.id === balloon.id ? { ...b, isPopped: true } : b))
    );

    if (balloon.colorHex === targetColor.hex) {
      soundManager.playStar();
      const nextCount = poppedCount + 1;
      setPoppedCount(nextCount);

      if (nextCount >= targetGoal) {
        setTimeout(() => {
          const stars = 3;
          setStarsAwarded(stars);
          const { newlyUnlocked } = onReward(stars);
          setNewStickers(newlyUnlocked);
          setShowCelebration(true);
        }, 300);
      }
    } else {
      // Friendly voice reminder
      soundManager.speak(
        lang === 'id' ? `Cari warna ${targetColor.name.id}!` : `Find color ${targetColor.name.en}!`,
        lang
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-xl border-4 border-amber-200 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
              <span>🎈</span> {t(lang, 'gameBalloonTitle')}
            </h2>
            <p className="text-sm font-bold text-amber-800">
              {t(lang, 'gameBalloonDesc')}
            </p>
          </div>

          {/* Goal tracker */}
          <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-4 py-1.5 rounded-2xl">
            <span className="font-extrabold text-amber-900 text-sm">
              Misi:
            </span>
            <div className="flex gap-1">
              {Array.from({ length: targetGoal }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg transition-transform ${
                    i < poppedCount ? 'scale-110 drop-shadow' : 'opacity-30'
                  }`}
                >
                  🎈
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Target prompt banner */}
        <div className="mt-3 pt-3 border-t-2 border-amber-100 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 bg-sky-100 border-2 border-sky-300 px-5 py-1.5 rounded-full">
            <span className="text-sm sm:text-base font-black text-sky-950">
              {t(lang, 'popTheColor')}{' '}
              <span
                style={{ color: targetColor.hex }}
                className="font-black text-lg underline drop-shadow-xs"
              >
                {targetColor.name[lang].toUpperCase()}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Balloon Sky Arena */}
      <div
        ref={containerRef}
        className="relative w-full h-[500px] sm:h-[550px] bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 rounded-3xl border-4 border-sky-400 overflow-hidden shadow-2xl select-none"
      >
        {/* Soft floating background clouds */}
        <div className="absolute top-8 left-10 text-6xl opacity-60 pointer-events-none animate-pulse">
          ☁️
        </div>
        <div className="absolute top-20 right-16 text-7xl opacity-50 pointer-events-none">
          ☁️
        </div>
        <div className="absolute bottom-12 left-1/3 text-5xl opacity-40 pointer-events-none">
          ☁️
        </div>

        {/* Render Balloons */}
        {balloons.map(b => (
          <div
            key={b.id}
            onClick={() => handlePop(b)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-90"
          >
            {/* Balloon Body */}
            <div className="relative flex flex-col items-center">
              <svg
                width="72"
                height="90"
                viewBox="0 0 72 90"
                className="drop-shadow-lg"
              >
                {/* Balloon shape */}
                <ellipse cx="36" cy="40" rx="30" ry="36" fill={b.colorHex} />
                {/* Balloon highlight / shine */}
                <ellipse cx="24" cy="26" rx="8" ry="12" fill="white" opacity="0.35" transform="rotate(-25 24 26)" />
                {/* Knot */}
                <polygon points="32,74 40,74 36,80" fill={b.colorHex} />
                {/* String */}
                <path d="M 36,80 Q 40,86 36,92" stroke="#666" strokeWidth="2" fill="none" />
              </svg>

              {/* Number inside balloon */}
              <span className="absolute top-6 font-black text-2xl text-white drop-shadow-md pointer-events-none select-none">
                {b.number}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        starsEarned={starsAwarded}
        newStickers={newStickers}
        lang={lang}
        onReplay={startNewMission}
        onNext={startNewMission}
        onHome={onHome}
      />
    </div>
  );
};
