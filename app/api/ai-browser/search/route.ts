import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  try {
    const { query, useModel, llama3Url, llama3ApiKey } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    logs.push("Initializing AI Browser Search Agent...");
    
    // 1. PERFORM WEB SEARCH GROUNDING USING GEMINI
    logs.push("Formulating web search query...");
    logs.push(`Searching the entire internet for: "${query}"...`);

    let searchChunks: any[] = [];
    let geminiRawText = "";
    let geminiSucceeded = false;

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

        geminiRawText = response.text || "";
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
        logs.push(`Web search retrieval error: ${e.message || e}. Using fallback mock search...`);
      }
    } else {
      logs.push("GEMINI_API_KEY not configured. Simulating directory-grounded search index...");
    }

    // Fallback search results if Gemini grounding failed or is not available
    if (searchChunks.length === 0) {
      logs.push("Populating alternative search directory index...");
      // Try to load some local directory entries as custom links if relevant
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

      // Add general open-source fallbacks (Wikipedia, Google Search construct, etc.)
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
      searchChunks.push({
        title: `${query} - DuckDuckGo Private Search`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `Encrypted private search options for "${query}" on DuckDuckGo engine.`,
      });
      logs.push(`Generated ${searchChunks.length} reference portal sources.`);
    }

    // 2. CHOOSE GENERATIVE MODEL PIPELINE (VPS LLAMA3 OR FALLBACK GEMINI)
    const activeUseModel = useModel || "gemini";
    let summary = "";
    let activeEngine = "Gemini 3.5 Flash";

    // Format search results context to inject as RAG context
    const searchContext = searchChunks
      .map((c, i) => `[Source #${i + 1}]\nTitle: ${c.title}\nURL: ${c.url}\nDescription/Snippet: ${c.snippet}`)
      .join("\n\n");

    const systemPrompt = `You are a professional, high-performance AI Web Browser and Search Agent running on a South African business infrastructure.
Your task is to review the web search results provided and answer the user's query: "${query}"

IMPORTANT GUIDELINES:
1. GET STRAIGHT TO THE POINT. Provide a concise, professional, clear response that directly answers the query. No conversational fluff or preamble.
2. CITATION & SOURCES: Synthesize the facts directly from the provided search results below. Make sure to clearly reference the source links in your writing.
3. If no specific facts are available, construct a helpful roadmap on where to find this information using the provided portal links.

LIVE SEARCH RESULTS / BROWSER CRAWL WEB CONTEXT:
${searchContext}
`;

    if (activeUseModel === "llama3") {
      logs.push("Configuring Llama3 prompt context...");
      // Check the target VPS URL (either passed in or from environment)
      const targetLlamaUrl = llama3Url?.trim() || process.env.LLAMA3_API_URL || "http://localhost:11434";
      const targetLlamaApiKey = llama3ApiKey?.trim() || process.env.LLAMA3_API_KEY || "";

      logs.push(`Connecting to Llama3 VPS Endpoint: ${targetLlamaUrl}...`);

      let vpsSuccess = false;
      
      // We will attempt to call the VPS.
      // We'll try the /v1/chat/completions endpoint (standard OpenAI compatibility) 
      // and fallback to /api/chat (standard Ollama endpoint) if no endpoint is specified in the URL.
      let endpoint = targetLlamaUrl;
      let body: any = {};
      let isOllama = false;

      // Sniff whether it's an Ollama URL or OpenAI-compatible URL
      if (!endpoint.endsWith("/v1/chat/completions") && !endpoint.endsWith("/api/chat")) {
        // If it looks like a standard Ollama default host (e.g. port 11434)
        if (endpoint.includes("11434") || endpoint.includes("/api")) {
          endpoint = endpoint.replace(/\/$/, "") + "/api/chat";
          isOllama = true;
        } else {
          endpoint = endpoint.replace(/\/$/, "") + "/v1/chat/completions";
        }
      } else if (endpoint.endsWith("/api/chat")) {
        isOllama = true;
      }

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
        logs.push(`Dispatching search results and RAG query to Llama3 (${isOllama ? "Ollama API" : "OpenAI VPS API"})...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

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
        if (isOllama) {
          summary = data.message?.content || data.response || "";
        } else {
          summary = data.choices?.[0]?.message?.content || "";
        }

        if (summary) {
          vpsSuccess = true;
          activeEngine = "Llama 3 (VPS Agent)";
          logs.push("Llama3 compiled the browser crawl results successfully!");
        }
      } catch (err: any) {
        console.error("VPS Llama3 Connection Failed:", err);
        logs.push(`Llama3 VPS connection failed (${err.message || err}).`);
        logs.push("Falling back to local high-performance Gemini synthesis engine to secure response...");
      }

      if (!vpsSuccess) {
        // Fallback to Gemini but explain why
        if (geminiSucceeded && geminiRawText) {
          summary = geminiRawText;
          logs.push("Gemini engine answered instead (Llama3 VPS Offline fallback).");
        } else if (process.env.GEMINI_API_KEY) {
          logs.push("Querying fallback Gemini engine with grounded context...");
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { headers: { "User-Agent": "aistudio-build" } },
          });
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: query,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.3,
            },
          });
          summary = response.text || "No summary could be generated.";
          logs.push("Gemini processed context successfully.");
        } else {
          summary = `### Search Summary for: "${query}"\n\nPlease find your results below. We were unable to reach your local Llama3 VPS on "${targetLlamaUrl}", and the server-side Gemini Key is not set. Please check your VPS connection and configuration!`;
        }
      }
    } else {
      // Use Gemini Search Grounding directly
      logs.push("Synthesizing crawl overview with Gemini Browser Engine...");
      if (geminiRawText) {
        summary = geminiRawText;
        logs.push("Gemini completed overview compilation.");
      } else if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: query,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });
        summary = response.text || "No summary could be generated.";
        logs.push("Gemini processed context successfully.");
      } else {
        summary = `### Direct Search Overview for: "${query}"\n\nNo active AI backend key found. Here are the search links compiled by the browser agent below. Please select a link to browse manually!`;
      }
    }

    logs.push("Response rendered and browser view ready.");
    return NextResponse.json({
      summary,
      links: searchChunks,
      logs,
      engine: activeEngine,
    });

  } catch (error: any) {
    console.error("AI Browser API Error:", error);
    return NextResponse.json({
      summary: "An unexpected error occurred while processing the AI browser request.",
      links: [],
      logs: [...logs, `Fatal Error: ${error.message || error}`],
      engine: "Fallback Error Handler"
    }, { status: 200 }); // Return standard response for graceful UI rendering
  }
}
