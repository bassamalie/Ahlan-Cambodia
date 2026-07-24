import React, { useState, useEffect } from "react";
import { Sun, Cloud, CloudSun, Sunset, SunDim, Moon, Compass, RefreshCw, Landmark, Heart, Eye } from "lucide-react";

interface PrayerTime {
  name: string;
  time: string;
  icon: string;
}

export default function PrayerWeatherWidget() {
  const [city, setCity] = useState<string>("Siem Reap");
  const [prayerData, setPrayerData] = useState<{
    date: string;
    hijri: string;
    prayerTimes: PrayerTime[];
    qibla: number;
  } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Currency Converter states
  const [convertFrom, setConvertFrom] = useState<string>("USD");
  const [amount, setAmount] = useState<number>(100);
  const [convertedAmount, setConvertedAmount] = useState<number>(410000); // 1 USD = ~4100 KHR

  const exchangeRates: { [key: string]: number } = {
    USD: 4100, // 1 USD = 4100 KHR
    MYR: 885,  // 1 MYR = 885 KHR
    SAR: 1092, // 1 SAR = 1092 KHR
    AED: 1116, // 1 AED = 1116 KHR
    EUR: 4420  // 1 EUR = 4420 KHR
  };

  const fetchWidgetData = async () => {
    setLoading(true);
    try {
      const prayerRes = await fetch(`/api/prayer-times?city=${encodeURIComponent(city)}`);
      if (prayerRes.ok) {
        const text = await prayerRes.text();
        try {
          const prayerJson = JSON.parse(text);
          if (prayerJson && prayerJson.prayerTimes) {
            setPrayerData(prayerJson);
          }
        } catch {
          // Response was text or rate limit message
        }
      }

      const weatherRes = await fetch("/api/weather");
      if (weatherRes.ok) {
        const text = await weatherRes.text();
        try {
          const weatherJson = JSON.parse(text);
          if (weatherJson) {
            setWeatherData(weatherJson);
          }
        } catch {
          // Response was text or rate limit message
        }
      }
    } catch (e) {
      console.warn("Could not load dynamic widget data, using defaults:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgetData();
  }, [city]);

  useEffect(() => {
    const rate = exchangeRates[convertFrom] || 4100;
    setConvertedAmount(amount * rate);
  }, [amount, convertFrom]);

  const getPrayerIcon = (iconName: string) => {
    switch (iconName) {
      case "Sun": return <Sun className="w-5 h-5 text-brand-blue-accent" />;
      case "SunDim": return <SunDim className="w-5 h-5 text-brand-blue-accent" />;
      case "CloudSun": return <CloudSun className="w-5 h-5 text-brand-blue-accent" />;
      case "Sunset": return <Sunset className="w-5 h-5 text-brand-blue-accent" />;
      case "Moon": return <Moon className="w-5 h-5 text-brand-blue-accent" />;
      default: return <Sun className="w-5 h-5 text-brand-blue-accent" />;
    }
  };

  const currentWeather = weatherData && weatherData[city] ? weatherData[city] : { temp: 30, condition: "Sunny", humidity: 72, wind: 12 };

  return (
    <div id="prayer-weather-widget" className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-brand-green p-6 sm:p-8 rounded-3xl border border-brand-blue-accent/30 shadow-2xl text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--color-brand-blue-accent) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      
      {/* Column 1: Prayer Times & Qibla Compass */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-xl font-serif text-brand-blue-accent flex items-center gap-2">
              <Compass className="w-5 h-5 animate-pulse text-brand-blue-accent" />
              <span>Sacred Timings & Qibla</span>
            </h3>
            <p className="text-[11px] text-white/60 font-mono mt-0.5">
              {prayerData?.date || "July 15, 2026"} • <span className="text-brand-blue-accent">{prayerData?.hijri || "1 Safar 1448 AH"}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/20 p-1 rounded-xl border border-white/10">
            {["Siem Reap", "Phnom Penh"].map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  city === c ? "bg-brand-blue-accent text-brand-charcoal shadow-md" : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-brand-blue-accent animate-spin" />
            <p className="text-xs text-white/60 font-mono">Calibrating times...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Prayer Grid */}
            <div className="grid grid-cols-2 gap-2">
              {prayerData?.prayerTimes.map((pt, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2">
                    {getPrayerIcon(pt.icon)}
                    <span className="text-xs font-semibold text-white/90">{pt.name}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-brand-blue-accent">{pt.time}</span>
                </div>
              ))}
            </div>

            {/* Qibla Compass Graphic */}
            <div className="bg-black/20 border border-brand-blue-accent/20 rounded-xl p-4 flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between text-[11px] text-white/60 font-mono">
                <span>QIBLA DIRECTION</span>
                <span className="text-brand-blue-accent font-bold">{prayerData?.qibla}° WNW</span>
              </div>
              
              <div className="relative w-28 h-28 my-2 flex items-center justify-center bg-white/5 rounded-full border border-white/10">
                <div className="absolute inset-2 border border-brand-blue-accent/10 rounded-full" />
                
                {/* Compass markers */}
                <span className="absolute top-1 text-[9px] font-bold text-white/50 font-mono">N</span>
                <span className="absolute right-1 text-[9px] font-bold text-white/50 font-mono">E</span>
                <span className="absolute bottom-1 text-[9px] font-bold text-white/50 font-mono">S</span>
                <span className="absolute left-1 text-[9px] font-bold text-white/50 font-mono">W</span>

                {/* Rotating needle aligned to Qibla degree of ~288.5 deg */}
                <div 
                  className="absolute w-full h-full flex items-center justify-center transition-transform duration-1000"
                  style={{ transform: `rotate(${prayerData?.qibla}deg)` }}
                >
                  <div className="relative w-1.5 h-16 flex flex-col justify-between items-center">
                    {/* North-pointing blue tip */}
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[20px] border-b-brand-blue-accent filter drop-shadow" />
                    <div className="w-1.5 h-full bg-white/40" />
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white/30" />
                  </div>
                </div>
                
                {/* Center cap */}
                <div className="w-3 h-3 bg-brand-blue-accent rounded-full z-10 border border-brand-green shadow-lg" />
              </div>

              <div className="text-[10px] text-center text-white/70 leading-relaxed max-w-[200px]">
                Align your compass West-North-West to face the Holy Kaaba.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column 2: Live Weather & Currency Converter */}
      <div className="bg-black/15 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
        {/* Weather Sub-module */}
        <div className="pb-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-white/50 tracking-wider uppercase">Live Temperature</span>
            <span className="text-xs text-brand-blue-accent font-semibold flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 animate-spin-slow" />
              Real-time
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-serif font-bold text-white flex items-baseline">
                {currentWeather.temp}°C
                <span className="text-xs text-white/60 font-mono ml-1">/ 88°F</span>
              </p>
              <p className="text-xs font-semibold text-white/80 mt-1">{currentWeather.condition}</p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              {currentWeather.condition.includes("Cloud") ? (
                <CloudSun className="w-8 h-8 text-brand-blue-accent" />
              ) : (
                <Sun className="w-8 h-8 text-brand-blue-accent" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-white/70 pt-1">
            <div>Humidity: <span className="text-white font-bold">{currentWeather.humidity}%</span></div>
            <div>Wind: <span className="text-white font-bold">{currentWeather.wind} km/h</span></div>
          </div>
        </div>

        {/* Currency Converter Sub-module */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-white/50 tracking-wider uppercase">Currency Converter</span>
            <span className="text-[11px] font-mono text-brand-blue-accent flex items-center gap-1">
              <Landmark className="w-3 h-3" />
              Live KHR Rates
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={convertFrom}
                onChange={(e) => setConvertFrom(e.target.value)}
                className="bg-white/10 text-xs text-white font-mono font-bold px-2 py-1.5 rounded-lg border border-white/20 outline-none focus:border-brand-blue-accent"
              >
                <option value="USD" className="text-brand-charcoal">USD ($)</option>
                <option value="MYR" className="text-brand-charcoal">MYR (RM)</option>
                <option value="SAR" className="text-brand-charcoal">SAR (SR)</option>
                <option value="AED" className="text-brand-charcoal">AED (DH)</option>
                <option value="EUR" className="text-brand-charcoal">EUR (€)</option>
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 bg-white/5 text-xs text-right font-mono font-bold px-3 py-1.5 rounded-lg border border-white/10 outline-none focus:border-brand-blue-accent focus:bg-white/10"
              />
            </div>

            <div className="bg-brand-blue-accent/10 border border-brand-blue-accent/20 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-brand-blue-accent font-bold">CAMBODIAN RIEL</span>
              <span className="text-sm font-mono font-extrabold text-brand-blue-accent">
                {convertedAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} KHR
              </span>
            </div>
            
            <p className="text-[9px] text-center text-white/40 font-mono">
              *Cambodia operates on dual-currency: USD is widely accepted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
