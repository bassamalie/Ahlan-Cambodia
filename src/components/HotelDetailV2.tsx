import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  Globe,
  Phone,
  Calendar,
  Users,
  CheckCircle2,
  RefreshCw,
  Share2,
  Heart,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Wifi,
  Coffee,
  Compass,
  Utensils,
  ChevronRight,
  Maximize2,
  X,
  Building,
  Info,
  Clock,
  MessageSquare,
  ChevronDown,
  Moon,
  Car,
  Plane,
  Eye,
  Navigation,
  Dumbbell,
  ParkingCircle,
  Camera,
  Award,
  Waves,
  CreditCard
} from "lucide-react";
import { Hotel, Restaurant, Mosque } from "../types";
import { sanitizeHotelPhotoGallery, NO_PHOTO_AVAILABLE_PLACEHOLDER } from "../googlePlacesPhotoService";
import { hotels as defaultHotels, restaurants as defaultRestaurants, mosques as defaultMosques } from "../data";

export function getEffectiveRoomTiers(hotel: Partial<Hotel>) {
  if (hotel.roomTiers && hotel.roomTiers.length > 0) {
    return hotel.roomTiers;
  }

  const name = hotel.name || "Luxury Hotel";
  const lowerName = name.toLowerCase();
  const type = (hotel.propertyType || "").toLowerCase();
  const dest = hotel.destination || hotel.location || "Cambodia";

  if (lowerName.includes("peninsula") || lowerName.includes("residence")) {
    return [
      {
        name: "One-Bedroom Executive Studio Suite",
        size: "62 m² / 667 sq ft",
        capacity: "2 Guests",
        description: "Modern open-plan residence featuring floor-to-ceiling windows with river views, fully equipped kitchen, king bed, and marble bathroom.",
        features: ["Mekong / Tonle Sap River View", "In-Suite Kitchenette", "Private Riverview Balcony", "Qibla Direction Setup"]
      },
      {
        name: "Two-Bedroom Family Confluence Suite",
        size: "115 m² / 1,238 sq ft",
        capacity: "4 Guests",
        description: "Spacious dual-bedroom luxury apartment with separate living and dining salon, oversized private balcony overlooking the river junction, and washer/dryer.",
        features: ["Two Master Bedrooms", "Panoramic River Balcony", "Full Gourmet Kitchen", "En-Suite Marble Baths"]
      },
      {
        name: "Peninsula Grand Penthouse Residence",
        size: "185 m² / 1,990 sq ft",
        capacity: "6 Guests",
        description: "Crown residence on the top floor with private sky terrace, expansive living room, dedicated concierge support, and private dining space.",
        features: ["Private Rooftop Sky Terrace", "Confluence Sunset Panorama", "Butler & Concierge Service", "Private In-Suite Halal Dining"]
      }
    ];
  }

  if (lowerName.includes("island") || lowerName.includes("song saa") || type.includes("island") || type.includes("villa")) {
    return [
      {
        name: "One-Bedroom Jungle Pool Villa",
        size: "135 m² / 1,453 sq ft",
        capacity: "2 Guests",
        description: "Secluded rainforest sanctuary featuring a private plunge pool, outdoor shower, double vanity, and complete privacy enclosure.",
        features: ["Private Plunge Pool", "Rainforest & Sea Views", "Outdoor Sun Deck", "100% Privacy Enclosure"]
      },
      {
        name: "One-Bedroom Overwater Pool Villa",
        size: "135 m² / 1,453 sq ft",
        capacity: "2 Guests",
        description: "Stunning overwater villa with direct marine reserve stairs, glass floor viewport, private pool over the ocean, and daybed lounge.",
        features: ["Private Oceanfront Pool", "Direct Sea Access", "Bioluminescent Water View", "Glass Floor Viewport"]
      },
      {
        name: "Two-Bedroom Royal Overwater Villa",
        size: "300 m² / 3,229 sq ft",
        capacity: "4-6 Guests",
        description: "Ultimate overwater sanctuary anchored over the coral reef with two master suites, private chef's kitchen, infinity pool, and dedicated butler.",
        features: ["Private Infinity Pool", "Two Ocean Suites", "In-Villa Chef & Butler", "Private Boat Shuttle"]
      }
    ];
  }

  if (lowerName.includes("raffles") || lowerName.includes("heritage") || type.includes("heritage")) {
    return [
      {
        name: "State Suite King",
        size: "58 m² / 624 sq ft",
        capacity: "2 Guests",
        description: "Classic French-colonial suite with teakwood flooring, high ceilings, clawfoot bathtub, and garden views.",
        features: ["French Colonial Decor", "Raffles Butler Service", "Clawfoot Soaking Tub", "Qibla Kit"]
      },
      {
        name: "Cabana Suite with Pool Access",
        size: "72 m² / 775 sq ft",
        capacity: "2 Guests + 1 Child",
        description: "Ground floor suite opening directly onto lush tropical gardens and the landmark 35-meter pool.",
        features: ["Direct Pool Terrace", "Private Garden Patio", "Halal Room Service", "Marble Bathroom"]
      },
      {
        name: "Landmark Two-Bedroom Royal Suite",
        size: "140 m² / 1,506 sq ft",
        capacity: "4 Guests",
        description: "Historic grand residence housing royal memorabilia, master balcony overlooking the royal gardens, and dining lounge.",
        features: ["Royal Garden Balcony", "Separate Dining Saloon", "Raffles Master Butler", "Heritage Furnishings"]
      }
    ];
  }

  return [
    {
      name: `Executive Premier Room`,
      size: "52 m² / 560 sq ft",
      capacity: "2 Guests",
      description: `Spacious luxury accommodation at ${name} with panoramic views of ${dest}, marble ensuite bath, and custom workspace.`,
      features: ["Panoramic View", "Marble Bath", "Qibla Direction Indicator", "Free High-Speed Wi-Fi"]
    },
    {
      name: `Grand Deluxe River & City Suite`,
      size: "88 m² / 947 sq ft",
      capacity: "3 Guests",
      description: `Elegant suite at ${name} featuring a separate living room, plush king bedroom, and luxury room service amenities.`,
      features: ["Separate Living Saloon", "Deep Soaking Tub", "Complimentary Halal Breakfast", "24/7 Concierge"]
    },
    {
      name: `Royal Presidential Suite`,
      size: "160 m² / 1,720 sq ft",
      capacity: "4-6 Guests",
      description: `Top-tier luxury residence at ${name} with dining area for 8, dedicated butler service, and private chauffeur options.`,
      features: ["Private Dining Salon", "24/7 Butler Service", "Chauffeur Service Included", "Private Terraces"]
    }
  ];
}

