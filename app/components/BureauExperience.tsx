"use client";

import { useCallback, useRef } from "react";

/**
 * Same-origin Bureau embed. Keep the original interactive artwork and hotspots,
 * but detach the illustration from its room backdrop and its former framed stage.
 */
export default function BureauExperience() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
          -webkit-mask-image: url("/bureau/scene-cutout.svg") !important;
          mask-image: url("/bureau/scene-cutout.svg") !important;
          -webkit-mask-repeat: no-repeat !important;
          mask-repeat: no-repeat !important;
          -webkit-mask-size: 100% 100% !important;
          mask-size: 100% 100% !important;
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
            width: max(740px, 202vw) !important;
            max-width: none !important;
            margin: 0 !important;
            animation: none !important;
          }
          .bureau-embed .top { pointer-events: none !important; }
          .bureau-embed .top button { pointer-events: auto !important; }
        }
      `;
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

  return (
    <iframe
      ref={iframeRef}
      src="/bureau/index.html?embed=1&scene=seamless-v2"
      title="The Bureau — interactieve illustratie"
      loading="eager"
      onLoad={prepareScene}
      allowFullScreen
    />
  );
}
