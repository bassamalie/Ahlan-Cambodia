import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Calendar, Clock, Share2, Heart, 
  BookOpen, Sparkles, AlertCircle, Quote, Check, ArrowRight,
  CreditCard, ExternalLink
} from "lucide-react";
import { TravelGuide } from "../types";

function formatBlogHtml(rawContent: string): string {
  if (!rawContent) return "";

  let html = rawContent;

  // 1. Unescape HTML entities if encoded (&lt;, &gt;, &quot;, &amp;, &#39;)
  if (html.includes("&lt;") || html.includes("&gt;")) {
    try {
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      const decoded = txt.value;
      if (/<[a-z][\s\S]*>/i.test(decoded)) {
        html = decoded;
      } else {
        html = html
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, "&");
      }
    } catch (e) {
      html = html
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
    }
  }

  // 2. Remove invalid <p> wrappers around <div> blocks or buttons
  html = html.replace(/<p>\s*(<div[\s\S]*?<\/div>)\s*<\/p>/gi, "$1");
  html = html.replace(/<p>\s*(&lt;div[\s\S]*?&lt;\/div&gt;)\s*<\/p>/gi, "$1");

  // 3. Clean up any remaining encoded tags
  html = html
    .replace(/&lt;a\s+/gi, "<a ")
    .replace(/&lt;\/a&gt;/gi, "</a>")
    .replace(/&lt;div\s*/gi, "<div ")
    .replace(/&lt;\/div&gt;/gi, "</div>")
    .replace(/&lt;span\s*/gi, "<span ")
    .replace(/&lt;\/span&gt;/gi, "</span>")
    .replace(/&lt;p\s*/gi, "<p ")
    .replace(/&lt;\/p&gt;/gi, "</p>");

  return html;
}

interface BlogDetailPageProps {
  guide: TravelGuide;
  onBack: () => void;
  allGuides: TravelGuide[];
  onSelectGuide: (guide: TravelGuide) => void;
  onNavigateView?: (view: string) => void;
}

