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

    // Choose local VPS Llama3 model strictly (No fallback synthesis via Gemini unless fails)
    const targetLlamaUrl = process.env.LLAMA3_API_URL || process.env.OLLAMA_HOST || "http://localhost:11434";
    const targetLlamaApiKey = process.env.LLAMA3_API_KEY || "";
    const targetModel = process.env.LLAMA3_MODEL || "llama3";

    logs.push(`Connecting to Llama3 VPS Agent Endpoint at: ${targetLlamaUrl}...`);

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
        logs.push(`Querying Ollama tags on VPS to verify active models...`);
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
            logs.push(`Ollama connection verified. Found ${availableModels.length} models installed.`);
            
            // Look for best matching model
            const matchingModel = availableModels.find((m: any) => 
              (m.name || "").toLowerCase().includes(targetModel.toLowerCase()) || 
              (m.model || "").toLowerCase().includes(targetModel.toLowerCase())
            );

            if (matchingModel) {
              finalModel = matchingModel.name;
              logs.push(`Using matching installed model: "${finalModel}"`);
            } else {
              const firstModel = availableModels[0].name;
              logs.push(`Model "${targetModel}" not found on VPS. Auto-selecting first available: "${firstModel}"`);
              finalModel = firstModel;
            }
          } else {
            logs.push(`Ollama connected, but no models are installed. Defaulting to: "${targetModel}"`);
          }
        } else {
          logs.push(`Ollama tags check failed with HTTP ${tagsResponse.status}. Defaulting to: "${targetModel}"`);
        }
      } catch (err: any) {
        logs.push(`Could not check Ollama tags (${err.message || err}). Defaulting to: "${targetModel}"`);
      }
    } else {
      // Default fallback formatting for non-Ollama / OpenAI compatible endpoint
      if (!endpoint.endsWith("/v1/chat/completions")) {
        endpoint = endpoint.replace(/\/$/, "") + "/v1/chat/completions";
      }
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
    let engineUsed = isOllama ? `Ollama Llama3 (${finalModel})` : `Llama3 OpenAI-Compatible (${finalModel})`;

    let body: any = {};
    if (isOllama) {
      body = {
        model: finalModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        options: {
          temperature: 0.2,
          num_predict: 1500
        },
        stream: false
      };
    } else {
      body = {
        model: finalModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.2,
        max_tokens: 1500
      };
    }

    try {
      logs.push(`Transmitting search context to Llama3 VPS model "${finalModel}"...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s robust timeout for slow VPS

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
      console.error("VPS Llama3 Connection Failed, initiating Gemini Fallback:", err);
      logs.push(`Llama3 VPS connection failed (${err.message || err}).`);
      
      if (process.env.GEMINI_API_KEY) {
        logs.push("Activating high-availability Gemini API fallback engine...");
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
            contents: `${systemPrompt}\n\nUser Question: ${query}`,
          });

          summary = geminiResponse.text || "No synthesis returned from fallback engine.";
          engineUsed = "Gemini 3.5 Flash (Availability Fallback)";
          logs.push("Gemini processed and synthesized the response successfully.");
        } catch (geminiErr: any) {
          console.error("Gemini fallback synthesis also failed:", geminiErr);
          logs.push(`Fatal: Gemini fallback also failed (${geminiErr.message || geminiErr}).`);
          summary = `The AI Search Engine was unable to reach either your Llama3 VPS or the Gemini fallback engine.`;
          engineUsed = "Offline Fallback";
        }
      } else {
        logs.push("No Gemini API key available for fallback.");
        summary = `The AI Search Engine was unable to reach your local Llama3 VPS server.

Please verify that:
1. Your VPS is online and Ollama / LLM provider is running.
2. The **LLAMA3_API_URL** environment variable is configured correctly (current: \`${targetLlamaUrl}\`).
3. There is no network or firewall blocking incoming connections.

You can still use the **Live Page Sandbox** on the right side or view the compiled search matches directly below.`;
        engineUsed = "Offline Fallback";
      }
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
