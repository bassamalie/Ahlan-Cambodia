import React, { useState, useMemo } from "react";
import { 
  Heart, Search, ArrowLeft, SlidersHorizontal, MapPin, Sparkles, CheckCircle, ShieldCheck, Utensils 
} from "lucide-react";
import { Restaurant } from "../types";

interface HalalDiningPageProps {
  restaurants: Restaurant[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onSelectItem: (rest: Restaurant) => void;
  onBack: () => void;
}

export default function HalalDiningPage({
  restaurants,
  wishlist,
  onToggleWishlist,
  onSelectItem,
  onBack
}: HalalDiningPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCertified, setFilterCertified] = useState(false);
  const [filterMuslimFriendly, setFilterMuslimFriendly] = useState(false);
  const [sortBy, setSortBy] = useState<"name">("name");

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    let result = restaurants.filter(rest => {
      const matchesSearch = 
        rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rest.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rest.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCertified = !filterCertified || rest.halalCertified;
      const matchesMuslimFriendly = !filterMuslimFriendly || rest.muslimFriendly;
      
      return matchesSearch && matchesCertified && matchesMuslimFriendly;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [restaurants, searchQuery, filterCertified, filterMuslimFriendly, sortBy]);

  return (
    <div className="w-full bg-white min-h-screen animate-fade-in">
      
      {/* --- Majestic Title Header - Full Width --- */}
      <div className="relative bg-[#0F1626] text-white py-8 sm:py-12 overflow-hidden shadow-xl border-b border-brand-blue-accent/25 min-h-[280px] sm:min-h-[320px] flex flex-col justify-center">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--color-brand-blue-accent) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-brand-blue-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          {/* Breadcrumbs & Back Nav */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-brand-blue-accent font-mono text-xs uppercase tracking-wider font-bold transition-all bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2.5 rounded-xl shadow-sm w-fit cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand-blue-accent" />
              <span>Return to Home</span>
            </button>
            
            <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
              <span>Home</span> &nbsp;/&nbsp; <span className="text-brand-blue-accent font-bold">Dining</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              Halal Dining
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
              Dine with absolute conviction. Discover verified, premium restaurants serving traditional Khmer, Malaysian, and Indian flavors. Handpicked for complete transparency and pristine hygiene.
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
                placeholder="Search dining options by restaurant name, cuisine type, or area location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-warmwhite/50 border border-brand-blue-accent/20 rounded-xl py-3.5 pl-11 pr-10 text-xs sm:text-sm outline-none focus:border-brand-blue-accent text-brand-charcoal placeholder-brand-charcoal/40 font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-[10px] font-mono font-bold bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 px-2 py-1.5 rounded-lg"
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
                  onChange={(e) => setSortBy(e.target.value as "name")}
                  className="bg-transparent border-none outline-none font-bold text-brand-charcoal text-xs cursor-pointer"
                >
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-brand-blue-accent/10">
            <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-wider mr-2 shrink-0">Filters:</span>
            
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-brand-charcoal font-medium">
              <input 
                type="checkbox"
                checked={filterCertified}
                onChange={(e) => setFilterCertified(e.target.checked)}
                className="w-4 h-4 rounded border-brand-blue-accent text-brand-green focus:ring-brand-blue-accent accent-brand-blue-accent"
              />
              <span>Halal Verified Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-brand-charcoal font-medium">
              <input 
                type="checkbox"
                checked={filterMuslimFriendly}
                onChange={(e) => setFilterMuslimFriendly(e.target.checked)}
                className="w-4 h-4 rounded border-brand-blue-accent text-brand-green focus:ring-brand-blue-accent accent-brand-blue-accent"
              />
              <span>Muslim Friendly Only</span>
            </label>
          </div>

        </div>

        {/* --- Dining Grid --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-brand-charcoal/50">
              Showing <span className="font-bold text-brand-charcoal">{filteredAndSortedRestaurants.length}</span> verified dining sanctuaries
            </p>
          </div>

          {filteredAndSortedRestaurants.length === 0 ? (
            <div className="text-center bg-white rounded-3xl border border-brand-blue-accent/15 p-12 space-y-4">
              <p className="text-brand-charcoal/50 text-sm">
                No dining option matches your specific search and filter criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setFilterCertified(false); setFilterMuslimFriendly(false); }}
                className="text-xs font-mono text-brand-charcoal font-bold uppercase tracking-wider underline cursor-pointer hover:text-brand-blue-accent"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedRestaurants.map((rest) => {
                const isSaved = wishlist.includes(rest.id);
                
                return (
                  <div 
                    key={rest.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] hover:border-brand-blue-accent transition-luxury border border-brand-blue-accent/15 flex flex-col justify-between group"
                  >
                    {/* Cover image with tags */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={rest.image} 
                        alt={rest.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      
                      {/* Floating Save button */}
                      <button 
                        onClick={() => onToggleWishlist(rest.id)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow-md transition-all cursor-pointer"
                        title={isSaved ? "Saved to wishlist" : "Save Dining Option"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                      </button>

                      {/* Overlaid Dining status tags - Only Halal Verified shown on cards */}
                      {rest.halalCertified && (
                        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                          <span className="bg-brand-blue-accent text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md shadow-xs">
                            HALAL VERIFIED
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1 text-[10px] font-mono uppercase tracking-wider">
                          <div className="flex items-center gap-1.5 text-brand-blue-accent font-bold">
                            <Utensils className="w-3.5 h-3.5 shrink-0" />
                            <span>{rest.cuisine}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-brand-blue-accent font-bold">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{rest.location}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-serif font-bold text-brand-charcoal uppercase tracking-wide leading-snug mt-1.5">
                          {rest.name}
                        </h3>
                        <p className="text-brand-charcoal/75 text-xs sm:text-sm leading-relaxed font-sans line-clamp-3">
                          {rest.description}
                        </p>
                      </div>

                      {/* Footer action */}
                      <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-end text-xs">
                        <a 
                          href={`/dining/${(rest.name || rest.id).replace(/\s+/g, "-")}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                              e.preventDefault();
                              onSelectItem(rest);
                            }
                          }}
                          className="bg-brand-charcoal hover:bg-brand-blue text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                        >
                          EXPLORE →
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
