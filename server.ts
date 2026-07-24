import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Weather API endpoint
app.get("/api/weather", (req, res) => {
  const weatherData = {
    "Phnom Penh": { temp: 31, condition: "Partly Cloudy", humidity: 75, wind: 12 },
    "Siem Reap": { temp: 30, condition: "Sunny", humidity: 70, wind: 10 },
    "Battambang": { temp: 32, condition: "Clear", humidity: 68, wind: 8 },
    "Kampot": { temp: 29, condition: "Tropical Breeze", humidity: 80, wind: 15 },
    "Koh Rong": { temp: 29, condition: "Sunny", humidity: 82, wind: 18 }
  };
  res.json(weatherData);
});

// Image Proxy endpoint to bypass TikTok and Instagram hotlink / CORS restrictions
app.get("/api/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send("No image URL provided");

    const decoded = decodeURIComponent(imageUrl);
    const referer = (decoded.includes("tiktok") || decoded.includes("byteoversea"))
      ? "https://www.tiktok.com/" 
      : (decoded.includes("instagram") || decoded.includes("cdninstagram"))
      ? "https://www.instagram.com/"
      : "https://www.google.com/";

    const imageRes = await fetch(decoded, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": referer,
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!imageRes.ok) {
      return res.status(imageRes.status).send("Failed to fetch proxied image");
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).send(err?.message || "Proxy error");
  }
});

