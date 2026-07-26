import React, { useState, useMemo, useEffect } from "react";
import { 
  Compass, Heart, Search, ArrowLeft, SlidersHorizontal, MapPin, Sparkles, Clock, Tag, Globe, ExternalLink, ShieldCheck, Loader2
} from "lucide-react";
import { Experience } from "../types";
import { optimizeCardImageUrl } from "../googlePlacesPhotoService";

interface ExperiencesPageProps {
  experiences: Experience[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onSelectItem: (exp: Experience) => void;
  onBack: () => void;
}

export default function ExperiencesPage({
  experiences,
  wishlist,
  onToggleWishlist,
  onSelectItem,
  onBack
}: ExperiencesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "duration">("name");

  // Viator integration state
  const [viatorActivities, setViatorActivities] = useState<Experience[]>([]);
  const [viatorConfigured, setViatorConfigured] = useState<boolean | null>(null);
  const [viatorEnv, setViatorEnv] = useState<string>("sandbox");
  const [loadingViator, setLoadingViator] = useState<boolean>(false);
  const [viatorError, setViatorError] = useState<string | null>(null);
  const [viatorErrorDetails, setViatorErrorDetails] = useState<string | null>(null);
  const [showViatorOnly, setShowViatorOnly] = useState<boolean>(false);

  // Pagination state
  const [startIndex, setStartIndex] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Fetch live Viator activities with pagination support and sessionStorage caching for instant performance
  const fetchViatorActivities = (start = 1, isLoadMore = false) => {
    // Check client sessionStorage cache for instant loading on initial render
    if (!isLoadMore && start === 1) {
      try {
        const cachedStr = sessionStorage.getItem("viator_activities_cache");
        if (cachedStr) {
          const cachedData = JSON.parse(cachedStr);
          if (Array.isArray(cachedData.activities) && cachedData.activities.length > 0) {
            setViatorActivities(cachedData.activities);
            setViatorConfigured(true);
            setViatorEnv(cachedData.environment || "production");
          }
        }
      } catch (e) {
        // Ignore cache parse errors
      }
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoadingViator(true);
    }
    setViatorError(null);
    setViatorErrorDetails(null);

    fetch(`/api/viator/activities?start=${start}&count=12`)
      .then(async (res) => {
        console.log("[Viator Browser Console] API Proxy Response Status:", res.status);
        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text || "Rate limit or invalid JSON response." };
        }
        console.log("[Viator Browser Console] Response Body:", data);
        if (data.rawViatorResponse) {
          console.log("[Viator Browser Console] Raw Viator JSON Response:", data.rawViatorResponse);
        }
        return data;
      })
      .then((data) => {
        if (data.configured) {
          setViatorConfigured(true);
          setViatorEnv(data.environment || "production");
          setStartIndex(data.start || start);
          setHasMore(data.hasMore ?? (Array.isArray(data.activities) && data.activities.length >= 12));

          if (data.error) {
            setViatorError(data.error);
            setViatorErrorDetails(data.details || null);
            if (!isLoadMore) setViatorActivities([]);
          } else if (Array.isArray(data.activities)) {
            if (isLoadMore) {
              setViatorActivities(prev => {
                const existingIds = new Set(prev.map(item => item.id));
                const newItems = data.activities.filter((item: Experience) => !existingIds.has(item.id));
                const updated = [...prev, ...newItems];
                try {
                  sessionStorage.setItem("viator_activities_cache", JSON.stringify({ activities: updated, environment: data.environment }));
                } catch (e) {}
                return updated;
              });
            } else {
              setViatorActivities(data.activities);
              try {
                sessionStorage.setItem("viator_activities_cache", JSON.stringify({ activities: data.activities, environment: data.environment }));
              } catch (e) {}
            }
          }
        } else {
          setViatorConfigured(false);
        }
      })
      .catch((err) => {
        console.error("Failed to check Viator activities:", err);
        setViatorError("Network error attempting to reach Viator proxy endpoint.");
      })
      .finally(() => {
        setLoadingViator(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    fetchViatorActivities(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextStart = startIndex + 12;
    fetchViatorActivities(nextStart, true);
  };

  // Combined dataset
  const combinedExperiences = useMemo(() => {
    if (showViatorOnly) {
      return viatorActivities;
    }
    return [...experiences, ...viatorActivities];
  }, [experiences, viatorActivities, showViatorOnly]);

  // Unique categories
  const categories = useMemo(() => {
    return ["All", "Heritage", "Nature", "Culture", "Adventure"];
  }, []);

  // Filter and sort experiences
  const filteredAndSortedExperiences = useMemo(() => {
    let result = combinedExperiences.filter(exp => {
      const matchesSearch = 
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.shortDescription && exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exp.highlights && exp.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === "All" || exp.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "duration") {
      result.sort((a, b) => a.duration.localeCompare(b.duration));
    }

    return result;
  }, [combinedExperiences, searchQuery, selectedCategory, sortBy]);

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
              <span>Home</span> &nbsp;/&nbsp; <span className="text-brand-blue-accent font-bold">Experiences</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              KHMER EXPERIENCES
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
              Immerse yourself in carefully designed signature day excursions highlighting Cambodia's ancient civilizations, dramatic natural waterways, traditional crafts, and majestic Cham Muslim heritage.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* --- Viator Integration Info & Status Bar --- */}
        <div className="bg-[#0F1626] text-white p-5 rounded-3xl border border-brand-blue-accent/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2.5 bg-brand-blue-accent/20 rounded-2xl border border-brand-blue-accent/40 text-brand-blue-accent shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Viator Partner API Integration
                </h4>
                {viatorError ? (
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase">
                    {viatorError.includes("400") 
                      ? "400 BAD REQUEST" 
                      : viatorError.includes("403") 
                      ? "403 FORBIDDEN" 
                      : viatorError.includes("429") 
                      ? "429 RATE LIMITED" 
                      : "API ERROR"}
                  </span>
                ) : viatorConfigured ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase">
                    Live ({viatorEnv})
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase">
                    Ready to Connect
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 max-w-2xl font-sans leading-relaxed">
                {viatorError ? (
                  <span className="text-rose-200 block space-y-1">
                    <span><strong>Status:</strong> {viatorError}</span>
                  </span>
                ) : viatorConfigured ? (
                  `Successfully connected! Showing ${viatorActivities.length} live activity listing(s) fetched directly from Viator Partner API.`
                ) : (
                  "Your backend is fully equipped with the Viator Partner API proxy. Add your VIATOR_API_KEY in environment variables to dynamically stream live Cambodia activities."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {viatorError && (
              <button
                onClick={fetchViatorActivities}
                disabled={loadingViator}
                className="text-xs font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold uppercase tracking-wider"
              >
                {loadingViator ? "Retrying..." : "Retry Connection"}
              </button>
            )}

            {viatorConfigured && viatorActivities.length > 0 && (
              <button
                onClick={() => setShowViatorOnly(!showViatorOnly)}
                className={`text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  showViatorOnly 
                    ? "bg-brand-blue-accent text-white border-white/20 shadow-md"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                }`}
              >
                {showViatorOnly ? "Showing Viator Only ✓" : "Filter Viator Live Items"}
              </button>
            )}
          </div>
        </div>

        {/* --- Viator API Troubleshooting Helper Card --- */}
        {viatorError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-amber-900 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Viator API Integration Checklist:</span>
            </div>
            <ul className="text-xs text-amber-900/90 space-y-2 list-disc list-inside font-sans leading-relaxed">
              <li>
                <strong>Header Name:</strong> The key MUST be passed using header <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">exp-api-key</code> (not <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">api-key</code>, <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">Authorization</code>, or URL params).
              </li>
              <li>
                <strong>Base URL Match:</strong> Sandbox keys (e.g. starting with <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">296B</code>) use <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">https://api.sandbox.viator.com/partner/</code>. Production keys (e.g. starting with <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">086F</code>) use <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">https://api.viator.com/partner/</code>.
              </li>
              <li>
                <strong>Required Headers:</strong> Must include <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">Accept: application/json</code> and <code className="bg-amber-200/60 text-amber-950 px-1 py-0.5 rounded font-mono">Content-Type: application/json</code>.
              </li>
              <li>
                <strong>Endpoint Permissions:</strong> Catalog search uses Basic Access. Booking/hold endpoints require Full Access or Booking Access permissions in the Viator Partner Portal.
              </li>
            </ul>

            {viatorErrorDetails && (
              <div className="mt-3 pt-3 border-t border-amber-500/20">
                <p className="text-[11px] font-bold text-amber-900 mb-1">Viator API Error Response Body:</p>
                <pre className="bg-amber-950/90 text-amber-200 p-2.5 rounded-xl text-[10px] font-mono whitespace-pre-wrap overflow-x-auto max-h-40 border border-amber-800/40">
                  {viatorErrorDetails}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* --- Search, Filter & Sort Bar --- */}
        <div className="bg-white p-5 rounded-3xl border border-brand-blue-accent/15 shadow-sm space-y-4">
          
          {/* Live Search and Sort Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-brand-blue-accent" />
              <input 
                type="text"
                placeholder="Search experiences by name, location, or keywords (e.g. sunrise, weaving, eco-tour)..."
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
                  onChange={(e) => setSortBy(e.target.value as "name" | "duration")}
                  className="bg-transparent border-none outline-none font-bold text-brand-charcoal text-xs cursor-pointer"
                >
                  <option value="name">Alphabetical (A-Z)</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-brand-blue-accent/10">
            <span className="text-[10px] font-mono text-brand-charcoal/50 uppercase tracking-wider mr-2 shrink-0">Categories:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-brand-blue text-white border-brand-blue-accent/30 shadow-md"
                    : "bg-brand-lightbg text-brand-charcoal/70 hover:bg-brand-blue/10 hover:text-brand-blue border-brand-blue-accent/10"
                }`}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>

        </div>

        {/* --- Experience Grid --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-brand-charcoal/50">
              Showing <span className="font-bold text-brand-charcoal">{filteredAndSortedExperiences.length}</span> luxury experiences matching filters
            </p>
          </div>

          {loadingViator && filteredAndSortedExperiences.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-brand-blue-accent/15 animate-pulse shadow-sm flex flex-col">
                  <div className="w-full h-64 bg-slate-200" />
                  <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-6 bg-slate-200 rounded w-3/4" />
                      <div className="h-3.5 bg-slate-200 rounded w-full" />
                      <div className="h-3.5 bg-slate-200 rounded w-5/6" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-8 bg-slate-200 rounded-xl w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedExperiences.length === 0 ? (
            <div className="text-center bg-white rounded-3xl border border-brand-blue-accent/15 p-12 space-y-4">
              <p className="text-brand-charcoal/50 text-sm">
                No luxury experiences match your specific search criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="text-xs font-mono text-brand-charcoal font-bold uppercase tracking-wider underline cursor-pointer hover:text-brand-blue-accent"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedExperiences.map((exp) => {
                const isSaved = wishlist.includes(exp.id);
                
                return (
                  <div 
                    key={exp.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] hover:border-brand-blue-accent transition-luxury flex flex-col border border-brand-blue-accent/15"
                  >
                    {/* Cover image with category badge */}
                    <div className="relative w-full h-64 overflow-hidden bg-slate-100">
                      <img 
                        src={optimizeCardImageUrl(exp.image, 800)} 
                        alt={exp.name} 
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent" />
                      
                      {/* Floating Category Tag */}
                      <div className="absolute top-4 left-4 flex flex-col gap-1 items-start">
                        <div className={`backdrop-blur-sm px-3.5 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest text-white shadow-md border border-white/10 ${
                          exp.category.toLowerCase() === "heritage" || exp.category.toLowerCase() === "nature"
                            ? "bg-brand-blue-accent"
                            : "bg-cambodia-red"
                        }`}>
                          {exp.category}
                        </div>
                        {(exp as any).isViator && (
                          <div className="bg-emerald-600/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider text-white shadow">
                            Viator Verified
                          </div>
                        )}
                      </div>

                      {/* Floating Save button */}
                      <button 
                        onClick={() => onToggleWishlist(exp.id)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow border border-brand-blue-accent/20 transition-all cursor-pointer"
                        title={isSaved ? "Saved to wishlist" : "Save Experience"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                      </button>
                    </div>

                    {/* Card Content body */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-blue-accent uppercase tracking-wider font-bold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{exp.location}</span>
                          <span className="text-brand-charcoal/20">•</span>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{exp.duration}</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-brand-charcoal tracking-wide">
                          {exp.name}
                        </h3>
                        <p className="text-brand-charcoal/85 text-xs sm:text-sm leading-relaxed font-sans">
                          {exp.shortDescription || exp.description}
                        </p>
                      </div>

                      {/* Unmissable Highlights List */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-brand-blue-accent tracking-wider uppercase font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Experience Highlights
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {exp.highlights.map((highlight, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] font-mono bg-brand-lightbg border border-brand-blue-accent/15 px-2.5 py-1 rounded-lg text-brand-charcoal/85"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer action button */}
                      <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-between">
                        <div>
                          {(exp as any).price && (
                            <div className="text-xs font-mono font-bold text-brand-charcoal">
                              From <span className="text-sm font-serif font-bold text-brand-blue-accent">{(exp as any).price}</span>
                            </div>
                          )}
                        </div>
                        <a 
                          href={(exp as any).productUrl || `/experiences/${(exp.title || exp.name || exp.id).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                          target={(exp as any).productUrl ? "_blank" : "_self"}
                          rel={(exp as any).productUrl ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            if (!(exp as any).productUrl && !e.ctrlKey && !e.metaKey && e.button !== 1 && !e.shiftKey) {
                              e.preventDefault();
                              onSelectItem(exp);
                            }
                          }}
                          className="text-xs font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-4 py-2 rounded-xl border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span>Explore</span>
                          {(exp as any).productUrl ? <ExternalLink className="w-3 h-3" /> : <span>→</span>}
                        </a>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Pagination Control */}
          {viatorConfigured && (
            <div className="pt-10 pb-6 text-center flex flex-col items-center gap-3">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore || loadingViator}
                  className="bg-[#0F1626] hover:bg-brand-blue-accent text-white px-8 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-blue-accent" />
                      <span>Loading More Experiences...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-brand-blue-accent" />
                      <span>Load More Experiences ({viatorActivities.length} Loaded)</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-brand-lightbg border border-brand-blue-accent/15 px-6 py-3 rounded-xl text-xs font-mono text-brand-charcoal/60">
                  ✨ All available Phnom Penh & Siem Reap tours loaded
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
