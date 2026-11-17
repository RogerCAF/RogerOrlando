"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Bug, Check, Cpu, HardDrive, Radar, RotateCcw, ShieldCheck, Trophy, Zap } from "lucide-react";

type Quest = "build" | "packets" | "ghost";
type Save = { finished: Quest[]; wrong: number };
const STORE = "rogeros-anomalies-v1";
const QUESTS: { id: Quest; code: string; title: string; type: string; reward: number }[] = [
  { id: "build", code: "A-01", title: "Deploy From Hell", type: "PIPELINE / REPAIR", reward: 75 },
  { id: "packets", code: "A-02", title: "Packet Impostors", type: "NETWORK / FORENSICS", reward: 100 },
  { id: "ghost", code: "A-03", title: "Ghost Process", type: "SYSTEM / HUNT", reward: 125 }
];
const pipeline = ["BUILD", "ISOLATE", "RESTART", "VERIFY", "PATCH"];
const answer = ["ISOLATE", "PATCH", "BUILD", "VERIFY", "RESTART"];
const traffic = [
  { id: "01", ip: "10.20.0.18", port: "443", note: "VAULT / TLS", suspect: false },
  { id: "02", ip: "198.51.100.44", port: "23", note: "UNKNOWN / TELNET", suspect: true },
  { id: "03", ip: "10.20.0.81", port: "443", note: "BACKUP / TLS", suspect: false },
  { id: "04", ip: "203.0.113.9", port: "22", note: "UNAUTHORIZED / SSH", suspect: true },
  { id: "05", ip: "10.20.0.30", port: "443", note: "LOCAL / TLS", suspect: false },
  { id: "06", ip: "192.0.2.13", port: "23", note: "UNKNOWN / TELNET", suspect: true }
];
const ghosts = [{ x: 50, y: 42 }, { x: 21, y: 68 }, { x: 76, y: 23 }, { x: 70, y: 72 }, { x: 35, y: 28 }];

