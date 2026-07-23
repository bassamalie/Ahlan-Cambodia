import React, { useState, useMemo } from "react";
import { 
  BookOpen, Search, ArrowLeft, SlidersHorizontal, Clock, Calendar, Sparkles, ArrowRight 
} from "lucide-react";
import { TravelGuide } from "../types";

interface InspirationPageProps {
  travelGuides: TravelGuide[];
  onSelectItem: (guide: TravelGuide) => void;
  onBack: () => void;
}

export default function InspirationPage({
  travelGuides,
  onSelectItem,
  onBack
}: InspirationPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"latest" | "title">("latest");

  // Extract all unique categories for filter tabs
  const categories = useMemo(() => {
    const allCategories = travelGuides.map(g => g.category);
    return ["All", ...Array.from(new Set(allCategories))];
  }, [travelGuides]);

  // Filter and sort blogposts
  const filteredAndSortedGuides = useMemo(() => {
    let result = travelGuides.filter(guide => {
      const matchesSearch = 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || guide.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // By default/latest, sort by date descending (our dates are like July 12, 2026, we can parse or use original order since original is newest first)
      // Since original data order is latest first, keeping it as is or reverse if needed, or simply date comparisons
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [travelGuides, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="w-full bg-white min-h-screen animate-fade-in">
      
      {/* --- Majestic Title Header - Full Width --- */}
      <div className="relative bg-[#0F1626] text-white py-8 sm:py-12 overflow-hidden shadow-xl border-b border-brand-blue-accent/25 min-h-[280px] sm:min-h-[320px] flex flex-col justify-center">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--color-brand-blue-accent) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Decorative radial lighting */}
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
              <span>Home</span> &nbsp;/&nbsp; <span className="text-brand-blue-accent font-bold">Inspiration</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              TRAVEL INSPIRATION
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
              Carefully researched articles, insider perspectives, and practical travel chronicles to prepare your luxury journey to Cambodia. Explore Islamic history, culinary bibles, and visa pathways.
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
                placeholder="Search blogposts by title, category, or article content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-warmwhite/50 border border-brand-blue-accent/20 rounded-xl py-3.5 pl-11 pr-10 text-xs sm:text-sm outline-none focus:border-brand-blue-accent text-brand-charcoal placeholder-brand-charcoal/40 font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-[10px] font-mono font-bold bg-brand-blue/10 text-brand-blue hover:bg-brand-blue-accent hover:text-white transition-all cursor-pointer border border-brand-blue-accent/10 hover:border-brand-blue-accent/30 px-3 py-1.5 rounded-lg uppercase tracking-wider"
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
                  onChange={(e) => setSortBy(e.target.value as "latest" | "title")}
                  className="bg-transparent border-none outline-none font-bold text-brand-charcoal text-xs cursor-pointer"
                >
                  <option value="latest">Latest Published</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-brand-blue-accent/10">
            <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-wider mr-2 shrink-0">Categories:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border cursor-pointer ${
                  selectedCategory === category
                    ? "bg-brand-blue text-white border-brand-blue-accent/30 shadow-md"
                    : "bg-brand-lightbg text-brand-charcoal/70 hover:bg-brand-blue/10 hover:text-brand-blue border-brand-blue-accent/10"
                }`}
              >
                {category === "All" ? "All Stories" : category}
              </button>
            ))}
          </div>

        </div>

        {/* --- Blogpost Grid --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-brand-charcoal/50">
              Showing <span className="font-bold text-brand-charcoal">{filteredAndSortedGuides.length}</span> inspiration articles matching criteria
            </p>
          </div>

          {filteredAndSortedGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredAndSortedGuides.map((guide) => (
                <article 
                  key={guide.id}
                  className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm flex flex-col justify-between hover:border-brand-blue-accent transition-all group hover:shadow-md h-full"
                >
                  <div className="relative overflow-hidden h-48 sm:h-52 shrink-0">
                    <img 
                      src={guide.image} 
                      alt={guide.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="bg-cambodia-red text-white text-[9px] font-mono font-bold uppercase px-3 py-1 rounded-lg border border-white/10 shadow-sm shrink-0">
                        {guide.category}
                      </span>
                      {guide.destinationId && guide.destinationId !== "general" && (
                        <span className="bg-brand-blue/90 text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg border border-white/20 shadow-sm backdrop-blur-sm capitalize truncate max-w-[140px]">
                          📍 {guide.destinationId.replace(/-/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-brand-charcoal/50">
                        <span className="flex items-center gap-1 font-bold text-brand-blue-accent uppercase">
                          <Clock className="w-3 h-3 text-brand-blue-accent" />
                          {guide.readTime}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal group-hover:text-brand-blue-accent transition-colors leading-snug">
                        {guide.title}
                      </h3>
                      
                      <p className="text-brand-charcoal/70 text-xs sm:text-sm leading-relaxed font-sans">
                        {guide.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-brand-blue-accent font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-brand-blue-accent shrink-0" />
                        Ahlan Editorial
                      </span>
                      
                      <button
                        onClick={() => onSelectItem(guide)}
                        className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        Read Story →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-lightbg rounded-3xl border border-dashed border-brand-blue-accent/20 space-y-3">
              <BookOpen className="w-12 h-12 text-brand-blue-accent/40 mx-auto animate-bounce" />
              <h3 className="font-serif font-bold text-lg text-brand-charcoal">No Chronicles Found</h3>
              <p className="text-brand-charcoal/60 text-xs sm:text-sm max-w-md mx-auto">
                No articles matched your search query "{searchQuery}". Try searching for categories like "Culinary", "Visa", or "Halal".
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-2 text-xs font-mono text-brand-blue hover:text-brand-blue-accent font-bold uppercase tracking-wider underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
