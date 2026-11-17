"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Maximize2, X } from "lucide-react";
import "./bureau-game.css";

/**
 * Same-origin Bureau embed. Keep the original interactive artwork and hotspots,
 * but detach the illustration from its room backdrop and its former framed stage.
 */
export default function BureauExperience() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameRef = useRef<HTMLIFrameElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [gameOpen, setGameOpen] = useState(false);

  useEffect(() => {
    if (!gameOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setGameOpen(false); };
    const message = (event: MessageEvent) => {
      if (event.origin === window.location.origin &&
          event.source === gameRef.current?.contentWindow &&
          event.data?.type === "bureau:close-unfinished") setGameOpen(false);
    };
    document.addEventListener("keydown", escape);
    window.addEventListener("message", message);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", escape);
      window.removeEventListener("message", message);
    };
  }, [gameOpen]);

  const prepareScene = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const document = frame.contentDocument;
      const window = frame.contentWindow;
      if (!document || !window) return;

      const style = document.createElement("style");
      style.id = "bureau-seamless-portfolio";
      style.textContent = `
        html.bureau-embed,
        html.bureau-embed body,
        .bureau-embed .scene-outer {
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
        .bureau-embed .scene-outer::before,
        .bureau-embed .scene-outer::after,
        .bureau-embed .scene .ambience { display: none !important; }
        .bureau-embed .scene,
        .bureau-embed .scene:not(.lights-off) {
          box-shadow: none !important;
          filter: none !important;
        }
        .bureau-embed .scene > img {
          -webkit-mask-image: url("/bureau/scene-cutout.svg?v=clean-v4") !important;
          mask-image: url("/bureau/scene-cutout.svg?v=clean-v4") !important;
          -webkit-mask-repeat: no-repeat !important;
          mask-repeat: no-repeat !important;
          -webkit-mask-size: 100% 100% !important;
          mask-size: 100% 100% !important;
        }

        /* No hidden hit targets for furniture that is no longer drawn. */
        .bureau-embed .spot[data-open="chair"],
        .bureau-embed .spot[data-open="drawer"],
        .bureau-embed .spot[data-open="rug"] {
          display: none !important;
          pointer-events: none !important;
        }
        .bureau-embed .scene { isolation: isolate; position: relative; }
        .bureau-embed .scene::before {
          content: "";
          position: absolute;
          z-index: 0;
          inset: 7% 2% 13%;
          pointer-events: none;
          border-radius: 50%;
          background: radial-gradient(ellipse 62% 33% at 50% 75%,
            rgba(183,135,92,.14), rgba(129,107,102,.055) 52%, transparent 100%);
          filter: blur(22px);
        }
        .bureau-embed .scene > img {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 15px 17px rgba(8,8,9,.16));
        }
        .bureau-embed .bureau-desk-outline {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
          z-index: 2;
          overflow: visible;
          pointer-events: none;
          opacity: .68;
        }
        .bureau-embed .stage-heading { display: none !important; }
        @media (max-width: 680px) {
          .bureau-embed .scene-outer {
            display: flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            width: 100% !important;
            height: 100svh !important;
            min-height: 0 !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scrollbar-width: none !important;
            overscroll-behavior-x: contain;
            touch-action: pan-x pan-y;
            -webkit-overflow-scrolling: touch;
          }
          .bureau-embed .scene-outer::-webkit-scrollbar { display: none; }
          .bureau-embed .scene {
            flex: 0 0 auto !important;
            width: max(1010px, 225vw) !important;
            max-width: none !important;
            margin: 0 !important;
            animation: none !important;
          }
          .bureau-embed .top { pointer-events: none !important; }
          .bureau-embed .top button { pointer-events: auto !important; }
        }
      `;

      style.textContent += `
        .bureau-dossier-entry {
          position:absolute;z-index:19;left:45.3%;top:62.9%;width:8.2%;height:9%;min-width:44px;
          padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:4px;border:1px solid #a37641;border-radius:3px 3px 5px 5px;
          transform:rotate(-9deg);background:linear-gradient(145deg,#d9b67c,#9b6d3f 82%);
          box-shadow:3px 6px 0 #322315,5px 10px 19px #0008;
          color:#24170d;cursor:pointer;transition:transform .18s,filter .18s;
          font:900 clamp(6px,.72vw,11px)/1.1 ui-monospace,monospace;letter-spacing:-.025em;
        }
        .bureau-dossier-entry::before {content:'';position:absolute;top:-6px;left:3px;width:40%;height:6px;
          background:#be955c;border:1px solid #977044;border-bottom:0;border-radius:2px 3px 0 0}
        .bureau-dossier-entry svg{width:23%;min-width:12px;height:auto;stroke:currentColor;fill:none;stroke-width:2}
        .bureau-dossier-entry span{max-width:96%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .bureau-dossier-entry:hover,.bureau-dossier-entry:focus-visible {
          transform:rotate(-4deg) translateY(-4px) scale(1.07);filter:brightness(1.15);
          outline:2px solid #fff2d8;outline-offset:4px
        }
        .bureau-dossier-entry::after{content:'OPEN THE UNFINISHED PROJECT';position:absolute;bottom:120%;left:50%;
          transform:translateX(-50%);white-space:nowrap;opacity:0;pointer-events:none;
          padding:8px 10px;border:1px solid #b18c58;background:#171719;color:#f2debf;
          font:800 9px/1.2 ui-monospace,monospace;letter-spacing:.09em;transition:opacity .2s}
        .bureau-dossier-entry:hover::after,.bureau-dossier-entry:focus-visible::after{opacity:1}
        .bureau-dossier-toolbar{border-color:#b99a65!important;color:#f3d5a9!important;
          background:rgba(35,26,20,.87)!important;cursor:pointer!important}
        @media(max-width:680px){.bureau-dossier-entry{font-size:8px;gap:4px}}
      `;
      const scene = document.getElementById("scene");
      if (scene && !document.getElementById("bureau-unfinished-trigger")) {
        const entry = document.createElement("button");
        entry.type = "button";
        entry.id = "bureau-unfinished-trigger";
        entry.className = "bureau-dossier-entry";
        entry.setAttribute("aria-label", "Open The Unfinished Project, het interactieve avontuur");
        entry.title = "THE UNFINISHED PROJECT / SECRET DOSSIER";
        entry.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM8 7h8M8 12h8M8 16h5"/></svg><span>UNFINISHED</span><span>.EXE</span>';
        entry.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setGameOpen(true);
        });
        scene.appendChild(entry);
      }

      // Trace the desk edge very lightly. This is an overlay, not a new drawing:
      // the original illustration and surviving hotspots retain their positions.
      if (scene && !document.getElementById("bureau-desk-outline")) {
        const ns = "http://www.w3.org/2000/svg";
        const outline = document.createElementNS(ns, "svg");
        outline.id = "bureau-desk-outline";
        outline.setAttribute("class", "bureau-desk-outline");
        outline.setAttribute("viewBox", "0 0 1672 941");
        outline.setAttribute("preserveAspectRatio", "none");
        outline.setAttribute("aria-hidden", "true");
        outline.innerHTML = `
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M31 616 L1667 545" stroke="#ddc09c" stroke-opacity=".32" stroke-width="1.4"/>
            <path d="M35 706 L174 779 L622 731 L1669 657" stroke="#d7b68c" stroke-opacity=".59" stroke-width="2"/>
            <path d="M176 780 L174 848 M613 732 L607 821 M1555 668 L1559 842"
              stroke="#c5a482" stroke-opacity=".32" stroke-width="1.9"/>
          </g>`;
        scene.appendChild(outline);
      }
      const toolbar = document.querySelector(".top-right");
      if (toolbar && !document.getElementById("bureau-unfinished-toolbar")) {
        const launcher = document.createElement("button");
        launcher.type = "button";
        launcher.id = "bureau-unfinished-toolbar";
        launcher.className = "pill bureau-dossier-toolbar";
        launcher.textContent = "▣ GAME";
        launcher.title = "Open The Unfinished Project";
        launcher.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setGameOpen(true);
        });
        toolbar.prepend(launcher);
      }

      document.getElementById(style.id)?.remove();
      document.head.appendChild(style);

      // On narrow screens show the computer/desk first; visitors can swipe to
      // reach the Muay Thai corner, punching bag, bookshelf, and other hotspots.
      const centerArtwork = () => {
        const stage = document.querySelector<HTMLElement>(".scene-outer");
        if (!stage || window.innerWidth > 680) return;
        stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      };
      window.requestAnimationFrame(centerArtwork);
    } catch {
      // If the frame is ever served cross-origin, its original experience still works.
    }
  }, []);

  return <>
    <iframe ref={iframeRef} src="/bureau/index.html?embed=1&scene=seamless-v4"
      title="The Bureau — interactieve illustratie" loading="eager"
      onLoad={prepareScene} allowFullScreen />
    {gameOpen && typeof document !== "undefined" && createPortal(
      <div className="bureau-game-overlay" role="dialog" aria-modal="true" aria-label="The Unfinished Project">
        <header className="bureau-game-chrome">
          <div className="bureau-game-identity"><span className="bureau-game-signal"/>
            <span><strong>THE UNFINISHED PROJECT</strong><small>THE BUREAU / SECRET FILE 030</small></span>
          </div>
          <div className="bureau-game-actions">
            <span className="bureau-game-encrypted">ENCRYPTED SESSION</span>
            <a href="/play?bureau=1" target="_blank" rel="noopener noreferrer" aria-label="Open spel in apart venster" title="Open in apart venster"><Maximize2 size={17}/></a>
            <button ref={closeRef} type="button" onClick={() => setGameOpen(false)}>
              <ArrowLeft size={16}/><span>TERUG NAAR BUREAU</span><X size={18}/>
            </button>
          </div>
        </header>
        <iframe ref={gameRef} className="bureau-game-viewport" src="/play?bureau=1"
          title="The Unfinished Project — speel het spel" allow="fullscreen"/>
      </div>, document.body)}
  </>;
}
