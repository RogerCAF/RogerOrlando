"use client";

import { ArrowUpRight, Maximize2 } from "lucide-react";

/**
 * The live hand-drawn Infinite Worlds intro.
 * The standalone experience remains independent of the portfolio layout.
 * The earlier procedural InfiniteZoom implementation is kept in the repo
 * so the scenes can be refined without losing earlier work.
 */
export default function InfiniteWorldsPreview() {
  return (
    <div style={{ marginTop: 36, marginBottom: 38, width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: 22, marginBottom: 20 }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ color: "#c8a57e", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", marginBottom: 10 }}>
            EXPERIMENT 02 / INFINITE WORLDS · LIVE PROTOTYPE
          </div>
          <h3 style={{ margin: "0 0 9px", fontSize: "clamp(25px,3vw,40px)", lineHeight: 1.15, letterSpacing: "-0.035em" }}>
            One little screen. <em style={{ color: "#c6aa8a" }}>Endless possibilities.</em>
          </h3>
          <p style={{ margin: 0, color: "#aaa9a6", lineHeight: 1.7, fontSize: 14 }}>
            Een handgetekende wereld waarin iedere doorgang een nieuwe ontdekking is.
            Zoom vanaf de kleine computer tot aan de werkplek. De rest bouwen we stap voor stap verder.
          </p>
        </div>
        <a href="/infinite-worlds.html" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "#e9d3b9", fontSize: 12, fontWeight: 750,
            letterSpacing: "0.08em", textDecoration: "none", border: "1px solid #bb9b7755",
            borderRadius: 6, padding: "13px 16px", whiteSpace: "nowrap" }}>
          OPEN OP VOLLEDIG SCHERM <ArrowUpRight size={15} />
        </a>
      </div>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 13, height: "clamp(430px,68svh,750px)",
        border: "1px solid #ad916c44", background: "#f8f7f2" }}>
        <iframe src="/infinite-worlds.html" loading="lazy" title="Infinite Worlds — interactieve handgetekende zoomwereld"
          allowFullScreen style={{ border: 0, display: "block", width: "100%", height: "100%" }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10,
        marginTop: 11, color: "#99918a", fontSize: 11, letterSpacing: "0.04em" }}>
        <span>SCROLL, TIK OF KNIJP OM IN TE ZOOMEN</span>
        <a href="/infinite-worlds.html" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: "#c6a887" }}>
          BEKIJK ZONDER RANDEN <Maximize2 size={13} />
        </a>
      </div>
    </div>
  );
}
