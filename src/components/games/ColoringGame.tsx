import React, { useState, useRef, useEffect } from 'react';
import { Download, RotateCcw, Trash2, Sparkles, Paintbrush, Eraser, Check } from 'lucide-react';
import { Language, Sticker } from '../../types';
import { t } from '../../utils/i18n';
import { soundManager } from '../../utils/sound';
import { CelebrationModal } from '../CelebrationModal';

interface ColoringGameProps {
  lang: Language;
  onReward: (stars: number) => { newTotal: number; newlyUnlocked: Sticker[] };
  onHome: () => void;
}

const TEMPLATES = [
  {
    id: 'dino',
    title: { id: 'Dino Cilik', en: 'Baby Dino' },
    svg: (
      <svg className="w-full h-full pointer-events-none" viewBox="0 0 400 400" fill="none">
        {/* Cute Baby Dino outlines */}
        <path d="M 120,240 Q 110,140 200,120 Q 280,110 270,190 Q 320,200 350,260 Q 360,290 320,300 Q 280,310 240,310 L 230,350 L 190,350 L 195,310 L 160,310 L 150,350 L 110,350 L 120,280 Z" stroke="#222" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Eye */}
        <circle cx="230" cy="155" r="12" fill="#222" />
        <circle cx="234" cy="151" r="4" fill="#fff" />
        {/* Smile */}
        <path d="M 235,175 Q 248,185 260,175" stroke="#222" strokeWidth="6" strokeLinecap="round" />
        {/* Cheeks */}
        <ellipse cx="215" cy="175" rx="8" ry="6" fill="#ffb4b4" opacity="0.6" />
        {/* Back spikes */}
        <path d="M 160,130 L 170,110 L 180,130" stroke="#222" strokeWidth="7" fill="none" />
        <path d="M 135,150 L 140,130 L 155,150" stroke="#222" strokeWidth="7" fill="none" />
        <path d="M 120,180 L 115,160 L 130,180" stroke="#222" strokeWidth="7" fill="none" />
        {/* Belly patch */}
        <path d="M 180,240 Q 230,220 230,290" stroke="#222" strokeWidth="6" strokeDasharray="8 6" fill="none" />
      </svg>
    )
  },
  {
    id: 'cat',
    title: { id: 'Kucing Imut', en: 'Cute Cat' },
    svg: (
      <svg className="w-full h-full pointer-events-none" viewBox="0 0 400 400" fill="none">
        {/* Cat head */}
        <circle cx="200" cy="170" r="80" stroke="#222" strokeWidth="8" />
        {/* Ears */}
        <path d="M 135,130 L 130,70 L 180,105" stroke="#222" strokeWidth="8" strokeLinejoin="round" />
        <path d="M 265,130 L 270,70 L 220,105" stroke="#222" strokeWidth="8" strokeLinejoin="round" />
        {/* Eyes */}
        <circle cx="170" cy="165" r="10" fill="#222" />
        <circle cx="173" cy="162" r="3" fill="#fff" />
        <circle cx="230" cy="165" r="10" fill="#222" />
        <circle cx="233" cy="162" r="3" fill="#fff" />
        {/* Nose & mouth */}
        <polygon points="195,185 205,185 200,192" fill="#ff77a9" stroke="#222" strokeWidth="3" />
        <path d="M 200,192 Q 190,205 180,195 M 200,192 Q 210,205 220,195" stroke="#222" strokeWidth="6" strokeLinecap="round" />
        {/* Whiskers */}
        <line x1="145" y1="180" x2="110" y2="175" stroke="#222" strokeWidth="5" strokeLinecap="round" />
        <line x1="145" y1="190" x2="110" y2="195" stroke="#222" strokeWidth="5" strokeLinecap="round" />
        <line x1="255" y1="180" x2="290" y2="175" stroke="#222" strokeWidth="5" strokeLinecap="round" />
        <line x1="255" y1="190" x2="290" y2="195" stroke="#222" strokeWidth="5" strokeLinecap="round" />
        {/* Body */}
        <path d="M 150,235 C 130,270 120,330 160,340 L 240,340 C 280,330 270,270 250,235" stroke="#222" strokeWidth="8" strokeLinecap="round" />
        {/* Paws */}
        <path d="M 175,340 L 175,310 M 225,340 L 225,310" stroke="#222" strokeWidth="7" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'rocket',
    title: { id: 'Roket Angkasa', en: 'Space Rocket' },
    svg: (
      <svg className="w-full h-full pointer-events-none" viewBox="0 0 400 400" fill="none">
        {/* Rocket Body */}
        <path d="M 200,60 C 230,120 240,240 240,270 L 160,270 C 160,240 170,120 200,60 Z" stroke="#222" strokeWidth="8" strokeLinejoin="round" />
        {/* Window */}
        <circle cx="200" cy="165" r="30" stroke="#222" strokeWidth="8" />
        <circle cx="200" cy="165" r="22" fill="#bae6fd" />
        {/* Fins */}
        <path d="M 160,240 L 110,290 L 160,280 Z" stroke="#222" strokeWidth="8" strokeLinejoin="round" />
        <path d="M 240,240 L 290,290 L 240,280 Z" stroke="#222" strokeWidth="8" strokeLinejoin="round" />
        {/* Flames */}
        <path d="M 180,270 Q 200,340 190,360 Q 200,320 210,360 Q 200,340 220,270" stroke="#222" strokeWidth="7" fill="#fde047" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: 'blank',
    title: { id: 'Kanvas Bebas', en: 'Blank Canvas' },
    svg: null
  }
];

const PALETTE = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#00C7BE', // Mint
  '#30B0C7', // Cyan
  '#007AFF', // Blue
  '#5856D6', // Indigo
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#A2845E', // Brown
  '#FFFFFF', // White / Eraser
];

