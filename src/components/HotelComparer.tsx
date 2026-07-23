import React, { useState } from "react";
import { Check, Star, Trash2, HelpCircle, ShieldCheck, Landmark } from "lucide-react";
import { Hotel } from "../types";
import { hotels } from "../data";

interface HotelComparerProps {
  wishlistedHotelIds: string[];
  toggleWishlist: (id: string, category: string) => void;
}

export default function HotelComparer({ wishlistedHotelIds, toggleWishlist }: HotelComparerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert("You may select a maximum of 3 luxury hotels for comparative analysis.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedHotels = hotels.filter((h) => selectedIds.includes(h.id));

  return (
    <div className="bg-white rounded-3xl border border-brand-blue-accent/20 shadow-xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-blue-accent/10 pb-4">
        <div>
          <h3 className="text-xl font-serif text-brand-charcoal font-bold">Comparative Hotel Analyzer</h3>
          <p className="text-xs text-brand-charcoal/60 mt-0.5">Select up to 3 award-winning properties to evaluate halal credentials and pricing.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-brand-warmwhite p-1 rounded-xl border border-brand-blue-accent/10">
          {hotels.map((h) => {
            const isSelected = selectedIds.includes(h.id);
            return (
              <button
                key={h.id}
                onClick={() => handleToggleSelect(h.id)}
                className={`text-[11px] font-mono font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                  isSelected 
                    ? "bg-brand-blue text-white shadow-sm border border-brand-blue-accent/30" 
                    : "text-brand-charcoal/70 hover:bg-brand-blue/10"
                }`}
              >
                {isSelected ? "✓ " : ""}{h.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {selectedIds.length === 0 ? (
        <div className="py-12 text-center bg-brand-warmwhite/50 border border-dashed border-brand-blue-accent/30 rounded-2xl flex flex-col items-center justify-center space-y-2">
          <HelpCircle className="w-8 h-8 text-brand-blue-accent animate-bounce" />
          <p className="text-sm font-medium text-brand-charcoal/70">No hotels selected for comparison</p>
          <p className="text-xs text-brand-charcoal/50 max-w-xs">Click the hotel buttons above to view side-by-side comparisons of prayer mats, certified kitchens, and proximity to grand mosques.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-brand-blue-accent/20">
                <th className="py-4 font-mono uppercase text-[10px] text-brand-charcoal/40 tracking-wider w-1/4">Features</th>
                {selectedHotels.map((h) => (
                  <th key={h.id} className="py-4 px-4 font-serif text-brand-green font-bold text-base w-1/4">
                    <div className="flex flex-col space-y-1">
                      <span>{h.name}</span>
                      <span className="text-xs font-mono text-brand-blue-accent font-normal">{h.location.split(",")[1] || h.location}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue-accent/10 text-brand-charcoal/90">
              {/* Image & Price */}
              <tr>
                <td className="py-4 font-semibold text-brand-charcoal/70">Overview</td>
                {selectedHotels.map((h) => (
                  <td key={h.id} className="py-4 px-4">
                    <div className="space-y-2">
                      <img src={h.image} alt={h.name} className="w-full h-24 object-cover rounded-xl border border-brand-blue-accent/20" />
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-brand-green text-base">${h.price} <span className="text-[10px] font-sans font-normal text-brand-charcoal/60">/ night</span></span>
                        <div className="flex text-amber-500">
                          {[...Array(h.stars)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />)}
                        </div>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Prayer Facilities */}
              <tr>
                <td className="py-4 font-semibold text-brand-charcoal/70">In-Room Prayer Setup</td>
                {selectedHotels.map((h) => (
                  <td key={h.id} className="py-4 px-4 font-medium text-brand-charcoal">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      <span>{h.prayerFacilities}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Halal Culinary */}
              <tr>
                <td className="py-4 font-semibold text-brand-charcoal/70">Halal Breakfast</td>
                {selectedHotels.map((h) => (
                  <td key={h.id} className="py-4 px-4 font-medium text-brand-charcoal">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      <span>{h.halalBreakfast}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Proximity to Mosque */}
              <tr>
                <td className="py-4 font-semibold text-brand-charcoal/70">Nearby Mosque</td>
                {selectedHotels.map((h) => (
                  <td key={h.id} className="py-4 px-4 text-brand-charcoal/80">
                    <div className="flex items-start gap-2">
                      <Landmark className="w-4 h-4 text-brand-blue-accent shrink-0 mt-0.5" />
                      <span>{h.nearbyMosque}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr>
                <td className="py-4 font-semibold text-brand-charcoal/70">Property Ambience</td>
                {selectedHotels.map((h) => (
                  <td key={h.id} className="py-4 px-4 text-xs text-brand-charcoal/70 leading-relaxed italic">
                    "{h.description}"
                  </td>
                ))}
              </tr>

              {/* Action Actions */}
              <tr>
                <td className="py-4 font-semibold text-brand-charcoal/70">Actions</td>
                {selectedHotels.map((h) => {
                  const isWish = wishlistedHotelIds.includes(h.id);
                  return (
                    <td key={h.id} className="py-4 px-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => toggleWishlist(h.id, "hotels")}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold font-mono tracking-wider uppercase transition-all text-center flex items-center justify-center gap-1 border ${
                            isWish 
                              ? "bg-brand-blue text-white border-brand-blue shadow-sm" 
                              : "bg-white text-brand-charcoal border-brand-blue-accent/30 hover:bg-brand-blue/10"
                          }`}
                        >
                          <span>{isWish ? "Wishlisted" : "Wishlist"}</span>
                        </button>
                        <button
                          onClick={() => handleToggleSelect(h.id)}
                          className="p-2 text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 rounded-lg transition-all flex items-center justify-center"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
