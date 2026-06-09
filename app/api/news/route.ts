import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "south-africa";
  const category = searchParams.get("category") || "general";

  try {
    // 1. We still use Gemini Search Grounding to FIND the real links (since Ollama is offline)
    const searchPrompt = `Find the 5 latest news stories for ${category} in ${region} from the last 24 hours. Return exactly 5 items.`;
    
    const searchResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const rawContext = searchResponse.text;
    const sources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // 2. We use your local Ollama (llama3) to SUMMARIZE the news into the specific JSON format
    const ollamaHost = process.env.OLLAMA_HOST || "http://host.docker.internal:11434";
    
    const ollamaPrompt = `
      You are a news curator for BizSearch24.
      Context from latest news: ${rawContext}
      
      Summarize the 5 news stories found in the context above into a JSON array named "news".
      Each object must have:
      - "headline": Catchy title
      - "summary": 2-sentence professional summary
      - "source": Name of news outlet
      - "category": (Politics, Business, Tech, Sports, etc.)
      
      Respond only with valid JSON.
    `;

    const ollamaResponse = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: "llama3",
        prompt: ollamaPrompt,
        stream: false,
        format: "json"
      }),
    });

    const ollamaData = await ollamaResponse.json();
    const newsData = JSON.parse(ollamaData.response);

    // 3. Attach the links we found during the search
    if (newsData.news) {
      newsData.news = newsData.news.map((item: any, index: number) => {
        if (sources[index]?.web?.uri) {
          item.url = sources[index].web.uri;
        }
        return item;
      });
    }

    return NextResponse.json(newsData);
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch news", news: [] }, { status: 500 });
  }
}
