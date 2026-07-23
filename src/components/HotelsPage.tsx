import React, { useState, useMemo } from "react";
import { 
  Compass, Heart, Search, ArrowLeft, SlidersHorizontal, MapPin, Sparkles, CheckCircle, Star, Info 
} from "lucide-react";
import { Hotel } from "../types";
import HotelComparer from "./HotelComparer";

interface HotelsPageProps {
  hotels: Hotel[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onSelectItem: (hotel: Hotel) => void;
  onBack: () => void;
}

export default function HotelsPage({
  hotels,
  wishlist,
  onToggleWishlist,
  onSelectItem,
  onBack
}: HotelsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStars, setSelectedStars] = useState<number | "All">("All");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating");

  // Filter and sort hotels
  const filteredAndSortedHotels = useMemo(() => {
    let result = hotels.filter(hotel => {
      const matchesSearch = 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.prayerFacilities.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.halalBreakfast.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStars = selectedStars === "All" || hotel.stars === selectedStars;
      
      return matchesSearch && matchesStars;
    });

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [hotels, searchQuery, selectedStars, sortBy]);

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
              <span>Home</span> &nbsp;/&nbsp; <span className="text-brand-blue-accent font-bold">Hotels</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              MUSLIM-FRIENDLY HOTELS
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
              Enjoy custom 5-star sanctuaries handpicked for their exquisite design, private pool offerings, in-room prayer facilities, nearby mosques, and high-end certified Halal breakfasts.
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
                placeholder="Search hotels by name, location, nearby mosques, or custom amenities..."
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
                  onChange={(e) => setSortBy(e.target.value as "rating" | "price" | "name")}
                  className="bg-transparent border-none outline-none font-bold text-brand-charcoal text-xs cursor-pointer"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="price">Price: Low to High</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Star Rating Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-brand-blue-accent/10">
            <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-wider mr-2 shrink-0">Rating:</span>
            {["All", 5].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedStars(star as number | "All")}
                className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border cursor-pointer ${
                  selectedStars === star
                    ? "bg-brand-blue text-white border-brand-blue-accent/30 shadow-md"
                    : "bg-brand-lightbg text-brand-charcoal/70 hover:bg-brand-blue/10 hover:text-brand-blue border-brand-blue-accent/10"
                }`}
              >
                {star === "All" ? "All Star Ratings" : "★★★★★ 5-Star Elite"}
              </button>
            ))}
          </div>

        </div>

        {/* --- Hotels Grid --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-brand-charcoal/50">
              Showing <span className="font-bold text-brand-charcoal">{filteredAndSortedHotels.length}</span> verified luxury properties
            </p>
          </div>

          {filteredAndSortedHotels.length === 0 ? (
            <div className="text-center bg-white rounded-3xl border border-brand-blue-accent/15 p-12 space-y-4">
              <p className="text-brand-charcoal/50 text-sm">
                No luxury hotels match your specific search criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedStars("All"); }}
                className="text-xs font-mono text-brand-charcoal font-bold uppercase tracking-wider underline cursor-pointer hover:text-brand-blue-accent"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredAndSortedHotels.map((hotel) => {
                const isSaved = wishlist.includes(hotel.id);
                
                return (
                  <div 
                    key={hotel.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-luxury flex flex-col justify-between border border-brand-blue-accent/15"
                  >
                    {/* Cover image with rating */}
                    <div className="relative h-64 sm:h-72 overflow-hidden">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                      
                      {/* Floating Stars Tag */}
                      <div className="absolute top-4 left-4 flex gap-1 bg-brand-blue/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-mono text-amber-400">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Floating Save button */}
                      <button 
                        onClick={() => onToggleWishlist(hotel.id)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow border border-brand-blue-accent/20 transition-all cursor-pointer"
                        title={isSaved ? "Saved to wishlist" : "Save Hotel"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                      </button>

                      {/* Region & rating badge */}
                      <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                        <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-wide">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-white/80 flex items-center gap-1 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue-accent" />
                          {hotel.location}
                        </p>
                      </div>
                    </div>

                    {/* Card Content body */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <p className="text-brand-charcoal/80 text-sm leading-relaxed font-sans">
                        {hotel.description}
                      </p>

                      {/* Muslim-friendly provisions */}
                      <div className="space-y-3 bg-brand-lightbg p-5 rounded-2xl border border-brand-blue-accent/15">
                        <span className="text-[10px] font-mono text-brand-blue-accent tracking-wider uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Islamic Compliancy Attributes
                        </span>
                        
                        <div className="space-y-2.5 text-xs text-brand-charcoal/85">
                          <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-brand-blue-accent/5">
                            <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-brand-charcoal">{hotel.halalBreakfastLabel || "Gourmet Dining"}</p>
                              <p className="text-[11px] text-brand-charcoal/70">{hotel.halalBreakfast}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-brand-blue-accent/5">
                            <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-brand-charcoal">{hotel.prayerFacilitiesLabel || "Prayer Provisions"}</p>
                              <p className="text-[11px] text-brand-charcoal/70">{hotel.prayerFacilities}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-brand-blue-accent/5">
                            <Info className="w-4 h-4 text-brand-blue-accent shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-brand-charcoal">{hotel.nearbyMosqueLabel || "Nearby Mosques"}</p>
                              <p className="text-[11px] text-brand-charcoal/70">{hotel.nearbyMosque}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer action button */}
                      <div className="pt-5 border-t border-brand-blue-accent/10 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-brand-charcoal/50 block">EXCLUSIVE RATE FROM</span>
                          <span className="text-lg font-serif font-bold text-brand-green">${hotel.price} <span className="text-[10px] font-mono font-normal text-brand-charcoal/50">/ NIGHT</span></span>
                        </div>
                        
                        <a 
                          href={`/hotels/${(hotel.name || hotel.id).replace(/\s+/g, "-")}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                              e.preventDefault();
                              onSelectItem(hotel);
                            }
                          }}
                          className="bg-brand-blue hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl border border-brand-blue-accent/20 transition-luxury shadow-md cursor-pointer inline-block text-center"
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

        {/* --- Unified Comparison Module --- */}
        <div className="pt-4 border-t border-brand-blue-accent/10">
          <HotelComparer 
            wishlistedHotelIds={wishlist} 
            toggleWishlist={onToggleWishlist} 
          />
        </div>

      </div>
    </div>
  );
}
