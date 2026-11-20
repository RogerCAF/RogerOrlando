import { ArrowLeft, ArrowRight, Bird, Box, Dumbbell, Gamepad2, LockKeyhole, Route, Swords, Timer, Zap } from "lucide-react";
import "./arcade.css";

const games = [
  { name: "Dr. Mongo’s Reaction Game", type: "REFLEX / SINGLE PLAYER", description: "Wacht op groen. Tik zo snel je kunt en verbeter je persoonlijke record.", href: "/arcade/reaction", icon: Zap, featured: true },
  { name: "The Button 10:00", type: "TIMING / SINGLE PLAYER", description: "Stop de grote rode knop op exact 10.00 seconden. Ook in blind mode.", href: "/arcade/ten", icon: Timer, featured: true },
  { name: "Heavy Bag", type: "IDLE BOXING", description: "Bouw je boksschool op, upgrade je kracht en werk door de uitdagingen.", href: "/bureau/heavybag-play.html", icon: Dumbbell },
  { name: "Cube Survivor", type: "SURVIVAL", description: "Overleef de arena, verzamel XP en verbeter je wapens.", href: "/bureau/cube-survivor.html", icon: Box },
  { name: "The Unfinished Project", type: "SECRET FILE 030", description: "Een interactief puzzelavontuur met verborgen systeemproeven.", href: "/play", icon: LockKeyhole },
  { name: "Fight Camp", type: "THE BUREAU / POSTER", description: "De vechtsportervaring achter de poster in het bureau.", href: "/#lab", icon: Swords }
];

const phoneGames = [
  { name: "Snuffy Bird", type: "SINGLE PLAYER / TOP 10", href: "/bureau/sky-hop.html", icon: Bird, description: "Vlieg tussen de obstakels en bewaar je hoogste scores." },
  { name: "Agtung die Kurve", type: "LOCAL MULTIPLAYER / 2–5", href: "/bureau/curve-clash.html", icon: Route, description: "Blijf als laatste over met maximaal vijf spelers." }
];

export default function ArcadePage() {
  return <main className="bureau-catalog">
    <div className="bureau-catalog-wrap">
      <header className="bureau-catalog-nav">
        <a href="/#lab" className="bureau-catalog-back"><ArrowLeft size={17} /> TERUG NAAR THE BUREAU</a>
        <span><Gamepad2 size={18} /> ROGER / ARCADE</span>
      </header>
      <div className="bureau-catalog-hero">
        <div className="bureau-catalog-kicker">THE BUREAU / 08 PLAYABLE EXPERIENCES</div>
        <h1>Pick a <em>challenge.</em></h1>
        <p>Alle spellen op één plek. Geen verborgen knoppen nodig: kies en speel direct in je browser.</p>
      </div>
      <div className="bureau-catalog-section-head"><h2>Arcade</h2><span>06 GAMES / INCLUDING THE CLASSICS</span></div>
      <div className="bureau-catalog-grid">
        {games.map((game,index) => <a key={game.name} href={game.href} className={`bureau-catalog-card ${game.featured ? "is-featured" : ""}`}>
          <div className="bureau-catalog-card-top"><span>{String(index+1).padStart(2,"0")} / {game.type}</span><game.icon size={26} strokeWidth={1.55}/></div>
          <strong>{game.name}</strong><p>{game.description}</p>
          <span className="bureau-catalog-play">SPEEL NU <ArrowRight size={15}/></span>
        </a>)}
      </div>
      <div className="bureau-catalog-section-head bureau-catalog-phone-head"><h2>Phone games</h2><span>02 GAMES / THE BUREAU PHONE</span></div>
      <div className="bureau-catalog-grid bureau-catalog-phone-grid">
        {phoneGames.map((game,index) => <a key={game.name} href={game.href} className="bureau-catalog-card">
          <div className="bureau-catalog-card-top"><span>{String(index+7).padStart(2,"0")} / {game.type}</span><game.icon size={26} strokeWidth={1.55}/></div>
          <strong>{game.name}</strong><p>{game.description}</p>
          <span className="bureau-catalog-play">SPEEL NU <ArrowRight size={15}/></span>
        </a>)}
      </div>
      <footer className="bureau-catalog-footer"><span>THE BUREAU / BUILT TO PLAY</span><a href="/#lab">TERUG NAAR HET BUREAU <ArrowRight size={14}/></a></footer>
    </div>
  </main>;
}
