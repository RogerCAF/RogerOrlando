import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute { return [{ url: "https://rogerorlando.nl", lastModified: new Date(), changeFrequency: "monthly", priority: 1 }]; }
