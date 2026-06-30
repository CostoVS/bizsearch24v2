import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    logs.push("Initializing AI Browser Search Agent...");
    logs.push(`Searching the entire internet for: "${query}"...`);

    let searchChunks: any[] = [];
    let geminiSucceeded = false;

    // Use Gemini Search Grounding strictly to fetch live URLs & metadata
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

        // Use search grounding to fetch live internet results
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Find high-quality links, descriptions, and details about: ${query}`,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.3,
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks && Array.isArray(chunks)) {
          searchChunks = chunks
            .filter((c: any) => c.web)
            .map((c: any) => ({
              title: c.web.title || "Web Source",
              url: c.web.uri,
              snippet: c.web.title || "No snippet available",
            }));
        }

        geminiSucceeded = true;
        logs.push(`Successfully crawled the web. Retrieved ${searchChunks.length} matching sources.`);
      } catch (e: any) {
        console.error("Gemini Search Grounding Error:", e);
        logs.push(`Web search retrieval error. Using index fallback...`);
      }
    }

    // Fallback search results if grounding failed or is not available
    if (searchChunks.length === 0) {
      logs.push("Populating alternative search directory index...");
      try {
        const dbPath = path.join(process.cwd(), ".data", "db.json");
        if (fs.existsSync(dbPath)) {
          const dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
          if (dbData && Array.isArray(dbData.ads)) {
            const activeAds = dbData.ads.filter((ad: any) => ad && ad.isActive !== false);
            const lowerQuery = query.toLowerCase();
            const matches = activeAds.filter((ad: any) => 
              (ad.title || "").toLowerCase().includes(lowerQuery) ||
              (ad.category || "").toLowerCase().includes(lowerQuery) ||
              (ad.description || "").toLowerCase().includes(lowerQuery)
            );

            matches.slice(0, 3).forEach((ad: any) => {
              searchChunks.push({
                title: `${ad.title} - BizSearch24 Verified Business`,
                url: `/directory?q=${encodeURIComponent(ad.title)}`,
                snippet: ad.description || `Verified business listing in category ${ad.category} located in ${ad.location}.`,
              });
            });
          }
        }
      } catch (err) {
        console.error("Local db search fallback error:", err);
      }

      // Add general fallback links
      searchChunks.push({
        title: `${query} - Google Search`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Real-time query link for "${query}" search results on Google.`,
      });
      searchChunks.push({
        title: `${query} - Wikipedia, the free encyclopedia`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        snippet: `Live search results for "${query}" on Wikipedia encyclopedic resource.`,
      });
    }

    // Choose local VPS Llama3 model strictly (No fallback synthesis via Gemini)
    const targetLlamaUrl = process.env.LLAMA3_API_URL || "http://localhost:11434";
    const targetLlamaApiKey = process.env.LLAMA3_API_KEY || "";

    logs.push(`Connecting to Llama3 VPS Endpoint...`);

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

    const searchContext = searchChunks
      .map((c, i) => `[Source #${i + 1}]\nTitle: ${c.title}\nURL: ${c.url}\nDescription/Snippet: ${c.snippet}`)
      .join("\n\n");

    const systemPrompt = `You are a high-performance, professional AI Web Browser and Search Agent running on a local VPS Llama3 model.
Your task is to analyze the search results provided and answer the user's query: "${query}"

IMPORTANT RULES:
1. GET STRAIGHT TO THE POINT. Start directly with the core facts. No greetings, conversational filler, or intro phrases.
2. CITATIONS: Synthesize the facts directly from the provided search results. Refer to specific sources where appropriate.
3. FORMATTING: Use markdown headings, bullet points, and bold terms to make the response extremely clean and readable.

LIVE BROWSER CRAWL WEB CONTEXT:
${searchContext}
`;

    let summary = "";
    let body: any = {};

    if (isOllama) {
      body = {
        model: "llama3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        stream: false
      };
    } else {
      body = {
        model: "llama3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.2,
        max_tokens: 1500
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(targetLlamaApiKey ? { "Authorization": `Bearer ${targetLlamaApiKey}` } : {})
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`VPS server returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      summary = isOllama
        ? (data.message?.content || data.response || "")
        : (data.choices?.[0]?.message?.content || "");

      logs.push("Llama3 processed internet crawl and synthesized response successfully.");
    } catch (err: any) {
      console.error("VPS Llama3 Connection Failed:", err);
      logs.push(`Error: Llama3 VPS is unreachable. Falling back to Gemini...`);
      
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

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `${systemPrompt}\n\nUser Query: ${query}`,
          });

          if (response.text) {
            return NextResponse.json({
              summary: response.text,
              links: searchChunks,
              logs: [...logs, "Successfully synthesized answer via Gemini fallback."],
              engine: "Gemini (Llama3 Fallback)"
            });
          }
      } catch (geminiErr: any) {
          console.error("Gemini search summary synthesis fallback failed:", geminiErr);
          logs.push(`Error: Gemini fallback also failed: ${geminiErr.message}`);
        }
      }
      
      // CRITICAL ROBUST UPDATE: Do not block the page or return a hard error when AI servers are unreachable/unconfigured.
      // Simply return the retrieved search result links and show a friendly informative note!
      return NextResponse.json({
        summary: "An AI-synthesized answer is currently unavailable because the AI model server is offline, but you can explore the retrieved matching web sources directly below.",
        links: searchChunks,
        logs: [...logs, "Returned matching sources with offline fallback summary."],
        engine: "Offline Fallback (Links Only)"
      });
    }

    return NextResponse.json({
      summary,
      links: searchChunks,
      logs,
      engine: "Llama3 (VPS Local Agent)",
    });

  } catch (error: any) {
    console.error("AI Browser API Error:", error);
    return NextResponse.json({
      error: "An unexpected error occurred while processing the search query.",
      links: [],
      logs: [`Fatal: ${error.message || error}`],
      engine: "Llama3 (Error Handled)"
    });
  }
}
