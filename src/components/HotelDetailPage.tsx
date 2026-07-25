import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Heart, Star, MapPin, CheckCircle, ShieldCheck, 
  Utensils, Share2, Calendar, Users, Building, Info, 
  ChevronLeft, ChevronRight, X, Phone, Mail, Sparkles, Check, Globe, DollarSign, Clock,
  HelpCircle, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { Hotel, Experience } from "../types";
import { hotels } from "../data";
import { NO_PHOTO_AVAILABLE_PLACEHOLDER } from "../googlePlacesPhotoService";

interface HotelDetailPageProps {
  hotel: Hotel;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onInquire: (customDetails?: any) => void;
  allHotels?: Hotel[];
  onSelectHotel?: (hotel: Hotel) => void;
  experiences?: Experience[];
  onSelectExperience?: (exp: Experience) => void;
  onNavigateView?: (view: string) => void;
}

// Rich detailed metadata for each hotel
const hotelExtendedData: {
  [key: string]: {
    extendedDescription: string;
    atmosphere: string;
    muslimFacilitiesDetail: string;
    halalBreakfastDetail: string;
    mosqueDetail: string;
    amenitiesList: { name: string; category: string }[];
    galleryImages: string[];
    roomTiers: {
      name: string;
      priceMultiplier: number;
      size: string;
      capacity: string;
      description: string;
      image: string;
      features: string[];
    }[];
    faqs: { q: string; a: string }[];
    nearbyAttractions: { name: string; distance: string; description: string }[];
  }
} = {
  "raffles-angkor": {
    extendedDescription: "An iconic luxury landmark since 1932, Raffles Grand Hotel d'Angkor has welcomed discerning travelers, historic legends, and world leaders for nearly a century. Beautifully restored to maintain its French art deco elegance, the hotel combines historic grandeur with legendary Cambodian hospitality. It sits within 15 acres of beautifully landscaped French royal gardens, featuring the oldest and most celebrated 35-meter saltwater swimming pool in Cambodia, inspired by the royal bathing pools of Angkor.",
    atmosphere: "Historic Colonial Grandeur & Royal Khmer Warmth",
    muslimFacilitiesDetail: "Complimentary luxurious prayer mats, fine Qibla direction indicators, and hand-bound Qurans are pre-stocked or provided instantly on arrival. All bathrooms are highly spacious and designed to accommodate comfortable ablution. In-room non-alcoholic refreshments can be fully pre-configured.",
    halalBreakfastDetail: "Enjoy an imperial multi-course breakfast. Certified Halal options are prepared in a dedicated, strictly sanitized section of the royal kitchen with exclusive cookware. Private chefs are also available to tailor fine Khmer-Halal dishes for your family.",
    mosqueDetail: "The historic Siem Reap Mosque (An-Neakmah) is just 4 minutes away by car or 12 minutes by foot. Private, elegant hotel shuttle transfers can be pre-scheduled for Friday Jumu'ah prayers.",
    amenitiesList: [
      { name: "35m Royal Saltwater Pool", category: "leisure" },
      { name: "Award-winning Raffles Spa", category: "wellness" },
      { name: "15 Acres of Royal Gardens", category: "leisure" },
      { name: "Dedicated Halal Dining Sections", category: "dining" },
      { name: "24/7 Private Butler Service", category: "service" },
      { name: "Ablution-Friendly Bathrooms", category: "halal" },
      { name: "In-room Quran & Mats", category: "halal" },
      { name: "Fully Equipped Fitness Centre", category: "wellness" }
    ],
    galleryImages: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200"
    ],
    roomTiers: [
      {
        name: "State Room Garden View",
        priceMultiplier: 1.0,
        size: "42 sqm",
        capacity: "2 Adults, 1 Child",
        description: "Elegant heritage-inspired rooms decorated with high-quality Cambodian silks, custom-crafted colonial furniture, and a private balcony overlooking the magnificent royal gardens.",
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800",
        features: ["Private balcony", "Heritage colonial bathtub", "Scented bath rituals", "Butler call button"]
      },
      {
        name: "Landmark Suite",
        priceMultiplier: 1.5,
        size: "72 sqm",
        capacity: "3 Adults, 1 Child",
        description: "A spacious luxury sanctuary with high ceilings, separate master living area, handpicked historical antiques, and marble-clad bathrooms perfectly set up for family comfort.",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800",
        features: ["Separate living room", "Historic marble bathroom", "Walk-in dressing parlor", "Complimentary laundry service"]
      },
      {
        name: "Bensley Private Pool Villa",
        priceMultiplier: 2.5,
        size: "150 sqm",
        capacity: "4 Adults, 2 Children",
        description: "Ultimate luxury and absolute seclusion. Features a high-walled private courtyard with a majestic plunge pool, sun loungers, outdoor dining pavillion, and a dedicated 24-hour private butler.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
        features: ["Private walled courtyard", "10m plunge pool", "Outdoor rainforest shower", "24-hour dedicated butler", "Private Halal BBQ dinner option"]
      }
    ],
    faqs: [
      { q: "Is the swimming pool private?", a: "The main 35m saltwater swimming pool is a beautiful shared space. However, for complete privacy, our luxury Private Pool Villas feature high-walled private gardens with individual plunge pools ensuring zero external visibility." },
      { q: "How is cross-contamination prevented for Halal meals?", a: "Raffles operates a designated, certified Halal food preparation station. All Halal items are stored in segregated cooling units, and cooked with certified-only utensils and pans to guarantee 100% integrity." },
      { q: "Are prayer mats and Qibla coordinates provided?", a: "Yes, every Muslim guest is provided with sanitized premium prayer mats and a localized Qibla indicator map automatically. Qurans are also pre-stocked in your room upon requesting at booking." }
    ],
    nearbyAttractions: [
      { name: "Angkor Wat Temple Complex", distance: "10 mins drive", description: "The ancient crown jewel archaeological wonder of Southeast Asia." },
      { name: "Siem Reap Mosque & Cham Quarter", distance: "4 mins drive", description: "Vibrant local Islamic community hub, markets, and Halal eateries." },
      { name: "Royal Independence Gardens", distance: "Adjacent (1 min walk)", description: "Serene walking trails under giant century-old trees filled with flying foxes." }
    ]
  },
  "rosewood-phnom-penh": {
    extendedDescription: "Soaring 188 meters over the heart of Cambodia's capital, Rosewood Phnom Penh occupies the top 14 floors of the iconic Vattanac Capital Tower. This ultra-luxury landmark offers unobstructed panoramic views of the historic Mekong River, Royal Palace, and thriving city skyline. The hotel represents the ultimate marriage of cutting-edge modern architecture, opulent residential styling, and customized guest care.",
    atmosphere: "Sky-High Sophistication & Ultimate Modern Luxury",
    muslimFacilitiesDetail: "All sky rooms and suites are pre-aligned with clear Qibla direction indicators. Bathrooms feature pristine modern bidet attachments, deep soaking bathtubs, and extensive space ideal for comfortable ablution. Private quiet alcoves are also available for prayer.",
    halalBreakfastDetail: "Our high-end Brasserie features a dedicated certified Halal breakfast section with organic pastries, live egg stations, and premium Halal cold cuts. Private in-room Halal dining options are available 24/7.",
    mosqueDetail: "Phnom Penh's beautiful Al-Serkal Grand Mosque is only a 5-minute drive from the hotel entrance. It is the premier national mosque with spacious gardens and magnificent prayer halls.",
    amenitiesList: [
      { name: "Sora Sky Bar (Non-Alc options)", category: "leisure" },
      { name: "22m Indoor Swimming Pool", category: "leisure" },
      { name: "Sense, A Rosewood Spa", category: "wellness" },
      { name: "Panoramic River Views", category: "leisure" },
      { name: "Luxury Bidet Bathrooms", category: "halal" },
      { name: "In-room Qibla Indicators", category: "halal" },
      { name: "Bespoke Concierge Portal", category: "service" },
      { name: "24/7 In-Room Halal Menu", category: "dining" }
    ],
    galleryImages: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1611891404964-057b049d2d68?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1200"
    ],
    roomTiers: [
      {
        name: "Executive Room",
        priceMultiplier: 1.0,
        size: "50 sqm",
        capacity: "2 Adults, 1 Child",
        description: "Spacious residential-style room featuring majestic floor-to-ceiling windows overlooking Phnom Penh and the Mekong River, custom leather accents, and an integrated luxury marble master bathroom.",
        image: "https://images.unsplash.com/photo-1611891404964-057b049d2d68?auto=format&fit=crop&q=80&w=800",
        features: ["Floor-to-ceiling glass windows", "Panoramic river views", "Nespresso coffee machine", "Marble bathroom with luxury bidet"]
      },
      {
        name: "Manor Suite",
        priceMultiplier: 1.6,
        size: "82 sqm",
        capacity: "3 Adults, 1 Child",
        description: "Designed to reflect an elegant private manor house. Features an expansive separate lounge, bespoke walk-in wardrobes, a dining workspace, and highly private corner panoramas.",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
        features: ["Corner sky views", "Separate grand lounge", "Custom walk-in dressing room", "Complimentary high tea in-suite"]
      },
      {
        name: "Mekong Suite",
        priceMultiplier: 2.3,
        size: "120 sqm",
        capacity: "4 Adults, 2 Children",
        description: "The peak of metropolitan luxury. Features majestic panoramic sweeps of the Mekong River confluence, dual master suites, dining tables for 6, and dedicated round-the-clock host care.",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800",
        features: ["Dual-master bedrooms", "Unrivaled river panoramas", "Full gourmet pantry", "Personal Rosewood Host service"]
      }
    ],
    faqs: [
      { q: "Is the pool family-friendly and private?", a: "Our beautiful 22-meter indoor infinity pool offers breathtaking panoramic views of the city. While it is shared, we can arrange specific quiet times for families, and privacy dividers can be booked in advance." },
      { q: "Are the restaurants in the hotel Halal-certified?", a: "While the main outlets serve diverse cuisines, all meats served in our primary dining options are strictly Halal-sourced. We maintain a rigorous, separate preparation line to guarantee absolute compliance." },
      { q: "Can the hotel arrange a private guide to local mosques?", a: "Yes, our luxury concierge can organize a dedicated local Cham Muslim guide with private executive transport to Phnom Penh's Al-Serkal Grand Mosque and local Halal craft shops." }
    ],
    nearbyAttractions: [
      { name: "Al-Serkal Grand Mosque", distance: "5 mins drive", description: "Cambodia's most iconic and majestic national mosque, constructed in 1968." },
      { name: "The Royal Palace & Silver Pagoda", distance: "8 mins drive", description: "The stunning royal riverfront residence of the Cambodian King." },
      { name: "Central Market (Phsar Thmey)", distance: "3 mins walk", description: "A majestic Art Deco landmark with hundreds of vibrant jewelry, fabric, and local spice stalls." }
    ]
  },
  "shinta-mani-reap": {
    extendedDescription: "An award-winning luxury boutique resort designed by the legendary architect Bill Bensley, Shinta Mani Angkor & Bensley Collection is an absolute visual masterpiece. Located in the leafy French Quarter of Siem Reap, this resort provides a whimsical blend of lush vertical green walls, black-and-white avant-garde design, and private walled courtyard villas with private plunge pools, offering ultimate luxury and uncompromised privacy.",
    atmosphere: "Whimsical Architectural Oasis & Private Luxury Sanctuary",
    muslimFacilitiesDetail: "A premium luxury Muslim travel kit is provided upon arrival, including thick padded prayer mats, beautifully embroidered prayer robes, localized Qibla compasses, and local prayer time sheets. Complete bathroom privacy is assured throughout the property.",
    halalBreakfastDetail: "Indulge in tailored Halal-certified dining. The resort sources fresh organic ingredients from local Muslim-owned farms. Guests can request a private chef to prepare customized Halal menus in their villas.",
    mosqueDetail: "Perfectly situated for Muslim travelers, the Siem Reap Mosque is within a short and highly pleasant 5-minute walk from the resort lobby gates, passing through peaceful neighborhood avenues.",
    amenitiesList: [
      { name: "Private Pool Courtyards", category: "leisure" },
      { name: "Bill Bensley Architecture", category: "leisure" },
      { name: "Shinta Mani Spa & Wellness", category: "wellness" },
      { name: "Local Social Vetted Charity", category: "service" },
      { name: "5-Min Walk to Mosque", category: "halal" },
      { name: "Organic Halal Farming", category: "dining" },
      { name: "Embroidered Prayer Robes", category: "halal" },
      { name: "Private Courtyard BBQ", category: "dining" }
    ],
    galleryImages: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=1200"
    ],
    roomTiers: [
      {
        name: "Bensley Pool Villa",
        priceMultiplier: 1.0,
        size: "156 sqm",
        capacity: "2 Adults, 1 Child",
        description: "The jewel of Siem Reap. A two-level ultra-private luxury villa surrounded by soaring high stone walls, featuring an 9-meter private lap pool, rooftop star bed, and a dedicated Bensley Butler.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
        features: ["Private high-walled pool", "Rooftop star lounge bed", "Extravagant outdoor bathtub", "24/7 dedicated butler", "Free-flow local fruit bar"]
      },
      {
        name: "Deluxe Courtyard Room",
        priceMultiplier: 0.5,
        size: "45 sqm",
        capacity: "2 Adults",
        description: "Bensley-styled luxury overlooking the central green courtyard gardens, featuring striking monochromatic artwork, custom stone carving accents, and custom linen bedding.",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
        features: ["Balcony with garden views", "Monochromatic avant-garde design", "Premium rain shower", "Eco-friendly bath products"]
      }
    ],
    faqs: [
      { q: "Is the villa pool completely private and unseen?", a: "Yes. Our Bensley Collection Pool Villas are designed with soaring 3-meter stone walls surrounding the entire courtyard, ensuring absolute privacy from any neighbors or staff, perfect for Muslim women and families." },
      { q: "How close is the nearest Halal restaurant?", a: "Siem Reap's finest verified Halal restaurant, Angkor Halal, is located right beside the local mosque, which is just a 5-minute walk from the resort entrance." },
      { q: "What is the Shinta Mani Foundation?", a: "A portion of every room rate goes directly to the Shinta Mani Foundation, which funds free hospitality schooling, micro-finance loans, and healthcare for local families, including Cham Muslim communities." }
    ],
    nearbyAttractions: [
      { name: "Siem Reap Mosque & Islamic School", distance: "5 mins walk", description: "The central mosque for local and visiting Muslim worshipers." },
      { name: "Pub Street & Old Market", distance: "8 mins walk", description: "Bustling walking avenues filled with boutiques, art galleries, and night markets." },
      { name: "Angkor National Museum", distance: "5 mins drive", description: "A high-tech museum highlighting the golden age of Khmer civilization." }
    ]
  },
  "sofitel-phnom-penh": {
    extendedDescription: "A gorgeous riverside sanctuary blending French 'art de vivre' with refined Cambodian elegance. Sofitel Phnom Penh Phokeethra is set amongst beautifully landscaped tropical gardens in the quiet diplomatic district. Boasting classic timber floors, high ceilings, stunning views of the Bassac River, and a legendary sports club, this resort represents a highly tranquil haven in the heart of the capital.",
    atmosphere: "French Elegance & Serene Riverside Tranquility",
    muslimFacilitiesDetail: "Mecca Qibla direction vectors are pre-marked in all luxury rooms. We provide dedicated private prayer rooms for events, premium prayer mats upon request, and robust, private, ablution-friendly bathrooms in all master suites.",
    halalBreakfastDetail: "The acclaimed 'La Coupole' restaurant offers a designated international breakfast buffet featuring certified Halal food arrays, organic local ingredients, and dedicated preparation chefs.",
    mosqueDetail: "The historic riverside An-Nurain Mosque is an easy 8-minute drive from the resort gates. Private limousines with English-speaking guides are available for booking at the concierge desk.",
    amenitiesList: [
      { name: "La Coupole (Halal Section)", category: "dining" },
      { name: "Phokeethra Sports Club", category: "leisure" },
      { name: "Two Outdoor Pools", category: "leisure" },
      { name: "So SPA with L'Occitane", category: "wellness" },
      { name: "Riverside Garden Walks", category: "leisure" },
      { name: "In-room Qibla Indicators", category: "halal" },
      { name: "Large Ablution Bathrooms", category: "halal" },
      { name: "Kids Club & Family Care", category: "service" }
    ],
    galleryImages: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200"
    ],
    roomTiers: [
      {
        name: "Superior Room",
        priceMultiplier: 1.0,
        size: "47 sqm",
        capacity: "2 Adults, 1 Child",
        description: "Featuring traditional hardwood floors, beautiful colonial furniture, high ceilings, a private writing desk, and magnificent views of the pool or river.",
        image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=800",
        features: ["Hardwood timber floors", "Private river-view balcony", "Lanvin luxury bath amenities", "Pre-marked Qibla direction"]
      },
      {
        name: "Opera Suite",
        priceMultiplier: 1.7,
        size: "94 sqm",
        capacity: "3 Adults, 2 Children",
        description: "An incredibly grand suite with separate master living parlor, full dining room, luxury Hermès guest amenities, and dual-basin marble master bathrooms suitable for family groups.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
        features: ["Separate living & dining rooms", "Hermès bath amenities", "Club Millésime executive access", "Complimentary private airport transfer"]
      }
    ],
    faqs: [
      { q: "Does the hotel serve non-alcoholic beverages?", a: "Yes. Our fine lounges and room-service offer an extensive collection of bespoke non-alcoholic sparkling juices, mocktails, and fresh coconut drinks. We can clear mini-bars of alcohol entirely in advance." },
      { q: "Is the pool area family-friendly?", a: "We feature two highly spacious outdoor lagoon-style pools situated in lush green tropical gardens, offering a very calm, quiet, and family-friendly environment with designated child-friendly shallow pools." },
      { q: "Is there space for congregational prayers?", a: "Yes. For larger families or groups, we can allocate private, quiet, and pristine conference rooms with prayer carpets and clear Qibla markings for your private daily prayers." }
    ],
    nearbyAttractions: [
      { name: "An-Nurain Mosque", distance: "8 mins drive", description: "A beautifully historic riverside mosque serving the local neighborhood." },
      { name: "Aeon Mall Phnom Penh", distance: "3 mins walk", description: "Cambodia's premium shopping center featuring dozens of global brands and local Halal dining outlets." },
      { name: "Mekong River Walkway", distance: "5 mins walk", description: "A beautiful green linear park lining the majestic Bassac and Mekong rivers." }
    ]
  }
};

