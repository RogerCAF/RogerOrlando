export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({status:"ok",service:"roger-os-diagnostics",checkedAt:new Date().toISOString()},{
    headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
  });
}
