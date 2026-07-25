import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Heart, Clock, MapPin, CheckCircle, 
  X, Calendar, Users, Award, ShieldCheck, 
  Utensils, Share2, DollarSign, ChevronDown, ChevronUp, MessageSquare,
  Check, ArrowRight, Star, Building, Maximize2, ChevronLeft, ChevronRight
} from "lucide-react";
import { TourPackage, Hotel } from "../types";
import { hotels } from "../data";

interface PackageDetailPageProps {
  tourPackage: TourPackage;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onInquire: (customDetails?: any) => void;
  allPackages?: TourPackage[];
  allHotels?: Hotel[];
  onSelectPackage?: (pkg: TourPackage) => void;
  onNavigateView?: (view: string) => void;
}

export default function PackageDetailPage({
  tourPackage,
  onBack,
  wishlist,
  onToggleWishlist,
  onInquire,
  allPackages = [],
  allHotels = [],
  onSelectPackage,
  onNavigateView
}: PackageDetailPageProps) {
  const galleryImages = tourPackage.gallery && tourPackage.gallery.length > 0
    ? tourPackage.gallery.map(url => ({ url, title: "" }))
    : [
    {
      url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=1200",
      title: "Angkor Wat Dawn Silhouette"
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
      title: "Pristine Sands of Koh Rong"
    },
    {
      url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=1200",
      title: "Royal Palace Spires"
    },
    {
      url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
      title: "Mekong River Sunset Drift"
    },
    {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
      title: "Luxury Sanctuary Pools"
    },
    {
      url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=1200",
      title: "Artisanal Halal Gastronomy"
    },
    {
      url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80&w=1200",
      title: "Song Saa Private Overwater Retreat"
    },
    {
      url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200",
      title: "Rosewood Panoramic High Lounge"
    }
  ];

  const isSaved = wishlist.includes(tourPackage.id);
  const [activeTab, setActiveTab] = useState<"itinerary" | "inclusions" | "exclusions">("itinerary");
  const [expandedDay, setExpandedDay] = useState<number | null>(0); // Default expand Day 1
  
  // Customizer form state
  const [travelers, setTravelers] = useState<number>(2);
  const [travelDate, setTravelDate] = useState<string>("");
  const [luxuryTier, setLuxuryTier] = useState<"ultra" | "premium">("ultra");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [specialNote, setSpecialNote] = useState<string>("");
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

  const handlePrevGalleryImage = () => {
    if (selectedGalleryIndex === null) return;
    setSelectedGalleryIndex((prev) => 
      prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : 0
    );
  };

  const handleNextGalleryImage = () => {
    if (selectedGalleryIndex === null) return;
    setSelectedGalleryIndex((prev) => 
      prev !== null ? (prev + 1) % galleryImages.length : 0
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedGalleryIndex !== null) {
        if (e.key === "ArrowLeft") {
          handlePrevGalleryImage();
        } else if (e.key === "ArrowRight") {
          handleNextGalleryImage();
        } else if (e.key === "Escape") {
          setSelectedGalleryIndex(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGalleryIndex, galleryImages]);

  // Touch swipe navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNextGalleryImage();
    } else if (isRightSwipe) {
      handlePrevGalleryImage();
    }
  };

  const [openPackageFaq, setOpenPackageFaq] = useState<number | null>(0);

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText?.(window.location.href);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    
    // Call parents custom inquirer
    onInquire({
      packageName: tourPackage.name,
      travelers,
      travelDate,
      luxuryTier,
      contactName,
      contactEmail,
      specialNote
    });
    
    setFormSubmitted(true);
  };

  const availableHotels = allHotels || [];

  const packageHotels = (() => {
    // Priority 1: packageHotelsList (supports mix & match of up to 4 predefined / custom hotels)
    if (tourPackage.packageHotelsList && tourPackage.packageHotelsList.length > 0) {
      const list: Hotel[] = [];
      tourPackage.packageHotelsList.forEach((slot, idx) => {
        if (slot.type === "predefined" && slot.hotelId) {
          const found = availableHotels.find(h => h.id === slot.hotelId);
          if (found) list.push(found);
        } else if (slot.type === "custom" && slot.customHotel) {
          list.push({
            id: `custom-hotel-${idx}-${tourPackage.id}`,
            name: slot.customHotel.name,
            location: slot.customHotel.location,
            image: slot.customHotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
            description: slot.customHotel.description,
            rating: 5.0,
            stars: 5,
            priceRange: "$$$$",
            price: 150,
            prayerFacilities: "Prayer mats & Qibla signs provided in-room or on demand",
            halalBreakfast: "Certified Muslim-friendly or fully Halal kitchen on-site",
            nearbyMosque: "Local mosque access coordinates provided",
            highlights: slot.customHotel.highlights || [],
            amenities: ["Free Wifi", "Halal Dining", "Pool"]
          });
        }
      });
      if (list.length > 0) return list;
    }

    // Priority 2: Combine hotelIds and customHotels / customHotel
    const list: Hotel[] = [];
    if (tourPackage.hotelIds && tourPackage.hotelIds.length > 0) {
      tourPackage.hotelIds.forEach(hid => {
        const found = availableHotels.find(h => h.id === hid);
        if (found) list.push(found);
      });
    }

    const cHotels = tourPackage.customHotels || (tourPackage.customHotel ? [tourPackage.customHotel] : []);
    cHotels.forEach((ch, idx) => {
      list.push({
        id: `custom-hotel-${idx}-${tourPackage.id}`,
        name: ch.name,
        location: ch.location,
        image: ch.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
        description: ch.description,
        rating: 5.0,
        stars: 5,
        priceRange: "$$$$",
        price: 150,
        prayerFacilities: "Prayer mats & Qibla signs provided in-room or on demand",
        halalBreakfast: "Certified Muslim-friendly or fully Halal kitchen on-site",
        nearbyMosque: "Local mosque access coordinates provided",
        highlights: ch.highlights || [],
        amenities: ["Free Wifi", "Halal Dining", "Pool"]
      });
    });

    return list;
  })();

  const getPackageDestinations = (id: string) => {
    if (tourPackage.destinations && tourPackage.destinations.length > 0) {
      return tourPackage.destinations.join(", ");
    }
    switch (id) {
      case "luxury-cambodia":
        return "Phnom Penh, Siem Reap, Koh Rong";
      case "cambodia-highlights":
        return "Siem Reap, Phnom Penh";
      case "family-escape":
        return "Siem Reap";
      case "muslim-heritage-tour":
        return "Phnom Penh, Koh Dach, Kampong Cham";
      default:
        return "Cambodia";
    }
  };

  const otherRecommended = allPackages
    .filter((pkg) => pkg.id !== tourPackage.id)
    .slice(0, 3);

  return (
    <div id="package-detail-root" className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      
      {/* --- Majestic Full-Width Hero Section --- */}
      <div className="relative w-full h-[350px] sm:h-[400px] md:h-[420px] overflow-hidden">
        <img 
          src={tourPackage.image} 
          alt={tourPackage.name} 
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-10000 ease-out"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-black/35" />
        
        {/* --- Top Navbar Inside Hero --- */}
        <div className="absolute top-0 left-0 right-0 z-20 py-5 bg-gradient-to-b from-black/65 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Back Arrow */}
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/95 hover:text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer bg-black/20 hover:bg-black/45 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back</span>
            </button>

            {/* Breadcrumb */}
            <div className="font-mono text-[10px] text-white/70 uppercase tracking-widest hidden sm:flex items-center gap-2">
              <button 
                onClick={() => onNavigateView ? onNavigateView("home") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                HOME
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <button 
                onClick={() => onNavigateView ? onNavigateView("packages") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                PACKAGES
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <span className="text-white/95 font-bold tracking-widest truncate max-w-[200px] sm:max-w-[300px] inline-block uppercase">{tourPackage.name}</span>
            </div>
          </div>
        </div>
        
        {/* Hero Content Overlaid */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 space-y-4">
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
              {tourPackage.name}
            </h1>
            <p className="hidden sm:block text-white/95 text-sm sm:text-base leading-relaxed font-sans max-w-3xl drop-shadow-sm font-light">
              {tourPackage.brief || "Explore our expertly balanced sanctuary itineraries crafted specifically for Muslim travelers."}
            </p>
          </div>

          {/* Info and Actions row */}
          <div className="flex flex-wrap items-center justify-between gap-y-4 pt-4 border-t border-white/15">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-white/90">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-300" />
                {tourPackage.duration}
              </span>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-300" />
                From ${tourPackage.price.toLocaleString()} USD
              </span>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-300" />
                <span><span className="text-white font-sans font-medium">{getPackageDestinations(tourPackage.id)}</span></span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleWishlist(tourPackage.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                  isSaved 
                    ? "bg-brand-red/10 border-brand-red/35 text-brand-red" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-sm"
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-brand-red text-brand-red" : ""}`} />
                <span>{isSaved ? "Saved" : "Save Package"}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? "Link Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sticky Bar (Seamless Navigation) --- */}
      <div className="sticky top-[81px] sm:top-[97px] z-30 w-full bg-brand-blue/95 backdrop-blur-md border-b border-brand-blue-accent/25 shadow-md h-14 sm:h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/90 hover:text-brand-blue-accent font-mono text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-blue-accent" />
              <span>BACK</span>
            </button>
            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <h2 className="text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider truncate m-0">
              {tourPackage.name}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="text-white/90 font-mono text-xs sm:text-sm">
              From <span className="text-white font-bold font-sans">${tourPackage.price.toLocaleString()}</span>
            </span>
            <button
              onClick={() => {
                const el = document.getElementById("inquiry-sidebar-card");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                  onInquire();
                }
              }}
              className="bg-white hover:bg-brand-blue-accent text-brand-blue hover:text-white font-mono border border-white hover:border-brand-blue-accent px-3.5 sm:px-5 h-9 sm:h-10 flex items-center justify-center rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer shrink-0"
            >
              Inquire Now
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content Section with Padding Container --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* 4. MAIN LAYOUT (TWO COLUMNS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Vibe / Narrative */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold block">
                  Curated Narrative & Purpose
                </span>
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  About This Sanctuary Journey
                </h2>
              </div>
              <div className="text-brand-charcoal/80 text-sm sm:text-base leading-relaxed pt-2 space-y-4">
                {tourPackage.description.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* TAB SELECTION */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="flex border-b border-slate-200/60 font-mono text-xs uppercase font-bold tracking-wider bg-brand-lightbg">
                <button
                  onClick={() => setActiveTab("itinerary")}
                  className={`flex-1 py-4 text-center cursor-pointer border-b-2 transition-all ${
                    activeTab === "itinerary" 
                      ? "border-brand-blue text-brand-blue bg-white" 
                      : "border-transparent text-brand-charcoal/60 hover:text-brand-charcoal"
                  }`}
                >
                  Itinerary
                </button>
                <button
                  onClick={() => setActiveTab("inclusions")}
                  className={`flex-1 py-4 text-center cursor-pointer border-b-2 transition-all ${
                    activeTab === "inclusions" 
                      ? "border-brand-blue text-brand-blue bg-white" 
                      : "border-transparent text-brand-charcoal/60 hover:text-brand-charcoal"
                  }`}
                >
                  Inclusions
                </button>
                <button
                  onClick={() => setActiveTab("exclusions")}
                  className={`flex-1 py-4 text-center cursor-pointer border-b-2 transition-all ${
                    activeTab === "exclusions" 
                      ? "border-brand-blue text-brand-blue bg-white" 
                      : "border-transparent text-brand-charcoal/60 hover:text-brand-charcoal"
                  }`}
                >
                  Exclusions
                </button>
              </div>

              <div className="p-6 sm:p-8">
                
                {/* TAB 1: DAILY JOURNEY TIMELINE */}
                {activeTab === "itinerary" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-brand-charcoal flex items-center gap-2.5">
                          <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                          Daily Sanctuary Timeline
                        </h3>
                      </div>
                      <button 
                        onClick={() => setExpandedDay(expandedDay === null ? 0 : null)}
                        className="text-xs font-mono text-brand-blue hover:text-brand-blue-accent font-bold hover:underline"
                      >
                        {expandedDay === null ? "Expand All" : "Collapse All"}
                      </button>
                    </div>

                    <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-6 py-2">
                      {tourPackage.itineraryOverview.map((dayText, idx) => {
                        const isExpanded = expandedDay === idx || expandedDay === null;
                        
                        let dayTitle = "";
                        let dayDesc = "";
                        const colonIdx = dayText.indexOf(":");
                        if (colonIdx !== -1) {
                          dayTitle = dayText.substring(0, colonIdx).trim();
                          dayDesc = dayText.substring(colonIdx + 1).trim();
                        } else {
                          dayTitle = `Day ${idx + 1}`;
                          dayDesc = dayText;
                        }

                        // Clean title prefix if it duplicates "Day 1 - " or "Day 1: " next to the badge
                        let cleanTitle = dayTitle;
                        const dayPrefixRegex = new RegExp(`^Day\\s*0?${idx + 1}\\s*[:\\-]?\\s*`, "i");
                        if (dayPrefixRegex.test(cleanTitle)) {
                          cleanTitle = cleanTitle.replace(dayPrefixRegex, "").trim();
                        }
                        if (!cleanTitle) {
                          cleanTitle = dayTitle || `Day ${idx + 1} Activity`;
                        }

                        return (
                          <div key={idx} className="relative group">
                            
                            {/* Marker Node */}
                            <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white transition-all ${
                              isExpanded ? "border-brand-blue scale-110 bg-brand-blue" : "border-slate-300 group-hover:border-slate-400"
                            }`} />

                            <div className="space-y-2">
                              <button
                                onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
                                className="w-full text-left flex items-center justify-between hover:text-brand-blue-accent transition-colors focus:outline-none"
                              >
                                <span className="font-serif font-bold text-base sm:text-lg text-brand-charcoal flex items-center gap-2">
                                  <span className="font-mono text-xs text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded uppercase font-bold shrink-0">
                                    Day {idx + 1}
                                  </span>
                                  <span className="leading-snug">{cleanTitle}</span>
                                </span>
                                {expandedDay !== null && (
                                  isExpanded ? <ChevronUp className="w-4 h-4 text-brand-charcoal/40 shrink-0" /> : <ChevronDown className="w-4 h-4 text-brand-charcoal/40 shrink-0" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="bg-slate-50/50 border border-slate-200/85 rounded-2xl p-4 sm:p-5 text-sm text-brand-charcoal/80 space-y-3 leading-relaxed animate-slide-down">
                                  <p>{dayDesc || dayTitle}</p>
                                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] font-bold">
                                    <span className="bg-brand-green/5 border border-brand-green/15 text-brand-green px-2.5 py-1 rounded-lg">
                                      ✓ PRIVATE CHAUFFEUR
                                    </span>
                                    <span className="bg-brand-blue/5 border border-brand-blue/15 text-brand-blue px-2.5 py-1 rounded-lg">
                                      ✓ HALAL DINING OPTIONS
                                    </span>
                                    {idx === 0 && (
                                      <span className="bg-brand-blue/5 border border-brand-blue/15 text-brand-blue px-2.5 py-1 rounded-lg">
                                        ✓ VIP ARRIVAL LOUNGE
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: INCLUSIONS */}
                {activeTab === "inclusions" && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-brand-charcoal flex items-center gap-2.5">
                        <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                        All-Inclusive Luxury Amenities
                      </h3>
                      <p className="text-xs text-brand-charcoal/50">No hidden fees. Every element is crafted to ensure a high-end, worry-free journey.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tourPackage.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-brand-green/5 border border-brand-green/10 rounded-2xl p-4">
                          <CheckCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm font-medium text-brand-charcoal">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-brand-blue font-bold font-serif text-sm">
                        <Award className="w-4 h-4" />
                        <span>Exclusive Grand Concierge Included</span>
                      </div>
                      <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                        Enjoy the services of your dedicated local tour manager, reachability via custom chat or phone, private fast-track customs clearance at airport terminals, and priority access tickets at all heritage reserves.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: EXCLUSIONS */}
                {activeTab === "exclusions" && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-brand-charcoal flex items-center gap-2.5">
                        <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                        Tour Exclusions
                      </h3>
                      <p className="text-xs text-brand-charcoal/50">The following items are not included in the standard tour package price.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(tourPackage.exclusions || [
                        "International flights & associated airport terminal taxes.",
                        "Cambodia entry visa fees (Tourist Visa can be secured online or on-arrival).",
                        "Personal expenses such as laundry, room service, telephone calls, and souvenirs.",
                        "Optional travel insurance (strongly recommended for all guests).",
                        "Any meals, beverages, or snacks not explicitly highlighted in the itinerary.",
                        "Discretionary tips & gratuities for private drivers, guides, and service staff."
                      ]).map((exclusion, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-rose-50/40 border border-rose-100 rounded-2xl p-4">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm font-medium text-brand-charcoal/90">{exclusion}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl space-y-2">
                      <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
                        Need help securing flight arrangements, group visas, or specialized medical travel insurance? State your exact requirements in the custom inquiry builder and our elite travel concierge will integrate them seamlessly.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR / RESERVATION & CUSTOMIZER */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* INQUIRY ENGINE CARD */}
            <div id="inquiry-sidebar-card" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue" />
              
              {formSubmitted ? (
                <div className="space-y-5 py-6 text-center animate-scale-in">
                  <div className="bg-brand-green/10 text-brand-green w-14 h-14 rounded-full flex items-center justify-center mx-auto border border-brand-green/20">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-brand-charcoal">Inquiry Transmitted</h3>
                    <p className="text-xs font-mono text-brand-blue font-bold uppercase tracking-wider">JazakAllah Khair</p>
                  </div>

                  <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                    Dear <strong>{contactName}</strong>, your private sanctuary itinerary has been logged. Our elite concierge team will draft a personalized proposal and contact you at <strong>{contactEmail}</strong> within 12 hours.
                  </p>

                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setContactName("");
                      setContactEmail("");
                    }}
                    className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-mono text-xs font-bold py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Send Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-brand-blue font-bold uppercase tracking-widest block">SANCTUARY BUILDER</span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal flex items-center gap-2.5">
                      <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                      Tailor This Journey
                    </h3>
                    <p className="text-xs text-brand-charcoal/50">Submit dates and traveler specifications for a customized digital draft.</p>
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-brand-charcoal/60 uppercase font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full bg-brand-lightbg border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-brand-blue text-brand-charcoal"
                    />
                  </div>

                  {/* Travelers Counter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-brand-charcoal/60 uppercase font-bold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-blue" />
                      Number of Guests
                    </label>
                    <div className="flex items-center justify-between bg-brand-lightbg border border-slate-200 rounded-xl p-1.5">
                      <button
                        type="button"
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="bg-white hover:bg-slate-100 text-brand-charcoal w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center shadow-sm select-none"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-brand-charcoal">
                        {travelers} {travelers === 1 ? "Guest" : "Guests"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTravelers(travelers + 1)}
                        className="bg-white hover:bg-slate-100 text-brand-charcoal w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center shadow-sm select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Luxury Level Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-brand-charcoal/60 uppercase font-bold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-brand-blue" />
                      Accommodation Luxury Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLuxuryTier("ultra")}
                        className={`py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border transition-all ${
                          luxuryTier === "ultra"
                            ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                            : "bg-brand-lightbg border-slate-200 text-brand-charcoal/60 hover:text-brand-charcoal"
                        }`}
                      >
                        Ultra-Luxury
                      </button>
                      <button
                        type="button"
                        onClick={() => setLuxuryTier("premium")}
                        className={`py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border transition-all ${
                          luxuryTier === "premium"
                            ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                            : "bg-brand-lightbg border-slate-200 text-brand-charcoal/60 hover:text-brand-charcoal"
                        }`}
                      >
                        Bespoke Premium
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Your Respected Name..."
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-brand-lightbg border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-brand-blue text-brand-charcoal"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address..."
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-brand-lightbg border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-brand-blue text-brand-charcoal"
                    />
                  </div>

                  {/* Special spiritual notes */}
                  <div className="space-y-1">
                    <textarea
                      placeholder="Special dietary/spiritual/mobility requests (optional)..."
                      value={specialNote}
                      onChange={(e) => setSpecialNote(e.target.value)}
                      rows={2}
                      className="w-full bg-brand-lightbg border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-brand-blue text-brand-charcoal resize-none"
                    />
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    className="w-full bg-brand-blue hover:bg-brand-blue-accent text-white font-serif font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-transparent"
                  >
                    <MessageSquare className="w-4 h-4 text-white/80" />
                    <span>Inquire Custom Draft</span>
                  </button>
                </form>
              )}
            </div>

            {/* TRUST PLEDGE BANNER */}
            <div className="bg-brand-green text-white rounded-3xl border border-transparent p-5 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #FFFFFF 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-brand-blue-accent" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-brand-blue-accent">Key Highlights</h4>
              </div>
              <ul className="space-y-2 text-xs text-white/85 list-none pl-0">
                {(tourPackage.keyHighlights && tourPackage.keyHighlights.length > 0
                  ? tourPackage.keyHighlights
                  : [
                      "Segregated culinary cookware in all resort partner kitchens.",
                      "Zero alcohol in pre-arranged refreshments or vehicles.",
                      "Local Muslim guides fluent in multiple languages."
                    ]
                ).map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* --- PREMIUM ACCOMMODATIONS SECTION --- */}
        {packageHotels.length > 0 && (
          <div className="border-t border-slate-200/80 pt-12 mt-12 space-y-8">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-mono text-brand-blue font-bold uppercase tracking-widest block mb-1">LUXURY SANCTUARY</span>
              <h3 className="font-serif text-2xl font-bold text-brand-charcoal uppercase tracking-wide flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                Premium Accommodations
              </h3>
            </div>

            <div className={`grid grid-cols-1 ${packageHotels.length > 1 ? "md:grid-cols-2" : "max-w-4xl"} gap-8`}>
              {packageHotels.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="bg-white rounded-[2rem] border border-slate-200/70 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  {/* Hotel Image with Overlay */}
                  <div className="relative w-full aspect-[1.78] overflow-hidden bg-brand-charcoal shrink-0">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    
                    {/* Stars Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current stroke-[2]" />
                        ))}
                      </div>
                      <span className="text-[9px] font-sans font-bold text-slate-700 uppercase tracking-wider ml-1">
                        5-STAR
                      </span>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h4 className="font-serif font-bold text-base sm:text-lg tracking-wide leading-snug drop-shadow-sm flex items-center flex-wrap gap-1.5">
                        <span>{hotel.name}</span>
                        <span className="text-amber-300 text-[11px] font-sans font-normal italic tracking-normal bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md border border-amber-300/30 shrink-0">
                          or similar stays
                        </span>
                      </h4>
                      <p className="text-white/80 text-xs flex items-center gap-1 mt-1 font-light font-sans truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-blue-accent shrink-0" />
                        {hotel.location}
                      </p>
                    </div>
                  </div>

                  {/* Hotel Details Area */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light">
                      {hotel.description}
                    </p>

                    {/* Halal-Vetted Highlights List */}
                    <div className="bg-brand-lightbg border border-brand-blue-accent/15 rounded-2xl p-4 sm:p-5 space-y-4">
                      <span className="text-[10px] font-sans font-bold tracking-widest text-brand-blue-accent block uppercase">
                        HALAL COMPLIANCE PROTOCOL:
                      </span>
                      
                      <div className="space-y-3">
                        {hotel.highlights && hotel.highlights.length > 0 ? (
                          hotel.highlights.map((highlight, hIdx) => (
                            <div key={hIdx} className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-brand-blue-accent stroke-[2] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[11px] font-sans font-bold text-slate-800 uppercase tracking-wide">Highlight {hIdx + 1}</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-light">
                                  {highlight}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-brand-blue-accent stroke-[2] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[11px] font-sans font-bold text-slate-800 uppercase tracking-wide">Prayer Facilities</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-light">
                                  {hotel.prayerFacilities}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-brand-blue-accent stroke-[2] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[11px] font-sans font-bold text-slate-800 uppercase tracking-wide">Breakfast Dining</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-light">
                                  {hotel.halalBreakfast}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-brand-blue-accent stroke-[2] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[11px] font-sans font-bold text-slate-800 uppercase tracking-wide">Nearby Masjid</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-light">
                                  {hotel.nearbyMosque}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PACKAGE GALLERY SECTION --- */}
        {((tourPackage.gallery && tourPackage.gallery.length > 0) || (tourPackage.gallery === undefined && galleryImages.length > 0)) && (
          <div className="border-t border-slate-200/80 pt-12 mt-12 space-y-8">
            <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-brand-blue font-bold uppercase tracking-[0.2em] block mb-1">IMAGINE THE EXPERIENCE</span>
                <h3 className="font-serif text-2xl font-bold text-brand-charcoal uppercase tracking-wide flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Package Photo Gallery
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-100 border border-slate-200/50 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
                {galleryImages.length} Curation Slides
              </span>
            </div>

            {/* Customized asymmetrical grid to match the attached visual layout exactly */}
            <div className="grid grid-cols-12 gap-4">
              {galleryImages.map((img, idx) => {
                let gridClasses = "";
                if (idx === 0 || idx === 1) {
                  gridClasses = "col-span-12 md:col-span-6 aspect-[1.6]";
                } else if (idx >= 2 && idx <= 5) {
                  gridClasses = "col-span-6 md:col-span-3 aspect-[4/3]";
                } else if (idx === 6) {
                  gridClasses = "col-span-12 md:col-span-8 aspect-[2.1]";
                } else {
                  gridClasses = "col-span-12 md:col-span-4 aspect-[4/3]";
                }

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedGalleryIndex(idx)}
                    className={`relative ${gridClasses} rounded-[1.75rem] overflow-hidden cursor-pointer group bg-slate-100 border border-slate-200/40 shadow-sm`}
                  >
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5" />
                    
                    {/* Lightbox zoom button absolute centered */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="bg-white/95 backdrop-blur-md text-slate-800 p-2.5 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- PACKAGE FAQ SECTION --- */}
        {((tourPackage.faqs && tourPackage.faqs.length > 0) || (tourPackage.faqs === undefined)) && (
          <div className="border-t border-slate-200/80 pt-12 mt-12 space-y-8">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-mono text-brand-blue font-bold uppercase tracking-[0.2em] block mb-1">
                HAVE QUESTIONS?
              </span>
              <h3 className="font-serif text-2xl font-bold text-brand-charcoal uppercase tracking-wide flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                Package FAQs & Essential Info
              </h3>
            </div>

            <div className="max-w-4xl mr-auto ml-0 space-y-4">
              {(tourPackage.faqs || [
                {
                  q: "Are all meals included in the package verified Halal?",
                  a: "Yes, absolutely. We strictly partner with certified Halal kitchens, or pre-vetted pork-free and alcohol-free dining establishments. Your private guide also coordinates meal timings with prayer hours."
                },
                {
                  q: "How does prayer-time coordination work during our tours?",
                  a: "Our private guides and chauffeurs are fully aware of daily prayer schedules. Vehicles are stocked with clean prayer mats, Qibla compasses, and water spray bottles for wudu. Stops are planned near local Mosques or quiet serene spots during prayer times."
                },
                {
                  q: "Can this itinerary be fully customized to our group's preferences?",
                  a: "Absolutely! This package serves as a master layout. You can adjust the duration, swap out hotels, add specific experiences, or adjust the pace of travel via the Inquiry form or by speaking with your dedicated concierge."
                },
                {
                  q: "What is the visa policy for traveling to Cambodia?",
                  a: "Most international travelers can obtain a Tourist Visa (Type T) either online as an e-Visa before departure, or on arrival at Phnom Penh and Siem Reap airports. It is valid for a stay of up to 30 days."
                },
                {
                  q: "What is your support and health safety protocol during the trip?",
                  a: "We offer 24/7 dedicated local concierge support. All guests travel in top-tier private air-conditioned vehicles, and we maintain direct ties with international clinics in Phnom Penh and Siem Reap for ultimate peace of mind."
                }
              ]).map((faq, idx) => {
                const isOpen = openPackageFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white border border-brand-blue-accent/15 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenPackageFaq(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex justify-between items-center gap-4 bg-brand-lightbg hover:bg-white transition-colors cursor-pointer"
                    >
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-brand-charcoal uppercase tracking-wider leading-relaxed">
                        {faq.q}
                      </h4>
                      <span className="text-brand-blue-accent font-serif text-lg font-bold w-5 h-5 flex items-center justify-center shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-5 sm:p-6 bg-white border-t border-brand-blue-accent/10 font-sans text-xs sm:text-sm text-brand-charcoal/80 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. OTHER SIMILAR PACKAGES */}
        {otherRecommended.length > 0 && (
          <div className="border-t border-slate-200/80 pt-12 mt-12 space-y-8">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-mono text-brand-blue font-bold uppercase tracking-[0.2em] block mb-1">COMPARE SANCTUARIES</span>
              <h3 className="font-serif text-2xl font-bold text-brand-charcoal uppercase tracking-wide flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                OTHER SIMILAR PACKAGES
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {otherRecommended.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="bg-white rounded-[2rem] border border-slate-200/70 overflow-hidden flex flex-col hover:shadow-lg hover:border-brand-blue-accent transition-all duration-300 group"
                >
                  {/* Image wrapper with absolute badges */}
                  <div className="relative w-full aspect-[1.58] overflow-hidden bg-brand-charcoal">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    
                    {/* Dark gradient overlay at the bottom half */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Top-Left Duration Pill */}
                    <div className="absolute top-4 left-4 bg-[#001D4C]/95 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="text-[11px] font-sans font-bold text-white uppercase tracking-wider">
                        {pkg.duration}
                      </span>
                    </div>

                    {/* Bottom-Left Title Overlay */}
                    <div className="absolute bottom-4 left-5 right-5">
                      <h4 className="font-sans font-bold text-sm sm:text-base md:text-lg text-white uppercase tracking-wide leading-snug">
                        {pkg.name}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content Section */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Key Highlights box */}
                      <div className="mt-5 mb-5 bg-brand-lightbg border border-brand-blue-accent/15 rounded-2xl p-4 sm:p-5">
                        <span className="text-[10px] font-sans font-bold tracking-widest text-brand-blue-accent block mb-3 uppercase">
                          KEY HIGHLIGHTS:
                        </span>
                        <div className="space-y-2.5">
                          {(pkg.keyHighlights && pkg.keyHighlights.length > 0
                            ? pkg.keyHighlights
                            : pkg.features.slice(0, 3)
                          ).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <Check className="w-3.5 h-3.5 text-brand-blue-accent stroke-[3.5] shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600 font-medium leading-relaxed" title={feat}>
                                {feat}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer price and call-to-action button */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs sm:text-sm font-sans text-slate-500 font-normal">
                        From <span className="text-base sm:text-lg font-bold text-[#111827] ml-1">${pkg.price}</span>
                      </span>
                      
                      <button
                        onClick={() => onSelectPackage?.(pkg)}
                        className="bg-[#111827] hover:bg-brand-blue text-white font-sans text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <span>DETAIL</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- LIGHTBOX MODAL --- */}
      {selectedGalleryIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
          onClick={() => setSelectedGalleryIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all cursor-pointer z-50"
            onClick={() => setSelectedGalleryIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevGalleryImage();
            }}
            className="absolute left-4 sm:left-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all cursor-pointer z-50 flex items-center justify-center shadow-lg border border-white/5"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextGalleryImage();
            }}
            className="absolute right-4 sm:right-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all cursor-pointer z-50 flex items-center justify-center shadow-lg border border-white/5"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full max-h-[85vh] relative flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <img 
              src={galleryImages[selectedGalleryIndex].url} 
              alt="Enlarged gallery view" 
              className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            {/* Page indicator */}
            <span className="text-white/50 text-xs font-mono mt-4">
              {selectedGalleryIndex + 1} / {galleryImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
