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
    const targetLlamaUrl = process.env.LLAMA3_API_URL || process.env.OLLAMA_HOST || "http://localhost:11434";
    const targetLlamaApiKey = process.env.LLAMA3_API_KEY || "";
    const targetModel = process.env.LLAMA3_MODEL || "llama3";

    let endpoint = targetLlamaUrl.trim();
    let isOllama = false;
    let ollamaBaseUrl = endpoint;

    if (ollamaBaseUrl.endsWith("/api/chat")) {
      ollamaBaseUrl = ollamaBaseUrl.replace(/\/api\/chat$/, "");
      isOllama = true;
    } else if (ollamaBaseUrl.endsWith("/v1/chat/completions")) {
      ollamaBaseUrl = ollamaBaseUrl.replace(/\/v1\/chat\/completions$/, "");
    } else if (ollamaBaseUrl.includes("11434") || ollamaBaseUrl.includes("/api")) {
      isOllama = true;
    }

    let finalModel = targetModel;

    if (isOllama) {
      // Clean base URL for tags and chat API
      ollamaBaseUrl = ollamaBaseUrl.replace(/\/$/, "");
      endpoint = ollamaBaseUrl + "/api/chat";

      try {
        const tagsController = new AbortController();
        const tagsTimeout = setTimeout(() => tagsController.abort(), 4000); // 4s fast check

        const tagsResponse = await fetch(`${ollamaBaseUrl}/api/tags`, {
          signal: tagsController.signal
        });
        clearTimeout(tagsTimeout);

        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          const availableModels = tagsData.models || [];
          if (availableModels.length > 0) {
            const matchingModel = availableModels.find((m: any) => 
              (m.name || "").toLowerCase().includes(targetModel.toLowerCase()) || 
              (m.model || "").toLowerCase().includes(targetModel.toLowerCase())
            );

            if (matchingModel) {
              finalModel = matchingModel.name;
            } else {
              finalModel = availableModels[0].name;
            }
          }
        }
      } catch (err: any) {
        console.warn("Could not check Ollama tags on view:", err);
      }
    } else {
      if (!endpoint.endsWith("/v1/chat/completions")) {
        endpoint = endpoint.replace(/\/$/, "") + "/v1/chat/completions";
      }
    }

    const systemPrompt = `You are a high-performance in-app browser viewer. Convert the raw text from "${url}" into a clean, beautiful, and complete reader view formatted in pristine Markdown.
Include headings, clear bullet points, lists, and bold key concepts where appropriate. Do not add any conversational meta-text, introductions, or system-level notes. Start directly with the main article/page title.`;

    const userPrompt = `Page Title: ${title}\nURL: ${url}\n\nRaw Extracted Web Content:\n${bodyText}`;

    let summaryMarkdown = "";

    try {
      const vpsBody = isOllama
        ? {
            model: finalModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            options: {
              temperature: 0.2,
              num_predict: 2000
            },
            stream: false
          }
        : {
            model: finalModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 2000
          };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s robust timeout

      const vpsResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(targetLlamaApiKey ? { "Authorization": `Bearer ${targetLlamaApiKey}` } : {})
        },
        body: JSON.stringify(vpsBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
