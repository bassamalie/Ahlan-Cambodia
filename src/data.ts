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

export const tourPackages: TourPackage[] = [
  {
    id: "luxury-cambodia",
    name: "Elite Cambodia Luxury Grandeur",
    duration: "8 Days / 7 Nights",
    description: "The ultimate curated experience of royal luxury spanning Phnom Penh, Siem Reap, and a private villa on the pristine white sands of Koh Rong. Includes chauffeured transfers, custom halal menus, and VIP temple entries.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
    price: 3450,
    rating: 5.0,
    keyHighlights: [
      "Ultra-luxury resort accommodations (Raffles & Song Saa)",
      "Daily 100% private gourmet Halal culinary tours",
      "Private VIP Sunrise access at Angkor Wat with historian"
    ],
    features: [
      "Ultra-luxury resort accommodations (Raffles & Song Saa Private Island)",
      "Daily 100% private gourmet Halal culinary tours",
      "Private VIP Sunrise access at Angkor Wat with expert historian guide",
      "Exclusive helicopter or chartered domestic flight transfers",
      "Dedicated 24/7 concierge and private luxury vehicle"
    ],
    itineraryOverview: [
      "Day 1: Royal Arrival in Phnom Penh & VIP Evening Mekong Cruise",
      "Day 2: Phnom Penh Islamic Heritage Tour & Al-Serkal Grand Mosque Visit",
      "Day 3: Flight to Siem Reap & VIP Angkor Wat Exploration",
      "Day 4: Secret Temples, Silk Farm, & High-End Khmer Halal Gastronomy",
      "Day 5: Tonlé Sap Private Yacht & Helicopter to Koh Rong Island Resort",
      "Day 6-7: Infinite Leisure, Private Beach Dining, & Ocean Cruises",
      "Day 8: Luxury Speedboat to Sihanoukville & Chauffeured Departure"
    ]
  },
  {
    id: "cambodia-highlights",
    name: "Cambodian Premium Heritage Highlights",
    duration: "5 Days / 4 Nights",
    description: "A compact yet fully authentic exploration of Siem Reap and Phnom Penh. Tailor-made for families and couples seeking to uncover the ancient temples and Cham cultural heritage with seamless Halal comfort.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=1200",
    price: 1250,
    rating: 4.9,
    keyHighlights: [
      "Premium 5-star hotels with certified halal amenities",
      "All meals included at handpicked, verified restaurants",
      "Private English/Malay speaking Cham tour guide"
    ],
    features: [
      "Premium 5-star hotels with certified Muslim-friendly amenities",
      "All meals included at handpicked, verified Halal restaurants",
      "Private English/Malay speaking Cham tour guide",
      "Comfortable luxury private minivan",
      "Complimentary prayer mats, Qibla compasses, and refreshing cold towels"
    ],
    itineraryOverview: [
      "Day 1: Welcome to Phnom Penh & Palace Tour",
      "Day 2: Phnom Penh Mosques Tour & Afternoon Transfer to Siem Reap",
      "Day 3: Angkor Wat Majestic Sunrise & Ancient Temples Loop",
      "Day 4: Cultural Cham Muslim Village Visit & Floating Village Eco-Tour",
      "Day 5: Siem Reap Local Craft Markets & Departure"
    ]
  },
  {
    id: "family-escape",
    name: "Halal-Friendly Multigenerational Family Escape",
    duration: "6 Days / 5 Nights",
    description: "Crafted with multi-generational needs in mind. Slower-paced daily adventures, child-friendly activities, connecting premium rooms, and guaranteed dining at family-oriented Halal establishments.",
    image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=1200",
    price: 980,
    rating: 4.8,
    keyHighlights: [
      "Kid-friendly attractions and curated traditional crafts",
      "Spacious connecting family suites with prayer corners",
      "Relaxing Kulen Mountain tropical waterfall picnic"
    ],
    features: [
      "Kid-friendly attractions and curated traditional crafts",
      "Spacious connecting family suites with prayer corners",
      "Certified safe drivers and spacious air-conditioned touring bus",
      "Special organic children's menus and Halal snacks on board",
      "Relaxing Kulen Mountain tropical waterfall picnic"
    ],
    itineraryOverview: [
      "Day 1: Arrival in Siem Reap & Relaxing Garden Dinner",
      "Day 2: Angkor Wat Temple Discovery & Traditional Tuk-Tuk Ride",
      "Day 3: Kulen Mountain Waterfalls & Cham Weaving Center",
      "Day 4: Floating Villages Boat Tour & Butterfly Garden Adventure",
      "Day 5: Local Cooking Class & Souvenir Crafts Shopping",
      "Day 6: Leisure Morning & Airport Departure"
    ]
  },
  {
    id: "muslim-heritage-tour",
    name: "Sacred Cham Muslim Heritage Journey",
    duration: "7 Days / 6 Nights",
    description: "An immersive deep dive into the historical roots of the Cham Muslim community in Cambodia. Visit riverside villages along the Mekong, interact with local Imams, pray in majestic historic mosques, and enjoy traditional Cham cuisine.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200",
    price: 1420,
    rating: 4.9,
    keyHighlights: [
      "Deep interaction with local Muslim leaders & scholars",
      "Visits to Cambodia's oldest and newest Mosques",
      "Halal local food experience featuring Cham-style curries"
    ],
    features: [
      "In-depth interactions with local Muslim community leaders and scholars",
      "Visit to Islamic schools (madrasahs) and local social impact projects",
      "Homestay-style premium dining inside authentic Cham wooden houses",
      "Visits to Cambodia's oldest and newest Mosques across provinces",
      "Complete Halal local food experience featuring Cham-style curries"
    ],
    itineraryOverview: [
      "Day 1: Phnom Penh Arrival & Grand Mosque Evening Meetup",
      "Day 2: River Journey to Cham Muslim Weaving Island (Koh Dach)",
      "Day 3: Transfer to Battambang & Cham Village Walk",
      "Day 4: Battambang Heritage Tour & Historic Mosque Prayers",
      "Day 5: Scenic Drive to Siem Reap & Cultural Welcome",
      "Day 6: Angkor Wat Temple Complex Heritage & Cham Links",
      "Day 7: Farewell Feast & Siem Reap Departure"
    ]
  }
];

