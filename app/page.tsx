"use client";

import { useEffect, useState } from "react";
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
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); if (entry.target.id) setActive(entry.target.id); }
    }), { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    document.querySelectorAll(".reveal, section[id]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => { document.body.classList.toggle("menu-open", menuOpen); return () => document.body.classList.remove("menu-open"); }, [menuOpen]);
  const links = [["Over mij", "#about"], ["Playground", "#lab"], ["Expertise", "#expertise"], ["Projecten", "#work"], ["Connect", "#connect"]];
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
            <h1>I design it.<br/>I <em>build</em> it.<br/>I break it<span className="accent-period">.</span></h1>
            <p className="hero-summary">Hey, ik ben <strong>Roger Orlando</strong>. Ooit grafisch designer, nu IT’er. Ik maak dingen die er geweldig uitzien én technisch kloppen. Meestal.</p>
            <div className="hero-buttons">
              <a className="button button-primary" href="#work">Ontdek mijn projecten <ArrowUpRight size={17}/></a>
              <a className="button button-quiet" href="#about">Meer over mij <ArrowDown size={16}/></a>
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

      <section className="section about-section" id="about">
        <div className="container about-grid">
          <Reveal className="about-heading">
            <div className="eyebrow"><span>01 /</span> GET TO KNOW ME</div>
            <h2>Design meets code.<br/><em>Chaos meets logic.</em></h2>
            <div className="signature">R<span>.</span></div>
          </Reveal>
          <Reveal className="about-copy" delay={100}>
            <div className="about-overline"><span className="crosshair">✳</span> THE PERSON BEHIND THE PROJECTS</div>
            <p className="about-lead">Mijn naam is <strong>Roger Chjin A Foeng</strong>, maar online gebruik ik graag <strong>Roger Orlando</strong>.</p>
            <p>Mijn carrière begon in grafisch design. Daardoor zie ik meteen als iets drie pixels scheef staat. Nu verdiep ik me in systemen, netwerken, websites en apps — en alles achter de interface.</p>
            <p>Die combinatie is mijn favoriete speelveld: iets moet mooi ontworpen zijn, maar achter de schermen ook logisch, snel en degelijk werken. En ja, af en toe mag er best een grap in.</p>
            <div className="about-points"><span><Check size={15}/> Design-achtergrond</span><span><Check size={15}/> Engineering mindset</span><span><Check size={15}/> Altijd aan het leren</span></div>
          </Reveal>
        </div>
      </section>

      <section className="section lab-section" id="lab">
        <div className="container">
          <Reveal className="lab-heading">
            <div className="eyebrow"><span>02 /</span> THE CREATIVE LAB</div>
            <h2>Two sides.<br/><em>One brain.</em></h2>
            <p>Ik begon met pixels en eindigde bij subnetmaskers. Klik maar. Dit is geen saaie cv-site.</p>
          </Reveal>
          <Reveal className="lab-panel" delay={90}>
            <div className="lab-panel-header"><span><TerminalSquare size={17}/> ROGER_OS // PERSONALITY ENGINE</span><span>v1.0 · MOSTLY STABLE</span></div>
            <div className="lab-tabs" role="tablist" aria-label="Kies een modus">
              <button role="tab" aria-selected={mode==="design"} className={mode==="design"?"selected":""} onClick={()=>setMode("design")}><Palette size={17}/> DESIGNER</button>
              <button role="tab" aria-selected={mode==="engineer"} className={mode==="engineer"?"selected":""} onClick={()=>setMode("engineer")}><Cpu size={17}/> ENGINEER</button>
              <button role="tab" aria-selected={mode==="chaos"} className={mode==="chaos"?"selected":""} onClick={()=>setMode("chaos")}><Sparkles size={17}/> CHAOS</button>
            </div>
            <div className="lab-content" role="tabpanel" aria-live="polite">
              <div className={`lab-visual lab-${mode}`}>
                <div className="lab-visual-grid"/>
                <span className="lab-orb lab-orb-one"/><span className="lab-orb lab-orb-two"/>
                <span className="lab-big">{mode==="design"?"Aa.":mode==="engineer"?"</>":":)"}</span>
                <span className="lab-visual-label">{mode==="design"?"KERNING IS A LOVE LANGUAGE":mode==="engineer"?"200 OK · PROBABLY":"IT WORKS ON MY MACHINE™"}</span>
              </div>
              <div className="lab-copy">
                <span className="lab-kicker">{mode==="design"?"01 / THE CREATIVE":mode==="engineer"?"02 / THE TECHNICAL":"03 / THE PERSONAL"}</span>
                <h3>{mode==="design"?"Make it beautiful.":mode==="engineer"?"Make it work.":"Make it fun."}</h3>
                <p>{mode==="design"?"Een grafische achtergrond laat sporen na: ik hou van typografie, detail, balans en een ontwerp dat precies goed aanvoelt.":mode==="engineer"?"Onder de motorkap moet het ook kloppen. Netwerken, infrastructuur, code en snelheid zijn minstens zo interessant.":"Ik vind het leuk wanneer technologie een beetje karakter heeft. Mijn werk neem ik serieus, mezelf wat minder."}</p>
                <div className="lab-data"><span>STATUS</span><strong>{mode==="design"?"PIXEL OBSESSED":mode==="engineer"?"SYSTEMS ONLINE":"CHAOS CONTROLLED"}</strong></div>
                <button className="terminal-toggle" type="button" aria-expanded={terminal} onClick={()=>setTerminal(!terminal)}><TerminalSquare size={16}/>{terminal?"Close terminal":"Open secret terminal"} <ArrowUpRight size={15}/></button>
              </div>
            </div>
            {terminal&&<div className="secret-terminal" aria-label="Humoristische terminal"><p><span>roger@orlando</span>:~$ whoami</p><p>Graphic designer turned IT guy. Professional pixel counter.</p><p><span>roger@orlando</span>:~$ sudo make-it-perfect</p><p className="terminal-error">Error 418: I'm a teapot. But a well-designed one.</p><p><span>roger@orlando</span>:~$ <span className="terminal-cursor">▋</span></p></div>}
          </Reveal>
        </div>
      </section>

      <section className="section expertise-section" id="expertise">
        <div className="container">
          <Reveal className="section-head"><div><div className="eyebrow"><span>03 /</span> WHAT I DO</div><h2>Where technology<br/>meets <em>curiosity.</em></h2></div><p>Een voormalig grafisch designer met een engineer-brein. De ene dag pixels, de andere dag packets.</p></Reveal>
          <div className="expertise-grid">{expertise.map((item,i) => <Reveal className="expertise-card" key={item.number} delay={i*70}><div className="expertise-top"><span>{item.number} / 04</span><item.icon size={27} strokeWidth={1.35}/></div><h3>{item.name}</h3><p>{item.description}</p><span className="card-line"/></Reveal>)}</div>
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="container">
          <Reveal className="section-head work-heading"><div><div className="eyebrow"><span>04 /</span> SELECTED PROJECTS</div><h2>Things I've<br/><em>worked on.</em></h2></div><p>Een selectie van persoonlijke projecten, ideeën en websites — van eerste concept tot werkend product.</p></Reveal>
          <div className="project-grid">
            {projects.map((p,i) => <Reveal className={`project-card ${p.className}`} key={p.id} delay={(i%2)*100}>
              <div className="project-art">
                <div className="project-art-grid"/>
                <div className="project-art-glow"/>
                <span className="project-art-number">{p.id} / 04</span>
                <div className="project-symbol">{p.monogram}</div>
                <span className="project-art-note">{p.note}</span>
              </div>
              <div className="project-body">
                <div className="project-meta">{p.type}</div>
                <div className="project-title-row"><h3>{p.name}</h3>{p.href ? <a aria-label={`Bekijk website van ${p.name}`} href={p.href} target="_blank" rel="noreferrer" className="project-arrow"><ArrowUpRight size={22}/></a> : <span className="project-arrow decorative"><ArrowUpRight size={22}/></span>}</div>
                <p>{p.description}</p><div className="project-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
              </div>
            </Reveal>)}
          </div>
          <Reveal className="work-footer"><div className="work-footer-mark">✳</div><p>Always building. Always learning.<br/><span>En er is nog veel meer onderweg.</span></p><a href="https://github.com/ItsYaBoyKing030" target="_blank" rel="noreferrer">Meer op GitHub <ArrowUpRight size={17}/></a></Reveal>
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
          <Reveal><div className="eyebrow light"><span>06 /</span> STAY CONNECTED</div><h2>Let's build<br/>something <em>great.</em></h2><p>Bekijk mijn werk, volg nieuwe projecten of ontdek waar ik mee bezig ben.</p></Reveal>
          <Reveal className="connect-links" delay={100}><a href="https://github.com/ItsYaBoyKing030" target="_blank" rel="noreferrer"><Github size={23}/><span>GitHub<small>CODE & PROJECTS</small></span><ArrowUpRight size={22}/></a><a href="https://www.loschdental.nl" target="_blank" rel="noreferrer"><Globe2 size={23}/><span>Losch Dental<small>RECENT WEBSITE PROJECT</small></span><ArrowUpRight size={22}/></a></Reveal>
        </div>
        <div className="connect-watermark" aria-hidden="true">ORLANDO</div>
      </section>
    </main>

    <footer className="footer"><div className="container footer-main"><Brand/><p>Design brain. Engineer hands.<br/>Made with intention.</p><a href="#home" className="back-to-top">BACK TO TOP <ArrowUpRight size={16}/></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} ROGER ORLANDO — ROGER CHJIN A FOENG</span><span>DESIGNED & BUILT WITH CARE <span className="footer-star">✳</span></span></div></footer>
  </div>;
}
