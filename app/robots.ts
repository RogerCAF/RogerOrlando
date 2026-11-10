import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute { return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://rogerorlando.nl/sitemap.xml" }; }