export const experiences: Experience[] = [
  {
    id: "angkor-sunrise",
    name: "Angkor Wat Sunrise Awakening",
    category: "Heritage",
    shortDescription: "Witness the legendary lotus towers of Angkor Wat slowly silhouette against a breathtaking spectrum of purple, pink, and gold.",
    description: "Witness the legendary lotus towers of Angkor Wat slowly silhouette against a breathtaking spectrum of purple, pink, and gold. Followed by a private gourmet breakfast nearby.",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=1200",
    location: "Siem Reap",
    duration: "4 Hours",
    highlights: ["Skip-the-line VIP entrance", "Perfect photography positioning", "Historian-led temple walk", "Tailored picnic breakfast"]
  },
  {
    id: "tonle-sap",
    name: "Tonle Sap Lake Floating Villages",
    category: "Nature",
    shortDescription: "Embark on a private wooden yacht cruise through the unique mangrove forests and stilted villages of Kompong Phluk.",
    description: "Embark on a private wooden yacht cruise through the unique mangrove forests and stilted villages of Kompong Phluk. Discover schools, markets, and homes floating gracefully on water.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200",
    location: "Siem Reap",
    duration: "5 Hours",
    highlights: ["Private solar-powered boat ride", "Traditional flooded forest canoe tour", "Sunset over the great freshwater sea", "Interaction with local Muslim fishermen"]
  },
  {
    id: "halal-cooking",
    name: "Halal Traditional Khmer Cooking Masterclass",
    category: "Culture",
    shortDescription: "Learn the secrets of Cambodian royal cuisine from a professional chef using 100% Halal certified ingredients.",
    description: "Learn the secrets of Cambodian royal cuisine from a professional chef. Discover complex aromatics like lemongrass, kaffir lime, and galangal, while utilizing 100% Halal certified ingredients.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200",
    location: "Siem Reap & Phnom Penh",
    duration: "3 Hours",
    highlights: ["Local market tour to select organic herbs", "Hands-on preparation of classic Fish Amok and Lok Lak", "Full recipe book and custom apron", "Multi-course lunch enjoying your creations"]
  },
  {
    id: "silk-island",
    name: "Silk Island (Koh Dach) Weaving Tour",
    category: "Culture",
    shortDescription: "A short, scenic boat cruise from Phnom Penh to Koh Dach to watch Cham weavers operate traditional wooden looms.",
    description: "A short, scenic boat cruise from Phnom Penh lands you on this peaceful Mekong island. Watch local Cham weavers operate traditional wooden looms, spinning hand-woven silk scarves.",
    image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200",
    location: "Phnom Penh",
    duration: "4 Hours",
    highlights: ["Scenic Mekong River cruise", "Cham Muslim community immersion", "Hands-on silk weaving demonstration", "Opportunity to buy directly from artisan families"]
  }
];

