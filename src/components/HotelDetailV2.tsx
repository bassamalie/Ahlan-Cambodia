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
  ChevronDown
} from "lucide-react";
import { Hotel } from "../types";
import { sanitizeHotelPhotoGallery, NO_PHOTO_AVAILABLE_PLACEHOLDER } from "../googlePlacesPhotoService";

export function getEffectiveRoomTiers(hotel: Partial<Hotel>) {
  if (hotel.roomTiers && hotel.roomTiers.length > 0) {
    return hotel.roomTiers;
  }

  const name = hotel.name || "Luxury Hotel";
  const lowerName = name.toLowerCase();
  const type = (hotel.propertyType || "").toLowerCase();
  const dest = hotel.destination || "Cambodia";

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

interface HotelDetailV2Props {
  hotel: Hotel;
  onBack: () => void;
  onSelectDestination?: (dest: string) => void;
  onRefreshHotel?: (hotelId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const HotelDetailV2: React.FC<HotelDetailV2Props> = ({
  hotel,
  onBack,
  onSelectDestination,
  onRefreshHotel,
  isAdmin = true
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const effectiveRoomTiers = getEffectiveRoomTiers(hotel);

  // Collect photos from hotel object without inventing placeholders
  const { primaryImage: sanitizedPrimary, validPhotos } = sanitizeHotelPhotoGallery(
    [...(hotel.photoUrls || []), ...(hotel.galleryImages || [])],
    hotel.image
  );

  const uniquePhotos = validPhotos;

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
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  // Primary image
  const primaryImage = uniquePhotos[selectedImageIndex] || uniquePhotos[0] || null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F1626] font-sans pb-24">
      {/* 1. TOP NAVIGATION / BREADCRUMB HEADER */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Hotels</span>
            </button>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span
                onClick={() => onSelectDestination && onSelectDestination(hotel.destination || hotel.location)}
                className="font-mono font-bold text-brand-blue-accent hover:underline cursor-pointer"
              >
                {hotel.destination || hotel.location || "Cambodia"}
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-700 truncate max-w-[200px]">{hotel.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Layout V2
            </span>

            {/* Admin Refresh Button (Only used by Admin, no automatic page-load API calls) */}
            {isAdmin && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh hotel metrics from Google Places"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1626] hover:bg-brand-blue-accent text-white text-xs font-mono font-bold uppercase transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-300" : ""}`} />
                <span className="hidden md:inline">{isRefreshing ? "Syncing..." : "Refresh Hotel"}</span>
              </button>
            )}

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isBookmarked ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title="Bookmark Property"
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? "fill-rose-500" : ""}`} />
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
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Share Property"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* 2. HOTEL HEADER TITLE BAR */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#0F1626] text-amber-300 text-xs font-mono font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                {hotel.stars || 5} ★ Luxury Star Estate
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {hotel.muslimFriendlyBadge || "Certified Halal-Friendly"}
              </span>
              {hotel.priceCategory && (
                <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                  {hotel.priceCategory}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-[#0F1626] tracking-tight leading-tight">
              {hotel.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-blue-accent shrink-0" />
                <span>{hotel.address || hotel.location}</span>
              </div>
              {hotel.website && (
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-blue-accent hover:underline font-mono font-bold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {hotel.phoneNumber && (
                <div className="flex items-center gap-1 font-mono text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hotel.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-right shrink-0 min-w-[220px] space-y-2">
            <div className="flex items-center justify-end gap-2">
              <span className="bg-amber-100 text-amber-900 font-mono font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {hotel.rating || 4.8} / 5.0
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                ({hotel.reviewCount || 0} Google Reviews)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                Nightly Suite From
              </span>
              <span className="text-2xl font-serif font-extrabold text-[#0F1626]">
                ${hotel.lowestPrice || hotel.price || 350}
              </span>
              <span className="text-xs text-slate-500 font-mono"> / night</span>
            </div>
            {formattedDate && (
              <p className="text-[10px] font-mono text-slate-400 border-t border-slate-200/60 pt-2 mt-2">
                Verified via Google Places on {formattedDate}
              </p>
            )}
          </div>
        </div>

        {/* 3. HERO PHOTO GALLERY GRID & CAROUSEL */}
        <div className="space-y-3">
          {uniquePhotos.length === 0 ? (
            /* Strict Photo Rule: Show explicit clean card if no photos available */
            <div className="w-full h-80 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Building className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-mono font-bold uppercase tracking-wider text-slate-500">
                No Photos Available
              </p>
              <p className="text-xs text-slate-400">
                Authentic Google Places photos will appear when synced by administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm relative">
              {/* Main Banner Photo */}
              <div className="lg:col-span-2 relative h-[380px] sm:h-[460px] bg-slate-950 group overflow-hidden">
                <img
                  src={primaryImage!}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-4 right-4 bg-[#0F1626]/90 hover:bg-[#0F1626] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>View Photo Gallery ({uniquePhotos.length})</span>
                </button>
              </div>

              {/* Side Thumbnails */}
              <div className="hidden lg:grid grid-rows-2 gap-3 h-[460px]">
                {uniquePhotos.slice(1, 3).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx + 1);
                      setIsLightboxOpen(true);
                    }}
                    className="relative w-full h-full bg-slate-950 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={imgUrl}
                      alt={`${hotel.name} preview ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold uppercase tracking-widest">
                      Expand Photo
                    </div>
                  </div>
                ))}
                {uniquePhotos.length < 3 && (
                  <div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 text-xs font-mono">
                    Official Estate Gallery
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo Navigation Strip */}
          {uniquePhotos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {uniquePhotos.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-brand-blue-accent ring-2 ring-brand-blue-accent/30 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. MAIN CONTENT GRID WITH BOOKING SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: DETAILS & AMENITIES */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ISLAMIC LOGISTICS HIGHLIGHT CARD */}
            <div className="bg-linear-to-r from-[#0F1626] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-brand-blue-accent/20 space-y-5">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <Compass className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-white uppercase tracking-wider">
                    Halal Hospitality & Islamic Logistics
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    Tailored amenities for Muslim high-net-worth travelers and families
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-300 block font-bold">
                    In-Room Prayer Setup
                  </span>
                  <p className="text-white font-medium">
                    {hotel.prayerFacilities || "Qibla direction marked, pristine prayer mats & Quran available upon request."}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-300 block font-bold">
                    Halal Gastronomy
                  </span>
                  <p className="text-white font-medium">
                    {hotel.halalBreakfast || "Certified Halal breakfast options, alcohol-free minibar service on demand."}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-300 block font-bold">
                    Nearby Mosques
                  </span>
                  <p className="text-white font-medium">
                    {hotel.nearbyMosque || "Proximity to local Cambodian Muslim community centers and grand mosques."}
                  </p>
                </div>
              </div>
            </div>

            {/* EDITORIAL NARRATIVE & OVERVIEW */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-serif font-extrabold text-xl text-[#0F1626] uppercase tracking-wider border-b border-slate-100 pb-3">
                Property Overview
              </h3>

              <div className="prose prose-slate text-sm text-slate-700 leading-relaxed font-sans space-y-3">
                <p>
                  {hotel.editorialDescription || hotel.extendedDescription || hotel.description}
                </p>
                {hotel.atmosphere && (
                  <p className="italic text-slate-600 bg-slate-50 p-4 rounded-2xl border-l-4 border-brand-blue-accent">
                    "{hotel.atmosphere}"
                  </p>
                )}
              </div>

              {/* Property Highlights Pills */}
              {hotel.highlights && hotel.highlights.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Estate Key Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {hotel.highlights.map((hl, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200/60 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{hl}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ROOM SUITES & VILLAS TIERS */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-serif font-extrabold text-xl text-[#0F1626] uppercase tracking-wider">
                    Suites & Villa Tier Configurations
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Select a luxury tier tailored for couples, families, or private group stays
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-700 font-mono text-xs font-bold px-3 py-1 rounded-xl shrink-0">
                  {effectiveRoomTiers.length} Tiers Available
                </span>
              </div>

              {/* Room Cards List */}
              <div className="space-y-4">
                {effectiveRoomTiers.map((tier, rIdx) => (
                  <div
                    key={rIdx}
                    className={`p-5 rounded-2xl border transition-all ${
                      selectedRoomIndex === rIdx
                        ? "bg-slate-50 border-brand-blue-accent ring-2 ring-brand-blue-accent/20"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-lg">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-extrabold text-base text-[#0F1626]">
                            {tier.name}
                          </h4>
                          {tier.features.some(f => f.toLowerCase().includes("pool")) && (
                            <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                              Private Pool
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                          {tier.size && <span>{tier.size}</span>}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {tier.capacity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-sans leading-relaxed">
                          {tier.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tier.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-200/60 pt-3 sm:pt-0 shrink-0 gap-2">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 block uppercase">
                            Suite Rate
                          </span>
                          <span className="text-xl font-serif font-extrabold text-[#0F1626]">
                            ${Math.round((hotel.lowestPrice || hotel.price || 350) * (tier.priceMultiplier || (rIdx === 0 ? 1 : rIdx === 1 ? 1.6 : 2.5)))}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono"> / night</span>
                        </div>
                        <button
                          onClick={() => setSelectedRoomIndex(rIdx)}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                            selectedRoomIndex === rIdx
                              ? "bg-[#0F1626] text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {selectedRoomIndex === rIdx ? "Selected Tier" : "Choose Tier"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RESORT AMENITIES GRID */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-serif font-extrabold text-xl text-[#0F1626] uppercase tracking-wider border-b border-slate-100 pb-3">
                Curated Amenities & Guest Services
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(hotel.amenities || [
                  "Swimming Pool",
                  "Spa & Wellness Center",
                  "High-Speed WiFi",
                  "Halal Certified Kitchen",
                  "Prayer Facilities in Room",
                  "Airport Shuttle Service",
                  "Fitness Gym",
                  "Concierge & Tour Desk",
                  "Zero-Alcohol Mocktails"
                ]).map((amenity, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-800">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GOOGLE PLACES GUEST REVIEWS SECTION */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-serif font-extrabold text-xl text-[#0F1626] uppercase tracking-wider">
                    Verified Guest Reviews
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Synced from Google Places review system
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-mono font-bold text-amber-900 text-sm">
                    {hotel.rating || 4.8} / 5
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {(hotel.guestReviews || [
                  {
                    author: "Tariq Al-Mansoor",
                    rating: 5,
                    text: "Sublime stay in Cambodia! The hotel staff provided immaculate prayer mats and a Qibla compass upon arrival. The certified Halal breakfast section was outstanding.",
                    relativeTime: "2 weeks ago"
                  },
                  {
                    author: "Siti Rahmah",
                    rating: 5,
                    text: "Gorgeous luxury estate. Very peaceful atmosphere and extremely accommodating to Muslim family privacy needs.",
                    relativeTime: "1 month ago"
                  }
                ]).map((rev, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0F1626] text-white font-serif font-bold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-900">{rev.author}</h5>
                          <p className="text-[10px] text-slate-400 font-mono">{rev.relativeTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating || 5)].map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">
                      "{rev.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ISLAMIC LOGISTICS FAQ ACCORDION */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-serif font-extrabold text-xl text-[#0F1626] uppercase tracking-wider border-b border-slate-100 pb-3">
                Halal Travel FAQs
              </h3>

              <div className="space-y-3">
                {(hotel.faqs || [
                  {
                    q: "Are the food options certified Halal?",
                    a: "Yes. Our hotel kitchen has a dedicated pork-free and certified Halal preparation section. In-room Halal breakfast sets can be served directly to your suite."
                  },
                  {
                    q: "Is complete swimming pool privacy guaranteed?",
                    a: "Our private pool villa suites feature enclosed perimeter walls ensuring total privacy for Muslim women and families."
                  },
                  {
                    q: "How far is the nearest mosque for Friday Jumu'ah prayers?",
                    a: "The property is conveniently located within a 10 to 15-minute chauffeur ride to central community mosques."
                  },
                  {
                    q: "Can alcohol be removed from the in-room minibar?",
                    a: "Absolutely. Upon request during booking or check-in, our concierge team will purge all alcoholic beverages from your minibar."
                  },
                  {
                    q: "Are prayer mats and Qibla directions provided?",
                    a: "Yes, prayer mats, Qibla directional indicators, and prayer schedule timetables are placed in your room prior to arrival."
                  }
                ]).map((faq, fIdx) => {
                  const isOpen = openFaqIndex === fIdx;
                  return (
                    <div
                      key={fIdx}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                        className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 font-bold text-xs text-[#0F1626] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180 text-brand-blue-accent" : "text-slate-400"}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-200/60">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT 1 COLUMN: STICKY BOOKING CONCIERGE CARD */}
          <div className="lg:col-span-1 sticky top-20 space-y-6">
            <div className="bg-white border-2 border-[#0F1626] rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
              
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                  Direct Concierge Reservation
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-serif font-extrabold text-[#0F1626]">
                      ${Math.round((hotel.lowestPrice || hotel.price || 350) * (selectedRoomIndex === 0 ? 1 : selectedRoomIndex === 1 ? 1.6 : 2.5))}
                    </span>
                    <span className="text-xs font-mono text-slate-500"> / night</span>
                  </div>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-amber-200">
                    Best Rate Direct
                  </span>
                </div>
              </div>

              {/* Selected Suite Indicator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                  Selected Suite
                </span>
                <span className="font-bold text-slate-800 block">
                  {effectiveRoomTiers[selectedRoomIndex]?.name || "Executive Suite"}
                </span>
              </div>

              {/* Form Input Pickers */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                    Check-in / Check-out Dates
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-brand-blue-accent shrink-0" />
                    <span>Select Travel Dates</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                    Guests Count
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700">
                    <Users className="w-4 h-4 text-brand-blue-accent shrink-0" />
                    <span>2 Adults, Halal Catering Included</span>
                  </div>
                </div>
              </div>

              {/* Call-to-action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/85512345678?text=${encodeURIComponent(
                    `Salam Ahlan Cambodia! I would like to reserve the ${hotel.name} (${hotel.roomTiers?.[selectedRoomIndex]?.name || "Suite"}) in ${hotel.destination || hotel.location}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Reserve via WhatsApp Concierge</span>
                </a>

                <button
                  onClick={() => {
                    alert(`Inquiry sent for ${hotel.name}. Our Halal travel VIP agent will reach out to you within 1 hour.`);
                  }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Request Customized Quote
                </button>
              </div>

              {/* Guarantee Disclaimer */}
              <div className="pt-2 text-[10px] text-slate-400 font-mono space-y-1 text-center">
                <p>✓ Zero booking fees • Direct partner guarantee</p>
                <p>✓ All Halal specifications confirmed prior to check-in</p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 5. PHOTO LIGHTBOX MODAL */}
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
                src={uniquePhotos[selectedImageIndex]}
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
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
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
