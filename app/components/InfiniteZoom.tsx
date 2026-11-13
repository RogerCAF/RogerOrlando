"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Maximize2, Minimize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import "./infinite-zoom.css";

type ColorSet = [string, string, string, string];

const WORLDS: ColorSet[] = [
  ["#0a1325", "#263653", "#f8d5a1", "#ea997a"],
  ["#061c20", "#175550", "#b4f4d2", "#5ecebb"],
  ["#1b102c", "#422a67", "#ebd1ff", "#ac8eff"],
  ["#200d21", "#59274b", "#ffd1c5", "#ff8eaa"],
  ["#0b162b", "#214f81", "#c7e6ff", "#70aff0"],
  ["#1b190e", "#514523", "#fff0af", "#e0bf69"],
  ["#0a1a20", "#23565c", "#b5f5e9", "#6acbcc"],
];

function random(seed: number) {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function drawWorld(ctx: CanvasRenderingContext2D, index: number, size: number, cx: number, cy: number) {
  if (size < 3) return;
  const colors = WORLDS[((index % WORLDS.length) + WORLDS.length) % WORLDS.length];
  const [dark, middle, light, accent] = colors;
  const shift = ((index % 5) + 5) % 5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(size / 840, size / 840);
  ctx.beginPath();
  ctx.rect(-420, -420, 840, 840);
  ctx.clip();

  const background = ctx.createLinearGradient(-420, -420, 420, 420);
  background.addColorStop(0, dark);
  background.addColorStop(0.54, middle);
  background.addColorStop(1, dark);
  ctx.fillStyle = background;
  ctx.fillRect(-420, -420, 840, 840);

  // Fine cartographic grid and a soft vignette create detail without a heavy image asset.
  ctx.strokeStyle = light + "16";
  ctx.lineWidth = 1;
  for (let xy = -420; xy <= 420; xy += 42) {
    ctx.beginPath(); ctx.moveTo(xy, -420); ctx.lineTo(xy, 420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-420, xy); ctx.lineTo(420, xy); ctx.stroke();
  }

  // Each world has a slightly different visual language.
  if (shift === 0 || shift === 3) {
    for (let i = 0; i < 25; i++) {
      const x = -420 + i * 35;
      const height = 90 + random(index * 119 + i + 1) * 260;
      const width = 16 + random(i * 15 + index) * 22;
      ctx.fillStyle = i % 3 === 0 ? accent + "9c" : dark + "d0";
      ctx.fillRect(x, 420 - height, width, height);
      ctx.fillRect(x, -420, width, height * 0.38);
      ctx.fillStyle = light + "a0";
      for (let y = 420 - height + 16; y < 405; y += 17) {
        if (random(index * 47 + y * 2 + i) > 0.4) ctx.fillRect(x + 6, y, 3, 5);
      }
    }
  } else if (shift === 1) {
    for (let i = 0; i < 24; i++) {
      const angle = i * Math.PI * 2 / 24;
      const radius = 240 + random(index * 12 + i) * 145;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.strokeStyle = accent + "a0"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, -45); ctx.quadraticCurveTo(65, -8, 0, 50);
      ctx.quadraticCurveTo(-58, -8, 0, -45); ctx.stroke();
      ctx.fillStyle = light + "2c"; ctx.fill();
      ctx.restore();
    }
  } else if (shift === 2) {
    ctx.lineWidth = 3;
    for (let i = 0; i < 22; i++) {
      const p = -400 + i * 38;
      ctx.strokeStyle = i % 2 ? accent + "7a" : light + "50";
      ctx.beginPath();
      ctx.moveTo(-420, p); ctx.lineTo(-320 + i % 4 * 38, p);
      ctx.lineTo(-235 + i % 4 * 38, p + 52); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(420, -p); ctx.lineTo(320 - i % 4 * 38, -p);
      ctx.lineTo(235 - i % 4 * 38, -p - 52); ctx.stroke();
      ctx.fillStyle = light; ctx.beginPath(); ctx.arc(-320 + i % 4 * 38, p, 4, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    for (let i = 0; i < 20; i++) {
      const x = (random(index * 17 + i) - 0.5) * 840;
      const y = (random(index * 31 + i) - 0.5) * 840;
      const r = 40 + random(i * 91 + index) * 160;
      ctx.strokeStyle = i % 2 ? accent + "5a" : light + "4a";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // Orbital arcs, star-map annotations and small recurring marks tie all worlds together.
  for (let i = 0; i < 12; i++) {
    const radius = 118 + i * 27;
    ctx.beginPath();
    ctx.arc(0, 0, radius, (i * 0.53 + shift) % 6.28, (i * 0.53 + shift) % 6.28 + 1.0 + (i % 3) * 0.42);
    ctx.strokeStyle = i % 3 === 0 ? accent + "ce" : light + "52";
    ctx.lineWidth = i % 4 === 0 ? 3 : 1.2;
    ctx.stroke();
  }
  for (let i = 0; i < 90; i++) {
    const x = (random(index * 345 + i * 1.7) - 0.5) * 810;
    const y = (random(index * 532 + i * 2.3) - 0.5) * 810;
    ctx.fillStyle = i % 6 === 0 ? accent : light + "a0";
    ctx.beginPath(); ctx.arc(x, y, i % 9 === 0 ? 2.8 : 1.2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.strokeStyle = light + "78";
  ctx.lineWidth = 1;
  ctx.strokeRect(-403, -403, 806, 806);
  ctx.strokeRect(-389, -389, 778, 778);
  for (const x of [-380, 380]) {
    for (const y of [-380, 380]) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x + 16, y);
      ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 16); ctx.stroke();
    }
  }

  ctx.textAlign = "left";
  ctx.fillStyle = light;
  ctx.font = "600 18px Arial, sans-serif";
  ctx.fillText("ROGER / WORLDS WITHOUT END", -354, -330);
  ctx.fillStyle = accent;
  ctx.font = "600 12px Arial, sans-serif";
  ctx.fillText("EXPLORE  /  " + String(Math.max(0, index + 1)).padStart(3, "0"), -352, -300);
  ctx.font = "700 48px Georgia, serif";
  ctx.fillText(["BEYOND.", "DISCOVER.", "INFINITY.", "NO LIMITS.", "WONDER."][shift], -352, 322);
  ctx.fillStyle = light + "c0";
  ctx.font = "500 13px Arial, sans-serif";
  ctx.fillText("ZOOM OUT TO REVEAL THE NEXT WORLD", -349, 349);

  // Nested square aperture: the next scene occupies this precise center.
  const aperture = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
  aperture.addColorStop(0, dark);
  aperture.addColorStop(1, middle);
  ctx.fillStyle = aperture;
  ctx.fillRect(-73, -73, 146, 146);
  ctx.strokeStyle = light + "bd";
  ctx.lineWidth = 2;
  ctx.strokeRect(-73, -73, 146, 146);
  ctx.strokeStyle = accent + "ab";
  ctx.strokeRect(-81, -81, 162, 162);

  ctx.restore();
}

function paint(canvas: HTMLCanvasElement, level: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width <= 0 || height <= 0) return;
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = "#070b11";
  ctx.fillRect(0, 0, width, height);
  const base = Math.min(470, Math.max(210, Math.min(width * 0.75, height * 0.87)));
  const first = Math.floor(level);
  for (let i = first + 4; i >= first - 4; i--) {
    const size = base * Math.pow(6, i - level);
    if (size > Math.max(width, height) * 12 || size < 2) continue;
    drawWorld(ctx, i, size, width / 2, height / 2);
  }
  // A quiet atmospheric border remains fixed while the universes move behind it.
  const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.1, width / 2, height / 2, Math.max(width, height) * 0.78);
  vignette.addColorStop(0, "#00000000");
  vignette.addColorStop(1, "#05070dd8");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export default function InfiniteZoom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentLevel = useRef(0.25);
  const targetLevel = useRef(0.25);
  const playingRef = useRef(false);
  const pointerPositions = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistance = useRef<number | null>(null);
  const [full, setFull] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [world, setWorld] = useState(1);

  const zoom = (steps: number) => {
    targetLevel.current = Math.max(-0.5, targetLevel.current + steps);
  };
  const reset = () => {
    targetLevel.current = 0.25;
    playingRef.current = false;
    setPlaying(false);
  };
  const togglePlay = () => {
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
  };

  useEffect(() => {
    let frame = 0;
    let dirty = true;
    let lastWorld = 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => { dirty = true; });
    observer.observe(canvas);
    const loop = () => {
      if (!document.hidden) {
        if (playingRef.current) targetLevel.current += 0.006;
        const difference = targetLevel.current - currentLevel.current;
        if (Math.abs(difference) > 0.00015) {
          currentLevel.current += difference * 0.13;
          dirty = true;
        }
        if (dirty) {
          paint(canvas, currentLevel.current);
          dirty = false;
          const nextWorld = Math.max(1, Math.floor(currentLevel.current) + 1);
          if (nextWorld !== lastWorld) { lastWorld = nextWorld; setWorld(nextWorld); }
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!full) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFull(false);
      if (event.key === "ArrowDown" || event.key === "-") zoom(0.23);
      if (event.key === "ArrowUp" || event.key === "+") zoom(-0.23);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  const distance = () => {
    const pts = [...pointerPositions.current.values()];
    return pts.length < 2 ? null : Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  return (
    <section className={full ? "iz-wrap iz-full" : "iz-wrap"} aria-label="Interactieve Infinite Zoom ervaring">
      <div className="iz-top">
        <div><span className="iz-mini-dot" /> INTERACTIVE EXPERIMENT <span className="iz-index">/ 002</span></div>
        <button type="button" className="iz-expand" onClick={() => setFull(v => !v)}>
          {full ? <X size={16} /> : <Maximize2 size={16} />}
          {full ? "SLUIT ERVARING" : "OPEN FULL EXPERIENCE"}
        </button>
      </div>
      <div className="iz-stage">
        <canvas
          ref={canvasRef}
          className="iz-canvas"
          aria-label="Procedurele, eindeloos uitzoomende werelden"
          onWheel={event => {
            if (!full) return;
            event.preventDefault();
            zoom(event.deltaY / 420);
          }}
          onPointerDown={event => {
            if (!full) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            pointerPositions.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
            pinchDistance.current = distance();
          }}
          onPointerMove={event => {
            if (!full || !pointerPositions.current.has(event.pointerId)) return;
            pointerPositions.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
            const next = distance();
            if (next !== null && pinchDistance.current !== null && next > 5 && pinchDistance.current > 5) {
              zoom(Math.log(pinchDistance.current / next) / Math.log(6));
            }
            pinchDistance.current = next;
          }}
          onPointerUp={event => {
            pointerPositions.current.delete(event.pointerId);
            pinchDistance.current = distance();
          }}
          onPointerCancel={event => {
            pointerPositions.current.delete(event.pointerId);
            pinchDistance.current = distance();
          }}
        />
        <div className="iz-overlay-top" aria-hidden="true"><span><i /> LIVE GENERATIVE CANVAS</span><span>WORLD {String(world).padStart(3, "0")} / ∞</span></div>
        {!full && (
          <div className="iz-intro">
            <span className="iz-caption">A WORLD INSIDE A WORLD INSIDE A WORLD</span>
            <h3>There is no <em>last frame.</em></h3>
            <p>Zoom steeds verder uit. Achter elke wereld wacht een nieuwe.</p>
            <button type="button" onClick={() => setFull(true)}>START EXPLORING <ArrowUpRight size={17} /></button>
          </div>
        )}
        {full && <div className="iz-hint">SCROLL TO ZOOM · PINCH ON MOBILE · ESC TO CLOSE</div>}
        <div className="iz-controls">
          <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => zoom(-0.3)}><Plus size={18}/></button>
          <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => zoom(0.3)}><Minus size={18}/></button>
          <span className="iz-control-line" />
          <button type="button" className={playing ? "iz-autoplay active" : "iz-autoplay"} onClick={togglePlay} aria-label={playing ? "Stop automatisch uitzoomen" : "Automatisch uitzoomen"} title="Automatisch uitzoomen">{playing ? "Ⅱ" : "▶"}</button>
          <button type="button" aria-label="Reset zoom" title="Reset" onClick={reset}><RotateCcw size={17}/></button>
        </div>
      </div>
      <div className="iz-bottom">
        <div><strong>INFINITE ZOOM</strong><span>Endless exploration · Interactive artwork</span></div>
        <span className="iz-bottom-note"><Minimize2 size={14}/> MADE TO GET LOST IN</span>
      </div>
    </section>
  );
}
