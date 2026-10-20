import React, { useState } from 'react';
import { Star, Volume2, VolumeX, Home, Sparkles, MessageSquareQuote } from 'lucide-react';
import { Language, GameId } from '../types';
import { t } from '../utils/i18n';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  stars: number;
  currentGame: GameId | null;
  onGoHome: () => void;
  onOpenStickers: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  stars,
  currentGame,
  onGoHome,
  onOpenStickers,
}) => {
  const [isSoundOn, setIsSoundOn] = useState(soundManager.isSoundEnabled());
  const [isVoiceOn, setIsVoiceOn] = useState(soundManager.isVoiceEnabled());

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setIsSoundOn(newState);
    if (newState) soundManager.playPop();
  };

  const handleToggleVoice = () => {
    const newState = soundManager.toggleVoice();
    setIsVoiceOn(newState);
    if (newState) {
      soundManager.speak(lang === 'id' ? 'Suara narasi aktif!' : 'Voice narration enabled!', lang);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-amber-400/90 backdrop-blur-md border-b-4 border-amber-500 shadow-md px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Brand Logo or Home button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentGame ? (
            <button
              onClick={() => {
                soundManager.playClick();
                onGoHome();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white hover:bg-amber-100 text-amber-900 font-extrabold text-sm sm:text-base border-2 border-amber-300 shadow active:scale-95 transition-all"
              title={t(lang, 'backToHome')}
            >
              <Home className="w-5 h-5 text-amber-600" />
              <span className="hidden sm:inline">{t(lang, 'backToHome')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => soundManager.playPop()}>
              <span className="text-3xl sm:text-4xl animate-bounce">🎨</span>
              <div>
                <h1 className="font-black text-lg sm:text-2xl text-amber-950 tracking-tight leading-tight drop-shadow-xs">
                  {t(lang, 'appTitle')}
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-amber-800 hidden sm:block">
                  {t(lang, 'appSubtitle')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Stars counter, Sticker album button, Audio toggles & Lang switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Sticker Album quick button */}
          {currentGame !== 'stickers' && (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenStickers();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs sm:text-sm border-b-3 border-pink-700 active:border-b-0 active:translate-y-0.5 shadow-sm transition-all"
              title={t(lang, 'gameStickersTitle')}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="hidden md:inline">{t(lang, 'stickers')}</span>
            </button>
          )}

          {/* Stars badge */}
          <div className="flex items-center gap-1 bg-yellow-100 border-2 border-yellow-400 px-2.5 sm:px-3.5 py-1 rounded-2xl shadow-inner">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 drop-shadow-xs" />
            <span className="font-black text-amber-950 text-sm sm:text-base">{stars}</span>
          </div>

          {/* Voice Narration Toggle */}
          <button
            onClick={handleToggleVoice}
            className={`p-1.5 sm:p-2 rounded-xl border-2 transition-all active:scale-90 ${
              isVoiceOn
                ? 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200'
                : 'bg-stone-200 border-stone-300 text-stone-500 line-through'
            }`}
            title={isVoiceOn ? t(lang, 'voiceOn') : t(lang, 'voiceOff')}
          >
            <MessageSquareQuote className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 sm:p-2 rounded-xl border-2 transition-all active:scale-90 ${
              isSoundOn
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200'
                : 'bg-stone-200 border-stone-300 text-stone-500'
            }`}
            title={isSoundOn ? t(lang, 'audioOn') : t(lang, 'audioOff')}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Language Toggle (ID / EN) */}
          <button
            onClick={() => {
              soundManager.playClick();
              const nextLang = lang === 'id' ? 'en' : 'id';
              onLanguageChange(nextLang);
              soundManager.speak(nextLang === 'id' ? 'Bahasa Indonesia dipilih' : 'English selected', nextLang);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border-2 border-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-xs active:scale-95 transition-all"
            title="Ganti Bahasa / Switch Language"
          >
            <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
