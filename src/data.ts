import { Destination, TourPackage, Experience, Hotel, Restaurant, Mosque, TravelGuide, Testimonial } from "./types";

export const destinations: Destination[] = [
  {
    id: "phnom-penh",
    name: "Phnom Penh",
    region: "Central Cambodia",
    description: "The sophisticated capital city where the Mekong and Tonlé Sap rivers converge. Boasts spectacular royal palaces, modern skylines, historical landmarks, and the grand Al-Serkal Mosque.",
    image: "https://images.unsplash.com/photo-1559592443-7f8d37496b82?auto=format&fit=crop&q=80&w=1200",
    rating: 4.8,
    highlights: ["Al-Serkal Mosque", "Royal Palace", "Mekong Sunset Cruise", "Central Market"]
  },
  {
    id: "siem-reap",
    name: "Siem Reap",
    region: "Northwestern Cambodia",
    description: "The crown jewel of Cambodia's heritage, home to the majestic Angkor Wat temple complex, vibrant cultural villages, and a growing Muslim community with dedicated Halal facilities.",
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    highlights: ["Angkor Wat Sunrise", "Siem Reap Neak Pean Mosque", "Floating Village of Tonlé Sap", "Phare Circus"]
  },
  {
    id: "koh-rong",
    name: "Koh Rong & Koh Rong Sanloem",
    region: "Southern Islands",
    description: "An untouched tropical paradise of white-sand beaches, bioluminescent waters, and exclusive five-star private villa resorts offering private pools and tailored Halal dining.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
    rating: 4.9,
    highlights: ["Sok San White Beach", "Snorkeling & Diving", "Bioluminescent Plankton", "Luxury Overwater Villas"]
  },
  {
    id: "kampot-kep",
    name: "Kampot & Kep",
    region: "Southern Coastline",
    description: "Serene riverside towns framed by French colonial architecture, world-class organic green pepper plantations, and saltwater estuaries. Kep is famous for fresh seafood and tranquil sea views.",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1200",
    rating: 4.7,
    highlights: ["La Plantation Pepper Farm", "Bokor Mountain National Park", "Kep Crab Market Halal Dining", "Prek Tuek Chhou River"]
  },
  {
    id: "battambang",
    name: "Battambang",
    region: "Western Cambodia",
    description: "The artistic soul of Cambodia, featuring the best-preserved French colonial houses, rural countryside, and the world-famous Bamboo Train.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200",
    rating: 4.6,
    highlights: ["Bamboo Train Ride", "Phnom Sampeau Bat Caves", "Colonial Heritage Walking Tour", "Local Cham Muslim villages"]
  },
  {
    id: "kratie",
    name: "Kratie",
    region: "Northeastern Mekong",
    description: "A peaceful riverside town where you can witness the rare, endangered Irrawaddy freshwater dolphins and visit Cham Muslim fishing hamlets on the Mekong banks.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200",
    rating: 4.5,
    highlights: ["Irrawaddy Dolphin Watching", "Koh Trong Island cycling", "Mekong Riverside Mosque", "Traditional Cham Bamboo Sticky Rice"]
  }
];

export const tourPackages: TourPackage[] = [];
export const experiences: Experience[] = [];
export const hotels: Hotel[] = [];
export const restaurants: Restaurant[] = [];
export const mosques: Mosque[] = [];
export const travelGuides: TravelGuide[] = [];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Tariq & Dr. Aisha Mansoor",
    location: "Doha, Qatar",
    rating: 5,
    comment: "Ahlan Cambodia designed an impeccable itinerary. From prayer mats set up in our private luxury pool villa to authentic halal Khmer dishes at every stop.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    packageTitle: "Elite Cambodia Luxury Grandeur"
  },
  {
    id: "2",
    name: "Faisal Al-Otaibi",
    location: "Riyadh, Saudi Arabia",
    rating: 5,
    comment: "Visiting the Cham Muslim villages along the Mekong River was deeply moving. Highly professional Cham guide who knew every prayer space in Phnom Penh and Siem Reap.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    packageTitle: "Sacred Cham Muslim Heritage Journey"
  },
  {
    id: "3",
    name: "Datin Sofia & Family",
    location: "Kuala Lumpur, Malaysia",
    rating: 5,
    comment: "Traveled with elderly parents and young children. Ahlan Cambodia made transfers seamless. The certified halal food in Siem Reap exceeded all our expectations!",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    packageTitle: "Halal-Friendly Family Escape"
  }
];
