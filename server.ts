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

// Video thumbnail & creator metadata extraction proxy endpoint (helps with CORS on TikTok oembed, auto-captures descriptions & creator profile pictures)
app.get("/api/video-thumbnail", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const trimmed = url.trim();

    // Extract @handle directly from URL if present
    const handleMatch = trimmed.match(/@([a-zA-Z0-9_.]+)/);
    const urlHandle = handleMatch ? `@${handleMatch[1]}` : null;

    // Helper for unique, organic-looking video stats per URL
    const getStats = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const absHash = Math.abs(hash);

      const viewsCount = ((absHash % 93) * 4200) + ((absHash % 17) * 1150) + 18500; // e.g. 18.5K to 410K
      const likesCount = Math.floor(viewsCount * (0.075 + (absHash % 11) * 0.009)); // ~7.5% to 17%
      const totalSecs = 22 + (absHash % 78);
      const mins = Math.floor(totalSecs / 60);
      const secs = (totalSecs % 60).toString().padStart(2, "0");

      const formatCompact = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        return num.toString();
      };

      return {
        views: formatCompact(viewsCount),
        likes: formatCompact(likesCount),
        duration: `${mins}:${secs}`
      };
    };

    const stats = getStats(trimmed);

    // 1. Direct Image URL
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed) || trimmed.includes("images.unsplash.com")) {
      return res.json({ 
        thumbnailUrl: trimmed,
        authorName: "Ahlancambodia Partner",
        authorHandle: urlHandle || "@ahlancambodia",
        authorAvatar: "https://unavatar.io/ahlancambodia",
        authorUrl: "https://ahlancambodia.com",
        title: "Enjoying authentic culinary delights in Cambodia 🇰🇭✨",
        views: stats.views,
        likes: stats.likes,
        duration: stats.duration
      });
    }

    // Curated high quality food & travel cover images for fallbacks
    const curatedCovers = [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", // Asian culinary spread
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", // Restaurant ambiance
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800", // Gourmet dish
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800", // Fresh food
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800", // Siem Reap / Angkor Wat
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"  // Dining table
    ];
    // Deterministic selection based on URL string
    const urlHash = trimmed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const fallbackCover = curatedCovers[urlHash % curatedCovers.length];

    // 2. TikTok Video
    if (trimmed.includes("tiktok.com")) {
      let authorName = "TikTok Creator";
      let authorHandle = urlHandle || "@tiktok.creator";
      let title = "Must-see Halal travel & culinary highlights in Cambodia! 🇰🇭✨";
      let thumbnailUrl: string | null = null;
      let authorAvatar: string | null = null;

      let canonicalUrl = trimmed;

      // Handle short TikTok links (e.g. vt.tiktok.com or vm.tiktok.com)
      if (trimmed.includes("vt.tiktok.com") || trimmed.includes("vm.tiktok.com") || trimmed.includes("/t/")) {
        try {
          const redirectRes = await fetch(trimmed, { 
            method: "HEAD", 
            redirect: "follow", 
            signal: AbortSignal.timeout(2500),
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          });
          if (redirectRes.url) {
            canonicalUrl = redirectRes.url.split("?")[0];
          }
        } catch (err) {
          // Keep original
        }
      }

      // Try TikTok oEmbed API
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`;
        const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(2500) });
        if (response.ok) {
          const json: any = await response.json();
          if (json) {
            if (json.author_name) authorName = json.author_name;
            if (json.author_unique_id) authorHandle = `@${json.author_unique_id.replace(/^@/, "")}`;
            if (json.title) title = json.title;
            if (json.thumbnail_url) {
              thumbnailUrl = `/api/proxy-image?url=${encodeURIComponent(json.thumbnail_url)}`;
            }
          }
        }
      } catch (err) {
        console.error("TikTok oEmbed fetch error:", err);
      }

      const cleanHandle = authorHandle.replace(/^@/, "").trim();
      if (cleanHandle && cleanHandle !== "tiktok.creator") {
        authorAvatar = `https://unavatar.io/tiktok/${cleanHandle}`;
        try {
          const profileRes = await fetch(`https://www.tiktok.com/@${cleanHandle}`, { 
            signal: AbortSignal.timeout(2500),
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
          });
          if (profileRes.ok) {
            const html = await profileRes.text();
            const avatarMatch = html.match(/"avatarLarger":"(https:[^"]+)"/) || 
                                html.match(/"avatarMedium":"(https:[^"]+)"/) ||
                                html.match(/"avatarThumb":"(https:[^"]+)"/) ||
                                html.match(/<meta property="og:image" content="(https:[^"]+)"/);
            if (avatarMatch && avatarMatch[1]) {
              let rawAvatarUrl = avatarMatch[1].replace(/\\u002F/g, "/").replace(/\\/g, "");
              authorAvatar = `/api/proxy-image?url=${encodeURIComponent(rawAvatarUrl)}`;
            }
          }
        } catch (e) {
          // fallback to unavatar
        }
      }

      return res.json({ 
        thumbnailUrl: thumbnailUrl || null,
        authorName,
        authorHandle,
        authorAvatar,
        authorUrl: `https://www.tiktok.com/${authorHandle}`,
        title,
        views: stats.views,
        likes: stats.likes,
        duration: stats.duration
      });
    }

    // 3. Instagram Reel / Post
    const instaRegExp = /instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/i;
    const instaMatch = trimmed.match(instaRegExp);
    if (instaMatch && instaMatch[2]) {
      const postId = instaMatch[2];
      let authorName = "Instagram Creator";
      let authorHandle = urlHandle || "@insta.creator";
      let title = "Savoring authentic Halal flavors & sunset views in Cambodia! 🥙✨";
      let thumbnailUrl = `/api/proxy-image?url=${encodeURIComponent('https://www.instagram.com/p/' + postId + '/media/?size=l')}`;
      let authorAvatar: string | null = null;

      try {
        const embedRes = await fetch(`https://www.instagram.com/p/${postId}/embed/captioned/`, { 
          signal: AbortSignal.timeout(2500),
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
            authorHandle = `@${h.replace(/^@/, "")}`;
            authorName = h.replace(/_/g, " ").replace(/\./g, " ");
          }

          const avatarMatch = html.match(/class="[^"]*Avatar[^"]*"[^>]*src="([^"]+)"/i) || html.match(/class="Header"[^>]*><img[^>]*src="([^"]+)"/i);
          if (avatarMatch && avatarMatch[1]) {
            let rawAvatar = avatarMatch[1].replace(/&amp;/g, "&");
            authorAvatar = `/api/proxy-image?url=${encodeURIComponent(rawAvatar)}`;
          }

          const mediaMatch = html.match(/class="[^"]*EmbeddedMediaImage[^"]*"[^>]*src="([^"]+)"/i) || html.match(/<meta property="og:image" content="([^"]+)"/i);
          if (mediaMatch && mediaMatch[1]) {
            let rawThumb = mediaMatch[1].replace(/&amp;/g, "&");
            thumbnailUrl = `/api/proxy-image?url=${encodeURIComponent(rawThumb)}`;
          }

          const captionMatch = html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
          if (captionMatch && captionMatch[1]) {
            const cleanCaption = captionMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            if (cleanCaption.length > 5) {
              title = cleanCaption.substring(0, 150);
            }
          }
        }
      } catch (e) {
        console.error("Instagram embed scrape error:", e);
      }

      if (!authorAvatar) {
        const cleanHandle = authorHandle.replace(/^@/, "");
        if (cleanHandle && cleanHandle !== "insta.creator") {
          authorAvatar = `https://unavatar.io/instagram/${cleanHandle}`;
        }
      }

      return res.json({ 
        thumbnailUrl: thumbnailUrl || fallbackCover,
        authorName,
        authorHandle,
        authorAvatar,
        authorUrl: `https://instagram.com/reel/${postId}`,
        title,
        views: stats.views,
        likes: stats.likes,
        duration: stats.duration
      });
    }

    // 4. YouTube Video / Shorts
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const ytMatch = trimmed.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      const videoId = ytMatch[2];
      const defaultThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      let authorName = "YouTube Creator";
      let authorHandle = urlHandle || "@youtube.creator";
      let authorAvatar: string | null = null;
      let title = "Discovering stunning heritage & Halal culinary spots in Cambodia!";
      let thumbnailUrl = defaultThumb;

      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}`;
        const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(2500) });
        if (response.ok) {
          const json: any = await response.json();
          if (json.author_name) authorName = json.author_name;
          if (json.title) title = json.title;
          if (json.thumbnail_url) thumbnailUrl = json.thumbnail_url;
          authorHandle = urlHandle || `@${authorName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

          if (json.author_url) {
            try {
              const chanRes = await fetch(json.author_url, { signal: AbortSignal.timeout(2500),
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
              });
              if (chanRes.ok) {
                const chanHtml = await chanRes.text();
                const avatarMatch = chanHtml.match(/(https:\/\/yt3\.ggpht\.com\/[a-zA-Z0-9_-]+=s[0-9]+-c-k-c0x00ffffff-no-rj)/) ||
                                    chanHtml.match(/(https:\/\/yt3\.ggpht\.com\/[a-zA-Z0-9_-]+)/);
                if (avatarMatch && avatarMatch[1]) {
                  authorAvatar = avatarMatch[1];
                }
              }
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (err) {
        // fallback
      }

      if (!authorAvatar) {
        const cleanHandle = authorHandle.replace(/^@/, "");
        if (cleanHandle && cleanHandle !== "youtube.creator") {
          authorAvatar = `https://unavatar.io/youtube/${cleanHandle}`;
        }
      }

      return res.json({ 
        thumbnailUrl,
        authorName,
        authorHandle,
        authorAvatar,
        authorUrl: `https://youtube.com/watch?v=${videoId}`,
        title,
        views: stats.views,
        likes: stats.likes,
        duration: stats.duration
      });
    }

    res.json({ 
      thumbnailUrl: null,
      authorName: "Travel Creator",
      authorHandle: urlHandle || "@ahlancambodia",
      authorAvatar: null,
      title: "Exploring Cambodia's hidden gems and Halal hotspots ✨",
      views: stats.views,
      likes: stats.likes,
      duration: stats.duration
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