export const hotels: Hotel[] = [
  {
    id: "peninsula-phnom-penh",
    name: "The Peninsula Phnom Penh",
    location: "Street 354, Chroy Changvar, Phnom Penh",
    destination: "Phnom Penh",
    rating: 4.8,
    price: 220,
    lowestPrice: 220,
    image: "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-phnom-penh-exterior.jpg",
    photoUrls: [
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-phnom-penh-exterior.jpg",
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-sky-pool.jpg",
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-living-room.jpg"
    ],
    galleryImages: [
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-phnom-penh-exterior.jpg",
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-sky-pool.jpg",
      "https://peninsulacambodia.com/wp-content/uploads/2020/08/peninsula-living-room.jpg"
    ],
    stars: 5,
    prayerFacilities: "In-suite prayer kit with qibla direction vectors and ablution-friendly bathrooms.",
    halalBreakfast: "Halal friendly gourmet breakfast with customized menu items prepared on request.",
    nearbyMosque: "Al-Serkal Grand Mosque (8 mins drive)",
    description: "Situated on the prestigious Chroy Changvar Peninsula where the Tonle Sap and Mekong rivers meet, offering luxury residences with riverview balconies and a cantilevered sky pool.",
    extendedDescription: "Situated on the prestigious Chroy Changvar Peninsula where the Tonle Sap and Mekong rivers meet, The Peninsula Phnom Penh offers luxury residences with private river-view balconies, a landmark cantilevered sky pool, full fitness facilities, and seamless access to Phnom Penh's diplomatic heart.",
    layoutVersion: "v2",
    placeId: "ChIJ16M3gM-0EDERpT7Y4k3vE3w",
    address: "Street 354, Chroy Changvar, Phnom Penh, Cambodia",
    latitude: 11.5835,
    longitude: 104.9312,
    reviewCount: 185,
    website: "https://peninsulacambodia.com/",
    phoneNumber: "+855 23 966 888",
    priceCategory: "$$$$ Luxury Residences",
    propertyType: "5-Star Luxury Serviced Residences & Hotel",
    checkIn: "14:00",
    checkOut: "12:00",
    muslimFriendlyBadge: "Halal Friendly Certified",
    muslimFriendly: true,
    amenities: [
      "Rooftop Cantilevered Sky Pool",
      "Riverview Private Balconies",
      "Fitness & Spa Center",
      "Halal Friendly Culinary Services",
      "Prayer Amenities",
      "24/7 Concierge"
    ],
    highlights: [
      "Confluence views of Tonle Sap & Mekong rivers",
      "Rooftop cantilevered lap pool",
      "Spacious family suites with kitchenettes",
      "8 minutes from Al-Serkal Grand Mosque"
    ],
    roomTiers: [
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
    ],
    guestReviews: [
      {
        author: "Kassim Al-Ghamdi",
        rating: 5,
        relativeTime: "1 month ago",
        text: "Outstanding riverviews and luxury service on Chroy Changvar peninsula! Perfect family apartment layouts with kitchenettes and halal options."
      }
    ]
  },
  {
    id: "song-saa-island",
    name: "Song Saa Private Island",
    location: "Koh Ouen & Koh Bong, Koh Rong Archipelago",
    destination: "Koh Rong",
    rating: 4.9,
    price: 890,
    lowestPrice: 890,
    image: "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807987823-C2Q03P82KXX8F35S8Y00/Song+Saa+Private+Island+Overwater+Villa.jpg",
    photoUrls: [
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807987823-C2Q03P82KXX8F35S8Y00/Song+Saa+Private+Island+Overwater+Villa.jpg",
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807991316-43C8LUS6P2KWW1YJ8O4S/Song+Saa+Private+Island+Aerial.jpg",
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807993005-A1QY86G9A5T997H1Z5Y8/Song+Saa+Vista.jpg"
    ],
    galleryImages: [
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807987823-C2Q03P82KXX8F35S8Y00/Song+Saa+Private+Island+Overwater+Villa.jpg",
      "https://images.squarespace-cdn.com/content/v1/5799a4e215d5d36e20516eb1/1585807991316-43C8LUS6P2KWW1YJ8O4S/Song+Saa+Private+Island+Aerial.jpg"
    ],
    stars: 5,
    prayerFacilities: "100% private pool villas with enclosed gardens and in-room prayer amenities.",
    halalBreakfast: "Bespoke halal dining crafted by private chefs using fresh local organic seafood and produce.",
    nearbyMosque: "Secluded Island Retreat (Private Space Provided)",
    description: "An intimate eco-luxury island sanctuary offering complete privacy with walled overwater villas, custom halal gastronomy, and bioluminescent marine waters.",
    extendedDescription: "An intimate eco-luxury island sanctuary in the pristine Koh Rong Archipelago. Offering complete privacy with walled private pool overwater villas, custom halal gastronomy, and crystal clear bioluminescent waters.",
    layoutVersion: "v2",
    placeId: "ChIJW0k5w_a_EDERk9uE2qX8pA",
    address: "Koh Ouen and Koh Bong Islands, Koh Rong Archipelago, Cambodia",
    latitude: 10.6094,
    longitude: 103.2982,
    reviewCount: 320,
    website: "https://www.songsaa-privateisland.com/",
    phoneNumber: "+855 23 886 750",
    priceCategory: "$$$$$ Ultra Luxury Island",
    propertyType: "5-Star Ultra-Luxury Private Island Resort",
    checkIn: "14:00",
    checkOut: "11:00",
    muslimFriendlyBadge: "Halal Friendly Certified",
    muslimFriendly: true,
    amenities: [
      "Private Pool Overwater Villas",
      "Secluded Private Beach",
      "100% Halal Tailored Menus",
      "Zero-Alcohol Mocktail Lounge",
      "Overwater Sanctuary Spa",
      "Private Boat Transfers"
    ],
    highlights: [
      "Total privacy in walled overwater pool villas",
      "Bespoke Halal private dining",
      "Bioluminescent nocturnal swimming",
      "Private speed boat transfers from Sihanoukville"
    ],
    roomTiers: [
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
    ],
    guestReviews: [
      {
        author: "Amina & Farhan",
        rating: 5,
        relativeTime: "2 months ago",
        text: "The ultimate halal-friendly luxury island getaway. Absolute privacy for our pool villa and personalized dining by the beach."
      }
    ]
  },
  {
    id: "raffles-angkor",
    name: "Raffles Grand Hotel d'Angkor",
    location: "Charles de Gaulle, Siem Reap",
    destination: "Siem Reap",
    rating: 4.9,
    price: 450,
    lowestPrice: 450,
    image: "https://raffles.com/assets/0/72/3850/3851/4132/d4484b9f-8898-44fb-81df-76e336e84992.jpg",
    photoUrls: [
      "https://raffles.com/assets/0/72/3850/3851/4132/d4484b9f-8898-44fb-81df-76e336e84992.jpg",
      "https://raffles.com/assets/0/72/3850/3851/4132/083ec0bf-0ed5-43a0-be87-5c2f0f4a956d.jpg"
    ],
    galleryImages: [
      "https://raffles.com/assets/0/72/3850/3851/4132/d4484b9f-8898-44fb-81df-76e336e84992.jpg",
      "https://raffles.com/assets/0/72/3850/3851/4132/083ec0bf-0ed5-43a0-be87-5c2f0f4a956d.jpg"
    ],
    stars: 5,
    prayerFacilities: "Complimentary prayer mats, Qibla indicators, and Quran available in-room upon request.",
    halalBreakfast: "Halal options prepared in a dedicated sanitised section of the imperial kitchen.",
    nearbyMosque: "Siem Reap Mosque (4 mins drive, 12 mins walk)",
    description: "An iconic luxury landmark since 1932, restoring French colonial grandeur and royal Cambodian warmth. Features a majestic 35m swimming pool and lush tropical gardens.",
    extendedDescription: "Originally opened in 1932, Raffles Grand Hotel d'Angkor is a historic treasure set across 15 acres of landscaped French gardens in the heart of Siem Reap. For nearly a century, it has welcomed royalty, statesmen, and discerning travelers seeking the pinnacle of Cambodian hospitality.",
    layoutVersion: "v2",
    placeId: "ChIJy4vE_c2XEDERqN4R0m2W1kA",
    address: "1 Vithei Charles de Gaulle, Khum Svay Dangkum, Siem Reap, Cambodia",
    latitude: 13.3639,
    longitude: 103.8598,
    reviewCount: 1284,
    website: "https://www.raffles.com/siem-reap/",
    phoneNumber: "+855 63 963 888",
    priceCategory: "$$$$ Ultra Luxury",
    propertyType: "5-Star Colonial Heritage Hotel",
    checkIn: "15:00",
    checkOut: "12:00",
    muslimFriendlyBadge: "Halal Certified Kitchen & Facilities",
    muslimFriendly: true,
    amenities: [
      "Iconic 35m Outdoor Pool",
      "Raffles Spa & Wellness",
      "24-Hour Butler Service",
      "Certified Halal Kitchen Option",
      "Prayer Mats & Qibla Direction",
      "French & Khmer Fine Dining",
      "High-Speed Wi-Fi",
      "Private Airport Transfer"
    ],
    highlights: [
      "Historic 1932 French Colonial Landmark",
      "Walkable to Siem Reap Royal Gardens & River",
      "Dedicated Halal Gourmet Breakfast",
      "4 minutes from Neak Pean Siem Reap Mosque"
    ],
    roomTiers: [
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
    ],
    guestReviews: [
      {
        author: "Tariq Al-Mansoor",
        rating: 5,
        relativeTime: "2 weeks ago",
        text: "Exceptional heritage stay! The hotel provided clean prayer mats and Qibla alignment upon arrival. The Halal breakfast served in our suite was immaculate."
      }
    ]
  },
  {
    id: "rosewood-phnom-penh",
    name: "Rosewood Phnom Penh",
    location: "Vattanac Capital Tower, Phnom Penh",
    destination: "Phnom Penh",
    rating: 4.8,
    price: 380,
    lowestPrice: 380,
    image: "https://images.rosewoodhotels.com/is/image/rosewoodhotels/rwphp-exterior-dusk",
    photoUrls: [
      "https://images.rosewoodhotels.com/is/image/rosewoodhotels/rwphp-exterior-dusk",
      "https://images.rosewoodhotels.com/is/image/rosewoodhotels/rwphp-sora-bar"
    ],
    galleryImages: [
      "https://images.rosewoodhotels.com/is/image/rosewoodhotels/rwphp-exterior-dusk",
      "https://images.rosewoodhotels.com/is/image/rosewoodhotels/rwphp-sora-bar"
    ],
    stars: 5,
    prayerFacilities: "Prayer corner with direction vectors pre-configured. Ablution friendly bathrooms.",
    halalBreakfast: "Certified Halal breakfast buffet options and robust room-service menu.",
    nearbyMosque: "Al-Serkal Grand Mosque (5 mins drive)",
    description: "Soaring 188 meters above Phnom Penh, this ultra-luxury modern sanctuary offers panoramic views of the Mekong river, elite dining, and flawless bespoke services."
  },
  {
    id: "shinta-mani-reap",
    name: "Shinta Mani Angkor & Bensley Collection",
    location: "French Quarter, Siem Reap",
    destination: "Siem Reap",
    rating: 4.7,
    price: 290,
    lowestPrice: 290,
    image: "https://shintamani.com/angkor/wp-content/uploads/sites/2/2021/04/Shinta-Mani-Angkor-Bensley-Collection-Villa.jpg",
    photoUrls: [
      "https://shintamani.com/angkor/wp-content/uploads/sites/2/2021/04/Shinta-Mani-Angkor-Bensley-Collection-Villa.jpg"
    ],
    galleryImages: [
      "https://shintamani.com/angkor/wp-content/uploads/sites/2/2021/04/Shinta-Mani-Angkor-Bensley-Collection-Villa.jpg"
    ],
    stars: 5,
    prayerFacilities: "A luxury prayer kit provided on arrival including mats, prayer robes, and digital compass.",
    halalBreakfast: "Fresh Halal-sourced ingredients with a private chef assigned for custom orders.",
    nearbyMosque: "Siem Reap Mosque (5 mins walk)",
    description: "An award-winning luxury boutique resort designed by Bill Bensley. Offers exquisite private pool villas, lush green courtyards, and a strong philanthropic soul."
  },
  {
    id: "sofitel-phnom-penh",
    name: "Sofitel Phnom Penh Phokeethra",
    location: "Sothearos Blvd, Phnom Penh",
    destination: "Phnom Penh",
    rating: 4.8,
    price: 320,
    lowestPrice: 320,
    image: "https://sofitel-phnompenh-phokeethra.com/wp-content/uploads/sites/112/2019/06/Sofitel-Phnom-Penh-Phokeethra-Exterior-Night.jpg",
    photoUrls: [
      "https://sofitel-phnompenh-phokeethra.com/wp-content/uploads/sites/112/2019/06/Sofitel-Phnom-Penh-Phokeethra-Exterior-Night.jpg"
    ],
    galleryImages: [
      "https://sofitel-phnompenh-phokeethra.com/wp-content/uploads/sites/112/2019/06/Sofitel-Phnom-Penh-Phokeethra-Exterior-Night.jpg"
    ],
    stars: 5,
    prayerFacilities: "Direction of Mecca marked in all suites. Private prayer spaces in hotel conference area.",
    halalBreakfast: "International buffet with extensive certified Halal culinary sections.",
    nearbyMosque: "An-Nurain Mosque (8 mins drive)",
    description: "A refined blend of French art de vivre and Cambodian elegance, set on the riverside close to diplomatic quarters. Boasts legendary hospitality and premier sports clubs."
  }
];

