import React, { useState, useMemo, useEffect } from "react";
import { 
  ArrowLeft, Heart, Clock, MapPin, CheckCircle, 
  X, HelpCircle, ChevronDown, ChevronUp, Eye, Headphones, Send, Users, ChevronLeft, ChevronRight
} from "lucide-react";
import { Experience } from "../types";
import { experiences } from "../data";

interface ExperienceDetailPageProps {
  experience: Experience;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onInquire: () => void;
  onSelectExperience?: (exp: Experience) => void;
  allExperiences?: Experience[];
  onNavigateView?: (view: string) => void;
}

// Custom data extension for each experience
const experienceDetailsData: {
  [key: string]: {
    fullDescription1: string;
    fullDescription2: string;
    luxuryLevel: string;
    prayerComfort: string;
    culinaryStatus: string;
    bestHour: string;
    groupSize: string;
    schedule: { time: string; title: string; description: string }[];
    halalFocus: string[];
    packingEssentials: string[];
    faqs: { question: string; answer: string }[];
    locationNote: string;
  }
} = {
  "angkor-sunrise": {
    fullDescription1: "Discover the ethereal beauty of dawn over the legendary Angkor Wat with a private, luxury perspective. Your morning begins in the serene quiet of the early hours, whisking you away to a secluded VIP vantage point to witness the sun rise majestically behind the ancient lotus towers.",
    fullDescription2: "Once the sun has risen, explore the ancient stone corridors alongside an expert scholar-historian, uncovering the deep spiritual history and hidden connections. The journey culminates in a gourmet Halal picnic breakfast set against the backdrop of the beautiful royal waterways.",
    luxuryLevel: "Ultra-Luxury Private Excursion",
    prayerComfort: "Fajr Prayer Kits & Ablution Water Ready",
    culinaryStatus: "100% Halal Breakfast Hamper Included",
    bestHour: "04:30 AM - 08:30 AM",
    groupSize: "Private (2 - 8 guests)",
    schedule: [
      { time: "04:30 AM", title: "Whispering Departure", description: "Your private chauffeur picks you up from your Siem Reap resort in a premium executive vehicle." },
      { time: "05:00 AM", title: "Dawn Awakening", description: "Arrive at our secluded VIP photography bank. Your personal butler sets up a private seating area." },
      { time: "05:40 AM", title: "Morning Prayer & Sunrise Reflection", description: "Convenient prayer mats and direction vectors are provided for Fajr prayer. Watch the golden beams rise over Angkor's majestic towers." },
      { time: "06:30 AM", title: "Scholar-Led Temple Walk", description: "Explore the ancient corridors of Angkor Wat with an elite historian. Unveil Cham Muslim links in the bas-reliefs." },
      { time: "08:00 AM", title: "Lakeside Royal Picnic", description: "Savor a multi-course Halal gourmet picnic prepared fresh in a certified kitchen, overlooking the quiet Royal Moat." }
    ],
    halalFocus: [
      "100% Halal certified picnic items prepared in an audited segregated kitchen.",
      "Ablution-friendly luxury support vehicle equipped with premium cleansing water.",
      "Complimentary premium prayer mats, Qibla indicators, and clean prayer garments on demand.",
      "Complete historical insights detailing ancient Cham Muslim delegations to Angkor."
    ],
    packingEssentials: [
      "Modest Temple Wear: Clothing covering shoulders and knees is strictly mandatory.",
      "Walking Footwear: Comfortable luxury slip-on shoes for temple stairs.",
      "Camera & Sunglasses: High-quality cameras for epic dawn photographs.",
      "Sun Hat & Fan: Light protective wear as the day warms up."
    ],
    faqs: [
      { question: "Is this experience suitable for children?", answer: "Absolutely! The spacious temples and lakeside royal picnic make this an exceptionally family-friendly excursion with lots of room for kids to walk around comfortably." },
      { question: "Are halal meals available during the experience?", answer: "Yes, our breakfast hamper is 100% Halal-certified, prepared fresh by our dedicated Halal culinary partner using segregated cookware in a certified pork-free kitchen." },
      { question: "What should I wear?", answer: "Angkor Wat is a sacred archaeological site. Both men and women must wear modest clothing that fully covers shoulders and knees. Sleeveless shirts and short skirts are strictly prohibited." },
      { question: "Can this experience be customized?", answer: "Certainly. Since this is an entirely private tour, we can adjust the pace, timings, and dietary selections to perfectly match your family's preferences." },
      { question: "How long does the experience last?", answer: "The tour begins at 04:30 AM to capture the sunrise and finishes around 08:30 AM, lasting approximately 4 hours in total." }
    ],
    locationNote: "Approximately 15 minutes from Siem Reap city centre."
  },
  "tonle-sap": {
    fullDescription1: "Discover the unique lifestyle of Cambodia's floating villages on Tonle Sap Lake. Cruise through peaceful waterways, visit local homes, interact with the community and learn about their daily life on the water.",
    fullDescription2: "This experience offers a meaningful connection to local culture, stunning scenery and unforgettable moments that you will cherish forever. Meet warm fishing families and explore the lush mangrove forest in a traditional rowboat.",
    luxuryLevel: "Exclusive Private Eco-Yacht",
    prayerComfort: "Onboard Prayer Nook & Ablution Tap",
    culinaryStatus: "Cham Halal Seafood Feast Freshly Prepared",
    bestHour: "02:30 PM - 07:30 PM",
    groupSize: "Private (2 - 12 guests)",
    schedule: [
      { time: "02:30 PM", title: "Marina Departure", description: "Your private luxury cruiser meets you at the Siem Reap Chong Kneas jetty. Step into a world of air-conditioned comfort." },
      { time: "03:15 PM", title: "Mekong-Cham Water Village Tour", description: "Cruise slowly past majestic stilted Cham hamlets. Observe floating mosques, schools, and dynamic boat-based commerce." },
      { time: "04:30 PM", title: "Flooded Forest Canoe Excursion", description: "Transfer to a traditional, hand-carved rowboat to glide quietly under the canopy of the majestic flooded mangrove forest." },
      { time: "05:30 PM", title: "Magical Sunset & Prayer", description: "Drop anchor in the middle of the Great Lake. The vessel has a designated prayer corner with direction vectors and clean water." },
      { time: "06:00 PM", title: "Traditional Cham Dinner Feast", description: "Dine on grilled lake lobsters, fish amok, and coconut soups sourced directly from Muslim fishermen and prepared by an executive chef." }
    ],
    halalFocus: [
      "Seafood freshly caught and prepared by professional local Muslim chefs.",
      "Designated prayer space configured on the sun deck with wind shields.",
      "Bespoke itineraries that include visiting the floating Cham Muslim villages.",
      "Strictly non-alcoholic beverage bar featuring premium cold-pressed mocktails."
    ],
    packingEssentials: [
      "Sun Protection: Polarized sunglasses, coral-safe sunblock, and lightweight sun hats.",
      "Footwear: Waterproof sandals or boat shoes with rubber soles.",
      "Warm Layer: A light windbreaker jacket for the breezy sunset ride.",
      "Binoculars: Ideal for observing rare waterfowl in the flooded forests."
    ],
    faqs: [
      { question: "Is this experience suitable for children?", answer: "Yes, it is highly family-friendly. Children love the boat ride, seeing the stilted schools, and taking a short canoe trip through the beautiful flooded green forest." },
      { question: "Are halal meals available during the experience?", answer: "Yes. All meals prepared on board are fully Halal-vetted, featuring fresh local seafood caught directly by Cham Muslim fishermen." },
      { question: "What should I wear?", answer: "We recommend comfortable, casual attire, along with a light windbreaker or jacket as the lake breeze can get slightly cool after sunset." },
      { question: "Can this experience be customized?", answer: "Absolutely. This is an entirely private tour chartered exclusively for your party, allowing complete control over departure times and layout." },
      { question: "How long does the experience last?", answer: "The classic sunset floating village experience lasts approximately 5 hours, starting in the mid-afternoon and returning after dusk." }
    ],
    locationNote: "Approximately 25 minutes from Siem Reap city centre."
  },
  "halal-cooking": {
    fullDescription1: "Immerse yourself in the rich culinary heritage of the Khmer Empire with a private, masterclass-style experience. Hosted in a luxurious open-air pavilion surrounded by private organic herb gardens, you'll learn the secrets of stone-mortar grinding to create traditional dishes.",
    fullDescription2: "Under the guidance of a renowned culinary master, prepare authentic delicacies like Royal Fish Amok and sizzling Beef Lok Lak, using exclusively premium Halal-certified ingredients and separate culinary tools to guarantee absolute purity.",
    luxuryLevel: "Private Culinary Atelier",
    prayerComfort: "Dedicated Prayer Pavilion On-Site",
    culinaryStatus: "100% Halal Hand-Crafted Masterclass",
    bestHour: "09:30 AM - 12:30 PM",
    groupSize: "Private (2 - 6 guests)",
    schedule: [
      { time: "09:30 AM", title: "Organic Market Safari", description: "Climb aboard a private luxury tuk-tuk and explore a vibrant local produce market with our Masterchef." },
      { time: "10:15 AM", title: "Garden Welcome & Refreshment", description: "Arrive at the private culinary pavilion. Enjoy cold lemongrass infusions and pick fresh sweet basil." },
      { time: "10:45 AM", title: "Art of Kroeung Grinding", description: "Learn the therapeutic secrets of grinding lemongrass, kaffir lime, and galangal in traditional volcanic stone mortars." },
      { time: "11:30 AM", title: "Mastering Fish Amok & Sizzling Lok Lak", description: "Cook your own dishes over custom burners, using entirely premium certified Halal beef, fresh ocean fish, and isolated utensils." },
      { time: "12:30 PM", title: "The Lily Pond Banquet", description: "Sit down at an elegantly decorated table overlooking peaceful water lily ponds to enjoy your multi-course masterworks." }
    ],
    halalFocus: [
      "100% Halal certified ingredients used throughout (certified beef, poultry, and local sauces).",
      "Strictly segregated cookware, cutting boards, and knives used solely for Halal preparation.",
      "An on-site indoor prayer room with pre-aligned Qibla vectors and pristine ablution facilities.",
      "Zero cooking wines, mirin, or non-halal flavor enhancers allowed in the entire facility."
    ],
    packingEssentials: [
      "Apparel: Comfortable, casual attire. We provide premium custom linen aprons.",
      "Camera/Phone: Essential for capturing beautifully presented food masterpieces.",
      "Appetite: Arrive with an empty stomach, as you will cook a large three-course meal!"
    ],
    faqs: [
      { question: "Is this experience suitable for children?", answer: "Yes, children of all ages can join and enjoy hands-on activities like assembling banana-leaf baskets or picking herbs from the garden." },
      { question: "Are halal meals available during the experience?", answer: "Yes, 100% of the ingredients, meat, and tools are strictly Halal-vetted, assuring absolute purity and culinary peace of mind." },
      { question: "What should I wear?", answer: "Casual, comfortable clothes are ideal. We provide custom linen aprons to protect your clothes while cooking." },
      { question: "Can this experience be customized?", answer: "Yes, the menu can be fully personalized for allergies, spice preferences, or specific vegetarian requirements." },
      { question: "How long does the experience last?", answer: "The market safari, herb grinding, cooking session, and lakeside banquet take approximately 3 to 4 hours in total." }
    ],
    locationNote: "Located in a serene heritage village, 10 minutes from Siem Reap city centre."
  },
  "silk-island": {
    fullDescription1: "Escape Phnom Penh's urban pulse on a peaceful, scenic private boat cruise down the Mekong River to Koh Dach, famously known as Silk Island. Ride elegant bicycles or a traditional carriage through lush orchards to a traditional Cham Muslim village.",
    fullDescription2: "Under the shade of elevated wooden houses, meet artisan grandmothers operating historic looms. Try your hand at spinning raw silk threads and learn the natural vegetable dyeing techniques that produce these gorgeous, glowing garments.",
    luxuryLevel: "Bespoke Cultural Retreat",
    prayerComfort: "Stopover at Historic Koh Dach Mosque",
    culinaryStatus: "Traditional Cham Halal Picnic Included",
    bestHour: "08:30 AM - 12:30 PM",
    groupSize: "Private (2 - 10 guests)",
    schedule: [
      { time: "08:30 AM", title: "Mekong Morning Cruise", description: "Board your private wooden canopy cruise boat at the Phnom Penh Sisowath Quay. Sip organic coconut water as you float." },
      { time: "09:15 AM", title: "Arrival on Koh Dach Island", description: "Step onto the sandy banks of Silk Island. Choose your transport: custom carbon-frame bicycles or a charming horse-cart." },
      { time: "09:45 AM", title: "Ancestral Cham Weaving Hamlets", description: "Pedal down narrow lanes bordered by pomelo trees. Arrive at a traditional elevated stilt house of Cham silk weavers." },
      { time: "10:30 AM", title: "Hands-on Weaving Workshop", description: "Sit at a historic wooden loom. Spin raw golden cocoons, dye silk with turmeric roots, and try weaving a classic pattern." },
      { time: "11:30 AM", title: "Mosque Prayer Visit & Local Cham Picnic", description: "Gather at the historic riverside Koh Dach Mosque. Perform prayers in a peaceful atmosphere, followed by traditional Cham sweets and tea." }
    ],
    halalFocus: [
      "Guided by native Khmer-Cham bilingual Muslim guides.",
      "Opportunity to perform prayers in the quiet, historic Koh Dach Mosque.",
      "100% Halal traditional Khmer-Cham sweets and snacks prepared by local families.",
      "Ethical touring parameters: 100% of weaving fees support local women artisans."
    ],
    packingEssentials: [
      "Clothing: Light cotton clothing covering knees and shoulders (respecting conservative rural villages).",
      "Protection: Insect repellent, strong sun block, and a soft towel.",
      "Cash: Local riel or US dollars for buying exquisite hand-woven silk directly from weavers."
    ],
    faqs: [
      { question: "Is this experience suitable for children?", answer: "Yes, children find the silkworms and traditional horse carriages highly engaging and educational." },
      { question: "Are halal meals available during the experience?", answer: "Yes, we serve traditional Cham Muslim snacks and sweets prepared in a verified Muslim household on the island." },
      { question: "What should I wear?", answer: "Modest cotton attire is highly recommended when visiting local conservative weaving villages and the historic mosque." },
      { question: "Can this experience be customized?", answer: "Yes, you can substitute the bicycle tour with a private air-conditioned vehicle or comfortable golf buggy if preferred." },
      { question: "How long does the experience last?", answer: "The complete river cruise and island weaving experience takes about 4 to 5 hours." }
    ],
    locationNote: "Approximately 35 minutes scenic boat cruise from Phnom Penh Sisowath Quay."
  }
};

