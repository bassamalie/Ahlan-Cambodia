import React from "react";
import { CloudSun, CloudRain, Sun, Wind, DollarSign, Clock, Phone, Globe, ShieldCheck } from "lucide-react";

export interface SeasonInfo {
  name: string;
  months: string;
  avgTemp: string;
  tagline: string;
  icon: React.ReactNode;
}

const seasonsData: SeasonInfo[] = [
  {
    name: "SPRING",
    months: "MAR - JUN",
    avgTemp: "30°C / 86°F",
    tagline: "Warm & Sunny",
    icon: <CloudSun className="w-10 h-10 text-slate-700 stroke-[1.5]" />
  },
  {
    name: "SUMMER",
    months: "JUN - SEPT",
    avgTemp: "23°C / 73°F",
    tagline: "Green Monsoon",
    icon: <CloudRain className="w-10 h-10 text-slate-700 stroke-[1.5]" />
  },
  {
    name: "AUTUMN",
    months: "OCT - DEC",
    avgTemp: "28°C / 82°F",
    tagline: "Tropical Breeze",
    icon: <CloudSun className="w-10 h-10 text-slate-700 stroke-[1.5]" />
  },
  {
    name: "WINTER",
    months: "DEC - FEB",
    avgTemp: "25°C / 77°F",
    tagline: "Cool Peak Season",
    icon: <Sun className="w-10 h-10 text-slate-700 stroke-[1.5]" />
  }
];

export const CambodiaEssentialInfo: React.FC = () => {
  return (
    <section className="w-full bg-[#f0f4f9] py-16 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold tracking-wider uppercase">
            WEATHER & TRAVEL ESSENTIALS
          </h2>
          <p className="text-brand-charcoal/70 text-xs sm:text-sm leading-relaxed font-sans">
            Seasonal weather patterns, standard time, official currency, and essential travel details to help you prepare your luxury journey.
          </p>
        </div>

        {/* 4 Seasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {seasonsData.map((season) => (
            <div 
              key={season.name} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-brand-blue-accent/40 transition-all duration-300 group"
            >
              {/* Season Icon Box */}
              <div className="w-20 h-20 shrink-0 bg-[#e8f1fa] rounded-xl flex items-center justify-center border border-[#d2e2f3] group-hover:bg-[#dbe9f8] transition-colors">
                {season.icon}
              </div>

              {/* Season Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-serif font-bold text-lg text-brand-charcoal tracking-wider uppercase leading-none">
                  {season.name}
                </h3>
                
                <div className="text-[11px] font-mono font-bold text-slate-500 border-b border-slate-200/80 pb-1.5 uppercase tracking-wide">
                  {season.months}
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 font-sans block leading-none">avg. temp:</span>
                  <span className="text-sm font-serif font-bold text-brand-charcoal">
                    {season.avgTemp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Essential Travel Info Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {/* Currency Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center space-y-1 shadow-sm hover:border-brand-blue-accent/30 transition-all">
            <span className="text-xs font-sans text-slate-500 block">Currency</span>
            <span className="font-serif font-bold text-base text-brand-charcoal block">
              Cambodian riel (KHR) <span className="text-xs text-slate-400 font-sans font-normal">& USD</span>
            </span>
          </div>

          {/* Time Difference Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center space-y-1 shadow-sm hover:border-brand-blue-accent/30 transition-all">
            <span className="text-xs font-sans text-slate-500 block">Time Difference</span>
            <span className="font-serif font-bold text-base text-brand-charcoal block">
              GMT +7 <span className="text-xs text-slate-400 font-sans font-normal">(ICT)</span>
            </span>
          </div>

          {/* Country Code Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center space-y-1 shadow-sm hover:border-brand-blue-accent/30 transition-all">
            <span className="text-xs font-sans text-slate-500 block">Country Code</span>
            <span className="font-serif font-bold text-base text-brand-charcoal block">
              +855
            </span>
          </div>

          {/* Language Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center space-y-1 shadow-sm hover:border-brand-blue-accent/30 transition-all">
            <span className="text-xs font-sans text-slate-500 block">Primary Language</span>
            <span className="font-serif font-bold text-base text-brand-charcoal block">
              Khmer <span className="text-xs text-slate-400 font-sans font-normal">(English widely used)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CambodiaEssentialInfo;
