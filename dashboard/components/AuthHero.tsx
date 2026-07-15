"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// ─── 3D Sphere Renderer ────────────────────────────────────────────────────
// Fibonacci sphere distribution rendered on Canvas with real 3D projection

function generateSpherePoints(count: number, radius: number) {
  const points: { x: number; y: number; z: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    points.push({
      x: Math.cos(theta) * radiusAtY * radius,
      y: y * radius,
      z: Math.sin(theta) * radiusAtY * radius,
    });
  }
  return points;
}

function SphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angleX = 0;
    let angleY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragging = false;
    let pointerId = -1;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    const friction = 0.94;
    const autoX = 0.0012;
    const autoY = 0.002;

    const points = generateSpherePoints(500, 1);
    const fov = 400;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    function rotatePoint(px: number, py: number, pz: number, ax: number, ay: number) {
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      const y1 = py * cosX - pz * sinX;
      const z1 = py * sinX + pz * cosX;
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      const x2 = px * cosY + z1 * sinY;
      const z2 = -px * sinY + z1 * cosY;
      return { x: x2, y: y1, z: z2 };
    }

    function onPointerDown(e: PointerEvent) {
      if (dragging) return;
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      velocityX = 0;
      velocityY = 0;
      container!.setPointerCapture(e.pointerId);
      container!.style.cursor = "grabbing";
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging || e.pointerId !== pointerId) return;

      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      angleY += dx * 0.005;
      angleX -= dy * 0.005;

      velocityX = -(dy / dt) * 16;
      velocityY = (dx / dt) * 16;

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    }

    function onPointerUp(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      container!.style.cursor = "grab";
    }

    function draw() {
      if (!canvas || !ctx) return;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      if (!dragging) {
        velocityX *= friction;
        velocityY *= friction;
        angleX += velocityX * 0.005;
        angleY += velocityY * 0.005;

        if (Math.abs(velocityX) < 0.01 && Math.abs(velocityY) < 0.01) {
          angleX += autoX;
          angleY += autoY;
        }
      }

      const projected = points
        .map((p) => {
          const r = rotatePoint(p.x, p.y, p.z, angleX, angleY);
          const scale = fov / (fov + r.z);
          return {
            x: w / 2 + r.x * scale * 260,
            y: h / 2 + r.y * scale * 260,
            z: r.z,
            scale,
          };
        })
        .sort((a, b) => a.z - b.z);

      for (const p of projected) {
        const depth01 = (p.z + 1) / 2;
        const opacity = 0.05 + depth01 * 0.6;
        const radius = (0.6 + depth01 * 3.0) * p.scale;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
    </div>
  );
}

export function AuthHero({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="relative w-full h-full bg-[#060606] overflow-hidden flex flex-col">
      {/* Real 3D sphere */}
      <div className="absolute inset-0 z-10">
        <SphereCanvas />
      </div>

      {/* Grain overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        aria-hidden="true"
      >
        <filter id="hero-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 30%, rgba(6,6,6,0.7) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-end h-full p-12 lg:p-16 pointer-events-none">
        {/* Bottom: editorial copy */}
        <div className="space-y-5">
          <div className="w-8 h-px bg-white/20" />
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.25em]">
              AI-Powered Outbound
            </p>
            <h2 className="text-4xl lg:text-[44px] font-semibold text-white leading-[1.05] tracking-tight">
              {mode === "login" ? (
                <>
                  Your pipeline,
                  <br />
                  <span className="text-white/35">on autopilot.</span>
                </>
              ) : (
                <>
                  Close more.
                  <br />
                  <span className="text-white/35">Work less.</span>
                </>
              )}
            </h2>
          </div>
          <p className="text-[14px] text-white/35 leading-relaxed max-w-[260px]">
            Knight finds prospects, writes perfect pitches, and books meetings
            — while you sleep.
          </p>
          <p className="text-[10px] text-white/15 tracking-widest font-mono">
            © {new Date().getFullYear()} KNIGHT
          </p>
        </div>
      </div>
    </div>
  );
}
