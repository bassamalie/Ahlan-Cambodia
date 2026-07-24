export interface Destination {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  rating: number;
  highlights: string[];
  insights?: string[];
  overviewText?: string;
  socialVideos?: {
    platform: "tiktok" | "instagram" | "youtube" | "other" | string;
    url: string;
    title?: string;
    thumbnailUrl?: string;
    creatorName?: string;
    creatorHandle?: string;
    creatorAvatar?: string;
    views?: string;
    likes?: string;
    duration?: string;
  }[];
}

export interface CustomHotelItem {
  name: string;
  location: string;
  image: string;
  description: string;
  highlights: string[];
}

export interface PackageHotelItem {
  type: "predefined" | "custom";
  hotelId?: string;
  customHotel?: CustomHotelItem;
}

export interface TourPackage {
  id: string;
  name: string;
  duration: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  features: string[];
  itineraryOverview: string[];
  
  // Custom optional fields for dynamic package wizard
  brief?: string;
  destinations?: string[];
  exclusions?: string[];
  hotelIds?: string[];
  keyHighlights?: string[];
  customHotel?: CustomHotelItem;
  customHotels?: CustomHotelItem[];
  packageHotelsList?: PackageHotelItem[];
  gallery?: string[];
  faqs?: { q: string; a: string }[];
}

export interface Experience {
  id: string;
  name: string;
  category: "Heritage" | "Nature" | "Culture" | "Adventure";
  description: string;
  shortDescription?: string;
  image: string;
  location: string;
  duration: string;
  highlights: string[];
  
  // Custom optional fields for Admin CMS multi-step adding/editing
  isFamilyFriendly?: boolean;
  destinationId?: string;
  overviewText?: string;
  overviewImage?: string;
  gallery?: string[];
  googleMapsUrl?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  distanceFromCityCenter?: string;
  faqs?: { question: string; answer: string }[];
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  stars: number;
  prayerFacilities: string; // e.g. "Prayer mat & Qibla indicator in room"
  halalBreakfast: string; // e.g. "Fully Certified Halal Kitchen"
  nearbyMosque: string; // e.g. "Siem Reap Mosque (5 mins)"
  description: string;
  highlights?: string[];
  priceRange?: string;
  amenities?: string[];
  
  // Extended fields for 7-step wizard
  extendedDescription?: string;
  atmosphere?: string;
  muslimFacilitiesDetail?: string;
  halalBreakfastDetail?: string;
  mosqueDetail?: string;
  prayerFacilitiesLabel?: string;
  halalBreakfastLabel?: string;
  nearbyMosqueLabel?: string;
  amenitiesList?: { name: string; category: string }[];
  galleryImages?: string[];
  roomTiers?: {
    name: string;
    priceMultiplier?: number;
    size?: string;
    capacity: string;
    description?: string;
    image?: string;
    features: string[];
  }[];
  faqs?: { q: string; a: string }[];
  nearbyAttractions?: { name: string; distance: string; description?: string }[];
  address?: string;
  mapUrl?: string;
  halalCertified?: boolean;
  privatePool?: boolean;
  stay22Url?: string;
  stay22HotelId?: string;
  stay22Aid?: string;

  // V2 Hotel Layout Fields
  layoutVersion?: "v1" | "v2" | string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  reviewCount?: number;
  website?: string;
  phoneNumber?: string;
  destination?: string;
  photoUrls?: string[];
  lastUpdated?: string;
  muslimFriendlyBadge?: string;
  muslimFriendly?: boolean;
  lowestPrice?: number;
  priceCategory?: string;
  propertyType?: string;
  languages?: string;
  nearbyHalalFood?: string;
  checkIn?: string;
  checkOut?: string;
  editorialDescription?: string;
  guestReviews?: { author: string; rating: number; text: string; relativeTime?: string; profilePhoto?: string }[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  halalCertified: boolean;
  muslimOwned?: boolean;
  muslimFriendly?: boolean;
  prayerRoomNearby: string;
  location: string;
  description: string;

  // Extended fields for 6-step Dining wizard
  about?: string;
  ambianceStyle?: string;
  halalStanding?: string;
  googleMapsUrl?: string;
  openingHours?: string;
  contactNumber?: string;
  address?: string;
  signatureDishes?: {
    image: string;
    name: string;
    description: string;
    tag?: string;
  }[];
  halalDietaryPolicyDesc?: string;
  halalDietaryPolicyBullets?: string[];
  prayerSpaceDesc?: string;
  prayerSpaceNote?: string;
  faqs?: { q: string; a: string }[];
  socialVideos?: {
    platform: "tiktok" | "instagram" | "youtube" | "other" | string;
    url: string;
    title?: string;
    thumbnailUrl?: string;
    creatorName?: string;
    creatorHandle?: string;
    creatorAvatar?: string;
    views?: string;
    likes?: string;
    duration?: string;
  }[];
}

export interface Mosque {
  id: string;
  name: string;
  location: string;
  image: string;
  fridayPrayerTime: string;
  capacity: string;
  description: string;
  nearbyRestaurants: string[];
  
  // Dynamic fields for CMS 5-step adding/editing
  isHeritageCenter?: boolean;
  isActiveJummah?: boolean;
  extendedDescription?: string;
  architectureType?: string;
  historicalContext?: string;
  address?: string;
  amenities?: string[];
  visitorGuidelines?: { title: string; desc: string }[];
  prayerTimes?: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jummah: string;
  };
}

export interface TravelGuide {
  id: string;
  title: string;
  category: string;
  image: string;
  readTime: string;
  description: string;
  date: string;
  content: string;
  highlights?: string[];
  quoteExcerpt?: string;
  author?: string;
  destinationId?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  text: string;
  rating: number;
  image: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  destination: string;
  duration: number;
  travelers: number;
  travelDate: string;
  interests: string[];
  specialRequests?: string;
  createdAt: string;
}

