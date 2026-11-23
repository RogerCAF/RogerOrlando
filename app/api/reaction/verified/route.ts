import { get, list, put } from "@vercel/blob";
import { randomUUID, randomInt } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = "the-bureau/mongo-reaction/verified/v2/";
const SESSIONS = ROOT + "sessions/";
const CLAIMS = ROOT + "claims/";
const SCORES = ROOT + "scores/";
type Entry = { name: string; ms: number; at: string };
const respond = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const safeName = (raw: unknown) => typeof raw === "string" && /^[A-Z0-9 _-]{1,12}$/.test(raw.trim().toUpperCase()) ? raw.trim().toUpperCase() : null;

async function ranking(): Promise<Entry[]> {
  const items: Entry[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 15; page++) {
    const result = await list({ prefix: SCORES, limit: 100, cursor });
    for (const blob of result.blobs) {
      const m = /^([0-9]{2,5})-([A-Za-z0-9_-]{1,40})-[a-f0-9-]{36}\.json$/.exec(blob.pathname.slice(SCORES.length));
      if (!m) continue;
      let name: string;
      try { name = Buffer.from(m[2], "base64url").toString("utf8"); } catch { continue; }
      const ms=Number(m[1]), normalized=safeName(name);
      if (normalized && ms>=80 && ms<=10000) items.push({name:normalized,ms,at:blob.uploadedAt.toISOString()});
    }
    if (!result.hasMore) break;
    cursor=result.cursor;
  }
  return items.sort((a,b)=>a.ms-b.ms||a.at.localeCompare(b.at)).slice(0,10);
}
export async function GET() {
  try { return respond({mode:"server-verified",entries:await ranking()}); }
  catch { return respond({error:"Leaderboard offline"},503); }
}
export async function POST(request:Request) {
  const origin=request.headers.get("origin"),host=request.headers.get("x-forwarded-host")||request.headers.get("host");
  if(origin&&host){try{if(new URL(origin).host!==host)return respond({error:"Origin rejected"},403)}catch{return respond({error:"Invalid origin"},403)}}
  if(!request.headers.get("content-type")?.startsWith("application/json"))return respond({error:"Send JSON"},415);
  let body:Record<string,unknown>;
  try{const raw=await request.text();if(raw.length>256)return respond({error:"Too large"},413);body=JSON.parse(raw);if(!body||typeof body!=="object"||Array.isArray(body))return respond({error:"Invalid JSON"},400)}catch{return respond({error:"Invalid JSON"},400)}
  if(body.action==="start"){
    const id=randomUUID(),waitMs=randomInt(1500,4101),startedAt=Date.now();
    try{
      await put(SESSIONS+id+".json",JSON.stringify({startedAt,waitMs}),{access:"private",contentType:"application/json",addRandomSuffix:false,allowOverwrite:false});
      return respond({id,waitMs},201);
    }catch{return respond({error:"Could not start verified round"},503)}
  }
  if(body.action!=="finish"||typeof body.id!=="string"||!/^[a-f0-9-]{36}$/.test(body.id))return respond({error:"Invalid round"},400);
  const name=safeName(body.name);
  if(!name)return respond({error:"Invalid name"},400);
  const id=body.id,stoppedAt=Date.now();
  try{
    const session=await get(SESSIONS+id+".json",{access:"private"});
    if(!session||session.statusCode!==200)return respond({error:"Unknown round"},404);
    const data=await new Response(session.stream).json() as {startedAt:number;waitMs:number};
    if(!Number.isFinite(data.startedAt)||!Number.isFinite(data.waitMs)||data.waitMs<1500||data.waitMs>4100)return respond({error:"Invalid session"},400);
    const elapsed=stoppedAt-data.startedAt-data.waitMs;
    if(stoppedAt-data.startedAt>20000)return respond({error:"Round expired"},409);
    if(elapsed<80||elapsed>10000)return respond({error:elapsed<80?"Too early or implausibly fast":"Round outside range"},409);
    // An immutable claim prevents reusing the same round/session for new scores.
    try{await put(CLAIMS+id+".json",JSON.stringify({done:stoppedAt}),{access:"private",contentType:"application/json",addRandomSuffix:false,allowOverwrite:false})}
    catch{return respond({error:"Round already submitted"},409)}
    const ms=Math.round(elapsed), current=await ranking();
    if(current.length>=10&&ms>=current[9].ms)return respond({saved:false,ms,entries:current});
    const path=SCORES+ms+"-"+Buffer.from(name).toString("base64url")+"-"+randomUUID()+".json";
    await put(path,JSON.stringify({name,ms,at:new Date().toISOString()}),{access:"private",contentType:"application/json",addRandomSuffix:false,allowOverwrite:false});
    return respond({saved:true,ms,entries:await ranking()},201);
  }catch{return respond({error:"Verification temporarily unavailable"},503)}
}