export const restaurants: Restaurant[] = [
  {
    id: "angkor-halal",
    name: "Angkor Halal Restaurant",
    cuisine: "Traditional Khmer & Malaysian",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
    halalCertified: true,
    prayerRoomNearby: "Steung Thmei, Siem Reap",
    location: "Steung Thmei, Siem Reap",
    description: "The pioneer of authentic Halal Cambodian dining in Siem Reap. Indulge in classic Fish Amok, Lok Lak, and refreshing Lemongrass drinks in a clean, fully air-conditioned environment."
  },
  {
    id: "saraband-halal",
    name: "Saraband Khmer & Asian Restaurant",
    cuisine: "Fine-Dining Khmer Craft",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200",
    halalCertified: true,
    prayerRoomNearby: "In-restaurant private carpeted prayer room with wudu area",
    location: "River Road, Phnom Penh",
    description: "A gorgeous riverside fine-dining restaurant that takes Cambodian heritage dishes and styles them for the refined palate. 100% Halal verified and zero alcohol served."
  },
  {
    id: "d-watie-malay",
    name: "D'Watie Halal Kitchen",
    cuisine: "Malaysian, Indonesian & Khmer",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=1200",
    halalCertified: true,
    prayerRoomNearby: "An-Nurain Mosque (3 mins walk)",
    location: "Boeung Keng Kang, Phnom Penh",
    description: "A warm, welcoming family restaurant serving comforting Nasi Lemak, Rendang, Satay, and local Cambodian fish specialties. Very popular with visiting Southeast Asian delegates."
  },
  {
    id: "halal-delights-siem",
    name: "Halal Delights & Indian Spice",
    cuisine: "North Indian & Mughlai",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1585934843997-57b285d894b6?auto=format&fit=crop&q=80&w=1200",
    halalCertified: true,
    prayerRoomNearby: "Siem Reap Mosque (3 mins drive)",
    location: "Night Market Area, Siem Reap",
    description: "Savor aromatic Biryanis, Butter Chicken, freshly baked Naan bread, and authentic tandoori starters prepared by native Indian Muslim chefs. Features elegant private booths."
  }
];

