import React, { useState } from "react";
import { 
  ArrowLeft, Heart, Star, MapPin, Sparkles, CheckCircle, 
  Tv, Play, Utensils, BookOpen, Compass, Calendar, 
  ExternalLink, ChevronRight, Award, Info, ShieldCheck, Clock, Bookmark,
  Instagram, Youtube, ThumbsUp, MessageCircle, Send, Share2, Eye
} from "lucide-react";
import { Destination, Hotel, TourPackage, Experience, Mosque, Restaurant, TravelGuide } from "../types";
import { SocialVideoCard } from "./SocialVideoCard";
import { NO_PHOTO_AVAILABLE_PLACEHOLDER } from "../googlePlacesPhotoService";

interface DestinationDetailPageProps {
  destination: Destination;
  onBack: () => void;
  hotels: Hotel[];
  packages: TourPackage[];
  experiences: Experience[];
  mosques: Mosque[];
  restaurants: Restaurant[];
  guides: TravelGuide[];
  wishlist: { [key: string]: string[] };
  onToggleWishlist: (category: string, id: string) => void;
  onSelectItem: (type: "hotel" | "package" | "experience" | "mosque" | "restaurant" | "guide", item: any) => void;
  onInquire: () => void;
  onUpdateDestination?: (updatedDest: Destination) => void;
  onNavigateView?: (view: "home" | "destinations" | "packages" | "hotels" | "experiences" | "restaurants" | "mosques" | "inspiration") => void;
}

interface SocialCard {
  id: string;
  platform: "tiktok" | "instagram" | "youtube";
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  thumbnail: string;
  title: string;
  views: string;
  likes: string;
  duration: string;
  musicTrack?: string;
  subscribers?: string;
  comments: { user: string; avatar: string; text: string; time: string; likes: string }[];
}

const TikTokIcon = () => (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.82.95 1.9 1.64 3.09 1.98v3.91c-1.2-.18-2.36-.72-3.32-1.48-.68-.53-1.22-1.21-1.58-1.99v7.7c0 3.38-2.15 6.46-5.32 7.42-3.05.95-6.42-.16-8.23-2.67-1.93-2.61-1.78-6.31.33-8.73 1.83-2.14 4.88-2.9 7.5-.18V5.3c-.02-1.76.01-3.52-.01-5.28z" />
  </svg>
);