export const ColoringGame: React.FC<ColoringGameProps> = ({ lang, onReward, onHome }) => {
  const [templateIdx, setTemplateIdx] = useState(0);
  const [color, setColor] = useState('#FF3B30');
  const [brushSize, setBrushSize] = useState(14);
  const [isMagicBrush, setIsMagicBrush] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [newStickers, setNewStickers] = useState<Sticker[]>([]);
  const [starsAwarded, setStarsAwarded] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const hueRef = useRef(0);

  useEffect(() => {
    initCanvas();
  }, [templateIdx]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial history
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    soundManager.playPop();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isMagicBrush) {
      hueRef.current = (hueRef.current + 8) % 360;
      ctx.strokeStyle = `hsl(${hueRef.current}, 90%, 55%)`;
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();

    // Push state to history
    if (historyRef.current.length > 15) {
      historyRef.current.shift();
    }
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    soundManager.playClick();
    historyRef.current.pop(); // Remove current
    const prev = historyRef.current[historyRef.current.length - 1];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx && prev) {
      ctx.putImageData(prev, 0, 0);
    }
  };

  const handleClear = () => {
    soundManager.playClick();
    initCanvas();
  };

  const handleSaveAndFinish = () => {
    soundManager.playFanfare();
    const stars = 3;
    setStarsAwarded(stars);
    const { newlyUnlocked } = onReward(stars);
    setNewStickers(newlyUnlocked);
    setShowCelebration(true);

    // Also download PNG image
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `karya-ceria-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-amber-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950 flex items-center gap-2">
              <span>🎨</span> {t(lang, 'gameColoringTitle')}
            </h2>
            <p className="text-sm font-bold text-amber-800">
              {t(lang, 'gameColoringDesc')}
            </p>
          </div>

          <button
            onClick={handleSaveAndFinish}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm sm:text-base border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 shadow-md transition-all"
          >
            <Check className="w-5 h-5" />
            <span>Selesai & Simpan!</span>
          </button>
        </div>

        {/* Template Selectors */}
        <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t-2 border-amber-100">
          <span className="text-xs font-black text-amber-900 uppercase tracking-wide self-center mr-1">
            Pilih Gambar:
          </span>
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={tmpl.id}
              onClick={() => {
                soundManager.playPop();
                setTemplateIdx(idx);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${
                templateIdx === idx
                  ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                  : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              {tmpl.title[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-yellow-300 flex flex-col md:flex-row gap-6 items-center">
        {/* Drawing Canvas Container */}
        <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden border-4 border-amber-300 bg-white shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            className="w-full h-full cursor-crosshair touch-none"
          />

          {/* SVG Outline Overlay for Coloring Book mode */}
          {TEMPLATES[templateIdx].svg && (
            <div className="absolute inset-0 pointer-events-none">
              {TEMPLATES[templateIdx].svg}
            </div>
          )}
        </div>

        {/* Tools Palette */}
        <div className="flex-1 w-full flex flex-col gap-4">
          {/* Color swatches */}
          <div>
            <p className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2">
              Pilihan Warna:
            </p>
            <div className="grid grid-cols-6 gap-2.5 max-w-sm">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    soundManager.playClick();
                    setColor(c);
                    setIsMagicBrush(false);
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-10 h-10 rounded-2xl border-3 transition-transform active:scale-90 shadow-sm ${
                    !isMagicBrush && color === c
                      ? 'scale-115 border-black shadow-md'
                      : 'border-white hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Special Brushes: Rainbow Magic Brush & Eraser */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                soundManager.playStar();
                setIsMagicBrush(true);
              }}
              className={`flex-1 py-2 px-3 rounded-2xl font-black text-xs sm:text-sm border-2 flex items-center justify-center gap-1.5 transition-all ${
                isMagicBrush
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-purple-600 shadow-md scale-102'
                  : 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{t(lang, 'magicBrush')}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setColor('#FFFFFF');
                setIsMagicBrush(false);
              }}
              className={`py-2 px-3 rounded-2xl font-black text-xs sm:text-sm border-2 flex items-center justify-center gap-1.5 transition-all ${
                !isMagicBrush && color === '#FFFFFF'
                  ? 'bg-stone-300 border-stone-500 text-stone-900 shadow-sm'
                  : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>{t(lang, 'eraser')}</span>
            </button>
          </div>

          {/* Brush Sizes */}
          <div>
            <p className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2">
              {t(lang, 'penSize')}:
            </p>
            <div className="flex gap-2">
              {[8, 16, 26].map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    soundManager.playClick();
                    setBrushSize(sz);
                  }}
                  className={`flex-1 py-2 rounded-xl font-black text-xs border-2 flex items-center justify-center gap-2 ${
                    brushSize === sz
                      ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-sm'
                      : 'bg-white border-amber-200 text-amber-800'
                  }`}
                >
                  <span
                    style={{ width: sz, height: sz }}
                    className="rounded-full bg-amber-900 inline-block"
                  />
                  <span>{sz === 8 ? 'Kecil' : sz === 16 ? 'Sedang' : 'Besar'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons (Undo & Clear) */}
          <div className="flex gap-2 pt-2 border-t-2 border-amber-100">
            <button
              onClick={handleUndo}
              className="flex-1 py-2 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 font-extrabold text-amber-900 text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t(lang, 'undo')}</span>
            </button>

            <button
              onClick={handleClear}
              className="flex-1 py-2 px-3 rounded-2xl bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 font-extrabold text-rose-900 text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t(lang, 'clearDrawing')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        starsEarned={starsAwarded}
        newStickers={newStickers}
        lang={lang}
        onReplay={() => {
          setShowCelebration(false);
          initCanvas();
        }}
        onNext={() => {
          setShowCelebration(false);
          setTemplateIdx((templateIdx + 1) % TEMPLATES.length);
        }}
        onHome={onHome}
      />
    </div>
  );
};
