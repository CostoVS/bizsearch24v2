import { SA_PROVINCES } from "@/lib/locations";
import { NextResponse } from "next/server";

export async function GET() {
  const domain = "https://bizsearch24.co.za";

  // Static URLs
  const staticPaths = [
    "",
    "/news",
    "/terms",
    "/directory",
    "/sitemap",
    "/login",
  ];

  const staticUrls = staticPaths.map(
    path => `  <url>
    <loc>${domain}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  );

  // Province URLs
  const provinceUrls = SA_PROVINCES.map(
    prov => `  <url>
    <loc>${domain}/${prov.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  );

  // Town URLs
  const townUrls = SA_PROVINCES.flatMap(prov =>
    prov.towns.map(town => {
      const townSlug = town.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]+/g, '');
      return `  <url>
    <loc>${domain}/${townSlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${provinceUrls.join("\n")}
${townUrls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=18000"
    },
  });
}
