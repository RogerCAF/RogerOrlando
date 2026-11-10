"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Command,
  Crosshair, Fingerprint, KeyRound, LockKeyhole, Network, RotateCcw,
  ScanLine, ShieldCheck, Sparkles, Terminal, Trophy, Zap
} from "lucide-react";
import "./play.css";

type Ending = "archive" | "broadcast" | "chaos" | null;
type Game = {
  completed: number[];
  xp: number;
  mistakes: number;
  networkPhase: number;
  ending: Ending;
  history: string[];
};
const INITIAL: Game = {
  completed: [], xp: 0, mistakes: 0, networkPhase: 0,
  ending: null, history: ["[00:00:01] ROGER_OS boot complete.", "[00:00:02] Three fragments missing. The archive is locked.", "[00:00:03] Operator connected. Your move."]
};
const MISSIONS = [
  { number: "01", name: "Pixel Protocol", kind: "DESIGN / CALIBRATION", note: "Herstel een ontregeld visueel signaal.", reward: 125 },
  { number: "02", name: "Ghost Network", kind: "SYSTEMS / DIAGNOSTICS", note: "Vind de fout in een fictief netwerk.", reward: 175 },
  { number: "03", name: "The Cipher", kind: "LOGIC / DECRYPTION", note: "Combineer de gevonden fragmenten.", reward: 200 },
  { number: "04", name: "Final Protocol", kind: "CHOICE / CONSEQUENCE", note: "Bepaal wat er met het archief gebeurt.", reward: 100 }
] as const;

const endings = {
  archive: { name: "THE KEEPER", text: "Je hebt het archief veiliggesteld. Niemand weet dat het bestaat — behalve jij. Soms is stilte de ultieme vorm van controle.", status: "ARCHIVE SEALED" },
  broadcast: { name: "THE SIGNAL", text: "Het archief staat open voor iedereen. Geen geheimen, geen poortwachters. Je hebt iets vrijgelaten dat niet meer terug kan.", status: "SIGNAL LIVE" },
  chaos: { name: "THE WILDCARD", text: "Je drukt op de knop die je niet mocht indrukken. Natuurlijk. Het archief herschrijft zichzelf. Op het scherm verschijnt slechts: 'I knew you'd do that.'", status: "CONTROLLED CHAOS" }
};

