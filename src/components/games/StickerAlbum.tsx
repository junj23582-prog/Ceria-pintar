import React, { useState } from 'react';
import { Sparkles, Trash2, RotateCw, ZoomIn, ZoomOut, Lock, Trophy } from 'lucide-react';
import { Language, PlacedSticker, Sticker } from '../../types';
import { t } from '../../utils/i18n';
import { ALL_STICKERS, savePlacedStickers } from '../../utils/storage';
import { soundManager } from '../../utils/sound';

interface StickerAlbumProps {
  lang: Language;
  stars: number;
  unlockedStickerIds: string[];
  placedStickers: PlacedSticker[];
  onUpdatePlacedStickers: (stickers: PlacedSticker[], scene: string) => void;
  currentScene: string;
  onHome: () => void;
}

const SCENES = [
  {
    id: 'meadow',
    name: { id: 'Padang Rumput', en: 'Sunny Meadow' },
    bgClass: 'bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-400',
    decor: '🌻 🌼 🍄 🌳 🌈',
  },
  {
    id: 'ocean',
    name: { id: 'Bawah Laut', en: 'Deep Ocean' },
    bgClass: 'bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-800',
    decor: '🪸 🫧 🌊 🐚 🐠',
  },
  {
    id: 'space',
    name: { id: 'Luar Angkasa', en: 'Cosmic Space' },
    bgClass: 'bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900',
    decor: '✨ 🪐 🌠 🛸 🌌',
  },
  {
    id: 'dino',
    name: { id: 'Negeri Dinosaurus', en: 'Dino Valley' },
    bgClass: 'bg-gradient-to-b from-amber-200 via-orange-300 to-emerald-600',
    decor: '🌴 🌋 🪨 🌿 🦖',
  },
];