function getAutoThumbnail(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed) || trimmed.includes("images.unsplash.com")) {
    return trimmed;
  }

  try {
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const ytMatch = trimmed.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://img.youtube.com/vi/${ytMatch[2]}/hqdefault.jpg`;
    }
  } catch (e) {
    // ignore
  }

  try {
    const instaRegExp = /instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/i;
    const instaMatch = trimmed.match(instaRegExp);
    if (instaMatch && instaMatch[2]) {
      return `https://www.instagram.com/p/${instaMatch[2]}/media/?size=l`;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

function getInitials(name?: string): string {
  if (!name) return "RE";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().substring(0, 2);
  }
  return parts[0].substring(0, 2).toUpperCase();
}

const destinationOverviewData: {
  [key: string]: {
    editorialIntro: string;
    keyFeatures: string[];
    indicators: { icon: any; label: string; value: string }[];
  }
} = {
  "siem-reap": {
    editorialIntro: "Siem Reap welcomes Muslim travelers with a warm combination of ancient history and modern hospitality. As the gateway to Angkor Wat, the city features a beautifully established Cham Muslim community centered around Neak Pean Mosque. Travelers can effortlessly balance their schedules between temple explorations and gourmet Halal-certified Khmer dining.",
    keyFeatures: [
      "Centrally-located Neak Pean Mosque with welcoming local congregation.",
      "Vibrant street food stall clusters offering fully-verified halal Muslim family recipes.",
      "Dedicated local Muslim guides available for private Angkor historical tours."
    ],
    indicators: [
      { icon: Calendar, label: "Best Time to Visit", value: "November to February" },
      { icon: Clock, label: "Ideal Stay Duration", value: "3 - 4 Days" },
      { icon: MapPin, label: "Mosque Proximity", value: "10-15 mins from Temple Gates" },
      { icon: ShieldCheck, label: "Halal Vibe Index", value: "Excellent Accessibility" }
    ]
  },
  "phnom-penh": {
    editorialIntro: "Cambodia's capital Phnom Penh is a sophisticated riverside metropolis boasting grand architecture, stunning promenades, and deep historical resonance. For practicing Muslims, the city is a premier destination, anchored by the spectacular, white-marble Al-Serkal Grand Mosque and a rich culinary tapestry of traditional Halal-certified river cruises.",
    keyFeatures: [
      "Home to Al-Serkal Grand Mosque, the country's main spiritual center.",
      "Excellent selection of high-end, certified Halal fine dining and Indian-Khmer fusion.",
      "Seamless prayer space availability across premium municipal establishments."
    ],
    indicators: [
      { icon: Calendar, label: "Best Time to Visit", value: "December to February" },
      { icon: Clock, label: "Ideal Stay Duration", value: "2 - 3 Days" },
      { icon: MapPin, label: "Mosque Proximity", value: "Central Boeung Kak District" },
      { icon: ShieldCheck, label: "Halal Vibe Index", value: "Highly Accommodating" }
    ]
  },
  "koh-rong": {
    editorialIntro: "For those seeking complete serenity, the pristine, white-sand islands of Koh Rong offer a gorgeous tropical sanctuary. Luxury resorts here have elegantly adapted to cater to elite Muslim travelers, offering fully secluded infinity pool villas that guarantee absolute privacy, along with bespoke chefs trained in preparing 100% Halal culinary selections.",
    keyFeatures: [
      "Bespoke private-pool sanctuary villas designed with complete privacy in mind.",
      "Custom menus featuring fresh, premium seafood and certified halal ingredients.",
      "Secluded, calm coves ideal for private family swimming and night snorkeling."
    ],
    indicators: [
      { icon: Calendar, label: "Best Time to Visit", value: "November to April" },
      { icon: Clock, label: "Ideal Stay Duration", value: "3 - 5 Days" },
      { icon: MapPin, label: "Mosque Proximity", value: "Sok San Village (Local Mosque)" },
      { icon: ShieldCheck, label: "Halal Vibe Index", value: "Luxury Privacy Preferred" }
    ]
  },
  "kampot-kep": {
    editorialIntro: "Kampot & Kep present an artistic escape defined by slow-moving rivers, vintage colonial architectures, and world-renowned organic pepper farms. The southern coastline is incredibly welcoming to Muslim travelers, with a large population of indigenous Cham Muslim fishing families who supply the local crab markets with fully Halal-prepared ocean delicacies.",
    keyFeatures: [
      "Renowned local Cham Muslim fishermen operating fresh seafood stalls in Kep.",
      "Beautiful organic pepper farm tours offering halal culinary pairings.",
      "Peaceful riverside resorts located close to active rural prayer halls."
    ],
    indicators: [
      { icon: Calendar, label: "Best Time to Visit", value: "November to March" },
      { icon: Clock, label: "Ideal Stay Duration", value: "2 - 3 Days" },
      { icon: MapPin, label: "Mosque Proximity", value: "Active Local Cham Hamlets" },
      { icon: ShieldCheck, label: "Halal Vibe Index", value: "Authentic & Coastal" }
    ]
  },
  "battambang": {
    editorialIntro: "As Cambodia's artistic capital, Battambang is a window into the country's creative and agricultural soul. Framed by emerald rice paddies and stunning French-colonial store facades, the region is also home to traditional Cham weaving villages along the peaceful Sangkae River, where visitors can interact with local weavers and witness traditional lifestyles.",
    keyFeatures: [
      "Scenic Cham Muslim weaving hamlets preserving ancestral handloom traditions.",
      "Vintage Bamboo Train rides passing through fertile, serene countryside.",
      "Charming, quiet local mosques situated along the scenic riverbanks."
    ],
    indicators: [
      { icon: Calendar, label: "Best Time to Visit", value: "October to January" },
      { icon: Clock, label: "Ideal Stay Duration", value: "2 Days" },
      { icon: MapPin, label: "Mosque Proximity", value: "Sangkae Riverbank Hamlets" },
      { icon: ShieldCheck, label: "Halal Vibe Index", value: "Heritage & Community" }
    ]
  },
  "kratie": {
    editorialIntro: "Kratie is an untouched eco-tourism haven located on the banks of the mighty Mekong River. Famous for the endangered Irrawaddy freshwater dolphins that surface in its deep pools, the area is rich in Cham Islamic fishing heritage. Cycling around the car-free Koh Trong island reveals lush organic pomelo orchards and traditional stilt houses.",
    keyFeatures: [
      "Gentle dolphin-watching tours conducted on quiet, non-motorized wooden kayaks.",
      "Charming, remote island communities with active prayer spaces and warm locals.",
      "Traditional Cham bamboo sticky rice, hand-prepared using halal ingredients."
    ],
    indicators: [
      { icon: Calendar, label: "Best Time to Visit", value: "November to May" },
      { icon: Clock, label: "Ideal Stay Duration", value: "1 - 2 Days" },
      { icon: MapPin, label: "Mosque Proximity", value: "Koh Trong & Kampi Hamlets" },
      { icon: ShieldCheck, label: "Halal Vibe Index", value: "Serene & Eco-Friendly" }
    ]
  }
};

export default function DestinationDetailPage({
  destination,
  onBack,
  hotels,
  packages,
  experiences,
  mosques,
  restaurants,
  guides,
  wishlist,
  onToggleWishlist,
  onSelectItem,
  onInquire,
  onUpdateDestination,
  onNavigateView
}: DestinationDetailPageProps) {
  const [activeTab, setActiveTab] = useState<"all" | "hotels" | "experiences" | "packages" | "mosques" | "dining" | "social" | "blogs">("all");
  const [socialFilter, setSocialFilter] = useState<"all" | "tiktok" | "instagram" | "youtube">("all");
  const [selectedSocialCard, setSelectedSocialCard] = useState<SocialCard | null>(null);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<{ [key: string]: any[] }>({});
  const [likedCards, setLikedCards] = useState<{ [key: string]: boolean }>({});
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

  // New state for manual social video form
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [formPlatform, setFormPlatform] = useState<"tiktok" | "instagram" | "youtube" | "other">("tiktok");
  const [formUrl, setFormUrl] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCreatorName, setFormCreatorName] = useState("");
  const [formCreatorHandle, setFormCreatorHandle] = useState("");
  const [formCreatorAvatar, setFormCreatorAvatar] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [isCapturingMetadata, setIsCapturingMetadata] = useState(false);
  const [autoCapturedNotice, setAutoCapturedNotice] = useState("");

  const handleVideoUrlChange = (val: string) => {
    setFormUrl(val);
    setAutoCapturedNotice("");
    setFormError("");

    const lower = val.toLowerCase();
    if (lower.includes("tiktok.com")) {
      setFormPlatform("tiktok");
    } else if (lower.includes("instagram.com")) {
      setFormPlatform("instagram");
    } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      setFormPlatform("youtube");
    }

    if (val.trim().length > 10 && (val.includes("http://") || val.includes("https://"))) {
      setIsCapturingMetadata(true);
      fetch(`/api/video-thumbnail?url=${encodeURIComponent(val.trim())}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            if (data.title) setFormTitle(data.title);
            if (data.authorName) setFormCreatorName(data.authorName);
            if (data.authorHandle) setFormCreatorHandle(data.authorHandle.startsWith("@") ? data.authorHandle : "@" + data.authorHandle);
            if (data.authorAvatar) setFormCreatorAvatar(data.authorAvatar);
            if (data.thumbnailUrl) setFormThumbnailUrl(data.thumbnailUrl);
            setAutoCapturedNotice("✨ Cover image, title & creator profile photo auto-captured!");
          }
        })
        .catch(() => {/* Silent fallback */})
        .finally(() => setIsCapturingMetadata(false));
    }
  };

  const isSaved = wishlist.destinations?.includes(destination.id);

  const modalCreatorName = selectedSocialCard ? (selectedSocialCard.creatorName || (selectedSocialCard as any).restaurantName || destination.name) : "";
  const modalCreatorHandle = selectedSocialCard ? (selectedSocialCard.creatorHandle || `@${((selectedSocialCard as any).restaurantName || destination.name).toLowerCase().replace(/\s+/g, "")}`) : "";
  const modalCreatorAvatar = selectedSocialCard ? (selectedSocialCard.creatorAvatar || getInitials(modalCreatorName)) : "";

  // Filter content based on destination ID
  const cityKey = destination.id === "phnom-penh" ? "Phnom Penh" : destination.name;
  
  const filteredHotels = hotels.filter(h => 
    h.location.toLowerCase().includes(cityKey.toLowerCase()) || 
    h.description.toLowerCase().includes(cityKey.toLowerCase())
  );

  const filteredPackages = packages.filter(p => 
    p.description.toLowerCase().includes(cityKey.toLowerCase()) || 
    p.itineraryOverview.some(day => day.toLowerCase().includes(cityKey.toLowerCase()))
  );

  const filteredExperiences = experiences.filter(e => 
    e.location.toLowerCase().includes(cityKey.toLowerCase()) || 
    e.description.toLowerCase().includes(cityKey.toLowerCase())
  );

  const filteredMosques = mosques.filter(m => 
    m.location.toLowerCase().includes(cityKey.toLowerCase()) || 
    m.description.toLowerCase().includes(cityKey.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(r => 
    r.location.toLowerCase().includes(cityKey.toLowerCase()) || 
    r.description.toLowerCase().includes(cityKey.toLowerCase())
  );

  // Dynamic social videos gathered from tagged restaurants for this destination
  const restaurantSocialVideos = filteredRestaurants.flatMap((rest) => {
    if (!rest.socialVideos) return [];
    return rest.socialVideos.map((video, idx) => ({
      id: `restaurant-${rest.id}-video-${idx}`,
      platform: (video.platform === "other" || !["tiktok", "instagram", "youtube"].includes(video.platform)) ? "tiktok" as const : video.platform as "tiktok" | "instagram" | "youtube",
      creatorName: video.creatorName,
      creatorHandle: video.creatorHandle,
      creatorAvatar: video.creatorAvatar,
      thumbnail: video.thumbnailUrl,
      title: video.title,
      views: video.views,
      likes: video.likes,
      duration: video.duration,
      musicTrack: `original sound - ${rest.name}`,
      url: video.url,
      restaurantName: rest.name,
      comments: [
        { user: "Sarah_M", avatar: "S", text: "Adding this place to my itinerary!", time: "2h ago", likes: "32" }
      ]
    }));
  });

  const manualDestinationSocialVideos = (destination.socialVideos || []).map((video, idx) => ({
    id: `destination-manual-${destination.id}-${idx}`,
    platform: (video.platform === "other" || !["tiktok", "instagram", "youtube"].includes(video.platform)) ? "tiktok" as const : video.platform as "tiktok" | "instagram" | "youtube",
    creatorName: video.creatorName,
    creatorHandle: video.creatorHandle,
    creatorAvatar: video.creatorAvatar,
    thumbnail: video.thumbnailUrl,
    title: video.title,
    views: video.views,
    likes: video.likes,
    duration: video.duration,
    musicTrack: "Aesthetic - Tollan Kim",
    url: video.url,
    comments: []
  }));

  const allSocialCards = [
    ...restaurantSocialVideos,
    ...manualDestinationSocialVideos
  ];

  const handlePostComment = (cardId: string) => {
    if (!newComment.trim()) return;
    const currentList = localComments[cardId] || [];
    const updatedList = [
      ...currentList,
      {
        user: "You",
        avatar: "U",
        text: newComment,
        time: "Just now",
        likes: "0"
      }
    ];
    setLocalComments({
      ...localComments,
      [cardId]: updatedList
    });
    setNewComment("");
  };

  const handleAddVideoSubmit = () => {
    if (!formUrl.trim()) {
      setFormError("Video URL is required.");
      return;
    }
    const newVideo = {
      platform: formPlatform,
      url: formUrl.trim(),
      title: formTitle.trim() || `Amazing moments in ${destination.name}! ✨`,
      creatorName: formCreatorName.trim() || undefined,
      creatorHandle: formCreatorHandle.trim() || undefined,
      creatorAvatar: formCreatorAvatar.trim() || undefined,
      thumbnailUrl: formThumbnailUrl.trim() || getAutoThumbnail(formUrl) || undefined
    };

    if (onUpdateDestination) {
      const updatedDest = {
        ...destination,
        socialVideos: [
          ...(destination.socialVideos || []),
          newVideo
        ]
      };
      onUpdateDestination(updatedDest);
    }

    setFormUrl("");
    setFormTitle("");
    setFormCreatorName("");
    setFormCreatorHandle("");
    setFormCreatorAvatar("");
    setFormThumbnailUrl("");
    setFormError("");
    setShowAddVideoForm(false);
  };

  const toggleLikeCard = (cardId: string) => {
    setLikedCards({
      ...likedCards,
      [cardId]: !likedCards[cardId]
    });
  };

  // Custom curated Phnom Penh Dining Guides
  const phnomPenhDiningGuides = [
    {
      title: "Mekong Riverside Dining Guide",
      author: "By Ahlan Editorial Team",
      readTime: "5 min read",
      description: "From premium fine-dining spots like Saraband to traditional wooden Cham family-run restaurants directly overlooking the beautiful Tonlé Sap River confluence.",
      tips: [
        "Ask for traditional Khmer Lemongrass tea before meals",
        "Many local places close right after Isha prayer",
        "Most seafood eateries along the river are fully halal-friendly"
      ]
    },
    {
      title: "Chbar Ampov Street Delicacies",
      author: "By Chef Amina Halal-Vetted",
      readTime: "4 min read",
      description: "A comprehensive map of clean, Muslim-owned street kiosks serving piping hot beef skewers (Sách Ko Ang), Num Banh Chok, and delicious traditional sweet sticky rice.",
      tips: [
        "Visit between 4:00 PM and 8:00 PM for the freshest bites",
        "Look for the authentic Arabic green 'Halal' crescent signage",
        "Try the grilled banana cake wrapped in banana leaves"
      ]
    }
  ];

  // Custom curated Phnom Penh Inspirations
  const phnomPenhInspirations = [
    {
      title: "Exploring the historic Cham Silk Weaving Island (Koh Dach)",
      category: "Cultural Heritage",
      desc: "Embark on a traditional local wooden boat from Phnom Penh's port to Koh Dach island. Meet three-generation Cham weavers keeping ancient Khmer-Islamic silk patterns alive.",
      icon: Sparkles
    },
    {
      title: "Sunrise Prayers at Al-Serkal Grand Mosque",
      category: "Spiritual Sanctity",
      desc: "Witness the peaceful morning light reflect off the grand white-marble courtyard. Meet the local Imam for a short chat about Cambodia's friendly religious harmony.",
      icon: Compass
    }
  ];

  // Dynamically filter travel guides passed from props where destinationId matches this destination
  const selectedBlogs = (guides || []).filter(g => {
    if (!g.destinationId || g.destinationId === "general") return false;
    const targetId = g.destinationId.toLowerCase();
    const currentDestId = destination.id.toLowerCase();
    const currentDestName = destination.name.toLowerCase();
    const currentDestSlug = currentDestName.replace(/\s+/g, '-');
    return targetId === currentDestId || targetId === currentDestName || targetId === currentDestSlug;
  });

  const filteredSocialCards = allSocialCards.filter(card => {
    if (socialFilter === "all") return true;
    return card.platform === socialFilter;
  });

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in" id="destination-detail-root">
      
      {/* --- Majestic Full-Width Hero Section --- */}
      <div className="relative w-full h-[350px] sm:h-[400px] md:h-[420px] overflow-hidden">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-10000 ease-out"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* --- Overlay Breadcrumb Navigation & Back Header --- */}
        <div className="absolute top-0 left-0 right-0 z-20 py-5 bg-gradient-to-b from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button 
              onClick={() => onNavigateView("destinations")}
              className="flex items-center gap-2 text-white/95 hover:text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer bg-black/20 hover:bg-black/45 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back</span>
            </button>
            
            <div className="font-mono text-[10px] text-white/70 uppercase tracking-widest hidden sm:flex items-center gap-2">
              <button 
                onClick={() => onNavigateView("home")} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                HOME
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <button 
                onClick={() => onNavigateView("destinations")} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                DESTINATIONS
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <span className="text-white/95 font-bold tracking-widest truncate max-w-[200px] sm:max-w-[300px] inline-block uppercase">{destination.name}</span>
            </div>
          </div>
        </div>
        
        {/* Content Overlaid */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6 sm:pb-8 space-y-4">
          
          {/* Title & Description */}
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
              {destination.name}
            </h1>
            <p className="hidden sm:block text-white/95 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-3xl drop-shadow-sm">
              {destination.description}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onToggleWishlist("destinations", destination.id)}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-6 py-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-luxury flex items-center gap-2.5 shadow-md cursor-pointer border border-white/15"
            >
              <Heart className={`w-4 h-4 transition-colors ${isSaved ? "text-brand-red fill-brand-red" : "text-white/70"}`} />
              <span>{isSaved ? "Saved in Collection" : "Save to Collection"}</span>
            </button>

            <button 
              onClick={onInquire}
              className="bg-brand-blue hover:bg-brand-blue-accent text-white font-mono border border-brand-blue-accent/20 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Inquire bespoke package
            </button>
          </div>

        </div>
      </div>

      {/* --- Tab Navigation: Beautiful Full-Width Seamless Dark Bar --- */}
      <div className="sticky top-[81px] sm:top-[97px] z-30 w-full bg-brand-blue/95 backdrop-blur-md border-b border-brand-blue-accent/25 shadow-md py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Destination Name & Back Button */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/90 hover:text-brand-blue-accent font-mono text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-blue-accent" />
              <span>BACK</span>
            </button>
            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <h2 className="text-white font-serif font-bold text-sm sm:text-base uppercase tracking-wider">
              {destination.name}
            </h2>
          </div>

          {/* Tab buttons (without counts) */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-none">
            <div className="flex justify-start md:justify-end gap-1 sm:gap-2 whitespace-nowrap py-1">
              {[
                { id: "all", label: "Overview" },
                { id: "experiences", label: "Experiences" },
                { id: "hotels", label: "Stays" },
                { id: "packages", label: "Packages" },
                { id: "mosques", label: "Mosques" },
                { id: "dining", label: "Dining" },
                { id: "social", label: "Social Vlogs" },
                { id: "blogs", label: "Journals" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      const el = document.getElementById("detailed-content-anchor");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "bg-brand-blue text-white shadow-md border border-brand-blue-accent/30"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <div id="detailed-content-anchor" className="h-10" />

      {/* --- Main Content Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {/* --- Tab Content: Elegant Destination Overview --- */}
        {activeTab === "all" && (
          <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                Essential Destination Briefing
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                Overview & Traveler Insights
              </h2>
            </div>

            {/* Overview Content */}
            <div className="space-y-8">
              {/* Editorial & Heritage (Full Width) */}
              <div className="space-y-6 py-2">
                <div className="space-y-4">
                  {(destination.overviewText || destinationOverviewData[destination.id]?.editorialIntro || `${destination.name} is an extraordinary destination in Cambodia, offering unique cultural discoveries, stunning historical monuments, and exceptional hospitality for travelers.`)
                    .split("\n")
                    .map((p) => p.trim())
                    .filter((p) => p.length > 0)
                    .map((para, idx) => (
                      <p key={idx} className="text-brand-charcoal/80 text-sm sm:text-base leading-relaxed font-sans">
                        {para}
                      </p>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-brand-blue-accent/10">
                  {(destination.insights || destinationOverviewData[destination.id]?.keyFeatures || destination.highlights || []).map((feat, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="bg-brand-blue/10 text-brand-blue-accent p-1.5 rounded-lg shrink-0 border border-brand-blue-accent/15 mt-0.5">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-brand-charcoal/85 leading-relaxed font-sans">
                        {feat}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab Content: Experiences --- */}
        {(activeTab === "all" || activeTab === "experiences") && filteredExperiences.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-brand-blue-accent/25 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Handpicked Local Pursuits
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Curated Experiences in {destination.name}
                </h2>
              </div>
              {activeTab === "all" && (
                <button 
                  onClick={() => {
                    if (onNavigateView) {
                      onNavigateView("experiences");
                    } else {
                      setActiveTab("experiences");
                    }
                  }} 
                  className="text-xs font-mono text-brand-blue-accent hover:text-brand-charcoal font-bold tracking-wider uppercase flex items-center gap-1.5 transition-luxury cursor-pointer"
                >
                  <span>View All Experiences ({filteredExperiences.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredExperiences.map((exp) => (
                <div 
                  key={exp.id}
                  className="bg-white rounded-3xl overflow-hidden border border-brand-blue-accent/15 shadow-sm hover:scale-[1.01] hover:border-brand-blue-accent hover:shadow-lg transition-luxury flex flex-col sm:flex-row"
                >
                  <div className="sm:w-2/5 h-52 sm:h-auto relative overflow-hidden">
                    <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
                    <span className={`absolute top-4 left-4 text-[9px] font-mono font-bold uppercase tracking-widest text-white shadow-md border border-white/10 px-3.5 py-1.5 rounded-lg ${
                      exp.category.toLowerCase() === "heritage" || exp.category.toLowerCase() === "nature"
                        ? "bg-brand-blue-accent"
                        : "bg-cambodia-red"
                    }`}>
                      {exp.category}
                    </span>
                  </div>
                  <div className="p-6 sm:p-8 sm:w-3/5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="font-serif font-bold text-lg text-brand-charcoal tracking-wide leading-snug">
                        {exp.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-brand-charcoal/60 bg-brand-lightbg px-3 py-1.5 rounded-lg border border-brand-blue-accent/10 w-fit">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-blue-accent" />
                          {exp.duration}
                        </span>
                        <span className="text-brand-blue-accent/40">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue-accent" />
                          {exp.location.split(",")[0]}
                        </span>
                      </div>
                      <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed">
                        {exp.shortDescription || exp.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-between">
                      <button
                        onClick={() => onToggleWishlist("experiences", exp.id)}
                        className="text-xs font-mono text-brand-charcoal/50 hover:text-brand-red flex items-center gap-1.5 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${wishlist.experiences?.includes(exp.id) ? "text-brand-red fill-brand-red" : ""}`} />
                        <span>Save</span>
                      </button>
                      <a 
                        href={`/experiences/${(exp.name || exp.id).replace(/\s+/g, "-")}`}
                        onClick={(e) => {
                          if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                            e.preventDefault();
                            onSelectItem("experience", exp);
                          }
                        }}
                        className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer inline-block text-center"
                      >
                        Explore →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab Content: Hotels --- */}
        {(activeTab === "all" || activeTab === "hotels") && filteredHotels.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-brand-blue-accent/25 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Verified Royal Lodgings
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  WHERE TO STAY
                </h2>
              </div>
              {activeTab === "all" && (
                <button 
                  onClick={() => {
                    if (onNavigateView) {
                      onNavigateView("hotels");
                    } else {
                      setActiveTab("hotels");
                    }
                  }} 
                  className="text-xs font-mono text-brand-blue-accent hover:text-brand-charcoal font-bold tracking-wider uppercase flex items-center gap-1.5 transition-luxury cursor-pointer"
                >
                  <span>View All Hotels ({filteredHotels.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="bg-white rounded-3xl overflow-hidden border border-brand-blue-accent/15 shadow-sm hover:scale-[1.01] hover:border-brand-blue-accent/30 hover:shadow-lg transition-luxury flex flex-col justify-between"
                >
                  <div className="h-60 relative overflow-hidden">
                    <img 
                      src={hotel.image || NO_PHOTO_AVAILABLE_PLACEHOLDER} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex gap-1 bg-brand-blue/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-mono text-amber-400">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                      <h3 className="font-serif font-bold text-xl leading-tight tracking-wide">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-white/80 flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-brand-blue-accent" />
                        {hotel.location}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed">
                      {hotel.description}
                    </p>

                    <div className="space-y-3 bg-brand-lightbg border border-brand-blue-accent/15 p-5 rounded-2xl">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-brand-blue-accent shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-mono font-bold text-brand-charcoal uppercase tracking-wider text-[9px] block mb-0.5">{hotel.prayerFacilitiesLabel || "Prayer Facilities"}:</span>
                          <span className="text-brand-charcoal/80 font-medium">{hotel.prayerFacilities}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 pt-3 border-t border-brand-blue-accent/10">
                        <Utensils className="w-4 h-4 text-brand-blue-accent shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-mono font-bold text-brand-charcoal uppercase tracking-wider text-[9px] block mb-0.5">{hotel.halalBreakfastLabel || "Halal Gastronomy"}:</span>
                          <span className="text-brand-charcoal/80 font-medium">{hotel.halalBreakfast}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-end text-xs font-mono">
                      <a 
                        href={`/hotels/${(hotel.name || hotel.id).replace(/\s+/g, "-")}`}
                        onClick={(e) => {
                          if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                            e.preventDefault();
                            onSelectItem("hotel", hotel);
                          }
                        }}
                        className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl border border-brand-blue-accent/20 transition-luxury shadow-md cursor-pointer inline-block text-center"
                      >
                        Explore Property →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab Content: Packages --- */}
        {(activeTab === "all" || activeTab === "packages") && filteredPackages.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-brand-blue-accent/25 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Seamless All-Inclusive Voyages
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  PACKAGES FROM {destination.name.toUpperCase()}
                </h2>
              </div>
              {activeTab === "all" && (
                <button 
                  onClick={() => {
                    if (onNavigateView) {
                      onNavigateView("packages");
                    } else {
                      setActiveTab("packages");
                    }
                  }} 
                  className="text-xs font-mono text-brand-blue-accent hover:text-brand-charcoal font-bold tracking-wider uppercase flex items-center gap-1.5 transition-luxury cursor-pointer"
                >
                  <span>View All Packages ({filteredPackages.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm hover:scale-[1.01] hover:border-brand-blue-accent hover:shadow-lg transition-luxury flex flex-col justify-between"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute top-4 left-4 bg-brand-blue-accent border border-white/10 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-brand-blue-accent" />
                      <span>{pkg.duration}</span>
                    </span>
                    <h4 className="absolute bottom-4 left-4 right-4 text-white font-serif font-bold text-base tracking-wide">
                      {pkg.name}
                    </h4>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-brand-charcoal/80 leading-relaxed">
                      {pkg.description}
                    </p>
                    <div className="space-y-2 bg-brand-lightbg p-4 rounded-xl border border-brand-blue-accent/10">
                      <span className="text-[9px] font-mono font-bold text-brand-blue-accent uppercase tracking-wider block">Key Highlights:</span>
                      <ul className="space-y-1">
                        {(pkg.keyHighlights && pkg.keyHighlights.length > 0
                          ? pkg.keyHighlights
                          : pkg.features.slice(0, 3)
                        ).map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-brand-charcoal/80 flex items-start gap-1.5">
                            <span className="text-brand-blue-accent font-bold">✔</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-brand-blue-accent/10 flex items-center justify-between text-xs font-mono">
                      <span>From <strong className="text-brand-green font-serif font-bold text-base">${pkg.price}</strong></span>
                      <button 
                        onClick={() => onSelectItem("package", pkg)}
                        className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        Detail →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab Content: Mosques --- */}
        {(activeTab === "all" || activeTab === "mosques") && filteredMosques.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-brand-blue-accent/25 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Sacred Congregational Spaces
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  MOSQUES & LANDMARKS
                </h2>
              </div>
              {activeTab === "all" && (
                <button 
                  onClick={() => {
                    if (onNavigateView) {
                      onNavigateView("mosques");
                    } else {
                      setActiveTab("mosques");
                    }
                  }} 
                  className="text-xs font-mono text-brand-blue-accent hover:text-brand-charcoal font-bold tracking-wider uppercase flex items-center gap-1.5 transition-luxury cursor-pointer"
                >
                  <span>View All Mosques ({filteredMosques.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === "all" ? filteredMosques.slice(0, 3) : filteredMosques).map((mosque) => (
                <div 
                  key={mosque.id}
                  onClick={() => onSelectItem("mosque", mosque)}
                  className="bg-white rounded-3xl overflow-hidden border border-brand-blue-accent/15 shadow-sm hover:scale-[1.01] hover:border-brand-blue-accent hover:shadow-lg transition-luxury flex flex-col justify-between cursor-pointer"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img src={mosque.image} alt={mosque.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 flex-1">
                    <div className="space-y-2.5">
                      <h3 className="font-serif font-bold text-lg text-brand-charcoal tracking-wide">
                        {mosque.name}
                      </h3>
                      <p className="text-[10px] font-mono text-brand-blue-accent font-bold tracking-widest uppercase bg-brand-lightbg border border-brand-blue-accent/15 px-3 py-1 rounded-md w-fit">
                        📍 {mosque.location}
                      </p>
                      <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed">
                        {mosque.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-brand-lightbg p-4 rounded-xl text-[10px] font-mono border border-brand-blue-accent/10">
                      <div>
                        <span className="text-brand-charcoal/50 block font-bold text-[9px]">JUMU'AH KHOOTBA:</span>
                        <span className="text-brand-green font-bold text-xs">{mosque.fridayPrayerTime}</span>
                      </div>
                      <div>
                        <span className="text-brand-charcoal/50 block font-bold text-[9px]">MAX CAPACITY:</span>
                        <span className="text-brand-green font-bold text-xs">{mosque.capacity}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-brand-blue-accent/10 flex items-center justify-between">
                      <button 
                        onClick={() => onSelectItem("mosque", mosque)}
                        className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm"
                      >
                        Discover →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab Content: Dining & Halal Gastronomy --- */}
        {(activeTab === "all" || activeTab === "dining") && (
          <div className="space-y-16">
            
            {/* Vetted Halal Restaurants */}
            {filteredRestaurants.length > 0 && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-brand-blue-accent/25 pt-12">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                      Fully Audited Dining
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                      <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                      MUSLIM FRIENDLY DINING
                    </h2>
                  </div>
                  {activeTab === "all" && (
                    <button 
                      onClick={() => {
                        if (onNavigateView) {
                          onNavigateView("restaurants");
                        } else {
                          setActiveTab("dining");
                        }
                      }} 
                      className="text-xs font-mono text-brand-blue-accent hover:text-brand-charcoal font-bold tracking-wider uppercase flex items-center gap-1.5 transition-luxury cursor-pointer"
                    >
                      <span>View All Dining ({filteredRestaurants.length})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(activeTab === "all" ? filteredRestaurants.slice(0, 3) : filteredRestaurants).map((rest) => {
                    const isSaved = wishlist.restaurants?.includes(rest.id);
                    return (
                      <div 
                        key={rest.id}
                        onClick={() => onSelectItem("restaurant", rest)}
                        className="bg-white rounded-3xl overflow-hidden border border-brand-blue-accent/15 shadow-sm hover:scale-[1.01] hover:border-brand-blue-accent hover:shadow-lg transition-luxury flex flex-col justify-between group cursor-pointer"
                      >
                        {/* Cover image with tags */}
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={rest.image} 
                            alt={rest.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                          
                          {/* Floating Save button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist("restaurants", rest.id);
                            }}
                            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow-md transition-all cursor-pointer"
                            title={isSaved ? "Saved to wishlist" : "Save Dining Option"}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                          </button>

                          {/* Overlaid Dining status tags */}
                          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                            {rest.halalCertified && (
                              <span className="bg-brand-blue-accent text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md shadow-xs">
                                HALAL VERIFIED
                              </span>
                            )}
                            {rest.muslimOwned && (
                              <span className="bg-cambodia-red text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md shadow-xs">
                                MUSLIM OWNED
                              </span>
                            )}
                            {rest.muslimFriendly && !rest.halalCertified && (
                              <span className="bg-emerald-700 text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md shadow-xs">
                                MUSLIM FRIENDLY
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1 text-[10px] font-mono uppercase tracking-wider">
                              <div className="flex items-center gap-1.5 text-brand-blue-accent font-bold">
                                <Utensils className="w-3.5 h-3.5 shrink-0" />
                                <span>{rest.cuisine}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-brand-blue-accent font-bold">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span>{rest.location}</span>
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-serif font-bold text-brand-charcoal uppercase tracking-wide leading-snug mt-1.5">
                              {rest.name}
                            </h3>
                            <p className="text-brand-charcoal/75 text-xs sm:text-sm leading-relaxed font-sans line-clamp-3">
                              {rest.description}
                            </p>
                          </div>

                          {/* Footer action */}
                          <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-end text-xs">
                            <a 
                              href={`/dining/${(rest.name || rest.id).replace(/\s+/g, "-")}`}
                              onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                                  e.preventDefault();
                                  onSelectItem("restaurant", rest);
                                }
                              }}
                              className="bg-brand-charcoal hover:bg-brand-blue text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                            >
                              EXPLORE →
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Phnom Penh Editorial Dining Guides */}
            {destination.id === "phnom-penh" && (
              <div className="space-y-8 bg-white rounded-3xl border border-brand-blue-accent/20 p-8 sm:p-12 shadow-sm">
                <div className="space-y-2 border-b border-brand-blue-accent/15 pb-4">
                  <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                    Ahlan Culinary Intelligence
                  </span>
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-charcoal flex items-center gap-2.5">
                    <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                    Phnom Penh Halal Dining Guides
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  {phnomPenhDiningGuides.map((guide, idx) => (
                    <div key={idx} className="bg-brand-lightbg rounded-2xl border border-brand-blue-accent/15 p-6 sm:p-8 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-brand-blue-accent/10 pb-3">
                        <h4 className="font-serif font-bold text-base text-brand-charcoal tracking-wide">
                          {guide.title}
                        </h4>
                        <span className="text-[9px] font-mono text-brand-blue-accent bg-white px-2.5 py-1 rounded border border-brand-blue-accent/20 font-bold">
                          {guide.readTime}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-brand-charcoal/85 leading-relaxed">
                        {guide.description}
                      </p>
                      <div className="space-y-2 bg-white/70 border border-brand-blue-accent/10 p-4 rounded-xl">
                        <span className="text-[9px] font-mono font-bold text-brand-blue-accent uppercase tracking-wider block">Insiders' Culinary Guidelines:</span>
                        <ul className="space-y-1.5">
                          {guide.tips.map((tip, tIdx) => (
                            <li key={tIdx} className="text-[11px] text-brand-charcoal/80 flex items-start gap-1.5">
                              <span className="text-brand-blue-accent font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* --- Tab Content: Social Vlogs & Reels (Full Width) --- */}
      {(activeTab === "all" || activeTab === "social") && (
        <div className="w-full bg-brand-blue text-white py-16 sm:py-20 relative overflow-hidden border-y border-brand-blue-accent/25 my-12 shadow-2xl">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--color-brand-blue-accent) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
            <div className="space-y-2 relative z-10 border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-brand-blue text-xs font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-brand-blue" />
                  Ahlan Travel Social Hub
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Social Vlogs & Reels: {destination.name}
                </h2>
              </div>

              {/* Actions Section */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Platform Selector Filter */}
                <div className="flex flex-wrap gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/10 z-10 shrink-0">
                  {[
                    { id: "all", label: "All" },
                    { id: "tiktok", label: "TikTok" },
                    { id: "instagram", label: "Instagram" },
                    { id: "youtube", label: "YouTube" }
                  ].map((plat) => (
                    <button
                      key={plat.id}
                      onClick={() => setSocialFilter(plat.id as any)}
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                        socialFilter === plat.id 
                          ? "bg-brand-blue text-white border border-brand-blue-accent/20" 
                          : "text-white/75 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {plat.label}
                    </button>
                  ))}
                </div>

                {/* Add Video Button */}
                <button
                  onClick={() => setShowAddVideoForm(!showAddVideoForm)}
                  className="bg-brand-blue-accent hover:bg-brand-blue-accent/90 text-brand-blue font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-3 rounded-xl border border-white/20 transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🎥</span>
                  {showAddVideoForm ? "Close Form" : "Share Video"}
                </button>
              </div>
            </div>

            {/* Collapse/Expandable Add Social Video Form */}
            {showAddVideoForm && (
              <div className="bg-brand-charcoal/60 border border-brand-blue-accent/30 rounded-2xl p-6 sm:p-8 space-y-6 relative animate-fade-in z-10 max-w-2xl mx-auto shadow-xl">
                <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg text-white">Share a Travel Vlog or Video Reel</h3>
                    <p className="text-xs text-white/70">Link a video from other pages or paste a custom social media URL.</p>
                  </div>
                  <button
                    onClick={() => setShowAddVideoForm(false)}
                    className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Platform selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-white/85 font-semibold block">Select Platform</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "tiktok", label: "TikTok" },
                        { id: "instagram", label: "Instagram" },
                        { id: "youtube", label: "YouTube" },
                        { id: "other", label: "Other" }
                      ].map((plat) => (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => setFormPlatform(plat.id as any)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all border ${
                            formPlatform === plat.id
                              ? "bg-brand-blue-accent border-brand-blue-accent text-brand-blue"
                              : "bg-white/5 border-white/10 text-white/75 hover:bg-white/10"
                          }`}
                        >
                          {plat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video URL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-white/85 font-semibold block">Video URL</label>
                      {isCapturingMetadata && (
                        <span className="text-[10px] font-mono text-brand-blue-accent animate-pulse flex items-center gap-1">
                          <span>⏳</span> Capturing description from author...
                        </span>
                      )}
                    </div>
                    <input
                      type="url"
                      required
                      placeholder={
                        formPlatform === "tiktok" ? "https://www.tiktok.com/@handle/video/..." :
                        formPlatform === "instagram" ? "https://www.instagram.com/reel/..." :
                        formPlatform === "youtube" ? "https://www.youtube.com/watch?v=..." :
                        "Paste video link here..."
                      }
                      value={formUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue-accent placeholder-white/30 transition-all"
                    />
                    {autoCapturedNotice && (
                      <div className="bg-brand-blue-accent/10 border border-brand-blue-accent/30 rounded-xl p-2.5 text-[11px] text-brand-blue-accent font-mono flex items-center gap-1.5 animate-fade-in">
                        <span>{autoCapturedNotice}</span>
                      </div>
                    )}
                  </div>

                  {/* Creator Info (Two Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-white/85 font-semibold block">Original Creator Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Fatima Travels"
                        value={formCreatorName}
                        onChange={(e) => setFormCreatorName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue-accent placeholder-white/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-white/85 font-semibold block">Creator Handle</label>
                      <input
                        type="text"
                        placeholder="e.g. @fatima.travels"
                        value={formCreatorHandle}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val && !val.startsWith("@")) val = "@" + val;
                          setFormCreatorHandle(val);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue-accent placeholder-white/30"
                      />
                    </div>
                  </div>

                  {/* Title / Description */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-white/85 font-semibold block">Video Caption / Title</label>
                    <textarea
                      placeholder="Enter a descriptive title or travel caption for this vlog..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue-accent placeholder-white/30 resize-none"
                    />
                  </div>

                  {formError && (
                    <p className="text-red-400 text-xs font-mono">{formError}</p>
                  )}

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVideoForm(false)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 text-xs font-mono font-bold tracking-wider uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVideoSubmit}
                      className="px-6 py-2.5 rounded-xl bg-brand-blue-accent text-brand-blue font-mono font-bold tracking-wider uppercase text-xs shadow-md hover:bg-brand-blue-accent/90 transition-all"
                    >
                      Save Video
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Cards Grid */}
            {filteredSocialCards.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto relative z-10">
                <p className="text-white/80 font-sans text-sm font-medium">No social videos added for {destination.name} yet.</p>
                <p className="text-white/50 text-xs mt-1">Click 'Share Video' above to feature the first video reel!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 relative z-10">
                {filteredSocialCards.map((card) => {
                  const c = card as any;
                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedSocialCard(card)}
                      className="cursor-pointer"
                    >
                      <SocialVideoCard
                        video={{
                          ...c,
                          thumbnailUrl: c.thumbnailUrl || c.thumbnail
                        }}
                        fallbackName={destination.name}
                        restaurantName={c.restaurantName}
                        restaurantImage={destination.image}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Main Content Section 2 (Post-Social Full Width) --- */}
      {(activeTab === "all" || activeTab === "blogs") && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
          
          {/* --- Section: Destination-Specific Blogposts --- */}
          {selectedBlogs.length > 0 && (
            <div className="space-y-8" id="destination-blogposts-section">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-brand-blue-accent/25 pt-12">
                <div className="space-y-1.5">
                  <span className="text-brand-blue text-xs font-mono tracking-widest uppercase font-bold block">
                    Destinations Chronicles & Editorial Blogs
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                    <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                    CHRONICLES FROM {destination.name.toUpperCase()}
                  </h2>
                </div>
                {activeTab === "all" && (
                  <button 
                    onClick={() => {
                      if (onNavigateView) {
                        onNavigateView("inspiration");
                      } else {
                        setActiveTab("blogs");
                      }
                    }} 
                    className="text-xs font-mono text-brand-blue-accent hover:text-brand-charcoal font-bold tracking-wider uppercase flex items-center gap-1.5 transition-luxury cursor-pointer"
                  >
                    <span>View All Chronicles ({selectedBlogs.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid of Custom Blogposts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === "all" ? selectedBlogs.slice(0, 3) : selectedBlogs).map((blog) => (
                  <div 
                    key={blog.id} 
                    onClick={() => onSelectItem("guide", blog)}
                    className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-brand-blue-accent transition-luxury cursor-pointer"
                  >
                    <div className="relative h-64 overflow-hidden bg-brand-charcoal/10">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      
                      <span className={`absolute top-4 left-4 text-[9px] font-mono font-bold uppercase tracking-widest text-white shadow-md border border-white/10 px-3.5 py-1.5 rounded-lg ${
                        blog.category.toLowerCase() === "cultural discovery" || 
                        blog.category.toLowerCase() === "spiritual architecture" || 
                        blog.category.toLowerCase() === "luxury retreat"
                          ? "bg-brand-blue-accent"
                          : "bg-cambodia-red"
                      }`}>
                        {blog.category}
                      </span>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-[10px] font-mono text-white/90 uppercase font-bold">
                          <span>{blog.readTime}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal leading-snug group-hover:text-brand-blue transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-brand-charcoal/75 text-xs sm:text-sm leading-relaxed font-sans">
                          {blog.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-brand-blue-accent/10 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem("guide", blog);
                          }}
                          className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          Read More <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Tab Content: Inspirations & Editorial Stories --- */}
          {destination.id === "phnom-penh" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-brand-blue-accent/25 pt-12">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                    Local Travel Inspirations
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
                    <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                    Local Travel Inspirations & Editorial Highlights
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {phnomPenhInspirations.map((insp, idx) => {
                  const IconComp = insp.icon;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white rounded-3xl border border-brand-blue-accent/15 p-6 sm:p-10 flex gap-5 items-start shadow-sm hover:border-brand-blue-accent/25 transition-luxury"
                    >
                      <div className="bg-brand-blue text-brand-blue-accent p-3 rounded-xl shrink-0 mt-1 border border-brand-blue-accent/20">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-mono text-brand-blue-accent tracking-widest uppercase font-bold block bg-brand-lightbg border border-brand-blue-accent/20 px-2.5 py-1 rounded-md w-fit">
                          {insp.category}
                        </span>
                        <h4 className="font-serif font-bold text-base sm:text-lg text-brand-charcoal tracking-wide leading-snug">
                          {insp.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-brand-charcoal/80 leading-relaxed">
                          {insp.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- Interactive Social Media Simulation Modal/Drawer --- */}
      {selectedSocialCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-brand-blue border border-brand-blue-accent/30 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative animate-fade-in text-white h-[90vh] md:h-[650px]">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedSocialCard(null)}
              className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-brand-blue hover:text-white text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Left Column: Video Simulated Viewport (Spans 6 cols) */}
            <div className="md:col-span-6 bg-black relative flex flex-col justify-center overflow-hidden h-64 md:h-full group">
              <img
                src={selectedSocialCard.thumbnail}
                alt="Video Frame"
                className="w-full h-full object-cover opacity-90 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {/* Looping sound / music waveform decoration */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="space-y-2 max-w-[80%]">
                  <span className="text-[9px] font-mono text-brand-blue-accent font-extrabold bg-white/95 border border-brand-blue-accent/20 px-2.5 py-0.5 rounded-md backdrop-blur-sm inline-block shadow-sm">
                    {modalCreatorHandle}
                  </span>
                  <p className="text-xs text-white leading-relaxed line-clamp-2">
                    {selectedSocialCard.title}
                  </p>
                  <p className="text-[9px] font-mono text-white/70 flex items-center gap-1">
                    <span>🎵</span>
                    <span className="truncate">{selectedSocialCard.musicTrack || "original sound"}</span>
                  </p>
                </div>

                {/* Simulated spinning vinyl record */}
                <div className="w-8 h-8 rounded-full bg-brand-charcoal border-2 border-white/40 flex items-center justify-center animate-spin" style={{ animationDuration: "5s" }}>
                  <div className="w-2 h-2 rounded-full bg-brand-blue-accent" />
                </div>
              </div>

              {/* Big play indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/10 border border-white/25 text-white/90 p-4 rounded-full backdrop-blur-sm animate-ping duration-1000">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </div>
            </div>

            {/* Right Column: Interaction, Stats & Live Comment Thread (Spans 6 cols) */}
            <div className="md:col-span-6 flex flex-col justify-between h-[calc(90vh-256px)] md:h-full bg-brand-blue border-t md:border-t-0 md:border-l border-white/10">
              
              {/* Top Header details */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue-accent text-brand-charcoal font-mono font-bold text-sm flex items-center justify-center border border-brand-blue-accent/30 shadow-md">
                    {modalCreatorAvatar}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-white tracking-wide leading-none">
                      {modalCreatorName}
                    </h3>
                    <span className="text-xs text-white/50 block font-mono">
                      {modalCreatorHandle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Comments Stream (Flexible height) */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <span className="text-[10px] font-mono font-bold text-brand-blue-accent uppercase tracking-widest block">
                  Interactive Thread
                </span>

                {/* Built-in static comments */}
                {selectedSocialCard.comments.map((comment, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-3.5 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-blue-accent font-mono">{comment.user}</span>
                      <span className="text-[10px] text-white/45 font-mono">{comment.time}</span>
                    </div>
                    <p className="text-xs text-white/95 leading-relaxed font-sans">{comment.text}</p>
                    <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-white/40">
                      <button className="hover:text-brand-blue-accent flex items-center gap-1">
                        ❤️ Like
                      </button>
                      <span>{comment.likes} likes</span>
                    </div>
                  </div>
                ))}

                {/* User typed comments dynamically populated */}
                {localComments[selectedSocialCard.id] && localComments[selectedSocialCard.id].map((comment, idx) => (
                  <div key={`local-${idx}`} className="bg-brand-blue-accent/10 border border-brand-blue-accent/20 p-3.5 rounded-2xl space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-blue-accent font-mono">{comment.user}</span>
                      <span className="text-[10px] text-brand-blue-accent/60 font-mono">{comment.time}</span>
                    </div>
                    <p className="text-xs text-white/95 leading-relaxed font-sans">{comment.text}</p>
                    <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-white/40">
                      <span className="text-brand-blue-accent">❤️ Added</span>
                      <span>{comment.likes} likes</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Comments Form input footer */}
              <div className="p-6 border-t border-white/10 bg-black/35">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handlePostComment(selectedSocialCard.id);
                    }}
                    placeholder="Type a halal-vetted travel tip..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue-accent placeholder-white/30"
                  />
                  <button
                    onClick={() => handlePostComment(selectedSocialCard.id)}
                    className="bg-brand-blue hover:bg-brand-blue-accent text-white p-3.5 rounded-xl transition-all cursor-pointer border border-brand-blue-accent/20 shadow-md shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- Interactive Blog Reader Modal --- */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-brand-blue-accent/20 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-fade-in text-brand-charcoal max-h-[90vh] flex flex-col">
            
            {/* Header Close & Meta */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-brand-blue-accent/15 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-blue-accent">
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-brand-lightbg border border-brand-blue-accent/15 px-2.5 py-1 rounded">
                  {selectedBlog.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedBlog(null)}
                className="bg-brand-lightbg hover:bg-brand-blue hover:text-white text-brand-charcoal p-2 rounded-full border border-brand-blue-accent/15 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Reader Content */}
            <div className="overflow-y-auto p-6 sm:p-10 space-y-6 flex-1">
              
              {/* Cover Image */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-brand-charcoal/5">
                <img 
                  src={selectedBlog.image} 
                  alt={selectedBlog.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <h1 className="font-serif text-lg sm:text-2xl font-bold leading-tight drop-shadow-md">
                    {selectedBlog.title}
                  </h1>
                  <p className="text-[10px] font-mono text-white/85 uppercase font-bold">
                    <span>{selectedBlog.readTime}</span>
                  </p>
                </div>
              </div>

              {/* Description / Introduction */}
              <p className="text-sm font-sans font-medium text-brand-charcoal/90 leading-relaxed italic border-l-4 border-brand-blue-accent pl-4 py-1">
                {selectedBlog.description}
              </p>

              {/* Full Content Body */}
              {selectedBlog.content && (selectedBlog.content.includes("<") || selectedBlog.content.includes("</") || selectedBlog.content.includes("<p>") || selectedBlog.content.includes("<h2>")) ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }} 
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base blog-content-body pt-2"
                />
              ) : (
                <div className="text-sm sm:text-base leading-relaxed text-brand-charcoal/85 space-y-4 font-sans pt-2">
                  {selectedBlog.content ? selectedBlog.content.split("\n").map((p: string, idx: number) => (
                    <p key={idx}>{p}</p>
                  )) : null}
                  <p className="pt-4">
                    Planning your luxury holiday to {destination.name} with Ahlan Cambodia guarantees personalized, Muslim-friendly experiences. From private transportation to meticulously certified Halal catering, our dedicated teams handle every detail. Contact our boutique destination managers to incorporate these exclusive trails and local hidden gems into your custom-crafted holiday itinerary.
                  </p>
                </div>
              )}

              {/* Footer Vetting Note */}
              <div className="bg-brand-lightbg border border-brand-blue-accent/15 p-5 rounded-2xl space-y-2 mt-8">
                <h5 className="font-serif font-bold text-xs text-brand-charcoal tracking-wide flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-brand-green" />
                  Ahlan Travel Vetted & Guaranteed
                </h5>
                <p className="text-[11px] sm:text-xs text-brand-charcoal/70 leading-relaxed">
                  All locations, mosques, transit trails, and dining establishments highlighted in this editorial are personally inspected and audited by our indigenous Muslim guides to ensure 100% compliance with Islamic travel requirements.
                </p>
              </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 bg-brand-lightbg border-t border-brand-blue-accent/15 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] font-mono text-brand-charcoal/60">
                Inquire now to add this editorial trail to your package.
              </span>
              <button
                onClick={() => {
                  setSelectedBlog(null);
                  onInquire();
                }}
                className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-accent text-white font-mono text-xs font-bold tracking-widest uppercase py-2.5 px-6 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Inquire About {destination.name}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