export default function AnomalyBoard() {
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState<Quest[]>([]);
  const [wrong, setWrong] = useState(0);
  const [active, setActive] = useState<Quest>("build");
  const [steps, setSteps] = useState<string[]>([]);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [captures, setCaptures] = useState(0);
  const [note, setNote] = useState("Er lopen drie processen rond die nooit in productie hadden mogen komen.");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw) as Save;
        if (Array.isArray(saved.finished)) {
          setFinished(saved.finished.filter((x): x is Quest => x === "build" || x === "packets" || x === "ghost"));
        }
        if (Number.isFinite(saved.wrong)) setWrong(Math.max(0, Math.min(999, saved.wrong)));
      }
    } catch { /* Browser may disable persistence. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORE, JSON.stringify({ finished, wrong })); }
    catch { /* Playable without storage. */ }
  }, [finished, wrong, ready]);

  const done = (id: Quest) => finished.includes(id);
  const award = (id: Quest, message: string) => {
    setFinished(old => old.includes(id) ? old : [...old, id]);
    setNote(message);
  };
  const fail = (message: string) => {
    setWrong(n => n + 1);
    setNote(message);
  };
  const runBuild = (step: string) => {
    if (done("build")) return;
    if (answer[steps.length] !== step) {
      setSteps([]);
      fail("ROLLBACK. Verkeerde volgorde. De deploy heeft zichzelf ontslagen.");
      return;
    }
    const next = [...steps, step];
    setSteps(next);
    if (next.length === answer.length) award("build", "PIPELINE RESTORED. De stagiair mag weer op de merge-knop drukken.");
    else setNote("Stap " + next.length + "/5 bevestigd. Geen incidentmelding nodig. Nog.");
  };
  const scanPacket = (id: string) => {
    if (done("packets") || flagged.includes(id)) return;
    const packet = traffic.find(x => x.id === id);
    if (!packet) return;
    if (!packet.suspect) { fail("FALSE POSITIVE. Die verbinding was legitiem. De firewall is teleurgesteld."); return; }
    const next = [...flagged, id];
    setFlagged(next);
    if (next.length === 3) award("packets", "THREATS QUARANTINED. Drie verdachte pakketten onderschept.");
    else setNote(next.length + "/3 verdachte verbindingen gevonden. Let op IP-bereik en poorten.");
  };
  const catchGhost = () => {
    if (done("ghost")) return;
    const next = captures + 1;
    setCaptures(next);
    if (next >= 5) award("ghost", "PROCESS TERMINATED. Het spook is nu officieel werkloos.");
    else setNote("GHOST.EXE ontsnapt! " + next + "/5 hits. Nog een keer.");
  };
  const xp = QUESTS.filter(x => done(x.id)).reduce((sum, x) => sum + x.reward, 0);
  const current = QUESTS.find(x => x.id === active)!;

  return <section className="rg-anomalies" aria-label="Extra speelbare systeemstoringen">
    <header className="rg-anomalies-head">
      <div><span className="rg-anomaly-eyebrow"><Bug size={15}/> ROGER_OS / OPTIONAL OPERATIONS</span>
        <h2>Things that <em>shouldn't exist.</em></h2>
        <p>Drie extra mini-games verstopt in de code. Debug de chaos, onderschep indringers en jaag op een proces dat weigert te sluiten.</p>
      </div>
      <div className="rg-anomaly-count"><span>SIDEQUESTS COMPLETE</span><strong>{finished.length}<small> / 03</small></strong><span>{xp} BONUS XP</span></div>
    </header>
    <div className="rg-anomaly-tabs">
      {QUESTS.map(q => <button type="button" key={q.id} onClick={() => {setActive(q.id);setNote(done(q.id) ? "OPERATION COMPLETE. Je hebt dit al opgelost." : "Nieuwe operatie geladen. Good luck, operator.");}}
        className={active === q.id ? "selected" : ""} aria-pressed={active === q.id}>
        <span>{q.code}</span><strong>{q.title}</strong>{done(q.id) ? <Check size={16}/> : <ArrowRight size={16}/>}
      </button>)}
    </div>
    <div className="rg-anomaly-stage">
      <div className="rg-anomaly-stage-top"><span><Radar size={16}/> {current.type}</span><span>{done(active) ? "✓ PATCHED" : "● CORRUPTED"}</span></div>
      {active === "build" && <div className="rg-anomaly-task">
        <div className="rg-anomaly-visual"><Cpu size={35}/><div><strong>CI/CD PIPELINE BROKEN</strong><span>ERR 030 / LAST KNOWN GOOD BUILD: NEVER</span></div></div>
        <p>Een deploy is gecrasht. Klik de acties in de juiste volgorde: eerst isoleren, dan patchen, bouwen, verifiëren en als laatste herstarten. Eén fout = rollback.</p>
        <div className="rg-anomaly-sequence"><span>EXECUTION QUEUE</span><strong>{steps.length ? steps.join(" → ") : "AWAITING COMMANDS..."}</strong><small>{steps.length}/5</small></div>
        {!done("build") && <div className="rg-anomaly-actions">{pipeline.map(action =>
          <button type="button" key={action} onClick={() => runBuild(action)} disabled={steps.includes(action)}>{action}</button>)}</div>}
      </div>}
      {active === "packets" && <div className="rg-anomaly-task">
        <div className="rg-anomaly-visual"><ShieldCheck size={34}/><div><strong>INTRUSION DETECTED</strong><span>PACKET CAPTURE / SIX CONNECTIONS</span></div></div>
        <p>Het archief verwacht alleen intern verkeer op poort 443. Selecteer de <strong>drie verdachte verbindingen</strong> om ze in quarantaine te plaatsen. Tik op een rij om hem te onderscheppen.</p>
        <div className="rg-anomaly-packets">{traffic.map(packet =>
          <button type="button" key={packet.id} disabled={done("packets") || flagged.includes(packet.id)}
            className={flagged.includes(packet.id) ? "is-flagged" : ""} onClick={() => scanPacket(packet.id)}>
            <span>PKT {packet.id}</span><strong>{packet.ip}</strong><span>:{packet.port}</span>
            <small>{flagged.includes(packet.id) ? "QUARANTINED" : packet.note}</small>
          </button>)}</div>
      </div>}
      {active === "ghost" && <div className="rg-anomaly-task">
        <div className="rg-anomaly-visual"><HardDrive size={34}/><div><strong>PROCESS 030: CANNOT TERMINATE</strong><span>MEMORY / HIDE AND SEEK</span></div></div>
        <p>GHOST.EXE springt naar een andere plek zodra je hem raakt. Vang hem vijf keer om het proces definitief af te sluiten. Ja, de IT-afdeling heeft dit echt gebouwd.</p>
        <div className="rg-anomaly-ghost-zone">
          <div className="rg-anomaly-scanline" aria-hidden="true"/>
          {done("ghost") ? <div className="rg-anomaly-ghost-done"><Trophy size={33}/> PROCESS TERMINATED</div> :
            <button type="button" className="rg-anomaly-ghost" onClick={catchGhost} style={{left:ghosts[captures % ghosts.length].x + "%",top:ghosts[captures % ghosts.length].y + "%"}} aria-label="Vang het spookproces"><Zap size={24}/><span>GHOST.EXE</span></button>}
          <span className="rg-anomaly-ghost-counter">{captures}/5 CAPTURES</span>
        </div>
      </div>}
      {done(active) && <div className="rg-anomaly-cleared"><Check size={18}/> OPERATION RESTORED <strong>+{current.reward} BONUS XP</strong></div>}
      <div className="rg-anomaly-note" role="status"><AlertTriangle size={15}/><span>{note}</span><small>{wrong} INCIDENTS</small></div>
    </div>
    {finished.length === 3 && <div className="rg-anomaly-achievement"><Trophy size={26}/><div><strong>ACHIEVEMENT UNLOCKED: BUG HUNTER</strong><span>Alle drie storingen verholpen. De fictieve helpdesk heeft nu eindelijk pauze.</span></div><span>+300 XP</span></div>}
    <footer className="rg-anomaly-footer"><span><Check size={14}/> VOORTGANG WORDT LOKAAL OPGESLAGEN</span>
      <button type="button" onClick={() => {setFinished([]);setSteps([]);setFlagged([]);setCaptures(0);setWrong(0);setActive("build");setNote("NIEUWE RUN. Alle bonusmissies zijn herstart.");}}><RotateCcw size={13}/> RESET SIDEQUESTS</button>
    </footer>
  </section>;
}
