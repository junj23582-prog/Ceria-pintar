import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { GameId } from '../types';
import { soundManager } from '../utils/sound';

interface GameCardProps {
  id: GameId;
  title: string;
  desc: string;
  emoji: string;
  colorScheme: 'yellow' | 'pink' | 'blue' | 'purple' | 'green' | 'orange';
  badgeText: string;
  onPlay: (id: GameId) => void;
}

const COLOR_MAP = {
  yellow: {
    bg: 'from-amber-300 via-yellow-300 to-amber-400',
    border: 'border-amber-400',
    btnBg: 'bg-amber-600 hover:bg-amber-700 border-amber-800 text-white',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  pink: {
    bg: 'from-pink-300 via-rose-300 to-pink-400',
    border: 'border-pink-400',
    btnBg: 'bg-pink-600 hover:bg-pink-700 border-pink-800 text-white',
    badge: 'bg-pink-100 text-pink-900 border-pink-300',
  },
  blue: {
    bg: 'from-sky-300 via-blue-300 to-sky-400',
    border: 'border-sky-400',
    btnBg: 'bg-sky-600 hover:bg-sky-700 border-sky-800 text-white',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  purple: {
    bg: 'from-purple-300 via-violet-300 to-purple-400',
    border: 'border-purple-400',
    btnBg: 'bg-purple-600 hover:bg-purple-700 border-purple-800 text-white',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  green: {
    bg: 'from-emerald-300 via-teal-300 to-emerald-400',
    border: 'border-emerald-400',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  orange: {
    bg: 'from-orange-300 via-amber-300 to-orange-400',
    border: 'border-orange-400',
    btnBg: 'bg-orange-600 hover:bg-orange-700 border-orange-800 text-white',
    badge: 'bg-orange-100 text-orange-900 border-orange-300',
  },
};

export const GameCard: React.FC<GameCardProps> = ({
  id,
  title,
  desc,
  emoji,
  colorScheme,
  badgeText,
  onPlay,
}) => {
  const c = COLOR_MAP[colorScheme];

  return (
    <div
      onClick={() => {
        soundManager.playPop();
        onPlay(id);
      }}
      className={`group relative bg-gradient-to-br ${c.bg} rounded-3xl p-5 sm:p-6 border-4 ${c.border} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-98`}
    >
      {/* Decorative background glow circles */}
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/30 rounded-full blur-md pointer-events-none group-hover:scale-125 transition-transform" />

      <div>
        {/* Top Tag & Emoji */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${c.badge}`}>
            {badgeText}
          </span>
          <span className="text-4xl sm:text-5xl drop-shadow group-hover:scale-115 group-hover:rotate-6 transition-transform">
            {emoji}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm font-bold text-amber-900/80 mb-6 leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Chunky 3D Play Button */}
      <div className="w-full">
        <button
          className={`w-full py-3 px-4 rounded-2xl font-black text-sm sm:text-base border-b-4 ${c.btnBg} shadow flex items-center justify-center gap-2 group-hover:brightness-105 transition-all`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Ayo Main!</span>
        </button>
      </div>
    </div>
  );
};
