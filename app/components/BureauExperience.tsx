"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Bird, Box, Dumbbell, Gamepad2, LockKeyhole, Maximize2, Route, Smartphone, Swords, Timer, Trophy, UsersRound, X, Zap } from "lucide-react";

type PhoneGame = "sky" | "curve" | "reaction" | "ten";
const phoneGameDetails: Record<PhoneGame, { title: string; subtitle: string; url: string }> = {
  sky: { title: "SNUFFY BIRD", subtitle: "THE BUREAU / PHONE / TOP 10", url: "/bureau/sky-hop.html" },
  curve: { title: "AGTUNG DIE KURVE", subtitle: "THE BUREAU / PHONE / LOCAL MULTIPLAYER", url: "/bureau/curve-clash.html" },
  reaction: { title: "DR. MONGO’S REACTION GAME", subtitle: "THE BUREAU / PHONE / REFLEX TEST", url: "/arcade/reaction" },
  ten: { title: "THE BUTTON 10:00", subtitle: "THE BUREAU / PHONE / TIMING CHALLENGE", url: "/arcade/ten" },
};
import "./bureau-game.css";
import "./bureau-phone.css";
import BureauTerminal from "./BureauTerminal";

/**
 * Same-origin Bureau embed. Keep the original interactive artwork and hotspots,
 * but detach the illustration from its room backdrop and its former framed stage.
 */
