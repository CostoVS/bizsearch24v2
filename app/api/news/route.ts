import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "south-africa";
  const category = searchParams.get("category") || "general";

  try {
    const prompt = `Fetch the latest ${category} news for ${region} from today and the last 24 hours. 
    Provide a list of 5 news stories. 
    For each story, provide:
    1. A catchy headline.
    2. A concise 2-sentence summary.
    3. The primary source name.
    4. The URL to the original article if possible (use grounding links).
    5. A suitable category (e.g., Politics, Business, Technology, Sports, Health).
    
    Ensure the news is strictly relevant to ${region === 'south-africa' ? 'South Africa' : 'international events'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  source: { type: Type.STRING },
                  url: { type: Type.STRING },
                  category: { type: Type.STRING },
                  timestamp: { type: Type.STRING }
                },
                required: ["headline", "summary", "source", "category"]
              }
            }
          }
        }
      }
    });

    const newsData = JSON.parse(response.text || '{"news": []}');
    
    // Supplement with grounding URLs if missing in JSON but present in metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && newsData.news) {
      newsData.news = newsData.news.map((item: any, index: number) => {
        if (!item.url && groundingChunks[index]?.web?.uri) {
          item.url = groundingChunks[index].web.uri;
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
