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
          place-items: start center !important;
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
          -webkit-mask-image: url("/bureau/scene-dual-monitors.svg?v=dual-v1") !important;
          mask-image: url("/bureau/scene-dual-monitors.svg?v=dual-v1") !important;
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
        /* Place a single illustrated desk behind the EXISTING cutout artwork.
           Keyboard, mouse, monitor, Rubik and poster keep their exact positions. */
        .bureau-embed .scene > img.bureau-desk-base {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 0 !important;
          object-fit: fill !important;
          opacity: 1 !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          filter: none !important;
          pointer-events: none !important;
          user-select: none !important;
          background: transparent !important;
        }
        .bureau-embed .scene > img:not(.bureau-original-ink):not(.bureau-desk-base):not(.bureau-bag-photo):not(.bureau-bag-ink):not(.bureau-screen-crisp):not(.bureau-shelf-front):not(.bureau-bag-edge):not(.bureau-screen-archive):not(.bureau-dual-rig) {
          position: relative;
          z-index: 1;
          /* Flatten the existing art without replacing it. */
          filter: url("#bureau-original-palette") saturate(.84) !important;
        }
        .bureau-embed .scene > img.bureau-original-ink {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 3 !important;
          pointer-events: none !important;
          user-select: none !important;
          object-fit: fill !important;
          filter: none !important;
          opacity: .74 !important;
          background: transparent !important;
        }
        /* Separate the existing punching bag from the desk. The base scene
           no longer renders that part of its original pixels; the same artwork
           is drawn independently with its original ink detail. */
        .bureau-embed .scene > img.bureau-original-ink {
          -webkit-mask-image: url("/bureau/ink-without-bag-tower.svg?v=dual-v1") !important;
          mask-image: url("/bureau/ink-without-bag-tower.svg?v=dual-v1") !important;
          -webkit-mask-repeat: no-repeat !important;
          mask-repeat: no-repeat !important;
          -webkit-mask-size: 100% 100% !important;
          mask-size: 100% 100% !important;
        }
        .bureau-embed .scene > img.bureau-bag-photo,
        .bureau-embed .scene > img.bureau-bag-ink {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: fill !important;
          pointer-events: none !important;
          user-select: none !important;
          background: transparent !important;
          -webkit-mask-image: url("/bureau/bag-only-cutout.svg?v=bag-v1") !important;
          mask-image: url("/bureau/bag-only-cutout.svg?v=bag-v1") !important;
          -webkit-mask-repeat: no-repeat !important;
          mask-repeat: no-repeat !important;
          -webkit-mask-size: 100% 100% !important;
          mask-size: 100% 100% !important;
          transform-origin: 94.2% 0% !important;
          transform: translateX(1.5%) scale(.82) !important;
        }
        .bureau-embed .scene > img.bureau-bag-photo {
          z-index: 2 !important;
          /* No palette Gaussian on the bag: it softened the outer stitching. */
          filter: contrast(1.08) saturate(.90) !important;
        }
        .bureau-embed .scene > img.bureau-bag-ink {
          z-index: 3 !important;
          opacity: .76 !important;
          filter: none !important;
        }
        /* The display uses the original high-quality pixels, but no
           posterize/Gaussian filter. Its natural image aspect stays aligned
           with the existing monitor and click areas. */
        .bureau-embed .scene > img.bureau-screen-crisp {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2 !important;
          object-fit: fill !important;
          pointer-events: none !important;
          user-select: none !important;
          background: transparent !important;
          -webkit-mask-image: url("/bureau/screen-crisp-mask.svg?v=crisp-v1") !important;
          mask-image: url("/bureau/screen-crisp-mask.svg?v=crisp-v1") !important;
          -webkit-mask-repeat: no-repeat !important;
          mask-repeat: no-repeat !important;
          -webkit-mask-size: 100% 100% !important;
          mask-size: 100% 100% !important;
          filter: none !important;
          opacity: 1 !important;
        }
        /* A vector-sharp, crown-free archive layout lies exactly within
           the ORIGINAL monitor glass; no new hardware, no extra objects. */
        .bureau-embed .scene > img.bureau-screen-archive {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 7 !important;
          object-fit: fill !important;
          pointer-events: none !important;
          user-select: none !important;
          filter: none !important;
          opacity: 1 !important;
          background: transparent !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
        }
        /* Two crisp screens sharing a low-profile monitor arm, plus an
           upright PC case. This is the sole modified hardware layer: all
           original artwork, project actions and guestbook remain available. */
        .bureau-embed .scene > img.bureau-dual-rig {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 8 !important;
          object-fit: fill !important;
          background: transparent !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          filter: none !important;
          pointer-events: none !important;
          user-select: none !important;
        }
        .bureau-embed .bureau-secondary-display {
          position: absolute !important;
          left: 65.9% !important;
          top: 29.7% !important;
          width: 9.4% !important;
          height: 28.9% !important;
          z-index: 12 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          color: transparent !important;
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .bureau-embed .bureau-secondary-display:focus-visible {
          outline: 2px solid #d7b18a !important;
          outline-offset: 2px !important;
        }
        /* Actual wood front faces the viewer, visually in front of every
           book, controller and cube so nothing passes through the plank. */
        .bureau-embed .scene > img.bureau-shelf-front {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 5 !important;
          object-fit: fill !important;
          pointer-events: none !important;
          user-select: none !important;
          background: transparent !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          filter: none !important;
        }
        /* Vector edge drawn after photo and ink, no raster-mask blur. */
        .bureau-embed .scene > img.bureau-bag-edge {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 6 !important;
          object-fit: fill !important;
          pointer-events: none !important;
          user-select: none !important;
          background: transparent !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          filter: none !important;
          transform-origin: 94.2% 0% !important;
          transform: translateX(1.5%) scale(.82) !important;
        }
        .bureau-embed .spot[data-open="bag"] {
          left: 88.5% !important;
          top: 0% !important;
          width: 11.5% !important;
          height: 52% !important;
        }

        /* Make the EXISTING visitor notebook visible again. Clicking it opens
           the shared names list and single-signature guestbook already built. */
        /* The existing names list is now a small ink-and-leather notebook,
           not a gold sticker floating over the desk. */
        .bureau-embed #bureau-guestbook-entry {
          position: absolute !important;
          left: 17.5% !important;
          top: 66.8% !important;
          width: 15.3% !important;
          height: 10% !important;
          z-index: 10 !important;
          box-sizing: border-box !important;
          padding: 0 5% 0 5.7% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 5px !important;
          transform: rotate(-7deg) skewX(-5deg) !important;
          border: 1px solid #876d53 !important;
          border-left: 5px solid #422b20 !important;
          border-radius: 3px 9px 7px 3px !important;
          background: linear-gradient(150deg,#3c3230,#17191e 48%,#252125 88%,#403229) !important;
          box-shadow: 2px 2px 0 #b89a78, 0 6px 11px rgba(0,0,0,.19) !important;
          color: #dfc49b !important;
          text-shadow: none !important;
          cursor: pointer !important;
          font-family: Georgia,serif !important;
          transition: filter .15s, transform .15s !important;
        }
        .bureau-embed #bureau-guestbook-entry::before {
          content: "" !important;
          position: absolute !important;
          inset: 8% auto 8% 4% !important;
          width: 2% !important;
          border-left: 1px solid rgba(230,183,122,.56) !important;
          border-right: 1px solid rgba(230,183,122,.18) !important;
          background: transparent !important;
        }
        .bureau-embed #bureau-guestbook-entry::after {
          content: "" !important;
          position: absolute !important;
          width: 26% !important;
          height: 2.4% !important;
          background: #a64737 !important;
          left: 48% !important;
          top: 73% !important;
          transform: translateX(-50%) !important;
          opacity: .9 !important;
        }
        .bureau-embed #bureau-guestbook-entry strong {
          display: block !important;
          font: 700 clamp(6px, .74vw, 12px)/1.15 Georgia,serif !important;
          letter-spacing: .05em !important;
          white-space: nowrap !important;
          color: #e4cda9 !important;
        }
        .bureau-embed #bureau-guestbook-entry span {
          font: 500 clamp(5px,.5vw,8px)/1 ui-monospace,monospace !important;
          letter-spacing: .12em !important;
          color: #aa9382 !important;
        }
        .bureau-embed #bureau-guestbook-entry:hover,
        .bureau-embed #bureau-guestbook-entry:focus-visible {
          filter: brightness(1.18) !important;
          transform: rotate(-5deg) skewX(-5deg) translateY(-2px) !important;
          outline: 1px solid #a9865f !important;
          outline-offset: 2px !important;
        }
        @media(max-width: 680px) {
          .bureau-embed #bureau-guestbook-entry {
            border-width: 1px !important;
            border-left-width: 3px !important;
            gap: 1px !important;
            box-shadow: 1px 1px 0 #c4a47c !important;
          }
          .bureau-embed #bureau-guestbook-entry strong {
            font-size: 5px !important;
            letter-spacing: 0 !important;
          }
          .bureau-embed #bureau-guestbook-entry span { font-size: 3.5px !important; }
        }
        /* No synthetic traced outlines: those stray strokes detached from
           the illustrated desk on narrow devices. */
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
        /* Artwork only inside the portfolio. The standalone Bureau retains
           its settings toolbar for visitors who want the full experience. */
        .bureau-embed .top,
        .bureau-embed .stage-heading,
        .bureau-embed .scene-caption,
        .bureau-embed .stage-hint,
        .bureau-embed .bottom,
        .bureau-embed .v2-subtitle,
        .bureau-embed .v2-quick {
          display: none !important;
        }
        /* The original hidden toast was translated 150% but still left a
           gold rounded top border poking out at the bottom of the iframe. */
        .bureau-embed #toast:not(.show) {
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .bureau-embed #toast.show {
          visibility: visible !important;
          bottom: 12px !important;
          right: 12px !important;
          max-width: calc(100% - 24px) !important;
        }
        @media (max-width: 680px) {
          /* On phone show the WHOLE illustration. No 770px canvas that
             overflows a 390px screen or clips the monitor/punching bag. */
          .bureau-embed .scene-outer {
            display: grid !important;
            place-items: start center !important;
            overflow: hidden !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            touch-action: pan-y !important;
          }
          .bureau-embed .scene {
            width: min(98vw, var(--bureau-art-width, 98vw)) !important;
            max-width: 98vw !important;
            margin: 0 auto !important;
            animation: none !important;
            transform: none !important;
          }
          .bureau-embed .spot {
            border: 0 !important;
            box-shadow: none !important;
          }
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

      // One cohesive surface under the real monitor, PC, mouse and keyboard.
      // Unlike extending the photo mask, this cannot reveal the removed chair.
      if (scene && !document.getElementById("bureau-desk-surface")) {
        const desk = document.createElement("img");
        desk.id = "bureau-desk-surface";
        desk.className = "bureau-desk-base";
        desk.alt = "";
        desk.setAttribute("aria-hidden", "true");
        desk.draggable = false;
        desk.decoding = "async";
        desk.src = "/bureau/desk-surface-clean.svg?v=soft-desk-v3";
        scene.appendChild(desk);
      }

      // Trace the existing illustrated objects (including the actual Muay Thai
      // poster and Rubik's Cube) without replacing them or moving hotspots.
      if (scene && !document.getElementById("bureau-original-ink")) {
        const ink = document.createElement("img");
        ink.id = "bureau-original-ink";
        ink.className = "bureau-original-ink";
        ink.alt = "";
        ink.setAttribute("aria-hidden", "true");
        ink.decoding = "async";
        ink.draggable = false;
        ink.src = "/bureau/original-contour-ink.svg?v=soft-ink-v3";
        scene.appendChild(ink);
      }

      // Restore unblurred monitor pixels independently of the flatter shading
      // of the other objects. Rendering remains aligned at every viewport size.
      if (scene && !document.getElementById("bureau-screen-crisp")) {
        const original = scene.querySelector<HTMLImageElement>(
          ":scope > img:not(.bureau-original-ink):not(.bureau-desk-base):not(.bureau-bag-photo):not(.bureau-bag-ink):not(.bureau-screen-crisp):not(.bureau-shelf-front):not(.bureau-bag-edge)"
        );
        if (original) {
          const screen = document.createElement("img");
          screen.id = "bureau-screen-crisp";
          screen.className = "bureau-screen-crisp";
          screen.src = original.currentSrc || original.src;
          screen.alt = "";
          screen.decoding = "async";
          screen.draggable = false;
          screen.setAttribute("aria-hidden", "true");
          scene.appendChild(screen);
        }
      }

      // The shelf's front edge must occlude the bottom of the books and cube.
      if (scene && !document.getElementById("bureau-shelf-front")) {
        const shelf = document.createElement("img");
        shelf.id = "bureau-shelf-front";
        shelf.className = "bureau-shelf-front";
        shelf.src = "/bureau/shelf-front-finish.svg?v=soft-shelf-v3";
        shelf.alt = "";
        shelf.decoding = "async";
        shelf.draggable = false;
        shelf.setAttribute("aria-hidden", "true");
        scene.appendChild(shelf);
      }

      // Premium screen layout: replace only the displayed wallpaper/artwork,
      // not the monitor or its hotspot. No crown or new surrounding furniture.
      if (scene && !document.getElementById("bureau-screen-archive")) {
        const screen = document.createElement("img");
        screen.id = "bureau-screen-archive";
        screen.className = "bureau-screen-archive";
        screen.alt = "";
        screen.decoding = "async";
        screen.draggable = false;
        screen.setAttribute("aria-hidden", "true");
        screen.src = "/bureau/screen-archive-no-crown.svg?v=screen-v1";
        scene.appendChild(screen);
      }

      // The original punchbag image is split into its own interactive layer.
      // Nothing else (including the phone or computer) is repositioned.
      if (scene && !document.getElementById("bureau-relocated-bag")) {
        const original = scene.querySelector<HTMLImageElement>(
          ":scope > img:not(.bureau-original-ink):not(.bureau-desk-base):not(.bureau-bag-photo):not(.bureau-bag-ink)"
        );
        if (original) {
          const bagPhoto = document.createElement("img");
          bagPhoto.id = "bureau-relocated-bag";
          bagPhoto.className = "bureau-bag-photo";
          bagPhoto.src = original.currentSrc || original.src;
          bagPhoto.alt = "";
          bagPhoto.decoding = "async";
          bagPhoto.draggable = false;
          bagPhoto.setAttribute("aria-hidden", "true");
          scene.appendChild(bagPhoto);

          const bagInk = document.createElement("img");
          bagInk.id = "bureau-relocated-bag-ink";
          bagInk.className = "bureau-bag-ink";
          bagInk.src = "/bureau/original-contour-ink.svg?v=soft-ink-v3";
          bagInk.alt = "";
          bagInk.decoding = "async";
          bagInk.draggable = false;
          bagInk.setAttribute("aria-hidden", "true");
          scene.appendChild(bagInk);
        }
      }

      // Crisp vector boundary for the moved bag, registered to the exact
      // same transform as the original bag photo and untouched click region.
      if (scene && !document.getElementById("bureau-bag-sharp-edge")) {
        const edge = document.createElement("img");
        edge.id = "bureau-bag-sharp-edge";
        edge.className = "bureau-bag-edge";
        edge.alt = "";
        edge.decoding = "async";
        edge.draggable = false;
        edge.setAttribute("aria-hidden", "true");
        edge.src = "/bureau/bag-crisp-outline.svg?v=soft-bag-v3";
        scene.appendChild(edge);
      }

      // Twin monitors and a squared-up case sit in exactly the old hardware
      // footprint. The main monitor, books, Rubik, phone, bag and names list
      // retain their original scene coordinates and functionality.
      if (scene && !document.getElementById("bureau-dual-rig")) {
        const rig = document.createElement("img");
        rig.id = "bureau-dual-rig";
        rig.className = "bureau-dual-rig";
        rig.src = "/bureau/dual-screens-upright-pc.svg?v=soft-rig-v3";
        rig.alt = "";
        rig.decoding = "async";
        rig.draggable = false;
        rig.setAttribute("aria-hidden", "true");
        scene.appendChild(rig);
      }
      if (scene && !document.getElementById("bureau-secondary-display")) {
        const secondary = document.createElement("button");
        secondary.type = "button";
        secondary.id = "bureau-secondary-display";
        secondary.className = "bureau-secondary-display";
        secondary.setAttribute("aria-label", "Open Bureau OS via het tweede scherm");
        secondary.title = "TWEEDE SCHERM / BUREAU OS";
        secondary.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          document.querySelector<HTMLButtonElement>('.spot[data-open="projects"]')?.click();
        });
        scene.appendChild(secondary);
      }

      // The notebook was already a hidden hotspot; make its visitor list
      // discoverable without introducing any unrelated items.
      if (scene && !document.getElementById("bureau-guestbook-entry")) {
        const notebook = document.createElement("button");
        notebook.id = "bureau-guestbook-entry";
        notebook.type = "button";
        notebook.setAttribute("aria-label", "Open de gedeelde namenlijst en teken het gastenboek");
        notebook.title = "NAMENLIJST / GASTENBOEK";
        notebook.innerHTML = "<strong>GUESTBOOK</strong><span>NAMENLIJST</span>";
        notebook.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          document.querySelector<HTMLButtonElement>('.spot[data-open="about"]')?.click();
        });
        scene.appendChild(notebook);
      }

      if (scene && !document.getElementById("bureau-poster-text-clean")) {
        const correction = document.createElement("div");
        correction.id = "bureau-poster-text-clean";
        correction.className = "bureau-poster-text-clean";
        correction.setAttribute("aria-hidden", "true");
        scene.appendChild(correction);
      }

      if (!document.getElementById("bureau-original-palette-defs")) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        defs.id = "bureau-original-palette-defs";
        defs.setAttribute("width", "0");
        defs.setAttribute("height", "0");
        defs.setAttribute("aria-hidden", "true");
        defs.style.cssText = "position:absolute;overflow:hidden;pointer-events:none";
        defs.innerHTML = `
          <defs>
            <filter id="bureau-original-palette" color-interpolation-filters="sRGB">
              <feComponentTransfer>
                <feFuncR type="discrete" tableValues="0 .11 .22 .33 .44 .55 .66 .77 .88 1"/>
                <feFuncG type="discrete" tableValues="0 .11 .22 .33 .44 .55 .66 .77 .88 1"/>
                <feFuncB type="discrete" tableValues="0 .11 .22 .33 .44 .55 .66 .77 .88 1"/>
              </feComponentTransfer>
            </filter>
          </defs>`;
        document.body.appendChild(defs);
      }
      document.getElementById(style.id)?.remove();
      document.head.appendChild(style);

      // On narrow screens show the computer/desk first; visitors can swipe to
      // reach the Muay Thai corner, punching bag, bookshelf, and other hotspots.
      const layoutArtwork = () => {
        const vw = window.innerWidth;
        // Size the original artwork from viewport width, not the clipped
        // section height. The desk ends around y=770 of the 941px canvas;
        // crop only the empty transparent area beneath it.
        const artWidth = Math.min(vw * 0.975, 1250);
        document.documentElement.style.setProperty("--bureau-art-width", `${Math.round(artWidth)}px`);
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
    <iframe ref={iframeRef} src="/bureau/index.html?embed=1&scene=soft-outlines-v21"
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