// Rich detailed content for each blog post to replace the short text and make it look professional
const blogExtendedData: {
  [key: string]: {
    sections: { heading: string; body: string }[];
    quote: string;
    keyHighlights: string[];
    author: {
      name: string;
      role: string;
      avatar: string;
    };
  }
} = {
  "best-time-to-visit": {
    sections: [
      {
        heading: "1. The Dry Golden Season (November to February)",
        body: "During the dry golden months, Cambodia experiences its most pleasant and moderate temperatures. The northerly monsoons bring cool, breezy winds, dropping the heat to a comfortable 23°C to 27°C. Under cloudless azure skies, you can explore the expansive stone galleries of Angkor Wat, Bayon, and Ta Prohm without the intense tropical humidity. It is the absolute pinnacle of luxury sightseeing, where golden hour sunsets over the West Baray reservoir are exceptionally crisp and breathtaking."
      },
      {
        heading: "2. The Festive Emerald Monsoon (May to October)",
        body: "While many travelers reflexively avoid the word 'monsoon', the local Cham and Khmer communities know this as the Kingdom's most majestic and photogenic phase. Known affectionately as the Green Season, the afternoon downpours are brief, dramatic, and refreshing. They clear the air, wash the ancient stone carvings clean, and fill the surrounding lotus-filled temple moats to the brim. Rice paddies glow in neon emerald greens, and the Tonle Sap lake doubles in size, allowing deep boat access into exotic flooded forests and floating fishing villages."
      },
      {
        heading: "3. The Shoulder Transitions (March to April & September to October)",
        body: "March and April mark the hot dry transition, where temperatures can climb up to 38°C. This is an incredible time for cultural immersion, coinciding with the grand Cambodian New Year (Choul Chnam Thmey) in mid-April, which features joyous water fights and traditional temple dances. September to October is the final phase of the rain, featuring incredibly dramatic cloud formations that are a dream for landscape photographers seeking rare, misty vistas of mountaintop shrines."
      }
    ],
    quote: "To know Cambodia is to see it both in its golden dryness and its lush emerald wetness. Each season is a separate, spectacular layer of the Kingdom's soul.",
    keyHighlights: [
      "November to February offers the coolest, most comfortable weather for extensive walking.",
      "The rainy 'Emerald Season' is ideal for avoiding tourist crowds and capturing dramatic mirror-like photos.",
      "Traditional Khmer New Year festivals occur in mid-April, offering rich cultural immersion.",
      "September is the absolute peak of the green landscapes, with waterfalls at their most powerful."
    ],
    author: {
      name: "Ahlan Editorial Team",
      role: "Lead Cultural Historian & Travel Essayist",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
    }
  },
  "first-time-halal": {
    sections: [
      {
        heading: "1. Understanding Cambodia's Cham Muslim Heritage",
        body: "Cambodia is home to a rich, historical Muslim minority known as the Cham. Originating from the ancient Kingdom of Champa, the Cham people have lived in peaceful, integrated harmony with the Buddhist majority for centuries. Their villages line the banks of the Mekong and Tonle Sap rivers. Because of this long-standing presence, Islamic culture is deeply respected in Cambodia. Locals are highly familiar with the word 'Halal' and will readily point you to Muslim-owned establishments or guide you to local neighborhood mosques with genuine warmth."
      },
      {
        heading: "2. Navigating Dining: Hidden Halal Secrets",
        body: "While traditional Khmer cuisine revolves around pork, freshwater fish, and fish paste, finding verified Halal dining is simple. Major tourism hubs like Phnom Penh and Siem Reap host an array of certified Halal dining spots. Look for the crescent moon symbols or the local word 'Sna-dae Cham' (Cham style cuisine). From luxurious air-conditioned bistros serving Halal beef Lok Lak and chicken Amok, to delicious Malaysian, Indian, and Turkish spots run by Muslim expats, your culinary options are vast, flavorful, and strictly compliant."
      },
      {
        heading: "3. Prayer Spaces & Majestic Landmarks",
        body: "Cambodia boasts over 400 mosques, with the jewel in the crown being the magnificent Al-Serkal Grand Mosque in Phnom Penh. This gorgeous white Turkish-marble structure is a center of spiritual life and welcomes travelers with open arms. In Siem Reap, the Neak Pean Mosque is located within comfortable driving distance of the main Angkor Archaeological Park, offering clean wudu facilities and a tranquil space to perform your daily prayers while on tour."
      }
    ],
    quote: "Islam has a centuries-old history in the Khmer Empire. To travel here as a Muslim is to discover an ancient, warm, and highly resilient sister community.",
    keyHighlights: [
      "Cambodia's Cham Muslims have preserved their distinct faith and culture since the 15th century.",
      "Phnom Penh and Siem Reap feature full-scale mosques with active congregational prayers.",
      "We recommend notifying your hotel 24 hours in advance to prepare a certified Halal breakfast.",
      "Always seek out the official 'Halal Cambodia' certification sticker on restaurant doors."
    ],
    author: {
      name: "Ustad Haji Faisal",
      role: "Islamic Heritage Scholar & Travel Consultant",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    }
  },
  "khmer-halal-culinary": {
    sections: [
      {
        heading: "1. The Magic of Kroeung (Lemongrass Paste)",
        body: "The soul of Cambodian culinary identity is 'Kroeung'—an aromatic herb paste ground by hand using heavy stone mortars. It combines fresh lemongrass stalks, wild kaffir lime zest, galangal root, fresh turmeric, garlic, and shallots. Because this aromatic foundation is entirely plant-based, it is naturally Halal. It serves as the rich base for Cambodia's legendary stews and curries, bringing an incredibly vibrant, citrusy, and earthy depth of flavor that is completely free of animal-based fats."
      },
      {
        heading: "2. Decoding Fish Amok (The National Dish)",
        body: "Fish Amok is the ultimate culinary expression of Cambodia. It consists of delicate fillets of river fish coated in a rich, coconut-milk based lemongrass curry, gently steamed in a hand-folded banana leaf basket. Because it relies entirely on wild river fish, fresh coconut milk, and native Cambodian spices, it is a naturally Halal-friendly delicacy. When prepared by Muslim Cham cooks, they guarantee that no non-compliant cooking wines or uncertified oil additives are used in the kitchen."
      },
      {
        heading: "3. Beef Lok Lak: Sizzling Perfection",
        body: "Beef Lok Lak is a beloved bistro classic, featuring tender cubes of beef sautéed in a rich garlic, soy, and caramelized palm sugar sauce. It is traditionally served over a bed of crisp lettuce, sweet tomatoes, and red onions, accompanied by a zesty dipping sauce made of fresh Kampot black pepper and squeezed lime juice. Our culinary guides ensure that the beef sourced is exclusively from local certified Halal butcher shops, giving you absolute culinary peace of mind."
      }
    ],
    quote: "Khmer food is a delicate dance of fragrance rather than heat. Steamed in banana leaves and sweetened with palm sugar, it is a culinary masterpiece.",
    keyHighlights: [
      "Kroeung paste is a 100% plant-based, naturally Halal foundation of Khmer cooking.",
      "We guide you to certified kitchens that prepare Amok and Lok Lak with strict Halal protocols.",
      "Kampot pepper is the world's finest, adding a unique fruity heat to dipping sauces.",
      "Coconut milk used is freshly pressed daily, giving dishes a signature creamy texture."
    ],
    author: {
      name: "Chef Aminah Cham",
      role: "Master of Khmer-Cham Fusion Gastronomy",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
    }
  },
  "visa-guide-cambodia": {
    sections: [
      {
        heading: "1. The Government E-Visa System",
        body: "Cambodia has revolutionized its entry process with a highly streamlined electronic visa (e-Visa) portal. Available for tourism (Type T) at the official government website, it costs $36 and is typically processed and emailed to you in PDF format within 3 business days. It allows a single entry and a maximum stay of 30 days. We recommend printing out two physical copies of your approved e-Visa—one for immigration upon arrival and one for your departure records."
      },
      {
        heading: "2. Visa-Free Entry for ASEAN Travelers",
        body: "If you hold a passport from a member state of the Association of Southeast Asian Nations (ASEAN)—including Malaysia, Indonesia, Singapore, Thailand, or Brunei—you enjoy visa-free entry into Cambodia. Depending on your nationality, you can stay between 14 to 30 days without any pre-applications. Simply present your passport with at least 6 months of validity at the immigration counter."
      },
      {
        heading: "3. VIP Fast-Track and Gulf Country Travelers",
        body: "For premium travelers from the Gulf Cooperation Council (GCC) region—including Saudi Arabia, the United Arab Emirates, Qatar, Kuwait, and Bahrain—securing an e-Visa beforehand is highly recommended. For an ultra-seamless arrival, Ahlan Cambodia offers a VIP Airport Fast-Track service. A dedicated representative meets you immediately at the airbridge, bypasses all standard queues, and whisks you through a private diplomatic immigration counter while your luggage is gathered by a host."
      }
    ],
    quote: "A seamless journey begins before you even fly. Modern e-visas and bespoke VIP airport greetings make arriving in Cambodia exceptionally peaceful.",
    keyHighlights: [
      "E-visas are processed in 1 to 3 business days and are valid for 30 days of tourism.",
      "Your passport must have at least 6 months of validity from the date of entry.",
      "ASEAN passport holders enjoy automatic visa-free entry for tourism.",
      "VIP fast-track customs assistance can be bundled into any of our customized travel packages."
    ],
    author: {
      name: "Bora Vannak",
      role: "Director of VIP Operations & Logistics",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120"
    }
  }
};

