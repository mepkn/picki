import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import type { ListItem } from "@/lib/types";
import { sound } from "@/lib/sound";

interface HolographicSelectorProps {
  items: ListItem[];
  isSelecting: boolean;
  selectedItem: ListItem | null;
  animationDuration?: number; // seconds
  reducedMotion?: boolean;
  onAnimationComplete?: () => void;
}

export const HolographicSelector: React.FC<HolographicSelectorProps> = ({
  items,
  isSelecting,
  selectedItem,
  animationDuration = 2.5,
  reducedMotion = false,
  onAnimationComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cycleItem, setCycleItem] = useState<ListItem | null>(null);

  // Stable references for props to avoid re-triggering effects during animation
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

  // Background particles and reticle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    const particles: Array<{ x: number; y: number; r: number; speed: number; alpha: number }> = [];

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 400),
        y: Math.random() * (canvas.height || 400),
        r: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Floating particles
      particles.forEach((p) => {
        p.y -= p.speed * (isSelecting ? 3 : 1);
        if (p.y < 0) p.y = canvas.height;
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rotating HUD outer rings
      const radius = Math.min(cx, cy) * 0.85;
      angle += isSelecting ? 0.08 : 0.005;

      ctx.save();
      ctx.translate(cx, cy);

      // Outer dashed cyan ring
      ctx.beginPath();
      ctx.arc(0, 0, radius, angle, angle + Math.PI * 1.5);
      ctx.strokeStyle = isSelecting ? "rgba(0, 240, 255, 0.6)" : "rgba(0, 240, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.stroke();

      // Inner counter-rotating purple ring
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.82, -angle * 1.2, -angle * 1.2 + Math.PI * 1.2);
      ctx.strokeStyle = isSelecting ? "rgba(139, 92, 246, 0.6)" : "rgba(139, 92, 246, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 8]);
      ctx.stroke();

      // Corner target brackets
      const corner = radius * 0.95;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      const bracketLen = 16;
      ctx.beginPath();
      ctx.moveTo(-corner, -corner + bracketLen);
      ctx.lineTo(-corner, -corner);
      ctx.lineTo(-corner + bracketLen, -corner);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(corner - bracketLen, -corner);
      ctx.lineTo(corner, -corner);
      ctx.lineTo(corner, -corner + bracketLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-corner, corner - bracketLen);
      ctx.lineTo(-corner, corner);
      ctx.lineTo(-corner + bracketLen, corner);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(corner - bracketLen, corner);
      ctx.lineTo(corner, corner);
      ctx.lineTo(corner, corner - bracketLen);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [isSelecting]);

  // Autonomous selection kinetic animation
  // Only starts when isSelecting switches to true, NEVER restarts mid-spin
  useEffect(() => {
    if (!isSelecting) return;
    const currentPool = itemsRef.current;
    if (currentPool.length === 0) return;

    if (reducedMotion) {
      const timer = setTimeout(() => {
        const winner = selectedItemRef.current;
        if (winner) setCycleItem(winner);
        sound.playLock();
        onAnimationCompleteRef.current?.();
      }, 350);
      return () => clearTimeout(timer);
    }

    const durationMs = (animationDuration || 2.5) * 1000;
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

      // Cycle while within duration OR if waiting for backend to return winner (max 8s safety cap)
      if ((progress < 1 || !winner) && elapsed < 8000) {
        currentIdx = (currentIdx + 1) % pool.length;
        setCycleItem(pool[currentIdx]);
        sound.playTick(1 + Math.random() * 0.2);

        const easeProgress = Math.min(1, Math.max(0, progress));
        const easeOutQuad = 1 - Math.pow(1 - easeProgress, 3);
        const interval = 35 + easeOutQuad * 260;

        timerId = setTimeout(runCycle, interval);
      } else {
        // Duration reached AND winner is resolved (or safety cap reached)
        const finalWinner = winner || pool[currentIdx] || pool[0];
        setCycleItem(finalWinner);
        sound.playLock();
        timerId = setTimeout(() => {
          if (!isCancelled) {
            onAnimationCompleteRef.current?.();
          }
        }, 200);
      }
    };

    runCycle();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [isSelecting, animationDuration, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[16/10] mx-auto flex items-center justify-center p-6 select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Hologram Projector Glow Beams */}
      <div
        className={`absolute inset-16 rounded-full transition-all duration-700 pointer-events-none ${
          isSelecting
            ? "bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-3xl scale-110"
            : "bg-cyan-500/5 blur-2xl scale-90"
        }`}
      />

      {/* Center Target Chamber */}
      <div className="relative z-10 w-full px-6 flex flex-col items-center justify-center text-center">
        {/* HUD Status label */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[11px] font-mono tracking-widest text-cyan-400 uppercase">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSelecting ? "bg-amber-400 animate-ping" : "bg-cyan-400 animate-pulse"
            }`}
          />
          {isSelecting ? "Aligning Candidates" : "Ready"}
        </div>

        {/* Dynamic Display Chamber */}
        <div className="min-h-[110px] sm:min-h-[140px] flex items-center justify-center w-full px-4">
          {items.length === 0 ? (
            <div className="text-slate-500 font-mono text-sm tracking-wide">
              [ List is empty • Add items to begin ]
            </div>
          ) : (
            <div
              className={`transition-all duration-150 transform ${
                isSelecting
                  ? "scale-105 text-cyan-200 filter drop-shadow-[0_0_20px_rgba(0,240,255,0.7)]"
                  : "scale-100 text-white filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              }`}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight break-words max-w-lg leading-tight">
                {activeItem?.value}
              </h1>
            </div>
          )}
        </div>

        {/* Hologram Base Plate */}
        <div className="mt-4 flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500/40" />
          <span className="text-[11px] text-cyan-400/80">
            {items.length} {items.length === 1 ? "Item" : "Items"} in List
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500/40" />
        </div>
      </div>
    </div>
  );
};
