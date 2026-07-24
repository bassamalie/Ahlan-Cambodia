import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Heart, MapPin, ShieldCheck, 
  Utensils, Share2, Calendar, Users, Info, 
  Check, Phone, Clock, MessageSquare, ChevronDown, ChevronUp, AlertCircle,
  Youtube, Instagram, Video, Play, ExternalLink, Eye, ThumbsUp
} from "lucide-react";
import { Restaurant } from "../types";

function getAutoThumbnail(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. Check if the URL is actually a direct image
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed) || trimmed.includes("images.unsplash.com")) {
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

  // 3. Instagram Thumbnail (supports posts & reels)
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

import { SocialVideoCard } from "./SocialVideoCard";


interface DiningDetailPageProps {
  restaurant: Restaurant;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onInquire: (details: any) => void;
  onNavigateView?: (view: string) => void;
}

// Rich detailed metadata for each restaurant
const restaurantExtendedData: {
  [key: string]: {
    extendedDescription: string;
    atmosphere: string;
    operatingHours: string;
    contactNumber: string;
    address: string;
    halalDetail: string;
    prayerFacilities: string;
    mustTryDishes: {
      name: string;
      price: string;
      description: string;
      image: string;
      tag?: string;
    }[];
    faqs: { q: string; a: string }[];
  }
} = {
  "angkor-halal": {
    extendedDescription: "Established in the heart of Siem Reap, Angkor Halal Restaurant stands as the pioneer of authentic, strictly Halal Cambodian dining. Designed with traditional Khmer wooden architecture and high vaulted ceilings, the restaurant provides a cool, tranquil escape from the tropical heat. Our kitchen is spearheaded by local Cham culinary experts who have spent decades perfecting traditional Khmer recipes using exclusively Halal-sourced ingredients. It is a highly respected culinary institution where foreign Muslim dignitaries and local families dine side-by-side.",
    atmosphere: "Traditional Khmer Teakwood & Serene Family Comfort",
    operatingHours: "10:30 AM - 10:00 PM (Daily)",
    contactNumber: "+855 (0) 63 963 888",
    address: "Steung Thmei Village, adjacent to Siem Reap Mosque, Siem Reap, Cambodia",
    halalDetail: "100% Halal verified by the Supreme National Islamic Council of Cambodia. We operate under a strict zero-alcohol policy across the entire premises. No wine or cooking alcohol is permitted in the kitchen.",
    prayerFacilities: "The historic Siem Reap Neak Pean Mosque is located directly next door (less than a 1-minute walk). The restaurant also has clean in-house wudu basins and comfortable guest prayer rugs available upon request.",
    mustTryDishes: [
      {
        name: "Traditional Fish Amok",
        price: "$11.50",
        description: "Fresh water butterfish fillet baked to a perfect custard-like consistency with fragrant lemongrass paste, wild kaffir lime, and local coconut milk inside a fresh banana leaf cup.",
        image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600",
        tag: "Chef's Signature"
      },
      {
        name: "Halal Beef Lok Lak",
        price: "$13.00",
        description: "Sizzling wok-tossed cubes of tender grass-fed Halal beef cooked in a sweet-savory glaze. Served on local greens with a zesty dipping sauce made of fresh Kampot black pepper and lime juice.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
        tag: "Local Favorite"
      },
      {
        name: "Kampot Lemongrass Mojito (Non-Alc)",
        price: "$4.00",
        description: "A cooling, refreshing infusion of freshly muddled local lemongrass stalks, organic peppermint leaves, cane sugar, and a splash of sparkling soda water over crushed ice.",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600"
      }
    ],
    faqs: [
      { q: "Is the restaurant 100% Halal?", a: "Yes, we are fully verified by the Cambodia Halal Commission. Every single ingredient, including sauces, meats, and spices, is thoroughly verified and strictly Halal-compliant." },
      { q: "Is alcohol served or allowed?", a: "We maintain a strict zero-alcohol policy. No alcohol is served, and guests are respectfully requested not to bring external alcoholic beverages onto the premises." },
      { q: "Do you have private dining spaces for families?", a: "Yes, we feature several elegantly partitioned wooden booths and curtains to provide complete privacy for families and groups." }
    ]
  },
  "saraband-halal": {
    extendedDescription: "Saraband represents the pinnacle of premium riverside fine dining in Phnom Penh, where ancient Cambodian culinary traditions are elevated into modern masterpieces. Overlooking the sweeping confluence of the Tonle Sap and Mekong rivers, the restaurant offers an opulent, dimly lit interior designed with hand-woven silk tapestries and historic Cham motifs. Perfect for anniversary dinners and high-level family gatherings, Saraband maintains an absolute 100% Halal kitchen and serves a marvelous array of mocktails prepared by world-class mixologists.",
    atmosphere: "Riverside Fine Dining, Silk Tapestries & Elite Ambiance",
    operatingHours: "11:30 AM - 10:30 PM (Daily)",
    contactNumber: "+855 (0) 23 999 555",
    address: "River Road Promenade, near Chroy Changvar Bridge, Phnom Penh, Cambodia",
    halalDetail: "Fully Halal verified with premium meat cuts imported directly from Australia (Halal-accredited) and organic local poultry. Strictly zero alcohol used in any food preparation, marinades, or desserts.",
    prayerFacilities: "Features an beautifully decorated, private carpeted prayer room in the mezzanine floor. Complete with separate male/female wudu basins, clean prayer mats, Qibla indicators, and soft lighting.",
    mustTryDishes: [
      {
        name: "Royal Cham Honey-Glazed Salmon",
        price: "$23.50",
        description: "Crispy-skinned premium Atlantic salmon fillet glazed with organic wild mountain honey, ground Kampot red pepper, and served over creamed lemongrass-infused jasmine rice.",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600",
        tag: "Royal Heritage"
      },
      {
        name: "Charred River Prawn in Coconut Gravy",
        price: "$19.00",
        description: "Giant Mekong river prawns grilled over natural coconut husks, smothered in a fragrant rich red curry paste slow-simmered with crushed peanuts and local sweet potatoes.",
        image: "https://images.unsplash.com/photo-1559742811-824132a5c3ca?auto=format&fit=crop&q=80&w=600",
        tag: "Highly Recommended"
      },
      {
        name: "Hibiscus Lotus Elixir",
        price: "$6.50",
        description: "An elegant, cold-pressed drink made from organic hibiscus flowers, wild lotus blossom syrup, freshly squeezed lime juice, and finished with a gold-leaf garnish.",
        image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=600"
      }
    ],
    faqs: [
      { q: "Do we need to make reservations in advance?", a: "Due to high demand for our prime riverside tables, we strongly recommend making a table reservation at least 24 hours in advance, especially for weekend dinner sessions." },
      { q: "Is the entire menu Halal?", a: "Yes, our entire menu is fully Halal verified. We do not prepare or store any non-Halal items, ensuring absolute zero risk of cross-contamination." },
      { q: "Is there a dress code?", a: "We encourage a smart casual or elegant evening attire to preserve the fine-dining ambiance of our dining halls." }
    ]
  },
  "d-watie-malay": {
    extendedDescription: "For over fifteen years, D'Watie Halal Kitchen has been Phnom Penh's beloved sanctuary for comfort food from the Malay Archipelago. Founded by a warm Malaysian-Khmer family, the restaurant is famous for its vibrant hospitality and authentic Malaysian street-style favorites. Located in the popular, green neighborhood of Boeung Keng Kang, the restaurant features cozy indoor seating decorated with historic photos and tropical indoor plants. It is the perfect spot for a hearty, authentic lunch or a relaxing evening tea with friends.",
    atmosphere: "Homey Tropical Bistro & Friendly Malaysian Warmth",
    operatingHours: "07:30 AM - 09:30 PM (Daily)",
    contactNumber: "+855 (0) 12 777 345",
    address: "Street 288, Boeung Keng Kang I, Phnom Penh, Cambodia",
    halalDetail: "Proudly 100% Muslim-owned and operated. All ingredients are sourced from verified Halal-only local butchers and certified international suppliers. No alcohol allowed on site.",
    prayerFacilities: "The beautiful Al-Serkal Grand Mosque or the An-Nurain Mosque are within an 8-minute taxi ride. The restaurant also has a dedicated quiet corner with prayer mats for quick prayers.",
    mustTryDishes: [
      {
        name: "Premium Nasi Lemak Sambal Sotong",
        price: "$10.50",
        description: "Vibrant blue pea-infused coconut rice served with rich slow-cooked tender squid sambal, crisp fried anchovies, roasted peanuts, hard-boiled egg, and cucumber slices.",
        image: "https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?auto=format&fit=crop&q=80&w=600",
        tag: "Best Seller"
      },
      {
        name: "Slow-Braised Beef Rendang Tok",
        price: "$12.00",
        description: "Succulent cubes of beef flank slow-simmered for 8 hours with grated toasted coconut, lemongrass, turmeric leaves, and Malaysian spices until incredibly tender and caramelized.",
        image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600",
        tag: "Must Try"
      },
      {
        name: "Teh Tarik Kaw-Kaw (Frothy Hand-Pulled Tea)",
        price: "$3.00",
        description: "Strongly brewed black tea leaves hand-pulled repeatedly to create a magnificent frothy crown, sweetened perfectly with condensed milk.",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600"
      }
    ],
    faqs: [
      { q: "Do you offer breakfast?", a: "Yes! We open early at 7:30 AM serving hot Nasi Lemak, Roti Canai with dhal curry, and fresh Teh Tarik - making it the ultimate spot for an authentic Muslim-friendly breakfast." },
      { q: "Is the restaurant family-friendly?", a: "Highly so. We have child seats, spacious family tables, and custom non-spicy meals designed specifically for children." }
    ]
  },
  "halal-delights-siem": {
    extendedDescription: "Tucked inside the lively night market district of Siem Reap, Halal Delights & Indian Spice delivers an aromatic journey into authentic North Indian and Mughlai cuisine. Led by native chefs from Lucknow and Delhi, the kitchen utilizes traditional copper tandoors (clay ovens) to bake succulent tandoori platters and fragrant layered biryanis. The interior combines rich Indian textures with Cambodian silk screens, featuring elegant private curtain booths ideal for families seeking comfortable, private dining spaces.",
    atmosphere: "Exotic Copper Tandoor Aroma & Elegant Private Booths",
    operatingHours: "11:00 AM - 11:00 PM (Daily)",
    contactNumber: "+855 (0) 92 444 111",
    address: "Night Market Road, close to Pub Street district, Siem Reap, Cambodia",
    halalDetail: "100% Muslim-owned and strictly Halal verified. We follow rigorous Islamic dietary guidelines. Absolutely no pork, lard, or alcohol is allowed inside our facilities.",
    prayerFacilities: "The Siem Reap Grand Mosque is only a 3-minute drive away. The restaurant offers a clean dedicated room for prayer with wudu accessories, carpets, and prayer wear.",
    mustTryDishes: [
      {
        name: "Imperial Mutton Dum Biryani",
        price: "$15.50",
        description: "Premium basmati rice and tender chunks of local grass-fed mutton layered with saffron, rosewater, caramelized onions, and baked in a traditional clay handi sealed with wheat dough.",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
        tag: "Imperial Special"
      },
      {
        name: "Tandoori Sizzling Feast",
        price: "$14.50",
        description: "A combination of clay-oven grilled chicken tikka, mutton seekh kebab, and local river fish marinated for 24 hours in thick spiced yogurt, served on a smoking hot iron skillet.",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
        tag: "Grill Special"
      },
      {
        name: "Garlic Butter Naan Basket",
        price: "$4.50",
        description: "Three freshly slapped leavened flatbreads baked against the intense heat of our clay tandoor, brushed generously with aromatic wild garlic and rich local butter.",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb49785?auto=format&fit=crop&q=80&w=600"
      }
    ],
    faqs: [
      { q: "Are vegetarian options available?", a: "Yes, we feature an extensive list of authentic vegetarian curries like Paneer Butter Masala, Daal Makhani, and Aloo Gobi prepared with dedicated, separate vegetarian utensils." },
      { q: "Is the food very spicy?", a: "Our dishes can be fully customized to your preferred spice level - from completely mild (kid-friendly) to authentic hot. Just inform your server when ordering!" }
    ]
  }
};

export default function DiningDetailPage({ 
  restaurant, 
  onBack, 
  wishlist, 
  onToggleWishlist,
  onInquire,
  onNavigateView 
}: DiningDetailPageProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [restaurant]);

  // Retrieve static extended data or provide fallbacks
  const staticExt = restaurantExtendedData[restaurant.id] || {
    extendedDescription: restaurant.description,
    atmosphere: "Muslim-Friendly & Culturally Rich Ambiance",
    operatingHours: "11:00 AM - 10:00 PM (Daily)",
    contactNumber: "+855 (0) 23 456 789",
    address: restaurant.location,
    halalDetail: restaurant.halalCertified ? "100% Halal verified ingredients." : "Muslim-friendly dining environment.",
    prayerFacilities: restaurant.prayerRoomNearby || "Nearby mosques and quiet areas available.",
    mustTryDishes: [],
    faqs: [
      { q: "Is this establishment Halal?", a: "Yes, it complies fully with Halal standards and guidelines, serving verified meats and ingredients." },
      { q: "Do you require reservation?", a: "Walk-ins are welcome, but weekend dinner tables are limited and best reserved in advance." }
    ]
  };

  // Resolve dynamic values with high priority given to edited values in the restaurant object
  const rawPrayerDesc = restaurant.prayerSpaceDesc !== undefined 
    ? restaurant.prayerSpaceDesc 
    : (restaurant.prayerRoomNearby || staticExt.prayerFacilities || "");

  // Detect if the prayer space description indicates there is NO in-house prayer space
  const hasInhousePrayer = (() => {
    if (!rawPrayerDesc || rawPrayerDesc.trim() === "") return false;
    const lower = rawPrayerDesc.toLowerCase();
    return !(
      lower.includes("no inhouse") || 
      lower.includes("no in-house") || 
      lower.includes("no prayer space") || 
      lower.includes("no dedicated") || 
      lower.includes("no private") || 
      lower.includes("none") || 
      lower.includes("not available") || 
      lower.includes("n/a")
    );
  })();

  const resolvedPrayerFacilities = rawPrayerDesc.trim() !== "" 
    ? rawPrayerDesc 
    : "No dedicated in-house prayer space is available on-site. Guests can access nearby mosques or local prayer areas, or ask our hospitality team for assistance.";

  const ext = {
    extendedDescription: String(restaurant.about || staticExt.extendedDescription || restaurant.description || ""),
    atmosphere: restaurant.ambianceStyle || staticExt.atmosphere,
    operatingHours: restaurant.openingHours || staticExt.operatingHours,
    contactNumber: restaurant.contactNumber || staticExt.contactNumber,
    address: restaurant.address || staticExt.address,
    halalDetail: restaurant.halalDietaryPolicyDesc || staticExt.halalDetail,
    prayerFacilities: resolvedPrayerFacilities,
    mustTryDishes: (restaurant.signatureDishes && restaurant.signatureDishes.length > 0)
      ? restaurant.signatureDishes
      : staticExt.mustTryDishes,
    faqs: (restaurant.faqs && restaurant.faqs.length > 0)
      ? restaurant.faqs
      : staticExt.faqs
  };

  const resolvedHalalBullets = (restaurant.halalDietaryPolicyBullets && restaurant.halalDietaryPolicyBullets.filter(b => b.trim().length > 0).length > 0)
    ? restaurant.halalDietaryPolicyBullets.filter(b => b.trim().length > 0)
    : ["Segregated ingredient storage", "Verified Halal meat suppliers only", "Alcohol-free kitchen policy"];

  const resolvedPrayerSpaceNote = restaurant.prayerSpaceNote || (hasInhousePrayer 
    ? "We maintain sanitized praying mats, Qibla indicators, and are happy to guide you to local facilities or private clean sections in-house."
    : "Please speak with our restaurant team for directions to the nearest mosque or quiet prayer area.");

  // Construct dynamic map embed source
  let mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(ext.address && ext.address !== "Phnom Penh" && ext.address !== "Siem Reap" ? ext.address : (restaurant.name + ", " + restaurant.location + ", Cambodia"))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  
  if (restaurant.googleMapsUrl) {
    const urlStr = restaurant.googleMapsUrl.trim();
    if (urlStr.includes("<iframe")) {
      const match = urlStr.match(/src="([^"]+)"/);
      if (match && match[1]) {
        mapEmbedSrc = match[1];
      }
    } else if (urlStr.includes("embed") || urlStr.includes("output=embed")) {
      // If the user pasted an embed URL directly, check if the query is a URL itself
      if (urlStr.includes("q=http")) {
        try {
          const urlObj = new URL(urlStr);
          const qVal = urlObj.searchParams.get("q");
          if (qVal && qVal.startsWith("http")) {
            // It's a nested URL! Fallback to clean name & address search
            const cleanQuery = `${restaurant.name}, ${ext.address || restaurant.location || "Phnom Penh"}, Cambodia`;
            mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(cleanQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
          } else {
            mapEmbedSrc = urlStr;
          }
        } catch (e) {
          mapEmbedSrc = urlStr;
        }
      } else {
        mapEmbedSrc = urlStr;
      }
    } else if (urlStr.startsWith("http")) {
      // It's a standard URL. Let's try to extract a query or coordinates if present.
      let queryValue = "";
      try {
        const urlObj = new URL(urlStr);
        // Try q parameter
        let q = urlObj.searchParams.get("q");
        if (!q) {
          q = urlObj.searchParams.get("query");
        }
        
        // If we found a query and it is NOT a URL itself, use it
        if (q && !q.startsWith("http")) {
          queryValue = q;
        } else if (urlObj.pathname.includes("/place/")) {
          // Standard web URL has place name in the path: /maps/place/Place+Name/...
          const match = urlObj.pathname.match(/\/place\/([^/]+)/);
          if (match && match[1]) {
            queryValue = decodeURIComponent(match[1].replace(/\+/g, " "));
          }
        }
      } catch (e) {
        // ignore parsing error
      }
      
      // If we extracted a valid, non-URL query, use it!
      // Make sure we append ", Cambodia" to ensure perfect geocoding!
      if (queryValue) {
        if (!queryValue.toLowerCase().includes("cambodia")) {
          queryValue += ", Cambodia";
        }
        mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(queryValue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      } else {
        // If it's a short link (like maps.app.goo.gl) or standard link without a clear query,
        // we fallback to the safest, highest-precision query: Name + Address + Cambodia!
        const cleanQuery = `${restaurant.name}, ${ext.address && ext.address !== "Phnom Penh" && ext.address !== "Siem Reap" ? ext.address : (restaurant.location || "Phnom Penh")}, Cambodia`;
        mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(cleanQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    }
  }

  const mapSearchUrl = restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ext.address)}`;

  const isSaved = wishlist.includes(restaurant.id);

  const handleShare = () => {
    const url = `${window.location.origin}/dining/${restaurant.name.replace(/\s+/g, "-")}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="bg-white min-h-screen pb-16" id={`dining-detail-${restaurant.id}`}>
      {/* --- Majestic Full-Width Hero Section --- */}
      <div className="relative w-full h-[350px] sm:h-[400px] md:h-[420px] overflow-hidden">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-[10000ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/50" />
        
        {/* --- Top Navbar Inside Hero --- */}
        <div className="absolute top-0 left-0 right-0 z-20 py-5 bg-gradient-to-b from-black/70 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Back Arrow */}
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/95 hover:text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer bg-black/30 hover:bg-black/55 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
              id="btn-dining-back"
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
                onClick={() => onNavigateView ? onNavigateView("restaurants") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                DINING
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <span className="text-white/95 font-bold tracking-widest truncate max-w-[200px] sm:max-w-[300px] inline-block uppercase">{restaurant.name}</span>
            </div>
          </div>
        </div>
        
        {/* Hero Content Overlaid */}
        <div className="absolute bottom-0 left-0 right-0 z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end h-full space-y-4">
            <div className="space-y-3 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                {restaurant.halalCertified && (
                  <span className="bg-emerald-600/90 text-white text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 backdrop-blur-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Halal Verified
                  </span>
                )}
                {restaurant.muslimFriendly && (
                  <span className="bg-cyan-700/90 text-white text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold backdrop-blur-sm">
                    Muslim Friendly
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
                {restaurant.name}
              </h1>
              <div className="hidden sm:block text-white/90 text-sm sm:text-base leading-relaxed font-sans max-w-3xl drop-shadow-sm font-light space-y-3">
                {restaurant.description.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Info and Actions row */}
            <div className="flex flex-wrap items-center justify-between gap-y-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-white/90">
                <span className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-slate-300" />
                  <span>{restaurant.cuisine}</span>
                </span>
                <span className="hidden sm:inline text-white/30">|</span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-300" />
                  <span>{restaurant.location}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleWishlist(restaurant.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                    isSaved 
                      ? "bg-rose-600 border-rose-600 text-white" 
                      : "bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-sm"
                  }`}
                  id={`btn-wishlist-${restaurant.id}`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-white text-white" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save Bistro"}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm relative"
                  id="btn-share-dining"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Extended Overview */}
            <section className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  Culinary Narrative & Atmosphere
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Overview
                </h2>
              </div>
              <div className="text-slate-600 leading-relaxed font-light text-base pt-2 space-y-4">
                {ext.extendedDescription.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-blue-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">Ambiance Style</h4>
                    <p className="text-sm font-serif font-semibold text-slate-800 mt-1">{ext.atmosphere}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">Halal Standing</h4>
                    <p className="text-sm font-serif font-semibold text-slate-800 mt-1">
                      {restaurant.halalCertified ? "100% Halal Verified" : "Muslim-Friendly Dining"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Must Try dishes */}
            {ext.mustTryDishes && ext.mustTryDishes.length > 0 && (
              <section className="space-y-6 border-t border-brand-blue-accent/25 pt-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                      Recommended Specially
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                      Must-Try Signature Dishes
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ext.mustTryDishes.map((dish, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
                    >
                      <div>
                        <div className="relative h-48 w-full overflow-hidden">
                          <img 
                            src={dish.image} 
                            alt={dish.name} 
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                          />
                          {dish.tag && (
                            <span className="absolute top-4 left-4 bg-brand-blue-accent text-white font-mono text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md">
                              {dish.tag}
                            </span>
                          )}
                        </div>
                        <div className="p-6 space-y-2">
                          <h3 className="font-serif font-bold text-lg text-slate-800 tracking-wide">
                            {dish.name}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-light">
                            {dish.description}
                          </p>
                        </div>
                      </div>
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 flex items-center gap-1.5 text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-wider">
                        <Check className="w-3.5 h-3.5" />
                        100% Halal Prepared
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}



            {/* Social Media Reels Section */}
            {restaurant.socialVideos && restaurant.socialVideos.length > 0 && (
              <section className="space-y-6 border-t border-brand-blue-accent/25 pt-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                      Visual Highlights & Reels
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                      Social Highlights & Video Reels
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl">
                  {restaurant.socialVideos.map((video, idx) => (
                    <SocialVideoCard 
                      key={idx} 
                      video={video} 
                      restaurantName={restaurant.name} 
                      restaurantImage={restaurant.image}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Frequently Asked Questions */}
            <section className="space-y-8 border-t border-brand-blue-accent/25 pt-12">
              <div className="space-y-1">
                <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
                  FAQ & Dining Guidelines
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Halal Dining FAQ
                </h2>
              </div>
              <div className="space-y-4 pt-4">
                {ext.faqs.map((faq, idx) => {
                  const isOpen = activeFAQ === idx;
                  return (
                    <div 
                      key={idx}
                      className="bg-white border border-brand-blue-accent/15 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
                    >
                      <button
                        onClick={() => setActiveFAQ(isOpen ? null : idx)}
                        className="w-full text-left p-5 flex justify-between items-center gap-4 bg-brand-lightbg hover:bg-white transition-colors cursor-pointer"
                      >
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-brand-charcoal tracking-wider leading-relaxed">
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
            </section>

          </div>

          {/* Right Column (1/3 width, Sidebar) */}
          <div className="space-y-6">
            
            {/* Google Maps Location */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
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
                  src={mapEmbedSrc}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2">
                <span>Interactive Map View</span>
                <a 
                  href={mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue-accent hover:text-brand-blue-accent font-bold hover:underline transition-all"
                >
                  Open in Maps ↗
                </a>
              </div>
            </div>

            {/* Business hours & contact card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="space-y-1 border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-mono text-brand-blue uppercase tracking-widest font-bold block">Logistics & Hours</span>
                <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
                  Need to Know
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Operating hours */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-blue-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">Opening Hours</h4>
                    <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-light">{ext.operatingHours}</p>
                  </div>
                </div>

                {/* Contact phone */}
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-blue-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">Contact Number</h4>
                    <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-mono">{ext.contactNumber}</p>
                  </div>
                </div>

                {/* Physical address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-blue-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">Full Address</h4>
                    <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-light leading-relaxed">{ext.address}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
