import React, { useState, useEffect } from "react";
import { 
  Youtube, Instagram, Video, Play, Eye, ThumbsUp, ExternalLink
} from "lucide-react";

export interface SocialVideo {
  platform: string;
  url: string;
  title?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  creatorName?: string;
  creatorHandle?: string;
  creatorAvatar?: string;
  authorAvatar?: string;
  views?: string;
  likes?: string;
  duration?: string;
}

interface SocialVideoCardProps {
  key?: React.Key | number | string;
  video: SocialVideo;
  fallbackName?: string;
  restaurantName?: string;
  restaurantImage?: string;
}

export function getAutoThumbnail(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. Check if the URL is actually a direct image
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed) || trimmed.includes("images.unsplash.com") || trimmed.includes("firebasestorage.googleapis.com")) {
    return trimmed;
  }

  // 2. YouTube Thumbnail
  try {
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const ytMatch = trimmed.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://img.youtube.com/vi/${ytMatch[2]}/hqdefault.jpg`;
    }
  } catch (e) {
    // ignore
  }

  // 3. Instagram Thumbnail
  try {
    const instaRegExp = /instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/i;
    const instaMatch = trimmed.match(instaRegExp);
    if (instaMatch && instaMatch[2]) {
      return `/api/proxy-image?url=${encodeURIComponent('https://www.instagram.com/p/' + instaMatch[2] + '/media/?size=l')}`;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export function getInitials(name?: string): string {
  if (!name) return "RE";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().substring(0, 2);
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export function SocialVideoCard({ video, fallbackName, restaurantName, restaurantImage }: SocialVideoCardProps) {
  const [resolvedThumb, setResolvedThumb] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    authorName?: string;
    authorHandle?: string;
    authorAvatar?: string;
    authorUrl?: string;
    title?: string;
    views?: string;
    likes?: string;
    duration?: string;
  } | null>(null);

  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [avatarErrorCount, setAvatarErrorCount] = useState<number>(0);

  const userExplicitThumb = (video.thumbnailUrl && video.thumbnailUrl.trim()) ? video.thumbnailUrl.trim() : (video.thumbnail && video.thumbnail.trim() ? video.thumbnail.trim() : null);

  useEffect(() => {
    const staticThumb = getAutoThumbnail(video.url);

    if (userExplicitThumb) {
      let thumb = userExplicitThumb;
      if (thumb.includes("tiktokcdn.com") || thumb.includes("byteoversea.com") || thumb.includes("cdninstagram.com")) {
        thumb = `/api/proxy-image?url=${encodeURIComponent(thumb)}`;
      }
      setResolvedThumb(thumb);
    } else if (staticThumb) {
      setResolvedThumb(staticThumb);
    } else if (restaurantImage) {
      setResolvedThumb(restaurantImage);
    } else {
      setResolvedThumb(null);
    }

    if (video.url && video.url.trim()) {
      fetch(`/api/video-thumbnail?url=${encodeURIComponent(video.url.trim())}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            // ONLY update thumbnail if user DID NOT manually provide a custom cover image!
            if (!userExplicitThumb && data.thumbnailUrl) {
              let thumb = data.thumbnailUrl;
              if (thumb.includes("tiktokcdn.com") || thumb.includes("byteoversea.com") || thumb.includes("cdninstagram.com")) {
                thumb = `/api/proxy-image?url=${encodeURIComponent(thumb)}`;
              }
              setResolvedThumb(thumb);
            }
            setMetadata(data);
          }
        })
        .catch(() => {/* Fallback to static props */});
    }
  }, [video.url, userExplicitThumb, restaurantImage]);

  const isTikTok = video.platform === "tiktok";
  const isInsta = video.platform === "instagram";
  const isYT = video.platform === "youtube";

  let platformLabel = "Social Reel";
  if (isTikTok) platformLabel = "TikTok";
  else if (isInsta) platformLabel = "Instagram";
  else if (isYT) platformLabel = "YouTube";

  const authorName = video.creatorName || metadata?.authorName || `${fallbackName || restaurantName || "Muslim Traveler"}`;
  const authorHandle = video.creatorHandle || metadata?.authorHandle || `@${(fallbackName || restaurantName || "ahlancambodia").toLowerCase().replace(/\s+/g, "")}`;
  const displayTitle = video.title || metadata?.title || `Delicious moments captured at ${fallbackName || restaurantName || "Cambodia"}! ✨🥗`;
  
  // Dynamic stats priority
  const views = (video.views && video.views !== "140K") ? video.views : (metadata?.views || "140K");
  const likes = (video.likes && video.likes !== "12K") ? video.likes : (metadata?.likes || "12K");
  const duration = (video.duration && video.duration !== "0:45") ? video.duration : (metadata?.duration || "0:45");

  // Generate deterministic premium colors for the avatar background fallback
  const colors = [
    "from-cyan-500 to-blue-500",
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500"
  ];
  const charSum = authorName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarGradient = colors[charSum % colors.length];

  // Dynamically resolve social profile avatar logo from video link
  useEffect(() => {
    const explicit = video.creatorAvatar || video.authorAvatar || metadata?.authorAvatar;
    if (explicit && explicit.trim()) {
      setAvatarSrc(explicit.trim());
      return;
    }

    const cleanHandle = (authorHandle || "").replace(/^@/, "").trim();
    if (cleanHandle && !["tiktok.creator", "insta.cambodia", "yt.creator", "cambodia.explorer", "ahlancambodia"].includes(cleanHandle)) {
      if (isTikTok) {
        setAvatarSrc(`https://unavatar.io/tiktok/${cleanHandle}`);
      } else if (isInsta) {
        setAvatarSrc(`https://unavatar.io/instagram/${cleanHandle}`);
      } else if (isYT) {
        setAvatarSrc(`https://unavatar.io/youtube/${cleanHandle}`);
      } else {
        setAvatarSrc(`https://unavatar.io/${cleanHandle}`);
      }
    } else {
      setAvatarSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0284c7&color=fff&bold=true`);
    }
  }, [video.creatorAvatar, video.authorAvatar, metadata?.authorAvatar, authorHandle, authorName, isTikTok, isInsta, isYT]);

  const handleAvatarError = () => {
    if (avatarErrorCount === 0) {
      setAvatarErrorCount(1);
      setAvatarSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0284c7&color=fff&bold=true`);
    } else if (avatarErrorCount === 1) {
      setAvatarErrorCount(2);
      setAvatarSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0f172a&color=38bdf8&bold=true`);
    } else {
      setAvatarErrorCount(3);
    }
  };

  return (
    <div 
      className="group relative flex flex-col rounded-[24px] bg-[#0c101d] border border-slate-800/80 hover:border-slate-700/80 shadow-lg hover:shadow-2xl transition-all duration-300 w-full h-[520px] overflow-hidden"
    >
      {/* 1. Upper Video Player Area */}
      <div className="relative w-full h-[310px] bg-slate-950 overflow-hidden">
        {resolvedThumb ? (
          <img 
            src={resolvedThumb} 
            alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none"
            referrerPolicy="no-referrer"
            onError={() => {
              if (restaurantImage && resolvedThumb !== restaurantImage) {
                setResolvedThumb(restaurantImage);
              } else {
                setResolvedThumb(null);
              }
            }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${
            isTikTok ? "from-slate-950 via-slate-900 to-slate-950" :
            isInsta ? "from-purple-950 via-rose-950 to-amber-950" :
            "from-red-950 via-slate-950 to-red-950"
          }`} />
        )}

        {/* Video Scrim Gradient Overlay for readability of top badges & play state */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 transition-opacity duration-300" />

        {/* Dynamic Centered Play Button Emblem */}
        <a 
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300 z-10"
        >
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </a>

        {/* Top-Left Platform Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10">
          <span className="opacity-90">
            {isYT && <Youtube className="w-3.5 h-3.5 text-red-500" />}
            {isInsta && <Instagram className="w-3.5 h-3.5 text-pink-400" />}
            {isTikTok && <Video className="w-3.5 h-3.5 text-cyan-400" />}
            {!isYT && !isInsta && !isTikTok && <Play className="w-3.5 h-3.5 text-brand-blue-accent" />}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-100">
            {platformLabel}
          </span>
        </div>

        {/* Bottom-Right Duration Stamp */}
        <div className="absolute bottom-4 right-4 z-10 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/5 text-[10px] font-mono font-bold text-slate-200">
          {duration}
        </div>
      </div>

      {/* 2. Lower Text & Meta Area */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-[#111625] border-t border-slate-800/40">
        
        {/* Creator Info Header Row */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            {/* Round Creator Initials Avatar or Real Logo */}
            <div className="relative shrink-0">
              {avatarSrc && avatarErrorCount < 3 ? (
                <img
                  src={avatarSrc}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700/50 shadow-inner"
                  referrerPolicy="no-referrer"
                  onError={handleAvatarError}
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold text-white uppercase tracking-wider bg-gradient-to-tr ${avatarGradient} shadow-inner`}>
                  {getInitials(authorName)}
                </div>
              )}
            </div>

            {/* Creator Text details */}
            <div className="flex-1 min-w-0">
              <span className="block text-slate-100 font-bold text-xs sm:text-[13px] uppercase tracking-wider truncate leading-tight">
                {authorName}
              </span>
              <span className="block text-slate-400 font-mono text-[11px] truncate mt-0.5">
                {authorHandle}
              </span>
            </div>
          </div>

          {/* Fully Displayed Description Title / Original Video Caption */}
          <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed line-clamp-3 font-medium font-sans border-l-2 border-brand-blue-accent/70 pl-2.5 my-1 py-1 bg-slate-900/50 rounded-r-lg shadow-inner">
            {displayTitle}
          </p>
        </div>

        {/* Footer Meta Row: Stats and Watch Reel Button */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/60 mt-4">
          {/* Social Stats */}
          <div className="flex items-center gap-3.5 text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>{views}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-slate-500" />
              <span>{likes}</span>
            </span>
          </div>

          <a 
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-brand-blue-accent hover:text-white transition-colors bg-brand-blue-accent/10 hover:bg-brand-blue-accent px-3 py-2 rounded-xl border border-brand-blue-accent/30 hover:border-transparent cursor-pointer"
          >
            <span>Watch</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
