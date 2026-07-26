import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Heart, Share2, MapPin, Check, 
  Info, Clock, Calendar, Users, Shield, Compass, BookOpen
} from "lucide-react";
import { Mosque, Restaurant } from "../types";
import { NO_PHOTO_AVAILABLE_PLACEHOLDER } from "../googlePlacesPhotoService";

interface MosqueDetailPageProps {
  mosque: Mosque;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  allRestaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onNavigateView?: (view: string) => void;
}

// Rich detailed metadata for each mosque
const mosqueExtendedData: {
  [key: string]: {
    extendedDescription: string;
    architectureType: string;
    historicalContext: string;
    amenities: string[];
    visitorGuidelines: { title: string; desc: string }[];
    prayerTimes: {
      fajr: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
      jummah: string;
    };
    address: string;
  }
} = {
  "al-serkal-phnom-penh": {
    extendedDescription: "Standing majestically as the premier Islamic house of worship in Cambodia, the Al-Serkal Grand Mosque was completed in 2014 as a generous gift from the Al-Serkal family of the United Arab Emirates. Built with flawless white Turkish marble and boasting massive central turquoise domes and two soaring minarets, the mosque is an architectural masterpiece. It serves as the primary national focal point for the Cambodian Cham Muslim community, hosting major state religious occasions, international envoys, and over four thousand worshippers during festive Eid prayers. The interior is characterized by delicate calligraphy and an immense crystal chandelier reflecting soft light across custom-woven carpets.",
    architectureType: "Modern Ottoman & Arabic Fusion with Turkish marble finishes",
    historicalContext: "Inaugurated by Prime Minister Hun Sen and dignitaries from the Arab world in 2014, replacing a historic 1968 structure.",
    amenities: [
      "Separate male and female spacious prayer halls",
      "Modern wudu (ablution) stations with filtered hot/cold water",
      "In-house Islamic library and community learning center",
      "Ample shaded outdoor parking & landscaped gardens",
      "Climate-controlled indoor prayer sections"
    ],
    visitorGuidelines: [
      { title: "Dress Code", desc: "All visitors must dress modestly. Shoulders and knees must be fully covered. Women are kindly requested to wear a headscarf/hijab before entering the prayer hall." },
      { title: "Footwear", desc: "Shoes must be removed at the main entrance and placed on the designated shoe racks. Clean socks are perfectly acceptable." },
      { title: "Quiet & Respect", desc: "Please silence mobile phones and avoid walking directly in front of congregants performing active prayers." },
      { title: "Photography", desc: "Respectful photography of the exterior and interior is allowed. However, please avoid filming or taking close-up photos of individuals praying." }
    ],
    prayerTimes: {
      fajr: "04:45 AM",
      dhuhr: "12:15 PM",
      asr: "03:40 PM",
      maghrib: "06:35 PM",
      isha: "07:50 PM",
      jummah: "12:30 PM (Khutbah starts at 12:15 PM)"
    },
    address: "Street 86, Boeung Kak Area, Daun Penh District, Phnom Penh, Cambodia"
  },
  "neak-pean-siem-reap": {
    extendedDescription: "Tucked inside the serene and lush green Steung Thmei Village, just a stone's throw from the bustling Siem Reap River, the Neak Pean Mosque is the spiritual and cultural anchor for Muslim travelers visiting Angkor Wat. Built in traditional Southeast Asian Islamic style with clean brickwork, multiple tier-vaulted roofs, and gold-trimmed minarets, the mosque offers a peaceful sanctuary of worship. It serves as a warm community beacon, frequently hosting travelers from Malaysia, Indonesia, Singapore, and the Middle East. The mosque plays an active role in coordinating local Halal catering and facilitating community social welfare projects for the local Cham population.",
    architectureType: "Traditional Khmer-Malay Vernacular with tiered golden roofs",
    historicalContext: "Rebuilt and expanded in stages over the last few decades to accommodate the increasing flow of international Muslim tourists.",
    amenities: [
      "Cozy main prayer hall with high open-air ceilings",
      "Humble, clean wudu basins for both men and women",
      "Free guest prayer rugs and prayer garments (telekung) available",
      "Community notice board detailing Halal food sources in Siem Reap",
      "Quiet shaded courtyard with local fruit trees"
    ],
    visitorGuidelines: [
      { title: "Modest Attire", desc: "Loose-fitting clothing covering shoulders to ankles is required. Scarves are available at the entrance for female visitors." },
      { title: "Shoe Removal", desc: "Please remove footwear before stepping onto the tiled veranda. Racks are located immediately outside." },
      { title: "Sermon Language", desc: "Jummah khutbah is delivered in Khmer with brief Malay/Arabic summaries to accommodate foreign guests." },
      { title: "Charity & Sadakah", desc: "A donation box is available for supporting local village education, micro-schools, and water-well initiatives." }
    ],
    prayerTimes: {
      fajr: "04:50 AM",
      dhuhr: "12:20 PM",
      asr: "03:45 PM",
      maghrib: "06:40 PM",
      isha: "07:55 PM",
      jummah: "12:30 PM (Khutbah starts at 12:15 PM)"
    },
    address: "Steung Thmei Village, near Old Market, Siem Reap, Cambodia"
  },
  "prek-pra-mosque": {
    extendedDescription: "The Prek Pra Mosque is one of the most culturally significant and historically rich Islamic centers in Cambodia, located in the traditional Cham enclave of Chbar Ampov on the banks of the Tonlé Bassac River. The surrounding community has preserved ancient Islamic Cham manuscripts and traditional lifestyles for centuries. Built with elegant teakwood pillars and blending traditional Khmer architectural lines with classic Islamic geometric styling, this mosque provides an exceptional window into the historical roots of Islam in Cambodia. The atmosphere is deeply homey, characterized by the gentle breeze from the river and the warm smiles of the village elders.",
    architectureType: "Khmer Teakwood Vernacular with Islamic geometric accents",
    historicalContext: "A historical settlement center of the Cham ethnic minority, preserving generations of spiritual resilience.",
    amenities: [
      "Traditional wooden prayer hall with cooling cross-ventilation",
      "Clean riverside wudu area and modern indoor washing facility",
      "Historic Cham archives and heritage manuscript library",
      "Community kitchen used for cooperative cooking during Ramadan",
      "Scenic riverfront benches for meditation and spiritual reading"
    ],
    visitorGuidelines: [
      { title: "Respect Local Enclave", desc: "As the mosque resides within a traditional close-knit Cham village, visitors are requested to dress modestly even when walking in the surrounding alleys." },
      { title: "Cleanliness First", desc: "Remove shoes at the stairs. Keep the wooden flooring pristine as it is cleaned multiple times daily." },
      { title: "Visiting Hours", desc: "Best visited between morning and afternoon prayers. Visitors are highly welcome to join the congregational meals on special dates." },
      { title: "Children", desc: "Local children often play in the courtyard; they are exceptionally friendly and appreciate polite greetings (Assalamu Alaikum)." }
    ],
    prayerTimes: {
      fajr: "04:46 AM",
      dhuhr: "12:16 PM",
      asr: "03:41 PM",
      maghrib: "06:36 PM",
      isha: "07:51 PM",
      jummah: "12:30 PM (Khutbah starts at 12:15 PM)"
    },
    address: "Prek Pra Village, Chbar Ampov District, Phnom Penh, Cambodia"
  }
};