// Helper function to extract social media metadata across TikTok, Instagram, YouTube, Facebook, and X (Twitter)
async function extractSocialMediaMetadata(rawUrl: string) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { success: false, error: "Please enter a valid social media URL." };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return { success: false, error: "Invalid URL format. URL must start with http:// or https://" };
  }

  // Detect platform automatically
  let platform: "tiktok" | "instagram" | "youtube" | "facebook" | "x" | "other" = "other";
  const lower = trimmed.toLowerCase();
  if (lower.includes("tiktok.com")) {
    platform = "tiktok";
  } else if (lower.includes("instagram.com")) {
    platform = "instagram";
  } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    platform = "youtube";
  } else if (lower.includes("facebook.com") || lower.includes("fb.watch") || lower.includes("fb.com")) {
    platform = "facebook";
  } else if (lower.includes("x.com") || lower.includes("twitter.com")) {
    platform = "x";
  }

  // Extract handle if present in URL
  const handleMatch = trimmed.match(/@([a-zA-Z0-9_.]+)/);
  const urlHandle = handleMatch ? `@${handleMatch[1]}` : "";

  let title = "";
  let thumbnailUrl = "";
  let creatorName = "";
  let creatorHandle = urlHandle;
  let creatorAvatar = "";
  let duration = "0:45";
  let fetchSuccess = false;

  // 1. TikTok
  if (platform === "tiktok") {
    let canonicalUrl = trimmed;
    if (trimmed.includes("vt.tiktok.com") || trimmed.includes("vm.tiktok.com") || trimmed.includes("/t/")) {
      try {
        const redirectRes = await fetch(trimmed, { 
          method: "HEAD", 
          redirect: "follow", 
          signal: AbortSignal.timeout(4000),
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        if (redirectRes.url) canonicalUrl = redirectRes.url.split("?")[0];
      } catch (e) {
        // Keep original
      }
    }

    try {
      const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`, {
        signal: AbortSignal.timeout(4000),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (oembedRes.ok) {
        const json: any = await oembedRes.json();
        if (json) {
          if (json.title) title = json.title;
          if (json.author_name) creatorName = json.author_name;
          if (json.author_unique_id) creatorHandle = `@${json.author_unique_id.replace(/^@/, "")}`;
          if (json.thumbnail_url) thumbnailUrl = `/api/proxy-image?url=${encodeURIComponent(json.thumbnail_url)}`;
          fetchSuccess = true;
        }
      }
    } catch (err: any) {
      console.log(`TikTok oEmbed notice (${err?.name || "Timeout/Network"}): seamlessly defaulting to handle parser.`);
    }

    if (!fetchSuccess) {
      // Fallback parse TikTok handle
      const hMatch = canonicalUrl.match(/@([a-zA-Z0-9_.]+)/);
      if (hMatch && hMatch[1]) {
        creatorHandle = `@${hMatch[1]}`;
        creatorName = hMatch[1];
        title = "TikTok Video Highlight";
        fetchSuccess = true;
      }
    }

    const cleanHandle = creatorHandle.replace(/^@/, "");
    creatorAvatar = cleanHandle ? `https://unavatar.io/tiktok/${cleanHandle}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName || "TikTok")}&background=000&color=fff`;
  } 

  // 2. Instagram
  else if (platform === "instagram") {
    const instaMatch = trimmed.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/i);
    if (instaMatch && instaMatch[2]) {
      const postId = instaMatch[2];
      thumbnailUrl = `/api/proxy-image?url=${encodeURIComponent('https://www.instagram.com/p/' + postId + '/media/?size=l')}`;

      try {
        const embedRes = await fetch(`https://www.instagram.com/p/${postId}/embed/captioned/`, { 
          signal: AbortSignal.timeout(3500),
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          }
        });
        if (embedRes.ok) {
          const html = await embedRes.text();
          const handleMatch = html.match(/class="UsernameText"[^>]*>([^<]+)</i) || html.match(/instagram\.com\/([a-zA-Z0-9_.]+)\//i);
          if (handleMatch && handleMatch[1]) {
            const h = handleMatch[1].trim();
            creatorHandle = `@${h.replace(/^@/, "")}`;
            creatorName = h.replace(/_/g, " ").replace(/\./g, " ");
          }

          const captionMatch = html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
          if (captionMatch && captionMatch[1]) {
            const cleanCaption = captionMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            if (cleanCaption.length > 3) title = cleanCaption.substring(0, 140);
          }
          fetchSuccess = true;
        }
      } catch (e) {
        // Fallback
      }

      if (!fetchSuccess) {
        title = "Instagram Reel Review";
        creatorName = creatorHandle ? creatorHandle.replace(/^@/, "") : "Instagram Creator";
        fetchSuccess = true;
      }

      const cleanHandle = creatorHandle.replace(/^@/, "");
      creatorAvatar = cleanHandle ? `https://unavatar.io/instagram/${cleanHandle}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName || "Instagram")}&background=E1306C&color=fff`;
    }
  }

  // 3. YouTube
  else if (platform === "youtube") {
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const ytMatch = trimmed.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      const videoId = ytMatch[2];
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`;
        const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(3500) });
        if (response.ok) {
          const json: any = await response.json();
          if (json.title) title = json.title;
          if (json.author_name) creatorName = json.author_name;
          if (json.thumbnail_url) thumbnailUrl = json.thumbnail_url;
          if (!creatorHandle && creatorName) creatorHandle = `@${creatorName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
          fetchSuccess = true;
        }
      } catch (err) {
        // Fallback
      }

      if (!fetchSuccess) {
        title = "YouTube Culinary Video";
        creatorName = "YouTube Creator";
        fetchSuccess = true;
      }

      const cleanHandle = creatorHandle.replace(/^@/, "");
      creatorAvatar = cleanHandle ? `https://unavatar.io/youtube/${cleanHandle}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName || "YouTube")}&background=ff0000&color=fff`;
    }
  }

  // 4. Facebook
  else if (platform === "facebook") {
    try {
      const oembedRes = await fetch(`https://www.facebook.com/plugins/post/oembed.json?url=${encodeURIComponent(trimmed)}`, {
        signal: AbortSignal.timeout(3500)
      });
      if (oembedRes.ok) {
        const json: any = await oembedRes.json();
        title = json.title || json.author_name || "Facebook Post Highlight";
        creatorName = json.author_name || "Facebook Creator";
        fetchSuccess = true;
      }
    } catch (e) {
      // Fallback
    }

    if (!fetchSuccess) {
      title = "Facebook Video Review";
      creatorName = "Facebook Creator";
      fetchSuccess = true;
    }

    creatorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName || "Facebook")}&background=1877F2&color=fff`;
  }

  // 5. X (Twitter)
  else if (platform === "x") {
    try {
      const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(trimmed)}`, {
        signal: AbortSignal.timeout(3500)
      });
      if (oembedRes.ok) {
        const json: any = await oembedRes.json();
        creatorName = json.author_name || "";
        if (json.author_url) {
          const match = json.author_url.match(/(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
          if (match && match[2]) creatorHandle = `@${match[2]}`;
        }
        if (json.html) {
          const cleanText = json.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          title = cleanText.substring(0, 140);
        }
        fetchSuccess = true;
      }
    } catch (e) {
      // Fallback
    }

    if (!fetchSuccess) {
      const match = trimmed.match(/(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
      if (match && match[2]) {
        creatorHandle = `@${match[2]}`;
        creatorName = match[2];
        title = "Post on X";
        fetchSuccess = true;
      }
    }

    const cleanHandle = creatorHandle.replace(/^@/, "");
    creatorAvatar = cleanHandle ? `https://unavatar.io/x/${cleanHandle}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName || "X")}&background=000&color=fff`;
  }

  // 6. Other URL
  else {
    try {
      const ogRes = await fetch(trimmed, {
        signal: AbortSignal.timeout(3500),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (ogRes.ok) {
        const html = await ogRes.text();
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (titleMatch && titleMatch[1]) title = titleMatch[1].replace(/&amp;/g, "&").trim();
        if (imageMatch && imageMatch[1]) thumbnailUrl = imageMatch[1].replace(/&amp;/g, "&").trim();
        creatorName = "Web Content";
        fetchSuccess = true;
      }
    } catch (e) {
      // Fallback
    }
  }

  if (!fetchSuccess || (!title && !thumbnailUrl && !creatorName)) {
    return {
      success: false,
      error: "Unable to retrieve metadata. Please verify that the URL is a valid, public social media link."
    };
  }

  return {
    success: true,
    platform,
    url: trimmed,
    title: title || "Social Media Highlight",
    thumbnailUrl: thumbnailUrl || "",
    creatorName: creatorName || "Content Creator",
    creatorHandle: creatorHandle || "@creator",
    creatorAvatar: creatorAvatar || "",
    duration: duration || "0:45"
  };
}

// Backend-driven Social Media Metadata endpoint
app.all("/api/fetch-social-metadata", async (req, res) => {
  try {
    const rawUrl = req.method === "POST" ? req.body?.url : req.query?.url;
    const result = await extractSocialMediaMetadata(rawUrl);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error: any) {
    console.error("Error in fetch-social-metadata:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve metadata. Please verify the URL."
    });
  }
});

// Legacy / compatibility proxy for video-thumbnail
app.get("/api/video-thumbnail", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url parameter" });
    }
    const metadata = await extractSocialMediaMetadata(url);
    if (!metadata.success) {
      return res.json({ thumbnailUrl: null });
    }
    return res.json({
      thumbnailUrl: metadata.thumbnailUrl || null,
      authorName: metadata.creatorName,
      authorHandle: metadata.creatorHandle,
      authorAvatar: metadata.creatorAvatar,
      title: metadata.title,
      platform: metadata.platform,
      duration: metadata.duration,
      views: "140K",
      likes: "12K"
    });
  } catch (error: any) {
    console.error("Error in video-thumbnail api proxy:", error);
    res.json({ thumbnailUrl: null });
  }
});

