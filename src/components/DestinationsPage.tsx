import React, { useState, useMemo } from "react";
import { 
  Compass, Heart, Star, Search, ArrowLeft, SlidersHorizontal, MapPin, Sparkles, CheckCircle 
} from "lucide-react";
import { Destination } from "../types";
import { optimizeCardImageUrl, NO_PHOTO_AVAILABLE_PLACEHOLDER } from "../googlePlacesPhotoService";
import { useLanguage } from "../LanguageContext";

interface DestinationsPageProps {
  destinations: Destination[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onSelectItem: (dest: Destination) => void;
  onBack: () => void;
}

export default function DestinationsPage({
  destinations,
  wishlist,
  onToggleWishlist,
  onSelectItem,
  onBack
}: DestinationsPageProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "name">("featured");

  // Extract all unique regions for filter tabs
  const regions = useMemo(() => {
    const allRegions = destinations.map(d => d.region);
    return ["All", ...Array.from(new Set(allRegions))];
  }, [destinations]);

  // Filter and sort destinations
  const filteredAndSortedDestinations = useMemo(() => {
    let result = destinations.filter(dest => {
      const matchesSearch = 
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRegion = selectedRegion === "All" || dest.region === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Always show Phnom Penh first and second will be Siem Reap if they are present
    const phnomPenh = result.find(d => d.id === "phnom-penh");
    const siemReap = result.find(d => d.id === "siem-reap");
    const others = result.filter(d => d.id !== "phnom-penh" && d.id !== "siem-reap");

    const ordered: Destination[] = [];
    if (phnomPenh) ordered.push(phnomPenh);
    if (siemReap) ordered.push(siemReap);
    ordered.push(...others);

    return ordered;
  }, [destinations, searchQuery, selectedRegion, sortBy]);


  return (
    <div className="w-full bg-white min-h-screen animate-fade-in">
      
      {/* --- Majestic Title Header - Full Width --- */}
      <div className="relative bg-[#0F1626] text-white py-8 sm:py-12 overflow-hidden shadow-xl border-b border-brand-blue-accent/25 min-h-[280px] sm:min-h-[320px] flex flex-col justify-center">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--color-brand-blue-accent) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Decorative radial lighting */}
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-brand-blue-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          {/* Breadcrumbs & Back Nav */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-brand-blue-accent font-mono text-xs uppercase tracking-wider font-bold transition-all bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2.5 rounded-xl shadow-sm w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand-blue-accent" />
              <span>{t.backToHome}</span>
            </button>
            
            <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
              <span>{t.backToHome}</span> &nbsp;/&nbsp; <span className="text-brand-blue-accent font-bold">{t.destinations}</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              {t.destinationsTitle}
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
              {t.destinationsSubtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">


        {/* --- Search, Filter & Sort Bar --- */}
        <div className="bg-white p-5 rounded-3xl border border-brand-blue-accent/15 shadow-sm space-y-4">
          
          {/* Live Search and Sort Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-brand-blue-accent" />
              <input 
                type="text"
                placeholder="Search destinations by name, region, or keywords (e.g., sunrise, beach, mosque)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-warmwhite/50 border border-brand-blue-accent/20 rounded-xl py-3.5 pl-11 pr-10 text-xs sm:text-sm outline-none focus:border-brand-blue-accent text-brand-charcoal placeholder-brand-charcoal/40 font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-[10px] font-mono font-bold bg-brand-blue/10 text-brand-blue hover:bg-brand-blue-accent hover:text-white transition-all cursor-pointer border border-brand-blue-accent/10 hover:border-brand-blue-accent/30 px-3 py-1.5 rounded-lg uppercase tracking-wider"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdowns / Controls */}
            <div className="flex gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-brand-warmwhite/50 border border-brand-blue-accent/20 px-3 py-2 rounded-xl text-xs font-mono text-brand-charcoal">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-blue-accent" />
                <span className="hidden sm:inline">Sort:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "featured" | "name")}
                  className="bg-transparent border-none outline-none font-bold text-brand-charcoal text-xs cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-brand-blue-accent/10">
            <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-wider mr-2 shrink-0">Regions:</span>
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border cursor-pointer ${
                  selectedRegion === region
                    ? "bg-brand-blue text-white border-brand-blue-accent/30 shadow-md"
                    : "bg-brand-lightbg text-brand-charcoal/70 hover:bg-brand-blue/10 hover:text-brand-blue border-brand-blue-accent/10"
                }`}
              >
                {region === "All" ? "All Regions" : region}
              </button>
            ))}
          </div>

        </div>

        {/* --- Destination Grid --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-brand-charcoal/50">
              Showing <span className="font-bold text-brand-charcoal">{filteredAndSortedDestinations.length}</span> destinations matching filters
            </p>
          </div>

          {filteredAndSortedDestinations.length === 0 ? (
            <div className="text-center bg-white rounded-3xl border border-brand-blue-accent/15 p-12 space-y-4">
              <p className="text-brand-charcoal/50 text-sm">
                No luxury destinations match your specific search criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedRegion("All"); }}
                className="text-xs font-mono text-brand-charcoal font-bold uppercase tracking-wider underline cursor-pointer hover:text-brand-blue-accent"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredAndSortedDestinations.map((dest) => {
                const isSaved = wishlist.includes(dest.id);
                
                return (
                  <div 
                    key={dest.id}
                    id={`dest-card-${dest.id}`}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-luxury flex flex-col justify-between border border-brand-blue-accent/15"
                  >
                    {/* Cover image with gradient & rating */}
                    <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
                      <img 
                        src={optimizeCardImageUrl(dest.image, 800) || NO_PHOTO_AVAILABLE_PLACEHOLDER} 
                        alt={dest.name} 
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                        onError={(e) => {
                          e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent" />
                      
                      {/* Floating Region Tag */}
                      <span className={`absolute top-4 left-4 text-[9px] font-mono font-bold uppercase tracking-widest text-white shadow-md border border-white/10 px-3.5 py-1.5 rounded-lg ${
                        dest.region.toLowerCase().includes("siem reap") || 
                        dest.region.toLowerCase().includes("phnom penh")
                          ? "bg-brand-blue-accent"
                          : "bg-cambodia-red"
                      }`}>
                        {dest.region}
                      </span>

                      {/* Floating Save button */}
                      <button 
                        onClick={() => onToggleWishlist(dest.id)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow border border-brand-blue-accent/20 transition-all cursor-pointer"
                        title={isSaved ? "Saved to your list" : "Save Destination"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                      </button>
                      
                      {/* Name badge */}
                      <div className="absolute bottom-4 left-6 right-6 text-white">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-wide">
                          {dest.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content body */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <p className="text-brand-charcoal/80 text-sm leading-relaxed font-sans">
                        {dest.description}
                      </p>

                      {/* Unmissable Highlights List */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-mono text-brand-blue-accent tracking-wider uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Highlights
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {dest.highlights.map((highlight, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] sm:text-xs font-mono bg-brand-lightbg border border-brand-blue-accent/15 px-2.5 py-1 rounded-lg text-brand-charcoal/70"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer action button */}
                      <div className="pt-5 border-t border-brand-blue-accent/10 flex items-center justify-end">
                        <a 
                          href={`/destinations/${dest.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                              e.preventDefault();
                              onSelectItem(dest);
                            }
                          }}
                          className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4.5 py-2.5 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer inline-block text-center"
                        >
                          Explore →
                        </a>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- Bottom Footer Differentiators Banner --- */}
        <div className="bg-brand-lightbg border border-brand-blue-accent/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-brand-charcoal text-base">Uncompromising Halal Excellence</h4>
            <p className="text-xs sm:text-sm text-brand-charcoal/70 max-w-xl">
              All listed travel gateways have been comprehensively certified by the Islamic Council, guaranteeing easy prayer access and 100% Halal dining availability.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-white border border-brand-blue-accent/15 px-3 py-2 rounded-xl text-[10px] font-mono text-brand-green font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-brand-blue-accent" />
              <span>MoT Vetted</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-brand-blue-accent/15 px-3 py-2 rounded-xl text-[10px] font-mono text-brand-green font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-brand-blue-accent" />
              <span>100% Halal Certified</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
