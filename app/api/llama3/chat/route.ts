import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Force dynamic execution so it parses live listings in real-time
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { text: "Johannesburg VPS LLaMA3 Core NLP Engine is currently offline. Missing API Key." },
        { status: 500 }
      );
    }

    // Load actual real-time business data from local JSON database to prevent stale / mock data
    const dbPath = path.join(process.cwd(), ".data", "db.json");
    let activeAds: any[] = [];
    try {
      if (fs.existsSync(dbPath)) {
        const dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        if (dbData && Array.isArray(dbData.ads)) {
          // Filter to active ads
          activeAds = dbData.ads.filter((ad: any) => ad && ad.isActive !== false);
        }
      }
    } catch (e) {
      console.error("LLaMA3 Chat: Failed to load db.json, using fallback listings", e);
    }

    // Format active ads for system instruction context
    const adsContext = activeAds.map((ad, idx) => {
      return `[Listing #${idx + 1}]
- Title: ${ad.title || "N/A"}
- Category: ${ad.category || "N/A"}
- Location: ${ad.location || "N/A"}, ${ad.province || "N/A"}
- Address: ${ad.address || "N/A"}
- Description: ${ad.description || "N/A"}
- Services: ${ad.servicesOffered || "N/A"}
- Phone: ${ad.phone || "N/A"}
- WhatsApp: ${ad.whatsapp || "N/A"}
- Email: ${ad.email || "N/A"}
- Preferred Contact Method: ${ad.preferredContact || "N/A"}
- Badges & Status: Verified: ${ad.verified ? "YES" : "NO"}, Premium: ${ad.isPremium ? "YES" : "NO"}, Sponsored/Partner: ${ad.isSponsor ? "YES" : "NO"}, Claimed: ${ad.isClaimed ? "YES" : "NO"}`;
    }).join("\n\n");

    const systemInstruction = `
You are the "Johannesburg VPS LLaMA3-8B Core NLP Engine", a custom-tuned local large language model integrated directly into the BizSearch24 Verified Local Directory for South Africa.
Your task is to help users search, verify, and inquire about businesses, directory subscriptions, and features of BizSearch24.

IMPORTANT BRANDING AND PERSONALITY RULES:
1. Always stay fully in character as the Johannesburg VPS LLaMA3-8B Core NLP Engine (a sub-millisecond local execution service).
2. Answer inquiries professionally, clearly, and concisely, keeping a helpful South African business directory assistant tone.
3. If a user asks for matching businesses, always query and recommend from the REAL, current listings provided below. Never suggest mock or fake businesses.
4. When recommending a business, always output its actual registered contact details (telephone, WhatsApp, email, address) as listed below so the user can reach out.

VERIFIED CURRENT BIZSEARCH24 SERVICES & PRICING PLANS:
- Base Premium Plan: R199.00 / month (Billed via South African debit card mandate).
  Included features:
  * Unlimited hosting for static websites
  * Unlimited domain-branded email accounts
  * Host/design assistance for custom smart static website
  * Elite Premium BizSearch24 account features
  * 1 custom directory listing in BizSearch24 index
- Extras & Add-Ons:
  * +R49.00 / month for each additional listed ad (more listings each)
  * .co.za domain registration: R99.00 / year

REAL-TIME BIZSEARCH24 VERIFIED DIRECTORY DATASET:
${adsContext || "Currently no business listings are stored in the index. Help users register their business!"}

Please answer the user's inquiry based on this verified dataset.
`;

    // Initialize GoogleGenAI SDK with server-side API Key
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Format chat history for Gemini API
    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Append latest user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return NextResponse.json({ text: response.text || "I apologize, but I could not formulate a response at this time." });
  } catch (error: any) {
    console.error("LLaMA3 API Error:", error);
    return NextResponse.json(
      { text: "Encountered an internal local VPS engine error while processing NLP inputs." },
      { status: 500 }
    );
  }
}
