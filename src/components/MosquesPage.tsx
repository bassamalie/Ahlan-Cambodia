import React, { useState, useMemo } from "react";
import { 
  Heart, Search, ArrowLeft, SlidersHorizontal, MapPin, Sparkles, CheckCircle, Info, Calendar, Users 
} from "lucide-react";
import { Mosque } from "../types";

interface MosquesPageProps {
  mosques: Mosque[];
  onSelectItem: (mosque: Mosque) => void;
  onBack: () => void;
}

export default function MosquesPage({
  mosques,
  onSelectItem,
  onBack
}: MosquesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter mosques
  const filteredMosques = useMemo(() => {
    return mosques.filter(mosque => {
      return (
        mosque.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mosque.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mosque.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mosque.fridayPrayerTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mosque.capacity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [mosques, searchQuery]);

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
              <span>Home</span> &nbsp;/&nbsp; <span className="text-brand-blue-accent font-bold">Mosques</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              FEATURED MOSQUES
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
              Discover beautiful historic and modern houses of worship serving daily congregation prayers, Friday Jummah Khutbah services, and community events with open hearts for global travelers.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* --- Search & Filter Bar --- */}
        <div className="bg-white p-5 rounded-3xl border border-brand-blue-accent/15 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-brand-blue-accent" />
            <input 
              type="text"
              placeholder="Search mosques by name, city location, prayer schedules or capacity..."
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
        </div>

        {/* --- Mosques Grid --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-brand-charcoal/50">
              Showing <span className="font-bold text-brand-charcoal">{filteredMosques.length}</span> spiritual community beacons
            </p>
          </div>

          {filteredMosques.length === 0 ? (
            <div className="text-center bg-white rounded-3xl border border-brand-blue-accent/15 p-12 space-y-4">
              <p className="text-brand-charcoal/50 text-sm">
                No mosque matches your specific search terms.
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
              {filteredMosques.map((mosque) => (
                <div 
                  key={mosque.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-luxury border border-brand-blue-accent/15 flex flex-col justify-between group"
                >
                  {/* Cover Image */}
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={mosque.image} 
                      alt={mosque.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-6 right-6">
                      <span className="inline-flex items-center gap-1.5 bg-white/95 text-brand-blue-accent border border-brand-blue-accent/20 font-mono text-[9px] font-extrabold px-2.5 py-1 rounded-md shadow-md tracking-widest uppercase mb-1">
                        <MapPin className="w-3 h-3 text-brand-blue-accent" />
                        {mosque.location}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-white tracking-wide mt-1">
                        {mosque.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed font-sans">
                      {mosque.description}
                    </p>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 gap-3 bg-brand-lightbg border border-brand-blue-accent/15 p-4 rounded-2xl font-mono text-xs text-brand-charcoal/80">
                      <div className="space-y-1">
                        <span className="text-[9px] text-brand-blue-accent uppercase block">Jummah prayer</span>
                        <div className="flex items-center gap-1 text-brand-green font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{mosque.fridayPrayerTime}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-brand-blue-accent uppercase block">Capacity</span>
                        <div className="flex items-center gap-1 text-brand-green font-bold">
                          <Users className="w-3.5 h-3.5" />
                          <span>{mosque.capacity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nearby Dining Recommendations */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-brand-blue-accent tracking-wider uppercase font-bold">
                        Recommended Halal Dining Nearby
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mosque.nearbyRestaurants.map((restaurantName, idx) => (
                          <span 
                            key={idx}
                            className="text-[10px] font-mono bg-brand-green/5 border border-brand-green/10 text-brand-green px-2.5 py-1 rounded-lg font-bold"
                          >
                            {restaurantName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer action button */}
                    <div className="pt-4 border-t border-brand-blue-accent/10 flex justify-end">
                      <button 
                        onClick={() => onSelectItem(mosque)}
                        className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        Discover →
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