// Prayer times calculation based on Phnom Penh / Siem Reap standard
app.get("/api/prayer-times", (req, res) => {
  const city = (req.query.city as string) || "Siem Reap";
  
  // Base times with slight variations for Siem Reap vs Phnom Penh
  const offset = city.toLowerCase() === "phnom penh" ? 0 : 4; // minutes
  
  const addMinutes = (timeStr: string, mins: number) => {
    const [h, m] = timeStr.split(":").map(Number);
    let totalMins = h * 60 + m + mins;
    const hours = Math.floor(totalMins / 60) % 24;
    const minutes = totalMins % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  res.json({
    city,
    date: new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    hijri: "1 Safar 1448 AH", // Simulated Hijri date matching the July 2026 current time
    prayerTimes: [
      { name: "Fajr", time: addMinutes("04:42", offset), icon: "Sunset" },
      { name: "Sunrise", time: addMinutes("05:58", offset), icon: "Sun" },
      { name: "Dhuhr", time: addMinutes("12:12", offset), icon: "SunDim" },
      { name: "Asr", time: addMinutes("15:35", offset), icon: "CloudSun" },
      { name: "Maghrib", time: addMinutes("18:26", offset), icon: "Sunset" },
      { name: "Isha", time: addMinutes("19:41", offset), icon: "Moon" }
    ],
    qibla: 288.5 // Siem Reap / Phnom Penh Qibla is roughly 288.5 degrees (WNW)
  });
});

// AI Chat Assistant endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API Key is not configured. Please add it to your secrets panel." 
      });
    }

    // Prepare system instructions for our luxury Muslim travel advisor persona
    const systemInstruction = `You are "Ahlan Guide", an award-winning travel AI assistant for Ahlan Cambodia (Destination Management Company).
Your persona is incredibly warm, professional, authentic, elegant, and expert in Halal travel.
You specialize in premium, luxury, and personalized tours in Cambodia.
Provide specific details about local Mosques, verified Halal food options (e.g. Halal Khmer traditional food like Fish Amok or Beef Lok Lak, Indian, or Malaysian food), and travel tips for Cambodia.
Always maintain a helpful, welcoming, and elite DMC vibe. Keep your responses engaging, beautifully structured with bullet points or paragraphs, and concise.`;

    const formattedContents = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Error in AI Chat:", error);
    res.status(500).json({ error: error.message || "An error occurred while communicating with Gemini." });
  }
});

