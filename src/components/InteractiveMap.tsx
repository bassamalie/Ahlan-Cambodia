import React, { useState } from "react";
import { MapPin, Info, Compass, CheckCircle } from "lucide-react";
import { Destination } from "../types";
import { destinations } from "../data";

interface InteractiveMapProps {
  onSelectDestination: (dest: Destination) => void;
  selectedDestId?: string;
}

export default function InteractiveMap({ onSelectDestination, selectedDestId }: InteractiveMapProps) {
  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null);

  // SVG Coordinates mapped for a stylized Cambodia Map
  const mapPoints = [
    { id: "siem-reap", cx: "38%", cy: "30%", r: 8, color: "#0056B3", pulse: true },
    { id: "battambang", cx: "22%", cy: "42%", r: 6, color: "#032F6F", pulse: false },
    { id: "phnom-penh", cx: "58%", cy: "72%", r: 8, color: "#E01A22", pulse: true },
    { id: "kratie", cx: "78%", cy: "45%", r: 6, color: "#032F6F", pulse: false },
    { id: "kampot-kep", cx: "42%", cy: "88%", r: 6, color: "#0056B3", pulse: false },
    { id: "koh-rong", cx: "25%", cy: "85%", r: 8, color: "#032F6F", pulse: true },
  ];

  const getPointDetails = (id: string) => {
    return destinations.find((d) => d.id === id);
  };

  const selectedDestination = destinations.find((d) => d.id === selectedDestId) || destinations[0];

  return (
    <div id="interactive-map-section" className="bg-white rounded-3xl border border-brand-blue-accent/20 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Map Column */}
      <div className="lg:col-span-7 bg-brand-charcoal relative min-h-[350px] sm:min-h-[450px] p-6 flex flex-col justify-between overflow-hidden">
        {/* Ambient Map Grid lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #0056B3 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        
        {/* Corner Accents */}
        <div className="absolute top-4 left-4 text-[10px] font-mono tracking-widest text-brand-blue-accent/60 uppercase flex items-center gap-2">
          <Compass className="w-4 h-4 animate-spin-slow text-brand-blue-accent" />
          <span>Ahlan Cartography Engine v2.0</span>
        </div>
        <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white/40">
          *Interactive coordinates stylized for luxury navigation
        </div>
 
        {/* Map Canvas */}
        <div className="w-full h-full flex items-center justify-center relative my-auto">
          {/* Stylized Cambodia Shape (Abstracted Elegant SVG path) */}
          <svg viewBox="0 0 800 600" className="w-full max-w-[550px] h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <g fill="rgba(13, 92, 61, 0.12)" stroke="rgba(0, 86, 179, 0.4)" strokeWidth="1.5">
              {/* Outer boundary of Cambodia */}
              <path d="M 120 280 C 120 220, 200 120, 280 100 C 360 80, 480 90, 580 110 C 680 130, 720 180, 740 240 C 760 300, 710 400, 680 430 C 650 460, 560 450, 520 480 C 480 510, 420 540, 360 550 C 300 560, 240 530, 200 500 C 160 470, 130 420, 110 370 C 90 320, 120 340, 120 280 Z" />
              {/* Mekong River Line flowing through */}
              <path d="M 620 100 Q 580 200, 590 300 T 540 450 T 480 540" fill="none" stroke="rgba(0, 86, 179, 0.3)" strokeWidth="3" strokeDasharray="5,5" />
              {/* Tonle Sap Lake body */}
              <path d="M 320 260 Q 420 300, 480 340 Q 380 320, 320 260 Z" fill="rgba(0, 86, 179, 0.15)" stroke="rgba(0, 86, 179, 0.4)" strokeWidth="1" />
            </g>

            {/* Map Plot Points */}
            {mapPoints.map((point) => {
              const dest = getPointDetails(point.id);
              if (!dest) return null;
              const isSelected = selectedDestId === dest.id;
              const isHovered = hoveredDest?.id === dest.id;

              return (
                <g 
                  key={point.id}
                  className="cursor-pointer"
                  onClick={() => onSelectDestination(dest)}
                  onMouseEnter={() => setHoveredDest(dest)}
                  onMouseLeave={() => setHoveredDest(null)}
                >
                  {/* Pulse Ring */}
                  {(point.pulse || isSelected || isHovered) && (
                    <circle
                      cx={point.cx}
                      cy={point.cy}
                      r={point.r * 2.5}
                      fill="none"
                      stroke={point.color}
                      className="animate-ping opacity-30"
                      style={{ animationDuration: "3s" }}
                    />
                  )}
                  {/* Outer circle target */}
                  <circle
                    cx={point.cx}
                    cy={point.cy}
                    r={isSelected || isHovered ? point.r * 1.5 : point.r}
                    fill={isSelected ? "#F4F7FB" : point.color}
                    stroke={isSelected ? point.color : "#F4F7FB"}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-300 shadow"
                  />
                  {/* Text Label */}
                  <text
                    x={point.cx}
                    y={point.cy}
                    dy="-18"
                    textAnchor="middle"
                    className={`font-sans text-[12px] font-semibold tracking-wide transition-all duration-300 ${
                      isSelected 
                        ? "fill-brand-blue-accent font-bold scale-110" 
                        : isHovered 
                          ? "fill-white" 
                          : "fill-white/70"
                    }`}
                  >
                    {dest.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover info box overlay */}
        <div className="absolute top-16 right-4 max-w-[220px] transition-all duration-500">
          {hoveredDest ? (
            <div className="bg-brand-charcoal/90 border border-brand-blue-accent/30 backdrop-blur rounded-xl p-3 text-white text-xs shadow-xl animate-fade-in">
              <p className="font-serif text-brand-blue-accent font-semibold text-sm mb-1">{hoveredDest.name}</p>
              <p className="text-white/80 line-clamp-2 leading-relaxed">{hoveredDest.description}</p>
              <div className="mt-2 flex items-center gap-1 text-brand-blue-accent font-mono text-[10px]">
                <MapPin className="w-3 h-3" />
                <span>{hoveredDest.region}</span>
              </div>
            </div>
          ) : (
            <div className="hidden sm:block bg-brand-green/20 border border-brand-blue-accent/20 backdrop-blur rounded-xl p-3 text-white/80 text-xs">
              <p className="font-serif text-brand-blue-accent font-semibold mb-1">Click a Location Anchor</p>
              <p className="text-[11px] leading-relaxed">Explore key destinations, mosques, and halal-certified luxury hotspots.</p>
            </div>
          )}
        </div>
      </div>

      {/* Information Details Column */}
      <div className="lg:col-span-5 p-8 flex flex-col justify-between bg-brand-warmwhite">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-brand-green/10 text-brand-green text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border border-brand-green/20">
              Selected Destination
            </span>
          </div>

          <h3 className="text-3xl font-serif text-brand-charcoal leading-tight mb-2">
            {selectedDestination.name}
          </h3>
          <p className="text-xs font-mono text-brand-blue-accent tracking-wide uppercase mb-4 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {selectedDestination.region}
          </p>

          <p className="text-brand-charcoal/80 text-sm leading-relaxed mb-6">
            {selectedDestination.description}
          </p>

          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-mono tracking-wider uppercase text-brand-charcoal/50">
              Halal & Muslim Friendly Highlights
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {selectedDestination.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2.5 text-sm text-brand-charcoal">
                  <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
                  <span className="font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-blue-accent/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-xs text-brand-charcoal/60">
            Want a fully bespoke Muslim itinerary for <span className="font-bold text-brand-charcoal">{selectedDestination.name}</span>?
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById("ai-trip-planner-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-brand-green hover:bg-brand-green/90 text-white text-xs font-semibold tracking-wider uppercase py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
          >
            <span>Launch Planner</span>
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
