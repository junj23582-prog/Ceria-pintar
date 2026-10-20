/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Star, Heart, Volume2, ShieldCheck } from 'lucide-react';
import { GameId, Language, PlacedSticker, Sticker } from './types';
import { t } from './utils/i18n';
import { soundManager } from './utils/sound';
import { loadProgress, saveProgress, addStars, savePlacedStickers, ALL_STICKERS } from './utils/storage';
import { Header } from './components/Header';
import { GameCard } from './components/GameCard';
import { MemoryGame } from './components/games/MemoryGame';
import { MathGame } from './components/games/MathGame';
import { ShapesColorsGame } from './components/games/ShapesColorsGame';
import { SpellingGame } from './components/games/SpellingGame';
import { BalloonGame } from './components/games/BalloonGame';
import { ColoringGame } from './components/games/ColoringGame';
import { StickerAlbum } from './components/games/StickerAlbum';

export default function App() {
  const [lang, setLang] = useState<Language>('id');
  const [progress, setProgress] = useState(() => loadProgress());
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  // Initialize and sync progress
  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
  }, []);

  const handleReward = (starsCount: number): { newTotal: number; newlyUnlocked: Sticker[] } => {
    const result = addStars(starsCount);
    setProgress(loadProgress());
    return result;
  };

  const handleUpdatePlacedStickers = (stickers: PlacedSticker[], scene: string) => {
    savePlacedStickers(stickers, scene);
    setProgress(loadProgress());
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/70 text-amber-950 font-['Fredoka',sans-serif] selection:bg-amber-300">
      {/* Universal Kid-friendly Navigation Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        stars={progress.stars}
        currentGame={activeGame}
        onGoHome={() => setActiveGame(null)}
        onOpenStickers={() => setActiveGame('stickers')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeGame === null && (
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            {/* Friendly Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 rounded-3xl p-6 sm:p-10 shadow-xl border-4 border-yellow-400 mb-8 sm:mb-10 text-center">
              {/* Decorative Floating Emoticons */}
              <div className="absolute top-2 left-4 text-3xl sm:text-5xl animate-bounce">
                ☀️
              </div>
              <div className="absolute bottom-3 right-5 text-3xl sm:text-5xl animate-pulse">
                🌈
              </div>
              <div className="absolute top-4 right-8 text-2xl sm:text-4xl">
                ✨
              </div>

              <div className="max-w-2xl mx-auto relative z-10">
                <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/80 border-2 border-yellow-400 text-amber-900 font-black text-xs sm:text-sm uppercase tracking-wide mb-3 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {lang === 'id' ? 'Taman Belajar Ceria' : 'Cheerful Learning Playground'}
                </span>
                
                <h1 className="text-3xl sm:text-5xl font-black text-amber-950 mb-3 tracking-tight drop-shadow-xs">
                  {lang === 'id' ? 'Halo Teman Pintar! 🌟' : 'Hello Smart Friend! 🌟'}
                </h1>
                
                <p className="text-base sm:text-xl font-bold text-amber-900/90 leading-relaxed mb-6">
                  {lang === 'id'
                    ? 'Ayo mainkan game seru untuk mengasah otak, belajar berhitung, mengingat warna, mengeja kata, dan kumpulkan stiker keren!'
                    : 'Play exciting brain-training games, learn counting, match colorful shapes, spell words, and collect awesome stickers!'}
                </p>

                {/* Quick stats badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 bg-white/90 border-2 border-amber-300 px-4 py-2 rounded-2xl shadow-sm">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                    <span className="font-black text-amber-950 text-sm sm:text-base">
                      {progress.stars} {t(lang, 'stars')} Terkumpul
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playPop();
                      setActiveGame('stickers');
                    }}
                    className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-black text-sm sm:text-base px-5 py-2 rounded-2xl border-b-3 border-pink-700 active:border-b-0 active:translate-y-0.5 shadow transition-all"
                  >
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <span>
                      {t(lang, 'stickers')}: {progress.unlockedStickers.length} / {ALL_STICKERS.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Game Grid Catalog */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
                  <span>🎮</span>
                  {lang === 'id' ? 'Pilih Mini Game Seru' : 'Choose a Fun Mini Game'}
                </h2>
                <span className="text-xs sm:text-sm font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  {lang === 'id' ? '7 Permainan Lengkap' : '7 Games Included'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {/* 1. Memory Game */}
                <GameCard
                  id="memory"
                  title={t(lang, 'gameMemoryTitle')}
                  desc={t(lang, 'gameMemoryDesc')}
                  emoji="🃏"
                  colorScheme="yellow"
                  badgeText="Asah Memori"
                  onPlay={setActiveGame}
                />

                {/* 2. Math Adventure */}
                <GameCard
                  id="math"
                  title={t(lang, 'gameMathTitle')}
                  desc={t(lang, 'gameMathDesc')}
                  emoji="🧮"
                  colorScheme="green"
                  badgeText="Logika & Angka"
                  onPlay={setActiveGame}
                />

                {/* 3. Shapes & Colors */}
                <GameCard
                  id="shapes"
                  title={t(lang, 'gameShapesTitle')}
                  desc={t(lang, 'gameShapesDesc')}
                  emoji="🔷"
                  colorScheme="purple"
                  badgeText="Visual & Warna"
                  onPlay={setActiveGame}
                />

                {/* 4. Spelling Puzzle */}
                <GameCard
                  id="spelling"
                  title={t(lang, 'gameSpellingTitle')}
                  desc={t(lang, 'gameSpellingDesc')}
                  emoji="🔤"
                  colorScheme="pink"
                  badgeText="Membaca & Ejaan"
                  onPlay={setActiveGame}
                />

                {/* 5. Balloon Pop Reflex */}
                <GameCard
                  id="balloon"
                  title={t(lang, 'gameBalloonTitle')}
                  desc={t(lang, 'gameBalloonDesc')}
                  emoji="🎈"
                  colorScheme="blue"
                  badgeText="Ketangkasan"
                  onPlay={setActiveGame}
                />

                {/* 6. Coloring & Drawing */}
                <GameCard
                  id="coloring"
                  title={t(lang, 'gameColoringTitle')}
                  desc={t(lang, 'gameColoringDesc')}
                  emoji="🎨"
                  colorScheme="orange"
                  badgeText="Kreativitas Seni"
                  onPlay={setActiveGame}
                />
              </div>
            </div>

            {/* Sticker Park Banner */}
            <div
              onClick={() => {
                soundManager.playPop();
                setActiveGame('stickers');
              }}
              className="group cursor-pointer bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-pink-300 flex flex-col sm:flex-row items-center justify-between gap-6 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-4 text-center sm:text-left">
                <span className="text-6xl sm:text-7xl group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  🏰
                </span>
                <div>
                  <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full mb-1">
                    Ruang Kreatif & Hadiah
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-1">
                    {t(lang, 'gameStickersTitle')}
                  </h3>
                  <p className="text-sm font-bold text-white/90">
                    {t(lang, 'gameStickersDesc')}
                  </p>
                </div>
              </div>

              <button className="px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-black text-base border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 shadow-md transition-all whitespace-nowrap">
                Buka Album Stiker ⭐
              </button>
            </div>
          </div>
        )}

        {/* Game Render Screens */}
        {activeGame === 'memory' && (
          <MemoryGame
            lang={lang}
            onReward={handleReward}
            onHome={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'math' && (
          <MathGame
            lang={lang}
            onReward={handleReward}
            onHome={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'shapes' && (
          <ShapesColorsGame
            lang={lang}
            onReward={handleReward}
            onHome={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'spelling' && (
          <SpellingGame
            lang={lang}
            onReward={handleReward}
            onHome={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'balloon' && (
          <BalloonGame
            lang={lang}
            onReward={handleReward}
            onHome={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'coloring' && (
          <ColoringGame
            lang={lang}
            onReward={handleReward}
            onHome={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'stickers' && (
          <StickerAlbum
            lang={lang}
            stars={progress.stars}
            unlockedStickerIds={progress.unlockedStickers}
            placedStickers={progress.placedStickers}
            onUpdatePlacedStickers={handleUpdatePlacedStickers}
            currentScene={progress.currentScene}
            onHome={() => setActiveGame(null)}
          />
        )}
      </main>

      {/* Child-friendly Cheerful Footer */}
      <footer className="mt-auto py-5 bg-amber-200/80 border-t-2 border-amber-300 text-center px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-extrabold text-amber-900/80">
          <div className="flex items-center gap-1.5">
            <span>🌈 Dunia Pintar Anak</span>
            <span>•</span>
            <span>Game Edukasi & Asah Otak Ceria</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Dibuat dengan rasa senang & cinta</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </footer>
    </div>
  );
}
