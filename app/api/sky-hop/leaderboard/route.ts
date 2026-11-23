import { list, put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREFIX = "the-bureau/snuffy-bird/leaderboard/v1/";
const MAX_SCAN = 1000;
type Score = { name: string; score: number; at: string };

function respond(body: unknown, status = 200) {
  return Response.json(body, { status, headers: {
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  } });
}
function safeName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().toUpperCase();
  return /^[A-Z0-9 _-]{1,12}$/.test(name) ? name : null;
}
function parseEntry(pathname: string, uploadedAt: Date): Score | null {
  if (!pathname.startsWith(PREFIX)) return null;
  const part = pathname.slice(PREFIX.length);
  const match = /^([0-9]{1,4})-([A-Za-z0-9_-]{1,40})-[a-f0-9-]{36}\.json$/.exec(part);
  if (!match) return null;
  const score = Number(match[1]);
  let name: string;
  try { name = Buffer.from(match[2], "base64url").toString("utf8"); } catch { return null; }
  const valid = safeName(name);
  if (!valid || score < 1 || score > 9999) return null;
  return { name: valid, score, at: uploadedAt.toISOString() };
}
async function readScores() {
  const scores: Score[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    const result = await list({ prefix: PREFIX, limit: 100, cursor });
    for (const blob of result.blobs) {
      const entry = parseEntry(blob.pathname, blob.uploadedAt);
      if (entry) scores.push(entry);
    }
    if (!result.hasMore || scores.length >= MAX_SCAN) break;
    cursor = result.cursor;
  }
  scores.sort((a, b) => b.score - a.score || a.at.localeCompare(b.at));
  return scores.slice(0, 10);
}
export async function GET() {
  try { return respond({ mode: "global", entries: await readScores() }); }
  catch { return respond({ error: "Leaderboard temporarily unavailable." }, 503); }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && host) {
    try { if (new URL(origin).host !== host) return respond({ error: "Cross-origin request rejected." }, 403); }
    catch { return respond({ error: "Invalid request origin." }, 403); }
  }
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return respond({ error: "Send JSON." }, 415);
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 256) return respond({ error: "Request too large." }, 413);
    body = JSON.parse(raw);
    if (!body || Array.isArray(body) || typeof body !== "object") return respond({ error: "Invalid submission." }, 400);
  } catch { return respond({ error: "Invalid JSON." }, 400); }
  const name = safeName(body.name);
  const score = body.score;
  if (!name || !Number.isInteger(score) || (score as number) < 1 || (score as number) > 9999)
    return respond({ error: "Invalid name or score." }, 400);
  // Each result is immutable. Concurrent submissions cannot replace someone else's score.
  const token = crypto.randomUUID();
  const encodedName = Buffer.from(name, "utf8").toString("base64url");
  const pathname = `${PREFIX}${score}-${encodedName}-${token}.json`;
  try {
    await put(pathname, JSON.stringify({ name, score, at: new Date().toISOString() }), {
      access: "private", contentType: "application/json",
      addRandomSuffix: false, allowOverwrite: false,
    });
    return respond({ saved: true, entries: await readScores() }, 201);
  } catch {
    return respond({ error: "Score could not be saved. Please retry." }, 503);
  }
}
