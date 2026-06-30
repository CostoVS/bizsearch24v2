import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    return await handleView(url);
  } catch (err: any) {
    console.error("In-App View fetch error:", err);
    return NextResponse.json({
      error: `Failed to load webpage content: ${err.message || err}`
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    return await handleView(url);
  } catch (err: any) {
    console.error("In-App View fetch error:", err);
    return NextResponse.json({
      error: `Failed to load webpage content: ${err.message || err}`
    }, { status: 500 });
  }
}

async function handleView(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout for fetching target website

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Web server returned HTTP status ${response.status}`);
    }

    const html = await response.text();

    // Simple parser to extract title and body text
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "Webpage View";

    // Clean body text from scripts, styles, and html tags
    let bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Truncate text for prompt token safety
    const maxLength = 6000;
    if (bodyText.length > maxLength) {
      bodyText = bodyText.substring(0, maxLength) + "... [truncated]";
    }

    // Now, run Llama3 VPS model to extract the main content into beautiful Markdown
    const targetLlamaUrl = process.env.LLAMA3_API_URL || "http://localhost:11434";
    const targetLlamaApiKey = process.env.LLAMA3_API_KEY || "";

    let endpoint = targetLlamaUrl;
    let isOllama = false;

    if (!endpoint.endsWith("/v1/chat/completions") && !endpoint.endsWith("/api/chat")) {
      if (endpoint.includes("11434") || endpoint.includes("/api")) {
        endpoint = endpoint.replace(/\/$/, "") + "/api/chat";
        isOllama = true;
      } else {
        endpoint = endpoint.replace(/\/$/, "") + "/v1/chat/completions";
      }
    } else if (endpoint.endsWith("/api/chat")) {
      isOllama = true;
    }

    const systemPrompt = `You are a high-performance in-app browser viewer. Convert the raw text from "${url}" into a clean, beautiful, and complete reader view formatted in pristine Markdown.
Include headings, clear bullet points, lists, and bold key concepts where appropriate. Do not add any conversational meta-text, introductions, or system-level notes. Start directly with the main article/page title.`;

    const userPrompt = `Page Title: ${title}\nURL: ${url}\n\nRaw Extracted Web Content:\n${bodyText}`;

    let summaryMarkdown = "";

    try {
      const vpsBody = isOllama
        ? {
            model: "llama3",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            stream: false
          }
        : {
            model: "llama3",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 2000
          };

      const vpsResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(targetLlamaApiKey ? { "Authorization": `Bearer ${targetLlamaApiKey}` } : {})
        },
        body: JSON.stringify(vpsBody)
      });

      if (vpsResponse.ok) {
        const data = await vpsResponse.json();
        summaryMarkdown = isOllama
          ? (data.message?.content || data.response || "")
          : (data.choices?.[0]?.message?.content || "");
      }
    } catch (vpsErr: any) {
      console.error("Llama3 VPS webpage translation failed, trying Gemini:", vpsErr);
    }

    // Fallback if VPS fails
    if (!summaryMarkdown) {
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const geminiResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `${systemPrompt}\n\n${userPrompt}`,
          });

          summaryMarkdown = geminiResponse.text || "";
        } catch (geminiErr) {
          console.error("Gemini reader fallback failed:", geminiErr);
        }
      }
    }

    if (!summaryMarkdown) {
      summaryMarkdown = `# ${title}\n\n*Parsed from [source link](${url})*\n\n${bodyText.substring(0, 1500)}...`;
    }

    return NextResponse.json({
      title,
      url,
      markdown: summaryMarkdown
    });
  } catch (err: any) {
    console.error("In-App View fetch error during processing:", err);
    return NextResponse.json({
      error: `Failed to load webpage content: ${err.message || err}`
    }, { status: 500 });
  }
}
