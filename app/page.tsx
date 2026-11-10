"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Braces, Check, ChevronDown, Code2, Cpu, ExternalLink, Github, Globe2, Layers3, Menu, MonitorSmartphone, Network, ShieldCheck, Sparkles, TerminalSquare, X } from "lucide-react";

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
  { number: "04", name: "Problem solving", description: "Nieuwsgierig blijven, systemen doorgronden en uitdagingen pragmatisch oplossen.", icon: Cpu },
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
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); if (entry.target.id) setActive(entry.target.id); }
    }), { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    document.querySelectorAll(".reveal, section[id]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => { document.body.classList.toggle("menu-open", menuOpen); return () => document.body.classList.remove("menu-open"); }, [menuOpen]);
  const links = [["Over mij", "#about"], ["Expertise", "#expertise"], ["Projecten", "#work"], ["Connect", "#connect"]];
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
            <div className="hero-eyebrow"><span className="availability-dot"/> SYSTEM ENGINEER & DIGITAL CREATOR <span className="tiny-star">✳</span> NETHERLANDS</div>
            <h1>Crafting the <em>digital</em><br/>world, one idea<br/>at a time<span className="accent-period">.</span></h1>
            <p className="hero-summary">Hey, ik ben <strong>Roger Orlando</strong>. Ik combineer techniek, creativiteit en nieuwsgierigheid om ideeën om te zetten in digitale ervaringen.</p>
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
            <span className="art-coordinate coord-bottom">DESIGN × DEVELOPMENT</span>
            <div className="art-status"><span className="art-status-dot"/> ALWAYS EXPLORING</div>
          </div>
        </div>
        <div className="container hero-bottom">
          <div className="scroll-cue"><span className="scroll-line"/>SCROLL TO EXPLORE</div>
          <div className="hero-index">PORTFOLIO / 2026 <span>—</span> 001</div>
        </div>
      </section>

      <div className="ticker" aria-label="Interessegebieden"><div className="ticker-track">{Array.from({length: 2}).map((_,i) => <span key={i}>SYSTEM ENGINEERING <b>✳</b> WEB DEVELOPMENT <b>✳</b> DIGITAL DESIGN <b>✳</b> MOBILE APPS <b>✳</b> CREATIVE TECHNOLOGY <b>✳</b> </span>)}</div></div>

      <section className="section about-section" id="about">
        <div className="container about-grid">
          <Reveal className="about-heading">
            <div className="eyebrow"><span>01 /</span> GET TO KNOW ME</div>
            <h2>More than code.<br/><em>Always curious.</em></h2>
            <div className="signature">R<span>.</span></div>
          </Reveal>
          <Reveal className="about-copy" delay={100}>
            <div className="about-overline"><span className="crosshair">✳</span> THE PERSON BEHIND THE PROJECTS</div>
            <p className="about-lead">Mijn naam is <strong>Roger Chjin A Foeng</strong>, maar online gebruik ik graag <strong>Roger Orlando</strong>.</p>
            <p>Ik houd ervan om te ontdekken hoe technologie werkt — en vooral wat je ermee kunt maken. Van IT-infrastructuur en netwerken tot websites, apps en eigen digitale concepten.</p>
            <p>Met een achtergrond in system engineering kijk ik niet alleen naar hoe iets eruitziet, maar ook naar hoe het werkt. Ik leer graag nieuwe technieken en bouw met aandacht voor zowel de details als het grotere geheel.</p>
            <div className="about-points"><span><Check size={15}/> Technisch ingesteld</span><span><Check size={15}/> Creatief in oplossingen</span><span><Check size={15}/> Altijd aan het leren</span></div>
          </Reveal>
        </div>
      </section>

      <section className="section expertise-section" id="expertise">
        <div className="container">
          <Reveal className="section-head"><div><div className="eyebrow"><span>02 /</span> WHAT I DO</div><h2>Where technology<br/>meets <em>curiosity.</em></h2></div><p>Een combinatie van technische kennis, creatief denken en de wil om steeds iets nieuws te bouwen.</p></Reveal>
          <div className="expertise-grid">{expertise.map((item,i) => <Reveal className="expertise-card" key={item.number} delay={i*70}><div className="expertise-top"><span>{item.number} / 04</span><item.icon size={27} strokeWidth={1.35}/></div><h3>{item.name}</h3><p>{item.description}</p><span className="card-line"/></Reveal>)}</div>
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="container">
          <Reveal className="section-head work-heading"><div><div className="eyebrow"><span>03 /</span> SELECTED PROJECTS</div><h2>Things I've<br/><em>worked on.</em></h2></div><p>Een selectie van persoonlijke projecten, ideeën en websites — van eerste concept tot werkend product.</p></Reveal>
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
          <Reveal><div className="eyebrow"><span>04 /</span> THE MINDSET</div><h2>Think boldly.<br/><em>Build thoughtfully.</em></h2></Reveal>
          <Reveal delay={100}><div className="philosophy-statement">"De beste ideeën beginnen met nieuwsgierigheid — en worden pas echt interessant wanneer je ze gaat bouwen."</div><p>Voor mij gaat technologie niet alleen over tools of code. Het gaat om ontdekken, verbeteren en iets neerzetten waar je trots op kunt zijn.</p><div className="philosophy-decoration"><span>CREATE</span><span>·</span><span>LEARN</span><span>·</span><span>REPEAT</span></div></Reveal>
        </div>
      </section>

      <section className="connect-section" id="connect">
        <div className="container connect-inner">
          <Reveal><div className="eyebrow light"><span>05 /</span> STAY CONNECTED</div><h2>Let's build<br/>something <em>great.</em></h2><p>Bekijk mijn werk, volg nieuwe projecten of ontdek waar ik mee bezig ben.</p></Reveal>
          <Reveal className="connect-links" delay={100}><a href="https://github.com/ItsYaBoyKing030" target="_blank" rel="noreferrer"><Github size={23}/><span>GitHub<small>CODE & PROJECTS</small></span><ArrowUpRight size={22}/></a><a href="https://www.loschdental.nl" target="_blank" rel="noreferrer"><Globe2 size={23}/><span>Losch Dental<small>RECENT WEBSITE PROJECT</small></span><ArrowUpRight size={22}/></a></Reveal>
        </div>
        <div className="connect-watermark" aria-hidden="true">ORLANDO</div>
      </section>
    </main>

    <footer className="footer"><div className="container footer-main"><Brand/><p>Technology. Design. Curiosity.<br/>Made with intention.</p><a href="#home" className="back-to-top">BACK TO TOP <ArrowUpRight size={16}/></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} ROGER ORLANDO — ROGER CHJIN A FOENG</span><span>DESIGNED & BUILT WITH CARE <span className="footer-star">✳</span></span></div></footer>
  </div>;
}