export default function BureauExperience() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameRef = useRef<HTMLIFrameElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [gameOpen, setGameOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const bagCloseRef = useRef<HTMLButtonElement>(null);
  const [rubikOpen, setRubikOpen] = useState(false);
  const rubikCloseRef = useRef<HTMLButtonElement>(null);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const arcadeCloseRef = useRef<HTMLButtonElement>(null);
  const [phoneMode, setPhoneMode] = useState<null | "menu" | PhoneGame>(null);
  const phoneCloseRef = useRef<HTMLButtonElement>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const posterCloseRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!bagOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    bagCloseRef.current?.focus({ preventScroll: true });
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBagOpen(false);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === "bureau:close-heavybag") {
        setBagOpen(false);
      }
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("message", onMessage);
      document.removeEventListener("keydown", onEscape);
    };
  }, [bagOpen]);

  // Keep the cube game outside the Bureau artwork iframe, without changing the
  // original Rubik illustration, hotspot position or other scene interactions.
  useEffect(() => {
    if (!rubikOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rubikCloseRef.current?.focus({ preventScroll: true });
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRubikOpen(false);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin &&
          event.source instanceof Window &&
          event.data?.type === "bureau:close-cube-survivor") setRubikOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    window.addEventListener("message", onMessage);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("message", onMessage);
    };
  }, [rubikOpen]);

  useEffect(() => {
    if (!arcadeOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    arcadeCloseRef.current?.focus({ preventScroll: true });
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setArcadeOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [arcadeOpen]);

  useEffect(() => {
    if (!phoneMode) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    phoneCloseRef.current?.focus({ preventScroll: true });
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setPhoneMode(current => current === "menu" ? null : "menu");
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [phoneMode]);

  // The original photographic poster opens the Test Your Might challenge.
  // Preserve the approved Bureau artwork and original click boundaries.
  const openFightCamp = useCallback(() => {
    setArcadeOpen(false);
    setPosterOpen(true);
  }, []);

  useEffect(() => {
    if (!posterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    posterCloseRef.current?.focus({ preventScroll: true });
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setPosterOpen(false); }
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [posterOpen]);

  const prepareScene = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const document = frame.contentDocument;
      const window = frame.contentWindow;
      if (!document || !window) return;

      // The approved homepage artwork is an embedded iframe. Full-screen
      // games open in page-level portals so the illustration stays untouched.
      if (!document.documentElement.dataset.bureauBagLinkInstalled) {
        document.addEventListener("click", (event: MouseEvent) => {
          const target = event.target as Element | null;
          const isBag = !!target?.closest?.('[data-open="bag"], [data-inside="bag"]');
          const isRubik = !!target?.closest?.('[data-open="rubik"], [data-inside="rubik"]');
          const isArcade = !!target?.closest?.('[data-open="projects"], [data-open="monitor"], [data-open="computer"]');
          const isKeyboard = !!target?.closest?.('[data-open="keyboard"], [data-inside="keyboard"]');
          const isPhone = !!target?.closest?.('[data-open="phone"], [data-inside="phone"], [data-open="arcade"], [data-inside="arcade"], #bureau-phone-entry');
          const isPoster = !!target?.closest?.('[data-open="muay"], [data-inside="muay"]');
          if (!isBag && !isRubik && !isArcade && !isKeyboard && !isPhone && !isPoster) return;
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          if (isPhone) setPhoneMode("menu");
          else if (isPoster) setPosterOpen(true);
          else if (isKeyboard) setTerminalOpen(true);
          else if (isRubik) setRubikOpen(true);
          else if (isBag) setBagOpen(true);
          else setArcadeOpen(true);
        }, true);
        document.documentElement.dataset.bureauBagLinkInstalled = "1";
      }

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
          background: transparent !important;
          background-image: none !important;
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
          -webkit-mask-image: url("/bureau/scene-dual-monitors.svg?v=no-cube-box-v26") !important;
          mask-image: url("/bureau/scene-dual-monitors.svg?v=no-cube-box-v26") !important;
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
        .bureau-embed .scene > img:not(.bureau-original-ink):not(.bureau-desk-base):not(.bureau-bag-photo):not(.bureau-bag-ink):not(.bureau-screen-crisp):not(.bureau-shelf-front):not(.bureau-bag-edge):not(.bureau-screen-archive):not(.bureau-dual-rig):not(.bureau-poster-unframed):not(.bureau-input-devices):not(.bureau-rubik-isolated) {
          position: relative;
          z-index: 1;
          /* Flatten the existing art without replacing it. */
          filter: saturate(.90) contrast(.98) !important;
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
          -webkit-mask-image: url("/bureau/bag-only-cutout.svg?v=trimmed-bag-v26") !important;
          mask-image: url("/bureau/bag-only-cutout.svg?v=trimmed-bag-v26") !important;
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
        /* The Rubik is now its own transparent object. Its old photo mask
           included a rectangular lightbox; it is no longer rendered. */
        .bureau-embed .scene > img.bureau-rubik-isolated {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 4 !important;
          object-fit: fill !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          opacity: 1 !important;
          filter: none !important;
          background: transparent !important;
          pointer-events: none !important;
          user-select: none !important;
        }
        /* Keyboard and mouse are one aligned artwork layer, exactly seated
           on the desk plane. Never apply the original image mask to them. */
        .bureau-embed .scene > img.bureau-input-devices {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 9 !important;
          object-fit: fill !important;
          opacity: 1 !important;
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

        /* One single R notebook on the right of the desk. This is the
           visual entry point to the EXISTING shared guestbook — no ARCHIVE
           volume or second decorative notebook is introduced. */
        .bureau-embed #bureau-guestbook-entry {
          position: absolute !important;
          left: 75.4% !important;
          top: 69.5% !important;
          width: 10.9% !important;
          height: 7.2% !important;
          z-index: 11 !important;
          box-sizing: border-box !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transform: rotate(4deg) skewX(-7deg) !important;
          transform-origin: 50% 50% !important;
          border: 1px solid #4c4643 !important;
          border-left: 5px solid #1a1c22 !important;
          border-radius: 3px 7px 6px 3px !important;
          background: linear-gradient(150deg,#39363a 0%,#202127 27%,#13171e 66%,#2b2629 100%) !important;
          box-shadow: 2px 2px 0 #c2b4a0, 0 4px 0 #29252a, 0 7px 11px rgba(0,0,0,.35) !important;
          color: #d9c6b1 !important;
          text-shadow: none !important;
          cursor: pointer !important;
          font-family: Georgia,serif !important;
          transition: filter .15s, transform .15s, box-shadow .15s !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .bureau-embed #bureau-guestbook-entry::before {
          content: "" !important;
          position: absolute !important;
          inset: 7% auto 7% 4% !important;
          width: 2.2% !important;
          border-left: 1px solid rgba(195,171,141,.46) !important;
          border-right: 1px solid rgba(195,171,141,.16) !important;
          background: transparent !important;
        }
        .bureau-embed #bureau-guestbook-entry::after {
          content: "" !important;
          position: absolute !important;
          left: 10% !important;
          right: 5% !important;
          bottom: 6% !important;
          height: 1px !important;
          background: rgba(189,168,145,.35) !important;
          pointer-events: none !important;
        }
        .bureau-embed #bureau-guestbook-entry strong {
          display: block !important;
          font: 400 clamp(13px,2.1vw,27px)/1 Georgia,serif !important;
          color: #d3c3af !important;
          letter-spacing: -.08em !important;
          font-style: italic !important;
          transform: skewX(7deg) !important;
        }
        .bureau-embed #bureau-guestbook-entry:hover {
          filter: brightness(1.16) !important;
          transform: rotate(4deg) skewX(-7deg) translateY(-2px) !important;
        }
        .bureau-embed #bureau-guestbook-entry:focus-visible {
          outline: 2px solid #d6bd9a !important;
          outline-offset: 3px !important;
        }
        @media(max-width:680px) {
          .bureau-embed #bureau-guestbook-entry {
            border-left-width: 2px !important;
            box-shadow: 1px 1px 0 #c2b4a0, 0 2px 0 #29252a !important;
          }
          .bureau-embed #bureau-guestbook-entry strong { font-size: 10px !important; }
        }
        /* The original illustration itself, with the wooden poster frame
           removed. No painted border, second trace or synthetic outline. */
        .bureau-embed .scene > img.bureau-poster-unframed {
          position: absolute !important;
          left: 5.74% !important;
          top: 1.06% !important;
          width: 16.15% !important;
          height: 41.45% !important;
          z-index: 4 !important;
          object-fit: fill !important;
          filter: none !important;
          opacity: 1 !important;
          background: transparent !important;
          pointer-events: none !important;
          user-select: none !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          clip-path: polygon(1.5% 2%, 99% 0%, 99% 98%, 0% 100%) !important;
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
          if (!icons) return;
          // Projects already have a dedicated, richer section on the website.
          // Keep the secret game, never remove Unfinished.exe.
          icons.querySelectorAll<HTMLElement>("button, a, [role='button']").forEach(icon => {
            const title = (icon.getAttribute("aria-label") || icon.getAttribute("title") || icon.textContent || "").trim().toLowerCase().replace(/\s+/g, " ");
            if (["projects", "projecten", "projects.exe", "projecten.exe"].includes(title) || icon.dataset.open === "projects") {
              icon.hidden = true;
              icon.style.display = "none";
              icon.tabIndex = -1;
            }
          });
          if (icons.querySelector("#bureau-unfinished-os-app")) return;
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

      // Crop the Muay Thai print itself from the original artwork. This
      // removes the heavy wooden side strips instead of tracing them again.
      // Do not change the poster hotspot or any scene coordinates.
      if (scene && !document.getElementById("bureau-unframed-poster")) {
        const original = scene.querySelector<HTMLImageElement>(":scope > img:not([class])");
        if (original) {
          const poster = document.createElement("img");
          poster.id = "bureau-unframed-poster";
          poster.className = "bureau-poster-unframed";
          poster.alt = "";
          poster.decoding = "async";
          poster.draggable = false;
          poster.setAttribute("aria-hidden", "true");
          scene.appendChild(poster);
          const drawUnframedArtwork = () => {
            if (!original.naturalWidth || poster.src) return;
            const canvas = document.createElement("canvas");
            canvas.width = 221;
            canvas.height = 348;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(original, 127, 45, 216, 333, 0, 0, 221, 348);
            // The printed poster has Thai and English lettering embedded in
            // its lower quarter. Fade out that region of the actual pixels;
            // an HTML text replacement cannot remove raster lettering.
            ctx.globalCompositeOperation = "destination-out";
            const fade = ctx.createLinearGradient(0, 218, 0, 255);
            fade.addColorStop(0, "rgba(0,0,0,0)");
            fade.addColorStop(1, "rgba(0,0,0,1)");
            ctx.fillStyle = fade;
            ctx.fillRect(0, 218, canvas.width, canvas.height - 218);
            ctx.globalCompositeOperation = "source-over";
            poster.src = canvas.toDataURL("image/png");
          };
          if (original.complete && original.naturalWidth) drawUnframedArtwork();
          else original.addEventListener("load", drawUnframedArtwork, { once: true });
        }
      }

      // The original Rubik raster image carried a brown rectangular backing.
      // Render only the precisely shaped colored cube; the shelf remains intact.
      if (scene && !document.getElementById("bureau-rubik-isolated")) {
        const cube = document.createElement("img");
        cube.id = "bureau-rubik-isolated";
        cube.className = "bureau-rubik-isolated";
        cube.src = "/bureau/rubik-isolated-no-box.svg?v=rubik-v1";
        cube.alt = "";
        cube.draggable = false;
        cube.decoding = "async";
        cube.setAttribute("aria-hidden", "true");
        scene.appendChild(cube);
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


        }
      }

      // Twin monitors and a squared-up case sit in exactly the old hardware
      // footprint. The main monitor, books, Rubik, phone, bag and names list
      // retain their original scene coordinates and functionality.
      if (scene && !document.getElementById("bureau-dual-rig")) {
        const rig = document.createElement("img");
        rig.id = "bureau-dual-rig";
        rig.className = "bureau-dual-rig";
        rig.src = "/bureau/dual-screens-upright-pc.svg?v=lian-li-front-v25";
        rig.alt = "";
        rig.decoding = "async";
        rig.draggable = false;
        rig.setAttribute("aria-hidden", "true");
        scene.appendChild(rig);
      }
      // Replace the old skewed raster keyboard and mouse with one consistent
      // desk-aligned overlay. Both use the same horizon and touch nothing else.
      if (scene && !document.getElementById("bureau-input-devices")) {
        const devices = document.createElement("img");
        devices.id = "bureau-input-devices";
        devices.className = "bureau-input-devices";
        devices.src = "/bureau/desk-keyboard-mouse-aligned.svg?v=aligned-v1";
        devices.alt = "";
        devices.decoding = "async";
        devices.draggable = false;
        devices.setAttribute("aria-hidden", "true");
        scene.appendChild(devices);
      }
      if (scene && !document.getElementById("bureau-secondary-display")) {
        const secondary = document.createElement("button");
        secondary.type = "button";
        secondary.id = "bureau-secondary-display";
        secondary.className = "bureau-secondary-display";
        secondary.setAttribute("aria-label", "Open Bureau Arcade via het tweede scherm");
        secondary.title = "TWEEDE SCHERM / BUREAU ARCADE";
        secondary.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setArcadeOpen(true);
        });
        scene.appendChild(secondary);
      }

      // The original "arcade" hotspot sits on the phone in the approved artwork.
      // Keep it transparent and give the depicted phone its own two-game launcher.
      if (scene) {
        const phoneSpot = scene.querySelector<HTMLElement>('.spot[data-open="arcade"], .spot[data-open="phone"]');
        if (phoneSpot) {
          phoneSpot.setAttribute("aria-label", "Open de vier spellen op de telefoon");
          phoneSpot.title = "PHONE ARCADE / 4 GAMES";
        } else if (!document.getElementById("bureau-phone-entry")) {
          const phone = document.createElement("button");
          phone.type = "button";
          phone.id = "bureau-phone-entry";
          phone.setAttribute("aria-label", "Open de vier spellen op de telefoon");
          phone.title = "PHONE ARCADE / 4 GAMES";
          scene.appendChild(phone);
        }
      }

      const posterSpot = scene?.querySelector<HTMLElement>('.spot[data-open="muay"]');
      if (posterSpot) {
        posterSpot.setAttribute("aria-label", "TEST YOUR MIGHT: start de verborgen krachtproef");
        posterSpot.title = "TEST YOUR MIGHT / LIVING POSTER";
      }

      // Display a deliberate 16:20 on the desk phone too, not only in
      // its full-size app launcher. A separate noninteractive label preserves
      // the approved photo and lets the same fixed clock survive resizes.
      if (scene && !document.getElementById("bureau-physical-phone-clock")) {
        const phoneClock = document.createElement("span");
        phoneClock.id = "bureau-physical-phone-clock";
        phoneClock.textContent = "16:20";
        phoneClock.setAttribute("aria-hidden", "true");
        scene.appendChild(phoneClock);
      }

      // The notebook was already a hidden hotspot; make its visitor list
      // discoverable without introducing any unrelated items.
      if (scene && !document.getElementById("bureau-guestbook-entry")) {
        const notebook = document.createElement("button");
        notebook.id = "bureau-guestbook-entry";
        notebook.type = "button";
        notebook.setAttribute("aria-label", "Open de gedeelde namenlijst en teken het gastenboek");
        notebook.title = "Open het gedeelde gastenboek";
        notebook.innerHTML = "<strong aria-hidden=\"true\">R</strong>";
        notebook.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          document.querySelector<HTMLButtonElement>('.spot[data-open="about"]')?.click();
        });
        scene.appendChild(notebook);
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
      /* The approved photorealistic image is now the SINGLE visual source.
         All previous SVG/photo/cutout layers remain in the DOM for compatibility
         with the existing interactions but are never painted. */
      style.textContent += `
        .bureau-embed #scene > img:not(.bureau-approved-photo) {
          display: none !important;
          visibility: hidden !important;
        }
        .bureau-embed #scene > img.bureau-approved-photo {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          visibility: visible !important;
          z-index: 1 !important;
          object-fit: fill !important;
          filter: none !important;
          opacity: 1 !important;
          border: 0 !important;
          background: transparent !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
          clip-path: none !important;
          pointer-events: none !important;
          user-select: none !important;
        }
        .bureau-embed #bureau-guestbook-entry {
          left: 82.6% !important;
          top: 78% !important;
          width: 14.4% !important;
          height: 11.8% !important;
          z-index: 15 !important;
          transform: none !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
          color: transparent !important;
          text-shadow: none !important;
          padding: 0 !important;
          filter: none !important;
        }
        .bureau-embed #bureau-guestbook-entry::before,
        .bureau-embed #bureau-guestbook-entry::after,
        .bureau-embed #bureau-guestbook-entry strong {
          display: none !important;
        }
        .bureau-embed #bureau-guestbook-entry:hover,
        .bureau-embed #bureau-guestbook-entry:focus-visible {
          transform: none !important;
          filter: none !important;
          outline: 1px solid rgba(220,197,159,.62) !important;
          outline-offset: 1px !important;
        }
        .bureau-embed .bureau-secondary-display {
          left: 14.2% !important;
          top: 31.2% !important;
          width: 16% !important;
          height: 38.5% !important;
          z-index: 12 !important;
        }
        .bureau-embed .spot[data-open="bag"] {
          left: 4.3% !important;
          top: 11.2% !important;
          width: 10.5% !important;
          height: 54.4% !important;
          z-index: 10 !important;
        }
        .bureau-embed .spot[data-open="rubik"] {
          left: 4.7% !important;
          top: 72.4% !important;
          width: 8.4% !important;
          height: 17.3% !important;
          z-index: 10 !important;
        }
        .bureau-embed .spot[data-open="monitor"],
        .bureau-embed .spot[data-open="computer"] {
          left: 31% !important;
          top: 34% !important;
          width: 43.7% !important;
          height: 34.3% !important;
          z-index: 10 !important;
        }
        /* Match interactions to the exact approved objects, not to the
           former drawing's coordinates. Never add visual boxes. */
        .bureau-embed .spot[data-open="projects"] {
          left: 30.4% !important;
          top: 34.2% !important;
          width: 43.8% !important;
          height: 33.7% !important;
          z-index: 10 !important;
          cursor: pointer !important;
        }
        .bureau-embed .desktop-icons [data-open="projects"],
        .bureau-embed .desktop-icons [data-action="projects"],
        .bureau-embed .desktop-icons [hidden] {
          display: none !important;
        }
        .bureau-embed .spot[data-open="muay"] {
          left: 17.1% !important;
          top: 7.1% !important;
          width: 18.3% !important;
          height: 30.3% !important;
          z-index: 10 !important;
        }
        /* The original print stays untouched; a small hover/focus hint
           shows that the poster hides a real playable challenge. */
        .bureau-embed .spot[data-open="muay"] {
          cursor: pointer !important;
        }
        .bureau-embed .spot[data-open="muay"]::after {
          content: "FIGHT CAMP  ↗" !important;
          position: absolute !important;
          left: 8% !important;
          bottom: 4% !important;
          display: block !important;
          width: 84% !important;
          padding: 9px 3px !important;
          border: 1px solid #f5c686 !important;
          border-radius: 3px !important;
          background: #141013df !important;
          color: #ffdcaa !important;
          text-align: center !important;
          font: 900 clamp(8px,.8vw,12px)/1.2 ui-monospace,monospace !important;
          letter-spacing: .12em !important;
          opacity: 0 !important;
          transform: translateY(5px) !important;
          transition: opacity .16s,transform .16s !important;
          pointer-events: none !important;
        }
        .bureau-embed .spot[data-open="muay"]:hover::after,
        .bureau-embed .spot[data-open="muay"]:focus-visible::after {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .bureau-embed .spot[data-open="pc"] {
          left: 75.8% !important;
          top: 28.5% !important;
          width: 19.8% !important;
          height: 50% !important;
          z-index: 11 !important;
        }
        .bureau-embed .spot[data-open="arcade"],
        .bureau-embed .spot[data-open="phone"],
        .bureau-embed #bureau-phone-entry {
          position: absolute !important;
          left: 14.9% !important;
          top: 69.7% !important;
          width: 7.4% !important;
          height: 8.6% !important;
          z-index: 16 !important;
          cursor: pointer !important;
          background: transparent !important;
          border: 0 !important;
          padding: 0 !important;
          touch-action: manipulation !important;
        }
        .bureau-embed #bureau-phone-entry:focus-visible,
        .bureau-embed .spot[data-open="arcade"]:focus-visible,
        .bureau-embed .spot[data-open="phone"]:focus-visible {
          outline: 2px solid rgba(228,180,115,.85) !important;
          outline-offset: 2px !important;
        }
        @media (max-width: 680px) {
          /* Minimum ~44px phone target on small screens without moving its artwork. */
          .bureau-embed .spot[data-open="arcade"],
          .bureau-embed .spot[data-open="phone"],
          .bureau-embed #bureau-phone-entry {
            left: 12.5% !important;
            top: 67.5% !important;
            width: 12.5% !important;
            height: 14.4% !important;
          }
        }
        /* 16:20 is printed on the actual small phone screen, above the
           artwork without changing the photograph or intercepting taps. */
        .bureau-embed #bureau-physical-phone-clock {
          position: absolute !important;
          left: 16.7% !important;
          top: 72.1% !important;
          width: 4.35% !important;
          height: auto !important;
          z-index: 18 !important;
          margin: 0 !important;
          padding: 0 !important;
          color: #f9e2b3 !important;
          background: transparent !important;
          text-align: center !important;
          white-space: nowrap !important;
          font: 900 clamp(5px,.78vw,12px)/1 ui-monospace,Consolas,monospace !important;
          letter-spacing: .02em !important;
          text-shadow: 0 0 5px #ffce876e,0 1px 2px #000 !important;
          transform: rotate(15deg) skewX(-7deg) !important;
          transform-origin: center !important;
          pointer-events: none !important;
          user-select: none !important;
        }
        .bureau-embed .spot[data-open="keyboard"] {
          left: 31.6% !important;
          top: 76.7% !important;
          width: 28.9% !important;
          height: 9.3% !important;
          z-index: 14 !important;
          cursor: text !important;
          touch-action: manipulation !important;
        }
        .bureau-embed .spot[data-open="keyboard"]:focus-visible {
          outline: 2px solid rgba(228,180,115,.75) !important;
          outline-offset: 2px !important;
        }
        .bureau-embed .spot[data-open="about"],
        .bureau-embed .spot[data-open="archive"] {
          pointer-events: none !important;
        }
      `;

      // The original photo artwork already contains a beautiful monochrome
      // Muay Thai print under its warm physical picture light. Never cover it
      // with illustrated artwork: the poster MUST belong to the same desk.
      // Only a discreet printed title and a tiny reactive eye live above it.
      style.textContent += `
        .bureau-embed #scene > .bureau-kinetic-poster {
          position: absolute !important;
          left: 17.66% !important;
          top: 7.65% !important;
          width: 18.24% !important;
          height: 27.45% !important;
          z-index: 9 !important;
          display: block !important;
          overflow: hidden !important;
          pointer-events: none !important;
          user-select: none !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: linear-gradient(180deg, transparent 58%, rgba(6,8,11,.02) 72%, rgba(6,8,11,.8) 100%) !important;
          transform: none !important;
          filter: none !important;
        }
        .bureau-embed .bureau-kinetic-poster .bureau-poster-wordmark {
          position: absolute !important;
          left: 4% !important;
          right: 4% !important;
          bottom: 5% !important;
          display: block !important;
          font: 900 clamp(8px,1.05vw,16px)/1.04 system-ui,-apple-system,sans-serif !important;
          color: #eee9e3 !important;
          letter-spacing: -.035em !important;
          text-align: center !important;
          text-shadow: 0 1px 4px #000, 0 0 9px #000 !important;
          white-space: nowrap !important;
        }
        .bureau-embed .bureau-kinetic-poster .bureau-poster-eye {
          position: absolute !important;
          left: 54.8% !important;
          top: 30.2% !important;
          width: 3.6% !important;
          height: 1.8% !important;
          border-radius: 50% !important;
          background: radial-gradient(ellipse,rgba(237,218,187,.6) 0%,rgba(180,172,169,.36) 36%,transparent 72%) !important;
          mix-blend-mode: screen !important;
          opacity: .74 !important;
          transform: translate3d(var(--bureau-eye-x, 0px),var(--bureau-eye-y,0px),0) !important;
          transition: transform .17s ease-out,opacity .25s !important;
          animation: bureau-eye-blink 9.2s ease-in-out infinite !important;
        }
        .bureau-embed #scene:has(.spot[data-open="muay"]:hover) > .bureau-kinetic-poster .bureau-poster-eye,
        .bureau-embed #scene:has(.spot[data-open="muay"]:focus-visible) > .bureau-kinetic-poster .bureau-poster-eye {
          opacity: 1 !important;
          filter: brightness(1.14) !important;
        }
        .bureau-embed .spot[data-open="muay"]::after {
          content: "TEST YOUR MIGHT ↗" !important;
          display: block !important;
          background: rgba(12,12,14,.92) !important;
          border: 1px solid rgba(209,177,138,.65) !important;
          color: #f0e6da !important;
          letter-spacing: .06em !important;
          font-weight: 750 !important;
          box-shadow: none !important;
        }
        @keyframes bureau-eye-blink {
          0%,38%,40%,75%,77%,100% { scale: 1 1; }
          39%,76% { scale: 1 .08; }
        }
        @media (prefers-reduced-motion:reduce) {
          .bureau-embed .bureau-poster-eye {
            animation: none !important;
            transition: none !important;
          }
        }
      `;
      if (scene && !document.getElementById("bureau-approved-photo")) {
        const approved = document.createElement("img");
        approved.id = "bureau-approved-photo";
        approved.className = "bureau-approved-photo";
        approved.src = "/bureau/bureau-approved-photorealistic-cutout.svg?v=transparent-cutout-1";
        approved.alt = "The Bureau: werkplek met twee bergschermen, pc, telefoon, bokszak en notitieboek";
        approved.draggable = false;
        approved.decoding = "async";
        scene.insertBefore(approved, scene.firstChild);
      }


      if (scene && !document.getElementById("bureau-kinetic-poster")) {
        const livingPoster = document.createElement("div");
        livingPoster.id = "bureau-kinetic-poster";
        livingPoster.className = "bureau-kinetic-poster";
        livingPoster.setAttribute("aria-hidden", "true");
        const wordmark = document.createElement("span");
        wordmark.className = "bureau-poster-wordmark";
        wordmark.textContent = "TEST YOUR MIGHT";
        const eye = document.createElement("span");
        eye.className = "bureau-poster-eye";
        livingPoster.append(wordmark, eye);
        scene.appendChild(livingPoster);
        const eyeTarget = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const bounds = livingPoster.getBoundingClientRect();
          const cx = bounds.left + bounds.width * .56;
          const cy = bounds.top + bounds.height * .31;
          const dx = Math.max(-3, Math.min(3, (event.clientX - cx) / Math.max(bounds.width,1) * 3.5));
          const dy = Math.max(-2, Math.min(2, (event.clientY - cy) / Math.max(bounds.height,1) * 2.1));
          livingPoster.style.setProperty("--bureau-eye-x", dx.toFixed(2)+"px");
          livingPoster.style.setProperty("--bureau-eye-y", dy.toFixed(2)+"px");
        };
        document.addEventListener("pointermove", eyeTarget, { passive: true });
        window.addEventListener("blur", () => {
          livingPoster.style.setProperty("--bureau-eye-x", "0px");
          livingPoster.style.setProperty("--bureau-eye-y", "0px");
        });
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
    <iframe ref={iframeRef} src="/bureau/index.html?embed=1&scene=transparent-cutout-v30"
      title="The Bureau — interactieve illustratie" loading="eager"
      // Keep the scene mounted (preserves its interactive state), but stop
      // rendering the large illustrated iframe under the full-screen game.
      style={gameOpen || bagOpen || rubikOpen || arcadeOpen || posterOpen || terminalOpen || phoneMode ? { display: "none" } : undefined}
      onLoad={prepareScene} allowFullScreen />
    {phoneMode === "menu" && typeof document !== "undefined" && createPortal(
      <div className="bureau-phone-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPhoneMode(null); }}>
        <section className="bureau-phone-device" role="dialog" aria-modal="true" aria-labelledby="bureau-phone-heading">
          <div className="bureau-phone-notch" aria-hidden="true"><span/></div>
          <div className="bureau-phone-topline"><span><Smartphone size={13} aria-hidden="true"/> THE BUREAU / PHONE</span><time className="bureau-phone-clock" dateTime="16:20">16:20</time><button ref={phoneCloseRef} type="button" aria-label="Sluit de telefoon" onClick={() => setPhoneMode(null)}><X size={17}/></button></div>
          <div className="bureau-phone-home">
            <div className="bureau-phone-intro">
              <span>POCKET ARCADE / 04 GAMES</span>
              <h2 id="bureau-phone-heading">Pick up &amp; play<span>.</span></h2>
              <p>Vier mini-games in de telefoon op het bureau. Tik een spel om direct te beginnen.</p>
            </div>
            <div className="bureau-phone-apps">
              <button type="button" onClick={() => setPhoneMode("sky")} className="bureau-phone-app bureau-phone-sky">
                <span className="bureau-phone-app-symbol"><Bird size={35} strokeWidth={1.65} aria-hidden="true"/></span>
                <span className="bureau-phone-app-type"><Trophy size={13} aria-hidden="true"/> SINGLE PLAYER / TOP 10</span>
                <strong>SNUFFY BIRD</strong>
                <span>Tap om te vliegen, ontwijk de obstakels en verbreek de hoogste scores.</span>
                <em>PLAY NOW <ArrowRight size={15} aria-hidden="true"/></em>
              </button>
              <button type="button" onClick={() => setPhoneMode("curve")} className="bureau-phone-app bureau-phone-curve">
                <span className="bureau-phone-app-symbol"><Route size={35} strokeWidth={1.65} aria-hidden="true"/></span>
                <span className="bureau-phone-app-type"><UsersRound size={13} aria-hidden="true"/> LOCAL MULTIPLAYER / 2–5</span>
                <strong>AGTUNG DIE KURVE</strong>
                <span>Speel met 2–5 spelers op één toetsenbord of op eigen computers via een kamercode.</span>
                <em>PLAY TOGETHER <ArrowRight size={15} aria-hidden="true"/></em>
              </button>
              <button type="button" onClick={() => setPhoneMode("reaction")} className="bureau-phone-app bureau-phone-reaction">
                <span className="bureau-phone-app-symbol"><Zap size={35} strokeWidth={1.65} aria-hidden="true"/></span>
                <span className="bureau-phone-app-type"><Trophy size={13} aria-hidden="true"/> REFLEX / PERSONAL BEST</span>
                <strong>DR. MONGO’S REACTION GAME</strong>
                <span>Wacht op groen en tik zo snel mogelijk.</span>
                <em>PLAY NOW <ArrowRight size={15} aria-hidden="true"/></em>
              </button>
              <button type="button" onClick={() => setPhoneMode("ten")} className="bureau-phone-app bureau-phone-ten">
                <span className="bureau-phone-app-symbol"><Timer size={35} strokeWidth={1.65} aria-hidden="true"/></span>
                <span className="bureau-phone-app-type"><Trophy size={13} aria-hidden="true"/> TIMING / PERSONAL BEST</span>
                <strong>THE BUTTON 10:00</strong>
                <span>Stop de rode knop op exact 10.00 seconden.</span>
                <em>PLAY NOW <ArrowRight size={15} aria-hidden="true"/></em>
              </button>
            </div>
            <div className="bureau-phone-hint">NO DOWNLOADS · PLAY DIRECTLY IN YOUR BROWSER</div>
          </div>
          <div className="bureau-phone-homebar" aria-hidden="true"/>
        </section>
      </div>, document.body)}
    {phoneMode && phoneMode !== "menu" && typeof document !== "undefined" && createPortal(
      <div className="bureau-game-overlay" role="dialog" aria-modal="true" aria-label={phoneGameDetails[phoneMode].title}>
        <header className="bureau-game-chrome">
          <div className="bureau-game-identity"><span className="bureau-game-signal"/>
            <span><strong>{phoneGameDetails[phoneMode].title}</strong><small>{phoneGameDetails[phoneMode].subtitle}</small></span>
          </div>
          <div className="bureau-game-actions">
            <a href={phoneGameDetails[phoneMode].url} target="_blank" rel="noopener noreferrer" aria-label="Open dit spel in een nieuw tabblad" title="Open game apart"><Maximize2 size={17}/></a>
            <button ref={phoneCloseRef} type="button" onClick={() => setPhoneMode("menu")}>
              <ArrowLeft size={16}/><span>TERUG NAAR DE TELEFOON</span><X size={18}/>
            </button>
          </div>
        </header>
        <iframe className="bureau-game-viewport" src={phoneGameDetails[phoneMode].url} title={phoneGameDetails[phoneMode].title} allow="fullscreen"/>
      </div>, document.body)}
    {terminalOpen && typeof document !== "undefined" && createPortal(
      <BureauTerminal
        onClose={() => setTerminalOpen(false)}
        onLaunchSecret={() => { setTerminalOpen(false); setGameOpen(true); }}
      />, document.body)}
    {arcadeOpen && typeof document !== "undefined" && createPortal(
      <div className="bureau-arcade-overlay" role="dialog" aria-modal="true" aria-labelledby="bureau-arcade-heading">
        <div className="bureau-arcade-shell">
          <header className="bureau-arcade-head">
            <div className="bureau-arcade-brand"><Gamepad2 size={21} aria-hidden="true"/><span>THE BUREAU <em>/ ARCADE</em></span></div>
            <button type="button" className="bureau-arcade-close" ref={arcadeCloseRef} onClick={() => setArcadeOpen(false)} aria-label="Sluit de arcade en ga terug naar het bureau"><X size={19}/></button>
          </header>
          <div className="bureau-arcade-intro">
            <span>INTERACTIVE EXPERIENCES / 04</span>
            <h2 id="bureau-arcade-heading">Pick a challenge<span>.</span></h2>
            <p>Vier korte ervaringen. Kies er één of ontdek ze via de objecten op het bureau.</p>
          </div>
          <div className="bureau-arcade-grid">
            <button className="bureau-arcade-card" type="button" onClick={() => {setArcadeOpen(false);setBagOpen(true);}}>
              <span className="bureau-arcade-card-index">01 / IDLE BOXING</span>
              <Dumbbell className="bureau-arcade-card-icon" size={34} strokeWidth={1.5} aria-hidden="true"/>
              <strong>HEAVY BAG</strong>
              <span>Bouw van je eerste punch een complete boksschool.</span>
              <em>START TRAINING <ArrowRight size={15} aria-hidden="true"/></em>
            </button>
            <button className="bureau-arcade-card" type="button" onClick={() => {setArcadeOpen(false);setRubikOpen(true);}}>
              <span className="bureau-arcade-card-index">02 / 90-SECOND RUN</span>
              <Box className="bureau-arcade-card-icon" size={34} strokeWidth={1.5} aria-hidden="true"/>
              <strong>CUBE SURVIVOR</strong>
              <span>Ontwijk, verzamel XP en bouw zes wapens tegelijk op.</span>
              <em>PLAY SURVIVOR <ArrowRight size={15} aria-hidden="true"/></em>
            </button>
            <button className="bureau-arcade-card" type="button" onClick={() => {setArcadeOpen(false);setGameOpen(true);}}>
              <span className="bureau-arcade-card-index">03 / SECRET FILE 030</span>
              <LockKeyhole className="bureau-arcade-card-icon" size={34} strokeWidth={1.5} aria-hidden="true"/>
              <strong>UNFINISHED PROJECT</strong>
              <span>Ontgrendel het verhaal achter de verborgen systeemproeven.</span>
              <em>OPEN SECRET FILE <ArrowRight size={15} aria-hidden="true"/></em>
            </button>
            <button className="bureau-arcade-card" type="button" onClick={openFightCamp}>
              <span className="bureau-arcade-card-index">04 / STRENGTH TRIAL</span>
              <Swords className="bureau-arcade-card-icon" size={34} strokeWidth={1.5} aria-hidden="true"/>
              <strong>TEST YOUR MIGHT</strong>
              <span>Bouw kracht op, voer de perfecte slag uit en breek vijf steeds sterkere materialen.</span>
              <em>TAKE THE TEST <ArrowRight size={15} aria-hidden="true"/></em>
            </button>
          </div>
          <footer className="bureau-arcade-foot">TIP / De bokszak, Rubik's Cube en de poster werken ook direct vanaf het bureau.</footer>
        </div>
      </div>, document.body)}
    {posterOpen && typeof document !== "undefined" && createPortal(
      <div className="bureau-game-overlay" role="dialog" aria-modal="true" aria-label="Test Your Might — interactieve krachtproef">
        <header className="bureau-game-chrome">
          <div className="bureau-game-identity"><span className="bureau-game-signal"/>
            <span><strong>TEST YOUR MIGHT</strong><small>THE BUREAU / FIGHT CAMP / STRENGTH TRIAL</small></span>
          </div>
          <div className="bureau-game-actions">
            <a href="/bureau/fight-camp.html" target="_blank" rel="noopener noreferrer" aria-label="Open Test Your Might in apart tabblad" title="Open apart"><Maximize2 size={17}/></a>
            <button ref={posterCloseRef} type="button" onClick={() => setPosterOpen(false)}>
              <ArrowLeft size={16}/><span>TERUG NAAR HET BUREAU</span><X size={18}/>
            </button>
          </div>
        </header>
        <iframe className="bureau-game-viewport" src="/bureau/fight-camp.html" title="Test Your Might — krachtproef" allow="fullscreen"/>
      </div>, document.body)}
    {bagOpen && typeof document !== "undefined" && createPortal(
      <div className="bureau-game-overlay" role="dialog" aria-modal="true" aria-label="Heavy Bag spel">
        <header className="bureau-game-chrome">
          <div className="bureau-game-identity"><span className="bureau-game-signal"/>
            <span><strong>THE HEAVY BAG</strong><small>THE BUREAU / IDLE BOXING / ROAD TO CHAMPION</small></span>
          </div>
          <div className="bureau-game-actions">
            <a href="/bureau/heavybag-play.html" target="_blank" rel="noopener noreferrer" aria-label="Open Heavy Bag in een nieuw tabblad" title="Open game apart"><Maximize2 size={17}/></a>
            <button ref={bagCloseRef} type="button" onClick={() => setBagOpen(false)}>
              <ArrowLeft size={16}/><span>TERUG NAAR HET PLAATJE</span><X size={18}/>
            </button>
          </div>
        </header>
        <iframe className="bureau-game-viewport" src="/bureau/heavybag-play.html"
          title="Heavy Bag — Idle Boxing" allow="fullscreen"/>
      </div>, document.body)}
    {rubikOpen && typeof document !== "undefined" && createPortal(
      <div className="bureau-game-overlay" role="dialog" aria-modal="true" aria-label="Cube Survivor spel">
        <header className="bureau-game-chrome">
          <div className="bureau-game-identity"><span className="bureau-game-signal"/>
            <span><strong>CUBE SURVIVOR</strong><small>THE BUREAU / COLOR ARSENAL / 90 SECONDS</small></span>
          </div>
          <div className="bureau-game-actions">
            <a href="/bureau/cube-survivor.html" target="_blank" rel="noopener noreferrer"
              aria-label="Open Cube Survivor in een nieuw tabblad" title="Open game apart"><Maximize2 size={17}/></a>
            <button ref={rubikCloseRef} type="button" onClick={() => setRubikOpen(false)}>
              <ArrowLeft size={16}/><span>TERUG NAAR HET PLAATJE</span><X size={18}/>
            </button>
          </div>
        </header>
        <iframe className="bureau-game-viewport" src="/bureau/cube-survivor.html"
          title="Cube Survivor — Color Arsenal" allow="fullscreen"/>
      </div>, document.body)}
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