const galleryImages: { [id: string]: { url: string; caption: string }[] } = {
  "angkor-sunrise": [
    { url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800", caption: "Sunrise over Angkor Wat Towers" },
    { url: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800", caption: "Ancient Stone Corridor Detail" },
    { url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=800", caption: "Theravada Monk Walking in Ancient Temple" },
    { url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800", caption: "Freshly Prepared Halal Pastries" },
    { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800", caption: "Premium Private Tour Vehicle" }
  ],
  "tonle-sap": [
    { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800", caption: "Floating Village Sunset Horizon" },
    { url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800", caption: "Traditional Wooden Boat on Great Lake" },
    { url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800", caption: "Mangrove Flooded Forest Pathway" },
    { url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800", caption: "Authentic Cham Grilled Lobsters" },
    { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800", caption: "Woman Smiling on Floating Village Boat" }
  ],
  "halal-cooking": [
    { url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800", caption: "Vibrant Local Spice Market Tour" },
    { url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800", caption: "Hands-on Lemongrass Grinding Masterclass" },
    { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800", caption: "Exquisitely Presented Fish Amok" },
    { url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800", caption: "Private Lily-Pond Dining Pavilion" },
    { url: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800", caption: "Fresh Organic Garden Herbs & Chillies" }
  ],
  "silk-island": [
    { url: "https://images.unsplash.com/photo-1559592443-7f8d37496b82?auto=format&fit=crop&q=80&w=800", caption: "Mekong River Sunset Sailing" },
    { url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=800", caption: "Artisan Loom Hand Weaving" },
    { url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800", caption: "Koh Dach Island Cycling Road" },
    { url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800", caption: "Koh Dach Mosque & Local Gathering" },
    { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800", caption: "Raw Golden Silkworm Cocoons" }
  ]
};

export default function ExperienceDetailPage({
  experience,
  onBack,
  wishlist,
  onToggleWishlist,
  onInquire,
  onSelectExperience,
  allExperiences,
  onNavigateView
}: ExperienceDetailPageProps) {
  const activeGallery = useMemo(() => {
    if (experience.gallery && experience.gallery.length > 0) {
      return experience.gallery.map((url, i) => ({ url, caption: `Visual Aspect ${i + 1}` }));
    }
    return galleryImages[experience.id] || [
      { url: experience.image, caption: experience.name },
      { url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=600", caption: "Cambodian Heritage Vista" },
      { url: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=600", caption: "Beautiful Cambodia Waterways" },
      { url: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=600", caption: "Spiritual Cambodian Golden Sunset" },
      { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600", caption: "Smiling Water Village Portrait" }
    ];
  }, [experience]);

  // Modal lightboxes
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handlePrevImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => 
      prev !== null ? (prev - 1 + activeGallery.length) % activeGallery.length : 0
    );
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => 
      prev !== null ? (prev + 1) % activeGallery.length : 0
    );
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex !== null) {
        if (e.key === "ArrowLeft") {
          handlePrevImage();
        } else if (e.key === "ArrowRight") {
          handleNextImage();
        } else if (e.key === "Escape") {
          setSelectedImageIndex(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, activeGallery]);

  // Touch Swipe navigation for Lightbox
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
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };
  
  // Accordion active state (FAQ)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Lookup data details
  const details = useMemo(() => {
    const staticData = (experienceDetailsData[experience.id] || {}) as any;
    return {
      fullDescription1: experience.overviewText || staticData.fullDescription1 || "Discover this magnificent travel experience tailored specifically to offer maximum comfort, style, and absolute cultural authenticity. Our curated services provide full peace of mind.",
      fullDescription2: staticData.fullDescription2 || "Enjoy a highly customized itinerary with private local hosts, exploring stunning landscapes, authentic heritage, and delicious Halal gastronomy in a peaceful local context.",
      luxuryLevel: staticData.luxuryLevel || "Premium Custom Excursion",
      prayerComfort: staticData.prayerComfort || "Prayer Kits Available Upon Request",
      culinaryStatus: staticData.culinaryStatus || "Halal Culinary Catering Integrated",
      bestHour: staticData.bestHour || "Flexible Departure Times",
      groupSize: staticData.groupSize || "Private Custom Sizing",
      schedule: staticData.schedule || [
        { time: "Departure", title: "Resort Pickup", description: "Bespoke vehicle pickup and embarkation." },
        { time: "Excursion", title: "Guided Exploration", description: "Explore magnificent landscapes with your private local host." },
        { time: "Refreshment", title: "Gourmet Bites", description: "Sample certified Halal delicacies." }
      ],
      halalFocus: staticData.halalFocus || [
        "All food elements are certified Halal and sourced from trusted Muslim-friendly suppliers.",
        "Prayer mats and direction compasses are kept in the guide vehicle at all times.",
        "Your private guide is fully aware of prayer schedules and can coordinate mosque stopovers seamlessly."
      ],
      packingEssentials: staticData.packingEssentials || ["Modest attire (shoulders and knees covered)", "Sun protection", "Comfortable walking shoes"],
      faqs: (experience.faqs && experience.faqs.length > 0) ? experience.faqs : (staticData.faqs || [
        { question: "Is this experience suitable for children?", answer: "Yes, this private excursion is highly suitable for children and families, offering flexible timings and complete comfort." },
        { question: "Are halal meals available during the experience?", answer: "Absolutely, all dining and snacks provided are strictly Halal-certified and prepared using clean, dedicated utensils." },
        { question: "What should I wear?", answer: "We recommend comfortable clothing that respects local culture (shoulders and knees covered)." },
        { question: "Can this experience be customized?", answer: "Yes, this is an entirely private tour that can be customized to your precise desires and scheduling preferences." },
        { question: "How long does the experience last?", answer: "The typical duration ranges from 4 to 5 hours, depending on customization." }
      ]),
      locationNote: experience.distanceFromCityCenter 
        ? `Approximately ${experience.distanceFromCityCenter} from the destination city centre.`
        : staticData.locationNote || `Located in the beautiful ${experience.location} region.`
    };
  }, [experience]);

  // Exclude current experience from "similar experiences" to display exactly 3 cards in a row
  const similarExperiences = useMemo(() => {
    const list = allExperiences || experiences;
    return list.filter(exp => exp.id !== experience.id).slice(0, 3);
  }, [experience.id, allExperiences]);

  const isSaved = wishlist.includes(experience.id);

  // Get dynamic regional experience label (e.g., SIEM REAP EXPERIENCE)
  const regionalExperienceLabel = useMemo(() => {
    const locPart = experience.location.split(",")[0].trim().toUpperCase();
    return `${locPart} EXPERIENCE`;
  }, [experience.location]);

  // Use the 5th image (smiling portrait or detailed asset) as the Overview graphic if available
  const overviewImageSrc = useMemo(() => {
    return experience.overviewImage || activeGallery[4]?.url || experience.image;
  }, [experience.overviewImage, activeGallery, experience.image]);

  return (
    <div id="experience-detail-root" className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      
      {/* --- Majestic Full-Width Hero Section --- */}
      <div className="relative w-full h-[350px] sm:h-[400px] md:h-[420px] overflow-hidden">
        <img 
          src={experience.image} 
          alt={experience.name} 
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
                onClick={() => onNavigateView ? onNavigateView("experiences") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                EXPERIENCES
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <span className="text-white/95 font-bold tracking-widest truncate max-w-[200px] sm:max-w-[300px] inline-block uppercase">{experience.name}</span>
            </div>
          </div>
        </div>
        
        {/* Hero Content Overlaid (Aligned perfectly with the user's design) */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 space-y-4">
          <div className="space-y-3 max-w-4xl">
            {/* Main elegant serif title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
              {experience.name}
            </h1>
            {/* Long clean description */}
            <p className="hidden sm:block text-white/95 text-sm sm:text-base leading-relaxed font-sans max-w-3xl drop-shadow-sm font-light">
              {experience.shortDescription || experience.description}
            </p>
          </div>

          {/* Info row with beautiful icons */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-white/90 pt-2 border-t border-white/15 w-fit">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue-accent" />
              {experience.duration}
            </span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-blue-accent" />
              Family Friendly
            </span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-blue-accent" />
              {experience.location.split(",")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* --- Sticky Bar (Simplified for Seamless Navigation) --- */}
      <div className="sticky top-[72px] sm:top-[88px] z-30 w-full bg-brand-blue/95 backdrop-blur-md border-b border-brand-blue-accent/25 shadow-md h-14 sm:h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/90 hover:text-brand-blue-accent font-mono text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-blue-accent" />
              <span>BACK</span>
            </button>
            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <h2 className="text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider truncate max-w-[140px] sm:max-w-xs md:max-w-md m-0">
              {experience.name}
            </h2>
          </div>

          <button
            onClick={onInquire}
            className="bg-white hover:bg-brand-blue-accent text-brand-blue hover:text-white font-mono border border-white hover:border-brand-blue-accent px-5 h-9 sm:h-10 flex items-center justify-center rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer shrink-0"
          >
            Inquire Now
          </button>
        </div>
      </div>

      {/* --- Main Grid Content Flow --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* --- 1. Overview & Landscape Feature Image Grid --- */}
        <section id="overview" className="w-full space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
              Curated Narrative & Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
              EXPERIENCE OVERVIEW
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4 text-brand-charcoal/80 text-sm sm:text-base leading-relaxed font-sans">
                {details.fullDescription1.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                  <p key={`desc1-${idx}`}>{para}</p>
                ))}
                {details.fullDescription2.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                  <p key={`desc2-${idx}`}>{para}</p>
                ))}
              </div>
            </div>

            {/* Right Landscape Photo Container */}
            <div className="lg:col-span-5">
              <div className="w-full h-72 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-brand-blue-accent/15 shadow-sm">
                <img 
                  src={overviewImageSrc} 
                  alt={experience.name} 
                  className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-10000"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. Experience Highlights --- */}
        <section id="highlights" className="space-y-8 border-t border-brand-blue-accent/25 pt-12">
          <div className="space-y-1">
            <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
              What's Included
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
              Experience Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experience.highlights.map((highlight, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-brand-blue-accent/15 px-6 py-5 rounded-2xl flex items-start gap-4 hover:border-brand-blue-accent/30 hover:shadow-sm transition-all duration-300"
              >
                <div className="bg-brand-blue/10 text-brand-blue-accent p-1.5 rounded-lg shrink-0 border border-brand-blue-accent/15 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="font-sans font-medium text-xs sm:text-sm text-brand-charcoal/85 leading-relaxed pt-0.5">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* --- 3. Redesigned Gallery Grid (Big Left, 2x2 Right) --- */}
        <section id="gallery" className="space-y-8 border-t border-brand-blue-accent/25 pt-12">
          <div className="space-y-1">
            <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
              Visual Canvas
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
              Photo Gallery
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Side: 1 Large Highlight Image */}
            <div 
              onClick={() => setSelectedImageIndex(0)}
              className="relative h-[280px] sm:h-[350px] lg:h-full min-h-[280px] sm:min-h-[380px] rounded-3xl overflow-hidden border border-brand-blue-accent/15 shadow-sm cursor-pointer group hover:border-brand-blue-accent/30 hover:shadow-md transition-all duration-300"
            >
              <img 
                src={activeGallery[0].url} 
                alt={activeGallery[0].caption} 
                className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] font-mono text-brand-blue-accent uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> View Full Image
                </span>
              </div>
            </div>

            {/* Right Side: 2x2 Grid of Smaller Images */}
            <div className="grid grid-cols-2 gap-4">
              {activeGallery.slice(1, 5).map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx + 1)}
                  className="relative h-[130px] sm:h-[180px] lg:h-[190px] rounded-2xl overflow-hidden border border-brand-blue-accent/15 shadow-sm cursor-pointer group hover:border-brand-blue-accent/30 hover:shadow-md transition-all duration-300"
                >
                  <img 
                    src={img.url} 
                    alt={img.caption} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-[9px] font-mono text-brand-blue-accent uppercase tracking-widest font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 4. Location Details (Full-Width Accent Card) --- */}
        <section id="location" className="space-y-8 border-t border-brand-blue-accent/25 pt-12">
          <div className="space-y-1">
            <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
              Geography
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
              Location Details
            </h2>
          </div>

          <div className="bg-white border border-brand-blue-accent/15 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 items-stretch">
            
            {/* Dynamic Styled Google Maps */}
            <div className="relative h-64 md:h-auto md:col-span-7 overflow-hidden bg-slate-100 border-b md:border-b-0 md:border-r border-brand-blue-accent/10 min-h-[350px]">
              <iframe
                title="Google Maps Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(experience.name + ", " + experience.location + ", Cambodia")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Location Card Info */}
            <div className="p-8 md:col-span-5 flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="bg-brand-blue/10 p-2.5 rounded-xl border border-brand-blue-accent/15 shrink-0">
                  <MapPin className="w-5 h-5 text-brand-blue-accent" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] font-mono text-brand-blue tracking-widest uppercase font-bold block">
                    Coordinates & Region
                  </span>
                  <h4 className="font-serif font-bold text-lg text-brand-charcoal uppercase tracking-wider leading-snug">
                    {experience.location}
                  </h4>
                  <p className="text-brand-charcoal/70 text-sm font-sans leading-relaxed">
                    {details.locationNote}
                  </p>
                  <div className="pt-2">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(experience.name + ", " + experience.location + ", Cambodia")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-brand-blue-accent hover:text-brand-blue hover:underline transition-all inline-flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- 4.5 Frequently Asked Questions (Full-Width Stacked Section) --- */}
        <section id="location-faq" className="space-y-8 border-t border-brand-blue-accent/25 pt-12">
          <div className="space-y-1">
            <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
              Common Queries
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 max-w-4xl">
            {details.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-brand-blue-accent/15 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4 bg-brand-lightbg hover:bg-white transition-colors cursor-pointer"
                  >
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-brand-charcoal uppercase tracking-wider leading-relaxed">
                      {faq.question}
                    </h4>
                    <span className="text-brand-blue-accent font-serif text-lg font-bold w-5 h-5 flex items-center justify-center shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-5 sm:p-6 bg-white border-t border-brand-blue-accent/10 font-sans text-xs sm:text-sm text-brand-charcoal/80 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 5. Similar Experiences (3 in a row) --- */}
        <section id="similar-experiences" className="space-y-8 border-t border-brand-blue-accent/25 pt-12">
          <div className="space-y-1">
            <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
              Related Pursuits
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
              Similar Experiences
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarExperiences.map((exp) => {
              const saved = wishlist.includes(exp.id);
              return (
                <div 
                  key={exp.id}
                  className="bg-white rounded-3xl overflow-hidden border border-brand-blue-accent/15 shadow-sm hover:scale-[1.01] hover:border-brand-blue-accent/30 hover:shadow-lg transition-luxury flex flex-col justify-between h-full"
                >
                  {/* Image Header */}
                  <div className="h-48 sm:h-52 relative overflow-hidden">
                    <img 
                      src={exp.image} 
                      alt={exp.name} 
                      className="w-full h-full object-cover transform hover:scale-[1.03] transition-transform duration-700"
                    />
                    <span className="absolute top-4 left-4 text-[9px] font-mono font-bold uppercase tracking-widest text-white shadow-md border border-white/10 px-3.5 py-1.5 rounded-lg bg-brand-blue-accent">
                      {exp.category}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-3">
                      {/* Dynamic Regional Upper Label */}
                      <span className="text-[10px] font-mono text-brand-blue-accent tracking-widest uppercase font-bold block">
                        {exp.location.split(",")[0].toUpperCase()} EXCURSION
                      </span>

                      <h3 className="font-serif font-bold text-sm sm:text-base text-brand-charcoal tracking-wide leading-relaxed">
                        {exp.name}
                      </h3>

                      <p className="text-xs text-brand-charcoal/70 leading-relaxed font-sans line-clamp-3">
                        {exp.shortDescription || exp.description}
                      </p>
                      
                      {/* Meta duration info */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-brand-charcoal/60 bg-brand-lightbg px-2.5 py-1.5 rounded-lg border border-brand-blue-accent/10 w-fit">
                        <Clock className="w-3.5 h-3.5 text-brand-blue-accent" />
                        <span>{exp.duration}</span>
                      </div>
                    </div>

                    {/* Bottom Link Action exactly as per image details */}
                    <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-between">
                      <button
                        onClick={() => onToggleWishlist(exp.id)}
                        className="text-[11px] font-mono text-brand-charcoal/50 hover:text-brand-red flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 ${saved ? "text-brand-red fill-brand-red" : ""}`} />
                        <span>Save</span>
                      </button>
                      
                      <a 
                        href={`/experiences/${(exp.title || exp.name || exp.id).replace(/\s+/g, "-")}`}
                        onClick={(e) => {
                          if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                            e.preventDefault();
                            if (onSelectExperience) {
                              onSelectExperience(exp);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }
                        }}
                        className="text-[10px] sm:text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer inline-block text-center"
                      >
                        Explore →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 6. Custom Help Inquiry Banner --- */}
        <section id="planning-help" className="bg-brand-blue text-white border border-brand-blue-accent/25 p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden">
          {/* Decorative subtle vector overlay background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue-accent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-brand-blue-accent border border-brand-blue-accent/20 shadow-sm shrink-0">
                <Headphones className="w-5 h-5 text-brand-blue-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white uppercase tracking-wider leading-snug">
                  Have questions or need help planning?
                </h3>
                <p className="text-white/80 text-xs sm:text-sm font-sans font-light">
                  Our expert travel specialists are ready to curate your dream itinerary.
                </p>
              </div>
            </div>

            {/* Enquire Now button with paper plane icon */}
            <button 
              onClick={onInquire}
              className="bg-brand-blue-accent hover:bg-white text-brand-blue hover:text-brand-blue font-mono border border-brand-blue-accent px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Enquire Now</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>

      </div>

      {/* --- Lightbox Modal (For Visual Gallery) --- */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
          onClick={() => setSelectedImageIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all cursor-pointer z-50"
            onClick={() => setSelectedImageIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            className="absolute left-4 sm:left-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all cursor-pointer z-50 flex items-center justify-center shadow-lg border border-white/5"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            className="absolute right-4 sm:right-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-all cursor-pointer z-50 flex items-center justify-center shadow-lg border border-white/5"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full max-h-[85vh] relative flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <img 
              src={activeGallery[selectedImageIndex].url} 
              alt="Enlarged gallery view" 
              className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            {/* Page indicator */}
            <span className="text-white/50 text-xs font-mono mt-4">
              {selectedImageIndex + 1} / {activeGallery.length}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