export const mosques: Mosque[] = [
  {
    id: "al-serkal-phnom-penh",
    name: "Al-Serkal Grand Mosque",
    location: "Boeung Kak, Phnom Penh",
    image: "https://images.unsplash.com/photo-1590076275572-ac2404e57924?auto=format&fit=crop&q=80&w=1200",
    fridayPrayerTime: "12:30 PM",
    capacity: "4,000 worshippers",
    description: "The primary national mosque of Cambodia, a gift from the Al-Serkal family of the UAE. Featuring magnificent domes, soaring minarets, polished white marble, and a stunning view of the central lake park area.",
    nearbyRestaurants: ["Saraband Restaurant", "D'Watie Halal Kitchen"]
  },
  {
    id: "neak-pean-siem-reap",
    name: "Siem Reap Neak Pean Mosque",
    location: "Steung Thmei Village, Siem Reap",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
    fridayPrayerTime: "12:30 PM",
    capacity: "800 worshippers",
    description: "The spiritual heart of Siem Reap's Muslim community, tucked in a tranquil village just off the bustling river. It is beautiful, built of dark red brick and golden trimmings, welcoming guests from around the globe.",
    nearbyRestaurants: ["Angkor Halal Restaurant", "Halal Delights & Indian Spice"]
  },
  {
    id: "prek-pra-mosque",
    name: "Prek Pra Historic Mosque",
    location: "Chbar Ampov District, Phnom Penh",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200",
    fridayPrayerTime: "12:30 PM",
    capacity: "1,500 worshippers",
    description: "One of the oldest surviving Cham Islamic centers located along the banks of the Tonlé Bassac River. Famous for traditional wood carvings and historic Cham heritage documents saved over centuries.",
    nearbyRestaurants: ["D'Watie Halal Kitchen"]
  }
];

