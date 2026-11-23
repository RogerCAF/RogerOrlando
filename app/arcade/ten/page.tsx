"use client";

import TenSecondChallenge from "../../play/TenSecondChallenge";
import "../../play/play.css";
import "../arcade.css";

export default function TenSecondArcade() {
  return <main className="ro-game bureau-standalone bureau-ten-standalone">
    <div className="bureau-standalone-inner">
      <div className="bureau-standalone-eyebrow">THE BUREAU / ARCADE / KAYA’S BUTTON</div>
      <TenSecondChallenge />
    </div>
  </main>;
}
