import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { Language, Sticker } from '../../types';
import { t } from '../../utils/i18n';
import { soundManager } from '../../utils/sound';
import { CelebrationModal } from '../CelebrationModal';

interface MathGameProps {
  lang: Language;
  onReward: (stars: number) => { newTotal: number; newlyUnlocked: Sticker[] };
  onHome: () => void;
}

type MathMode = 'count' | 'addition' | 'compare';

const EMOJI_ITEMS = [
  { emoji: '🍎', name: { id: 'apel', en: 'apples' } },
  { emoji: '🦆', name: { id: 'bebek', en: 'ducks' } },
  { emoji: '⭐', name: { id: 'bintang', en: 'stars' } },
  { emoji: '🧁', name: { id: 'kue', en: 'cupcakes' } },
  { emoji: '🚗', name: { id: 'mobil', en: 'cars' } },
  { emoji: '🍓', name: { id: 'stroberi', en: 'strawberries' } },
  { emoji: '🐸', name: { id: 'katak', en: 'frogs' } },
  { emoji: '🍭', name: { id: 'permen', en: 'lollipops' } },
];

export const MathGame: React.FC<MathGameProps> = ({ lang, onReward, onHome }) => {
  const [mode, setMode] = useState<MathMode>('count');
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(5);
  
  // Counting question state
  const [targetCount, setTargetCount] = useState(3);
  const [countedItems, setCountedItems] = useState<number[]>([]);
  const [itemType, setItemType] = useState(EMOJI_ITEMS[0]);
  const [options, setOptions] = useState<number[]>([]);
  
  // Addition question state
  const [numA, setNumA] = useState(2);
  const [numB, setNumB] = useState(3);
  const [isSub, setIsSub] = useState(false);

  // Compare question state
  const [compareA, setCompareA] = useState(4);
  const [compareB, setCompareB] = useState(2);

  // Feedback state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newStickers, setNewStickers] = useState<Sticker[]>([]);
  const [starsAwarded, setStarsAwarded] = useState(0);

  const generateQuestion = () => {
    setSelectedAnswer(null);
    setSelectedSide(null);
    setIsCorrect(null);
    setCountedItems([]);

    const randomItem = EMOJI_ITEMS[Math.floor(Math.random() * EMOJI_ITEMS.length)];
    setItemType(randomItem);

    if (mode === 'count') {
      const count = Math.floor(Math.random() * 8) + 1; // 1 to 8
      setTargetCount(count);
      
      // Generate 3 choices including the answer
      const choices = new Set<number>([count]);
      while (choices.size < 3) {
        const offset = Math.floor(Math.random() * 5) - 2;
        const candidate = count + offset;
        if (candidate >= 1 && candidate <= 10 && candidate !== count) {
          choices.add(candidate);
        } else {
          choices.add(Math.floor(Math.random() * 9) + 1);
        }
      }
      setOptions(Array.from(choices).sort(() => Math.random() - 0.5));
      soundManager.speak(lang === 'id' ? `Ayo hitung ada berapa ${randomItem.name.id}?` : `Let's count how many ${randomItem.name.en}?`, lang);
    } else if (mode === 'addition') {
      const useSub = Math.random() > 0.6;
      setIsSub(useSub);
      if (useSub) {
        const a = Math.floor(Math.random() * 5) + 3; // 3 to 7
        const b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
        setNumA(a);
        setNumB(b);
        const ans = a - b;
        const choices = new Set<number>([ans]);
        while (choices.size < 3) {
          const fake = Math.max(1, ans + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1));
          choices.add(fake);
        }
        setOptions(Array.from(choices).sort(() => Math.random() - 0.5));
      } else {
        const a = Math.floor(Math.random() * 4) + 1;
        const b = Math.floor(Math.random() * 4) + 1;
        setNumA(a);
        setNumB(b);
        const ans = a + b;
        const choices = new Set<number>([ans]);
        while (choices.size < 3) {
          const fake = Math.max(1, ans + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1));
          choices.add(fake);
        }
        setOptions(Array.from(choices).sort(() => Math.random() - 0.5));
      }
    } else if (mode === 'compare') {
      let a = Math.floor(Math.random() * 7) + 1;
      let b = Math.floor(Math.random() * 7) + 1;
      while (a === b) {
        b = Math.floor(Math.random() * 7) + 1;
      }
      setCompareA(a);
      setCompareB(b);
      soundManager.speak(lang === 'id' ? 'Sentuh kelompok yang punya lebih banyak!' : 'Tap the group that has more items!', lang);
    }
  };

  useEffect(() => {
    generateQuestion();
  }, [mode]);

  const handleItemTap = (idx: number) => {
    soundManager.playPop();
    if (!countedItems.includes(idx)) {
      const updated = [...countedItems, idx];
      setCountedItems(updated);
      const numberSpoken = updated.length;
      soundManager.speak(String(numberSpoken), lang);
    }
  };

  const checkAnswer = (answer: number) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(answer);

    const correctAnswer = mode === 'count' ? targetCount : (isSub ? numA - numB : numA + numB);

    if (answer === correctAnswer) {
      soundManager.playSuccess();
      soundManager.speak(lang === 'id' ? 'Benar sekali!' : 'Correct!', lang);
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
          generateQuestion();
        }
      }, 1200);
    } else {
      soundManager.playError();
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedAnswer(null);
      }, 900);
    }
  };

  const handleComparePick = (side: 'left' | 'right') => {
    if (isCorrect !== null) return;
    setSelectedSide(side);

    const correct = (side === 'left' && compareA > compareB) || (side === 'right' && compareB > compareA);

    if (correct) {
      soundManager.playSuccess();
      soundManager.speak(lang === 'id' ? 'Hebat, benar!' : 'Great job, correct!', lang);
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
          generateQuestion();
        }
      }, 1200);
    } else {
      soundManager.playError();
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedSide(null);
      }, 900);
    }
  };

  const resetAll = () => {
    setRound(1);
    setShowCelebration(false);
    generateQuestion();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Controls Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
              <span>🧮</span> {t(lang, 'gameMathTitle')}
            </h2>
            <p className="text-sm font-bold text-amber-800">
              {t(lang, 'gameMathDesc')}
            </p>
          </div>

          <div className="bg-emerald-100 px-4 py-1.5 rounded-2xl border-2 border-emerald-300 font-black text-emerald-900 text-sm">
            {t(lang, 'level')} {round} / {maxRounds}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 pt-3 border-t-2 border-amber-100">
          <button
            onClick={() => {
              soundManager.playPop();
              setMode('count');
              setRound(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
              mode === 'count'
                ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            🍎 {t(lang, 'countTheItems')}
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setMode('addition');
              setRound(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
              mode === 'addition'
                ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            ➕ Tambah & Kurang
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setMode('compare');
              setRound(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
              mode === 'compare'
                ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            ⚖️ Mana Lebih Banyak?
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-yellow-300 min-h-[380px] flex flex-col justify-between items-center text-center">
        {mode === 'count' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-lg sm:text-xl font-black text-amber-900 mb-2">
              {lang === 'id' ? `Sentuh & hitung ada berapa ${itemType.name.id}?` : `Tap & count the ${itemType.name.en}:`}
            </p>
            <p className="text-xs text-amber-700 font-bold mb-6">
              (Tips: Kamu bisa sentuh setiap gambar untuk menghitungnya satu per satu!)
            </p>

            {/* Tap-able item grid */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 max-w-lg mb-8 min-h-[120px]">
              {Array.from({ length: targetCount }).map((_, idx) => {
                const isTapped = countedItems.includes(idx);
                const tapOrder = countedItems.indexOf(idx) + 1;
                return (
                  <div
                    key={idx}
                    onClick={() => handleItemTap(idx)}
                    className="relative cursor-pointer transform hover:scale-110 active:scale-90 transition-transform p-1 select-none"
                  >
                    <span className="text-5xl sm:text-6xl drop-shadow-md inline-block">
                      {itemType.emoji}
                    </span>
                    {isTapped && (
                      <span className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-md border-2 border-white animate-scaleUp">
                        {tapOrder}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Answer Buttons */}
            <div className="flex gap-4 sm:gap-6 justify-center w-full max-w-sm">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => checkAnswer(option)}
                  className={`flex-1 aspect-square max-w-[80px] rounded-2xl sm:rounded-3xl font-black text-3xl sm:text-4xl border-b-4 transition-all shadow-md active:translate-y-1 active:border-b-0 ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-emerald-500 border-emerald-700 text-white animate-bounce'
                        : 'bg-rose-500 border-rose-700 text-white'
                      : 'bg-amber-400 hover:bg-amber-500 border-amber-600 text-amber-950'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'addition' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-lg sm:text-xl font-black text-amber-900 mb-6">
              {lang === 'id' ? 'Berapakah hasil penjumlahan ini?' : 'What is the answer?'}
            </p>

            <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap mb-8">
              {/* Group A */}
              <div className="bg-amber-50 border-3 border-amber-300 rounded-3xl p-3 sm:p-4 flex flex-col items-center">
                <div className="flex gap-1.5 flex-wrap justify-center max-w-[140px] mb-2">
                  {Array.from({ length: numA }).map((_, i) => (
                    <span key={i} className="text-3xl sm:text-4xl">{itemType.emoji}</span>
                  ))}
                </div>
                <span className="text-2xl font-black text-amber-950">{numA}</span>
              </div>

              {/* Operator */}
              <span className="text-4xl font-black text-amber-600">
                {isSub ? '➖' : '➕'}
              </span>

              {/* Group B */}
              <div className="bg-amber-50 border-3 border-amber-300 rounded-3xl p-3 sm:p-4 flex flex-col items-center">
                <div className="flex gap-1.5 flex-wrap justify-center max-w-[140px] mb-2">
                  {Array.from({ length: numB }).map((_, i) => (
                    <span key={i} className="text-3xl sm:text-4xl">{itemType.emoji}</span>
                  ))}
                </div>
                <span className="text-2xl font-black text-amber-950">{numB}</span>
              </div>

              <span className="text-4xl font-black text-amber-600">🟰</span>

              {/* Question Box */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-200 border-4 border-dashed border-amber-400 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black text-amber-800">
                ?
              </div>
            </div>

            {/* Answer Options */}
            <div className="flex gap-4 sm:gap-6 justify-center w-full max-w-sm">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => checkAnswer(option)}
                  className={`flex-1 aspect-square max-w-[80px] rounded-2xl sm:rounded-3xl font-black text-3xl sm:text-4xl border-b-4 transition-all shadow-md active:translate-y-1 active:border-b-0 ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-emerald-500 border-emerald-700 text-white animate-bounce'
                        : 'bg-rose-500 border-rose-700 text-white'
                      : 'bg-amber-400 hover:bg-amber-500 border-amber-600 text-amber-950'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'compare' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-lg sm:text-xl font-black text-amber-900 mb-6">
              {t(lang, 'whichHasMore')}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-lg mb-8">
              {/* Left Group */}
              <div
                onClick={() => handleComparePick('left')}
                className={`cursor-pointer rounded-3xl p-4 sm:p-6 border-4 transition-all flex flex-col items-center justify-between min-h-[190px] ${
                  selectedSide === 'left'
                    ? isCorrect
                      ? 'bg-emerald-100 border-emerald-500 scale-105'
                      : 'bg-rose-100 border-rose-500'
                    : 'bg-amber-50 hover:bg-yellow-50 border-amber-300 hover:border-amber-400 shadow-lg active:scale-95'
                }`}
              >
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  {Array.from({ length: compareA }).map((_, i) => (
                    <span key={i} className="text-3xl sm:text-4xl">{itemType.emoji}</span>
                  ))}
                </div>
                <div className="w-full py-2 bg-amber-200/70 rounded-2xl font-black text-amber-950 text-base sm:text-lg">
                  Kelompok A ({compareA})
                </div>
              </div>

              {/* Right Group */}
              <div
                onClick={() => handleComparePick('right')}
                className={`cursor-pointer rounded-3xl p-4 sm:p-6 border-4 transition-all flex flex-col items-center justify-between min-h-[190px] ${
                  selectedSide === 'right'
                    ? isCorrect
                      ? 'bg-emerald-100 border-emerald-500 scale-105'
                      : 'bg-rose-100 border-rose-500'
                    : 'bg-amber-50 hover:bg-yellow-50 border-amber-300 hover:border-amber-400 shadow-lg active:scale-95'
                }`}
              >
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  {Array.from({ length: compareB }).map((_, i) => (
                    <span key={i} className="text-3xl sm:text-4xl">{itemType.emoji}</span>
                  ))}
                </div>
                <div className="w-full py-2 bg-amber-200/70 rounded-2xl font-black text-amber-950 text-base sm:text-lg">
                  Kelompok B ({compareB})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback message indicator */}
        <div className="h-8 flex items-center justify-center">
          {isCorrect === true && (
            <span className="text-emerald-600 font-black text-base sm:text-lg flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {t(lang, 'correct')}
            </span>
          )}
          {isCorrect === false && (
            <span className="text-rose-500 font-black text-base sm:text-lg animate-wiggle">
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
        onReplay={resetAll}
        onNext={() => {
          if (mode === 'count') setMode('addition');
          else if (mode === 'addition') setMode('compare');
          else setMode('count');
          resetAll();
        }}
        onHome={onHome}
      />
    </div>
  );
};
