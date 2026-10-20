import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Star, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { Language, Sticker } from '../types';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/sound';

interface CelebrationModalProps {
  isOpen: boolean;
  starsEarned: number;
  newStickers?: Sticker[];
  lang: Language;
  onNext?: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  starsEarned,
  newStickers = [],
  lang,
  onNext,
  onReplay,
  onHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playFanfare();
      soundManager.speak(lang === 'id' ? 'Hore! Hebat sekali! Kamu pintar!' : 'Hooray! Great job! You are amazing!', lang);

      // Fire festive colorful confetti
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF5964', '#FEE180', '#35A7FF', '#38B000', '#FF9F1C', '#9D4EDD']
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.7 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.7 },
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-4 border-yellow-300 overflow-hidden transform animate-scaleUp">
        {/* Decorative background sunburst */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-yellow-200/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-pink-200/50 rounded-full blur-xl pointer-events-none" />

        {/* Animated Trophy Header */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce">
            <Trophy className="w-12 h-12 text-white drop-shadow-md" />
          </div>
          <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-900 mb-1">
          {t(lang, 'congratulations')}
        </h2>
        <p className="text-base sm:text-lg font-bold text-amber-700/90 mb-5">
          {t(lang, 'wellDone')}
        </p>

        {/* Stars earned badge */}
        <div className="inline-flex items-center gap-2 bg-amber-100/90 border-2 border-amber-300 px-5 py-2.5 rounded-full mb-5 shadow-inner">
          <Star className="w-7 h-7 text-yellow-500 fill-yellow-400 animate-pulse" />
          <span className="text-lg font-black text-amber-900">
            +{starsEarned} {t(lang, 'stars')}!
          </span>
        </div>

        {/* Unlocked sticker alert if any */}
        {newStickers.length > 0 && (
          <div className="mb-6 p-3.5 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl border-2 border-pink-300 animate-pulse">
            <p className="text-xs sm:text-sm font-black text-purple-900 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-pink-500" />
              {t(lang, 'newStickerUnlocked')}
            </p>
            <div className="flex items-center justify-center gap-3">
              {newStickers.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <span className="text-4xl filter drop-shadow-md">{s.emoji}</span>
                  <span className="text-xs font-bold text-purple-800 mt-1">{s.name[lang]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => {
              soundManager.playClick();
              onHome();
            }}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-sm sm:text-base border-2 border-amber-300 transition-transform active:scale-95 shadow-sm"
          >
            {t(lang, 'backToHome')}
          </button>
          
          <button
            onClick={() => {
              soundManager.playClick();
              onReplay();
            }}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm sm:text-base border-b-4 border-sky-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            {t(lang, 'playAgain')}
          </button>

          {onNext && (
            <button
              onClick={() => {
                soundManager.playClick();
                onNext();
              }}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm sm:text-base border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>{t(lang, 'nextLevel')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
