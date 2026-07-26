import { Destination, TourPackage, Experience, Hotel, Restaurant, Mosque, TravelGuide, Testimonial } from "./types";

export const destinations: Destination[] = [
  {
    id: "phnom-penh",
    name: "Phnom Penh",
    region: "Central Cambodia",
    description: "The sophisticated capital city where the Mekong and Tonlé Sap rivers converge. Boasts spectacular royal palaces, modern skylines, historical landmarks, and the grand Al-Serkal Mosque.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=1200",
    rating: 4.8,
    highlights: ["Al-Serkal Mosque", "Royal Palace", "Mekong Sunset Cruise", "Central Market"]
  },
  {
    id: "siem-reap",
    name: "Siem Reap",
    region: "Northwestern Cambodia",
    description: "The crown jewel of Cambodia's heritage, home to the majestic Angkor Wat temple complex, vibrant cultural villages, and a growing Muslim community with dedicated Halal facilities.",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=1200",
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
export const experiences: Experience[] = [
  {
    id: "angkor-sunrise",
    name: "Angkor Wat Sunrise & VIP Scholar Tour",
    category: "Heritage & Culture",
    location: "Siem Reap, Cambodia",
    duration: "6 Hours",
    rating: 4.9,
    price: "$180 per guest",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800",
    description: "Experience the majestic dawn at Angkor Wat from a private VIP vantage point, followed by an expert scholar-guided walk through ancient galleries and a gourmet Halal breakfast.",
    highlights: ["Private VIP Sunrise Vantage Point", "Scholar Historian Guided Walk", "Gourmet Halal Breakfast Picnic", "Luxury Air-Conditioned Transport"],
    isFamilyFriendly: true
  },
  {
    id: "tonle-sap",
    name: "Tonlé Sap Floating Village & Sunset Boat Excursion",
    category: "Eco & Wildlife",
    location: "Siem Reap, Cambodia",
    duration: "5 Hours",
    rating: 4.8,
    price: "$145 per guest",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800",
    description: "Private canopy boat journey along the great Tonlé Sap lake, visiting authentic Cham floating villages, mangrove forests, and enjoying fresh Halal seafood at sunset.",
    highlights: ["Private Wooden Canopy Boat", "Authentic Cham Muslim Village Visit", "Mangrove Flooded Forest Cruise", "Halal Seafood Sunset Refreshments"],
    isFamilyFriendly: true
  },
  {
    id: "halal-cooking",
    name: "Khmer Halal Culinary Masterclass",
    category: "Gastronomy",
    location: "Phnom Penh, Cambodia",
    duration: "4 Hours",
    rating: 4.9,
    price: "$120 per guest",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800",
    description: "Hands-on cooking class led by a master Cham Muslim chef. Visit local organic herb markets and prepare authentic Fish Amok and Khmer Halal delicacies.",
    highlights: ["Organic Spice Market Guided Walk", "Master Chef Guided Workshop", "Certified Halal Dedicated Kitchen", "3-Course Organic Gourmet Lunch"],
    isFamilyFriendly: true
  },
  {
    id: "silk-island",
    name: "Mekong River Cruise & Silk Island Bike Tour",
    category: "Cultural Excursion",
    location: "Phnom Penh, Cambodia",
    duration: "5 Hours",
    rating: 4.8,
    price: "$135 per guest",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800",
    description: "Scenic Mekong River boat trip to Koh Dach (Silk Island). Cycle through serene Cham villages, witness traditional loom weaving, and visit the historic island mosque.",
    highlights: ["Mekong Morning Boat Cruise", "Traditional Handloom Weaving Workshop", "Koh Dach Mosque Visit", "Cham Snacks & Coconut Picnic"],
    isFamilyFriendly: true
  }
];
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