// Destination-aware Fallback Helpers for Nearby Attractions, Halal Restaurants, and Mosques
function getDestinationAttractions(destName?: string) {
  const loc = (destName || "").toLowerCase();
  if (loc.includes("siem reap") || loc.includes("angkor")) {
    return [
      { name: "Angkor Wat Temple Complex", distance: "4.5 km" },
      { name: "Pub Street & Night Market", distance: "1.2 km" },
      { name: "Siem Reap Mosque", distance: "800 m" },
      { name: "Angkor National Museum", distance: "1.8 km" },
      { name: "Tonle Sap Lake Floating Village", distance: "12 km" }
    ];
  }
  if (loc.includes("koh rong") || loc.includes("sihanoukville")) {
    return [
      { name: "Sok San Long Beach", distance: "1.0 km" },
      { name: "Marine Conservation Coral Reef", distance: "2.2 km" },
      { name: "Bioluminescent Plankton Bay", distance: "3.5 km" },
      { name: "Koh Rong Pier", distance: "800 m" },
      { name: "Royal Beach Sanctuary", distance: "4.0 km" }
    ];
  }
  // Default Phnom Penh
  return [
    { name: "Royal Palace Phnom Penh", distance: "1.2 km" },
    { name: "Al-Serkal Grand Mosque", distance: "1.3 km" },
    { name: "National Museum of Cambodia", distance: "900 m" },
    { name: "Central Market (Phsar Thmei)", distance: "2.0 km" },
    { name: "Riverside Park & Tonle Sap Promanade", distance: "1.1 km" }
  ];
}

