import { list, put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PREFIX = "the-bureau/mongo-reaction/leaderboard/v1/";
type Entry = { name: string; ms: number; at: string };
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const validName = (raw: unknown) => typeof raw === "string" && /^[A-Z0-9 _-]{1,12}$/.test(raw.trim().toUpperCase()) ? raw.trim().toUpperCase() : null;
async function ranking(): Promise<Entry[]> {
  const result: Entry[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    const blobs = await list({ prefix: PREFIX, limit: 100, cursor });
    for (const blob of blobs.blobs) {
      const match = /^([0-9]{1,5})-([A-Za-z0-9_-]{1,40})-([a-f0-9-]{36})\.json$/.exec(blob.pathname.slice(PREFIX.length));
      if (!match) continue;
      let name: string;
      try { name = Buffer.from(match[2], "base64url").toString("utf8"); } catch { continue; }
      const normalized = validName(name), ms = Number(match[1]);
      if (normalized && ms >= 80 && ms <= 10000) result.push({ name: normalized, ms, at: blob.uploadedAt.toISOString() });
    }
    if (!blobs.hasMore) break;
    cursor = blobs.cursor;
  }
  return result.sort((a,b)=>a.ms-b.ms || a.at.localeCompare(b.at)).slice(0,10);
}
export async function GET() {
  try { return json({ entries: await ranking(), mode: "global" }); }
  catch { return json({ error: "Leaderboard temporarily unavailable." },503); }
}
export async function POST(request: Request) {
  const origin=request.headers.get("origin"),host=request.headers.get("x-forwarded-host")||request.headers.get("host");
  if(origin&&host){try{if(new URL(origin).host!==host)return json({error:"Origin mismatch"},403)}catch{return json({error:"Invalid origin"},403)}}
  if(!request.headers.get("content-type")?.startsWith("application/json"))return json({error:"Send JSON"},415);
  let body:Record<string,unknown>;
  try { const raw=await request.text(); if(raw.length>256)return json({error:"Too large"},413);body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=="object")return json({error:"Invalid payload"},400); }
  catch{return json({error:"Invalid JSON"},400)}
  const name=validName(body.name),ms=body.ms;
  if(!name||!Number.isInteger(ms)||(ms as number)<80||(ms as number)>10000)return json({error:"Invalid name or time"},400);
  try {
    const rank=await ranking();
    if(rank.length>=10&&(ms as number)>=rank[9].ms)return json({ saved:false, entries:rank });
    const file=`${PREFIX}${ms}-${Buffer.from(name).toString("base64url")}-${crypto.randomUUID()}.json`;
    await put(file,JSON.stringify({name,ms}),{access:"private",contentType:"application/json",addRandomSuffix:false,allowOverwrite:false});
    return json({saved:true,entries:await ranking()},201);
  }catch{return json({error:"Could not save reaction"},503)}
}
