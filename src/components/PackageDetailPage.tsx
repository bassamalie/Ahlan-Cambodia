import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Heart, Clock, MapPin, CheckCircle, 
  X, Calendar, Users, Award, ShieldCheck, 
  Utensils, Share2, DollarSign, ChevronDown, ChevronUp, MessageSquare,
  Check, ArrowRight, Star, Building, Maximize2, ChevronLeft, ChevronRight,
  CreditCard, ExternalLink, Sparkles
} from "lucide-react";
import { TourPackage, Hotel } from "../types";
import { hotels } from "../data";
import WiseTravelCard from "./WiseTravelCard";

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

  // Day-to-day smart tag helpers
  const getDayMeals = (idx: number, dayDesc: string) => {
    const lower = dayDesc.toLowerCase();
    const meals: string[] = [];
    if (lower.includes("breakfast")) meals.push("Breakfast");
    if (lower.includes("lunch")) meals.push("Lunch");
    if (lower.includes("dinner") || lower.includes("banquet") || lower.includes("welcome")) meals.push("Dinner");
    
    if (meals.length > 0) {
      return `Meals: ${meals.join(", ")}`;
    }
    if (idx === 0) return "Meals: Welcome Dinner";
    return "Meals: Breakfast & Dinner";
  };

  const getDayHighlights = (idx: number, dayTitle: string, dayDesc: string) => {
    let text = dayTitle.replace(/^Day\s*\d+\s*[:\-]?\s*/i, "").trim();
    if (text && text.length > 3 && !text.toLowerCase().startsWith("activity")) {
      return text;
    }
    const firstSentence = dayDesc.split(".")[0];
    if (firstSentence && firstSentence.length > 10 && firstSentence.length < 65) {
      return firstSentence.trim();
    }
    return "Cultural Exploration & Iconic Landmarks";
  };

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
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
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
            
            {/* PACKAGE AT A GLANCE / HIGHLIGHTS SECTION */}
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  AT A GLANCE
                </span>
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Package Highlights
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {/* Duration */}
                <div className="bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-brand-blue-accent/40 rounded-2xl p-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#DBE2EA] group-hover:border-brand-blue-accent/30 group-hover:bg-[#F0F7FF] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <Clock className="w-5 h-5 text-brand-blue-accent" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Duration</span>
                    <p className="font-serif font-semibold text-xs sm:text-sm text-brand-charcoal leading-snug">{tourPackage.duration}</p>
                  </div>
                </div>

                {/* Destinations */}
                <div className="bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-brand-blue-accent/40 rounded-2xl p-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#DBE2EA] group-hover:border-brand-blue-accent/30 group-hover:bg-[#F0F7FF] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <MapPin className="w-5 h-5 text-brand-blue-accent" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Destinations</span>
                    <p className="font-serif font-semibold text-xs sm:text-sm text-brand-charcoal leading-snug">{getPackageDestinations(tourPackage.id)}</p>
                  </div>
                </div>

                {/* Accommodations */}
                <div className="bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-brand-blue-accent/40 rounded-2xl p-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#DBE2EA] group-hover:border-brand-blue-accent/30 group-hover:bg-[#F0F7FF] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <Building className="w-5 h-5 text-brand-blue-accent" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Accommodations</span>
                    <p className="font-serif font-semibold text-xs sm:text-sm text-brand-charcoal leading-snug">
                      {packageHotels.length > 0 ? packageHotels.map(h => h.name).join(", ") : "5-Star Luxury Stays"}
                    </p>
                  </div>
                </div>

                {/* Halal Dining */}
                {tourPackage.isHalalMeals !== false && (
                  <div className="bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-brand-blue-accent/40 rounded-2xl p-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex items-start gap-3.5 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#DBE2EA] group-hover:border-brand-blue-accent/30 group-hover:bg-[#F0F7FF] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                      <Utensils className="w-5 h-5 text-brand-blue-accent" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Halal Dining</span>
                      <p className="font-serif font-semibold text-xs sm:text-sm text-brand-charcoal leading-snug">Muslim Meals</p>
                    </div>
                  </div>
                )}

                {/* Transport & Guide */}
                <div className="bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-brand-blue-accent/40 rounded-2xl p-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#DBE2EA] group-hover:border-brand-blue-accent/30 group-hover:bg-[#F0F7FF] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-brand-blue-accent" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Transport & Guide</span>
                    <p className="font-serif font-semibold text-xs sm:text-sm text-brand-charcoal leading-snug">{tourPackage.transportType || "Private Transfer & Guide"}</p>
                  </div>
                </div>

                {/* Pace & Style */}
                <div className="bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-brand-blue-accent/40 rounded-2xl p-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md flex items-start gap-3.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#DBE2EA] group-hover:border-brand-blue-accent/30 group-hover:bg-[#F0F7FF] flex items-center justify-center shrink-0 transition-colors shadow-sm">
                    <Sparkles className="w-5 h-5 text-brand-blue-accent" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Pace & Style</span>
                    <p className="font-serif font-semibold text-xs sm:text-sm text-brand-charcoal leading-snug">{tourPackage.paceStyle || "Leisure"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION DIVIDER LINE ABOVE INCLUSIONS & EXCLUSIONS */}
            <div className="w-full border-t border-slate-200/80 my-8" />

            {/* SEPARATE INCLUSIONS & EXCLUSIONS SECTION WITH WEBSITE TITLE DESIGN */}
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  WHAT IS INCLUDED & EXCLUDED
                </span>
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Inclusions & Exclusions
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusions */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-serif text-lg font-bold text-brand-charcoal">Package Inclusions</h3>
                  </div>
                  <div className="space-y-2.5">
                    {tourPackage.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-serif text-lg font-bold text-brand-charcoal">Package Exclusions</h3>
                  </div>
                  <div className="space-y-2.5">
                    {(tourPackage.exclusions || [
                      "International flights & airport terminal taxes.",
                      "Cambodia tourist entry visa fees.",
                      "Personal expenses (laundry, room service, souvenirs).",
                      "Optional travel insurance.",
                      "Discretionary gratuities for local drivers and guides."
                    ]).map((excl, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                        <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{excl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION DIVIDER LINE ABOVE DETAILED ITINERARY */}
            <div className="w-full border-t border-slate-200/80 my-8" />

            {/* UNBOXED & SEPARATED DAY-BY-DAY ITINERARY WITH TIMELINE LINE */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-brand-blue tracking-widest uppercase font-bold block">
                    DAY-BY-DAY JOURNEY
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-brand-charcoal flex items-center gap-2.5">
                    <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                    Detailed Itinerary
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
                  {tourPackage.itineraryDetails?.length || tourPackage.itineraryOverview.length} Days Fully Outlined
                </span>
              </div>

              {/* Timeline Container with Lighter Soft Blue Vertical Line */}
              <div className="relative pl-8 sm:pl-10 space-y-6">
                {/* Continuous Vertical Timeline Line in lighter soft blue tint */}
                <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-[2px] bg-[#0056b3]/20" />

                {(tourPackage.itineraryDetails && tourPackage.itineraryDetails.length > 0
                  ? tourPackage.itineraryDetails
                  : tourPackage.itineraryOverview.map((dayText, idx) => {
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
                      return { day: idx + 1, title: dayTitle, description: dayDesc, meals: "", highlights: "" };
                    })
                ).map((dayItem, idx) => {
                  const dayNum = dayItem.day || idx + 1;
                  let dayTitle = dayItem.title || `Day ${dayNum}`;
                  let dayDesc = dayItem.description || "";

                  let cleanTitle = dayTitle;
                  const dayPrefixRegex = new RegExp(`^Day\\s*0?${dayNum}\\s*[:\\-]?\\s*`, "i");
                  if (dayPrefixRegex.test(cleanTitle)) {
                    cleanTitle = cleanTitle.replace(dayPrefixRegex, "").trim();
                  }
                  if (!cleanTitle) {
                    cleanTitle = dayTitle || `Day ${dayNum} Activity`;
                  }

                  // Multi-paragraph writing support
                  const paragraphs = (dayDesc || dayTitle)
                    .split(/\n+/)
                    .map(p => p.trim())
                    .filter(p => p.length > 0);

                  const mealTag = dayItem.meals ? (dayItem.meals.toLowerCase().startsWith("meals:") ? dayItem.meals : `Meals: ${dayItem.meals}`) : getDayMeals(idx, dayDesc);
                  const highlightTag = dayItem.highlights ? dayItem.highlights : getDayHighlights(idx, cleanTitle, dayDesc);

                  return (
                    <div key={idx} className="relative group">
                      {/* Concentric Circle Node Bullet with Line Cutting Through (Lighter #0056b3/35) */}
                      <div className="absolute left-[-21px] sm:left-[-25px] top-[28px] -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-[#0056b3]/35 bg-white flex items-center justify-center z-10 transition-transform group-hover:scale-110">
                        <div className="w-2 h-2 rounded-full bg-[#0056b3]/40 pointer-events-none" />
                      </div>

                      {/* Day Box */}
                      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4 relative overflow-hidden transition-all hover:border-slate-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                          <div className="flex items-center gap-3">
                            <span className="bg-[#0056b3] text-white font-mono text-xs font-bold px-3 py-1 rounded-xl uppercase tracking-wider shrink-0 shadow-xs">
                              Day {dayNum}
                            </span>
                            <h3 className="font-serif font-bold text-lg text-brand-charcoal leading-snug">
                              {cleanTitle}
                            </h3>
                          </div>
                        </div>

                        {/* Multi-paragraph Writing */}
                        <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-3 pt-1 font-light">
                          {paragraphs.map((p, pIdx) => (
                            <p key={pIdx}>{p}</p>
                          ))}
                        </div>

                        {/* Tags: Meals tag & Highlights tag */}
                        <div className="flex flex-wrap gap-2.5 pt-3 border-t border-slate-100/80">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-2xs">
                            <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{mealTag}</span>
                          </span>

                          <span className="bg-sky-50 text-sky-800 border border-sky-200/80 px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-2xs">
                            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>Highlights: {highlightTag}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            <div className="bg-brand-green text-white rounded-3xl border border-transparent p-5 space-y-4 shadow-xs relative overflow-hidden">
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

            {/* WISE CARD / PAYMENT PARTNER SIDEBAR CARD */}
            <WiseTravelCard id="btn-wise-sidebar-package" />

          </div>

        </div>

        {/* --- COMPACT ACCOMMODATIONS SECTION --- */}
        {packageHotels.length > 0 && (
          <div className="border-t border-slate-200/80 pt-10 mt-10 space-y-6">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] font-mono text-brand-blue font-bold uppercase tracking-widest block">LUXURY SANCTUARY</span>
              <h3 className="font-serif text-2xl font-bold text-brand-charcoal flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                Accommodations & Partner Hotels
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {packageHotels.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row group"
                >
                  {/* Hotel Thumbnail */}
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-current stroke-[1.5]" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Compact Info Area */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif font-bold text-base text-brand-charcoal group-hover:text-brand-blue transition-colors">
                          {hotel.name}
                        </h4>
                        <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded uppercase shrink-0 font-medium">
                          5-Star
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-light">
                        <MapPin className="w-3 h-3 text-brand-blue-accent shrink-0" />
                        {hotel.location}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-2 font-light leading-relaxed">
                        {hotel.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] text-slate-700 font-medium">
                      <span className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" /> Halal Breakfast
                      </span>
                      <span className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" /> Prayer Facilities
                      </span>
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
              {otherRecommended.map((pkg) => {
                const isSaved = wishlist.includes(pkg.id);
                const destinationTag = pkg.destinations && pkg.destinations.length > 0
                  ? pkg.destinations.join(" • ")
                  : (pkg as any).destination || (pkg as any).location || (
                      `${pkg.name} ${pkg.description}`.toLowerCase().includes("siem reap") ? "Siem Reap" :
                      `${pkg.name} ${pkg.description}`.toLowerCase().includes("phnom penh") ? "Phnom Penh" :
                      `${pkg.name} ${pkg.description}`.toLowerCase().includes("koh rong") ? "Koh Rong" : "Cambodia"
                    );

                return (
                  <div 
                    key={pkg.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.008] hover:border-brand-blue-accent transition-luxury flex flex-col border border-brand-blue-accent/15"
                  >
                    {/* Top Cover Image */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                      <img 
                        src={pkg.image} 
                        alt={pkg.name} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/50 via-transparent to-transparent" />
                      
                      {/* Floating Duration badge */}
                      <div className="absolute top-4 left-4 bg-brand-blue-accent border border-white/10 px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-white flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3 text-white shrink-0" />
                        <span>{pkg.duration}</span>
                      </div>

                      {/* Floating Destination Tag on image */}
                      {destinationTag && (
                        <div className="absolute bottom-3 left-3 bg-[#0F1626]/85 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md max-w-[80%]">
                          <MapPin className="w-3 h-3 text-brand-blue-accent shrink-0" />
                          <span className="truncate">{destinationTag}</span>
                        </div>
                      )}

                      {/* Floating Save button */}
                      <button 
                        onClick={() => onToggleWishlist(pkg.id)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2 rounded-full shadow border border-brand-blue-accent/20 transition-all cursor-pointer"
                        title={isSaved ? "Saved to wishlist" : "Save Package"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                      </button>
                    </div>

                    {/* Card Content body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <h3 className="text-lg font-serif font-bold text-brand-charcoal tracking-wide leading-snug">
                          {pkg.name}
                        </h3>
                        <p className="text-brand-charcoal/80 text-xs leading-relaxed font-sans">
                          {pkg.brief || pkg.description}
                        </p>
                      </div>

                      {/* Package Highlights - Individual Pill Chips with Light Blue Background & Checkmark */}
                      <div className="flex flex-col gap-1.5 py-1">
                        {(pkg.keyHighlights && pkg.keyHighlights.length > 0
                          ? pkg.keyHighlights
                          : pkg.features.slice(0, 3)
                        ).map((feature, idx) => (
                          <div 
                            key={idx} 
                            className="w-fit max-w-full bg-[#F0F7FF] border border-[#D8E8FC] px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-slate-800 font-sans font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                          >
                            <span className="text-slate-900 font-bold text-[10px] shrink-0">✓</span>
                            <span className="truncate leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer action button */}
                      <div className="pt-3 border-t border-brand-blue-accent/10 flex items-center justify-between gap-2">
                        <div className="text-left">
                          <span className="text-[8px] font-mono text-brand-charcoal/40 block leading-none">P.P Price from</span>
                          <span className="text-base font-serif font-bold text-brand-green">${pkg.price} <span className="text-[10px] font-mono font-normal text-brand-charcoal/50">USD</span></span>
                        </div>
                        <button 
                          onClick={() => onSelectPackage?.(pkg)}
                          className="text-[10px] font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-3 py-1.5 rounded-lg border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Detail →
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
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