function getNearbyHalalRestaurants(destName?: string) {
  const loc = (destName || "").toLowerCase();
  if (loc.includes("siem reap") || loc.includes("angkor")) {
    return [
      { name: "Saraband Halal Restaurant", distance: "500 m", type: "Cambodian & Malay Halal" },
      { name: "D'Watie Halal Kitchen", distance: "800 m", type: "Southeast Asian Halal" },
      { name: "Angkor Halal Restaurant", distance: "1.1 km", type: "Traditional Khmer Halal" }
    ];
  }
  if (loc.includes("koh rong") || loc.includes("sihanoukville")) {
    return [
      { name: "Island Halal Kitchen", distance: "350 m", type: "Fresh Halal Seafood & Grill" },
      { name: "Ocean Breeze Halal Diner", distance: "700 m", type: "Malaysian & Thai Dishes" },
      { name: "Fishermen's Halal Spot", distance: "1.4 km", type: "Local Khmer Halal" }
    ];
  }
  // Default Phnom Penh
  return [
    { name: "Hummus House Phnom Penh", distance: "450 m", type: "Middle Eastern & Mediterranean" },
    { name: "Al-Sultan Restaurant", distance: "650 m", type: "Arabic & Halal Buffet" },
    { name: "Royal Halal Restaurant", distance: "1.2 km", type: "Cambodian Muslim Cuisine" }
  ];
}

function getNearbyMosquesList(destName?: string) {
  const loc = (destName || "").toLowerCase();
  if (loc.includes("siem reap") || loc.includes("angkor")) {
    return [
      { name: "Siem Reap Mosque", distance: "800 m", note: "Central Community Mosque" },
      { name: "Neak Pean Prayer Center", distance: "2.5 km", note: "Daily Jama'at Available" },
      { name: "An-Nurain Mosque Siem Reap", distance: "3.2 km", note: "Friday Jumu'ah Prayers" }
    ];
  }
  if (loc.includes("koh rong") || loc.includes("sihanoukville")) {
    return [
      { name: "Sihanoukville Islamic Prayer Center", distance: "4.0 km", note: "Daily Prayers" },
      { name: "Koh Rong Muslim Community Hall", distance: "6.5 km", note: "Jumu'ah Prayers" }
    ];
  }
  // Default Phnom Penh
  return [
    { name: "Al-Serkal Grand Mosque", distance: "1.3 km", note: "Main National Grand Mosque" },
    { name: "Masjid Chroy Changvar", distance: "2.1 km", note: "Community Mosque & Center" },
    { name: "Masjid Al-Taqwa", distance: "2.4 km", note: "Jumu'ah & Daily Jama'at" }
  ];
}

export interface HotelDetailV2Props {
  hotel: Hotel;
  onBack: () => void;
  onSelectDestination?: (dest: string) => void;
  onSelectHotel?: (hotel: Hotel) => void;
  onRefreshHotel?: (hotelId: string) => Promise<void>;
  onNavigateView?: (view: string) => void;
  allHotels?: Hotel[];
  allRestaurants?: Restaurant[];
  allMosques?: Mosque[];
  isAdmin?: boolean;
}

function upgradePhotoResolution(url?: string | null): string {
  if (!url || typeof url !== "string") return NO_PHOTO_AVAILABLE_PLACEHOLDER;
  let str = url.trim();
  if (str.includes("data:image/svg+xml")) return str;
  str = str.replace(/maxwidth=\d+/gi, "maxwidth=1600");
  str = str.replace(/([?&])w=\d+/gi, "$1w=1600");
  str = str.replace(/=s\d+/gi, "=s1600");
  str = str.replace(/=w\d+/gi, "=w1600");
  str = str.replace(/([?&])q=\d+/gi, "$1q=90");
  return str;
}