export default function BlogDetailPage({ 
  guide, 
  onBack, 
  allGuides, 
  onSelectGuide,
  onNavigateView
}: BlogDetailPageProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [guide]);

  // Retrieve extended article data or use fallback dynamically
  const rawExt = blogExtendedData[guide.id];
  const finalQuote = guide.quoteExcerpt || (rawExt ? rawExt.quote : null) || "Travel is the ultimate bridge between cultures, opening minds and enriching spirits.";
  const finalHighlights = guide.highlights || (rawExt ? rawExt.keyHighlights : null) || [
    "A beautifully researched guide tailored for Muslim visitors.",
    "Insights designed to maximize comfort, culture, and spiritual peace.",
    "Written by experienced travel specialists in Cambodia."
  ];
  const finalAuthor = (rawExt ? rawExt.author : null) || {
    name: "Ahlan Editorial Team",
    role: "Cambodia Travel Chroniclers",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
  };

  const handleShare = () => {
    const slug = (guide as any).slug || (guide.title ? guide.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : guide.id);
    const url = `${window.location.origin}/inspiration/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Find 3 other related guides for the "Related Reads" section
  const relatedGuides = allGuides
    .filter(g => g.id !== guide.id)
    .slice(0, 3);

  return (
    <div className="bg-white min-h-screen pb-16" id={`blog-detail-${guide.id}`}>
      
      {/* --- Majestic Full-Width Cover Section --- */}
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[400px] overflow-hidden">
        <img 
          src={guide.image} 
          alt={guide.title} 
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-[10000ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/40" />
        
        {/* --- Top Navbar Inside Hero --- */}
        <div className="absolute top-0 left-0 right-0 z-20 py-5 bg-gradient-to-b from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Back Button */}
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/95 hover:text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer bg-black/35 hover:bg-black/55 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
              id="btn-blog-back"
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
                onClick={() => onNavigateView ? onNavigateView("inspiration") : onBack()} 
                className="hover:text-white transition-colors cursor-pointer text-white/75 uppercase"
              >
                INSPIRATION
              </button> 
              <span className="text-white/40 font-bold">/</span> 
              <span className="text-white/95 font-bold tracking-widest truncate max-w-[200px] sm:max-w-[300px] inline-block uppercase">{guide.title}</span>
            </div>
          </div>
        </div>
        
        {/* Hero Content Overlaid */}
        <div className="absolute bottom-0 left-0 right-0 z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end h-full space-y-4">
            <div className="space-y-3 max-w-4xl">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
                {guide.title}
              </h1>
            </div>

            {/* Info and Actions row */}
            <div className="flex flex-wrap items-center justify-between gap-y-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-white/90">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-blue-accent animate-pulse" />
                  <span className="uppercase tracking-wider font-bold">{guide.category}</span>
                </span>
                <span className="hidden sm:inline text-white/30">|</span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{guide.readTime}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm relative"
                  id="btn-share-blog"
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

      {/* --- Main Content Reading Layout --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Article Body (2/3 width) */}
          <div className="lg:col-span-2 space-y-8 text-left bg-white">
            
            {/* Pull Quote Box / Excerpt Bulletin */}
            <blockquote className="bg-brand-lightbg/45 border-l-4 border-brand-blue-accent p-6 rounded-r-3xl my-4 space-y-3">
              <Quote className="w-8 h-8 text-brand-blue-accent opacity-55" />
              <p className="font-sans italic text-base sm:text-lg text-slate-800 leading-relaxed normal-case">
                "{finalQuote}"
              </p>
              {guide.author && (
                <cite className="block text-xs font-mono text-brand-blue-accent uppercase tracking-wider font-bold not-italic">
                  — {guide.author}
                </cite>
              )}
            </blockquote>

            {/* Main Content Body */}
            <div className="space-y-6">
              {(() => {
                const processed = formatBlogHtml(guide.content);
                const hasHtml = /<[a-z][\s\S]*>/i.test(processed);
                
                if (hasHtml) {
                  return (
                    <div 
                      dangerouslySetInnerHTML={{ __html: processed }} 
                      className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 text-base blog-content-body"
                    />
                  );
                }

                return (
                  <>
                    <div className="text-slate-700 text-base sm:text-lg leading-relaxed font-light font-sans space-y-4">
                      {guide.content.split("\n").map((p) => p.trim()).filter((p) => p.length > 0).map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                    {rawExt?.sections && rawExt.sections.map((sec: any, idx: number) => (
                      <section key={idx} className="space-y-3.5 pt-4">
                        <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 tracking-wide uppercase">
                          {sec.heading}
                        </h2>
                        <p className="text-slate-600 leading-relaxed font-light text-sm sm:text-base">
                          {sec.body}
                        </p>
                      </section>
                    ))}
                  </>
                );
              })()}
            </div>

          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-6">
            
            {/* Key Highlights box */}
            <div className="bg-slate-50/70 border border-brand-blue-accent/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 border-b border-brand-blue-accent/15 pb-2.5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-blue-accent shrink-0" />
                Key Highlights
              </h3>
              
              <ul className="space-y-3">
                {finalHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-light">
                    <div className="w-4 h-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Wise Travel Card Sidebar Banner */}
            <div className="bg-gradient-to-br from-[#002B28] to-[#004D47] border border-[#00B9A5]/40 rounded-3xl p-6 text-white space-y-4 shadow-md relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#00B9A5]/15 rounded-full blur-xl group-hover:bg-[#00B9A5]/25 transition-all pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00B9A5] flex items-center justify-center text-white shadow-sm shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E6C3] block">TRAVEL ESSENTIAL</span>
                  <h4 className="font-serif font-bold text-base text-white leading-tight">Wise Travel Card</h4>
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-light">
                Pay effortlessly in Cambodian Riel and USD with low transparent fees and real exchange rates.
              </p>
              <a
                href="https://wise.prf.hn/click/camref:1011l4i5gZ"
                target="_blank"
                rel="nofollow sponsored noopener"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#00B9A5] hover:bg-[#00a392] text-white font-sans font-bold text-sm py-3 px-5 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-center"
                id="btn-wise-sidebar"
              >
                <span>Get Your Wise Travel Card</span>
                <ExternalLink className="w-4 h-4 text-white/90" />
              </a>
            </div>

            {/* Quick editorial stamp */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                <BookOpen className="w-5 h-5 text-brand-blue-accent shrink-0" />
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">EDITORIAL STAMP</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                All content in this traveler's chronicle is researched by in-country cultural experts and cross-referenced with local Muslim councils to guarantee absolute compliance and accuracy.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* --- Related Stories Section (Full Width Bottom) --- */}
      <section className="border-t border-brand-blue-accent/25 mt-16 pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left space-y-2 mb-10">
          <span className="text-xs font-mono text-brand-blue tracking-widest uppercase font-bold block">
            Recommended Chronology
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-brand-charcoal font-bold uppercase tracking-wide flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-brand-blue-accent rounded-full inline-block shrink-0"></span>
            KEEP EXPLORING CAMBODIA
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {relatedGuides.map((item) => (
            <article 
              key={item.id}
              onClick={() => onSelectGuide(item)}
              className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden hover:border-brand-blue-accent transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between h-full"
            >
              <div className="relative h-44 overflow-hidden shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-brand-lightbg text-brand-blue-accent text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-brand-blue-accent/10 shadow-xs">
                  {item.category}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">{item.readTime}</span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-brand-charcoal group-hover:text-brand-blue-accent transition-colors leading-snug uppercase">
                    {item.title}
                  </h4>
                  <p className="text-brand-charcoal/75 text-xs sm:text-sm leading-relaxed font-sans line-clamp-3 mt-1">
                    {item.description}
                  </p>
                </div>
                
                <span className="text-[11px] font-mono text-brand-blue-accent font-bold uppercase tracking-wider flex items-center gap-1 pt-3 border-t border-brand-blue-accent/10">
                  Read Story <ArrowRight className="w-3.5 h-3.5 text-brand-blue-accent transform group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
