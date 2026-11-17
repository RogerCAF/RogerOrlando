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
        /* The iframe is only an interaction layer. The actual page owns the
           paper background, transitions and the overall artwork dimensions. */
        html.bureau-embed,
        html.bureau-embed body,
        .bureau-embed .scene-outer {
          margin: 0 !important;
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
        html.bureau-embed,
        html.bureau-embed body {
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        .bureau-embed .scene-outer {
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          padding: 0 !important;
          display: grid !important;
          place-items: center !important;
          overflow: hidden !important;
        }
        .bureau-embed .scene {
          width: var(--bureau-art-width, 1200px) !important;
          max-width: none !important;
          flex: 0 0 auto !important;
          margin: 0 auto !important;
          animation: none !important;
          transform: none !important;
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
          -webkit-mask-image: url("/bureau/scene-cutout.svg?v=chair-free-v5") !important;
          mask-image: url("/bureau/scene-cutout.svg?v=chair-free-v5") !important;
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
        /* No simulated room lighting: it created a visible rectangular stage. */
        .bureau-embed .scene::before,
        .bureau-embed .scene::after { display: none !important; }
        .bureau-embed .scene > img {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 9px 13px rgba(33,25,21,.12));
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
        /* Text-free correction of the original illustrated Fight Camp poster.
           Only erased lettering is composited; the rest of the art stays intact. */
        .bureau-embed .bureau-poster-text-clean {
          position: absolute !important;
          z-index: 4 !important;
          pointer-events: none !important;
          left: 8.0742% !important;
          top: 29.543% !important;
          width: 13.6364% !important;
          height: 9.8831% !important;
          background: url("/bureau/poster-text-clean.svg") center/100% 100% no-repeat;
        }
        .bureau-embed .stage-heading { display: none !important; }
        .bureau-embed .top {
          opacity: .64 !important;
          transition: opacity .2s ease !important;
        }
        .bureau-embed .top:hover,
        .bureau-embed .top:focus-within { opacity: 1 !important; }
        @media (max-width: 680px) {
          .bureau-embed .scene-outer {
            display: flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            width: 100% !important;
            height: 100% !important;
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
            width: max(770px, 190vw) !important;
            max-width: none !important;
            margin: 0 !important;
            animation: none !important;
          }
          .bureau-embed .top {
            pointer-events: none !important;
            opacity: .85 !important;
          }
          .bureau-embed .top button { pointer-events: auto !important; }
        }
      `;

      style.textContent += `
        /* Unfinished Project lives inside the illustrated computer's OS.
           No floating folder or standalone GAME toolbar on the artwork. */
        .bureau-embed #bureau-unfinished-os-app {
          border: 1px solid rgba(211,169,106,.55) !important;
          color: #f3dbb6 !important;
          background: rgba(179,124,57,.15) !important;
          transition: background .15s, transform .15s;
        }
        .bureau-embed #bureau-unfinished-os-app:hover,
        .bureau-embed #bureau-unfinished-os-app:focus-visible {
          background: rgba(215,159,85,.32) !important;
          transform: translateY(-2px);
        }
      `;
      const scene = document.getElementById("scene");
      const gameContent = document.getElementById("content");
      if (gameContent) {
        const appWindow = window as Window & { __bureauGameObserver?: MutationObserver };
        appWindow.__bureauGameObserver?.disconnect();
        const addToDesktop = () => {
          const icons = gameContent.querySelector(".desktop-icons");
          if (!icons || icons.querySelector("#bureau-unfinished-os-app")) return;
          const app = document.createElement("button");
          app.type = "button";
          app.id = "bureau-unfinished-os-app";
          app.setAttribute("aria-label", "Speel The Unfinished Project");
          app.title = "THE UNFINISHED PROJECT / GAME";
          app.innerHTML = "▣<br>Unfinished.exe";
          app.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            setGameOpen(true);
          });
          icons.appendChild(app);
        };
        const refreshBureauOS = () => {
          addToDesktop();
          const heading = gameContent.querySelector("h1");
          if (heading?.textContent?.trim() === "Muay Thai")
            heading.textContent = "Fight Camp";
        };
        const observer = new MutationObserver(refreshBureauOS);
        observer.observe(gameContent, { childList: true });
        appWindow.__bureauGameObserver = observer;
        refreshBureauOS();
        document.documentElement.dataset.bureauGameInstalled = "1";
      }

      if (scene && !document.getElementById("bureau-poster-text-clean")) {
        const correction = document.createElement("div");
        correction.id = "bureau-poster-text-clean";
        correction.className = "bureau-poster-text-clean";
        correction.setAttribute("aria-hidden", "true");
        scene.appendChild(correction);
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
            <path d="M35 706 L174 779 L622 731" stroke="#d7b68c" stroke-opacity=".40" stroke-width="1.6"/>
            <path d="M176 780 L174 831 M613 732 L607 802"
              stroke="#c5a482" stroke-opacity=".22" stroke-width="1.5"/>
          </g>`;
        scene.appendChild(outline);
      }
      document.getElementById(style.id)?.remove();
      document.head.appendChild(style);

      // On narrow screens show the computer/desk first; visitors can swipe to
      // reach the Muay Thai corner, punching bag, bookshelf, and other hotspots.
      const layoutArtwork = () => {
        const vw = window.innerWidth;
        const frameHeight = frame.getBoundingClientRect().height;
        // Fit the actual inline art area, not the full device viewport:
        // the image must never be clipped where it meets the project section.
        // Mobile keeps a horizontal, swipeable desk with aligned hotspots.
        const artWidth = Math.min(vw * 0.97, frameHeight * (1672 / 941) * 0.955, 1390);
        document.documentElement.style.setProperty("--bureau-art-width", `${Math.round(artWidth)}px`);
        const stage = document.querySelector<HTMLElement>(".scene-outer");
        if (stage && vw <= 680) stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      };
      window.requestAnimationFrame(layoutArtwork);
      const styledWindow = window as Window & { __bureauArtworkLayout?: () => void };
      if (styledWindow.__bureauArtworkLayout)
        window.removeEventListener("resize", styledWindow.__bureauArtworkLayout);
      styledWindow.__bureauArtworkLayout = layoutArtwork;
      window.addEventListener("resize", layoutArtwork);
    } catch {
      // If the frame is ever served cross-origin, its original experience still works.
    }
  }, []);

  // The embedded artwork is several megabytes of inline artwork. It can finish
  // loading before React hydrates and attaches iframe.onLoad, especially on iOS.
  // Make the integration deterministic rather than relying on that single event.
  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    let attempts = 0;
    const installIfReady = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc?.getElementById("scene")) return false;
        prepareScene();
        return !!doc.getElementById("bureau-seamless-portfolio")
          && doc.documentElement.dataset.bureauGameInstalled === "1";
      } catch {
        return false;
      }
    };
    const onFrameLoad = () => { installIfReady(); };
    frame.addEventListener("load", onFrameLoad);
    // Cover both early iframe load and delayed parse/hydration.
    const poll = window.setInterval(() => {
      attempts++;
      if (installIfReady() || attempts >= 32) window.clearInterval(poll);
    }, 250);
    const raf = window.requestAnimationFrame(() => installIfReady());
    return () => {
      window.clearInterval(poll);
      window.cancelAnimationFrame(raf);
      frame.removeEventListener("load", onFrameLoad);
    };
  }, [prepareScene]);

  return <>
    <iframe ref={iframeRef} src="/bureau/index.html?embed=1&scene=integrated-cleanposter-v8"
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
