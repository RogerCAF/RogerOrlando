// The Bureau guestbook — Next.js App Router endpoint.
// Visitors' public signatures are stored as comments on a dedicated GitHub issue.
// Required Vercel server-side environment variable: GITHUB_TOKEN (Issues: read/write).
// Optional: GITHUB_REPO and GITHUB_ISSUE_NUMBER.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREFIX = "THE_BUREAU_GUEST_V1:";
const MAX_ENTRIES = 1000;
const MAX_VISIBLE = 100;
const DEFAULT_REPO = "RogerCAF/RogerOrlando";
const DEFAULT_ISSUE = 44;

type Entry = { name: string; date: string; id: number };
type GitHubComment = { id: number; body: string; created_at: string };

function reply(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value
    .normalize("NFC")
    .replace(/[\r\n\t\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (name.length < 2 || name.length > 32) return null;
  return /^[\p{L}\p{M}\p{N} ._'’\-]+$/u.test(name) ? name : null;
}

const keyFor = (name: string) => name.normalize("NFC").toLocaleLowerCase("nl").trim();

function config() {
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const issue = Number(process.env.GITHUB_ISSUE_NUMBER || DEFAULT_ISSUE);
  const token = process.env.GITHUB_TOKEN || "";
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !Number.isSafeInteger(issue) || issue < 1 || !token) {
    return null;
  }
  return { repo, issue, token };
}

async function github(url: string, cfg: NonNullable<ReturnType<typeof config>>, init?: RequestInit) {
  const result = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "the-bureau-guestbook",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!result.ok) throw new Error(`GitHub request failed: ${result.status}`);
  return result.json();
}

async function entries(cfg: NonNullable<ReturnType<typeof config>>): Promise<Entry[]> {
  const root = `https://api.github.com/repos/${cfg.repo}/issues/${cfg.issue}/comments`;
  const output: Entry[] = [];
  for (let page = 1; page <= Math.ceil(MAX_ENTRIES / 100); page++) {
    const comments = (await github(`${root}?per_page=100&page=${page}`, cfg)) as GitHubComment[];
    if (!Array.isArray(comments)) throw new Error("Invalid GitHub response");
    for (const comment of comments) {
      if (typeof comment.body !== "string" || !comment.body.startsWith(PREFIX)) continue;
      const name = cleanName(comment.body.slice(PREFIX.length));
      if (name) output.push({ name, date: String(comment.created_at).slice(0, 10), id: comment.id });
    }
    if (comments.length < 100) break;
  }
  return output;
}

export async function GET() {
  const cfg = config();
  if (!cfg) return reply({ mode: "not_configured", error: "Guestbook needs a server-side GitHub token." }, 503);
  try {
    const all = await entries(cfg);
    return reply({ mode: "shared", entries: all.slice(-MAX_VISIBLE), total: all.length });
  } catch {
    return reply({ error: "Could not load the guestbook." }, 502);
  }
}

export async function POST(request: Request) {
  const cfg = config();
  if (!cfg) return reply({ mode: "not_configured", error: "Guestbook needs a server-side GitHub token." }, 503);

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return reply({ error: "Cross-origin signing is disabled." }, 403);
    } catch {
      return reply({ error: "Invalid request origin." }, 403);
    }
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return reply({ error: "JSON required." }, 415);
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 512) return reply({ error: "Request is too large." }, 413);
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "Invalid JSON." }, 400);
  }
  const name = cleanName(body && typeof body === "object" && "name" in body ? (body as { name: unknown }).name : null);
  if (!name) return reply({ error: "Use one name of 2–32 characters." }, 400);

  try {
    const all = await entries(cfg);
    if (all.length >= MAX_ENTRIES) return reply({ error: "The guestbook is full." }, 409);
    if (all.some((entry) => keyFor(entry.name) === keyFor(name))) {
      return reply({ error: "This name has already signed." }, 409);
    }
    const url = `https://api.github.com/repos/${cfg.repo}/issues/${cfg.issue}/comments`;
    const comment = (await github(url, cfg, { method: "POST", body: JSON.stringify({ body: PREFIX + name }) })) as GitHubComment;
    const added = { name, date: String(comment.created_at).slice(0, 10), id: comment.id };
    return reply({ mode: "shared", entries: all.concat([added]).slice(-MAX_VISIBLE) }, 201);
  } catch {
    return reply({ error: "Saving the signature failed. Check GitHub token permissions." }, 502);
  }
}
