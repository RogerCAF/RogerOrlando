"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Layers3, MonitorSmartphone, Sparkles, X } from "lucide-react";
import "./portfolio-case-studies.css";

type Study = {
  id: string; name: string; category: string; description: string; stage: string; className: string;
  tags: string[]; role: string; focus: string; question: string; approach: string; thought: string; wink: string;
  href?: string;
};

const studies: Study[] = [
  {
    id: "01", name: "Losch Dental", category: "WEBSITE / VISUAL DESIGN + DEVELOPMENT",
    description: "Een verfijnde digitale presentatie voor endodontologische zorg. Rust in de interface, precisie in het detail.",
    stage: "WEBSITE", className: "dental", tags: ["NEXT.JS", "WEB DESIGN", "VERCEL"],
    role: "Webdesign & development", focus: "Typografie · Vertrouwen · Duidelijkheid",
    question: "Hoe geef je specialistische zorg een professionele en toegankelijke digitale uitstraling?",
    approach: "Door duidelijke informatie, een rustige compositie en consistente typografie centraal te zetten. Functionaliteit ondersteunt de inhoud, niet andersom.",
    thought: "Niet ieder ontwerp hoeft luid te zijn om indruk te maken.",
    wink: "Calm design. Zero unnecessary drama.", href: "https://www.loschdental.nl"
  },
  {
    id: "02", name: "CityFi", category: "WEB3 / PRODUCT CONCEPT",
    description: "Een digitale verzamelwereld rondom steden. Een eigen concept waar interactie, identiteit en technologie samenkomen.",
    stage: "IN DEVELOPMENT", className: "cityfi", tags: ["WEB3", "NEXT.JS", "PRODUCT"],
    role: "Concept & visual direction", focus: "Wereldbouw · Community · Product",
    question: "Hoe maak je duizenden unieke steden onderdeel van één herkenbare digitale ervaring?",
    approach: "Een conceptuele wereld met stadidentiteiten, een helder designsysteem en ruimte voor ontdekking. Het project is nog volop in ontwikkeling.",
    thought: "Een kaart is pas interessant als er iets te ontdekken valt.",
    wink: "Collect cities. Ignore parking tickets."
  },
  {
    id: "03", name: "10.00", category: "MOBILE GAME / INTERACTION DESIGN",
    description: "Een timinggame met één uitdaging: raak exact tien seconden. Simpel genoeg om te begrijpen, lastig genoeg om opnieuw te proberen.",
    stage: "APP PROJECT", className: "ten", tags: ["REACT NATIVE", "IOS", "GAME UX"],
    role: "Game concept, UX & appbouw", focus: "Timing · Feedback · Spelgevoel",
    question: "Hoe maak je van één knop een ervaring die spannend aanvoelt?",
    approach: "Door één centrale interactie, een eigen visuele identiteit en feedback die het moment van precisie voelbaar maakt.",
    thought: "Simpel maken is meestal het moeilijkste onderdeel.",
    wink: "Ten seconds. Infinite excuses."
  },
  {
    id: "04", name: "BreakUrge", category: "MOBILE APP / WELLBEING",
    description: "Een appconcept dat dagelijkse vooruitgang zichtbaar maakt. Geen onnodige ruis, maar overzicht en motivatie.",
    stage: "APP PROJECT", className: "breakurge", tags: ["EXPO", "REACT NATIVE", "UX/UI"],
    role: "Concept, interaction & mobile UX", focus: "Rust · Motivatie · Voortgang",
    question: "Hoe ontwerp je een ondersteunende app die niet overweldigt?",
    approach: "Door timer, mijlpalen en check-ins overzichtelijk samen te brengen. Iedere keuze draait om een rustigere, begrijpelijkere gebruikerservaring.",
    thought: "Goed design maakt ruimte voor wat belangrijk is.",
    wink: "Less noise. More progress."
  }
];