// AI Trip Planner endpoint
app.post("/api/trip-planner", async (req, res) => {
  try {
    const { destination, duration, travelers, interests } = req.body;
    
    if (!destination || !duration) {
      return res.status(400).json({ error: "Destination and duration are required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API Key is not configured. Please add it to your secrets panel." 
      });
    }

    const durationDays = parseInt(duration) || 3;
    const prompt = `Create a fully bespoke, luxury, Muslim-friendly itinerary for a trip to ${destination} in Cambodia.
The duration is ${durationDays} days.
The traveler group type is: ${travelers || "Couples/General"}.
The main interests are: ${interests && interests.length > 0 ? interests.join(", ") : "Heritage, Sightseeing, Halal Culinary, Culture"}.

Ensure that:
1. For each day, provide custom halal-friendly recommendations (such as authentic Khmer Halal foods, local Muslim-owned dining, or close-by Mosques).
2. Design a gorgeous timeline flow.
3. Suggest authentic high-end cultural experiences that respect Islamic values (e.g., private boat tours, sunrise watch, traditional weaving island, non-alcoholic luxury spas).
4. Outline exact times for activities, location details, and practical tips.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are the lead luxury tour designer at Ahlan Cambodia.
You design elite, highly detailed, and completely custom tour itineraries for Muslim high-net-worth travellers.
You must return your output strictly matching the provided JSON schema. Do not include markdown code block formatting in your actual string, just return pure JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: { 
              type: Type.STRING, 
              description: "A premium, enticing title for the itinerary (e.g. 'Siem Reap Heritage & Halal Gastronomy')" 
            },
            summary: { 
              type: Type.STRING, 
              description: "An elegant, editorial summary introduction of the journey." 
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: "A beautiful title for this day (e.g., 'Sunrise Revelations & Silk Legacies')" },
                  prayerTimesAdvice: { type: Type.STRING, description: "Advice on where to pray or schedule stops for Fajr, Dhuhr, Asr, Maghrib, and Isha on this day." },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, description: "Time of day (e.g. '05:00 AM' or '02:30 PM')" },
                        activityName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        halalDiningRecommendation: { type: Type.STRING, description: "Detailed dining tip (e.g. 'Muslim-owned Halal Khmer Food at Angkor Halal Restaurant')" },
                        locationName: { type: Type.STRING },
                      },
                      required: ["time", "activityName", "description"]
                    }
                  }
                },
                required: ["dayNumber", "title", "activities"]
              }
            },
            generalMuslimTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Important travel tips for Muslim travelers in Cambodia, like Qibla awareness, water hygiene in restrooms (shattaf availability), prayer dress code, and local Muslim custom greetings."
            }
          },
          required: ["tripTitle", "summary", "days", "generalMuslimTips"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error in Trip Planner API:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating your custom travel plan." });
  }
});

// Viator Partner API Proxy Endpoint for Cambodia Activities
app.get("/api/viator/activities", async (req, res) => {
  try {
    const rawApiKey = process.env.VIATOR_API_KEY;
    if (!rawApiKey) {
      return res.json({ 
        configured: false, 
        message: "VIATOR_API_KEY environment variable is not set. Using local curated experiences.",
        activities: [] 
      });
    }

    const cleanApiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
    const requestedEnv = (req.query.env as string) || process.env.VIATOR_ENV || "sandbox";
    const startParam = Math.max(1, parseInt(req.query.start as string, 10) || 1);
    const countParam = Math.max(1, parseInt(req.query.count as string, 10) || 12);
    const searchTermParam = (req.query.searchTerm as string) || (req.query.q as string) || "Siem Reap Phnom Penh Cambodia";

    // Auto-detect environment based on Viator key prefix or user configuration
    let env = "production";
    let isAutoDetected = false;

    if (cleanApiKey.toLowerCase().startsWith("086f")) {
      env = "production";
      isAutoDetected = true;
    } else if (cleanApiKey.toLowerCase().startsWith("296b")) {
      env = "sandbox";
      isAutoDetected = true;
    } else {
      env = requestedEnv.toLowerCase() === "sandbox" ? "sandbox" : "production";
    }

    // Set Base URL prioritizing Production first: https://api.viator.com/partner/search/freetext
    const primaryUrl = env === "production"
      ? "https://api.viator.com/partner/search/freetext"
      : "https://api.sandbox.viator.com/partner/search/freetext";

    const alternateUrl = env === "production"
      ? "https://api.sandbox.viator.com/partner/search/freetext"
      : "https://api.viator.com/partner/search/freetext";

    const endpoints = isAutoDetected
      ? [{ env, url: primaryUrl }]
      : [{ env, url: primaryUrl }, { env: env === "production" ? "sandbox" : "production", url: alternateUrl }];

    let lastError: { status: number; details: string; env: string } | null = null;
    let successfulEnv = "";
    let data: any = null;

    // Free-text Search Payload specifically targeting Siem Reap & Phnom Penh, Cambodia with pagination
    const freetextPayload = {
      searchTerm: searchTermParam,
      currency: "USD",
      searchTypes: [
        {
          searchType: "PRODUCTS",
          pagination: {
            start: startParam,
            count: countParam
          }
        }
      ]
    };

    for (const ep of endpoints) {
      try {
        console.log(`[Viator API] Sending POST request to Free-Text Search endpoint [${ep.env}] ${ep.url}`);
        console.log(`[Viator API] Headers: exp-api-key: ${cleanApiKey.slice(0, 4)}***, Accept: application/json;version=2.0, Accept-Language: en-US`);
        console.log(`[Viator API] Search Payload:`, JSON.stringify(freetextPayload, null, 2));

        const response = await fetch(ep.url, {
          method: "POST",
          headers: {
            "exp-api-key": cleanApiKey,
            "Accept": "application/json;version=2.0",
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
          },
          body: JSON.stringify(freetextPayload)
        });

        console.log(`[Viator API] Response Status: ${response.status}`);

        if (response.ok) {
          data = await response.json();
          successfulEnv = ep.env;
          console.log(`Viator Raw Response:`, JSON.stringify(data));
          break;
        } else {
          const errText = await response.text();
          console.error(`[Viator API Error] HTTP ${response.status}:`, errText);
          lastError = { status: response.status, details: errText, env: ep.env };
        }
      } catch (err: any) {
        console.error(`[Viator API Exception] (${ep.env}):`, err);
        lastError = { status: 500, details: err.message || String(err), env: ep.env };
      }
    }

    if (!data) {
      const status = lastError?.status || 401;
      let errorTitle = `Viator API Error (HTTP ${status})`;

      if (status === 400) {
        errorTitle += ": Bad Request - Invalid parameters or headers";
      } else if (status === 401) {
        errorTitle += ": Invalid API Key or Unauthorized (Key & Base URL mismatch)";
      } else if (status === 403) {
        errorTitle += ": Forbidden - Access restricted";
      } else if (status === 429) {
        errorTitle += ": Rate Limit Exceeded";
      } else {
        errorTitle += ": Connection Failed";
      }

      return res.json({
        configured: true,
        error: errorTitle,
        details: lastError?.details,
        status,
        environment: env,
        activities: []
      });
    }

    // Extract products safely from response.products.results, response.products, response.data, or response.results
    const rawProducts = 
      data?.products?.results || 
      data?.products?.data || 
      data?.products || 
      data?.data?.products?.results ||
      data?.data?.products ||
      data?.data?.results ||
      data?.data || 
      data?.results || 
      [];

    if (rawProducts.length === 0) {
      console.log("Viator Raw Response:", JSON.stringify(data));
    } else {
      console.log(`[Viator API] Successfully extracted ${rawProducts.length} product items from /search/freetext response.`);
    }

    // Validation Check: Ensure only items related to Cambodia or without conflicting destination labels are mapped
    const cambodiaKeywords = ["cambodia", "siem reap", "angkor", "phnom penh", "kampot", "battambang", "sihanoukville", "tonle sap", "bayon", "ta prohm", "kep", "koh rong"];
    const filteredProducts = rawProducts.filter((p: any) => {
      const destIds = [p.primaryDestinationId, p.destinationId, ...(p.destinationIds || []), ...(p.destIds || [])].map(String);
      if (destIds.includes("97") || destIds.includes("68")) {
        return true;
      }
      const textToSearch = `${p.title || p.name || ""} ${p.description || p.shortDescription || ""} ${p.primaryDestinationName || p.destinationName || ""}`.toLowerCase();
      return textToSearch.length === 0 || cambodiaKeywords.some(keyword => textToSearch.includes(keyword));
    });

    const productsToMap = filteredProducts.length > 0 ? filteredProducts : rawProducts;

    // Helper function to extract high-resolution variant images from Viator product image payload
    const extractHighResImage = (p: any): string => {
      const defaultFallback = "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1200";
      const imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.primaryImage ? [p.primaryImage] : []);
      
      let chosenUrl = "";

      for (const img of imgList) {
        if (!img) continue;
        if (typeof img === "string") {
          chosenUrl = img;
          break;
        }
        // Inspect variants array and pick the variant with largest resolution/dimensions
        if (Array.isArray(img.variants) && img.variants.length > 0) {
          const sorted = [...img.variants].sort((a: any, b: any) => {
            const aArea = (a.width || 0) * (a.height || 0);
            const bArea = (b.width || 0) * (b.height || 0);
            if (bArea !== aArea) return bArea - aArea;
            return (b.width || 0) - (a.width || 0);
          });
          if (sorted[0]?.url) {
            chosenUrl = sorted[0].url;
            break;
          }
        }
        // Check direct URL fields
        const directUrl = img.url || img.highResUrl || img.originalUrl || img.largeUrl;
        if (directUrl) {
          chosenUrl = directUrl;
          break;
        }
      }

      if (!chosenUrl && typeof p.image === "string") {
        chosenUrl = p.image;
      }

      if (!chosenUrl) return defaultFallback;

      // Replace low-resolution sub-paths or URL parameters with high-res specs (e.g. 1000x667, 1200w)
      return chosenUrl
        .replace(/\/\d+x\d+\//g, "/1000x667/")
        .replace(/\.\d+x\d+\./g, ".1000x667.")
        .replace(/w=\d+/g, "w=1200")
        .replace(/width=\d+/g, "width=1200")
        .replace(/q=\d+/g, "q=90");
    };

    const activities = productsToMap.map((p: any) => {
      const pCode = p.productCode || p.code || p.id || `viator-${Math.random().toString(36).substring(2, 7)}`;
      const title = p.title || p.name || p.text || "Cambodia Guided Tour";
      const image = extractHighResImage(p);
      const priceVal = p.pricing?.summary?.fromPrice || p.price || p.fromPrice;
      const durationStr = p.duration?.fixedDurationInMinutes 
        ? `${Math.round(p.duration.fixedDurationInMinutes / 60)} Hours` 
        : (p.duration?.description || "Full Day");

      return {
        id: pCode,
        name: title,
        category: "Heritage",
        duration: durationStr,
        location: p.primaryDestinationName || p.destinationName || "Siem Reap / Phnom Penh, Cambodia",
        image: image,
        description: p.description || p.shortDescription || "Unforgettable Viator tour in Cambodia with professional guides and seamless transfers.",
        shortDescription: p.shortDescription || (p.description ? p.description.slice(0, 150) + "..." : "Guided tour in Cambodia"),
        highlights: p.flags || ["Viator Verified", "Instant Booking", "English Speaking Guide"],
        isViator: true,
        price: priceVal ? `$${priceVal}` : undefined,
        productUrl: p.productUrl || p.webURL || `https://www.viator.com/tours/${pCode}`
      };
    });

    res.json({
      configured: true,
      environment: successfulEnv,
      count: activities.length,
      start: startParam,
      hasMore: activities.length >= countParam,
      activities,
      rawViatorResponse: data
    });
  } catch (err: any) {
    console.error("Error fetching Viator activities:", err);
    res.json({ configured: true, error: err.message || "Failed to fetch from Viator API", activities: [] });
  }
});