export default function MosqueDetailPage({ 
  mosque, 
  onBack, 
  wishlist, 
  onToggleWishlist,
  allRestaurants,
  onSelectRestaurant,
  onNavigateView
}: MosqueDetailPageProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [mosque]);

  // Retrieve extended mosque data or fallback
  const ext = {
    extendedDescription: mosque.extendedDescription || mosqueExtendedData[mosque.id]?.extendedDescription || mosque.description,
    architectureType: mosque.architectureType || mosqueExtendedData[mosque.id]?.architectureType || "Traditional Islamic Architecture",
    historicalContext: mosque.historicalContext || mosqueExtendedData[mosque.id]?.historicalContext || "A dedicated house of prayer serving the local Muslim community.",
    amenities: mosque.amenities || mosqueExtendedData[mosque.id]?.amenities || [
      "Separate prayer areas for men and women",
      "Clean wudu facilities",
      "Sanitized prayer mats"
    ],
    visitorGuidelines: mosque.visitorGuidelines || mosqueExtendedData[mosque.id]?.visitorGuidelines || [
      { title: "Modest Dress", desc: "Please dress modestly, ensuring shoulders and knees are fully covered." },
      { title: "Quiet Worship", desc: "Maintain silence inside the prayer halls to respect those engaged in prayer." }
    ],
    prayerTimes: mosque.prayerTimes || mosqueExtendedData[mosque.id]?.prayerTimes || {
      fajr: "04:45 AM",
      dhuhr: "12:15 PM",
      asr: "03:40 PM",
      maghrib: "06:35 PM",
      isha: "07:50 PM",
      jummah: mosque.fridayPrayerTime || "12:30 PM"
    },
    address: mosque.address || mosqueExtendedData[mosque.id]?.address || mosque.location
  };

  const isSaved = wishlist.includes(mosque.id);

  const handleShare = () => {
    const slug = (mosque.name || mosque.id).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const url = `${window.location.origin}/mosques/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Auto-capture nearby Halal dining based on explicit list or location proximity (maximum 4)
  const matchedRestaurants = useMemo(() => {
    if (!allRestaurants || allRestaurants.length === 0) return [];

    const mosqueLoc = (mosque.location || mosque.address || "").toLowerCase();

    // Helper to calculate relevance score
    const scoreRestaurant = (r: Restaurant) => {
      let score = 0;
      const rName = (r.name || "").toLowerCase();
      const rLoc = (r.location || r.address || "").toLowerCase();

      // 1. Explicitly named in mosque.nearbyRestaurants
      if (mosque.nearbyRestaurants && mosque.nearbyRestaurants.some(n => n.toLowerCase() === rName || r.id === n.toLowerCase().replace(/\s+/g, "-"))) {
        score += 1000;
      }

      // 2. Exact or district match
      if (mosqueLoc && rLoc) {
        if (mosqueLoc.includes(rLoc) || rLoc.includes(mosqueLoc)) {
          score += 400;
        }
      }

      // 3. City-level match (e.g. Phnom Penh, Siem Reap, Kampot)
      if (mosqueLoc.includes("phnom penh") && (rLoc.includes("phnom penh") || !rLoc)) {
        score += 200;
      } else if (mosqueLoc.includes("siem reap") && rLoc.includes("siem reap")) {
        score += 200;
      } else if (mosqueLoc.includes("kampot") && rLoc.includes("kampot")) {
        score += 200;
      } else if (mosqueLoc.includes("battambang") && rLoc.includes("battambang")) {
        score += 200;
      } else if (mosqueLoc.includes("koh rong") && rLoc.includes("koh rong")) {
        score += 200;
      } else if (!rLoc || rLoc.includes("phnom penh")) {
        // Fallback default city match (Phnom Penh)
        score += 100;
      }

      // 4. Rating boost
      score += (r.rating || 4.5) * 10;

      return score;
    };

    const sorted = [...allRestaurants].sort((a, b) => scoreRestaurant(b) - scoreRestaurant(a));
    return sorted.slice(0, 4);
  }, [allRestaurants, mosque]);

  return (
    <div className="bg-white min-h-screen pb-16" id={`mosque-detail-${mosque.id}`}>
      {/* --- Majestic Full-Width Cover Section --- */}
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[400px] overflow-hidden">
        <img 
          src={mosque.image || NO_PHOTO_AVAILABLE_PLACEHOLDER} 
          alt={mosque.name} 
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-[10000ms] ease-out"
          onError={(e) => {
            e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/40" />
        
        {/* --- Top Navbar Inside Hero --- */}
        <div className="absolute top-0 left-0 right-0 z-20 py-5 bg-gradient-to-b from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Back Button */}
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/95 hover:text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer bg-black/35 hover:bg-black/55 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
              id="btn-mosque-back"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back</span>
            </button>

            {/* Breadcrumb */}
            <div className="font-mono text-[10px] text-white/75 uppercase tracking-widest hidden sm:flex items-center gap-2">
              <button 
                onClick={() => onNavigateView ? onNavigateView("home") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                HOME
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <button 
                onClick={() => onNavigateView ? onNavigateView("mosques") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                MOSQUES
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <span className="text-white/95 font-bold tracking-widest truncate max-w-[200px] sm:max-w-[300px] inline-block uppercase">{mosque.name}</span>
            </div>
          </div>
        </div>
        
        {/* Hero Content Overlaid */}
        <div className="absolute bottom-0 left-0 right-0 z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end h-full space-y-4">
            <div className="space-y-3 max-w-4xl">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
                {mosque.name}
              </h1>
              <div className="hidden sm:block text-white/90 text-sm sm:text-base leading-relaxed font-sans max-w-3xl drop-shadow-sm font-light space-y-3">
                {mosque.description.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Info and Actions row */}
            <div className="flex flex-wrap items-center justify-between gap-y-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-white/90">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-blue-accent" />
                  <span>{mosque.location}</span>
                </span>
                <span className="hidden sm:inline text-white/30">|</span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{mosque.capacity} capacity</span>
                </span>
                <span className="hidden sm:inline text-white/30">|</span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Friday Jummah: {mosque.fridayPrayerTime}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleWishlist(mosque.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                    isSaved 
                      ? "bg-rose-600 border-rose-600 text-white" 
                      : "bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-sm"
                  }`}
                  id={`btn-mosque-wishlist-${mosque.id}`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-white text-white" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save Mosque"}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm relative"
                  id="btn-share-mosque"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                  {copiedLink && (
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Section --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-12 bg-white">
            
            {/* Extended Overview */}
            <section className="bg-white space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Sacred Space Narrative
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  About the Mosque
                </h2>
              </div>
              <div className="text-slate-600 leading-relaxed font-light text-base pt-2 space-y-4">
                {ext.extendedDescription.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-brand-lightbg/30 p-5 rounded-2xl border border-brand-blue-accent/10 flex items-start gap-3">
                  <Compass className="w-5 h-5 text-brand-blue-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-xs tracking-wider text-slate-400 font-bold">Architecture Style</h4>
                    <p className="text-sm font-sans font-semibold text-slate-800 mt-1">{ext.architectureType}</p>
                  </div>
                </div>
                <div className="bg-brand-lightbg/30 p-5 rounded-2xl border border-brand-blue-accent/10 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-brand-blue-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-xs tracking-wider text-slate-400 font-bold">Historical Legacy</h4>
                    <p className="text-sm font-sans font-semibold text-slate-800 mt-1">{ext.historicalContext}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Amenities Offered */}
            <section className="bg-white space-y-6 border-t border-brand-blue-accent/25 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Comforts & Provisions
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Spiritual & Travel Amenities
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {ext.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-700 text-sm font-light">
                    <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Respectful Visitor Guidelines */}
            <section className="bg-white space-y-6 border-t border-brand-blue-accent/25 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Etiquette & Conduct
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Respectful Visitor Guidelines
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light pt-2">
                As active sanctuaries of prayer, visitors are requested to keep guidelines in mind to promote a beautiful inter-cultural and respectful experience.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {ext.visitorGuidelines.map((guide, idx) => (
                  <div key={idx} className="bg-slate-50/55 p-5 rounded-2xl border border-slate-100 space-y-2">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider text-brand-blue-accent flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      {guide.title}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {guide.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column (1/3 width, Sidebar) */}
          <div className="space-y-6 bg-white">
            
            {/* Daily Congregation Prayer Times */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue-accent/15 rounded-full blur-3xl" />
              
              <div className="space-y-6 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-brand-blue uppercase tracking-widest font-bold">Daily Jama'at</span>
                  <h3 className="text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
                    <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                    Prayer Schedule
                  </h3>
                </div>

                <div className="space-y-3.5 border-t border-b border-white/10 py-5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider">Fajr (Dawn)</span>
                    <span className="font-bold text-brand-blue-accent">{ext.prayerTimes.fajr}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider">Dhuhr (Noon)</span>
                    <span className="font-bold text-brand-blue-accent">{ext.prayerTimes.dhuhr}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider">Asr (Afternoon)</span>
                    <span className="font-bold text-brand-blue-accent">{ext.prayerTimes.asr}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider">Maghrib (Sunset)</span>
                    <span className="font-bold text-brand-blue-accent">{ext.prayerTimes.maghrib}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider">Isha (Night)</span>
                    <span className="font-bold text-brand-blue-accent">{ext.prayerTimes.isha}</span>
                  </div>
                </div>

                <div className="bg-brand-blue-accent/10 p-4 rounded-2xl border border-brand-blue-accent/25 space-y-1">
                  <h4 className="font-mono text-[10px] uppercase font-bold text-brand-blue-accent flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Jummah Congregation (Friday)
                  </h4>
                  <p className="text-xs text-white leading-normal font-light">
                    Sermon & Prayer: <span className="font-mono font-bold text-brand-blue-accent">{ext.prayerTimes.jummah}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Location */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="space-y-1 border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-mono text-brand-blue uppercase tracking-widest font-bold block">Interactive Navigation</span>
                <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Google Maps Location
                </h3>
              </div>
              <div className="relative w-full h-[260px] rounded-2xl overflow-hidden border border-slate-100">
                <iframe
                  title="Google Maps Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(ext.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2">
                <span>Interactive Map View</span>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ext.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue-accent hover:text-brand-blue-accent font-bold hover:underline transition-all"
                >
                  Open in Maps ↗
                </a>
              </div>
            </div>

            {/* Full Physical Address */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="space-y-1 border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-mono text-brand-blue uppercase tracking-widest font-bold block">Physical Location</span>
                <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Full Address
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-sans text-slate-700 leading-relaxed pt-1">
                {ext.address}
              </p>
            </div>

            {/* Nearby Halal Dining */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="space-y-1 border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-mono text-brand-blue uppercase tracking-widest font-bold block">Culinary Pairings</span>
                <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Nearby Halal Dining
                </h3>
              </div>
              
              <div className="space-y-4">
                {matchedRestaurants.map((rest, idx) => (
                  <div 
                    key={rest.id || idx}
                    onClick={() => onSelectRestaurant(rest)}
                    className="flex gap-3 items-center group cursor-pointer p-1.5 hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    <img 
                      src={rest.image || NO_PHOTO_AVAILABLE_PLACEHOLDER} 
                      alt={rest.name} 
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-100"
                      onError={(e) => {
                        e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif text-sm font-bold text-slate-800 truncate group-hover:text-brand-blue-accent transition-colors">
                        {rest.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono truncate">
                        {rest.cuisine || "Halal Culinary"} • {rest.location || "Nearby"}
                      </p>
                      {(rest.halalCertified || rest.halalStanding === "Halal Verified") ? (
                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          Halal Verified
                        </span>
                      ) : (
                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold text-brand-blue-accent bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-100 transition-colors">
                          Muslim Friendly
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
