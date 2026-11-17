import { list, put } from "@vercel/blob";

// The Bureau: public, shared visitor notebook without a traditional database.
// Each signature is a separate immutable private blob, so concurrent writes
// cannot erase earlier signatures. The blob credentials remain server-side.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREFIX = "the-bureau/guestbook/v1/";
const MAX_NAMES = 1000;
const MAX_SHOWN = 200;

function json(payload: unknown, status = 200, extra: Record<string,string> = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra
    }
  });
}
function validate(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.normalize("NFC").replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 32 || !/[\p{L}\p{N}]/u.test(name)) return null;
  if (!/^[\p{L}\p{M}\p{N} ._'’\-]+$/u.test(name)) return null;
  return name;
}
function blobName(name: string) {
  return Buffer.from(name, "utf8").toString("base64url");
}
function displayName(pathname: string) {
  const encoded = pathname.slice(PREFIX.length).replace(/\.json$/, "");
  try {
    const name = Buffer.from(encoded, "base64url").toString("utf8");
    return validate(name);
  } catch { return null; }
}
async function allEntries() {
  const entries: {name:string;date:string;id:string}[] = [];
  let cursor: string | undefined;
  for (let page=0;page<10;page++) {
    const data = await list({ prefix: PREFIX, limit: 100, cursor });
    for (const blob of data.blobs) {
      if (!blob.pathname.startsWith(PREFIX) || !blob.pathname.endsWith(".json")) continue;
      const name = displayName(blob.pathname);
      if (name) entries.push({
        name,
        date: new Date(blob.uploadedAt).toISOString().slice(0,10),
        id: blob.pathname
      });
    }
    if (!data.hasMore) break;
    cursor = data.cursor;
  }
  return entries.sort((a,b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}
function safeEntries(entries: Awaited<ReturnType<typeof allEntries>>) {
  return entries.slice(-MAX_SHOWN).map(({name,date})=>({name,date}));
}
export async function GET() {
  try {
    const entries=await allEntries();
    return json({mode:"shared",entries:safeEntries(entries),total:entries.length});
  } catch {
    return json({error:"The visitor book is temporarily unavailable."},503);
  }
}
export async function POST(request:Request) {
  const origin=request.headers.get("origin");
  const host=request.headers.get("x-forwarded-host")||request.headers.get("host");
  if (origin && host) {
    try { if (new URL(origin).host!==host) return json({error:"Cross-origin request rejected."},403); }
    catch { return json({error:"Invalid request origin."},403); }
  }
  const cookie=request.headers.get("cookie")||"";
  if (/(?:^|;\s*)the_bureau_signed=1(?:;|$)/.test(cookie))
    return json({error:"You already signed this book."},409);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({error:"Send JSON."},415);
  let body:Record<string,unknown>;
  try {
    const raw=await request.text();
    if (raw.length>512) return json({error:"Request too long."},413);
    body=JSON.parse(raw);
    if (!body || typeof body!=="object") return json({error:"Invalid request."},400);
  } catch {return json({error:"Invalid JSON."},400);}
  if (body.website) return json({error:"Invalid request."},400); // honeypot
  const name=validate(body.name);
  if (!name) return json({error:"Use one name of 2–32 characters."},400);
  try {
    const entries=await allEntries();
    if (entries.length>=MAX_NAMES) return json({error:"The visitor book is full."},409);
    if (entries.some(x=>x.name.toLocaleLowerCase("nl")===name.toLocaleLowerCase("nl")))
      return json({error:"This name already appears in the book."},409);

    const pathname=PREFIX+blobName(name)+".json";
    await put(pathname,JSON.stringify({name,date:new Date().toISOString()}),{
      access:"private",
      contentType:"application/json",
      addRandomSuffix:false,
      allowOverwrite:false
    });
    const added={name,date:new Date().toISOString().slice(0,10),id:pathname};
    return json({mode:"shared",entries:safeEntries([...entries,added]),total:entries.length+1},201,{
      "Set-Cookie":"the_bureau_signed=1; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax"
    });
  } catch (e) {
    const message=e instanceof Error?e.message:"";
    if (/already exist|conflict|409/i.test(message))
      return json({error:"This name already appears in the book."},409);
    return json({error:"Could not save your signature. Please try later."},503);
  }
}
