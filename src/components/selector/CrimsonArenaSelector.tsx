import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Flame, Zap } from "lucide-react";
import type { ListItem } from "@/lib/types";
import { sound } from "@/lib/sound";

interface CrimsonArenaSelectorProps {
  items: ListItem[];
  isSelecting: boolean;
  selectedItem: ListItem | null;
  animationDuration?: number;
  reducedMotion?: boolean;
  onAnimationComplete?: () => void;
}

export const CrimsonArenaSelector: React.FC<CrimsonArenaSelectorProps> = ({
  items,
  isSelecting,
  selectedItem,
  animationDuration = 2.5,
  reducedMotion = false,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cycleItem, setCycleItem] = useState<ListItem | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [podUnlocked, setPodUnlocked] = useState<boolean>(false);

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

  // Hydraulic Steam Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const steamParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      grow: number;
    }> = [];

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      if (isSelecting || podUnlocked) {
        for (let i = 0; i < 3; i++) {
          const isLeft = Math.random() > 0.5;
          steamParticles.push({
            x: isLeft ? w * 0.2 + (Math.random() - 0.5) * 30 : w * 0.8 + (Math.random() - 0.5) * 30,
            y: h - 15,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 3 + 2),
            r: Math.random() * 12 + 6,
            alpha: 0.45,
            grow: 0.35,
          });
        }
      }

      for (let i = steamParticles.length - 1; i >= 0; i--) {
        const p = steamParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.grow;
        p.alpha -= 0.008;

        if (p.alpha <= 0 || p.y < 0) {
          steamParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(220, 230, 255, ${p.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [isSelecting, podUnlocked]);

  // Autonomous kinetic selection & countdown buzzer loop
  useEffect(() => {
    if (!isSelecting) return;

    const reset = () => {
      setCountdown(null);
      setPodUnlocked(false);
    };

    const currentPool = itemsRef.current;
    if (currentPool.length === 0) return;

    if (reducedMotion) {
      const timer = setTimeout(() => {
        setPodUnlocked(true);
        const winner = selectedItemRef.current;
        if (winner) setCycleItem(winner);
        sound.playWweBuzzer();
        onAnimationCompleteRef.current?.();
      }, 350);
      return () => {
        clearTimeout(timer);
        reset();
      };
    }

    const durationMs = (animationDuration || 2.5) * 1000;
    const startTime = performance.now();
    let currentIdx = Math.floor(Math.random() * currentPool.length);
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    sound.playSteamRelease();

    let lastBeepSec = -1;

    const runCycle = () => {
      if (isCancelled) return;
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = elapsed / durationMs;
      const pool = itemsRef.current;

      if (pool.length === 0) return;
      const winner = selectedItemRef.current;

      // Arena Countdown: 5... 4... 3... 2... 1...
      const remainingSec = Math.ceil(Math.max(0, (durationMs - elapsed) / 1000));
      if (remainingSec <= 5 && remainingSec >= 1 && remainingSec !== lastBeepSec) {
        lastBeepSec = remainingSec;
        setCountdown(remainingSec);
        sound.playWweCountdownBeep(remainingSec === 1);
      }

      if ((progress < 1 || !winner) && elapsed < 8000) {
        currentIdx = (currentIdx + 1) % pool.length;
        setCycleItem(pool[currentIdx]);
        sound.playTick(0.8 + Math.random() * 0.4);

        const easeProgress = Math.min(1, Math.max(0, progress));
        const easeOutQuad = 1 - Math.pow(1 - easeProgress, 3);
        const interval = 35 + easeOutQuad * 260;

        timerId = setTimeout(runCycle, interval);
      } else {
        setCountdown(0);
        setPodUnlocked(true);
        sound.playWweBuzzer();
        sound.playSteamRelease();

        const finalWinner = winner || pool[currentIdx] || pool[0];
        setCycleItem(finalWinner);

        timerId = setTimeout(() => {
          if (!isCancelled) {
            onAnimationCompleteRef.current?.();
          }
        }, 350);
      }
    };

    runCycle();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      reset();
    };
  }, [isSelecting, animationDuration, reducedMotion]);

  return (
    <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[16/10] mx-auto flex items-center justify-center p-6 select-none overflow-hidden rounded-3xl border-2 border-rose-500/30 bg-[#070508]">
      {/* Industrial Steel Mesh pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#f43f5e 1px, transparent 1px), radial-gradient(#9333ea 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 8px 8px",
        }}
      />

      {/* Hydraulic Steam Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Siren Alert Beacons on Top */}
      <div className="absolute top-4 left-8 sm:left-14 flex items-center gap-2 pointer-events-none">
        <div
          className={`w-3.5 h-3.5 rounded-full border border-rose-500 transition-all ${
            isSelecting ? "bg-rose-500 shadow-[0_0_20px_#f43f5e] animate-ping" : "bg-rose-950 opacity-40"
          }`}
        />
      </div>

      <div className="absolute top-4 right-8 sm:right-14 flex items-center gap-2 pointer-events-none">
        <div
          className={`w-3.5 h-3.5 rounded-full border border-rose-500 transition-all ${
            isSelecting ? "bg-rose-500 shadow-[0_0_20px_#f43f5e] animate-ping" : "bg-rose-950 opacity-40"
          }`}
        />
      </div>

      {/* Center Chamber Frame */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Status Pill */}
        <div className="mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950 border border-rose-500/40 text-[11px] font-mono tracking-widest text-rose-400 uppercase shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>{isSelecting ? "Aligning Candidates" : "Ready"}</span>
        </div>

        {/* The Steel Frame */}
        <div
          className={`relative w-full rounded-2xl p-6 sm:p-7 transition-all duration-200 border-2 ${
            isSelecting
              ? "border-rose-500 bg-gradient-to-b from-[#220a14] via-[#15060d] to-[#0a0306] shadow-[0_0_40px_rgba(244,63,94,0.35)] scale-105"
              : "border-slate-800 bg-gradient-to-b from-[#140b12] to-[#0a0509] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          }`}
        >
          {/* Top Hazard Warning Stripes */}
          <div className="h-1.5 w-full rounded-full bg-[repeating-linear-gradient(45deg,#f43f5e,#f43f5e_10px,#000_10px,#000_20px)] mb-4 opacity-75" />

          {/* Countdown Clock Display */}
          {isSelecting && countdown !== null && (
            <div className="absolute top-2 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/90 border border-rose-500 text-rose-400 font-mono font-black text-xs tracking-widest animate-pulse shadow-[0_0_15px_#f43f5e]">
              <span className="text-[10px] text-slate-400">TIMER:</span>
              <span className="text-base text-white">0{countdown}</span>
            </div>
          )}

          {/* Center Chamber Display */}
          <div className="min-h-[110px] sm:min-h-[130px] flex items-center justify-center text-center">
            {items.length === 0 ? (
              <div className="text-slate-500 font-mono text-xs">
                [ List is empty • Add items to begin ]
              </div>
            ) : (
              <div
                className={`transition-all duration-100 ${
                  isSelecting
                    ? "scale-105 text-rose-200 filter drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]"
                    : "scale-100 text-white"
                }`}
              >
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none break-words max-w-sm drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  {activeItem?.value}
                </h1>
              </div>
            )}
          </div>

          {/* Bottom Hazard Warning Stripes */}
          <div className="h-1.5 w-full rounded-full bg-[repeating-linear-gradient(45deg,#f43f5e,#f43f5e_10px,#000_10px,#000_20px)] mt-4 opacity-75" />
        </div>

        {/* Item Count */}
        <div className="mt-4 flex items-center gap-3 text-xs font-mono text-rose-400/80">
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span>
            {items.length} {items.length === 1 ? "Item" : "Items"} in List
          </span>
          <Zap className="w-3.5 h-3.5 text-rose-400" />
        </div>
      </div>
    </div>
  );
};
