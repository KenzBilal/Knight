"use client";

import { useEffect, useRef } from "react";

// ─── Knight Scroll Path — Canvas implementation ────────────────────────────────
// Uses Canvas API instead of SVG for true GPU-composited rendering.
// SVG pathLength causes CPU repaints every frame — canvas does not.
// ──────────────────────────────────────────────────────────────────────────────

const PATH_D =
  "M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89";

const VIEWBOX_W = 1278;
const VIEWBOX_H = 2319;
const LERP_FACTOR = 0.06; // smoothing — higher = faster catch-up

export function ScrollPathDecoration({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── Measure total path length via a hidden offscreen SVG ──────────────────
    const svgNS = "http://www.w3.org/2000/svg";
    const tmpSvg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
    const tmpPath = document.createElementNS(svgNS, "path") as SVGPathElement;
    tmpPath.setAttribute("d", PATH_D);
    tmpSvg.setAttribute(
      "style",
      "position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden"
    );
    tmpSvg.appendChild(tmpPath);
    document.body.appendChild(tmpSvg);
    const totalLength = tmpPath.getTotalLength();
    document.body.removeChild(tmpSvg);

    // ── Reuse Path2D — parsed once, drawn every frame ─────────────────────────
    const path2D = new Path2D(PATH_D);

    let progress = 0;
    let target = 0;
    let lastProgress = -1;
    let rafId: number;
    let alive = true;

    let offscreenCanvas: HTMLCanvasElement | null = null;
    let offscreenCtx: CanvasRenderingContext2D | null = null;

    function resize() {
      if (!canvas) return;
      // Cap DPR to prevent massive Canvas memory allocation on 4k/retina
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      // Cache the static ghost track so we don't recalculate the full SVG path every frame
      if (!offscreenCanvas) {
        offscreenCanvas = document.createElement("canvas");
        offscreenCtx = offscreenCanvas.getContext("2d", { alpha: true });
      }
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;

      if (offscreenCtx) {
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const scaleX = offscreenCanvas.width / VIEWBOX_W;
        const scaleY = offscreenCanvas.height / VIEWBOX_H;
        offscreenCtx.save();
        offscreenCtx.scale(scaleX, scaleY);
        offscreenCtx.strokeStyle = "rgba(255,255,255,0.05)";
        offscreenCtx.lineWidth = 20;
        offscreenCtx.lineCap = "round";
        offscreenCtx.lineJoin = "round";
        offscreenCtx.stroke(path2D);
        offscreenCtx.restore();
      }

      lastProgress = -1; // force redraw
    }

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Blit the cached ghost track in 1 GPU instruction
      if (offscreenCanvas) {
        ctx.drawImage(offscreenCanvas, 0, 0);
      }

      const drawnLength = totalLength * progress;
      if (drawnLength < 0.5) return;

      const scaleX = W / VIEWBOX_W;
      const scaleY = H / VIEWBOX_H;

      ctx.save();
      ctx.scale(scaleX, scaleY);
      
      // Global stroke settings
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const dashPattern: [number, number] = [drawnLength, totalLength + 10];
      ctx.setLineDash(dashPattern);

      // ── FAKE GLOW (No shadowBlur math) ──
      
      // Pass 1: Wide faint outer glow
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 32;
      ctx.stroke(path2D);

      // Pass 2: Medium semi-transparent inner glow
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 14;
      ctx.stroke(path2D);

      // Pass 3: Sharp bright core
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 3;
      ctx.stroke(path2D);

      ctx.restore();
    }

    // ── rAF loop: lerp + conditional draw ─────────────────────────────────────
    function tick() {
      if (!alive) return;
      progress += (target - progress) * LERP_FACTOR;

      if (Math.abs(progress - lastProgress) > 0.0003) {
        draw();
        lastProgress = progress;
      }

      rafId = requestAnimationFrame(tick);
    }

    // ── Passive scroll: never blocks main thread ───────────────────────────────
    function onScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      target = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }

    function onResize() {
      resize();
      draw();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    resize();
    onScroll();
    rafId = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      // will-change: transform → promotes to own GPU compositor layer
      // browser never repaints page content alongside this canvas
      style={{ willChange: "transform" }}
    />
  );
}
