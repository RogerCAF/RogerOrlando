"use client";

import { useEffect, useState } from "react";
import CreativePlayground from "./components/CreativePlayground";
import PortfolioCaseStudies from "./components/PortfolioCaseStudies";
import { ArrowDown, ArrowRight, ArrowUpRight, Braces, Check, ChevronDown, Code2, Cpu, ExternalLink, Github, Globe2, Layers3, Menu, MonitorSmartphone, Network, ShieldCheck, Sparkles, TerminalSquare, Palette, X } from "lucide-react";

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
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); if (entry.target.id) setActive(entry.target.id); }
    }), { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    document.querySelectorAll(".reveal, section[id]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => { document.body.classList.toggle("menu-open", menuOpen); return () => document.body.classList.remove("menu-open"); }, [menuOpen]);
  const links = [["Over mij", "#about"], ["Projecten", "#work"]];
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
      <nav className={`mobile-nav ${menuOpen ? "open" : ""}`} aria-label="Mobiele navigatie">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={19}/></a>)}<a className="mobile-contact-cta" href="#connect" onClick={() => setMenuOpen(false)}>CONTACT <ArrowUpRight size={19}/></a></nav>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-halo halo-one" aria-hidden="true" /><div className="hero-halo halo-two" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-left">
            <div className="hero-eyebrow"><span className="availability-dot"/> DESIGN BACKGROUND × ENGINEERING MINDSET <span className="tiny-star">✳</span> UTRECHT, NL</div>
            <h1>Design with intent.<br/><em>Built with precision.</em><br/>Made to matter<span className="accent-period">.</span></h1>
            <p className="hero-summary">Ik ben <strong>Roger Chin A Foeng</strong>. Met een achtergrond in grafisch design en een focus op IT en development combineer ik visuele kwaliteit met doordachte techniek. Van het grote idee tot het kleinste detail.</p>
            <div className="hero-buttons">
              <a className="button button-primary" href="#work">Ontdek mijn projecten <ArrowUpRight size={17}/></a>
              <a className="button button-quiet" href="#lab">Ontdek de Playground <ArrowDown size={16}/></a>
            </div>
          </div>
          <div className="hero-art hero-art-premium" aria-label="Gedetailleerd verguld monogram R met architectonische lijnen en lichtaccenten">
            <div className="premium-monogram-glow" aria-hidden="true"/>
            <svg className="premium-monogram-svg" viewBox="0 0 600 600" role="img" aria-label="Gegraveerd gouden R-monogram in een fijn uitgewerkt geometrisch medaillon">
              <defs>
                <radialGradient id="pmBackdrop"><stop offset="0%" stopColor="#8a6a3d" stopOpacity=".34"/><stop offset="55%" stopColor="#756047" stopOpacity=".06"/><stop offset="100%" stopColor="#0b0d12" stopOpacity="0"/></radialGradient>
                <linearGradient id="pmGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#796044"/><stop offset="18%" stopColor="#e1c399"/><stop offset="35%" stopColor="#fff3d4"/><stop offset="53%" stopColor="#b89358"/><stop offset="68%" stopColor="#e7cda5"/><stop offset="88%" stopColor="#947044"/><stop offset="100%" stopColor="#e6ccaa"/></linearGradient>
                <linearGradient id="pmEtch" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f4dfb7" stopOpacity=".88"/><stop offset="55%" stopColor="#846b4d" stopOpacity=".35"/><stop offset="100%" stopColor="#e4cda1" stopOpacity=".85"/></linearGradient>
                <filter id="pmShadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="12"/><feOffset dx="3" dy="17" result="offset"/><feComponentTransfer><feFuncA type="linear" slope=".55"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="pmHalo"><feGaussianBlur stdDeviation="4"/></filter>
              </defs>
              <circle cx="300" cy="300" r="278" fill="url(#pmBackdrop)"/>
              <g className="pm-orbit-outer">
                <circle cx="300" cy="300" r="266" fill="none" stroke="#bca172" strokeOpacity=".16" strokeWidth="1"/>
                <circle cx="300" cy="300" r="258" fill="none" stroke="#a78a5f" strokeOpacity=".4" strokeWidth="1" strokeDasharray="2 10"/>
                {Array.from({length:72},(_,i) => <line key={i} x1="300" y1={i%6===0?"41":"47"} x2="300" y2={i%6===0?"62":"55"} transform={`rotate(${i*5} 300 300)`} stroke="#e0c597" strokeOpacity={i%6===0?".67":".27"} strokeWidth={i%6===0?"1.6":".65"}/>)}
              </g>
              <g className="pm-orbit-middle">
                <circle cx="300" cy="300" r="223" fill="none" stroke="url(#pmEtch)" strokeWidth="1.1" strokeOpacity=".63"/>
                <circle cx="300" cy="300" r="219" fill="none" stroke="#cfb083" strokeOpacity=".2" strokeDasharray="1 7"/>
                <circle cx="300" cy="300" r="206" fill="none" stroke="#a78961" strokeOpacity=".26" strokeWidth=".8"/>
                <path d="M300 77 L523 300 L300 523 L77 300 Z" fill="none" stroke="#d8b988" strokeOpacity=".27" strokeWidth=".8"/>
                <path d="M300 94 L506 300 L300 506 L94 300 Z" fill="none" stroke="#aa8b5d" strokeOpacity=".15"/>
              </g>
              <circle cx="300" cy="300" r="177" fill="#10141b" fillOpacity=".58" stroke="url(#pmGold)" strokeOpacity=".65" strokeWidth="1.5"/>
              <circle cx="300" cy="300" r="171" fill="none" stroke="#f4d8a8" strokeOpacity=".19" strokeWidth=".6"/>
              <circle cx="300" cy="300" r="162" fill="none" stroke="#d6b589" strokeOpacity=".17" strokeDasharray="3 10"/>
              <path d="M300 131 L469 300 L300 469 L131 300 Z" fill="none" stroke="#c7a471" strokeOpacity=".19"/>
              <g stroke="url(#pmEtch)" strokeWidth="1" fill="none" strokeOpacity=".6">
                <path d="M300 84 V122 M300 478 V516 M84 300 H122 M478 300 H516"/>
                <path d="M155 155 L181 181 M445 155 L419 181 M155 445 L181 419 M445 445 L419 419"/>
              </g>
              <g fill="#eacfa4">
                <circle cx="300" cy="77" r="4"/><circle cx="523" cy="300" r="4"/><circle cx="300" cy="523" r="4"/><circle cx="77" cy="300" r="4"/>
                <circle cx="300" cy="77" r="10" fill="none" stroke="#e1c399" strokeOpacity=".4"/>
              </g>
              <g className="pm-crown" role="presentation" strokeLinecap="round" strokeLinejoin="round">
                <path d="M233 143 L253 174 Q300 184 347 174 L367 143 L330 156 L300 115 L270 156 Z"
                  fill="#1b1a19" fillOpacity=".26" stroke="#423322" strokeWidth="4.5" strokeLinejoin="round"/>
                <path d="M233 143 L253 174 Q300 184 347 174 L367 143 L330 156 L300 115 L270 156 Z"
                  fill="none" stroke="url(#pmGold)" strokeWidth="2.2"/>
                <path d="M249 181 Q300 190 351 181 M252 187 Q300 195 348 187"
                  stroke="url(#pmEtch)" strokeWidth="1.25" fill="none"/>
                <path d="M270 156 L278 173 M330 156 L322 173 M300 125 V171"
                  stroke="#f1d7ab" strokeOpacity=".45" strokeWidth=".8" fill="none"/>
                <path d="M300 143 L306 152 L300 161 L294 152 Z"
                  stroke="#f8e3be" strokeWidth="1.15" fill="#d4b07b" fillOpacity=".13"/>
                <circle cx="233" cy="141" r="4.3" fill="#f6d6a2" stroke="#8c673b" strokeWidth="1"/>
                <circle cx="367" cy="141" r="4.3" fill="#f6d6a2" stroke="#8c673b" strokeWidth="1"/>
                <circle cx="300" cy="112" r="5" fill="#ffe9c4" stroke="#9f7948" strokeWidth="1"/>
                <path d="M300 100 V106 M290 112 H294 M306 112 H310"
                  fill="none" stroke="#e3c18f" strokeWidth=".9" strokeOpacity=".75"/>
              </g>
              <text x="311" y="412" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="302" fill="#060910" stroke="#060910" strokeWidth="3" opacity=".78">R</text>
              <text x="301" y="400" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="302" fill="url(#pmGold)" stroke="#fde5b9" strokeWidth=".65" filter="url(#pmShadow)">R</text>
              <path d="M191 410 H410" stroke="#ddc59d" strokeOpacity=".25" strokeWidth="1"/>
              <g className="pm-glint">
                <path d="M439 151 V191 M419 171 H459" stroke="#fff0cb" strokeWidth="1.2"/>
                <circle cx="439" cy="171" r="8" fill="none" stroke="#fff0cb" strokeOpacity=".65" strokeWidth=".8"/>
              </g>
            </svg>
            <div className="premium-monogram-panel premium-panel-top" aria-hidden="true"><span>MONOGRAM / RCA</span><span>EST. 2026</span></div>
            <div className="premium-monogram-panel premium-panel-bottom" aria-hidden="true"><span>DESIGN × ENGINEERING</span><span>FIG. / 001</span></div>
            <span className="premium-monogram-datum datum-a" aria-hidden="true">✳</span>
            <span className="premium-monogram-datum datum-b" aria-hidden="true">+</span>
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
            <div className="eyebrow"><span>01 /</span> ABOUT, BRIEFLY</div>
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

      <section className="section expertise-section" id="expertise">
        <div className="container">
          <Reveal className="section-head"><div><div className="eyebrow"><span>02 /</span> WHAT I DO</div><h2 className="expertise-heading-title">Where technology<br/>meets <em>curiosity.</em></h2></div><p>Een voormalig grafisch designer met een engineer-brein. De ene dag pixels, de andere dag packets.</p></Reveal>
          <div className="expertise-grid">{expertise.map((item,i) => <Reveal className="expertise-card" key={item.number} delay={i*70}><div className="expertise-top"><span>{item.number} / 04</span><item.icon size={27} strokeWidth={1.35}/></div><h3>{item.name}</h3><p>{item.description}</p><span className="card-line"/></Reveal>)}</div>
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="container">
          <Reveal className="section-head work-heading"><div><div className="eyebrow"><span>03 /</span> SELECTED WORK</div><h2>Proof over<br/><em>promises.</em></h2></div><p>Van websites tot appconcepten. Vier projecten, vier verschillende uitdagingen en een eigen verhaal achter elk ontwerp.</p></Reveal>
          <PortfolioCaseStudies />
          <Reveal className="work-footer"><div className="work-footer-mark">✳</div><p>Always building. Always learning.<br/><span>En er is nog veel meer onderweg.</span></p><a href="https://github.com/RogerCAF" target="_blank" rel="noreferrer">Meer op GitHub <ArrowUpRight size={17}/></a></Reveal>
        </div>
      </section>

      <section className="section lab-section" id="lab">
        <div className="container">
          <Reveal className="lab-heading">
            <div className="eyebrow"><span>04 /</span> BEYOND THE BRIEF</div>
            <h2>Where curiosity<br/><em>gets interactive.</em></h2>
            <p>Drie interactieve werelden, één overzichtelijke Playground. Wissel tussen design, engineering en gecontroleerde chaos.</p>
          </Reveal>
          <CreativePlayground />

          <Reveal className="lab-game-feature" delay={140}>
            <div className="lab-game-feature-mark" aria-hidden="true"><span>R<span>.</span></span></div>
            <div className="lab-game-feature-copy">
              <span>FEATURED EXPERIMENT / ROGER_OS</span>
              <h3>Done experimenting? <em>Enter the game.</em></h3>
              <p>Vier missies, verborgen codes en een systeem met net iets te veel persoonlijkheid.</p>
            </div>
            <a href="/play" className="lab-game-feature-link">PLAY THE UNFINISHED PROJECT <ArrowUpRight size={17}/></a>
          </Reveal>       </div>
      </section>




    </main>

    <footer className="footer" id="connect">
      <div className="container footer-main"><Brand/><p>Design brain. Engineer hands.<br/>Made with intention.</p><a href="#home" className="back-to-top">BACK TO TOP <ArrowUpRight size={16}/></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} ROGER ORLANDO — ROGER CHIN A FOENG</span><span>DESIGNED & BUILT WITH CARE <span className="footer-star">✳</span></span></div></footer>
  </div>;
}