export const StickerAlbum: React.FC<StickerAlbumProps> = ({
  lang,
  stars,
  unlockedStickerIds,
  placedStickers,
  onUpdatePlacedStickers,
  currentScene,
  onHome,
}) => {
  const [scene, setScene] = useState(currentScene || 'meadow');
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);

  const activeSceneConfig = SCENES.find((s) => s.id === scene) || SCENES[0];

  const handleAddSticker = (sticker: Sticker) => {
    if (!unlockedStickerIds.includes(sticker.id)) {
      soundManager.playError();
      soundManager.speak(
        lang === 'id'
          ? `Stiker ini masih terkunci. Kumpulkan ${sticker.requiredStars} bintang!`
          : `This sticker is locked. Collect ${sticker.requiredStars} stars!`,
        lang
      );
      return;
    }

    soundManager.playPop();
    soundManager.speak(sticker.name[lang], lang);

    const newPlaced: PlacedSticker = {
      id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stickerId: sticker.id,
      emoji: sticker.emoji,
      x: Math.floor(Math.random() * 60) + 20,
      y: Math.floor(Math.random() * 50) + 25,
      scale: 1.2,
      rotation: Math.floor(Math.random() * 20) - 10,
    };

    const nextList = [...placedStickers, newPlaced];
    onUpdatePlacedStickers(nextList, scene);
    setSelectedPlacedId(newPlaced.id);
  };

  const handleRemovePlaced = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    const nextList = placedStickers.filter((p) => p.id !== id);
    onUpdatePlacedStickers(nextList, scene);
    if (selectedPlacedId === id) setSelectedPlacedId(null);
  };

  const handleScalePlaced = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPlacedId) return;
    soundManager.playClick();
    const nextList = placedStickers.map((p) => {
      if (p.id === selectedPlacedId) {
        const newScale = Math.max(0.6, Math.min(2.5, p.scale + delta));
        return { ...p, scale: newScale };
      }
      return p;
    });
    onUpdatePlacedStickers(nextList, scene);
  };

  const handleRotatePlaced = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPlacedId) return;
    soundManager.playPop();
    const nextList = placedStickers.map((p) => {
      if (p.id === selectedPlacedId) {
        return { ...p, rotation: (p.rotation + 25) % 360 };
      }
      return p;
    });
    onUpdatePlacedStickers(nextList, scene);
  };

  const handleSceneChange = (sceneId: string) => {
    soundManager.playPop();
    setScene(sceneId);
    onUpdatePlacedStickers(placedStickers, sceneId);
  };

  const handleClearAll = () => {
    soundManager.playClick();
    onUpdatePlacedStickers([], scene);
    setSelectedPlacedId(null);
  };

  // Dragging sticker inside arena
  const handleArenaDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPlacedId || e.buttons !== 1) return;
    const arena = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - arena.left) / arena.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - arena.top) / arena.height) * 100));

    const nextList = placedStickers.map((p) => {
      if (p.id === selectedPlacedId) {
        return { ...p, x, y };
      }
      return p;
    });
    onUpdatePlacedStickers(nextList, scene);
  };

  const unlockedCount = ALL_STICKERS.filter((s) => unlockedStickerIds.includes(s.id)).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
              <span>🌟</span> {t(lang, 'gameStickersTitle')}
            </h2>
            <p className="text-sm font-bold text-amber-800">
              {t(lang, 'gameStickersDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-pink-100 border-2 border-pink-300 px-4 py-1.5 rounded-2xl">
            <Trophy className="w-4 h-4 text-pink-600" />
            <span className="font-black text-pink-900 text-sm">
              Koleksi: {unlockedCount} / {ALL_STICKERS.length}
            </span>
          </div>
        </div>

        {/* Scene Switcher Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t-2 border-amber-100 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wide mr-1">
              {t(lang, 'switchScene')}:
            </span>
            {SCENES.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleSceneChange(sc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
                  scene === sc.id
                    ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                    : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
                }`}
              >
                {sc.name[lang]}
              </button>
            ))}
          </div>

          {placedStickers.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs border border-rose-300 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t(lang, 'resetStickers')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Playground Scene Canvas */}
      <div
        onMouseMove={handleArenaDrag}
        onClick={() => setSelectedPlacedId(null)}
        className={`relative w-full h-[400px] sm:h-[480px] rounded-3xl border-4 border-amber-400 overflow-hidden shadow-2xl transition-colors duration-500 select-none ${activeSceneConfig.bgClass}`}
      >
        {/* Background decorative atmosphere */}
        <div className="absolute bottom-4 left-6 right-6 flex justify-between text-4xl sm:text-5xl opacity-40 pointer-events-none select-none">
          {activeSceneConfig.decor.split(' ').map((d, i) => (
            <span key={i} className="animate-float">
              {d}
            </span>
          ))}
        </div>

        {/* Empty state hint */}
        {placedStickers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <Sparkles className="w-12 h-12 text-white/80 animate-bounce mb-2" />
            <p className="text-lg sm:text-xl font-black text-white drop-shadow-md">
              {t(lang, 'dragOrTapStickers')}
            </p>
            <p className="text-xs sm:text-sm font-bold text-white/90 drop-shadow-sm mt-1">
              Sentuh stiker di bawah untuk menempelkannya ke pemandangan ini!
            </p>
          </div>
        )}

        {/* Render Placed Stickers */}
        {placedStickers.map((p) => {
          const isSelected = selectedPlacedId === p.id;
          return (
            <div
              key={p.id}
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playPop();
                setSelectedPlacedId(p.id);
              }}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`,
              }}
              className={`absolute cursor-move select-none p-2 transition-transform duration-100 ${
                isSelected ? 'ring-4 ring-yellow-300 rounded-3xl bg-white/30 backdrop-blur-xs' : 'hover:scale-110'
              }`}
            >
              <span className="text-5xl sm:text-6xl drop-shadow-lg inline-block">
                {p.emoji}
              </span>
            </div>
          );
        })}

        {/* Floating Controls for Selected Sticker */}
        {selectedPlacedId && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-2 shadow-xl flex items-center gap-1.5 animate-scaleUp z-20"
          >
            <button
              onClick={(e) => handleScalePlaced(0.2, e)}
              className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleScalePlaced(-0.2, e)}
              className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotatePlaced}
              className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900"
              title="Putar"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleRemovePlaced(selectedPlacedId, e)}
              className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Sticker Tray / Bottom Drawer */}
      <div className="mt-6 bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Pilihan Stiker Koleksi:
          </p>
          <span className="text-xs font-extrabold text-amber-800">
            {stars} ⭐ Tersedia
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {ALL_STICKERS.map((stk) => {
            const isUnlocked = unlockedStickerIds.includes(stk.id);

            return (
              <button
                key={stk.id}
                onClick={() => handleAddSticker(stk)}
                className={`relative flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-3 flex flex-col items-center justify-center p-1.5 transition-all active:scale-95 ${
                  isUnlocked
                    ? 'bg-amber-50 hover:bg-yellow-100 border-amber-300 shadow-sm hover:scale-105'
                    : 'bg-stone-100 border-stone-300 opacity-60'
                }`}
              >
                <span className="text-4xl sm:text-5xl filter drop-shadow-sm mb-1">
                  {stk.emoji}
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold text-stone-800 text-center leading-tight line-clamp-1">
                  {stk.name[lang]}
                </span>

                {!isUnlocked && (
                  <div className="absolute inset-0 bg-stone-900/40 rounded-2xl flex flex-col items-center justify-center text-white backdrop-blur-xs p-1">
                    <Lock className="w-4 h-4 mb-0.5 text-yellow-300" />
                    <span className="text-[10px] font-black text-yellow-200">
                      {stk.requiredStars} ⭐
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
