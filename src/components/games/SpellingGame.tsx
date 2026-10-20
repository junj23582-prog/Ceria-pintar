import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, Volume2 } from 'lucide-react';
import { Language, Sticker } from '../../types';
import { t } from '../../utils/i18n';
import { soundManager } from '../../utils/sound';
import { CelebrationModal } from '../CelebrationModal';

interface SpellingGameProps {
  lang: Language;
  onReward: (stars: number) => { newTotal: number; newlyUnlocked: Sticker[] };
  onHome: () => void;
}

interface WordItem {
  id: string;
  emoji: string;
  words: {
    id: string;
    en: string;
  };
}

const WORDS: WordItem[] = [
  { id: 'cat', emoji: '🐱', words: { id: 'KUCING', en: 'CAT' } },
  { id: 'apple', emoji: '🍎', words: { id: 'APEL', en: 'APPLE' } },
  { id: 'fish', emoji: '🐠', words: { id: 'IKAN', en: 'FISH' } },
  { id: 'ball', emoji: '⚽', words: { id: 'BOLA', en: 'BALL' } },
  { id: 'duck', emoji: '🦆', words: { id: 'BEBEK', en: 'DUCK' } },
  { id: 'frog', emoji: '🐸', words: { id: 'KATAK', en: 'FROG' } },
  { id: 'book', emoji: '📖', words: { id: 'BUKU', en: 'BOOK' } },
  { id: 'banana', emoji: '🍌', words: { id: 'PISANG', en: 'BANANA' } },
  { id: 'car', emoji: '🚗', words: { id: 'MOBIL', en: 'CAR' } },
  { id: 'flower', emoji: '🌸', words: { id: 'BUNGA', en: 'FLOWER' } },
];

interface LetterBubble {
  id: number;
  letter: string;
  isUsed: boolean;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({ lang, onReward, onHome }) => {
  const [round, setRound] = useState(1);
  const maxRounds = 5;

  const [currentWordItem, setCurrentWordItem] = useState(WORDS[0]);
  const [targetWord, setTargetWord] = useState('');
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);
  const [availableBubbles, setAvailableBubbles] = useState<LetterBubble[]>([]);
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [newStickers, setNewStickers] = useState<Sticker[]>([]);
  const [starsAwarded, setStarsAwarded] = useState(0);

  const setupRound = () => {
    const item = WORDS[(round - 1) % WORDS.length];
    setCurrentWordItem(item);
    const word = item.words[lang].toUpperCase();
    setTargetWord(word);
    setSpelledLetters([]);

    // Create shuffled letter bubbles
    const letters = word.split('');
    const bubbles: LetterBubble[] = letters.map((l, idx) => ({
      id: idx,
      letter: l,
      isUsed: false,
    }));

    // Shuffle bubbles
    for (let i = bubbles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bubbles[i], bubbles[j]] = [bubbles[j], bubbles[i]];
    }

    setAvailableBubbles(bubbles);
    soundManager.speak(word, lang);
  };

  useEffect(() => {
    setupRound();
  }, [round, lang]);

  const handleBubbleClick = (bubble: LetterBubble) => {
    if (bubble.isUsed) return;

    const nextIndex = spelledLetters.length;
    const expectedLetter = targetWord[nextIndex];

    if (bubble.letter === expectedLetter) {
      // Correct letter tapped!
      soundManager.playPop();
      soundManager.playNote(400 + nextIndex * 70, 0.12);
      soundManager.speak(bubble.letter, lang);

      const nextSpelled = [...spelledLetters, bubble.letter];
      setSpelledLetters(nextSpelled);

      setAvailableBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, isUsed: true } : b));

      // Check if word is complete
      if (nextSpelled.length === targetWord.length) {
        setTimeout(() => {
          soundManager.playSuccess();
          soundManager.speak(targetWord, lang);

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
        }, 300);
      }
    } else {
      // Wrong letter
      soundManager.playError();
    }
  };

  const handleHint = () => {
    soundManager.playClick();
    const nextIndex = spelledLetters.length;
    if (nextIndex < targetWord.length) {
      const expectedLetter = targetWord[nextIndex];
      soundManager.speak(expectedLetter, lang);
    }
  };

  const resetGame = () => {
    setRound(1);
    setShowCelebration(false);
    setupRound();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
              <span>🔤</span> {t(lang, 'gameSpellingTitle')}
            </h2>
            <p className="text-sm font-bold text-amber-800">
              {t(lang, 'gameSpellingDesc')}
            </p>
          </div>

          <div className="bg-rose-100 px-4 py-1.5 rounded-2xl border-2 border-rose-300 font-black text-rose-900 text-sm">
            {t(lang, 'level')} {round} / {maxRounds}
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-yellow-300 flex flex-col items-center text-center">
        {/* Large Emoji Card with sound pronunciation button */}
        <div className="relative mb-6 flex flex-col items-center">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-tr from-amber-100 to-yellow-50 rounded-3xl border-4 border-amber-300 flex items-center justify-center shadow-inner">
            <span className="text-7xl sm:text-8xl drop-shadow-md select-none transform hover:scale-105 transition-transform">
              {currentWordItem.emoji}
            </span>
          </div>

          <button
            onClick={() => soundManager.speak(targetWord, lang)}
            className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-amber-200 hover:bg-amber-300 border-2 border-amber-400 rounded-full font-black text-amber-950 text-xs sm:text-sm active:scale-95 transition-all shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-amber-800" />
            <span>Dengarkan Kata</span>
          </button>
        </div>

        {/* Word Slot Containers */}
        <div className="flex gap-2 sm:gap-3 justify-center mb-8 flex-wrap">
          {targetWord.split('').map((letter, idx) => {
            const filled = spelledLetters[idx];
            return (
              <div
                key={idx}
                className={`w-12 h-14 sm:w-16 sm:h-20 rounded-2xl border-3 flex items-center justify-center font-black text-2xl sm:text-4xl transition-all shadow-sm ${
                  filled
                    ? 'bg-amber-400 border-amber-600 text-amber-950 scale-105'
                    : 'bg-amber-50 border-dashed border-amber-300 text-amber-300'
                }`}
              >
                {filled || '_'}
              </div>
            );
          })}
        </div>

        {/* Floating Letter Bubbles */}
        <div className="mb-6">
          <p className="text-xs sm:text-sm font-extrabold text-amber-800 uppercase tracking-wide mb-3">
            Sentuh huruf untuk mengeja:
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center max-w-md">
            {availableBubbles.map((bubble) => (
              <button
                key={bubble.id}
                onClick={() => handleBubbleClick(bubble)}
                disabled={bubble.isUsed}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full font-black text-2xl sm:text-3xl border-b-4 transition-all shadow-md ${
                  bubble.isUsed
                    ? 'opacity-20 scale-90 cursor-default bg-stone-300 border-stone-400 text-stone-500'
                    : 'bg-sky-400 hover:bg-sky-500 border-sky-600 text-white active:scale-95 active:border-b-0 hover:-translate-y-1'
                }`}
              >
                {bubble.letter}
              </button>
            ))}
          </div>
        </div>

        {/* Hint button */}
        <button
          onClick={handleHint}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 font-extrabold text-amber-900 text-xs sm:text-sm shadow-xs transition-all active:scale-95"
        >
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Bantuan Huruf Berikutnya</span>
        </button>
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