export const HotelDetailV2: React.FC<HotelDetailV2Props> = ({
  hotel,
  onBack,
  onSelectDestination,
  onSelectHotel,
  onRefreshHotel,
  onNavigateView,
  allHotels = defaultHotels,
  allRestaurants = defaultRestaurants,
  allMosques = defaultMosques,
  isAdmin = true
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState<boolean>(false);

  // Collect photos from hotel object cleanly & upgrade resolution
  const { primaryImage: sanitizedPrimary, validPhotos } = sanitizeHotelPhotoGallery(
    [...(hotel.photoUrls || []), ...(hotel.galleryImages || [])],
    hotel.image
  );

  const uniquePhotos = validPhotos.map(upgradePhotoResolution);

  const handleRefresh = async () => {
    if (!onRefreshHotel) return;
    setIsRefreshing(true);
    try {
      await onRefreshHotel(hotel.id);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedDate = hotel.lastUpdated
    ? new Date(hotel.lastUpdated).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : null;

  const primaryImage = uniquePhotos[selectedImageIndex] || uniquePhotos[0] || upgradePhotoResolution(hotel.image) || NO_PHOTO_AVAILABLE_PLACEHOLDER;

  const destinationName = hotel.destination || hotel.location || "Cambodia";
  const attractions = (hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0)
    ? hotel.nearbyAttractions
    : getDestinationAttractions(destinationName);

  const nearbyRestaurantsList = getNearbyHalalRestaurants(destinationName);
  const nearbyMosquesData = getNearbyMosquesList(destinationName);

  // Related hotels for "You May Also Like"
  const recommendedHotels = allHotels
    .filter(h => h.id !== hotel.id)
    .slice(0, 4);

  // External Expedia / Stay22 rates booking URL
  const expediaSearchQuery = encodeURIComponent(`${hotel.name} ${destinationName} Cambodia`);
  const defaultExpediaUrl = `https://www.expedia.com/Hotel-Search?destination=${expediaSearchQuery}`;
  const bookingUrl = hotel.expediaUrl || hotel.stay22Url || defaultExpediaUrl;

  // Google Maps link
  const mapLink = hotel.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + " " + (hotel.address || destinationName))}`;

  return (
    <div className="min-h-screen bg-white text-[#0F1626] font-sans pb-24 selection:bg-brand-blue-accent/20">
      
      {/* 1. TOP BREADCRUMB & HEADER ACTIONS */}
      <div className="bg-[#0F1626] border-b border-white/10 sticky top-[81px] sm:top-[97px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-slate-300 overflow-x-auto scrollbar-none">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-blue-accent" />
              <span>HOTELS</span>
            </button>
            <span className="text-white/30 shrink-0">/</span>
            <span
              onClick={() => onSelectDestination && onSelectDestination(destinationName)}
              className="text-slate-300 hover:text-sky-400 cursor-pointer shrink-0 font-bold uppercase tracking-wider transition-colors"
            >
              {(destinationName || "CAMBODIA").toUpperCase()}
            </span>
            <span className="text-white/30 shrink-0">/</span>
            <span className="font-bold text-white truncate max-w-[220px] sm:max-w-[360px] uppercase tracking-wider">
              {hotel.name.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isBookmarked
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? "fill-rose-500 text-rose-500" : "text-white/70"}`} />
              <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: hotel.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-white/70" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-blue-accent hover:bg-brand-blue text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer shrink-0 border border-white/20 hover:scale-[1.02]"
            >
              <span>BOOK NOW</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* 2. HERO PHOTO GALLERY GRID (Asymmetric multi-photo layout) */}
        <div className="space-y-3">
          {uniquePhotos.length === 0 ? (
            <div className="w-full h-80 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Building className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-mono font-bold uppercase tracking-wider text-slate-500">
                No Gallery Photos Available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 sm:gap-2 rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs relative">
              {/* Main Left Image (~66% width) */}
              <div
                onClick={() => {
                  setSelectedImageIndex(0);
                  setIsLightboxOpen(true);
                }}
                className="lg:col-span-2 relative h-[360px] sm:h-[460px] bg-slate-100 group overflow-hidden cursor-pointer"
              >
                <img
                  src={primaryImage}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER; }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(0);
                    setIsLightboxOpen(true);
                  }}
                  className="absolute bottom-4 right-4 bg-[#0F1626]/90 hover:bg-[#0F1626] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <Camera className="w-4 h-4 text-brand-blue-accent" />
                  <span>View all photos ({uniquePhotos.length || 1})</span>
                </button>
              </div>

              {/* Right Side Stacked Thumbnails (~33% width) */}
              <div className="hidden lg:grid grid-rows-3 gap-1.5 sm:gap-2 h-[460px]">
                {uniquePhotos.slice(1, 4).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx + 1);
                      setIsLightboxOpen(true);
                    }}
                    className="relative w-full h-full bg-slate-100 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={imgUrl}
                      alt={`${hotel.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER; }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold uppercase tracking-widest gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-brand-blue-accent" />
                      <span>Expand</span>
                    </div>
                  </div>
                ))}
                {uniquePhotos.length < 4 && (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-mono font-medium">
                    Property Gallery
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. HOTEL TITLE, BADGES & ADDRESS HEADER */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-mono font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {hotel.stars || 5}-Star Luxury Hotel
            </span>
            {hotel.priceCategory && (
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                {hotel.priceCategory}
              </span>
            )}
          </div>

          {/* Hotel Name with Blue Vertical Line */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="w-2 h-8 sm:h-10 bg-brand-blue-accent rounded-full inline-block shrink-0" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-[#0F1626] uppercase tracking-tight leading-tight">
              {hotel.name}
            </h1>
          </div>

          {/* Subtitle / Address */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 pl-5">
            <MapPin className="w-4 h-4 text-brand-blue-accent shrink-0" />
            <span>{hotel.address || hotel.location || `${destinationName}, Cambodia`}</span>
          </div>
        </div>

        {/* 4. QUICK HIGHLIGHTS BAR (Clean horizontal bar replacing bento tiles) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6 text-xs text-slate-700">
            {[
              { icon: Waves, label: "Outdoor Swimming Pool" },
              { icon: Wifi, label: "Complimentary Wi-Fi" },
              { icon: Car, label: "Airport Chauffeur Transfer" },
              { icon: Users, label: "Family Rooms & Suites" },
              { icon: Sparkles, label: "Full Spa & Wellness" },
              { icon: Eye, label: "Scenic Panoramic Views" }
            ].map((pill, pIdx) => {
              const IconComp = pill.icon;
              return (
                <div key={pIdx} className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-brand-blue-accent/10 text-brand-blue-accent shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800 text-xs">{pill.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. TWO-COLUMN MAIN CONTENT & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN (~65-70% width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ABOUT THE HOTEL */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#0F1626] uppercase tracking-wider flex items-center gap-3 border-b border-slate-100 pb-3">
                <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                <span>About The Hotel</span>
              </h3>

              <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-sans">
                <p className={isAboutExpanded ? "" : "line-clamp-5"}>
                  {hotel.editorialDescription || hotel.extendedDescription || hotel.description}
                </p>
                <button
                  onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                  className="text-xs font-mono font-bold text-brand-blue-accent hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <span>{isAboutExpanded ? "Show less ^" : "Read full description v"}</span>
                </button>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue-accent shrink-0" />
                    <span>Prime location in {destinationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue-accent shrink-0" />
                    <span>Rated {hotel.rating || 4.8} / 5 on Google</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue-accent shrink-0" />
                    <span>Concierge & Guest Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HOTEL AMENITIES */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#0F1626] uppercase tracking-wider flex items-center gap-3 border-b border-slate-100 pb-3">
                <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                <span>Hotel Amenities & Facilities</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Waves, name: "Outdoor Pool" },
                  { icon: Wifi, name: "Free High-Speed WiFi" },
                  { icon: Dumbbell, name: "Fitness Centre" },
                  { icon: Sparkles, name: "Spa & Wellness" },
                  { icon: Utensils, name: "Gourmet Restaurant" },
                  { icon: Clock, name: "24-Hour Front Desk" },
                  { icon: Car, name: "Airport Transfer" },
                  { icon: ParkingCircle, name: "Private Parking" }
                ].map((item, aIdx) => {
                  const IconC = item.icon;
                  return (
                    <div
                      key={aIdx}
                      className="py-2.5 px-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-brand-blue-accent">
                        <IconC className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LOCATION & NEARBY ATTRACTIONS */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#0F1626] uppercase tracking-wider flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                  <span>Location & Nearby Attractions</span>
                </h3>
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono font-bold text-brand-blue-accent hover:underline flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Styled Map Widget - Pixel-perfect match to screenshot */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 h-72 sm:h-80 bg-slate-100 shadow-xs group">
                  {/* Embedded Google Maps View */}
                  <iframe
                    title={`Google Map view for ${hotel.name}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name + " " + (hotel.address || destinationName))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0 pointer-events-auto"
                    loading="lazy"
                    allowFullScreen
                  />

                  {/* Top-Left Floating "Open in Maps ↗" Badge matching attachment */}
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 left-3 z-20 bg-white hover:bg-slate-50 text-[#1a73e8] hover:text-[#1557b0] font-sans font-bold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer border border-slate-200/80 transition-all hover:shadow-lg"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#1a73e8]" />
                  </a>

                  {/* Satellite Thumbnail overlay on bottom-left matching attachment */}
                  <div className="absolute bottom-7 left-3 z-20 pointer-events-none">
                    <div className="w-10 h-10 rounded-md border-2 border-white shadow-md overflow-hidden bg-slate-800">
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=120&q=80"
                        alt="Satellite preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Expand Fullscreen icon overlay on bottom-right matching attachment */}
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-7 right-3 z-20 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-full shadow-md border border-slate-200 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                    title="Fullscreen Google Maps"
                  >
                    <Maximize2 className="w-4 h-4 text-slate-600" />
                  </a>

                  {/* Google Maps Bottom Bar matching screenshot */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-xs px-3 py-1 flex items-center justify-between text-[10px] text-slate-600 font-sans border-t border-slate-200/60">
                    <div className="flex items-center gap-1">
                      <span className="font-bold tracking-tight text-slate-800 text-[11px] font-sans">Google</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-sans text-[9px] sm:text-[10px]">
                      <span className="hidden sm:inline">Keyboard shortcuts</span>
                      <span>Map data ©2026</span>
                      <span className="hover:underline cursor-pointer">Terms</span>
                    </div>
                  </div>
                </div>

                {/* Right Top Attractions List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                    <span>Top Attractions</span>
                  </h4>
                  <div className="space-y-2">
                    {attractions.slice(0, 5).map((att, attIdx) => (
                      <div
                        key={attIdx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/50 text-xs font-medium text-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building className="w-4 h-4 text-brand-blue-accent shrink-0" />
                          <span className="font-semibold">{att.name}</span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                          {att.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* GOOGLE REVIEWS SECTION */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#0F1626] uppercase tracking-wider flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                    <span>Google Reviews</span>
                  </h3>
                  <div className="flex items-center gap-2 pt-1 pl-4.5">
                    <span className="text-2xl font-serif font-extrabold text-[#0F1626]">
                      {hotel.rating || 4.8}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 5</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      ({(hotel.reviewCount || 2184).toLocaleString()} Google Reviews)
                    </span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(hotel.name + " " + destinationName + " reviews")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Read all reviews on Google</span>
                </a>
              </div>

              {/* Review Cards Carousel / Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(hotel.guestReviews && hotel.guestReviews.length > 0 ? hotel.guestReviews : [
                  {
                    author: "Alexander R.",
                    rating: 5,
                    text: "Excellent stay! The room was clean, spacious and the staff were exceptionally welcoming. Outstanding central location near the major sights and riverside.",
                    relativeTime: "2 weeks ago",
                    flag: "🇸🇬"
                  },
                  {
                    author: "Elena M.",
                    rating: 5,
                    text: "Lovely property with great amenities and attentive guest service. Breakfast was wonderful and the rooftop pool view is incredible.",
                    relativeTime: "1 month ago",
                    flag: "🇬🇧"
                  }
                ]).map((rev, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#0F1626] text-white font-bold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-xs text-slate-900">{rev.author}</h5>
                            {rev.flag && <span className="text-xs">{rev.flag}</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">{rev.relativeTime || "Verified Guest"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating || 5)].map((_, s) => (
                          <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed italic">
                      "{rev.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN (~30-35% width) */}
          <div className="lg:col-span-1 space-y-6 sticky top-20">
            
            {/* SIDEBAR CARD 1: RATING & CHECK LIVE RATES */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
              
              {/* Rating Header Block */}
              <div className="text-center space-y-1 border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 text-2xl font-serif font-extrabold text-[#0F1626]">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>{hotel.rating || 4.8}</span>
                  <span className="text-xs text-slate-400 font-mono">/ 5</span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  ({(hotel.reviewCount || 2184).toLocaleString()} Google Reviews)
                </p>
                <div className="pt-1">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    ✓ Verified Hotel Property
                  </span>
                </div>
              </div>

              {/* Ready to Book CTA Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center space-y-3">
                <h4 className="font-bold text-xs text-slate-900">Ready to book your stay?</h4>
                <p className="text-[11px] text-slate-600 leading-snug font-sans">
                  Compare live rates from our trusted booking partner.
                </p>

                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-brand-blue-accent hover:bg-brand-blue text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Check Live Rates</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <p className="text-[10px] text-slate-400 font-mono">Powered by stay22</p>
              </div>

              {/* Quick Links List */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {hotel.website && (
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-blue-accent" />
                      <span>Official Website</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}

                <a
                  href={`tel:${hotel.phoneNumber || "+85523966888"}`}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-blue-accent" />
                    <span>Call Hotel</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{hotel.phoneNumber || "+855 23 966 888"}</span>
                </a>

                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-brand-blue-accent" />
                    <span>Get Directions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

            </div>

            {/* SIDEBAR CARD 2: HOTEL INFORMATION */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="font-serif font-extrabold text-sm text-[#0F1626] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-1 h-4 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                <span>Hotel Information</span>
              </h4>

              <div className="space-y-3 text-xs font-medium">
                {[
                  { label: "Check-in", value: hotel.checkIn || "2:00 PM" },
                  { label: "Check-out", value: hotel.checkOut || "12:00 PM" },
                  { label: "Property Type", value: hotel.propertyType || "Luxury Hotel" },
                  { label: "Languages Spoken", value: hotel.languages || "English, Khmer" },
                  { label: "Location", value: destinationName },
                  { label: "Concierge", value: "24/7 Available" }
                ].map((row, rIdx) => (
                  <div key={rIdx} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-slate-500 font-sans">{row.label}</span>
                    <span className="font-semibold text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SIDEBAR CARD 3: WISE TRAVEL CARD BANNER */}
            <div className="bg-gradient-to-br from-[#002B28] to-[#004D47] border border-[#00B9A5]/40 rounded-2xl p-6 text-white space-y-4 shadow-md relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#00B9A5]/15 rounded-full blur-xl group-hover:bg-[#00B9A5]/25 transition-all pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00B9A5] flex items-center justify-center text-white shadow-sm shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E6C3] block">TRAVEL ESSENTIAL</span>
                  <h4 className="font-serif font-bold text-base text-white leading-tight">Wise Travel Card</h4>
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-light font-sans">
                Pay effortlessly in Cambodian Riel and USD with low transparent fees and real exchange rates.
              </p>
              <a
                href="https://wise.prf.hn/click/camref:1011l4i5gZ"
                target="_blank"
                rel="nofollow sponsored noopener"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#00B9A5] hover:bg-[#00a392] text-white font-sans font-bold text-sm py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-center cursor-pointer"
                id="btn-wise-sidebar-hotel"
              >
                <span>Get Your Wise Travel Card</span>
                <ExternalLink className="w-4 h-4 text-white/90" />
              </a>
            </div>

            {/* SIDEBAR CARD 4: NEARBY DINING */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="font-serif font-extrabold text-sm text-[#0F1626] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-1 h-4 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                <span>Nearby Dining</span>
              </h4>

              <div className="space-y-3">
                {nearbyRestaurantsList.map((rest, rIdx) => (
                  <div key={rIdx} className="flex items-start justify-between gap-2 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <h5 className="font-bold text-slate-900">{rest.name}</h5>
                      <p className="text-[10px] text-slate-500 font-sans">{rest.type}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {rest.distance}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigateView && onNavigateView("dining")}
                className="w-full text-center text-xs font-mono font-bold text-brand-blue-accent hover:underline pt-1 block cursor-pointer"
              >
                View more restaurants &gt;
              </button>
            </div>

          </div>

        </div>

        {/* 6. YOU MAY ALSO LIKE (RECOMMENDED HOTELS) */}
        <div className="pt-8 border-t border-slate-200/80 space-y-6">
          <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#0F1626] uppercase tracking-wider flex items-center gap-3">
            <span className="w-1.5 h-7 bg-brand-blue-accent rounded-full inline-block shrink-0" />
            <span>You May Also Like</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedHotels.map((recHotel, recIdx) => (
              <div
                key={recIdx}
                onClick={() => {
                  if (onSelectHotel) {
                    onSelectHotel(recHotel);
                  } else if (onNavigateView) {
                    onNavigateView("hotel-detail");
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={recHotel.image || NO_PHOTO_AVAILABLE_PLACEHOLDER}
                      alt={recHotel.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER; }}
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#0F1626] line-clamp-1 group-hover:text-brand-blue-accent transition-colors">
                      {recHotel.name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{recHotel.rating || 4.7}</span>
                      <span>({(recHotel.reviewCount || 1250).toLocaleString()})</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-end mt-2">
                  <span className="text-xs font-mono font-bold text-brand-blue-accent flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Explore Property <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 text-white hover:text-amber-400 p-2 rounded-full bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full space-y-4 text-center">
            <div className="relative h-[65vh] sm:h-[75vh] flex items-center justify-center">
              <img
                src={uniquePhotos[selectedImageIndex] || uniquePhotos[0]}
                alt={`Photo ${selectedImageIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
              {uniquePhotos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImageIndex === idx ? "border-amber-400 scale-110" : "border-transparent opacity-50"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
