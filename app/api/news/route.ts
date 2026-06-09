import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "south-africa";
  const category = searchParams.get("category") || "general";

  try {
    const ollamaHost = process.env.OLLAMA_HOST || "http://host.docker.internal:11434";
    
    const ollamaPrompt = `You are a professional real-time news curation engine for BizSearch24, the premier business search directory.
Your job is to generate the 5 latest, highly realistic, and timely news articles for the category "${category}" in region "${region}".

Since this is running in real-time, generate realistic news articles that could be published today (Year 2026).
For each article, include:
1. "headline": A professional, non-sensational, highly realistic headline.
2. "summary": A well-written, 2-sentence summary summarizing the key details, events, and impacts.
3. "source": A highly credible and real news source for this region or category. Examples:
   - South Africa/Business: Fin24, BusinessDay, Daily Maverick, Moneyweb, TechCentral.
   - South Africa/General: News24, Daily Maverick, IOL, Citizen, EWN.
   - International/Business & General: Reuters, Bloomberg, BBC News, TechCrunch, CNBC, Financial Times.
4. "url": A realistic, professional-looking article URL from that publisher.
5. "category": Categorized exactly as "${category}".

The response MUST be a single clean JSON object containing a "news" property with an array of exactly 5 articles.
JSON Structure:
{
  "news": [
    {
      "headline": "...",
      "summary": "...",
      "source": "...",
      "url": "...",
      "category": "..."
    }
  ]
}

DO NOT include any conversational text before or after the JSON. Only output valid JSON.`;

    const ollamaResponse = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: ollamaPrompt,
        stream: false,
        format: "json"
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama responded with status: ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    let newsData;
    
    try {
      newsData = JSON.parse(ollamaData.response);
    } catch (parseError) {
      console.error("Failed to parse Ollama response as JSON:", ollamaData.response);
      const match = ollamaData.response.match(/\{[\s\S]*\}/);
      if (match) {
        newsData = JSON.parse(match[0]);
      } else {
        throw parseError;
      }
    }

    if (!newsData || !Array.isArray(newsData.news)) {
      if (Array.isArray(newsData)) {
        newsData = { news: newsData };
      } else {
        newsData = { news: [] };
      }
    }

    return NextResponse.json(newsData);
  } catch (error) {
    console.error("News fetch error from Ollama:", error);
    // Return sample news data as a fallback so the page doesn't break if Ollama is starting up or temporarily offline
    const sampleNews = [
      {
        headline: `Latest ${category} updates in ${region === 'south-africa' ? 'South Africa' : 'Global Markets'}`,
        summary: "Our real-time News Pulse feed is updating. Please check back in a few moments for complete, detailed coverage of this topic.",
        source: "BizSearch24 Newsroom",
        url: "#",
        category: category
      },
      {
        headline: `${category} Focus: Navigating the changing landscape`,
        summary: "As market dynamics evolve, experts suggest keeping a close eye on regulatory shifts and technological advancements which will shape industry priorities over the coming quarters.",
        source: "BizSearch24 Analytics",
        url: "#",
        category: category
      }
    ];
    return NextResponse.json({ news: sampleNews });
  }
}

