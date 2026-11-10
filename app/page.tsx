"use client";

import { useEffect, useState } from "react";
import PlaygroundTerminal from "./components/PlaygroundTerminal";
import PortfolioCaseStudies from "./components/PortfolioCaseStudies";
import { ArrowDown, ArrowRight, ArrowUpRight, Braces, Check, ChevronDown, Code2, Cpu, ExternalLink, Github, Globe2, Layers3, Menu, MonitorSmartphone, Network, ShieldCheck, Sparkles, TerminalSquare, Palette, X } from "lucide-react";

const projects = [
  { id: "01", name: "CityFi", type: "WEB3 · CONCEPT & PRODUCT", description: "Een digitale wereld waarin steden unieke verzamelobjecten worden. Een eigen concept op het snijvlak van technologie, community en interactief design.", tags: ["Web3", "Next.js", "Product design"], icon: Globe2, className: "cityfi", monogram: "C/", note: "IN ONTWIKKELING" },
  { id: "02", name: "10.00", type: "MOBILE APP · GAME DESIGN", description: "Een minimalistische timinggame met een verrassend simpel doel: stop de klok precies op tien seconden. Met challenges, records en een eigen visuele identiteit.", tags: ["React Native", "iOS", "Game design"], icon: MonitorSmartphone, className: "ten", monogram: "10.00", note: "APP PROJECT" },
  { id: "03", name: "BreakUrge", type: "MOBILE APP · WELLBEING", description: "Een persoonlijke voortgangsapp voor het doorbreken van gewoontes. Gericht op motivatie, inzicht en heldere, bruikbare interfaces.", tags: ["Expo", "React Native", "UX/UI"], icon: Sparkles, className: "breakurge", monogram: "B.", note: "APP PROJECT" },
  { id: "04", name: "Losch Dental", type: "WEBSITE · DESIGN & DEVELOPMENT", description: "Een elegante, informatieve website voor endodontologische zorg met een rustige uitstraling, verfijnde typografie en een consistente merkbeleving.", tags: ["Next.js", "Webdesign", "Vercel"], icon: Layers3, className: "dental", monogram: "LD", note: "WEBSITE", href: "https://www.loschdental.nl" },
];

const expertise = [
  { number: "01", name: "Systems & infrastructure", description: "Netwerken, serveromgevingen en de techniek achter betrouwbare digitale systemen.", icon: Network },
  { number: "02", name: "Web development", description: "Van concept en interface tot moderne, snelle websites die goed werken op ieder scherm.", icon: Code2 },
  { number: "03", name: "Apps & digital products", description: "Ideeën vertalen naar mobiele ervaringen, prototypes en producten met oog voor detail.", icon: MonitorSmartphone },
  { number: "04", name: "Visual design", description: "Typografie, merkidentiteit, compositie en de creatieve blik van een voormalig grafisch designer.", icon: Palette },
];

