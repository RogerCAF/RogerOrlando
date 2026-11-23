import { list, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const PREFIX="the-bureau/kayas-button/all-time/v1/";
type Entry={name:string;ms:number;deviation:number;at:string};
function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
const safeName=(v:unknown)=>typeof v==="string"&&/^[A-Z0-9 _-]{1,12}$/.test(v.trim().toUpperCase())?v.trim().toUpperCase():null;
async function ranking():Promise<Entry[]>{
 const all:Entry[]=[];let cursor:string|undefined;
 for(let page=0;page<15;page++){
  const response=await list({prefix:PREFIX,limit:100,cursor});
  for(const b of response.blobs){
   const m=/^([0-9]{1,6})-([A-Za-z0-9_-]{1,40})-[a-f0-9-]{36}\.json$/.exec(b.pathname.slice(PREFIX.length));
   if(!m)continue;
   const ms=Number(m[1]);let name:string;
   try{name=Buffer.from(m[2],"base64url").toString("utf8")}catch{continue}
   const normalized=safeName(name);
   if(normalized&&ms>=500&&ms<=60000)all.push({name:normalized,ms,deviation:Math.abs(ms-10000),at:b.uploadedAt.toISOString()});
  }
  if(!response.hasMore)break;cursor=response.cursor;
 }
 return all.sort((a,b)=>a.deviation-b.deviation||a.at.localeCompare(b.at)).slice(0,10);
}
export async function GET(){try{return json({mode:"all-time",entries:await ranking()})}catch{return json({error:"Leaderboard unavailable"},503)}}
export async function POST(request:Request){
 const origin=request.headers.get("origin"),host=request.headers.get("x-forwarded-host")||request.headers.get("host");
 if(origin&&host){try{if(new URL(origin).host!==host)return json({error:"Origin rejected"},403)}catch{return json({error:"Invalid origin"},403)}}
 if(!request.headers.get("content-type")?.startsWith("application/json"))return json({error:"Send JSON"},415);
 let body:Record<string,unknown>;
 try{const raw=await request.text();if(raw.length>256)return json({error:"Payload too large"},413);body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=="object")return json({error:"Invalid payload"},400)}
 catch{return json({error:"Invalid payload"},400)}
 const name=safeName(body.name),ms=body.ms;
 if(!name||!Number.isInteger(ms)||(ms as number)<500||(ms as number)>60000)return json({error:"Invalid score or name"},400);
 try{
  const board=await ranking(),deviation=Math.abs((ms as number)-10000);
  if(board.length>=10&&deviation>=board[9].deviation)return json({saved:false,entries:board});
  const pathname=PREFIX+ms+"-"+Buffer.from(name,"utf8").toString("base64url")+"-"+randomUUID()+".json";
  await put(pathname,JSON.stringify({name,ms,at:new Date().toISOString()}),{access:"private",contentType:"application/json",addRandomSuffix:false,allowOverwrite:false});
  return json({saved:true,entries:await ranking()},201);
 }catch{return json({error:"Unable to persist score"},503)}
}