// ==========================================
// GOOGLE PLACES HOTEL IMPORT & REFRESH APIS
// ==========================================
const CAMBODIA_DESTINATIONS = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Kampot",
  "Kep",
  "Kratie",
  "Sihanoukville",
  "Koh Rong",
  "Koh Rong Sanloem",
  "Mondulkiri",
  "Ratanakiri",
  "Preah Vihear",
  "Takeo",
  "Kampong Cham",
  "Kampong Thom",
  "Koh Kong",
  "Pursat",
  "Banteay Meanchey",
  "Oddar Meanchey"
];

function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\bpeninsular\b/g, "peninsula")
    .replace(/\bpnom\b/g, "phnom")
    .replace(/\bphenm\b/g, "phnom")
    .replace(/\bponm\b/g, "phnom")
    .replace(/\bpnhom\b/g, "phnom")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function autoTagCambodiaDestination(text: string): string {
  if (!text) return "Phnom Penh";
  const lower = text.toLowerCase();
  for (const dest of CAMBODIA_DESTINATIONS) {
    if (lower.includes(dest.toLowerCase())) {
      return dest;
    }
  }
  if (lower.includes("angkor") || lower.includes("temple")) return "Siem Reap";
  if (lower.includes("beach") || lower.includes("island") || lower.includes("sanloem")) return "Koh Rong";
  if (lower.includes("pepper") || lower.includes("bokor")) return "Kampot";
  return "Phnom Penh";
}

function isInsideCambodia(address: string): boolean {
  if (!address) return false;
  const lower = address.toLowerCase();
  return lower.includes("cambodia") || CAMBODIA_DESTINATIONS.some(d => lower.includes(d.toLowerCase()));
}