function Brand() {
  return <a href="#home" className="brand" aria-label="Roger Orlando — naar boven"><span className="brand-word">ROGER<span className="brand-dot">.</span></span><span className="brand-caption">ORLANDO / PERSONAL PORTFOLIO</span></a>;
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <div className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [mode, setMode] = useState<"design"|"engineer"|"chaos">("design");
  const [terminal, setTerminal] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [diagnostics, setDiagnostics] = useState(false);
  const [chaosIndex, setChaosIndex] = useState(0);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); if (entry.target.id) setActive(entry.target.id); }
    }), { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    document.querySelectorAll(".reveal, section[id]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => { document.body.classList.toggle("menu-open", menuOpen); return () => document.body.classList.remove("menu-open"); }, [menuOpen]);
  const links = [["Projecten", "#work"], ["Expertise", "#expertise"], ["Playground", "#lab"], ["Over mij", "#about"], ["Connect", "#connect"]];
  return <div className="site">
    <div className="noise" aria-hidden="true" />
    <header className="header">
      <div className="container nav-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          {links.map(([label, href]) => <a className={active === href.slice(1) ? "active" : ""} key={href} href={href}>{label}</a>)}
        </nav>
        <a className="nav-action" href="#connect">LET'S CONNECT <ArrowUpRight size={15}/></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Sluit menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>
      </div>
      <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label="Mobiele navigatie">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={19}/></a>)}</nav>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-halo halo-one" aria-hidden="true" /><div className="hero-halo halo-two" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-left">
            <div className="hero-eyebrow"><span className="availability-dot"/> FORMER GRAPHIC DESIGNER × CURRENT IT NERD <span className="tiny-star">✳</span> NETHERLANDS</div>
            <h1>Looks good.<br/><em>Works better.</em><br/>Never boring<span className="accent-period">.</span></h1>
            <p className="hero-summary">Ik ben <strong>Roger Chin A Foeng</strong> — ooit grafisch designer, nu thuis in IT, web en apps. Ik bouw digitale dingen die slim werken, sterk ogen en soms een beetje teruggrappen.</p>
            <div className="hero-buttons">
              <a className="button button-primary" href="#work">Ontdek mijn projecten <ArrowUpRight size={17}/></a>
              <a className="button button-quiet" href="#lab">Ontdek de Playground <ArrowDown size={16}/></a>
            </div>
          </div>
          <div className="hero-art" aria-label="Abstracte technische illustratie met het monogram R">
            <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-orbit orbit-three"/>
            <span className="art-cross top-left">+</span><span className="art-cross bottom-right">+</span>
            <div className="art-monogram">R<span>.</span></div>
            <span className="art-coordinate coord-top">51° 55′ N / 4° 29′ E</span>
            <span className="art-coordinate coord-bottom">PIXELS × PACKETS</span>
            <div className="art-status"><span className="art-status-dot"/> ALWAYS EXPLORING</div>
          </div>
        </div>
        <div className="container hero-bottom">
          <div className="scroll-cue"><span className="scroll-line"/>SCROLL TO EXPLORE</div>
          <div className="hero-index">PORTFOLIO / 2026 <span>—</span> 001</div>
        </div>
      </section>

      <div className="ticker" aria-label="Interessegebieden"><div className="ticker-track">{Array.from({length: 2}).map((_,i) => <span key={i}>DESIGNER BRAIN <b>✳</b> ENGINEER HANDS <b>✳</b> PIXEL PERFECT(ISH) <b>✳</b> CREATIVE TECHNOLOGY <b>✳</b> DEBUGGING FOREVER <b>✳</b> </span>)}</div></div>









      <section className="section work-section" id="work">
        <div className="container">
          <Reveal className="section-head work-heading"><div><div className="eyebrow"><span>01 /</span> SELECTED WORK</div><h2>Proof over<br/><em>promises.</em></h2></div><p>Van websites tot appconcepten. Vier projecten, vier verschillende uitdagingen en een eigen verhaal achter elk ontwerp.</p></Reveal>
          <PortfolioCaseStudies />
          <Reveal className="work-footer"><div className="work-footer-mark">✳</div><p>Always building. Always learning.<br/><span>En er is nog veel meer onderweg.</span></p><a href="https://github.com/RogerCAF" target="_blank" rel="noreferrer">Meer op GitHub <ArrowUpRight size={17}/></a></Reveal>
        </div>
      </section>

      <section className="section expertise-section" id="expertise">
        <div className="container">
          <Reveal className="section-head"><div><div className="eyebrow"><span>02 /</span> WHAT I DO</div><h2>Where technology<br/>meets <em>curiosity.</em></h2></div><p>Een voormalig grafisch designer met een engineer-brein. De ene dag pixels, de andere dag packets.</p></Reveal>
          <div className="expertise-grid">{expertise.map((item,i) => <Reveal className="expertise-card" key={item.number} delay={i*70}><div className="expertise-top"><span>{item.number} / 04</span><item.icon size={27} strokeWidth={1.35}/></div><h3>{item.name}</h3><p>{item.description}</p><span className="card-line"/></Reveal>)}</div>
        </div>
      </section>

      <section className="section lab-section" id="lab">
        <div className="container">
          <Reveal className="lab-heading">
            <div className="eyebrow"><span>03 /</span> BEYOND THE BRIEF</div>
            <h2>Not everything<br/><em>needs a brief.</em></h2>
            <p>Werk staat voorop. Maar hier mag je spelen: een Playground en een klein spel dat zich verstopt in dit portfolio.</p>
          </Reveal>
          <Reveal className="lab-panel" delay={90}>
            <div className="lab-panel-header"><span><TerminalSquare size={17}/> ROGER_OS / INTERACTIVE PLAYGROUND</span><span>EXPERIMENTAL · STABLE-ISH</span></div>
            <div className="lab-tabs" role="tablist" aria-label="Kies een creatieve modus">
              <button id="lab-tab-design" type="button" role="tab" aria-controls="lab-mode-panel" aria-selected={mode==="design"} className={mode==="design"?"selected":""} onClick={()=>setMode("design")}><Palette size={17}/> <span>01</span> DESIGNER</button>
              <button id="lab-tab-engineer" type="button" role="tab" aria-controls="lab-mode-panel" aria-selected={mode==="engineer"} className={mode==="engineer"?"selected":""} onClick={()=>setMode("engineer")}><Cpu size={17}/> <span>02</span> ENGINEER</button>
              <button id="lab-tab-chaos" type="button" role="tab" aria-controls="lab-mode-panel" aria-selected={mode==="chaos"} className={mode==="chaos"?"selected":""} onClick={()=>setMode("chaos")}><Sparkles size={17}/> <span>03</span> CHAOS</button>
            </div>
            <div className="lab-content" id="lab-mode-panel" role="tabpanel" aria-labelledby={`lab-tab-${mode}`}>
              <div className={`lab-visual lab-${mode}`}>
                {mode==="design" && <div className={`design-stage palette-${paletteIndex}`}>
                  <div className="design-stage-top"><span>FIG. 01 — THE ART OF BEING PICKY</span><span>100% ZOOM</span></div>
                  <div className="design-composition">
                    <span className="design-outline">a</span><div className="design-type">Aa<span>.</span></div>
                    <span className="design-circle circle-one"/><span className="design-circle circle-two"/>
                    <span className="design-cross">✳</span><span className="design-rule"/>
                  </div>
                  <div className="design-stage-bottom"><span>TYPE / FORM / FEELING</span><span>GRID: ON · TASTE: SUBJECTIVE</span></div>
                </div>}
                {mode==="engineer" && <div className="engineer-stage">
                  <div className="engineer-top"><span className="engineer-led"/> roger@portfolio:~ <span>bash — 80×24</span></div>
                  <div className="engineer-code"><p><b>$</b> npm run make-it-awesome</p><p className="engineer-muted">› Compiling pixels and packets...</p><p><span className="engineer-check">✓</span> Design system loaded</p><p><span className="engineer-check">✓</span> Coffee dependency resolved</p><p><span className="engineer-check">✓</span> Sense of humor initialized</p>{diagnostics?<><p><span className="engineer-check">✓</span> Latency: looking good</p><p><span className="engineer-check">✓</span> Vibes: immaculate</p><p><span className="engineer-warn">!</span> Warning: designer spotted 1px offset</p></>:<p className="engineer-muted">› Awaiting diagnostics...</p>}<p className="engineer-prompt"><b>$</b> <span className="engineer-cursor">▌</span></p></div>
                  <div className="engineer-bars" aria-hidden="true">{[32,63,45,87,59,76,49,95,66,84,52,70,91,58,80].map((h,i)=><span key={i} style={{height:`${h}%`}}/>)}</div>
                </div>}
                {mode==="chaos" && <div className={`chaos-stage chaos-style-${chaosIndex%4}`}>
                  <div className="chaos-sticker sticker-one">CTRL + Z</div><div className="chaos-sticker sticker-two">GOOD<br/>IDEAS?</div><div className="chaos-sticker sticker-three">✳</div>
                  <div className="chaos-scribble scribble-one"/><div className="chaos-scribble scribble-two"/>
                  <div className="chaos-center" key={chaosIndex}><div className="chaos-face">{["☺","☻","✳","?!","⌘","★"][chaosIndex%6]}</div><span>{["IT WORKS ON MY MACHINE","JUST ONE MORE PIXEL","PROFESSIONALLY UNSERIOUS","HAVE YOU TRIED RESTARTING?","THIS WAS APPROVED BY NOBODY","DESIGN SYSTEM: MILDLY CONCERNED"][chaosIndex%6]}</span></div>
                  <span className="chaos-footer">CONTROLLED CHAOS™ / VOL. {String(chaosIndex+1).padStart(2,"0")}</span>
                </div>}
              </div>
              <div className="lab-copy" key={mode}>
                <span className="lab-kicker">{mode==="design"?"01 / THE AESTHETIC":mode==="engineer"?"02 / THE LOGIC":"03 / THE WILDCARD"}</span>
                <h3>{mode==="design"?"Obsessed with details.":mode==="engineer"?"It’s not magic. It’s debugging.":"A little weird is good."}</h3>
                <p>{mode==="design"?"Ik ben ooit begonnen als grafisch designer. Kleuren, vormen en die ene pixel die nét verkeerd staat? Ik zie hem. Altijd.":mode==="engineer"?"Ik hou van begrijpen hoe systemen werken. Netwerken, code en performance. Klik op de knop en laat de onzin-diagnose draaien.":"Serieuze vaardigheden. Niet altijd een serieuze presentatie. Soms moet je gewoon op een knop drukken en kijken wat er gebeurt."}</p>
                {mode==="design"&&<div className="lab-action-area"><div className="lab-action-label">KIES EEN VISUELE SMAAK</div><div className="palette-options">{["Noir & Gold","Electric","Rose"].map((label,i)=><button key={label} type="button" className={`palette-swatch swatch-${i} ${paletteIndex===i?"active":""}`} aria-pressed={paletteIndex===i} onClick={()=>setPaletteIndex(i)} title={label}><span className="sr-only">{label}</span></button>)}</div><span className="lab-choice-name">{["NOIR / GOLD","ELECTRIC / COBALT","ROSE / INK"][paletteIndex]}</span></div>}
                {mode==="engineer"&&<button type="button" className="lab-play-button" onClick={()=>setDiagnostics(v=>!v)}><TerminalSquare size={16}/>{diagnostics?"RESET DIAGNOSTICS":"RUN DIAGNOSTICS"} <ArrowUpRight size={16}/></button>}
                {mode==="chaos"&&<button type="button" className="lab-play-button chaos-play" onClick={()=>setChaosIndex(i=>i+1)}><Sparkles size={16}/> MAKE IT WEIRDER <ArrowUpRight size={16}/></button>}
                <div className="lab-data"><span>PERSONALITY STATUS</span><strong>{mode==="design"?"AESTHETICALLY OBSESSED":mode==="engineer"?"SYSTEMS ONLINE":"CHAOS, BUT MAKE IT DESIGN"}</strong></div>
                <button className="terminal-toggle" type="button" aria-expanded={terminal} onClick={()=>setTerminal(!terminal)}><TerminalSquare size={16}/>{terminal?"Close secret terminal":"Open secret terminal"} <ArrowUpRight size={15}/></button>
              </div>
            </div>
            {terminal&&<PlaygroundTerminal onClose={() => setTerminal(false)} />}
          </Reveal>

          <Reveal className="lab-quest-invite" delay={160}>
            <div className="lab-quest-copy">
              <div className="lab-quest-tag"><span className="lab-quest-dot"/> NEW EXPERIENCE / ACTUALLY PLAYABLE</div>
              <div className="lab-quest-index">ROGER_OS · EXPERIMENT NO. 001</div>
              <h3>Some projects are<br/><em>meant to be played.</em></h3>
              <p>Vier missies. Verborgen fragmenten. Een systeem dat niet helemaal doet wat het moet doen. Een klein spel verstopt in dit portfolio — omdat waarom niet?</p>
              <a className="lab-quest-cta" href="/play">ENTER THE UNFINISHED PROJECT <ArrowUpRight size={18}/></a>
              <div className="lab-quest-footnote">NO DOWNLOAD. NO ACCOUNT. JUST CURIOSITY.</div>
            </div>
            <div className="lab-quest-preview" aria-hidden="true">
              <div className="lab-quest-window"><span>✳ ROGER_OS / ARCHIVE</span><span>01 — 04</span></div>
              <div className="lab-quest-orbit"><span className="lab-quest-r">R.</span><span className="lab-quest-small">SYSTEM STATUS / UNKNOWN</span></div>
              <div className="lab-quest-steps"><span>01 PIXEL PROTOCOL</span><span>02 GHOST NETWORK</span><span>03 THE CIPHER</span><span>04 FINAL PROTOCOL</span></div>
              <div className="lab-quest-meter"><span/></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="container about-grid">
          <Reveal className="about-heading">
            <div className="eyebrow"><span>04 /</span> ABOUT, BRIEFLY</div>
            <h2>Short story.<br/><em>Big curiosity.</em></h2>
            <div className="signature">R<span>.</span></div>
          </Reveal>
          <Reveal className="about-copy" delay={100}>
            <div className="about-overline"><span className="crosshair">✳</span> THE PERSON BEHIND THE PROJECTS</div>
            <p className="about-lead"><strong>Roger Chin A Foeng.</strong> Designer roots. Engineer mindset.</p>
            <p>Van grafisch design naar IT: ik combineer visuele ideeën met techniek, zodat dingen niet alleen mooi zijn, maar ook goed werken.</p>
            <p>Mijn zwakte? Die ene pixel die nét niet goed staat. Mijn oplossing? Nog een kop koffie en opnieuw proberen.</p>
            <div className="about-points"><span><Check size={15}/> Design-achtergrond</span><span><Check size={15}/> Engineering mindset</span><span><Check size={15}/> Altijd aan het leren</span></div>
          </Reveal>
        </div>
      </section>

      <section className="section philosophy-section" aria-label="Mijn aanpak">
        <div className="container philosophy-grid">
          <Reveal><div className="eyebrow"><span>05 /</span> THE MINDSET</div><h2>Think boldly.<br/><em>Build thoughtfully.</em></h2></Reveal>
          <Reveal delay={100}><div className="philosophy-statement">"De beste ideeën beginnen met nieuwsgierigheid — en worden pas echt interessant wanneer je ze gaat bouwen."</div><p>Voor mij gaat technologie niet alleen over tools of code. Het gaat om ontdekken, verbeteren en iets neerzetten waar je trots op kunt zijn.</p><div className="philosophy-decoration"><span>CREATE</span><span>·</span><span>LEARN</span><span>·</span><span>REPEAT</span></div></Reveal>
        </div>
      </section>

      <section className="connect-section" id="connect">
        <div className="container connect-inner">
          <Reveal><div className="eyebrow light"><span>06 /</span> STAY CONNECTED</div><h2>Let's build<br/>something <em>great.</em></h2><p>Een goed idee, een vraag of nieuwsgierig naar de techniek? Bekijk mijn projecten en code op GitHub.</p></Reveal>
          <Reveal className="connect-links" delay={100}><a href="https://github.com/RogerCAF" target="_blank" rel="noreferrer"><Github size={23}/><span>GitHub<small>CODE & PROJECTS</small></span><ArrowUpRight size={22}/></a><a href="https://www.loschdental.nl" target="_blank" rel="noreferrer"><Globe2 size={23}/><span>Losch Dental<small>RECENT WEBSITE PROJECT</small></span><ArrowUpRight size={22}/></a></Reveal>
        </div>
        <div className="connect-watermark" aria-hidden="true">ORLANDO</div>
      </section>
    </main>

    <footer className="footer"><div className="container footer-main"><Brand/><p>Design brain. Engineer hands.<br/>Made with intention.</p><a href="#home" className="back-to-top">BACK TO TOP <ArrowUpRight size={16}/></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} ROGER ORLANDO — ROGER CHIN A FOENG</span><span>DESIGNED & BUILT WITH CARE <span className="footer-star">✳</span></span></div></footer>
  </div>;
}
