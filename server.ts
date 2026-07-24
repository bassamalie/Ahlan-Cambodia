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
          signal: AbortSignal.timeout(3000),
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
        signal: AbortSignal.timeout(3500)
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
    } catch (err) {
      console.error("TikTok oEmbed fetch error:", err);
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
    const apiKey = process.env.VIATOR_API_KEY;
    if (!apiKey) {
      return res.json({ 
        configured: false, 
        message: "VIATOR_API_KEY environment variable is not set. Using local curated experiences.",
        activities: [] 
      });
    }

    const requestedEnv = (req.query.env as string) || process.env.VIATOR_ENV || "sandbox";
    const primaryIsSandbox = requestedEnv.toLowerCase() === "sandbox";

    const endpoints = primaryIsSandbox
      ? [
          { env: "sandbox", url: "https://api.sandbox.viator.com/partner/products/search" },
          { env: "production", url: "https://api.viator.com/partner/products/search" }
        ]
      : [
          { env: "production", url: "https://api.viator.com/partner/products/search" },
          { env: "sandbox", url: "https://api.sandbox.viator.com/partner/products/search" }
        ];

    let lastError: any = null;
    let successfulEnv = "";
    let data: any = null;

    for (const ep of endpoints) {
      try {
        const response = await fetch(ep.url, {
          method: "POST",
          headers: {
            "exp-api-key": apiKey.trim(),
            "Accept-Language": "en-US",
            "Accept": "application/json;version=2.0",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            searchTerm: "Cambodia",
            currency: "USD",
            pagination: { start: 1, count: 20 }
          })
        });

        if (response.ok) {
          data = await response.json();
          successfulEnv = ep.env;
          break;
        } else {
          const errText = await response.text();
          console.error(`Viator API (${ep.env}) error:`, response.status, errText);
          lastError = { status: response.status, details: errText, env: ep.env };
        }
      } catch (err: any) {
        lastError = { status: 500, details: err.message || String(err), env: ep.env };
      }
    }

    if (!data) {
      return res.json({
        configured: true,
        error: `Viator API Error (HTTP ${lastError?.status || 401}): Invalid API Key or Unauthorized`,
        details: lastError?.details,
        status: lastError?.status,
        activities: []
      });
    }

    const rawProducts = data.products || data.data || [];

    const activities = rawProducts.map((p: any) => ({
      id: p.productCode || p.code || `viator-${Math.random().toString(36).substring(2, 7)}`,
      name: p.title || p.name || "Cambodia Guided Tour",
      category: "Heritage",
      duration: p.duration?.fixedDurationInMinutes 
        ? `${Math.round(p.duration.fixedDurationInMinutes / 60)} Hours` 
        : (p.duration?.description || "Full Day"),
      location: p.primaryDestinationName || "Cambodia",
      image: p.images?.[0]?.variants?.[0]?.url || p.images?.[0]?.url || "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1200",
      description: p.description || p.shortDescription || "Unforgettable Viator tour in Cambodia with professional guides and seamless transfers.",
      shortDescription: p.shortDescription || (p.description ? p.description.slice(0, 150) + "..." : "Guided tour in Cambodia"),
      highlights: p.flags || ["Viator Verified", "Instant Booking", "English Speaking Guide"],
      isViator: true,
      price: p.pricing?.summary?.fromPrice ? `$${p.pricing.summary.fromPrice}` : undefined,
      productUrl: p.productUrl || `https://www.viator.com/tours/${p.productCode}`
    }));

    res.json({
      configured: true,
      environment: successfulEnv,
      count: activities.length,
      activities
    });
  } catch (err: any) {
    console.error("Error fetching Viator activities:", err);
    res.json({ configured: true, error: err.message || "Failed to fetch from Viator API", activities: [] });
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