export const travelGuides: TravelGuide[] = [
  {
    id: "best-time-to-visit",
    title: "The Connoisseur's Guide: Best Time to Visit Cambodia",
    category: "Planning",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200",
    readTime: "4 mins read",
    description: "Unraveling the seasons of Cambodia—from the cool dry months of November to February, to the dramatic lush emerald monsoons.",
    date: "July 12, 2026",
    content: "Cambodia is spectacular year-round, but choosing your arrival date transforms your experience. The dry peak season (November to February) offers crisp temperatures averaging 25°C, making temple exploration exceptionally pleasant. However, the green season (May to October) brings refreshing afternoon rains that breathe life into the countryside, filling the temple moats with mirroring waters and painting the floating forests in deep vibrant emerald hues."
  },
  {
    id: "first-time-halal",
    title: "First-Time Visitor's Halal & Mosque Navigator",
    category: "Dining",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
    readTime: "6 mins read",
    description: "Everything a Muslim traveler needs to know about arriving, finding prayer spaces, and dining confidently in Cambodia.",
    date: "July 08, 2026",
    content: "Arriving in Cambodia as a Muslim traveller is simple and deeply rewarding when armed with the right insights. Cambodia is historically welcoming, with a significant indigenous Cham Muslim population. While general Khmer food uses fish paste (Prahok), dedicated Halal certified and Muslim-owned restaurants are highly accessible in Siem Reap, Phnom Penh, and Kampot. Most major 5-star hotels cater perfectly to Halal breakfasts with advanced notification, and the historic Al-Serkal Mosque stands as a beacon of architectural pride."
  },
  {
    id: "khmer-halal-culinary",
    title: "Savoring the Kingdom: The Halal Khmer Food Bible",
    category: "Culinary",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200",
    readTime: "5 mins read",
    description: "From lemongrass-infused Fish Amok to sizzling Lok Lak—how to enjoy traditional Khmer cuisine with complete peace of mind.",
    date: "June 28, 2026",
    content: "Traditional Cambodian cooking is an art of balanced aromatics. Unlike neighboring Thailand, spice is served on the side, allowing deep lemongrass, fresh black pepper, and coconut bases to shine. In this guide, we detail how local Cham communities have adapted Cambodia’s national dishes. Taste the Fish Amok steamed in banana leaves, or the caramelized beef Lok Lak, prepared with certified Halal meats by local Muslim cooks who preserve ancestral recipes."
  },
  {
    id: "visa-guide-cambodia",
    title: "Bespoke Entry: Cambodia Visa & Customs Guide",
    category: "Visa Information",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200",
    readTime: "3 mins read",
    description: "A streamlined overview of E-visa, visa-on-arrival, and passport requirements for premium international travelers.",
    date: "May 15, 2026",
    content: "Most travellers can secure a visa for Cambodia through the official government e-Visa portal in under three business days. Citizens from ASEAN nations (including Singapore, Malaysia, and Indonesia) enjoy visa-free entry for up to 30 days. For visitors from Gulf countries (UAE, Saudi Arabia, Qatar), we recommend the pre-approved e-Visa to guarantee a smooth, line-free transition through VIP customs channels."
  },
  {
    id: "sr-blog-1",
    title: "Unveiling the Cham Legacy: The Floating Villages of Tonle Sap",
    category: "Cultural Discovery",
    readTime: "5 mins read",
    date: "July 15, 2026",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800",
    description: "A deep dive into the resilient Cham Muslim floating fishing communities of Chong Kneas and Kampong Phluk near Siem Reap.",
    content: "The Tonle Sap Lake is a wonder of nature, swelling up to five times its dry-season volume. Among its waters lie vibrant, self-sustaining communities. For centuries, the Cham Muslim people have built floating villages here, with their own mosques floating gracefully on pontoons, community halls, and school boats. Exploring these villages with a local Cham guide allows you to understand their sustainable fishing heritage, their spiritual life on water, and the warmth of their hospitality.",
    destinationId: "siem-reap"
  },
  {
    id: "sr-blog-2",
    title: "The Spiritual Echoes: Prayer Spaces & Halal Options near Angkor Wat",
    category: "Halal Traveler",
    readTime: "4 mins read",
    date: "July 12, 2026",
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800",
    description: "An essential roadmap for practicing Muslims visiting the ancient ruins, listing nearby mosques and high-end Halal certified lunch options.",
    content: "Angkor Wat is magnificent, but a full day of temple hopping requires careful planning for dining and prayers. This guide covers how to seamlessly combine your itinerary. Located only 15 minutes from the temple gates, Siem Reap’s Neak Pean Mosque is welcoming and peaceful. Additionally, we highlight verified Halal restaurants like Muslim Family Kitchen and Taj Mahal Siem Reap, which can deliver packed warm Halal lunch boxes directly to your tour vehicle.",
    destinationId: "siem-reap"
  },
  {
    id: "pp-blog-1",
    title: "A Tale of Two Rivers: Sunset Halal Culinary Cruise in Phnom Penh",
    category: "Culinary Travel",
    readTime: "6 mins read",
    date: "July 14, 2026",
    image: "https://images.unsplash.com/photo-1559592443-7f8d37496b82?auto=format&fit=crop&q=80&w=800",
    description: "Sailing down the confluence of the Tonle Sap and Mekong rivers while enjoying bespoke halal delicacies and a view of the royal skyline.",
    content: "Phnom Penh’s riverfront comes alive at golden hour. Boards of luxury wooden yachts offer private sunset cruises starting from the Sisowath Quay. We details our experience with the fully Halal certified culinary cruise, featuring traditional lemongrass-infused fish skewers, fresh organic spring rolls, and grilled freshwater prawns prepared fresh on-board by a Muslim chef, all while watching the sun dip behind the Royal Palace.",
    destinationId: "phnom-penh"
  },
  {
    id: "pp-blog-2",
    title: "The Architecture of Faith: Inside Al-Serkal Grand Mosque",
    category: "Spiritual Architecture",
    readTime: "5 mins read",
    date: "July 05, 2026",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    description: "An architectural exploration of Phnom Penh’s white-marble gem, its history, and its active role in the local community.",
    content: "Standing tall in the heart of Phnom Penh near Boeung Kak, the Al-Serkal Grand Mosque is the largest and most magnificent mosque in Cambodia. Dominated by brilliant turquoise domes and towering minarets, the interior features pristine Turkish tiles, heavy brass chandeliers, and hand-carved wooden pulpits. This guide invites travelers to explore its calm courtyard, appreciate its elegant Ottoman-inspired architectural geometry, and discover the thriving Cham Islamic community center.",
    destinationId: "phnom-penh"
  },
  {
    id: "kr-blog-1",
    title: "Island Halal Luxury: How Koh Rong Caters to Elite Muslim Travelers",
    category: "Luxury Retreat",
    readTime: "5 mins read",
    date: "July 11, 2026",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    description: "Private infinity pool villas, zero-alcohol organic mocktail menus, and fully secluded beaches on the pristine coast of Koh Rong.",
    content: "Finding ultimate privacy alongside Halal amenities is now an effortless reality on Cambodia’s southern coast. Resorts like Song Saa Private Island and The Royal Sands Koh Rong lead the way with private pool villas, fully enclosed gardens, and bespoke culinary staff trained to source and prepare certified Halal ingredients. We review how they customize family stays to guarantee absolute privacy and exceptional comfort.",
    destinationId: "koh-rong"
  },
  {
    id: "kr-blog-2",
    title: "Bioluminescence and Secret Coves: Snorkeling Koh Rong Safely",
    category: "Adventure",
    readTime: "4 mins read",
    date: "July 01, 2026",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800",
    description: "Your guide to swimming with magical glowing plankton under pitch-black island skies, with private certified local boats.",
    content: "Koh Rong is blessed with spectacular marine life, but its most magical experience happens after sunset. As darkness falls over secret coves, the water turns into a sea of stars due to billions of microscopic bioluminescent plankton. This guide highlights how to hire a private Cham Muslim boat captain who knows the safest, quietest coves for a private night snorkel with your loved ones.",
    destinationId: "koh-rong"
  },
  {
    id: "kk-blog-1",
    title: "The Salt & Pepper Route: Organic Plantations of Kampot",
    category: "Organic Farming",
    readTime: "5 mins read",
    date: "June 24, 2026",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800",
    description: "Tracing the world's most aromatic pepper varieties and visiting local certified pepper farms offering halal-cooked lunch pairings.",
    content: "Kampot Pepper is globally renowned as the gold standard of culinary seasoning. Protected by a Geographical Indication (GI), the pepper owes its complex eucalyptus and jasmine notes to the mineral-rich quartz soil between the mountains and the sea. Visiting organic farms like La Plantation shows you the laborious process of hand-sorting pepper berries, followed by an exquisite Halal lunch pairing sweet red pepper sauce with grilled river lobster.",
    destinationId: "kampot-kep"
  },
  {
    id: "kk-blog-2",
    title: "Kep's Seafood Haven: Fresh Crab & Saltwater Quietude",
    category: "Culinary Coastline",
    readTime: "4 mins read",
    date: "June 18, 2026",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800",
    description: "A detailed guide to enjoying Kep’s iconic blue swimmer crabs prepared fresh at the seaside, overlooking the Gulf of Thailand.",
    content: "Kep’s famous Crab Market is a chaotic yet scenic delight. Wooden crab pots are pulled directly from the ocean, revealing glistening blue swimmer crabs. For Muslim diners, several stalls are owned by local Cham fishermen, guaranteeing fully Halal preparation with local green Kampot pepper, ginger, and garlic. Dine on wooden decks built directly over the lapping waves for a truly unforgettable coastal memory.",
    destinationId: "kampot-kep"
  },
  {
    id: "bb-blog-1",
    title: "Artisanal Battambang: Unraveling Cambodia's Cultural Soul",
    category: "Art & History",
    readTime: "6 mins read",
    date: "June 15, 2026",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800",
    description: "Bespoke colonial heritage walks, meeting local potters, and riding the famous vintage Bamboo Train through lush emerald paddies.",
    content: "Battambang is a city frozen in an elegant colonial era. It is best explored slowly on a bicycle or on foot, tracing the yellow-ochre French storefronts and ancient temples. We highlight our favorite stops, including local artisan studios, and show you how to experience the vintage 'Norry' (Bamboo Train) - a thrilling, open-air platform of wood and bamboo flying past rice paddies at 40 km/h.",
    destinationId: "battambang"
  },
  {
    id: "bb-blog-2",
    title: "The Cham Hamlets of Sangkae River: Preserving Traditional Weaving",
    category: "Heritage Crafts",
    readTime: "5 mins read",
    date: "June 10, 2026",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800",
    description: "Visiting the peaceful, riverfront Cham villages where handmade looms are still used to spin exquisite sarongs.",
    content: "Crossing the Sangkae River brings you to a slower, peaceful world. Here, indigenous Cham Muslim weavers set up heavy wooden looms beneath their stilt houses. In this guide, we meet local master weaver Maryam, who has spent four decades spinning hand-dyed cotton and silk into high-quality geometric sarongs, scarves, and prayer rugs, keeping the ancestral Cham weaving traditions alive in Cambodia.",
    destinationId: "battambang"
  },
  {
    id: "kt-blog-1",
    title: "The Guardians of the Mekong: Irrawaddy Dolphins of Kratie",
    category: "Wildlife Conservation",
    readTime: "5 mins read",
    date: "May 28, 2026",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800",
    description: "Observing the gentle freshwater dolphins of Kampi on a quiet, non-motorized wooden kayak, and protecting Mekong biodiversity.",
    content: "Only about 80 Irrawaddy freshwater dolphins survive in the deep pools of the Mekong River in Kratie. Protecting these gentle creatures is a national priority. We guide you on how to hire a local conservationist-approved wooden kayak, gliding silently across the water at sunrise, when the dolphins surface to breathe, creating a magical, respectful wildlife connection.",
    destinationId: "kratie"
  },
  {
    id: "kt-blog-2",
    title: "Koh Trong Island: Cycling through Pomelo Orchards and Cham History",
    category: "Eco Tourism",
    readTime: "4 mins read",
    date: "May 20, 2026",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200",
    description: "A serene day guide to cycling around the sandy Mekong island of Koh Trong, tasting legendary organic pomelos, and visiting the island's mosque.",
    content: "Koh Trong is an emerald island floating in the middle of the Mekong River opposite Kratie. Car-free and blissfully peaceful, the island is covered in traditional wooden homesteads, shady coconut groves, and organic pomelo orchards. We outline the perfect cycling path around the island's 9km loop, including a stop at the small, tight-knit Cham Muslim fishing settlement on the northern bank.",
    destinationId: "kratie"
  }
];

export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "Dr. Farhan & Family",
    country: "Singapore",
    text: "Ahlan Cambodia made our dream holiday a flawless reality. Having a dedicated Cham Muslim guide who knew exactly where to stop for prayers and organized the most delicious Halal dining made our family feel safe and profoundly respected.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "test-2",
    name: "Amina & Tariq",
    country: "United Arab Emirates",
    text: "The Elite Cambodia Luxury package was spectacular. song Saa Private Island is an absolute paradise, and the customized Halal menu prepared by their head chef exceeded all expectations. An unmatched DMC expertise.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "test-3",
    name: "Mohammad Al-Soud",
    country: "Malaysia",
    text: "Exploring the ancient ruins of Angkor Wat at sunrise, followed by praying at the Siem Reap Grand Mosque, was a spiritual and cultural connection we will never forget. Exceptional service and impeccable attention to detail.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
  }
];