const collageImages = [
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
    title: "Imperial Pool Sanctuary",
    location: "Raffles Grand Hotel d'Angkor"
  },
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200",
    title: "Skyline Suite Panorama",
    location: "Rosewood Phnom Penh"
  },
  {
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
    title: "Bensley Private Villa Oasis",
    location: "Shinta Mani Angkor"
  },
  {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200",
    title: "Royal Gardens & Palms",
    location: "Sofitel Phnom Penh Phokeethra"
  },
  {
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
    title: "Overwater Ocean Pavillion",
    location: "Song Saa Private Island"
  },
  {
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200",
    title: "Zen Royal Bed Chamber",
    location: "Bespoke Residence"
  },
  {
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200",
    title: "Irrawaddy Mekong Shoreline",
    location: "Kratie Sanctuary"
  },
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
    title: "Sok San Pristine Bay",
    location: "Koh Rong Islands"
  },
  {
    url: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1200",
    title: "Majestic Angkor Sunrise",
    location: "Siem Reap Heritage Site"
  },
  {
    url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1200",
    title: "Riverside Saltwater Estuary",
    location: "Kampot & Kep"
  }
];

export default function HotelDetailPage({
  hotel,
  onBack,
  wishlist,
  onToggleWishlist,
  onInquire,
  allHotels = [],
  onSelectHotel,
  experiences = [],
  onSelectExperience,
  onNavigateView
}: HotelDetailPageProps) {
  const isSaved = wishlist.includes(hotel.id);
  const getHotelDestinationCity = (loc: string) => {
    if (loc.toLowerCase().includes("siem reap")) return "Siem Reap";
    if (loc.toLowerCase().includes("phnom penh")) return "Phnom Penh";
    if (loc.toLowerCase().includes("koh rong")) return "Koh Rong";
    if (loc.toLowerCase().includes("kampot")) return "Kampot";
    if (loc.toLowerCase().includes("kep")) return "Kep";
    if (loc.toLowerCase().includes("battambang")) return "Battambang";
    if (loc.toLowerCase().includes("kratie")) return "Kratie";
    return "";
  };

  const hotelCity = getHotelDestinationCity(hotel.location);
  const hotelExperiences = (experiences || []).filter(exp => {
    if (!hotelCity) return true;
    return exp.location.toLowerCase().includes(hotelCity.toLowerCase());
  });

  const getStay22BookingUrl = () => {
    if (hotel.stay22Url && hotel.stay22Url.trim()) {
      return hotel.stay22Url.trim();
    }
    const aid = hotel.stay22Aid && hotel.stay22Aid.trim() ? hotel.stay22Aid.trim() : "ahlancambodia";
    const query = hotel.stay22HotelId && hotel.stay22HotelId.trim() ? hotel.stay22HotelId.trim() : `${hotel.name}, ${hotel.location}`;
    return `https://www.stay22.com/embed/gm?aid=${encodeURIComponent(aid)}&address=${encodeURIComponent(query)}`;
  };
  const stay22Url = getStay22BookingUrl();

  const ext = hotelExtendedData[hotel.id] || {
    extendedDescription: hotel.description,
    atmosphere: "Premium Luxury Vibe",
    muslimFacilitiesDetail: hotel.prayerFacilities,
    halalBreakfastDetail: hotel.halalBreakfast,
    mosqueDetail: hotel.nearbyMosque,
    amenitiesList: (hotel.amenities || ["Free Wifi", "Halal Dining", "Pool"]).map(a => ({ name: a, category: "leisure" })),
    galleryImages: (hotel.photoUrls && hotel.photoUrls.length > 0) ? hotel.photoUrls : [hotel.image || NO_PHOTO_AVAILABLE_PLACEHOLDER],
    roomTiers: [
      {
        name: "Deluxe Suite",
        priceMultiplier: 1.0,
        size: "45 sqm",
        capacity: "2 Guests",
        description: "Our high-end signature room offering utmost comfort, premium bidet bathrooms, and elegant Cambodian artwork.",
        image: hotel.image,
        features: ["Premium bidet bathroom", "Free High-speed Wi-Fi", "In-room prayer mats", "Ablution friendly space"]
      }
    ],
    faqs: [
      { q: "Are Halal meals certified?", a: "Yes, our kitchens source fully certified Halal meats and operate strictly separate cooking streams for all Halal orders." }
    ],
    nearbyAttractions: [
      { name: "Nearby Mosque", distance: "5-10 mins", description: hotel.nearbyMosque }
    ]
  };

  const [activeTab, setActiveTab] = useState<"overview" | "halal" | "suites" | "location">("overview");
  const [activeRoomIndex, setActiveRoomIndex] = useState<number>(0);
  const [selectedCollageIndex, setSelectedCollageIndex] = useState<number | null>(null);
  const [openHotelFaqIndex, setOpenHotelFaqIndex] = useState<number | null>(0);

  const hotelFaqs = useMemo(() => {
    const baseFaqs = ext.faqs || [];
    const fallbackFaqs = [
      {
        q: "What is your policy regarding alcohol on the premises?",
        a: "To ensure a serene, family-friendly environment, all our properties can fully clear in-room minibars of alcoholic beverages prior to your arrival upon request. We also offer an exquisite selection of non-alcoholic sparkling drinks and hand-crafted mocktails at all our dining venues."
      },
      {
        q: "Are the wellness and spa facilities private or segregated?",
        a: "Our spa sanctuaries offer fully private treatment suites where you can enjoy massage and wellness therapies in complete isolation. We also have gender-segregated hours for our steam, sauna, and wellness amenities. Please contact our front desk to schedule your preferred private slot."
      },
      {
        q: "Is there a mosque or prayer hall nearby?",
        a: ext.mosqueDetail 
          ? `Yes, the nearest mosque is ${ext.mosqueDetail}. Our 24/7 concierge can also arrange private chauffeured transfers for Jumu'ah (Friday) prayers upon request.`
          : "Yes, our concierge maintains a list of local mosques and prayer spaces. We can also provide private transport and a local guide for your visits."
      },
      {
        q: "How are women's privacy preferences accommodated at the pool?",
        a: "For guests staying in our private pool villas, complete visual privacy is assured by high stone walls. For other guests, we offer booking slots for private indoor wellness facilities or can recommend times when the main areas are exceptionally quiet."
      },
      {
        q: "Can the hotel customize daily excursions to include Halal food stops?",
        a: "Absolutely. Our bespoke tour coordinators specialize in crafting custom itineraries. All planned day-trips and temple excursions are mapped with vetted, premium Halal-certified dining venues and include designated breaks at local prayer-friendly locations."
      }
    ];

    const result = [...baseFaqs];
    for (const fb of fallbackFaqs) {
      if (result.length >= 5) break;
      const isDuplicate = result.some(item => item.q.toLowerCase().includes(fb.q.split(" ")[0].toLowerCase()));
      if (!isDuplicate) {
        result.push(fb);
      }
    }
    while (result.length < 5 && fallbackFaqs.length > 0) {
      const nextFb = fallbackFaqs[result.length % fallbackFaqs.length];
      result.push(nextFb);
    }
    return result.slice(0, 5);
  }, [ext, hotel]);
  
  const handlePrevCollage = () => {
    if (selectedCollageIndex === null) return;
    setSelectedCollageIndex((prev) => (prev === 0 ? collageImages.length - 1 : prev! - 1));
  };

  const handleNextCollage = () => {
    if (selectedCollageIndex === null) return;
    setSelectedCollageIndex((prev) => (prev === collageImages.length - 1 ? 0 : prev! + 1));
  };

  // Keyboard navigation for Collage Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCollageIndex !== null) {
        if (e.key === "ArrowLeft") {
          handlePrevCollage();
        } else if (e.key === "ArrowRight") {
          handleNextCollage();
        } else if (e.key === "Escape") {
          setSelectedCollageIndex(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCollageIndex]);

  // Touch Swipe navigation for Collage Lightbox
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
      handleNextCollage();
    } else if (isRightSwipe) {
      handlePrevCollage();
    }
  };

  // Customizer form state
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedRoomTier, setSelectedRoomTier] = useState<string>(ext.roomTiers[0]?.name || "Deluxe Suite");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [specialNote, setSpecialNote] = useState<string>("");
  const [preStockHalal, setPreStockHalal] = useState<boolean>(true);
  const [prayerMatsRequested, setPrayerMatsRequested] = useState<boolean>(true);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Dynamic pricing calculations
  const baseRate = hotel.price;
  const selectedTier = ext.roomTiers.find((t) => t.name === selectedRoomTier) || ext.roomTiers[0];
  const rateMultiplier = selectedTier ? selectedTier.priceMultiplier : 1.0;
  const currentNightlyRate = Math.round(baseRate * rateMultiplier);
  
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const totalNights = calculateNights();
  const totalInquiryPrice = currentNightlyRate * totalNights;

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText?.(window.location.href);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;

    onInquire({
      hotelName: hotel.name,
      roomTier: selectedRoomTier,
      checkIn,
      checkOut,
      adults,
      children,
      totalNights,
      preStockHalal,
      prayerMatsRequested,
      contactName,
      contactEmail,
      specialNote,
      estimatedQuote: totalInquiryPrice
    });

    setFormSubmitted(true);
  };

  return (
    <div className="w-full bg-brand-warmwhite/30 min-h-screen pb-20 animate-fade-in" id="hotel-detail-stage">
      
      {/* Dynamic Collage Lightbox Overlay with keyboard/swipe controls */}
      {selectedCollageIndex !== null && (
        <div 
          className="fixed inset-0 bg-[#0F1626]/98 z-50 flex items-center justify-center p-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            onClick={() => setSelectedCollageIndex(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handlePrevCollage}
            className="absolute left-4 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer transition-all z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[80vh] flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
            <img 
              src={collageImages[selectedCollageIndex].url} 
              alt={collageImages[selectedCollageIndex].title}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-white font-serif font-bold text-lg mt-4 tracking-wide">
              {collageImages[selectedCollageIndex].title}
            </h3>
            <p className="text-brand-blue-accent font-mono text-xs mt-1 uppercase tracking-widest">
              {collageImages[selectedCollageIndex].location}
            </p>
            <p className="text-white/40 font-mono text-[10px] mt-2">
              Image {selectedCollageIndex + 1} of {collageImages.length}
            </p>
          </div>

          <button 
            onClick={handleNextCollage}
            className="absolute right-4 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer transition-all z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* --- Majestic Full-Width Hero Section --- */}
      <div className="relative w-full h-[350px] sm:h-[400px] md:h-[420px] overflow-hidden">
        <img 
          src={hotel.image} 
          alt={hotel.name} 
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
                onClick={() => onNavigateView ? onNavigateView("hotels") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                HOTELS
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <span className="text-white/95 font-bold tracking-widest truncate max-w-[200px] sm:max-w-[300px] inline-block uppercase">{hotel.name}</span>
            </div>
          </div>
        </div>
        
        {/* Hero Content Overlaid */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 space-y-4">
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
              {hotel.name}
            </h1>
            <p className="hidden sm:block text-white/95 text-sm sm:text-base leading-relaxed font-sans max-w-3xl drop-shadow-sm font-light">
              {ext.extendedDescription ? (ext.extendedDescription.slice(0, 180) + "...") : (hotel.description || "Discover meticulously vetted boutique accommodations offering premium halal amenities and pristine serene designs.")}
            </p>
          </div>

          {/* Info and Actions row */}
          <div className="flex flex-wrap items-center justify-between gap-y-4 pt-4 border-t border-white/15">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-white/90">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-slate-300" />
                {hotel.stars} Stars
              </span>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-300" />
                <span><span className="text-white font-sans font-medium">{hotel.location}</span></span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleWishlist(hotel.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                  isSaved 
                    ? "bg-brand-red/10 border-brand-red/35 text-brand-red" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-sm"
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-brand-red text-brand-red" : ""}`} />
                <span>{isSaved ? "Saved" : "Save Hotel"}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm relative"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                {copiedLink && (
                  <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
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
              {hotel.name}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <a
              href={stay22Url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono px-3.5 sm:px-5 h-9 sm:h-10 flex items-center justify-center rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer shrink-0 gap-1.5"
            >
              <span>Book via Stay22</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT 2 COLUMNS: Tabs & Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Minimalist Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-2 sm:px-6 pt-3 select-none">
              {[
                { id: "overview", label: "Overview & Features" },
                { id: "halal", label: "Experiences" },
                { id: "suites", label: "Suites & Villas" },
                { id: "location", label: "Location & Travel" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 sm:px-6 py-4 font-mono text-[11px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "border-brand-blue-accent text-brand-blue-accent" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="bg-white border-x border-b border-slate-200/80 rounded-b-3xl p-6 sm:p-10 shadow-sm min-h-[300px]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-brand-charcoal flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                      About {hotel.name}
                    </h3>
                    <div className="text-brand-charcoal/80 text-sm leading-relaxed font-sans space-y-4">
                      {ext.extendedDescription.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50 border-l-4 border-brand-blue-accent p-5 rounded-r-2xl">
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-brand-blue font-bold flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                      Atmosphere & Vibe
                    </h4>
                    <p className="text-sm font-sans font-semibold text-brand-charcoal/90 italic">
                      "{ext.atmosphere}"
                    </p>
                  </div>

                  {/* Brand Amenities Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-700 font-bold flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                      Premium Amenities
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ext.amenitiesList.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 bg-slate-50/70 border border-slate-200/60 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-brand-blue-accent shrink-0" />
                          <span className="text-xs font-medium text-brand-charcoal">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Curated Hotel Photo Gallery */}
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-700 font-bold flex items-center gap-2">
                        <span className="w-1 h-4 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                        <span>Curated Photo Gallery ({ext.galleryImages ? ext.galleryImages.length : 0} Photos)</span>
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                        Vetted Property
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {(ext.galleryImages || [hotel.image]).map((imgUrl, i) => (
                        <div 
                          key={i}
                          onClick={() => {
                            const cIdx = collageImages.findIndex(c => c.url === imgUrl);
                            if (cIdx !== -1) setSelectedCollageIndex(cIdx);
                            else setSelectedCollageIndex(0);
                          }}
                          className="group relative h-28 sm:h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                          <img 
                            src={imgUrl} 
                            alt={`${hotel.name} view ${i + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                            <span className="text-[9px] font-mono text-white font-bold uppercase tracking-wider flex items-center gap-1">
                              View Full HD
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPERIENCES */}
              {activeTab === "halal" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-brand-charcoal flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                      Curated Local Experiences
                    </h3>
                  </div>

                  {hotelExperiences.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm font-sans">
                      No specific nearby experiences listed for this destination yet. Feel free to contact our concierge!
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {hotelExperiences.map((exp) => (
                        <div 
                          key={exp.id}
                          className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:border-brand-blue-accent hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row"
                        >
                          <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                            <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 text-[9px] font-mono font-bold uppercase tracking-widest text-white shadow-md border border-white/20 px-2.5 py-1 rounded-md bg-brand-blue">
                              {exp.category}
                            </span>
                          </div>
                          <div className="p-5 sm:w-3/5 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <h4 className="font-serif font-bold text-base text-brand-charcoal tracking-wide leading-snug">
                                {exp.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-brand-blue-accent" />
                                  {exp.duration}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-brand-blue-accent" />
                                  {exp.location.split(",")[0]}
                                </span>
                              </div>
                              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                                {exp.shortDescription || exp.description}
                              </p>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                              <a 
                                href={`/experiences/${(exp.name || exp.id).replace(/\s+/g, "-")}`}
                                onClick={(e) => {
                                  if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                                    e.preventDefault();
                                    if (onSelectExperience) {
                                      onSelectExperience(exp);
                                    }
                                  }
                                }}
                                className="text-[10px] font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-lg font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer inline-block text-center"
                              >
                                Explore →
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SUITES & VILLAS */}
              {activeTab === "suites" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-brand-charcoal flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                      Available Luxury Tiers
                    </h3>
                  </div>

                  {/* Room Cards Stack */}
                  <div className="space-y-6">
                    {ext.roomTiers.map((room, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setActiveRoomIndex(idx);
                          setSelectedRoomTier(room.name);
                        }}
                        className={`group cursor-pointer bg-white border rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row ${
                          selectedRoomTier === room.name 
                            ? "border-brand-blue-accent ring-2 ring-brand-blue-accent/30" 
                            : "border-slate-200 hover:border-brand-blue-accent/50"
                        }`}
                      >
                        <div className="relative md:w-2/5 h-52 md:h-auto overflow-hidden shrink-0">
                          <img 
                            src={room.image} 
                            alt={room.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-brand-blue-accent font-bold uppercase tracking-wider">
                            {room.size}
                          </div>
                        </div>

                        <div className="p-6 md:w-3/5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-serif text-base font-bold text-[#0F1626]">{room.name}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                                <Users className="w-4 h-4 text-brand-blue-accent" />
                                <span>{room.capacity}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">
                              {room.description}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            {/* Features list */}
                            <div className="flex flex-wrap gap-1.5">
                              {room.features.map((feat, fIdx) => (
                                <span key={fIdx} className="bg-slate-100 border border-slate-200/60 text-[10px] font-sans font-medium text-brand-charcoal px-2.5 py-1 rounded-md">
                                  {feat}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Nightly Rate</span>
                              <div className="text-base font-bold text-brand-green font-mono">
                                ${Math.round(hotel.price * room.priceMultiplier)} / night
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: LOCATION & ATTRACTIONS */}
              {activeTab === "location" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-brand-charcoal flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                      Location Profile & Attractions
                    </h3>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Address Directory</span>
                      <p className="text-xs font-semibold text-brand-charcoal leading-relaxed">
                        {hotel.location}
                      </p>
                    </div>

                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(hotel.name + " " + hotel.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-4 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all inline-flex items-center gap-1.5 w-fit shrink-0"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Open Google Maps</span>
                    </a>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-700 font-bold flex items-center gap-2">
                      <span className="w-1 h-4 bg-brand-blue-accent rounded-full inline-block shrink-0" />
                      Recommended Nearby Sightseeing
                    </h4>
                    <div className="space-y-3">
                      {ext.nearbyAttractions.map((att, i) => (
                        <div key={i} className="flex items-start gap-4 bg-white border border-slate-200 p-4 rounded-xl">
                          <div className="bg-brand-blue-accent/10 border border-brand-blue-accent/25 rounded-xl px-2.5 py-1.5 shrink-0 text-center min-w-[70px]">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-brand-blue-accent font-bold block">Distance</span>
                            <span className="text-xs font-serif font-bold text-[#0F1626] whitespace-nowrap">{att.distance}</span>
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-brand-charcoal">{att.name}</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {att.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Live Inquire & Customizer Card */}
          <div className="space-y-6">
            
            {/* STAY22 DIRECT BOOKING CARD */}
            <div className="bg-gradient-to-br from-[#0F1626] via-[#1A233A] to-[#0F1626] border border-emerald-500/30 rounded-3xl p-6 shadow-xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-1 h-5 bg-brand-blue-accent rounded-full shrink-0" />
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wide">Live Rates via Stay22</h3>
                    <p className="text-[10px] text-emerald-400 font-mono">Instant Booking & Best Price Guarantee</p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[9px] uppercase font-bold px-2.5 py-1 rounded-full">
                  Partner
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Check live room availability, compare rates across top booking engines, and secure your reservation instantly with Stay22.
              </p>

              <a
                href={stay22Url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0F1626] py-3.5 rounded-xl font-mono text-xs uppercase tracking-widest font-extrabold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <span>Check Rates & Book on Stay22</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div id="hotel-inquiry-card" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md sticky top-28 space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif text-base font-bold text-[#0F1626] uppercase tracking-wide flex items-center gap-2.5">
                  <span className="w-1 h-5 bg-brand-blue-accent rounded-full shrink-0" />
                  <span>Stay Customiser</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Configure your boutique luxury holiday</p>
              </div>

              {!formSubmitted ? (
                <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                  
                  {/* Select Stay Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Check In</label>
                      <input 
                        type="date" 
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-blue-accent text-slate-700 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Check Out</label>
                      <input 
                        type="date" 
                        required
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-blue-accent text-slate-700 font-bold"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Adults (18+)</label>
                      <select 
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-blue-accent text-slate-700 font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>{num} {num === 1 ? "Adult" : "Adults"}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Children</label>
                      <select 
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-blue-accent text-slate-700 font-bold"
                      >
                        {[0, 1, 2, 3, 4].map((num) => (
                          <option key={num} value={num}>{num} {num === 1 ? "Child" : "Children"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Lead Contact Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Bassam Alie"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue-accent text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. concierge@ahlancambodia.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue-accent text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Custom Requests (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Add special diet, bed arrangements, or private transfer requests..."
                        value={specialNote}
                        onChange={(e) => setSpecialNote(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-blue-accent text-slate-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white py-3.5 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    Send Luxury Reservation Inquiry
                  </button>

                </form>
              ) : (
                <div className="space-y-6 text-center py-6 animate-fade-in">
                  <div className="bg-emerald-100 border border-emerald-300 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-emerald-700">
                    <Check className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-serif text-base font-bold text-brand-charcoal">Inquiry Submitted!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans px-4">
                      Thank you, <span className="font-bold text-emerald-700">{contactName}</span>. Your custom boutique stay inquiry has been sent to the Ahlan Cambodia Concierge desk.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 text-[11px] font-mono text-[#0F1626] text-left border border-slate-100">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Summary</span>
                    <p className="font-bold mt-1">{hotel.name}</p>
                    {checkIn && <p className="text-slate-500 mt-1">Check In: {checkIn}</p>}
                    {checkOut && <p className="text-slate-500">Check Out: {checkOut}</p>}
                    <p className="text-slate-500">Guests: {adults} Adults, {children} Children</p>
                  </div>

                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setCheckIn("");
                      setCheckOut("");
                      setContactName("");
                      setContactEmail("");
                      setSpecialNote("");
                    }}
                    className="text-xs font-mono font-bold text-brand-blue-accent hover:text-[#0F1626] hover:underline"
                  >
                    Submit another customized inquiry
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* --- SANCTUARY PHOTO GALLERY SECTION (Clean Balanced Grid) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-slate-200 space-y-8">
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 select-none">
          <div>
            <span className="text-[10px] font-mono text-brand-blue font-bold uppercase tracking-[0.2em] block mb-1">IMAGINE THE EXPERIENCE</span>
            <h3 className="font-serif text-2xl font-bold text-brand-charcoal uppercase tracking-wide flex items-center gap-3">
              <span className="w-1.5 h-7 bg-brand-blue-accent rounded-full inline-block shrink-0" />
              Sanctuary Photo Gallery
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
            10 Curation Slides
          </span>
        </div>

        {/* Clean balanced grid replacing asymmetric bento style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {collageImages.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedCollageIndex(idx)}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group bg-slate-100 border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ SECTION (5 FAQs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-slate-200 space-y-8" id="hotel-faq-section">
        <div className="text-left space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-blue font-bold block mb-1">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F1626] tracking-wide flex items-center gap-3">
            <span className="w-1.5 h-7 bg-brand-blue-accent rounded-full inline-block shrink-0" />
            SANCTUARY INSIGHTS & FAQS
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {hotelFaqs.map((faq, idx) => {
            const isOpen = openHotelFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => setOpenHotelFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 bg-slate-50 hover:bg-white transition-colors cursor-pointer"
                >
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-brand-charcoal uppercase tracking-wider leading-relaxed">
                    {faq.q}
                  </h4>
                  <span className="text-brand-blue-accent font-serif text-lg font-bold w-5 h-5 flex items-center justify-center shrink-0">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-5 sm:p-6 bg-white border-t border-slate-100 font-sans text-xs sm:text-sm text-brand-charcoal/80 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Related Hotels at bottom --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-slate-200 space-y-8 pb-16">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-blue font-bold block mb-1">Recommended Lodgings</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F1626] tracking-wide flex items-center gap-3">
            <span className="w-1.5 h-7 bg-brand-blue-accent rounded-full inline-block shrink-0" />
            EXPLORE MORE SANCTUARIES
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(allHotels || [])
            .filter((h) => h.id !== hotel.id)
            .slice(0, 3)
            .map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  if (onSelectHotel) {
                    onSelectHotel(item);
                  }
                }}
                className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[9px] font-mono text-white font-bold uppercase tracking-wider">
                    {item.stars} Stars
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-sm font-bold text-brand-charcoal group-hover:text-brand-blue-accent transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-brand-blue-accent" />
                      <span>{item.location.split(",")[0]}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[9px] font-mono uppercase text-slate-400">Nightly Rate</span>
                    <span className="text-xs font-bold font-serif text-[#0F1626]">
                      From ${item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}