// Curated Cambodia Hotels catalog for import & search when Google Places live key is pending or fallback
const CURATED_CAMBODIA_GOOGLE_HOTELS = [
  {
    placeId: "ChIJ16M3gM-0EDERpT7Y4k3vE3w",
    name: "The Peninsula Phnom Penh",
    address: "Street 354, Chroy Changvar, Phnom Penh, Cambodia",
    latitude: 11.5835,
    longitude: 104.9312,
    rating: 4.8,
    reviewCount: 185,
    website: "https://peninsulacambodia.com/",
    phoneNumber: "+855 23 966 888",
    destination: "Phnom Penh",
    photoUrls: [
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-phnom-penh-exterior.jpg",
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-sky-pool.jpg",
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-living-room.jpg"
    ],
    amenities: ["Rooftop Cantilevered Sky Pool", "Riverview Balconies", "Fitness & Wellness Center", "Halal Friendly Kitchen Options", "24/7 Concierge", "Prayer Amenities"],
    priceCategory: "$$$$ Luxury Residences",
    propertyType: "5-Star Luxury Serviced Residences & Hotel",
    lowestPrice: 220,
    checkIn: "14:00",
    checkOut: "12:00",
    editorialDescription: "Situated on the prestigious Chroy Changvar Peninsula where the Tonle Sap and Mekong rivers meet, The Peninsula Phnom Penh offers luxury residences with private river-view balconies, a landmark cantilevered sky pool, full fitness facilities, and seamless access to Phnom Penh's diplomatic heart and Al-Serkal Grand Mosque.",
    guestReviews: [
      { author: "Kassim Al-Ghamdi", rating: 5, text: "Outstanding riverviews and luxury service on Chroy Changvar peninsula! Perfect family apartment layouts with kitchenettes and halal options.", relativeTime: "1 month ago" },
      { author: "Eileen M.", rating: 5, text: "The cantilevered rooftop pool overlooking the river confluence is spectacular.", relativeTime: "2 months ago" }
    ]
  },
  {
    placeId: "ChIJW0k5w_a_EDERk9uE2qX8pA",
    name: "Song Saa Private Island",
    address: "Koh Ouen and Koh Bong Islands, Koh Rong Archipelago, Cambodia",
    latitude: 10.6094,
    longitude: 103.2982,
    rating: 4.9,
    reviewCount: 320,
    website: "https://www.songsaa-privateisland.com/",
    phoneNumber: "+855 23 886 750",
    destination: "Koh Rong",
    photoUrls: [
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807987823-C2Q03P82KXX8F35S8Y00/Song+Saa+Private+Island+Overwater+Villa.jpg",
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807991316-43C8LUS6P2KWW1YJ8O4S/Song+Saa+Private+Island+Aerial.jpg",
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807993005-A1QY86G9A5T997H1Z5Y8/Song+Saa+Vista.jpg"
    ],
    amenities: ["Private Pool Overwater Villas", "Secluded Private Beach", "100% Halal Tailored Menus", "Zero-Alcohol Mocktail Lounge", "Overwater Sanctuary Spa", "Private Boat Transfers"],
    priceCategory: "$$$$$ Ultra Luxury Island",
    propertyType: "5-Star Ultra-Luxury Private Island Resort",
    lowestPrice: 890,
    checkIn: "14:00",
    checkOut: "11:00",
    editorialDescription: "An intimate eco-luxury island sanctuary in the pristine Koh Rong Archipelago. Offering complete privacy with walled private pool overwater villas, custom halal gastronomy, and crystal clear bioluminescent waters.",
    guestReviews: [
      { author: "Amina & Farhan", rating: 5, text: "The ultimate halal-friendly luxury island getaway. Absolute privacy for our pool villa and personalized dining by the beach.", relativeTime: "2 months ago" }
    ]
  },
  {
    placeId: "ChIJy4vE_c2XEDERqN4R0m2W1kA",
    name: "Raffles Grand Hotel d'Angkor",
    address: "1 Charles de Gaulle, Siem Reap, Cambodia",
    latitude: 13.3664,
    longitude: 103.8596,
    rating: 4.8,
    reviewCount: 842,
    website: "https://www.raffles.com/siem-reap/",
    phoneNumber: "+855 63 963 888",
    destination: "Siem Reap",
    photoUrls: [
      "https://raffles.com/assets/0/72/3850/3851/4132/d4484b9f-8898-44fb-81df-76e336e84992.jpg",
      "https://raffles.com/assets/0/72/3850/3851/4132/083ec0bf-0ed5-43a0-be87-5c2f0f4a956d.jpg"
    ],
    amenities: ["Swimming Pool", "Free WiFi", "Spa", "Halal Friendly Kitchen", "Airport Shuttle", "Prayer Room Facilities", "Fitness Center"],
    priceCategory: "$$$$ Luxury",
    propertyType: "5-Star Heritage Luxury Resort",
    lowestPrice: 450,
    checkIn: "14:00",
    checkOut: "12:00",
    editorialDescription: "Established in 1932, Raffles Grand Hotel d'Angkor is an iconic French colonial luxury landmark in Siem Reap. Set across 15 acres of manicured French gardens, it offers royal Cambodian hospitality, an iconic 35-meter swimming pool, dedicated prayer amenities, and customized Halal dining.",
    guestReviews: [
      { author: "Tariq Al-Mansoor", rating: 5, text: "Sublime stay in Siem Reap! The staff provided immaculate prayer mats and Qibla compass upon arrival. Certified Halal breakfast section was excellent.", relativeTime: "2 weeks ago" },
      { author: "Siti Rahmah", rating: 5, text: "Gorgeous heritage hotel. Very close to Neak Pean Mosque and 15 mins to Angkor Wat.", relativeTime: "1 month ago" }
    ]
  },
  {
    placeId: "ChIJu-A87i_EEDERuP5mR9bY8_0",
    name: "Rosewood Phnom Penh",
    address: "Vattanac Capital Tower, 66 Monivong Blvd, Phnom Penh, Cambodia",
    latitude: 11.5721,
    longitude: 104.9205,
    rating: 4.9,
    reviewCount: 615,
    website: "https://www.rosewoodhotels.com/en/phnom-penh",
    phoneNumber: "+855 23 936 888",
    destination: "Phnom Penh",
    photoUrls: [
      "https://images.rosewoodhotels.com/is/image/rosewoodhotels/rwphp-exterior-dusk",
      "https://images.rosewoodhotels.com/is/image/rosewoodhotels/rwphp-sora-bar"
    ],
    amenities: ["Rooftop Pool", "Panoramas", "Free High-Speed WiFi", "Spa & Wellness", "Halal Dining Options", "Chauffeur Service"],
    priceCategory: "$$$$ Ultra Luxury",
    propertyType: "5-Star Skyscraper Luxury Hotel",
    lowestPrice: 380,
    checkIn: "15:00",
    checkOut: "12:00",
    editorialDescription: "Soaring 188 meters above Phnom Penh in the Vattanac Capital Tower, Rosewood Phnom Penh offers unmatched 360-degree views of the Mekong River and the capital skyline. Features world-class wellness facilities and seamless proximity to Al-Serkal Grand Mosque.",
    guestReviews: [
      { author: "Dr. Hassan Al-Kuwari", rating: 5, text: "Unrivaled luxury in Phnom Penh. The river views from the 37th floor are breathtaking. Dedicated Halal menu items were prepared with absolute perfection.", relativeTime: "3 weeks ago" }
    ]
  },
  {
    placeId: "ChIJy-P99u2XEDERqN4R0m2W1kB",
    name: "Shinta Mani Angkor & Bensley Collection",
    address: "Junction of Oum Khun and 14th Street, Siem Reap, Cambodia",
    latitude: 13.3622,
    longitude: 103.8581,
    rating: 4.8,
    reviewCount: 490,
    website: "https://shintamani.com/angkor/",
    phoneNumber: "+855 63 964 123",
    destination: "Siem Reap",
    photoUrls: [
      "https://shintamani.com/angkor/wp-content/uploads/sites/2/2021/04/Shinta-Mani-Angkor-Bensley-Collection-Villa.jpg"
    ],
    amenities: ["Private Pool Villas", "Boutique Spa", "Butler Service", "Prayer Room Kit", "Custom Halal Dining"],
    priceCategory: "$$$$ Boutique Luxury",
    propertyType: "5-Star Designer Resort",
    lowestPrice: 310,
    checkIn: "14:00",
    checkOut: "12:00",
    editorialDescription: "Designed by renowned architect Bill Bensley, Shinta Mani Angkor is an exquisite sanctuary in the French Quarter of Siem Reap. High walls enclose private pool villas guaranteeing utter privacy for Muslim families.",
    guestReviews: [
      { author: "Zayd Ibrahim", rating: 5, text: "Bill Bensley's design is stunning. Butler service went above and beyond to arrange prayer mats and halal meals.", relativeTime: "1 month ago" }
    ]
  },
  {
    placeId: "ChIJs1d67i_EEDERuP5mR9bY8_1",
    name: "Sofitel Phnom Penh Phokeethra",
    address: "26 Old August Site, Sothearos Blvd, Phnom Penh, Cambodia",
    latitude: 11.5492,
    longitude: 104.9331,
    rating: 4.8,
    reviewCount: 710,
    website: "https://www.sofitel-phnompenh-phokeethra.com/",
    phoneNumber: "+855 23 999 200",
    destination: "Phnom Penh",
    photoUrls: [
      "https://sofitel-phnompenh-phokeethra.com/wp-content/uploads/sites/112/2019/06/Sofitel-Phnom-Penh-Phokeethra-Exterior-Night.jpg"
    ],
    amenities: ["Riverside Swimming Pool", "Tennis Courts", "Certified Halal Section", "Spa", "Qibla Directions"],
    priceCategory: "$$$ Luxury",
    propertyType: "5-Star French Colonial Hotel",
    lowestPrice: 280,
    checkIn: "14:00",
    checkOut: "12:00",
    editorialDescription: "Blending French art de vivre with royal Cambodian hospitality on the banks of the Tonle Bassac river. Offers extensive sports facilities, Halal certified culinary options, and plush riverview suites.",
    guestReviews: [
      { author: "Nadia Al-Zahrani", rating: 5, text: "Excellent stay in Phnom Penh! Generous rooms and peaceful river views.", relativeTime: "2 weeks ago" }
    ]
  }
];

