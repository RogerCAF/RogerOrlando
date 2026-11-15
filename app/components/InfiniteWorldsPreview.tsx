"use client";

import { ArrowUpRight } from "lucide-react";

/**
 * Infinite Worlds has one introduction on the main page.
 * This component only presents the zoom canvas and its controls.
 */
export default function InfiniteWorldsPreview() {
  return (
    <div className="iw-preview">
      <div className="iw-preview-toolbar">
        <span>WERELD 01—05 · SCROLL OMHOOG OF KNIJP</span>
        <a href="/infinite-worlds.html" target="_blank" rel="noopener noreferrer">
          VOLLEDIG SCHERM <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="iw-preview-frame">
        <iframe
          src="/infinite-worlds.html"
          loading="lazy"
          title="The Bureau of Impossible Things — werelden 1 t/m 5"
          allowFullScreen
        />
      </div>
    </div>
  );
}
