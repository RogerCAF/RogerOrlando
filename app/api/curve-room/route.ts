import { createHash, randomBytes } from "node:crypto";
import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Signaling only: immutable, short-lived offer/answer files in the existing
// Vercel Blob store. Game input and frames travel directly via WebRTC, not Blob.
const PREFIX = "bureau-curve-lan-v1";
const ROOM_TTL_MS = 90 * 60 * 1000;
const ROOM_RE = /^[A-HJ-NP-Z2-9]{6}$/;
const PEER_RE = /^[a-f0-9]{24}$/;
const code = () => Array.from(randomBytes(6), byte => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[byte % 32]).join("");
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const json = (value: unknown, status = 200) =>
  NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });

type Meta = { created: number; expires: number; hash: string };
type Signal = { type: "offer" | "answer"; sdp: string };
type Offer = { peer: string; offer: Signal; created: number };

function validSignal(value: unknown, type: "offer" | "answer"): value is Signal {
  if (!value || typeof value !== "object") return false;
  const item = value as { type?: unknown; sdp?: unknown };
  return item.type === type && typeof item.sdp === "string" &&
    item.sdp.length > 20 && item.sdp.length <= 18000 &&
    item.sdp.startsWith("v=0");
}

async function readFile<T>(path: string): Promise<T | null> {
  const result = await list({ prefix: path, limit: 2 });
  const file = result.blobs.find(entry => entry.pathname === path);
  if (!file) return null;
  // Every signaling blob is immutable, so there are no stale overwrite reads.
  const response = await fetch(file.url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

async function roomMeta(room: string) {
  const value = await readFile<Meta>(`${PREFIX}/${room}/meta.json`);
  if (!value || !Number.isFinite(value.expires) || Date.now() > value.expires) return null;
  return value;
}

const validRoom = (room: unknown): room is string =>
  typeof room === "string" && ROOM_RE.test(room);
const validPeer = (peer: unknown): peer is string =>
  typeof peer === "string" && PEER_RE.test(peer);

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
    return json({ error: "De kamerdienst is nog niet geconfigureerd." }, 503);
  if (Number(req.headers.get("content-length") || 0) > 22000)
    return json({ error: "Bericht te groot." }, 413);

  try {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.nextUrl.host)
      return json({ error: "Verzoek niet toegestaan." }, 403);
    const body = await req.json() as Record<string, unknown>;
    if (!body || typeof body !== "object") return json({ error: "Ongeldig verzoek." }, 400);
    const action = body.action;
    if (action === "create") {
      for (let attempt = 0; attempt < 5; attempt++) {
        const room = code();
        const secret = randomBytes(24).toString("hex");
        const now = Date.now();
        try {
          await put(`${PREFIX}/${room}/meta.json`,
            JSON.stringify({ created: now, expires: now + ROOM_TTL_MS, hash: digest(secret) } satisfies Meta),
            { access: "public", addRandomSuffix: false, contentType: "application/json", ttlDays: 1 });
          return json({ room, secret, expires: now + ROOM_TTL_MS });
        } catch (error) {
          // Extremely unlikely room-code collision: try a different code.
          if (String(error).toLowerCase().includes("already exists")) continue;
          throw error;
        }
      }
      return json({ error: "Geen kamercode beschikbaar. Probeer opnieuw." }, 503);
    }
    if (!validRoom(body.room)) return json({ error: "Ongeldige kamercode." }, 400);
    const room = body.room;
    const meta = await roomMeta(room);
    if (!meta) return json({ error: "Kamer niet gevonden of verlopen. Maak een nieuwe kamer." }, 404);

    if (action === "join") {
      if (!validPeer(body.peer) || !validSignal(body.offer, "offer"))
        return json({ error: "Ongeldige verbindingsaanvraag." }, 400);
      const offers = await list({ prefix: `${PREFIX}/${room}/offer/`, limit: 10 });
      if (offers.blobs.length >= 4) return json({ error: "Deze kamer heeft al vier gastplekken gereserveerd." }, 409);
      await put(`${PREFIX}/${room}/offer/${body.peer}.json`,
        JSON.stringify({ peer: body.peer, offer: body.offer, created: Date.now() } satisfies Offer),
        { access: "public", contentType: "application/json", addRandomSuffix: false, ttlDays: 1 });
      return json({ ok: true });
    }
    if (action === "answer") {
      if (typeof body.secret !== "string" || digest(body.secret) !== meta.hash)
        return json({ error: "Alleen de host kan een verbinding accepteren." }, 403);
      if (!validPeer(body.peer) || !validSignal(body.answer, "answer"))
        return json({ error: "Ongeldig antwoord." }, 400);
      await put(`${PREFIX}/${room}/answer/${body.peer}.json`,
        JSON.stringify({ answer: body.answer }),
        { access: "public", contentType: "application/json", addRandomSuffix: false, ttlDays: 1 });
      return json({ ok: true });
    }
    return json({ error: "Onbekende actie." }, 400);
  } catch (error) {
    console.error("Curve LAN signaling:", error instanceof Error ? error.message : "unknown");
    return json({ error: "De kamerverbinding is tijdelijk niet beschikbaar." }, 500);
  }
}

export async function GET(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
    return json({ error: "Kamerdienst niet beschikbaar." }, 503);
  const room = req.nextUrl.searchParams.get("room");
  if (!validRoom(room)) return json({ error: "Ongeldige kamercode." }, 400);
  try {
    const meta = await roomMeta(room);
    if (!meta) return json({ error: "Kamer niet gevonden of verlopen." }, 404);
    const action = req.nextUrl.searchParams.get("action");
    if (action === "offers") {
      const secret = req.nextUrl.searchParams.get("secret");
      if (!secret || digest(secret) !== meta.hash) return json({ error: "Geen hosttoegang." }, 403);
      const results = await list({ prefix: `${PREFIX}/${room}/offer/`, limit: 10 });
      const offers = await Promise.all(results.blobs.map(async file => {
        try {
          const response = await fetch(file.url, { cache: "no-store" });
          return response.ok ? await response.json() as Offer : null;
        } catch { return null; }
      }));
      return json({ offers: offers.filter((o): o is Offer =>
        !!o && validPeer(o.peer) && validSignal(o.offer, "offer") &&
        Number.isFinite(o.created) && o.created >= meta.created) });
    }
    if (action === "answer") {
      const peer = req.nextUrl.searchParams.get("peer");
      if (!validPeer(peer)) return json({ error: "Ongeldige speler." }, 400);
      const response = await readFile<{ answer: Signal }>(`${PREFIX}/${room}/answer/${peer}.json`);
      return json({ answer: response && validSignal(response.answer, "answer") ? response.answer : null });
    }
    return json({ ok: true, expires: meta.expires });
  } catch (error) {
    console.error("Curve LAN signaling:", error instanceof Error ? error.message : "unknown");
    return json({ error: "Kan kamer momenteel niet laden." }, 500);
  }
}
