import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ["", 1],
    ["/about-us", 0.8],
    ["/order-online", 0.9],
    ["/contact-us", 0.7]
  ].map(([path, priority]) => ({
    url: `https://shalimarcurries.com${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority
  })) as MetadataRoute.Sitemap;
}
