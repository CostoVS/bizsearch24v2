import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  try {
    const { query, focus = "all" } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    logs.push("Initializing AI Search Agent...");
    
    let searchChunks: any[] = [];
    
    if (focus === "writing") {
      logs.push("Focus Mode: Writing assistant activated. Skipping web search crawl...");
    } else if (focus === "directory") {
      logs.push("Focus Mode: Local South African Directory index activated...");
      // Strictly search our verified db.json
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
              (ad.description || "").toLowerCase().includes(lowerQuery) ||
              (ad.location || "").toLowerCase().includes(lowerQuery)
            );

            matches.slice(0, 8).forEach((ad: any) => {
              searchChunks.push({
                title: `${ad.title} - BizSearch24 Verified Business`,
                url: `/directory?q=${encodeURIComponent(ad.title)}`,
                snippet: `Category: ${ad.category}. Location: ${ad.location || "South Africa"}. Phone: ${ad.phone || "N/A"}. Services: ${ad.servicesOffered || "N/A"}. Description: ${ad.description}`,
              });
            });
            logs.push(`Successfully indexed local dataset. Found ${searchChunks.length} matching directory listings.`);
          }
        }
      } catch (err) {
        console.error("Local index search error:", err);
      }
    } else {
      // General web searches, Academic, or Discussions
      let searchQuery = query;
      if (focus === "academic") {
        searchQuery = `${query} research paper academic article scholarly studies wikipedia`;
        logs.push("Focus Mode: Scholastic & Academic crawl activated...");
      } else if (focus === "discussions") {
        searchQuery = `${query} site:reddit.com OR site:stackoverflow.com OR site:quora.com OR forum`;
        logs.push("Focus Mode: Discussions & Forum crawl activated...");
      } else {
        logs.push(`Searching the entire internet for: "${query}"...`);
      }

      // Use Gemini search grounding to fetch live internet results/metadata
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
            contents: `Retrieve precise search results, links, and text details for the query: ${searchQuery}`,
            config: {
              tools: [{ googleSearch: {} }],
              temperature: 0.2,
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

          logs.push(`Successfully crawled the web. Retrieved ${searchChunks.length} matching sources.`);
        } catch (e: any) {
          console.error("Search Grounding Error:", e);
          logs.push(`Web search retrieval timeout. Using index fallback...`);
        }
      }
    }

    // Fallback search results if no chunks were loaded
    if (searchChunks.length === 0 && focus !== "writing") {
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
        console.error("Local db fallback error:", err);
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
    const targetLlamaUrl = process.env.LLAMA3_API_URL || process.env.OLLAMA_HOST || "http://localhost:11434";
    const targetLlamaApiKey = process.env.LLAMA3_API_KEY || "";
    const targetModel = process.env.LLAMA3_MODEL || "llama3";

    logs.push(`Connecting to Llama3 VPS Agent Endpoint...`);

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

Focus Mode context for this query: ${focus.toUpperCase()}

IMPORTANT RULES:
1. GET STRAIGHT TO THE POINT. Start directly with the core facts. No greetings, conversational filler, or intro phrases.
2. CITATIONS: Synthesize the facts directly from the provided search results. Refer to specific sources where appropriate.
3. FORMATTING: Use markdown headings, bullet points, and bold terms to make the response extremely clean and readable.

LIVE BROWSER CRAWL WEB CONTEXT:
${focus === "writing" ? "No web crawl required for writing focus mode." : searchContext}
`;

    let summary = "";
    let engineUsed = "Llama3 (VPS Local Agent)";

    let body: any = {};
    if (isOllama) {
      body = {
        model: targetModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        stream: false
      };
    } else {
      body = {
        model: targetModel,
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
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

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
      logs.push(`Error: Llama3 VPS is unreachable. Connection failed to: ${targetLlamaUrl}`);
      summary = `The AI Search Engine was unable to reach your local Llama3 VPS server.

Please verify that:
1. Your VPS is online and Ollama / LLM provider is running.
2. The **LLAMA3_API_URL** environment variable is configured correctly (current: \`${targetLlamaUrl}\`).
3. There is no network or firewall blocking incoming connections.

You can still use the **Live Page Sandbox** on the right side or view the compiled search matches directly below.`;
      engineUsed = "Offline Fallback";
    }

    return NextResponse.json({
      summary,
      links: searchChunks,
      logs,
      engine: engineUsed
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
