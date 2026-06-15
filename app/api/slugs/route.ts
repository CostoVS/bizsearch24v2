import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SLUGS_FILE = path.join(process.cwd(), "lib", "custom-slugs.json");

function getCustomSlugs(): any[] {
  try {
    if (fs.existsSync(SLUGS_FILE)) {
      const data = fs.readFileSync(SLUGS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read custom-slugs.json:", error);
  }
  return [];
}

function saveCustomSlugs(slugs: any[]) {
  try {
    const dir = path.dirname(SLUGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SLUGS_FILE, JSON.stringify(slugs, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write custom-slugs.json:", error);
  }
}

export async function GET() {
  const slugs = getCustomSlugs();
  return NextResponse.json({ success: true, slugs });
}

export async function POST(req: NextRequest) {
  try {
    const {
      slug,
      province,
      city,
      properName,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoGeoRegion,
      seoMainHeading,
      seoContentSnippet,
    } = await req.json();

    if (!slug || !province || !city) {
      return NextResponse.json(
        { error: "Slug, Province, and City/Town are required." },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!cleanSlug) {
      return NextResponse.json({ error: "Invalid slug name." }, { status: 400 });
    }

    const slugs = getCustomSlugs();
    const existingIndex = slugs.findIndex(
      (s) => s.slug.toLowerCase() === cleanSlug
    );

    const slugObj = {
      slug: cleanSlug,
      province,
      city: city.trim(),
      properName: (properName || city).trim(),
      seoTitle: (seoTitle || "").trim(),
      seoDescription: (seoDescription || "").trim(),
      seoKeywords: (seoKeywords || "").trim(),
      seoGeoRegion: (seoGeoRegion || "").trim(),
      seoMainHeading: (seoMainHeading || "").trim(),
      seoContentSnippet: (seoContentSnippet || "").trim(),
      createdAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      slugs[existingIndex] = slugObj; // Edit/Update current slug
    } else {
      slugs.push(slugObj); // Create new
    }

    saveCustomSlugs(slugs);

    return NextResponse.json({ success: true, slug: slugObj });
  } catch (error) {
    console.error("Error saving slug:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slugToDelete = url.searchParams.get("slug")?.trim()?.toLowerCase();

    if (!slugToDelete) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const slugs = getCustomSlugs();
    const filtered = slugs.filter((s) => s.slug.toLowerCase() !== slugToDelete);

    saveCustomSlugs(filtered);

    return NextResponse.json({
      success: true,
      message: `Slug '${slugToDelete}' deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting slug:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