function Preview({ item }: { item: Study }) {
  if (item.className === "dental") return <div className="cs-preview cs-dental">
    <span className="cs-preview-small">LOSCH / DENTAL</span>
    <strong>Care,<br/><em>considered.</em></strong>
    <span className="cs-preview-caption">CALM · PRECISE · HUMAN</span>
  </div>;
  if (item.className === "cityfi") return <div className="cs-preview cs-cityfi">
    <div className="cs-orbit cs-orbit-a"/><div className="cs-orbit cs-orbit-b"/>
    <span className="cs-city-title">CITY<span>FI.</span></span>
    <span className="cs-preview-caption">THE WORLD IS COLLECTIBLE</span>
  </div>;
  if (item.className === "ten") return <div className="cs-preview cs-ten">
    <div className="cs-timer-dial"/>
    <strong>10<span>.</span>00</strong>
    <span className="cs-preview-caption">PRECISION IS EVERYTHING</span>
  </div>;
  return <div className="cs-preview cs-breakurge">
    <span className="cs-preview-small">DAY BY DAY / PROGRESS</span>
    <strong>B<span>.</span></strong>
    <div className="cs-progress-dots"><i/><i/><i/><i/><i/></div>
    <span className="cs-preview-caption">PROGRESS, NOT PERFECTION</span>
  </div>;
}

export default function PortfolioCaseStudies() {
  const [openedId, setOpenedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opened = studies.find(project => project.id === openedId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openedId && !dialog.open) dialog.showModal();
    if (!openedId && dialog.open) dialog.close();
  }, [openedId]);

  return <>
    <div className="cs-overline"><span>THE INDEX / SELECTED WORK</span><span>HOVER TO EXPLORE — CLICK FOR THE STORY</span></div>
    <div className="cs-grid">
      {studies.map((item,index) => <article className={"cs-card cs-" + item.className + (index===0 ? " cs-featured" : "")} key={item.id}>
        <div className="cs-visual">
          <div className="cs-visual-grid"/>
          <div className="cs-topline"><span>FILE / {item.id}</span><span>{item.stage}</span></div>
          <Preview item={item}/>
          <span className="cs-corner" aria-hidden="true">↗</span>
        </div>
        <div className="cs-info">
          <div className="cs-category"><span>{item.category}</span><span className="cs-status"><i/> {item.stage}</span></div>
          <div className="cs-title-row"><h3>{item.name}<span>.</span></h3><button type="button" aria-label={"Bekijk projectverhaal van " + item.name} onClick={()=>setOpenedId(item.id)} className="cs-round-link"><ArrowUpRight size={22}/></button></div>
          <p className="cs-description">{item.description}</p>
          <div className="cs-facts"><div><small>ROL</small><strong>{item.role}</strong></div><div><small>FOCUS</small><strong>{item.focus}</strong></div></div>
          <div className="cs-actions"><button type="button" onClick={()=>setOpenedId(item.id)}>BEKIJK PROJECTVERHAAL <ChevronRight size={15}/></button>{item.href && <a href={item.href} target="_blank" rel="noopener noreferrer">BEKIJK LIVE WEBSITE <ArrowUpRight size={14}/></a>}</div>
          <div className="cs-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
        </div>
      </article>)}
    </div>
    <dialog ref={dialogRef} className="cs-dialog" aria-label={opened ? "Projectverhaal: "+opened.name : "Projectverhaal"} onClose={()=>setOpenedId(null)} onClick={e=>{if(e.target === e.currentTarget)setOpenedId(null);}}>
      {opened && <div className="cs-dialog-inside">
        <div className="cs-dialog-toolbar"><span>ROGER / CASE STUDY {opened.id}</span><button type="button" aria-label="Sluit projectverhaal" onClick={()=>setOpenedId(null)}><X size={23}/></button></div>
        <div className="cs-dialog-hero"><span>{opened.category}</span><h2>{opened.name}<i>.</i></h2><p>{opened.description}</p></div>
        <div className="cs-dialog-facts"><div><small>STATUS</small><strong>{opened.stage}</strong></div><div><small>MY ROLE</small><strong>{opened.role}</strong></div><div><small>FOCUS</small><strong>{opened.focus}</strong></div></div>
        <div className="cs-dialog-articles">
          <section><span>01 / THE QUESTION</span><h3>The challenge.</h3><p>{opened.question}</p></section>
          <section><span>02 / THE THINKING</span><h3>The approach.</h3><p>{opened.approach}</p></section>
          <section><span>03 / THE TAKEAWAY</span><h3>The detail.</h3><p>{opened.thought}</p></section>
        </div>
        <div className="cs-dialog-footer"><span>{opened.wink}</span>{opened.href ? <a href={opened.href} target="_blank" rel="noopener noreferrer">BEKIJK LIVE WEBSITE <ArrowUpRight size={16}/></a> : <span className="cs-no-demo"><Check size={15}/> PERSONAL PROJECT / NO PUBLIC DEMO</span>}</div>
      </div>}
    </dialog>
  </>;
}
