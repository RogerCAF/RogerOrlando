import type { NextConfig } from "next";

// Security headers shared by the portfolio, its same-origin Bureau iframe,
// games and the public guestbook. Keep framing SAMEORIGIN: the portfolio
// embeds /bureau/index.html and accesses that frame from the parent page.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    // Limit high-risk embedding, base URL rewrites and form exfiltration.
    // Do not restrict script/style sources here until the interactive Bureau's
    // inline runtime and style injection have been audited end to end.
    value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