export default function Play() {
  const [game, setGame] = useState<Game>(INITIAL);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [dial, setDial] = useState(38);
  const [cipher, setCipher] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [resetAsk, setResetAsk] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("rogeros-game-v1");
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Game>;
        const safeCompleted = Array.isArray(saved.completed)
          ? saved.completed.filter((v): v is number => typeof v === "number" && v >= 0 && v <= 3) : [];
        const restored: Game = {
          ...INITIAL, ...saved,
          completed: [...new Set(safeCompleted)],
          xp: typeof saved.xp === "number" && Number.isFinite(saved.xp) ? saved.xp : 0,
          mistakes: typeof saved.mistakes === "number" && Number.isFinite(saved.mistakes) ? saved.mistakes : 0,
          networkPhase: typeof saved.networkPhase === "number" && saved.networkPhase >= 0 && saved.networkPhase <= 3 ? saved.networkPhase : 0,
          ending: ["archive", "broadcast", "chaos"].includes(String(saved.ending)) ? saved.ending as Ending : null,
          history: Array.isArray(saved.history) ? saved.history.filter(x => typeof x === "string").slice(-9) : INITIAL.history
        };
        setGame(restored);
        setStage(restored.completed.length < 4 ? restored.completed.length : 3);
      }
    } catch { /* Damaged local progress is ignored. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try { window.localStorage.setItem("rogeros-game-v1", JSON.stringify(game)); }
      catch { /* Storage can be disabled in private browsing. */ }
    }
  }, [game, ready]);

  const isDone = (id: number) => game.completed.includes(id);
  const unlocked = (id: number) => id === 0 || isDone(id - 1);
  const progress = Math.round(game.completed.length / 4 * 100);
  const append = (line: string) => setGame(previous => ({
    ...previous, history: [...previous.history, line].slice(-9)
  }));
  const resetTransient = () => { setFeedback(""); setShowHint(false); };
  const chooseStage = (id: number) => {
    if (!unlocked(id)) return;
    setStage(id);
    resetTransient();
  };
  const error = (message: string) => {
    const quips = ["SYSTEM NOTE: Zelfs de beste engineers klikken weleens verkeerd.", "WARNING: De denkbeeldige printer lacht je uit.", "ROGER_OS: Nog één poging. Koffie optioneel, nadenken verplicht."];
    setFeedback(message + " " + quips[game.mistakes % quips.length]);
    setGame(previous => ({ ...previous, mistakes: previous.mistakes + 1 }));
  };
  const complete = (id: number, entry: string) => {
    if (isDone(id)) return;
    setGame(previous => ({
      ...previous,
      completed: [...previous.completed, id],
      xp: previous.xp + MISSIONS[id].reward,
      history: [...previous.history, entry].slice(-9)
    }));
    setFeedback("");
    setShowHint(false);
  };
  const calibrate = () => {
    if (Math.abs(dial - 73) <= 4) complete(0, "[DESIGN] Geometry locked at 73. Fragment 73 recovered.");
    else error("Bijna! Verschuif het symbool over de gouden stippellijn. Je hoeft niet exact op de pixel te zitten.");
  };
  const network = (choice: string) => {
    if (isDone(1)) return;
    if (game.networkPhase === 0) {
      if (choice === "ping") {
        setGame(previous => ({ ...previous, networkPhase: 1, history: [...previous.history, "[NET] ping 1.1.1.1 — four replies. Internet connection alive."].slice(-9) }));
        setFeedback("PING SUCCEEDED. De verbinding leeft! De website doet alleen alsof hij je niet kent.");
      } else error("Daarmee gok je op een reparatie. Doe eerst een test: werkt een extern IP-adres?");
    } else if (game.networkPhase === 1) {
      if (choice === "dns") {
        setGame(previous => ({ ...previous, networkPhase: 2, history: [...previous.history, "[NET] nslookup vault.example — DNS timed out. Suspicious silence."].slice(-9) }));
        setFeedback("AHA! DNS is stil. Zelfs de DNS-server ghost je. Zoek de gerichte oplossing.");
      } else error("Het externe IP reageert al. Kijk nu waarom de domeinnaam niet wordt gevonden.");
    } else if (game.networkPhase === 2) {
      if (choice === "resolver") {
        setGame(previous => ({ ...previous, networkPhase: 3, history: [...previous.history, "[NET] DNS restored. Two addresses found: 10.20.0.18 and 10.20.0.81. Archive hint: BAY 18."].slice(-9) }));
        setFeedback("DNS werkt! Maar er zijn twee servers. Het archief fluistert: 'BAY 18'. Welke kies jij?");
      } else error("Je weet dat DNS het probleem is. De kabel vervangen is nu vooral cardio voor je IT-afdeling.");
    } else {
      if (choice === "vault18") complete(1, "[NET] BAY 18 connected. Ghost Network complete. Key fragment recovered: EMBER.");
      else error("Verkeerde server. De aanwijzing is BAY 18. De andere server draait waarschijnlijk alleen memes.");
    }
  };
  const decrypt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cipher.trim().toUpperCase().replace(/\s/g, "") === "EMBER73") complete(2, "[CIPHER] EMBER73 accepted. Vault access granted.");
    else error("Nog niet helemaal. Kijk naar je verzamelde fragmenten, combineer eerst het woord en daarna het getal, en probeer opnieuw.");
  };
  const finish = (ending: Exclude<Ending, null>) => {
    if (!isDone(2) || game.ending) return;
    setGame(previous => ({
      ...previous, ending, completed: [...previous.completed, 3], xp: previous.xp + 100,
      history: [...previous.history, "[VAULT] Protocol selected: " + ending.toUpperCase() + ". Ending unlocked."].slice(-9)
    }));
  };
  // A new playthrough must clear both the saved ending and every in-memory puzzle state.
  // Remove the old save immediately so a page refresh cannot revive the previous run.
  const startNewGame = () => {
    try { window.localStorage.removeItem("rogeros-game-v1"); }
    catch { /* Replay still works when storage is unavailable. */ }
    setGame({ ...INITIAL, completed: [...INITIAL.completed], history: [...INITIAL.history] });
    setStage(0);
    setDial(38);
    setCipher("");
    setFeedback("");
    setShowHint(false);
    setShowGuide(false);
    setResetAsk(false);
    document.getElementById("mission-control")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const current = MISSIONS[stage];

  return (
    <div className="ro-game">
      <div className="rg-ambient" aria-hidden="true"/>
      <div className="rg-wrap">
        <header className="rg-nav">
          <Link href="/#lab" className="rg-back"><ArrowLeft size={16}/> BACK TO PORTFOLIO</Link>
          <div className="rg-brand">ROGER<span>.</span>OS <small> / AN INTERACTIVE EXPERIMENT</small></div>
          <div className="rg-live"><i/> SYSTEM ONLINE</div>
        </header>

        <section className="rg-hero">
          <div className="rg-hero-copy">
            <p className="rg-kicker"><span>EXPERIENCE 001</span> // AN UNFINISHED STORY</p>
            <h1>THE <em>UNFINISHED</em><br/>PROJECT<span className="rg-stop">.</span></h1>
            <p className="rg-intro">Een mysterieus digitaal archief is gecrasht. Vier missies, verborgen codes en een systeem met een discutabel gevoel voor humor. Jij bent de operator. Succes. Je krijgt geen IT-helpdesk.</p>
            <div className="rg-hero-actions">
              <a className="rg-primary" href="#mission-control">ENTER THE SYSTEM <ArrowRight size={17}/></a>
              <button className="rg-soft" onClick={() => setShowGuide(v => !v)} type="button"><CircleHelp size={16}/> {showGuide ? "SLUIT UITLEG" : "HOE WERKT HET?"}</button>
            </div>
          </div>
          <div className="rg-art" aria-label="Abstract archiefsymbool met concentrische ringen">
            <div className="rg-art-ring rg-ring-a"/><div className="rg-art-ring rg-ring-b"/><div className="rg-art-ring rg-ring-c"/>
            <span className="rg-art-core">R<span>·</span></span>
            <span className="rg-art-marker rg-art-mark-a">001 / LAB</span>
            <span className="rg-art-marker rg-art-mark-b">UNLOCK THE UNKNOWN</span>
            <span className="rg-art-spark">✳</span>
          </div>
        </section>

        {showGuide && <aside className="rg-guide">
          <strong>HOW TO PLAY</strong>
          <p>Speel vier opeenvolgende missies. Elke missie levert XP en informatie op voor de volgende. Je keuzes veranderen de uitkomst van het verhaal. Je voortgang wordt lokaal in je browser bewaard. Alle systemen en netwerkcommando's zijn simulaties.</p>
        </aside>}

        <section className="rg-console" id="mission-control" aria-label="Interactieve missies">
          <div className="rg-console-top">
            <div><Command size={16}/><span>MISSION CONTROL</span><span className="rg-console-divider">/</span><span className="rg-dim">GUEST ACCESS</span></div>
            <span className="rg-console-top-right"><i/> {game.ending ? endings[game.ending].status : "RECOVERY IN PROGRESS"}</span>
          </div>

          <div className="rg-stats">
            <div><small>PROTOCOLS RESTORED</small><strong>{String(game.completed.length).padStart(2, "0")}<span> / 04</span></strong></div>
            <div><small>EXPERIENCE POINTS</small><strong>{String(game.xp).padStart(3, "0")}<span> XP</span></strong></div>
            <div><small>SYSTEM INTEGRITY</small><strong>{progress}<span> %</span></strong></div>
            <div className="rg-progress-rail"><div style={{ width: progress + "%" }}/></div>
          </div>
          <div className="rg-collected" aria-label="Gevonden codefragmenten">
            <span className="rg-collected-heading"><KeyRound size={15}/> GEVONDEN FRAGMENTEN</span>
            <span className={"rg-collected-chip " + (isDone(0) ? "is-found" : "")}>{isDone(0) ? "73" : "??? · MISSIE 01"}</span>
            <span className={"rg-collected-chip " + (isDone(1) ? "is-found" : "")}>{isDone(1) ? "EMBER" : "??? · MISSIE 02"}</span>
            <span className="rg-collected-info">Je bewaart ze hier. Niets onthouden nodig.</span>
          </div>

          <div className="rg-game-grid">
            <aside className="rg-sidebar">
              <p className="rg-eyebrow">/ AVAILABLE OPERATIONS</p>
              {MISSIONS.map((mission, id) => (
                <button
                  className={"rg-mission " + (stage === id ? "rg-selected " : "") + (isDone(id) ? "rg-completed " : "")}
                  type="button" key={mission.number} disabled={!unlocked(id)} onClick={() => chooseStage(id)}
                >
                  <span className="rg-mission-id">{mission.number}</span>
                  <span className="rg-mission-text"><strong>{mission.name}</strong><small>{mission.kind}</small></span>
                  {isDone(id) ? <Check size={17}/> : unlocked(id) ? <ChevronRight size={18}/> : <LockKeyhole size={15}/>}
                </button>
              ))}
              <div className="rg-sidebar-note"><ShieldCheck size={17}/><span>No real systems are accessed. Just puzzles, pixels and poor decisions.</span></div>
              <button className="rg-reset-link" type="button" onClick={() => setResetAsk(true)}><RotateCcw size={14}/> NIEUWE RONDE STARTEN</button>
            </aside>

            <main className="rg-stage" aria-live="polite">
              <div className="rg-stage-head">
                <span>PROTOCOL {current.number} / 04</span>
                <span>{isDone(stage) ? "STATUS: COMPLETE" : "STATUS: " + (unlocked(stage) ? "ACTIVE" : "LOCKED")}</span>
              </div>
              <div className="rg-stage-title">
                <div><p>{current.kind}</p><h2>{current.name}<span>.</span></h2><p className="rg-stage-desc">{current.note}</p></div>
                <span className="rg-reward"><Zap size={15}/> +{current.reward} XP</span>
              </div>

              {stage === 0 && <div className="rg-puzzle">
                <div className="rg-calibration">
                  <div className="rg-cal-grid"/>
                  <span className="rg-cal-note">SIGNAL CALIBRATOR / V.07</span>
                  <div className="rg-cal-track"><div className="rg-target" style={{ left: "73%" }}><span>REFERENCE</span></div><div className="rg-moving" style={{ left: dial + "%" }}><Crosshair size={44} strokeWidth={1.2}/></div></div>
                  <span className="rg-cal-bottom">OFFSET: {dial.toString().padStart(2, "0")} / 100</span>
                </div>
                <div className="rg-puzzle-bottom">
                  <div><h3>Find the perfect alignment.</h3><p>Een designer heeft per ongeluk aan één pixel gezeten. Klassiek. Verschuif het symbool naar de gouden referentielijn en vergrendel je keuze.</p></div>
                  <label className="rg-slider-label" htmlFor="rg-dial"><span>HORIZONTAL OFFSET</span><strong>{dial}</strong></label>
                  <input id="rg-dial" type="range" min="0" max="100" value={dial} onChange={e => setDial(Number(e.target.value))} disabled={isDone(0)} aria-label="Verschuif het kalibratiesignaal"/>
                  {isDone(0) ? <div className="rg-success"><Check size={18}/> SIGNAL RESTORED · FRAGMENT 73 ACQUIRED</div> : <button className="rg-commit" type="button" onClick={calibrate}>LOCK COORDINATES <ArrowRight size={16}/></button>}
                </div>
              </div>}

              {stage === 1 && <div className="rg-puzzle">
                <div className="rg-network-visual">
                  <div className="rg-net-node"><Terminal size={25}/><strong>CLIENT</strong><small>192.168.30.47</small></div>
                  <div className="rg-net-link"><span/><span/><span/></div>
                  <div className="rg-net-node rg-net-gateway"><Network size={25}/><strong>GATEWAY</strong><small>192.168.30.1</small></div>
                  <div className="rg-net-link rg-net-problem"><span/><span/><span/></div>
                  <div className="rg-net-node rg-net-vault"><LockKeyhole size={25}/><strong>ARCHIVE</strong><small>vault.example</small></div>
                </div>
                <div className="rg-puzzle-bottom">
                  <h3>{game.networkPhase === 0 ? "The archive is unreachable." : game.networkPhase === 1 ? "Connected. But still ghosted." : game.networkPhase === 2 ? "DNS timed out. Find the culprit." : "Two servers. One secret."}</h3>
                  <p>{game.networkPhase === 0 ? "De netwerkkabel lijkt goed. Onderzoek eerst of een extern IP-adres bereikbaar is, voordat je zomaar iets uitzet." : game.networkPhase === 1 ? "Je bereikt een IP-adres, maar geen domeinnaam. Welke test kan onderzoeken waar de naamomzetting misgaat?" : game.networkPhase === 2 ? "De naamserver reageert niet. Herstel gericht wat stuk is; geen complete netwerkpaniek nodig." : "DNS is hersteld. Het archief gaf een aanwijzing: BAY 18. Twee IP-adressen zijn gevonden. Welk adres hoort bij de juiste bay?"}</p>
                  {isDone(1) ? <div className="rg-success"><Check size={18}/> RESOLVER REPAIRED · KEY FRAGMENT EMBER ACQUIRED</div> : <div className="rg-choices">
                    {(game.networkPhase === 0 ? [
                      { id: "restart", label: "Reboot everything", detail: "Een klassieker. Maar weet je al wat stuk is?" },
                      { id: "ping", label: "ping 1.1.1.1", detail: "Check eerst of een extern IP-adres reageert" },
                      { id: "firewall", label: "Disable firewall", detail: "Beveiliging blind uitschakelen" }
                    ] : game.networkPhase === 1 ? [
                      { id: "cable", label: "New ethernet cable", detail: "Altijd leuk om te bestellen" },
                      { id: "dns", label: "nslookup vault.example", detail: "Onderzoek de DNS-naamomzetting" },
                      { id: "restart", label: "Reinstall browser", detail: "Hopelijk werkte je bladwijzer nog" }
                    ] : game.networkPhase === 2 ? [
                      { id: "cable", label: "Replace network cable", detail: "De IP-verbinding werkte al" },
                      { id: "restart", label: "Reboot the whole city", detail: "Dramatisch, maar niet gericht" },
                      { id: "resolver", label: "Repair DNS resolver", detail: "Herstel de kapotte naamserverinstelling" }
                    ] : [
                      { id: "vault81", label: "10.20.0.81", detail: "Node: BAY 81" },
                      { id: "vault18", label: "10.20.0.18", detail: "Node: BAY 18" },
                      { id: "restart", label: "Unplug the server room", detail: "Dramatisch, maar absoluut niet nodig" }
                    ]).map(option => <button key={option.id} type="button" onClick={() => network(option.id)}><span><strong>{option.label}</strong><small>{option.detail}</small></span><ArrowRight size={16}/></button>)}
                  </div>}
                </div>
              </div>}

              {stage === 2 && <div className="rg-puzzle">
                <div className="rg-vault-visual">
                  <div className="rg-vault-grid"/>
                  <Fingerprint size={105} strokeWidth={0.65}/>
                  <span>SECURE ARCHIVE // ENCRYPTED</span>
                </div>
                <div className="rg-puzzle-bottom">
                  <h3>Two fragments. One password.</h3>
                  <p>De fragmenten die je écht hebt verdiend staan bovenaan. Combineer het woord uit missie 2 met het getal uit missie 1 en typ de code zelf in. Geen automatische ontgrendeling.</p>
                  {isDone(2) ? <div className="rg-success"><Check size={18}/> ACCESS GRANTED · VAULT OPEN</div> :
                    <form className="rg-cipher-form" onSubmit={decrypt}>
                      <label htmlFor="rg-cipher">ENTER ACCESS KEY</label>
                      <div><input id="rg-cipher" value={cipher} onChange={e => setCipher(e.target.value)} maxLength={20} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="•••••••" aria-label="Voer de toegangscode in"/><button className="rg-commit" type="submit">DECRYPT <KeyRound size={16}/></button></div>
                    </form>}
                </div>
              </div>}

              {stage === 3 && <div className="rg-puzzle">
                {game.ending ? <div className="rg-ending">
                  <Trophy size={42} strokeWidth={1.25}/><p>ENDING UNLOCKED / {game.ending.toUpperCase()}</p>
                  <h3>{endings[game.ending].name}<span>.</span></h3>
                  <p>{endings[game.ending].text}</p>
                  <div className="rg-ending-foot"><Check size={16}/> EXPERIENCE COMPLETE · {game.xp} XP</div>
                  <button type="button" className="rg-commit rg-play-again" onClick={startNewGame}><RotateCcw size={18}/> SPEEL OPNIEUW — VANAF MISSIE 1</button>
                  <span className="rg-replay-hint">Nieuwe ronde, zelfde regels. Andere afloop mogelijk. Geen bevestiging nodig.</span>
                </div> : <div className="rg-final">
                  <div className="rg-final-symbol"><Sparkles size={66} strokeWidth={1}/></div>
                  <h3>The system is yours now.</h3>
                  <p>Alles is hersteld. Maar wat doe je met het archief? Er is geen fout antwoord — alleen een ander einde.</p>
                  <div className="rg-ending-choices">
                    <button onClick={() => finish("archive")} type="button"><ShieldCheck size={20}/><span><strong>KEEP IT SECRET</strong><small>Verzegel het archief voor altijd.</small></span><ArrowRight size={16}/></button>
                    <button onClick={() => finish("broadcast")} type="button"><Network size={20}/><span><strong>RELEASE THE SIGNAL</strong><small>Maak alles openbaar.</small></span><ArrowRight size={16}/></button>
                    <button onClick={() => finish("chaos")} type="button"><Sparkles size={20}/><span><strong>PRESS THE RED BUTTON</strong><small>Wat kan er nou misgaan?</small></span><ArrowRight size={16}/></button>
                  </div>
                </div>}
              </div>}

              {isDone(stage) && stage < 3 && <div className="rg-reward-reveal" role="status">
                <div className="rg-reward-icon"><Trophy size={25}/></div>
                <div className="rg-reward-copy">
                  <span>MISSIE {current.number} VOLTOOID · +{current.reward} XP</span>
                  <h3>{stage === 0 ? "Fragment gevonden!" : stage === 1 ? "Geheim fragment ontgrendeld!" : "Kluis geopend!"}</h3>
                  {stage < 2 ? <>
                    <p>Dit is jouw verdiende codefragment. Het blijft ook bovenaan zichtbaar.</p>
                    <div className="rg-reward-secret">{stage === 0 ? "73" : "EMBER"}</div>
                  </> : <p>De kluis is open! Geen wachtwoordmanager nodig. Kies zelf het einde van deze nogal verdachte missie.</p>}
                </div>
                <button className="rg-commit rg-next-mission" type="button" onClick={() => chooseStage(stage + 1)}>VOLGENDE MISSIE <ArrowRight size={16}/></button>
              </div>}
              {feedback && !isDone(stage) && <div className="rg-feedback" role="status"><Zap size={16}/>{feedback}</div>}
              {!isDone(stage) && stage !== 3 && <div className="rg-stage-footer">
                <button type="button" onClick={() => setShowHint(v => !v)}><CircleHelp size={15}/> {showHint ? "HIDE HINT" : "NEED A HINT?"}</button>
                {showHint && <p>{stage === 0 ? "De stippellijn is de referentie; mik op de plek waar het bewegende symbool de lijn raakt." : stage === 1 ? game.networkPhase === 0 ? "Test eerst een IP-adres, niet een domeinnaam." : game.networkPhase === 1 ? "Een DNS-tool begint met ns..." : game.networkPhase === 2 ? "Je hebt DNS als probleem gevonden. Herstel de resolver." : "Het woord BAY betekent dat het bay-nummer overeenkomt met de laatste cijfers van het IP." : "Je gevonden fragmenten staan hierboven. Eerst het woord, daarna het getal. Je typt de code zelf."}</p>}
              </div>}
            </main>
          </div>
          <div className="rg-log">
            <div className="rg-log-heading"><Terminal size={15}/> <span>SYSTEM LOG / ACTIVITY FEED</span><span>READ ONLY</span></div>
            <div className="rg-log-lines">{game.history.slice(-5).map((entry, id) => <p key={id}><span>↳</span> {entry}</p>)}</div>
          </div>
        </section>

        <section className="rg-after">
          <div><span>NOT EVERYTHING NEEDS A PURPOSE.</span><h2>Some things just need<br/><em>to be explored.</em></h2></div>
          <p>Dit is een klein digitaal spel binnen een portfolio. Gebouwd om nieuwsgierigheid te belonen. Geen accounts, geen tracking, geen echte netwerkacties. Gewoon spelen.</p>
        </section>
        <footer className="rg-footer"><span>ROGER CHIN A FOENG © {new Date().getFullYear()}</span><span>DESIGNED FOR THE CURIOUS. BUILT FOR THE BORED.</span><Link href="/">BACK TO REALITY <ArrowLeft size={14}/></Link></footer>
      </div>
      {resetAsk && <div className="rg-modal-backdrop" role="presentation" onClick={() => setResetAsk(false)}><div className="rg-modal" role="dialog" aria-modal="true" aria-labelledby="rg-reset-title" onClick={e => e.stopPropagation()}><h2 id="rg-reset-title">Start from zero?</h2><p>Je begint opnieuw bij missie 1. Je vorige XP, fragmenten en einde worden gereset. Klaar om het systeem nóg een keer te redden?</p><div><button className="rg-soft" type="button" onClick={() => setResetAsk(false)}>CANCEL</button><button className="rg-commit" type="button" onClick={startNewGame}>JA, START OPNIEUW <RotateCcw size={15}/></button></div></div></div>}
    </div>
  );
}