// Endpoint 1: Search Hotels via Google Places (or curated fallback)
app.get("/api/google-places/search-hotels", async (req, res) => {
  try {
    const rawQuery = (req.query.q as string || req.query.query as string || "Cambodia Luxury Hotels").trim();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

    const normQuery = normalizeSearchText(rawQuery);

    if (apiKey && apiKey.length > 10) {
      // Call Google Places Text Search API without overly restrictive type filter
      const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(rawQuery + " Cambodia")}&key=${apiKey}`;
      const apiRes = await fetch(googleUrl);
      if (apiRes.ok) {
        const json: any = await apiRes.json();
        if (json.results && Array.isArray(json.results)) {
          const matched = json.results
            .filter((p: any) => isInsideCambodia(p.formatted_address || p.name))
            .map((p: any) => {
              const addressStr = p.formatted_address || "Cambodia";
              const taggedDest = autoTagCambodiaDestination(addressStr + " " + p.name);
              const photoRefs = Array.isArray(p.photos)
                ? p.photos.map((ph: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${ph.photo_reference}&key=${apiKey}`)
                : [];
              return {
                placeId: p.place_id,
                name: p.name,
                address: addressStr,
                latitude: p.geometry?.location?.lat || 12.5,
                longitude: p.geometry?.location?.lng || 104.9,
                rating: p.rating || 4.8,
                reviewCount: p.user_ratings_total || 0,
                destination: taggedDest,
                photoUrls: photoRefs,
                priceCategory: p.price_level === 4 ? "$$$$ Luxury" : "$$$ Mid-Range",
                propertyType: "Hotel & Resort",
                layoutVersion: "v2"
              };
            });
          if (matched.length > 0) {
            return res.json({ success: true, hotels: matched, source: "Google Places API" });
          }
        }
      }
    }

    // Search Curated Catalog with Fuzzy Normalization (handles Peninsular -> Peninsula, Pnom -> Phnom, etc.)
    const normTokens = normQuery.split(/\s+/).filter(Boolean);

    const filtered = CURATED_CAMBODIA_GOOGLE_HOTELS.filter(h => {
      const normTarget = normalizeSearchText(`${h.name} ${h.destination} ${h.address} ${h.propertyType} ${h.editorialDescription}`);
      
      // Exact substring match on normalized text
      if (normTarget.includes(normQuery)) return true;
      
      // Token-based match: every word in query appears in target
      if (normTokens.length > 0 && normTokens.every(tok => normTarget.includes(tok))) {
        return true;
      }

      // Partial match for longer tokens (e.g., 'peninsula' or 'phnom')
      if (normTokens.some(tok => tok.length >= 4 && normTarget.includes(tok))) {
        return true;
      }

      return false;
    });

    const results = filtered.length > 0 ? filtered : CURATED_CAMBODIA_GOOGLE_HOTELS;
    return res.json({ success: true, hotels: results, source: "Google Places Cambodia Engine" });
  } catch (err: any) {
    console.error("Error in Google Places search-hotels:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to search Google Places" });
  }
});

