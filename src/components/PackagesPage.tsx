import React, { useState, useMemo } from "react";
import { 
  Compass, Heart, Search, ArrowLeft, SlidersHorizontal, MapPin, Sparkles, Clock, CheckCircle 
} from "lucide-react";
import { TourPackage } from "../types";

interface PackagesPageProps {
  packages: TourPackage[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onSelectItem: (pkg: TourPackage) => void;
  onBack: () => void;
}

export default function PackagesPage({
  packages,
  wishlist,
  onToggleWishlist,
  onSelectItem,
  onBack
}: PackagesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "name">("price");

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    let result = packages.filter(pkg => {
      return (
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.duration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    if (sortBy === "price") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [packages, searchQuery, sortBy]);

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
              <span>Home</span> &nbsp;/&nbsp; <span className="text-brand-blue-accent font-bold">Packages</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              LUXURY TOUR PACKAGES
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
              Discover legendary land journeys curated by high-end destination management specialists. Indulge in 100% gourmet Halal-vetted meals, stays in majestic 5-star private-pool villas, and private chauffeurs.
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
                placeholder="Search packages by keywords (e.g. elite, private beach, Raffles)..."
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
                  onChange={(e) => setSortBy(e.target.value as "price" | "name")}
                  className="bg-transparent border-none outline-none font-bold text-brand-charcoal text-xs cursor-pointer"
                >
                  <option value="price">Price: High to Low</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* --- Package Grid --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-brand-charcoal/50">
              Showing <span className="font-bold text-brand-charcoal">{filteredAndSortedPackages.length}</span> signature tour packages
            </p>
          </div>

          {filteredAndSortedPackages.length === 0 ? (
            <div className="text-center bg-white rounded-3xl border border-brand-blue-accent/15 p-12 space-y-4">
              <p className="text-brand-charcoal/50 text-sm">
                No luxury tour packages match your specific search criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); }}
                className="text-xs font-mono text-brand-charcoal font-bold uppercase tracking-wider underline cursor-pointer hover:text-brand-blue-accent"
              >
                Reset search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedPackages.map((pkg) => {
                const isSaved = wishlist.includes(pkg.id);
                
                return (
                  <div 
                    key={pkg.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.008] hover:border-brand-blue-accent transition-luxury flex flex-col border border-brand-blue-accent/15"
                  >
                    {/* Top Cover Image */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                      <img 
                        src={pkg.image} 
                        alt={pkg.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 via-transparent to-transparent" />
                      
                      {/* Floating Duration badge */}
                      <div className="absolute top-4 left-4 bg-brand-blue-accent border border-white/10 px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-white flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3 text-brand-blue-accent" />
                        <span>{pkg.duration}</span>
                      </div>

                      {/* Floating Save button */}
                      <button 
                        onClick={() => onToggleWishlist(pkg.id)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2 rounded-full shadow border border-brand-blue-accent/20 transition-all cursor-pointer"
                        title={isSaved ? "Saved to wishlist" : "Save Package"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                      </button>
                    </div>

                    {/* Card Content body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <h3 className="text-lg font-serif font-bold text-brand-charcoal tracking-wide leading-snug">
                          {pkg.name}
                        </h3>
                        <p className="text-brand-charcoal/80 text-xs leading-relaxed font-sans">
                          {pkg.brief || pkg.description}
                        </p>
                      </div>

                      {/* Package Features/Key Highlights list */}
                      <div className="space-y-2.5 bg-brand-lightbg p-4 rounded-xl border border-brand-blue-accent/15">
                        <span className="text-[9px] font-mono text-brand-blue-accent tracking-wider uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Key Highlights
                        </span>
                        <div className="space-y-1.5 text-[11px] text-brand-charcoal">
                          {(pkg.keyHighlights && pkg.keyHighlights.length > 0
                            ? pkg.keyHighlights
                            : pkg.features.slice(0, 3)
                          ).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-brand-blue-accent shrink-0 mt-0.5" />
                              <span className="font-sans font-medium text-brand-charcoal/80 leading-tight" title={feature}>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer action button */}
                      <div className="pt-3 border-t border-brand-blue-accent/10 flex items-center justify-between gap-2">
                        <div className="text-left">
                          <span className="text-[8px] font-mono text-brand-charcoal/40 block leading-none">P.P Price from</span>
                          <span className="text-base font-serif font-bold text-brand-green">${pkg.price} <span className="text-[10px] font-mono font-normal text-brand-charcoal/50">USD</span></span>
                        </div>
                        <button 
                          onClick={() => onSelectItem(pkg)}
                          className="text-[10px] font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-3 py-1.5 rounded-lg border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Detail →
                        </button>
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
