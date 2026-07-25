import React from "react";
import { CreditCard, ExternalLink } from "lucide-react";

interface WiseTravelCardProps {
  id?: string;
  className?: string;
}

export const WiseTravelCard: React.FC<WiseTravelCardProps> = ({
  id = "btn-wise-sidebar",
  className = ""
}) => {
  return (
    <div className={`bg-[#00382B] text-white rounded-[28px] p-6 shadow-xl border border-[#004D3B]/40 space-y-5 relative overflow-hidden ${className}`}>
      {/* Top Header Row */}
      <div className="flex items-center gap-3.5">
        {/* Icon Squircle */}
        <div className="w-12 h-12 rounded-[18px] bg-[#00C9A7] flex items-center justify-center text-white shadow-sm shrink-0">
          <CreditCard className="w-6 h-6 text-white stroke-[2]" />
        </div>

        {/* Text Header */}
        <div className="space-y-0.5">
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#00C9A7] block leading-none">
            TRAVEL ESSENTIAL
          </span>
          <h4 className="font-sans font-bold text-lg sm:text-xl text-white tracking-wide leading-tight">
            WISE TRAVEL CARD
          </h4>
        </div>
      </div>

      {/* Description Body */}
      <p className="text-xs sm:text-[13px] text-[#D0E2DD] leading-relaxed font-sans font-normal">
        Pay effortlessly in Cambodian Riel and USD with low transparent fees and real exchange rates.
      </p>

      {/* CTA Button */}
      <a
        href="https://wise.prf.hn/click/camref:1011l4i5gZ"
        target="_blank"
        rel="nofollow sponsored noopener"
        id={id}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#00C9A7] hover:bg-[#00B596] text-white font-sans font-bold text-sm sm:text-base py-3.5 px-5 rounded-[18px] transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-center cursor-pointer"
      >
        <span>Get Your Wise Travel Card</span>
        <ExternalLink className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
      </a>
    </div>
  );
};

export default WiseTravelCard;
