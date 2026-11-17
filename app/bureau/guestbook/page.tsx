"use client";

import { useCallback, useEffect, useState } from "react";

type Signature = { name: string; date: string };
type GuestbookResponse = { mode?: string; entries?: Signature[]; total?: number; error?: string };

export default function BureauGuestbook() {
  const [entries, setEntries] = useState<Signature[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [signed, setSigned] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/guestbook", { cache: "no-store" });
      const data = (await r.json()) as GuestbookResponse;
      if (!r.ok) throw new Error(data.error || "Visitor book unavailable");
      setEntries(data.entries || []);
      setMessage("");
    } catch {
      setMessage("The notebook is temporarily unavailable. Please try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setSigned(localStorage.getItem("bureau-signed") === "yes");
    void refresh();
  }, [refresh]);

  async function sign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || signed) return;
    setPending(true);
    setMessage("");
    try {
      const r = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = (await r.json()) as GuestbookResponse;
      if (!r.ok) throw new Error(result.error || "Signing failed");
      setEntries(result.entries || []);
      localStorage.setItem("bureau-signed", "yes");
      setSigned(true);
      setName("");
      setMessage("Ink dried. Legend secured.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Signing failed");
    } finally { setPending(false); }
  }

  return (
    <main className="bureau-guestbook">
      <a className="back" href="/">← BACK TO PORTFOLIO</a>
      <div className="heading"><span>THE BUREAU / NOTEBOOK NO. 01</span><h1>Leave your mark<span>.</span></h1><p>One name. One line. Immortality, sort of.</p></div>
      <section className="notebook" aria-label="The Bureau public guestbook">
        <div className="edge" />
        <div className="book-head"><span>VISITOR REGISTER</span><span>EST. 2026</span></div>
        <h2>People who found their way here.</h2>
        <p className="intro">Good ideas are temporary. Questionable signatures are forever.</p>
        <div className="lines" aria-live="polite">
          {loading ? <p className="empty">Opening the notebook…</p> : entries.length === 0 ? <p className="empty">The book is empty. Suspiciously peaceful.</p> : entries.map((e,i)=>(
            <div className="entry" key={e.name+"-"+i}><span className="idx">{String(i+1).padStart(3,"0")}</span><span className="signature">{e.name}</span><span className="date">{e.date}</span></div>
          ))}
        </div>
        <form onSubmit={sign}>
          <label htmlFor="visitor-name">SIGN THE BOOK</label>
          <div className="inputs">
            <input id="visitor-name" type="text" value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={32} required autoComplete="nickname" placeholder="Your name, not your life story" disabled={signed||pending}/>
            <button disabled={signed||pending}>{signed?"ALREADY SIGNED":pending?"SIGNING…":"LEAVE YOUR MARK ↗"}</button>
          </div>
          <p className="feedback" role="status">{message || "A public signature. One line per name. No passwords, no accounts."}</p>
        </form>
        <div className="book-foot"><span>PUBLIC RECORD · ONE SIGNATURE PER BROWSER</span><span>PAGE 001—∞</span></div>
      </section>
      <p className="disclaimer">Your name becomes visible to other visitors. This book does not collect email addresses.</p>
      <style>{`
        *{box-sizing:border-box}.bureau-guestbook{min-height:100vh;background:radial-gradient(ellipse at 50% -40%,#454036 0%,transparent 70%),#171818;color:#eadcc7;padding:36px 20px 88px;font-family:Arial,Helvetica,sans-serif;}
        .bureau-guestbook .back{color:#bb9d7b;text-decoration:none;font-size:11px;letter-spacing:2px;display:block;max-width:850px;margin:0 auto 70px}
        .bureau-guestbook .heading{text-align:center;margin:0 auto 38px}.bureau-guestbook .heading>span{font-size:11px;letter-spacing:3px;color:#a78d6d}
        .bureau-guestbook h1{font-family:Georgia,serif;font-size:clamp(40px,8vw,76px);letter-spacing:-2px;margin:15px 0 8px;font-weight:normal}
        .bureau-guestbook h1 span{color:#d99862}.bureau-guestbook .heading p{color:#aaa29b;margin:0;font-size:14px}
        .bureau-guestbook .notebook{position:relative;max-width:850px;min-height:520px;background:#eddfc6;color:#3b3027;margin:auto;border-radius:5px 18px 18px 5px;padding:38px 54px 36px 65px;border:1px solid #b59b78;box-shadow:0 24px 70px #0008,inset 9px 0 20px #bda78c55}
        .bureau-guestbook .edge{position:absolute;left:23px;top:0;bottom:0;border-left:1px solid #b99e7e}
        .bureau-guestbook .book-head,.bureau-guestbook .book-foot{display:flex;justify-content:space-between;gap:12px;font:10px Arial;letter-spacing:1.5px;color:#8c745b}
        .bureau-guestbook h2{font-family:Georgia,serif;font-size:clamp(22px,4vw,32px);font-weight:normal;margin:35px 0 8px}
        .bureau-guestbook .intro{font:italic 15px Georgia,serif;color:#8f795f;margin:0 0 30px}
        .bureau-guestbook .lines{display:flex;flex-direction:column;gap:0;min-height:130px;max-height:360px;overflow:auto}
        .bureau-guestbook .entry{display:flex;align-items:center;gap:14px;border-bottom:1px solid #bba48690;padding:12px 4px;min-height:46px}
        .bureau-guestbook .idx{font:11px monospace;color:#a1896e}.bureau-guestbook .signature{font:italic 18px Georgia,serif;flex:1;overflow-wrap:anywhere}.bureau-guestbook .date{font:11px Arial;color:#8d7864}
        .bureau-guestbook .empty{color:#8f7a64;font:italic 16px Georgia,serif}.bureau-guestbook form{margin-top:37px}
        .bureau-guestbook label{display:block;font-size:10px;letter-spacing:2px;margin-bottom:10px;color:#856b51}
        .bureau-guestbook .inputs{display:flex;gap:8px}.bureau-guestbook input{min-width:0;flex:1;border:1px solid #bba389;border-radius:3px;padding:14px;background:#f7efdf;color:#3b3027;font-size:15px;outline-color:#8c755d}
        .bureau-guestbook button{border:0;background:#292623;color:#e9dcc7;padding:12px 18px;cursor:pointer;font:600 11px Arial;letter-spacing:1.1px;border-radius:3px}
        .bureau-guestbook button:disabled{opacity:.6;cursor:default}.bureau-guestbook .feedback{font-size:12px;color:#7b6a56;min-height:22px}
        .bureau-guestbook .book-foot{border-top:1px solid #bca587;padding-top:20px;margin-top:22px}
        .bureau-guestbook .disclaimer{max-width:850px;margin:18px auto;color:#a69a8b;font-size:12px;text-align:center}
        @media(max-width:580px){.bureau-guestbook .back{margin-bottom:42px}.bureau-guestbook .notebook{padding:28px 20px 27px 37px}.bureau-guestbook .edge{left:14px}.bureau-guestbook .inputs{flex-direction:column}.bureau-guestbook button{padding:16px}.bureau-guestbook .entry{gap:9px}}
      `}</style>
    </main>
  );
}
