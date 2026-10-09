import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Sparkles, Trophy } from "lucide-react";
import type { ListItem } from "@/lib/types";
import { sound } from "@/lib/sound";

interface GoldStadiumSelectorProps {
  items: ListItem[];
  isSelecting: boolean;
  selectedItem: ListItem | null;
  animationDuration?: number;
  reducedMotion?: boolean;
  onAnimationComplete?: () => void;
}

export const GoldStadiumSelector: React.FC<GoldStadiumSelectorProps> = ({
  items,
  isSelecting,
  selectedItem,
  animationDuration = 2.5,
  reducedMotion = false,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cycleItem, setCycleItem] = useState<ListItem | null>(null);

  const onAnimationCompleteRef = useRef(onAnimationComplete);

  const selectedItemRef = useRef(selectedItem);

  const itemsRef = useRef(items);

  // Keep the latest props in refs so the animation loop does not restart mid-run.
  useLayoutEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
    selectedItemRef.current = selectedItem;
    itemsRef.current = items;
  });

  const activeItem = isSelecting
    ? cycleItem || items[0] || null
    : selectedItem || items[0] || null;

  // Stadium lights, ambient glow, and gold pyrotechnic spark canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let spotlightAngle = 0;

    const sparks: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "rgba(251, 191, 36,", // amber-400
      "rgba(253, 224, 71,", // yellow-300
      "rgba(245, 158, 11,", // amber-500
      "rgba(255, 255, 255,", // white
    ];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Sweeping stadium floodlights
      spotlightAngle += isSelecting ? 0.04 : 0.008;

      ctx.save();
      const leftSpotX = Math.sin(spotlightAngle) * (w * 0.3) + w * 0.35;
      const rightSpotX = Math.cos(spotlightAngle) * (w * 0.3) + w * 0.65;

      // Left spotlight cone
      const gradLeft = ctx.createRadialGradient(0, 0, 10, leftSpotX, h, w * 0.5);
      gradLeft.addColorStop(0, isSelecting ? "rgba(251, 191, 36, 0.25)" : "rgba(251, 191, 36, 0.08)");
      gradLeft.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradLeft;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(leftSpotX - 80, h);
      ctx.lineTo(leftSpotX + 80, h);
      ctx.closePath();
      ctx.fill();

      // Right spotlight cone
      const gradRight = ctx.createRadialGradient(w, 0, 10, rightSpotX, h, w * 0.5);
      gradRight.addColorStop(0, isSelecting ? "rgba(253, 224, 71, 0.25)" : "rgba(253, 224, 71, 0.08)");
      gradRight.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradRight;
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(rightSpotX - 80, h);
      ctx.lineTo(rightSpotX + 80, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Pyrotechnic spark fountains when selecting
      if (isSelecting) {
        for (let i = 0; i < 4; i++) {
          const isLeft = Math.random() > 0.5;
          const originX = isLeft ? w * 0.15 : w * 0.85;
          sparks.push({
            x: originX + (Math.random() - 0.5) * 40,
            y: h - 10,
            vx: (isLeft ? 1 : -1) * (Math.random() * 2 + 0.5) + (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 7 + 4),
            size: Math.random() * 2.5 + 1,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.02;

        if (p.alpha <= 0 || p.y > h) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [isSelecting]);

  // Autonomous kinetic selection loop
  useEffect(() => {
    if (!isSelecting) return;

    const currentPool = itemsRef.current;
    if (currentPool.length === 0) return;

    if (reducedMotion) {
      const timer = setTimeout(() => {
        const winner = selectedItemRef.current;
        if (winner) setCycleItem(winner);
        sound.playFifaWalkoutDrop();
        onAnimationCompleteRef.current?.();
      }, 350);
      return () => clearTimeout(timer);
    }

    const durationMs = (animationDuration || 2.5) * 1000;
    sound.playFifaRiser(animationDuration || 2.5);

    const startTime = performance.now();
    let currentIdx = Math.floor(Math.random() * currentPool.length);
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    const runCycle = () => {
      if (isCancelled) return;
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = elapsed / durationMs;
      const pool = itemsRef.current;

      if (pool.length === 0) return;
      const winner = selectedItemRef.current;

      if ((progress < 1 || !winner) && elapsed < 8000) {
        currentIdx = (currentIdx + 1) % pool.length;
        setCycleItem(pool[currentIdx]);
        sound.playTick(1.2 + Math.random() * 0.3);

        const easeProgress = Math.min(1, Math.max(0, progress));
        const easeOutQuad = 1 - Math.pow(1 - easeProgress, 3);
        const interval = 35 + easeOutQuad * 260;

        timerId = setTimeout(runCycle, interval);
      } else {
        const finalWinner = winner || pool[currentIdx] || pool[0];
        setCycleItem(finalWinner);
        sound.playFifaWalkoutDrop();

        timerId = setTimeout(() => {
          if (!isCancelled) {
            onAnimationCompleteRef.current?.();
          }
        }, 300);
      }
    };

    runCycle();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [isSelecting, animationDuration, reducedMotion]);

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[16/10] mx-auto flex items-center justify-center p-6 select-none overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#090b14] via-[#0e101a] to-[#08090f]">
      {/* Stadium Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Stadium Pitch Glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isSelecting
            ? "bg-[radial-gradient(ellipse_at_bottom,_rgba(245,158,11,0.25)_0%,_transparent_70%)] opacity-100"
            : "bg-[radial-gradient(ellipse_at_bottom,_rgba(245,158,11,0.08)_0%,_transparent_60%)] opacity-60"
        }`}
      />

      {/* Pyrotechnic Stage Flare Pillars */}
      <div className="absolute bottom-0 left-6 sm:left-12 flex flex-col items-center pointer-events-none">
        <div
          className={`w-3 h-10 rounded-t-lg bg-amber-400 transition-all duration-300 ${
            isSelecting ? "shadow-[0_0_25px_rgba(245,158,11,0.9)] h-16 animate-pulse" : "opacity-40"
          }`}
        />
        <div className="w-8 h-3 rounded-b-md bg-slate-900 border border-amber-500/40" />
      </div>
      <div className="absolute bottom-0 right-6 sm:right-12 flex flex-col items-center pointer-events-none">
        <div
          className={`w-3 h-10 rounded-t-lg bg-amber-400 transition-all duration-300 ${
            isSelecting ? "shadow-[0_0_25px_rgba(245,158,11,0.9)] h-16 animate-pulse" : "opacity-40"
          }`}
        />
        <div className="w-8 h-3 rounded-b-md bg-slate-900 border border-amber-500/40" />
      </div>

      {/* Centerpiece: Gold Shield Card Aesthetic */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Status Pill */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/80 border border-amber-400/40 text-[11px] font-mono tracking-widest text-amber-300 uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{isSelecting ? "Aligning Candidates" : "Ready"}</span>
        </div>

        {/* Gold Shield Card Frame */}
        <div
          className={`relative w-full max-w-[280px] sm:max-w-[320px] rounded-2xl p-7 transition-all duration-300 border-2 ${
            isSelecting
              ? "scale-105 border-amber-400 bg-gradient-to-b from-[#2a210d] via-[#1a140a] to-[#0c0905] shadow-[0_0_50px_rgba(245,158,11,0.4)]"
              : "scale-100 border-amber-500/40 bg-gradient-to-b from-[#1c160a] via-[#120f06] to-[#070603] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
          }`}
          style={{
            clipPath:
              "polygon(10% 0%, 90% 0%, 100% 8%, 100% 88%, 50% 100%, 0% 88%, 0% 8%)",
          }}
        >
          {/* Subtle Top Gold Accent Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mb-4" />

          {/* Center: Dynamic Candidate Reveal */}
          <div className="min-h-[110px] sm:min-h-[130px] flex items-center justify-center text-center py-2">
            {items.length === 0 ? (
              <div className="text-slate-500 font-mono text-xs">
                [ List is empty • Add items to begin ]
              </div>
            ) : (
              <div
                className={`transition-all duration-150 ${
                  isSelecting
                    ? "scale-105 text-amber-200 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]"
                    : "scale-100 text-white filter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                }`}
              >
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase leading-tight max-w-[240px] break-words">
                  {activeItem?.value}
                </h1>
              </div>
            )}
          </div>

          {/* Subtle Bottom Gold Accent Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mt-4" />
        </div>

        {/* Item count */}
        <div className="mt-4 flex items-center gap-3 text-xs font-mono text-amber-400/70">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>
            {items.length} {items.length === 1 ? "Item" : "Items"} in List
          </span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
      </div>
    </div>
  );
};
