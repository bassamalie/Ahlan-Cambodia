import React, { useState } from "react";
import { Send, FileText, Compass, DollarSign, Calculator, Calendar, CheckCircle, ShieldCheck } from "lucide-react";

export default function QuoteBuilder() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [destination, setDestination] = useState<string>("Siem Reap & Angkor Heritage");
  const [duration, setDuration] = useState<number>(5);
  const [guests, setGuests] = useState<number>(2);
  const [packageType, setPackageType] = useState<string>("luxury");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Estimates cost dynamically
  const getEstimatedCost = () => {
    let baseRatePerDay = 150; // highlights budget
    if (packageType === "luxury") baseRatePerDay = 450;
    else if (packageType === "heritage") baseRatePerDay = 220;
    
    return baseRatePerDay * duration * guests;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Please provide at least your Name and Email address.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div id="quote-builder-section" className="bg-white rounded-3xl border border-brand-blue-accent/20 shadow-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue-accent/5 rounded-full blur-3xl pointer-events-none" />

      {submitted ? (
        <div className="lg:col-span-12 py-16 text-center space-y-6 flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-brand-green/10 border border-brand-blue-accent/30 p-4 rounded-full text-brand-green">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div className="space-y-2 max-w-lg">
            <h3 className="text-3xl font-serif text-brand-charcoal font-bold">Inquiry Lodged Elegantly</h3>
            <p className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase">Reference: AHLAN-{Math.floor(100000 + Math.random() * 900000)}</p>
            <p className="text-brand-charcoal/80 text-sm leading-relaxed pt-2">
              Salam, <span className="font-bold text-brand-charcoal">{name}</span>. Your bespoke travel inquiry has been transmitted directly to our Lead Destination Architect at Ahlan Cambodia. A tailored, itemized proposal will be delivered to <span className="font-semibold text-brand-charcoal">{email}</span> within 4 hours.
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setName("");
              setEmail("");
              setPhone("");
              setSpecialRequests("");
            }}
            className="bg-brand-blue hover:bg-brand-blue-accent text-white font-mono text-xs font-bold tracking-widest uppercase py-3 px-6 rounded-xl transition-all border border-brand-blue-accent/30 shadow-md hover:shadow-lg"
          >
            Create New Proposal
          </button>
        </div>
      ) : (
        <>
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 mb-6">
              <h3 className="text-3xl font-serif text-brand-charcoal font-bold">Bespoke Price Architect</h3>
              <p className="text-xs text-brand-charcoal/60 leading-relaxed">Configure your dream itinerary parameters and receive a verified DMC proposal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">FullName *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Dr. Bassam Ali"
                    className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., guest@ahlan.com"
                    className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">Contact Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +60 12-345 6789"
                    className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">Selected Region</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                  >
                    <option value="Siem Reap & Angkor Heritage">Siem Reap & Angkor Heritage</option>
                    <option value="Phnom Penh Royal Gateway">Phnom Penh Royal Gateway</option>
                    <option value="Koh Rong White Beaches">Koh Rong White Beaches</option>
                    <option value="Complete Cambodia Discovery">Complete Cambodia Discovery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">Duration (Nights)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">Guest Count</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">Tier Package</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                  >
                    <option value="luxury">Elite Luxury Grandeur</option>
                    <option value="heritage">Heritage Highlights</option>
                    <option value="standard">Standard Customized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-brand-charcoal/60 mb-1.5 font-bold">Dietary & Mosque Preference / Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g., We require a child-seat in the private vehicle, strictly Muslim-owned Halal kitchens, and prayer stops scheduled inside beautiful historic Mosques."
                  rows={3}
                  className="w-full bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-brand-green text-brand-charcoal font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-blue hover:bg-brand-blue-accent text-white font-serif font-bold text-base py-3.5 rounded-xl border border-brand-blue-accent/30 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-brand-blue-accent" />
                <span>Transmit Bespoke Inquiry</span>
              </button>
            </form>
          </div>

          {/* Pricing Estimation Summary Side */}
          <div className="lg:col-span-5 bg-[#0F1626] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-brand-blue-accent/20 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--color-brand-blue-accent) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-blue-accent animate-pulse" />
                <h4 className="font-serif text-brand-blue-accent font-bold text-lg">Instant Estimator</h4>
              </div>

              <div className="space-y-3 font-mono text-xs text-white/80">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Hub:</span>
                  <span className="text-white font-bold max-w-[150px] truncate">{destination}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Duration:</span>
                  <span className="text-white font-bold">{duration} Nights</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Guests:</span>
                  <span className="text-white font-bold">{guests} Adults</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Selected Tier:</span>
                  <span className="text-brand-blue-accent font-bold capitalize">{packageType} Tier</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-brand-blue-accent/15 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-white/50 tracking-widest">ESTIMATED INVESTMENT</span>
                <p className="text-3xl font-serif text-brand-blue-accent font-bold">
                  ${getEstimatedCost().toLocaleString()}
                </p>
                <p className="text-[10px] text-white/40 font-mono">
                  *Excludes international flights. Taxes & VIP transfers included.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-white/70">
                <ShieldCheck className="w-4 h-4 text-brand-blue-accent shrink-0 mt-0.5" />
                <p className="leading-relaxed">As an official Cambodian Destination Management Company (DMC), we guarantee complete price parity and 100% verified Halal supply chain compliance.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