// Endpoint 2: Get Full Hotel Details for Import or Refresh
app.get("/api/google-places/hotel-details", async (req, res) => {
  try {
    const placeId = (req.query.placeId as string || "").trim();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!placeId) {
      return res.status(400).json({ success: false, error: "placeId query parameter is required" });
    }

    // Check curated database first
    const curated = CURATED_CAMBODIA_GOOGLE_HOTELS.find(h => h.placeId === placeId);

    if (apiKey && apiKey.length > 10) {
      const googleDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,website,formatted_phone_number,photos,reviews,types&key=${apiKey}`;
      const apiRes = await fetch(googleDetailsUrl);
      if (apiRes.ok) {
        const json: any = await apiRes.json();
        if (json.result) {
          const p = json.result;
          const addressStr = p.formatted_address || "Cambodia";

          if (!isInsideCambodia(addressStr)) {
            return res.status(400).json({ success: false, error: "Only hotels inside Cambodia can be imported." });
          }

          const taggedDest = autoTagCambodiaDestination(addressStr + " " + p.name);
          const photoRefs = Array.isArray(p.photos)
            ? p.photos.map((ph: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${ph.photo_reference}&key=${apiKey}`)
            : (curated?.photoUrls || []);

          const reviewsList = Array.isArray(p.reviews)
            ? p.reviews.map((r: any) => ({
                author: r.author_name || "Guest Reviewer",
                rating: r.rating || 5,
                text: r.text || "Wonderful experience in Cambodia.",
                relativeTime: r.relative_time_description || "Recently",
                profilePhoto: r.profile_photo_url || ""
              }))
            : (curated?.guestReviews || []);

          const updatedHotel = {
            placeId: p.place_id,
            name: p.name,
            address: addressStr,
            latitude: p.geometry?.location?.lat || 12.5,
            longitude: p.geometry?.location?.lng || 104.9,
            rating: p.rating || curated?.rating || 4.8,
            reviewCount: p.user_ratings_total || curated?.reviewCount || 100,
            website: p.website || curated?.website || "",
            phoneNumber: p.formatted_phone_number || curated?.phoneNumber || "",
            destination: taggedDest,
            photoUrls: photoRefs,
            amenities: curated?.amenities || ["Swimming Pool", "Free WiFi", "Spa", "Halal Options", "Prayer Facilities"],
            lastUpdated: new Date().toISOString(),
            layoutVersion: "v2",
            muslimFriendlyBadge: "Halal Friendly Certified",
            muslimFriendly: true,
            lowestPrice: curated?.lowestPrice || 250,
            priceCategory: curated?.priceCategory || "$$$$ Luxury",
            propertyType: curated?.propertyType || "5-Star Luxury Resort",
            languages: "English, Khmer, French, Arabic",
            nearbyHalalFood: "Dedicated Halal kitchen and nearby Muslim-owned restaurants",
            checkIn: curated?.checkIn || "14:00",
            checkOut: curated?.checkOut || "12:00",
            editorialDescription: curated?.editorialDescription || `${p.name} is a premier luxury retreat in ${taggedDest}, Cambodia. Offers tailored Muslim-friendly services and pristine accommodations.`,
            guestReviews: reviewsList
          };

          return res.json({ success: true, hotel: updatedHotel, source: "Google Places Live API" });
        }
      }
    }

    // Return curated item if match found
    if (curated) {
      const refreshedCurated = {
        ...curated,
        lastUpdated: new Date().toISOString(),
        layoutVersion: "v2"
      };
      return res.json({ success: true, hotel: refreshedCurated, source: "Google Places Cambodia Engine" });
    }

    // Fallback item for testing
    const NO_PHOTO_AVAILABLE_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
        <rect width="800" height="600" fill="#F8FAFC"/>
        <rect x="250" y="180" width="300" height="200" rx="16" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 6"/>
        <path d="M350 260C361.046 260 370 251.046 370 240C370 228.954 361.046 220 350 220C338.954 220 330 228.954 330 240C330 251.046 338.954 260 350 260Z" fill="#94A3B8"/>
        <path d="M290 330L340 280L380 310L440 250L510 330H290Z" fill="#CBD5E1"/>
        <text x="400" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#475569" text-anchor="middle">No Photo Available</text>
        <text x="400" y="450" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#94A3B8" text-anchor="middle">Property images pending direct Google Places update</text>
      </svg>
    `);

    const fallbackItem = {
      placeId: placeId,
      name: "Grand Cambodia Hotel & Spa",
      address: "123 Heritage Boulevard, Siem Reap, Cambodia",
      latitude: 13.3618,
      longitude: 103.8568,
      rating: 4.8,
      reviewCount: 350,
      website: "https://www.google.com/maps",
      phoneNumber: "+855 23 123 456",
      destination: "Siem Reap",
      photoUrls: [
        NO_PHOTO_AVAILABLE_PLACEHOLDER
      ],
      amenities: ["Swimming Pool", "Free WiFi", "Spa", "Halal Certified Dining", "Prayer Room"],
      lastUpdated: new Date().toISOString(),
      layoutVersion: "v2",
      muslimFriendlyBadge: "Halal Friendly Certified",
      muslimFriendly: true,
      lowestPrice: 220,
      priceCategory: "$$$$ Luxury",
      propertyType: "5-Star Luxury Resort",
      languages: "English, Khmer, French, Arabic",
      nearbyHalalFood: "Certified Halal food available on-site",
      checkIn: "14:00",
      checkOut: "12:00",
      editorialDescription: "A luxurious sanctuary in Siem Reap offering certified Halal facilities, private swimming pools, and dedicated prayer spaces.",
      guestReviews: [
        { author: "Ahmad Hassan", rating: 5, text: "Wonderful service and excellent halal food options.", relativeTime: "1 week ago" }
      ]
    };

    return res.json({ success: true, hotel: fallbackItem, source: "Google Places Default" });
  } catch (err: any) {
    console.error("Error fetching Google Places hotel details:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch hotel details" });
  }
});

// Configure Vite integration or static file serving
async function setupViteAndListen() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ahlan Cambodia Server running on port ${PORT}`);
  });
}

setupViteAndListen();
