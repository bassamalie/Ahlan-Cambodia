import React, { useState, useEffect, useRef } from "react";
import { 
  fetchCollection, 
  saveDocInCollection, 
  deleteDocFromCollection, 
  fetchDocument, 
  saveDocument 
} from "./dbService";
import { 
  Compass, Heart, MapPin, Star, Search, Menu, X, Globe, Sparkles, 
  Calculator, Sun, Moon, Sunset, Calendar, ArrowRight, Utensils, 
  BookOpen, Tv, CheckCircle, MessageSquare, Clock, Share2, 
  Sliders, ChevronRight, Eye, RefreshCw, Send, ShieldCheck, Mail, Phone, ExternalLink, HelpCircle, Settings,
  Facebook, Instagram, Twitter, Youtube
} from "lucide-react";
import { destinations, tourPackages, experiences, hotels, restaurants, mosques, travelGuides, testimonials } from "./data";
import { Destination, TourPackage, Experience, Hotel, Restaurant, Mosque, TravelGuide } from "./types";
import { NO_PHOTO_AVAILABLE_PLACEHOLDER } from "./googlePlacesPhotoService";
import InteractiveMap from "./components/InteractiveMap";
import PrayerWeatherWidget from "./components/PrayerWeatherWidget";
import AIChatAssistant from "./components/AIChatAssistant";
import HotelComparer from "./components/HotelComparer";
import QuoteBuilder from "./components/QuoteBuilder";
import CambodiaEssentialInfo from "./components/CambodiaEssentialInfo";
import logoImg from "../Logo-Navbar.png";
import TransparentLogo from "./components/TransparentLogo";
import DestinationsPage from "./components/DestinationsPage";
import ExperiencesPage from "./components/ExperiencesPage";
import PackagesPage from "./components/PackagesPage";
import HotelsPage from "./components/HotelsPage";
import HalalDiningPage from "./components/HalalDiningPage";
import MosquesPage from "./components/MosquesPage";

export const DEFAULT_CUSTOM_HEAD_SCRIPT = `<script>
  (function (s, t, a, y, twenty, two) {
    s.Stay22 = s.Stay22 || {};
    s.Stay22.params = { lmaID: '6a607aba28b1ce93011f3096' };
    twenty = t.createElement(a);
    two = t.getElementsByTagName(a)[0];
    twenty.async = 1;
    twenty.src = y;
    two.parentNode.insertBefore(twenty, two);
  })(window, document, 'script', 'https://scripts.stay22.com/letmeallez.js');
</script>`;
import DestinationDetailPage from "./components/DestinationDetailPage";
import ExperienceDetailPage from "./components/ExperienceDetailPage";
import PackageDetailPage from "./components/PackageDetailPage";
import HotelDetailPage from "./components/HotelDetailPage";
import { HotelDetailV2 } from "./components/HotelDetailV2";
import DiningDetailPage from "./components/DiningDetailPage";
import MosqueDetailPage from "./components/MosqueDetailPage";
import BlogDetailPage from "./components/BlogDetailPage";
import AdminCMS from "./components/AdminCMS";
import InspirationPage from "./components/InspirationPage";
import { SocialVideoCard } from "./components/SocialVideoCard";
import PackageInquiryPage from "./components/PackageInquiryPage";
import { getPackageSlug } from "./utils/pdfGenerator";

export default function App() {
  // Navigation & Scroll states
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("EN");
  const [currentView, setCurrentView] = useState<"home" | "destinations" | "experiences" | "packages" | "hotels" | "restaurants" | "mosques" | "destination-detail" | "experience-detail" | "package-detail" | "hotel-detail" | "dining-detail" | "mosque-detail" | "blog-detail" | "admin-cms" | "inspiration" | "package-inquiry">("home");
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);
  const [activePackage, setActivePackage] = useState<TourPackage | null>(null);
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [activeMosque, setActiveMosque] = useState<Mosque | null>(null);
  const [activeGuide, setActiveGuide] = useState<TravelGuide | null>(null);

  // Dynamic Homepage Settings & General Config States
  const defaultHeroImages = [
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=2000"
  ];

  const defaultWhyChooseCards = [
    {
      title: "Muslim-Friendly Expertise",
      desc: "We are backed by generations of Cambodian Cham Muslim experts who understand every detail of Halal hospitality."
    },
    {
      title: "Handpicked Luxury Hotels",
      desc: "Every hotel is vetted for private pools, prayer mats, Qibla alignment, and tailored Halal breakfast availability."
    },
    {
      title: "Verified Halal Dining",
      desc: "Never search blindly. Savor majestic Khmer delicacies prepared in 100% verified Halal environments."
    },
    {
      title: "Private Customised Tours",
      desc: "No rush, no rigid lists. Experience private air-conditioned transport, bespoke timelines, and local Cham guides."
    }
  ];

  const [homepageSettings, setHomepageSettings] = useState(() => {
    const saved = localStorage.getItem("ahlan_homepage_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing homepage settings", e);
      }
    }
    return {
      heroTitle: "Welcome to Cambodia",
      heroSubtitle: "Ahlan Cambodia - Your gateway to Muslim-friendly travel in Cambodia. Discover authentic experiences, trusted local experts, halal-friendly stays, and unforgettable journeys.",
      heroImages: defaultHeroImages,
      whyChooseCards: defaultWhyChooseCards
    };
  });

  const [generalConfig, setGeneralConfig] = useState(() => {
    const saved = localStorage.getItem("ahlan_general_config");
    let parsed: any = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing general config", e);
      }
    }
    return {
      companyDesc: "The premier Destination Management Company (DMC) specializing in inbound tourism to Cambodia, with a primary focus on Muslim-friendly luxury travel. We blend local heritage with spiritual devotion.",
      contactNumber: "+855 (0) 23 999 888",
      emailAddress: "concierge@ahlancambodia.com",
      address: "Street 110, Sihanouk Blvd, Phnom Penh, Cambodia",
      showAddress: true,
      socialLinks: {
        facebook: "https://facebook.com/ahlancambodia",
        instagram: "https://instagram.com/ahlancambodia",
        twitter: "https://twitter.com/ahlancambodia",
        youtube: "https://youtube.com/ahlancambodia"
      },
      websiteLogo: "",
      footerLogo: "",
      favicon: "",
      customHeadScript: DEFAULT_CUSTOM_HEAD_SCRIPT,
      ...parsed
    };
  });

  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

  // Sync states to local storage and Firestore
  useEffect(() => {
    localStorage.setItem("ahlan_homepage_settings", JSON.stringify(homepageSettings));
    if (isInitialLoadFinishedRef.current) {
      saveDocument("settings", "homepage", homepageSettings);
    }
  }, [homepageSettings]);

  useEffect(() => {
    localStorage.setItem("ahlan_general_config", JSON.stringify(generalConfig));
    if (isInitialLoadFinishedRef.current) {
      saveDocument("settings", "general", generalConfig);
    }
  }, [generalConfig]);

  // Image changing interval
  useEffect(() => {
    if (!homepageSettings.heroImages || homepageSettings.heroImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeroImageIndex((prev) => (prev + 1) % homepageSettings.heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [homepageSettings.heroImages]);

  // Dynamic Favicon sync
  useEffect(() => {
    if (generalConfig.favicon) {
      const link = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = generalConfig.favicon;
      if (!link.parentNode) {
        document.getElementsByTagName("head")[0].appendChild(link);
      }
    }
  }, [generalConfig.favicon]);

  // Dynamic Head Scripts Injection (e.g. Stay22, Google Analytics, Custom Tracking)
  useEffect(() => {
    const scriptContainerId = "ahlan-custom-head-scripts";
    const oldContainer = document.getElementById(scriptContainerId);
    if (oldContainer) {
      oldContainer.remove();
    }

    const scriptCode = generalConfig.customHeadScript;
    if (scriptCode && scriptCode.trim()) {
      const container = document.createElement("div");
      container.id = scriptContainerId;
      container.style.display = "none";

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(scriptCode, "text/html");
        const scriptElements = doc.querySelectorAll("script");

        if (scriptElements.length > 0) {
          scriptElements.forEach((oldScript) => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            container.appendChild(newScript);
          });
        } else {
          const newScript = document.createElement("script");
          newScript.textContent = scriptCode;
          container.appendChild(newScript);
        }
        document.head.appendChild(container);
      } catch (err) {
        console.error("Error injecting custom head script:", err);
      }
    }
  }, [generalConfig.customHeadScript]);
  
  // Helper function for instant local storage caching & fast hydration
  const loadCache = <T,>(key: string, fallback: T[] = []): T[] => {
    try {
      const raw = localStorage.getItem(`ahlan_cache_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // Ignore cache parse errors
    }
    return fallback;
  };

  // Helper for updating cache along with state
  const updateCache = (key: string, data: any[]) => {
    try {
      localStorage.setItem(`ahlan_cache_${key}`, JSON.stringify(data));
    } catch (e) {
      // cache full or disabled
    }
  };

  // Dynamic destinations state with instant cache hydration
  const [allDestinations, setAllDestinations] = useState<Destination[]>(() => loadCache("destinations", destinations));

  const handleAddDestination = (newDest: Destination) => {
    setAllDestinations((prev) => {
      const updated = [newDest, ...prev.filter(d => d.id !== newDest.id)];
      updateCache("destinations", updated);
      return updated;
    });
    saveDocInCollection("destinations", newDest);
  };

  const handleUpdateDestination = (updatedDest: Destination) => {
    setAllDestinations((prev) => {
      const updated = prev.map((d) => d.id === updatedDest.id ? updatedDest : d);
      updateCache("destinations", updated);
      return updated;
    });
    saveDocInCollection("destinations", updatedDest);
  };

  const handleDeleteDestination = (id: string) => {
    setAllDestinations((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      updateCache("destinations", updated);
      return updated;
    });
    deleteDocFromCollection("destinations", id);
  };

  // Dynamic experiences state
  const [allExperiences, setAllExperiences] = useState<Experience[]>(() => loadCache("experiences", []));

  const handleAddExperience = (newExp: Experience) => {
    setAllExperiences((prev) => {
      const updated = [newExp, ...prev.filter(e => e.id !== newExp.id)];
      updateCache("experiences", updated);
      return updated;
    });
    saveDocInCollection("experiences", newExp);
  };

  const handleUpdateExperience = (updatedExp: Experience) => {
    setAllExperiences((prev) => {
      const updated = prev.map((e) => e.id === updatedExp.id ? updatedExp : e);
      updateCache("experiences", updated);
      return updated;
    });
    saveDocInCollection("experiences", updatedExp);
  };

  const handleDeleteExperience = (id: string) => {
    setAllExperiences((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      updateCache("experiences", updated);
      return updated;
    });
    deleteDocFromCollection("experiences", id);
  };

  // Dynamic packages state
  const [allPackages, setAllPackages] = useState<TourPackage[]>(() => loadCache("packages", []));

  const handleAddPackage = (newPkg: TourPackage) => {
    setAllPackages((prev) => {
      const updated = [newPkg, ...prev.filter(p => p.id !== newPkg.id)];
      updateCache("packages", updated);
      return updated;
    });
    saveDocInCollection("packages", newPkg);
  };

  const handleUpdatePackage = (updatedPkg: TourPackage) => {
    setAllPackages((prev) => {
      const updated = prev.map((p) => p.id === updatedPkg.id ? updatedPkg : p);
      updateCache("packages", updated);
      return updated;
    });
    saveDocInCollection("packages", updatedPkg);
  };

  const handleDeletePackage = (id: string) => {
    setAllPackages((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      updateCache("packages", updated);
      return updated;
    });
    deleteDocFromCollection("packages", id);
  };

  // Dynamic hotels state
  const [allHotels, setAllHotels] = useState<Hotel[]>(() => loadCache("hotels", []));

  const handleAddHotel = (newHotel: Hotel) => {
    setAllHotels((prev) => {
      const updated = [newHotel, ...prev.filter(h => h.id !== newHotel.id)];
      updateCache("hotels", updated);
      return updated;
    });
    saveDocInCollection("hotels", newHotel);
  };

  const handleUpdateHotel = (updatedHotel: Hotel) => {
    setAllHotels((prev) => {
      const updated = prev.map((h) => h.id === updatedHotel.id ? updatedHotel : h);
      updateCache("hotels", updated);
      return updated;
    });
    saveDocInCollection("hotels", updatedHotel);
  };

  const handleDeleteHotel = (id: string) => {
    setAllHotels((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      updateCache("hotels", updated);
      return updated;
    });
    deleteDocFromCollection("hotels", id);
  };

  // Dynamic restaurants state
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(() => loadCache("restaurants", []));

  const handleAddRestaurant = (newRest: Restaurant) => {
    setAllRestaurants((prev) => {
      const updated = [newRest, ...prev.filter(r => r.id !== newRest.id)];
      updateCache("restaurants", updated);
      return updated;
    });
    saveDocInCollection("restaurants", newRest);
    saveDocInCollection("dining", newRest);
  };

  const handleUpdateRestaurant = (updatedRest: Restaurant) => {
    setAllRestaurants((prev) => {
      const updated = prev.map((r) => r.id === updatedRest.id ? updatedRest : r);
      updateCache("restaurants", updated);
      return updated;
    });
    saveDocInCollection("restaurants", updatedRest);
    saveDocInCollection("dining", updatedRest);
  };

  const handleDeleteRestaurant = (id: string) => {
    setAllRestaurants((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      updateCache("restaurants", updated);
      return updated;
    });
    deleteDocFromCollection("restaurants", id);
    deleteDocFromCollection("dining", id);
  };

  // Dynamic mosques state
  const [allMosques, setAllMosques] = useState<Mosque[]>(() => loadCache("mosques", []));

  const handleAddMosque = (newMosque: Mosque) => {
    setAllMosques((prev) => {
      const updated = [newMosque, ...prev.filter(m => m.id !== newMosque.id)];
      updateCache("mosques", updated);
      return updated;
    });
    saveDocInCollection("mosques", newMosque);
  };

  const handleUpdateMosque = (updatedMosque: Mosque) => {
    setAllMosques((prev) => {
      const updated = prev.map((m) => m.id === updatedMosque.id ? updatedMosque : m);
      updateCache("mosques", updated);
      return updated;
    });
    saveDocInCollection("mosques", updatedMosque);
  };

  const handleDeleteMosque = (id: string) => {
    setAllMosques((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      updateCache("mosques", updated);
      return updated;
    });
    deleteDocFromCollection("mosques", id);
  };

  // Dynamic travel guides state
  const [allGuides, setAllGuides] = useState<TravelGuide[]>(() => loadCache("travelGuides", []));

  const handleAddGuide = (newGuide: TravelGuide) => {
    setAllGuides((prev) => {
      const updated = [newGuide, ...prev.filter(g => g.id !== newGuide.id)];
      updateCache("travelGuides", updated);
      return updated;
    });
    saveDocInCollection("travelGuides", newGuide);
  };

  const handleUpdateGuide = (updatedGuide: TravelGuide) => {
    setAllGuides((prev) => {
      const updated = prev.map((g) => g.id === updatedGuide.id ? updatedGuide : g);
      updateCache("travelGuides", updated);
      return updated;
    });
    saveDocInCollection("travelGuides", updatedGuide);
  };

  const handleDeleteGuide = (id: string) => {
    setAllGuides((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      updateCache("travelGuides", updated);
      return updated;
    });
    deleteDocFromCollection("travelGuides", id);
  };

  const isInitialLoadFinishedRef = useRef(false);
  const [isLoadingDB, setIsLoadingDB] = useState(false); // Non-blocking: render UI shell immediately

  // Fetch and seed all dynamic state in background on boot
  useEffect(() => {
    async function loadAllDBData() {
      try {
        const [
          dbDestinations,
          dbExperiences,
          dbPackagesMain,
          dbTours,
          dbHotels,
          dbRestaurantsMain,
          dbDining,
          dbMosques,
          dbGuidesMain,
          dbBlogs,
          dbTravelTips,
          dbHomepageSettings,
          dbGeneralConfig
        ] = await Promise.all([
          fetchCollection("destinations", destinations),
          fetchCollection("experiences"),
          fetchCollection("packages"),
          fetchCollection("tours"),
          fetchCollection("hotels"),
          fetchCollection("restaurants"),
          fetchCollection("dining"),
          fetchCollection("mosques"),
          fetchCollection("travelGuides"),
          fetchCollection("blogs"),
          fetchCollection("travelTips"),
          fetchDocument("settings", "homepage", {
            heroTitle: "Welcome to Cambodia",
            heroSubtitle: "Ahlan Cambodia - Your gateway to Muslim-friendly travel in Cambodia. Discover authentic experiences, trusted local experts, halal-friendly stays, and unforgettable journeys.",
            heroImages: defaultHeroImages,
            whyChooseCards: defaultWhyChooseCards
          }),
          fetchDocument("settings", "general", {
            companyDesc: "The premier Destination Management Company (DMC) specializing in inbound tourism to Cambodia, with a primary focus on Muslim-friendly luxury travel. We blend local heritage with spiritual devotion.",
            contactNumber: "+855 (0) 23 999 888",
            emailAddress: "concierge@ahlancambodia.com",
            address: "Street 110, Sihanouk Blvd, Phnom Penh, Cambodia",
            showAddress: true,
            socialLinks: {
              facebook: "https://facebook.com/ahlancambodia",
              instagram: "https://instagram.com/ahlancambodia",
              twitter: "https://twitter.com/ahlancambodia",
              youtube: "https://youtube.com/ahlancambodia"
            },
            websiteLogo: "",
            footerLogo: "",
            favicon: ""
          })
        ]);

        // Merge dual collections
        const dbRestaurants = [...dbRestaurantsMain];
        dbDining.forEach((item) => {
          if (!dbRestaurants.some((r) => r.id === item.id)) dbRestaurants.push(item);
        });

        const dbPackages = [...dbPackagesMain];
        dbTours.forEach((item) => {
          if (!dbPackages.some((p) => p.id === item.id)) dbPackages.push(item);
        });

        const dbGuides = [...dbGuidesMain];
        dbBlogs.concat(dbTravelTips).forEach((item) => {
          if (!dbGuides.some((g) => g.id === item.id)) dbGuides.push(item);
        });

        // Helper to merge local state with Firestore, giving priority to Firestore as source of truth
        const safeMerge = <T extends { id: string }>(prevItems: T[], fetchedItems: T[]): T[] => {
          if (!fetchedItems || fetchedItems.length === 0) return prevItems;
          const map = new Map<string, T>();
          // 1. Primary source of truth: fetched items from Firestore
          fetchedItems.forEach((item) => map.set(item.id, item));
          // 2. Retain any un-persisted items created locally in this session if not yet in Firestore
          prevItems.forEach((item) => {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
          });
          return Array.from(map.values());
        };

        setAllDestinations((prev) => safeMerge(prev, dbDestinations));
        setAllExperiences((prev) => safeMerge(prev, dbExperiences));
        setAllPackages((prev) => safeMerge(prev, dbPackages));
        setAllHotels((prev) => safeMerge(prev, dbHotels));
        setAllRestaurants((prev) => safeMerge(prev, dbRestaurants));
        setAllMosques((prev) => safeMerge(prev, dbMosques));
        setAllGuides((prev) => safeMerge(prev, dbGuides));

        setHomepageSettings(dbHomepageSettings);
        setGeneralConfig(dbGeneralConfig);

        // Update localStorage cache with non-empty results
        try {
          if (dbDestinations.length > 0) localStorage.setItem("ahlan_cache_destinations", JSON.stringify(dbDestinations));
          if (dbExperiences.length > 0) localStorage.setItem("ahlan_cache_experiences", JSON.stringify(dbExperiences));
          if (dbPackages.length > 0) localStorage.setItem("ahlan_cache_packages", JSON.stringify(dbPackages));
          if (dbHotels.length > 0) localStorage.setItem("ahlan_cache_hotels", JSON.stringify(dbHotels));
          if (dbRestaurants.length > 0) localStorage.setItem("ahlan_cache_restaurants", JSON.stringify(dbRestaurants));
          if (dbMosques.length > 0) localStorage.setItem("ahlan_cache_mosques", JSON.stringify(dbMosques));
          if (dbGuides.length > 0) localStorage.setItem("ahlan_cache_travelGuides", JSON.stringify(dbGuides));
        } catch (e) {
          // localStorage full or unavailable
        }

        isInitialLoadFinishedRef.current = true;
      } catch (err) {
        console.error("Error loading data from Firestore", err);
      }
    }
    loadAllDBData();
  }, []);

  // Synchronize current view and active items to URL path (History API)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const parts = path.split("/").filter(Boolean);
      
      if (parts.length === 0) {
        setCurrentView("home");
        return;
      }
      
      const first = parts[0].toLowerCase();
      
      if (first === "destination" || first === "destinations") {
        if (parts.length > 1) {
          const idOrName = decodeURIComponent(parts[1]).toLowerCase().trim();
          const cleanTarget = idOrName.replace(/-/g, " ").trim();
          const found = allDestinations.find(d => 
            d.name.toLowerCase().replace(/-/g, " ").trim() === cleanTarget ||
            d.id.toLowerCase().replace(/-/g, " ").trim() === cleanTarget
          );
          if (found) {
            setActiveDestination(found);
            setCurrentView("destination-detail");
          } else {
            setCurrentView("destinations");
          }
        } else {
          setCurrentView("destinations");
        }
      } else if (first === "experiences" || first === "experience") {
        if (parts.length > 1) {
          const idOrName = decodeURIComponent(parts[1]).toLowerCase().trim();
          const cleanTarget = idOrName.replace(/-/g, " ").trim();
          const found = allExperiences.find(e => 
            (e.title && e.title.toLowerCase().replace(/-/g, " ").trim() === cleanTarget) ||
            (e.name && e.name.toLowerCase().replace(/-/g, " ").trim() === cleanTarget) ||
            e.id.toLowerCase().replace(/-/g, " ").trim() === cleanTarget
          );
          if (found) {
            setActiveExperience(found);
            setCurrentView("experience-detail");
          } else {
            setCurrentView("experiences");
          }
        } else {
          setCurrentView("experiences");
        }
      } else if (first === "packages" || first === "package") {
        if (parts.length > 1) {
          const rawSegment = decodeURIComponent(parts[1]).trim();
          const cleanTarget = rawSegment.toLowerCase().replace(/-/g, " ").trim();
          const slugTarget = rawSegment.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          const found = allPackages.find(p => 
            (p.name && getPackageSlug(p) === slugTarget) ||
            (p.title && p.title.toLowerCase().replace(/-/g, " ").trim() === cleanTarget) ||
            (p.name && p.name.toLowerCase().replace(/-/g, " ").trim() === cleanTarget) ||
            p.id.toLowerCase().replace(/-/g, " ").trim() === cleanTarget
          );
          if (found) {
            setActivePackage(found);
            setCurrentView("package-detail");
          } else {
            setCurrentView("packages");
          }
        } else {
          setCurrentView("packages");
        }
      } else if (first === "hotels" || first === "hotel") {
        if (parts.length > 1) {
          const idOrName = decodeURIComponent(parts[1]).toLowerCase().trim();
          const cleanTarget = idOrName.replace(/-/g, " ").trim();
          const found = allHotels.find(h => 
            h.name.toLowerCase().replace(/-/g, " ").trim() === cleanTarget ||
            h.id.toLowerCase().replace(/-/g, " ").trim() === cleanTarget
          );
          if (found) {
            setActiveHotel(found);
            setCurrentView("hotel-detail");
          } else {
            setCurrentView("hotels");
          }
        } else {
          setCurrentView("hotels");
        }
      } else if (first === "dining" || first === "restaurants" || first === "restaurant") {
        if (parts.length > 1) {
          const idOrName = decodeURIComponent(parts[1]).toLowerCase().trim();
          const cleanTarget = idOrName.replace(/-/g, " ").trim();
          const found = allRestaurants.find(r => 
            r.name.toLowerCase().replace(/-/g, " ").trim() === cleanTarget ||
            r.id.toLowerCase().replace(/-/g, " ").trim() === cleanTarget
          );
          if (found) {
            setActiveRestaurant(found);
            setCurrentView("dining-detail");
          } else {
            setCurrentView("restaurants");
          }
        } else {
          setCurrentView("restaurants");
        }
      } else if (first === "mosques" || first === "mosque") {
        if (parts.length > 1) {
          const idOrName = decodeURIComponent(parts[1]).toLowerCase().trim();
          const cleanTarget = idOrName.replace(/-/g, " ").trim();
          const found = allMosques.find(m => 
            m.name.toLowerCase().replace(/-/g, " ").trim() === cleanTarget ||
            m.id.toLowerCase().replace(/-/g, " ").trim() === cleanTarget
          );
          if (found) {
            setActiveMosque(found);
            setCurrentView("mosque-detail");
          } else {
            setCurrentView("mosques");
          }
        } else {
          setCurrentView("mosques");
        }
      } else if (first === "inspiration") {
        if (parts.length > 1) {
          const rawSegment = decodeURIComponent(parts[1]).trim();
          const cleanTarget = rawSegment.toLowerCase().replace(/-/g, " ").trim();
          const slugTarget = rawSegment.toLowerCase().trim();
          const found = allGuides.find(g => {
            const gTitle = g.title ? g.title.toLowerCase().trim() : "";
            const gTitleSlug = gTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            const gTitleClean = gTitle.replace(/-/g, " ");
            const gSlug = (g as any).slug ? (g as any).slug.toLowerCase().trim() : "";
            const gId = g.id ? g.id.toLowerCase().trim() : "";

            return (
              gId === slugTarget ||
              gSlug === slugTarget ||
              gTitleSlug === slugTarget ||
              gTitleClean === cleanTarget ||
              gId.replace(/-/g, " ").trim() === cleanTarget
            );
          });
          if (found) {
            setActiveGuide(found);
            setCurrentView("blog-detail");
          } else {
            setCurrentView("inspiration");
          }
        } else {
          setCurrentView("inspiration");
        }
      } else if (first === "enquiry" || first === "inquiry" || first === "package-inquiry") {
        if (parts.length > 1) {
          const rawSegment = decodeURIComponent(parts[1]).trim();
          const cleanTarget = rawSegment.toLowerCase().replace(/-/g, " ").trim();
          const slugTarget = rawSegment.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          const found = allPackages.find(p => 
            (p.name && getPackageSlug(p) === slugTarget) ||
            (p.name && p.name.toLowerCase().replace(/-/g, " ").trim() === cleanTarget) ||
            (p.id && p.id.toLowerCase().replace(/-/g, " ").trim() === cleanTarget)
          );
          if (found) {
            setActivePackage(found);
            setCurrentView("package-inquiry");
          } else if (allPackages.length > 0) {
            setActivePackage(allPackages[0]);
            setCurrentView("package-inquiry");
          } else {
            setCurrentView("packages");
          }
        } else {
          setCurrentView("packages");
        }
      } else if (first === "admin-cms") {
        setCurrentView("admin-cms");
      } else {
        setCurrentView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    // Run once on initial load to handle direct deep links
    handlePopState();

    return () => window.removeEventListener("popstate", handlePopState);
  }, [allDestinations, allExperiences, allPackages, allHotels, allRestaurants, allMosques, allGuides]);

  // Sync state changes back to the URL
  useEffect(() => {
    let path = "/";
    if (currentView === "destinations") {
      path = "/destination";
    } else if (currentView === "destination-detail" && activeDestination) {
      path = getItemUrl("destination", activeDestination);
    } else if (currentView === "experiences") {
      path = "/experiences";
    } else if (currentView === "experience-detail" && activeExperience) {
      path = getItemUrl("experience", activeExperience);
    } else if (currentView === "packages") {
      path = "/packages";
    } else if (currentView === "package-detail" && activePackage) {
      path = getItemUrl("package", activePackage);
    } else if (currentView === "hotels") {
      path = "/hotels";
    } else if (currentView === "hotel-detail" && activeHotel) {
      path = getItemUrl("hotel", activeHotel);
    } else if (currentView === "restaurants") {
      path = "/dining";
    } else if (currentView === "dining-detail" && activeRestaurant) {
      path = getItemUrl("restaurant", activeRestaurant);
    } else if (currentView === "mosques") {
      path = "/mosques";
    } else if (currentView === "mosque-detail" && activeMosque) {
      path = getItemUrl("mosque", activeMosque);
    } else if (currentView === "inspiration") {
      path = "/inspiration";
    } else if (currentView === "blog-detail" && activeGuide) {
      path = getItemUrl("guide", activeGuide);
    } else if (currentView === "admin-cms") {
      path = "/admin-cms";
    } else if (currentView === "package-inquiry" && activePackage) {
      path = `/enquiry/${getPackageSlug(activePackage)}`;
    }

    if (window.location.pathname !== path || window.location.hash) {
      window.history.pushState(null, "", path);
    }
  }, [currentView, activeDestination, activeExperience, activePackage, activeHotel, activeRestaurant, activeMosque, activeGuide]);

  // Always bring user to the top of the page on view change or selection redirection
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [currentView, activeDestination, activeExperience, activePackage, activeHotel, activeRestaurant, activeMosque, activeGuide]);

  // Dynamic Document Title Sync
  useEffect(() => {
    let pageTitle = "Muslim Friendly Travel";
    if (currentView === "destinations") {
      pageTitle = "Destinations";
    } else if (currentView === "destination-detail" && activeDestination) {
      pageTitle = activeDestination.name;
    } else if (currentView === "experiences") {
      pageTitle = "Curated Experiences";
    } else if (currentView === "experience-detail" && activeExperience) {
      pageTitle = activeExperience.title || activeExperience.name || "Experience";
    } else if (currentView === "packages") {
      pageTitle = "Tour Packages";
    } else if (currentView === "package-detail" && activePackage) {
      pageTitle = activePackage.title || activePackage.name || "Tour Package";
    } else if (currentView === "hotels") {
      pageTitle = "Halal-Friendly Luxury Hotels";
    } else if (currentView === "hotel-detail" && activeHotel) {
      pageTitle = activeHotel.name;
    } else if (currentView === "restaurants") {
      pageTitle = "Halal Dining & Restaurants";
    } else if (currentView === "dining-detail" && activeRestaurant) {
      pageTitle = activeRestaurant.name;
    } else if (currentView === "mosques") {
      pageTitle = "Mosques & Prayer Spaces";
    } else if (currentView === "mosque-detail" && activeMosque) {
      pageTitle = activeMosque.name;
    } else if (currentView === "inspiration") {
      pageTitle = "Inspiration & Travel Guides";
    } else if (currentView === "blog-detail" && activeGuide) {
      pageTitle = activeGuide.title;
    } else if (currentView === "admin-cms") {
      pageTitle = "Admin Login";
    }

    document.title = `Ahlan Cambodia | ${pageTitle}`;
  }, [currentView, activeDestination, activeExperience, activePackage, activeHotel, activeRestaurant, activeMosque, activeGuide]);

  const navigateToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== "home") {
      setCurrentView("home");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Core global search/filter states
  const [searchCategory, setSearchCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("All");
  const [textSearch, setTextSearch] = useState<string>("");

  // Wishlist & Saved States
  const [wishlist, setWishlist] = useState<{ [key: string]: string[] }>({
    packages: [],
    hotels: [],
    experiences: [],
    restaurants: [],
    destinations: []
  });
  const [wishlistOpen, setWishlistOpen] = useState<boolean>(false);

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<{ id: string; name: string; category: string; image: string }[]>([]);
  const [recentDrawerOpen, setRecentDrawerOpen] = useState<boolean>(false);

  // Selected details modal
  const [selectedItem, setSelectedItem] = useState<{
    type: "destination" | "package" | "experience" | "hotel" | "restaurant" | "mosque" | "guide";
    data: any;
  } | null>(null);

  // Interactive Map selector
  const [mapSelectedDestId, setMapSelectedDestId] = useState<string>("siem-reap");

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync scroll lock for modals
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedItem]);

  const toggleWishlist = (id: string, category: string) => {
    setWishlist((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(id) 
        ? current.filter((item) => item !== id) 
        : [...current, id];
      return { ...prev, [category]: updated };
    });
  };

  const addToRecentlyViewed = (item: { id: string; name: string; category: string; image: string }) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((x) => x.id !== item.id);
      return [item, ...filtered].slice(0, 8); // Keep last 8 items
    });
  };

  const getItemUrl = (type: string, data: any) => {
    if (!data) return "/";
    const nameOrId = data.name || data.title || data.id;
    const cleanSlug = nameOrId.replace(/\s+/g, "-");
    if (type === "destination") {
      return `/destinations/${cleanSlug}`;
    }
    if (type === "experience") {
      return `/experiences/${cleanSlug}`;
    }
    if (type === "package") {
      return `/packages/${cleanSlug}`;
    }
    if (type === "hotel") {
      return `/hotels/${cleanSlug}`;
    }
    if (type === "restaurant") {
      return `/dining/${cleanSlug}`;
    }
    if (type === "mosque") {
      return `/mosques/${cleanSlug}`;
    }
    if (type === "guide" || type === "blog") {
      const slug = data.slug || (data.title ? data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : data.id);
      return `/inspiration/${slug}`;
    }
    return "/";
  };

  const handleLinkClick = (e: React.MouseEvent, type: string, data: any) => {
    if (e.ctrlKey || e.metaKey || e.button === 1 || e.shiftKey) {
      return;
    }
    e.preventDefault();
    handleOpenDetail(type, data);
  };

  const handleOpenDetail = (type: any, data: any) => {
    if (type === "destination") {
      setActiveDestination(data);
      setCurrentView("destination-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToRecentlyViewed({
        id: data.id,
        name: data.name || data.title,
        category: type,
        image: data.image
      });
      return;
    }
    if (type === "experience") {
      setActiveExperience(data);
      setCurrentView("experience-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToRecentlyViewed({
        id: data.id,
        name: data.name || data.title,
        category: type,
        image: data.image
      });
      return;
    }
    if (type === "package") {
      setActivePackage(data);
      setCurrentView("package-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToRecentlyViewed({
        id: data.id,
        name: data.name || data.title,
        category: type,
        image: data.image
      });
      return;
    }
    if (type === "hotel") {
      setActiveHotel(data);
      setCurrentView("hotel-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToRecentlyViewed({
        id: data.id,
        name: data.name || data.title,
        category: type,
        image: data.image
      });
      return;
    }
    if (type === "restaurant") {
      setActiveRestaurant(data);
      setCurrentView("dining-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToRecentlyViewed({
        id: data.id,
        name: data.name || data.title,
        category: type,
        image: data.image
      });
      return;
    }
    if (type === "mosque") {
      setActiveMosque(data);
      setCurrentView("mosque-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToRecentlyViewed({
        id: data.id,
        name: data.name || data.title,
        category: type,
        image: data.image
      });
      return;
    }
    if (type === "guide") {
      setActiveGuide(data);
      setCurrentView("blog-detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
      addToRecentlyViewed({
        id: data.id,
        name: data.name || data.title,
        category: type,
        image: data.image
      });
      return;
    }
    setSelectedItem({ type, data });
    addToRecentlyViewed({
      id: data.id,
      name: data.name || data.title,
      category: type,
      image: data.image
    });
  };

  // Filtering states logic based on query
  const filteredPackages = allPackages.filter((p) => {
    if (textSearch) {
      return p.name.toLowerCase().includes(textSearch.toLowerCase()) || p.description.toLowerCase().includes(textSearch.toLowerCase());
    }
    return true;
  });

  const filteredHotels = allHotels.filter((h) => {
    if (textSearch) {
      return h.name.toLowerCase().includes(textSearch.toLowerCase()) || h.location.toLowerCase().includes(textSearch.toLowerCase());
    }
    return true;
  });

  const filteredRestaurants = allRestaurants.filter((r) => {
    if (textSearch) {
      return r.name.toLowerCase().includes(textSearch.toLowerCase()) || r.cuisine.toLowerCase().includes(textSearch.toLowerCase());
    }
    return true;
  });

  const filteredMosques = allMosques.filter((m) => {
    if (textSearch) {
      return m.name.toLowerCase().includes(textSearch.toLowerCase()) || m.location.toLowerCase().includes(textSearch.toLowerCase());
    }
    return true;
  });

  const filteredExperiences = allExperiences.filter((e) => {
    if (textSearch) {
      return e.name.toLowerCase().includes(textSearch.toLowerCase()) || e.description.toLowerCase().includes(textSearch.toLowerCase());
    }
    return true;
  });

  // Dynamic aggregation of all travel and social videos added to the website
  const combinedHomeVideos = [
    // Dynamic user/restaurant videos
    ...allRestaurants.flatMap(rest => (rest.socialVideos || []).map((v, i) => ({
      platform: v.platform,
      url: v.url,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      creatorName: v.creatorName,
      creatorHandle: v.creatorHandle,
      creatorAvatar: v.creatorAvatar,
      restaurantImage: rest.image,
      views: v.views,
      likes: v.likes,
      duration: v.duration,
      fallbackName: rest.name,
      id: `dynamic-rest-${rest.id}-${i}`
    }))),
    // Dynamic user/destination videos
    ...allDestinations.flatMap(dest => (dest.socialVideos || []).map((v, i) => ({
      platform: v.platform,
      url: v.url,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      creatorName: v.creatorName,
      creatorHandle: v.creatorHandle,
      creatorAvatar: v.creatorAvatar,
      restaurantImage: dest.image,
      views: v.views,
      likes: v.likes,
      duration: v.duration,
      fallbackName: dest.name,
      id: `dynamic-dest-${dest.id}-${i}`
    })))
  ];

  // Calculate total saved count
  const totalSavedCount: number = Object.keys(wishlist).reduce((acc: number, key: string) => acc + (wishlist[key]?.length || 0), 0);

  return (
    <div className="bg-white text-brand-charcoal min-h-screen relative font-sans">
      
      {/* ---------------- STICKY NAVIGATION ---------------- */}
      {currentView !== "admin-cms" && (
        <nav id="main-navigation" className="sticky top-0 left-0 right-0 z-40 transition-all duration-300 py-3 bg-white text-brand-charcoal border-b border-brand-blue-accent/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Left - Using Uploaded Logo-Navbar.png Image */}
          <div 
            className="flex items-center justify-start cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 py-1" 
            onClick={() => {
              setCurrentView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <TransparentLogo 
              src={generalConfig.websiteLogo || logoImg} 
              alt="Ahlan Cambodia Logo" 
              className="h-12 sm:h-16 w-auto object-contain opacity-90"
              scrolled={scrolled}
            />
          </div>

          {/* Navigation Center (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6 font-mono text-sm uppercase tracking-wider font-semibold text-brand-charcoal">
             <button 
              onClick={() => {
                setCurrentView("destinations");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className={`hover:text-brand-blue-accent transition-colors cursor-pointer font-mono text-sm uppercase tracking-wider font-semibold ${currentView === "destinations" ? "text-brand-blue-accent font-bold" : ""}`}
            >
              DESTINATIONS
            </button>
            <button 
              onClick={() => {
                setCurrentView("experiences");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className={`hover:text-brand-blue-accent transition-colors cursor-pointer font-mono text-sm uppercase tracking-wider font-semibold ${currentView === "experiences" ? "text-brand-blue-accent font-bold" : ""}`}
            >
              EXPERIENCES
            </button>
            <button 
              onClick={() => {
                setCurrentView("packages");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className={`hover:text-brand-blue-accent transition-colors cursor-pointer font-mono text-sm uppercase tracking-wider font-semibold ${currentView === "packages" ? "text-brand-blue-accent font-bold" : ""}`}
            >
              PACKAGES
            </button>
            <button 
              onClick={() => {
                setCurrentView("hotels");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className={`hover:text-brand-blue-accent transition-colors cursor-pointer font-mono text-sm uppercase tracking-wider font-semibold ${currentView === "hotels" ? "text-brand-blue-accent font-bold" : ""}`}
            >
              HOTELS
            </button>
            <button 
              onClick={() => {
                setCurrentView("restaurants");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className={`hover:text-brand-blue-accent transition-colors cursor-pointer font-mono text-sm uppercase tracking-wider font-semibold ${currentView === "restaurants" ? "text-brand-blue-accent font-bold" : ""}`}
            >
              DINING
            </button>
            <button 
              onClick={() => {
                setCurrentView("mosques");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className={`hover:text-brand-blue-accent transition-colors cursor-pointer font-mono text-sm uppercase tracking-wider font-semibold ${currentView === "mosques" ? "text-brand-blue-accent font-bold" : ""}`}
            >
              MOSQUES
            </button>
            <button 
              onClick={() => {
                setCurrentView("inspiration");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
              className={`hover:text-brand-blue-accent transition-colors cursor-pointer font-mono text-sm uppercase tracking-wider font-semibold ${currentView === "inspiration" ? "text-brand-blue-accent font-bold" : ""}`}
            >
              INSPIRATION
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">

            {/* Language Selector */}
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-1.5 bg-transparent border border-brand-blue-accent/40 hover:bg-[#0F1626] hover:text-white hover:border-[#0F1626] px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all text-brand-charcoal group shadow-sm">
                <Globe className="w-3.5 h-3.5 text-brand-blue-accent group-hover:text-brand-blue-accent/90 transition-colors" />
                <span>{language}</span>
              </button>
              <div className="absolute right-0 mt-1 w-28 bg-white border border-brand-blue-accent/20 shadow-xl rounded-xl overflow-hidden hidden group-hover:block text-brand-charcoal">
                {[
                  { code: "EN", name: "English" },
                  { code: "MS", name: "Melayu" },
                  { code: "AR", name: "العربية" },
                  { code: "KH", name: "ខ្មែរ" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      alert(`Language changed to ${lang.name}. Dynamic multi-lingual interface initialized.`);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono font-medium hover:bg-[#0F1626] hover:text-white transition-all"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-transparent hover:bg-[#0F1626] hover:text-white border border-[#0F1626]/20 text-brand-blue-accent rounded-xl transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-brand-blue-accent" /> : <Menu className="w-5 h-5 text-brand-blue-accent" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-brand-blue-accent/20 shadow-xl animate-fade-in text-brand-charcoal">
            <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col font-mono text-sm uppercase tracking-wider font-semibold">
              <button 
                onClick={() => {
                  setCurrentView("destinations");
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className={`hover:text-brand-blue-accent py-2 border-b border-brand-blue-accent/10 text-left cursor-pointer ${currentView === "destinations" ? "text-brand-blue-accent font-bold" : "text-brand-charcoal"}`}
              >
                DESTINATIONS
              </button>
              <button 
                onClick={() => {
                  setCurrentView("experiences");
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className={`hover:text-brand-blue-accent py-2 border-b border-brand-blue-accent/10 text-left cursor-pointer ${currentView === "experiences" ? "text-brand-blue-accent font-bold" : "text-brand-charcoal"}`}
              >
                EXPERIENCES
              </button>
              <button 
                onClick={() => {
                  setCurrentView("packages");
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className={`hover:text-brand-blue-accent py-2 border-b border-brand-blue-accent/10 text-left cursor-pointer ${currentView === "packages" ? "text-brand-blue-accent font-bold" : "text-brand-charcoal"}`}
              >
                PACKAGES
              </button>
              <button 
                onClick={() => {
                  setCurrentView("hotels");
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className={`hover:text-brand-blue-accent py-2 border-b border-brand-blue-accent/10 text-left cursor-pointer ${currentView === "hotels" ? "text-brand-blue-accent font-bold" : "text-brand-charcoal"}`}
              >
                HOTELS
              </button>
              <button 
                onClick={() => {
                  setCurrentView("restaurants");
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className={`hover:text-brand-blue-accent py-2 border-b border-brand-blue-accent/10 text-left cursor-pointer ${currentView === "restaurants" ? "text-brand-blue-accent font-bold" : "text-brand-charcoal"}`}
              >
                DINING
              </button>
              <button 
                onClick={() => {
                  setCurrentView("mosques");
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className={`hover:text-brand-blue-accent py-2 border-b border-brand-blue-accent/10 text-left cursor-pointer ${currentView === "mosques" ? "text-brand-blue-accent font-bold" : "text-brand-charcoal"}`}
              >
                MOSQUES
              </button>
              <button 
                onClick={() => {
                  setCurrentView("inspiration");
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className={`hover:text-brand-blue-accent py-2 border-b border-brand-blue-accent/10 text-left cursor-pointer ${currentView === "inspiration" ? "text-brand-blue-accent font-bold" : "text-brand-charcoal"}`}
              >
                INSPIRATION
              </button>
              <div className="flex justify-between items-center pt-2">
                <span className="text-brand-charcoal/60 text-[10px]">Select Currency:</span>
                <span className="text-xs font-bold text-brand-blue-accent">USD / KHR</span>
              </div>
            </div>
          </div>
        )}
        </nav>
      )}

      {/* ---------------- WISHLIST SIDE DRAWER ---------------- */}
      {wishlistOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-brand-blue-accent/20 animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-brand-blue-accent/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-brand-red fill-brand-red" />
                  <h3 className="font-serif text-xl text-brand-charcoal font-bold">My Saved Gems</h3>
                </div>
                <button onClick={() => setWishlistOpen(false)} className="text-brand-charcoal/60 hover:text-brand-charcoal p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {totalSavedCount === 0 ? (
                <div className="py-16 text-center space-y-3 flex flex-col items-center justify-center">
                  <Compass className="w-10 h-10 text-brand-blue-accent animate-bounce" />
                  <p className="text-sm font-medium text-brand-charcoal/80">Your saved collection is empty.</p>
                  <p className="text-xs text-brand-charcoal/50 max-w-xs">Explore our curated hotels, halal dining, and tour packages and tap the heart icon to save items here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Packages saved */}
                  {wishlist.packages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase text-brand-charcoal/40 tracking-wider font-bold">Saved Tour Packages</p>
                      {allPackages.filter(p => wishlist.packages.includes(p.id)).map(p => (
                        <div key={p.id} className="flex items-center gap-3 bg-brand-warmwhite p-2.5 rounded-xl border border-brand-blue-accent/10">
                          <img src={p.image} className="w-12 h-12 object-cover rounded-lg" alt={p.name} />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-xs font-bold text-brand-charcoal truncate">{p.name}</p>
                            <p className="text-[10px] text-brand-charcoal/50 font-mono">${p.price} / Guest</p>
                          </div>
                          <button onClick={() => toggleWishlist(p.id, "packages")} className="text-brand-red p-1 hover:bg-brand-red/10 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hotels saved */}
                  {wishlist.hotels.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase text-brand-charcoal/40 tracking-wider font-bold">Saved Hotels</p>
                      {allHotels.filter(h => wishlist.hotels.includes(h.id)).map(h => (
                        <div key={h.id} className="flex items-center gap-3 bg-brand-warmwhite p-2.5 rounded-xl border border-brand-blue-accent/10">
                          <img src={h.image} className="w-12 h-12 object-cover rounded-lg" alt={h.name} />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-xs font-bold text-brand-charcoal truncate">{h.name}</p>
                            <p className="text-[10px] text-brand-charcoal/50 font-mono">${h.price} / Night</p>
                          </div>
                          <button onClick={() => toggleWishlist(h.id, "hotels")} className="text-brand-red p-1 hover:bg-brand-red/10 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dining saved */}
                  {wishlist.restaurants.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase text-brand-charcoal/40 tracking-wider font-bold">Saved Halal Dining</p>
                      {allRestaurants.filter(r => wishlist.restaurants.includes(r.id)).map(r => (
                        <div key={r.id} className="flex items-center gap-3 bg-brand-warmwhite p-2.5 rounded-xl border border-brand-blue-accent/10">
                          <img src={r.image} className="w-12 h-12 object-cover rounded-lg" alt={r.name} />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-xs font-bold text-brand-charcoal truncate">{r.name}</p>
                            <p className="text-[10px] text-brand-charcoal/50 font-mono">{r.cuisine}</p>
                          </div>
                          <button onClick={() => toggleWishlist(r.id, "restaurants")} className="text-brand-red p-1 hover:bg-brand-red/10 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-brand-blue-accent/20">
              <a
                href="#quote-builder-section"
                onClick={() => setWishlistOpen(false)}
                className="w-full bg-brand-blue hover:bg-brand-blue-accent text-white font-serif font-bold text-center block py-3 rounded-xl border border-brand-blue-accent/30 transition-all text-sm"
              >
                Inquire For Saved Selections
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- RECENTLY VIEWED DRAWER ---------------- */}
      {recentDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-brand-blue-accent/20 animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-brand-blue-accent/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-brand-blue-accent" />
                  <h3 className="font-serif text-xl text-brand-charcoal font-bold">Browsing Footprints</h3>
                </div>
                <button onClick={() => setRecentDrawerOpen(false)} className="text-brand-charcoal/60 hover:text-brand-charcoal p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {recentlyViewed.length === 0 ? (
                <div className="py-16 text-center space-y-3 flex flex-col items-center justify-center">
                  <Eye className="w-10 h-10 text-brand-blue-accent opacity-40 animate-pulse" />
                  <p className="text-sm font-medium text-brand-charcoal/80">No footprint logs found yet.</p>
                  <p className="text-xs text-brand-charcoal/50 max-w-xs">As you browse tour packages, fine hotels, and historical mosques, your recently viewed list will populate here for quick access.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-mono uppercase text-brand-charcoal/40 tracking-wider font-bold">Recently Viewed Items</p>
                  <div className="grid grid-cols-1 gap-3">
                    {recentlyViewed.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 bg-brand-warmwhite p-3 rounded-xl border border-brand-blue-accent/10 hover:border-brand-green/30 cursor-pointer transition-all"
                        onClick={() => {
                          // Look up correct collection and re-open modal
                          let itemData;
                          if (item.category === "destination") itemData = allDestinations.find(x => x.id === item.id);
                          else if (item.category === "package") itemData = allPackages.find(x => x.id === item.id);
                          else if (item.category === "experience") itemData = allExperiences.find(x => x.id === item.id);
                          else if (item.category === "hotel") itemData = allHotels.find(x => x.id === item.id);
                          else if (item.category === "restaurant") itemData = allRestaurants.find(x => x.id === item.id);
                          else if (item.category === "mosque") itemData = allMosques.find(x => x.id === item.id);
                          else if (item.category === "guide") itemData = allGuides.find(x => x.id === item.id);

                          if (itemData) {
                            if (item.category === "destination") {
                              setActiveDestination(itemData);
                              setCurrentView("destination-detail");
                              setRecentDrawerOpen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else if (item.category === "experience") {
                              setActiveExperience(itemData);
                              setCurrentView("experience-detail");
                              setRecentDrawerOpen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else if (item.category === "package") {
                              setActivePackage(itemData);
                              setCurrentView("package-detail");
                              setRecentDrawerOpen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              setSelectedItem({ type: item.category as any, data: itemData });
                              setRecentDrawerOpen(false);
                            }
                          }
                        }}
                      >
                        <img src={item.image} className="w-14 h-14 object-cover rounded-xl" alt={item.name} />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-mono uppercase text-brand-blue-accent tracking-widest font-bold bg-brand-charcoal/5 px-2 py-0.5 rounded inline-block mb-1">
                            {item.category}
                          </span>
                          <p className="font-serif text-sm font-bold text-brand-charcoal truncate">{item.name}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-brand-blue-accent shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-brand-blue-accent/20 flex gap-2">
              <button
                onClick={() => setRecentlyViewed([])}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-mono text-xs font-bold py-3 rounded-xl border border-brand-blue-accent/30 transition-all"
              >
                Clear History Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- HERO SECTION ---------------- */}
      {currentView === "home" ? (
        <>
          <section className="relative min-h-[580px] lg:min-h-[660px] py-16 lg:py-22 flex items-center justify-center overflow-hidden">
        
        {/* Cinematic Backdrop Images representing premium tourism */}
        <div className="absolute inset-0 z-0">
          {(homepageSettings.heroImages || []).map((img: string, index: number) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentHeroImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img 
                src={img} 
                alt={`Hero Backdrop ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 hero-gradient" />
        </div>

        {/* Ambient floating glowing light */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero content container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-wider leading-tight max-w-5xl mx-auto font-bold drop-shadow">
            {homepageSettings.heroTitle}
          </h1>

          <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed font-sans drop-shadow">
            {homepageSettings.heroSubtitle}
          </p>

          {/* Floating Universal Search Bar */}
          <div className="pt-4 sm:pt-6 max-w-5xl mx-auto w-full">
            <div className="bg-brand-charcoal/80 backdrop-blur-md p-4 rounded-2xl sm:rounded-3xl border border-brand-blue-accent/30 shadow-2xl space-y-3">
              
              {/* Category tabs */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pb-2 border-b border-white/10">
                {[
                  { key: "All", name: "All Destinations" },
                  { key: "Hotels", name: "Luxury Hotels" },
                  { key: "Experiences", name: "Handpicked Experiences" },
                  { key: "Packages", name: "Tour Packages" },
                  { key: "Restaurants", name: "Halal Food" },
                  { key: "Mosques", name: "Featured Mosques" }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSearchCategory(cat.key)}
                    className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                      searchCategory === cat.key 
                        ? "bg-brand-blue-accent text-brand-charcoal" 
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Text Search Input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-brand-blue-accent" />
                  <input
                    type="text"
                    value={textSearch}
                    onChange={(e) => setTextSearch(e.target.value)}
                    placeholder={`Search within Cambodia ${searchCategory !== "All" ? searchCategory : "everything"}... (e.g. Sunrise, Halal, Angkor, Al-Serkal)`}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-white placeholder-white/40 outline-none focus:border-brand-blue-accent"
                  />
                  {textSearch && (
                    <button 
                      onClick={() => setTextSearch("")} 
                      className="absolute right-3 top-3 text-[10px] font-mono font-bold bg-white/10 text-white/80 hover:bg-white/20 px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    const el = document.getElementById("search-results-anchor");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-brand-blue hover:bg-brand-blue-accent text-white font-mono text-xs font-bold tracking-widest uppercase px-6 py-3.5 rounded-xl border border-brand-blue-accent/30 transition-all flex items-center justify-center gap-1 shrink-0 shadow"
                >
                  <Search className="w-3.5 h-3.5 text-brand-blue-accent" />
                  <span>Execute Search</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ---------------- SEARCH RESULTS SECTION (Anchored) ---------------- */}
      <div id="search-results-anchor" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${textSearch ? "py-8" : ""}`}>
        {textSearch && (
          <div className="bg-white rounded-2xl border border-brand-blue-accent/30 p-6 shadow-xl space-y-6 animate-fade-in mb-8">
            <div className="flex items-center justify-between border-b border-brand-blue-accent/10 pb-3">
              <div>
                <span className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold">Search Filter Diagnostics</span>
                <h4 className="text-xl font-serif text-brand-charcoal font-bold mt-1">
                  Results matching "{textSearch}"
                </h4>
              </div>
              <button 
                onClick={() => setTextSearch("")}
                className="text-xs font-mono font-bold text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 border border-brand-blue/20 px-3 py-1.5 rounded-xl transition-all"
              >
                Clear Search Results
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Filtered Packages matching */}
              {filteredPackages.map((p) => (
                <div key={p.id} className="bg-brand-warmwhite rounded-xl border border-brand-blue-accent/20 overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all">
                  <img src={p.image} className="w-full h-40 object-cover" alt={p.name} />
                  <div className="p-4 space-y-3">
                    <span className="text-[9px] font-mono bg-brand-blue-accent text-white font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs">Tour Package</span>
                    <h5 className="font-serif font-bold text-brand-charcoal text-base">{p.name}</h5>
                    <p className="text-xs text-brand-charcoal/70">{p.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-brand-blue-accent/10">
                      <span className="text-sm font-serif font-bold text-brand-green">${p.price} / Guest</span>
                      <a 
                        href={getItemUrl("package", p)}
                        onClick={(e) => handleLinkClick(e, "package", p)}
                        className="text-xs font-mono text-brand-charcoal font-bold flex items-center gap-1 hover:text-brand-blue-accent transition-colors cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Filtered Hotels matching */}
              {filteredHotels.map((h) => (
                <div key={h.id} className="bg-brand-warmwhite rounded-xl border border-brand-blue-accent/20 overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all">
                  <img src={h.image} className="w-full h-40 object-cover" alt={h.name} />
                  <div className="p-4 space-y-3">
                    <span className="text-[9px] font-mono bg-brand-blue-accent text-white font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs">Luxury Hotel</span>
                    <h5 className="font-serif font-bold text-brand-charcoal text-base">{h.name}</h5>
                    <p className="text-xs text-brand-charcoal/70">{h.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-brand-blue-accent/10">
                      <span className="text-sm font-serif font-bold text-brand-green">${h.price} / Night</span>
                      <a 
                        href={getItemUrl("hotel", h)}
                        onClick={(e) => handleLinkClick(e, "hotel", h)}
                        className="text-xs font-mono text-brand-charcoal font-bold flex items-center gap-1 hover:text-brand-blue-accent transition-colors cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Filtered Restaurants matching */}
              {filteredRestaurants.map((r) => (
                <div key={r.id} className="bg-brand-warmwhite rounded-xl border border-brand-blue-accent/20 overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all">
                  <img src={r.image} className="w-full h-40 object-cover" alt={r.name} />
                  <div className="p-4 space-y-3">
                    <span className="text-[9px] font-mono bg-cambodia-red text-white font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs">Halal Dining</span>
                    <h5 className="font-serif font-bold text-brand-charcoal text-base">{r.name}</h5>
                    <p className="text-xs text-brand-charcoal/70">{r.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-brand-blue-accent/10">
                      <span className="text-xs font-semibold text-brand-green">{r.cuisine}</span>
                      <a 
                        href={getItemUrl("restaurant", r)}
                        onClick={(e) => handleLinkClick(e, "restaurant", r)}
                        className="text-xs font-mono text-brand-charcoal font-bold flex items-center gap-1 hover:text-brand-blue-accent transition-colors cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Filtered Mosques matching */}
              {filteredMosques.map((m) => (
                <div key={m.id} className="bg-brand-warmwhite rounded-xl border border-brand-blue-accent/20 overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all">
                  <img src={m.image} className="w-full h-40 object-cover" alt={m.name} />
                  <div className="p-4 space-y-3">
                    <span className="text-[9px] font-mono bg-cambodia-red text-white font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs">Mosque</span>
                    <h5 className="font-serif font-bold text-brand-charcoal text-base">{m.name}</h5>
                    <p className="text-xs text-brand-charcoal/70">{m.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-brand-blue-accent/10">
                      <span className="text-xs font-mono font-bold text-brand-green">Cap: {m.capacity}</span>
                      <a 
                        href={getItemUrl("mosque", m)}
                        onClick={(e) => handleLinkClick(e, "mosque", m)}
                        className="text-xs font-mono text-brand-charcoal font-bold flex items-center gap-1 hover:text-brand-blue-accent transition-colors cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}

            </div>

            {filteredPackages.length === 0 && filteredHotels.length === 0 && filteredRestaurants.length === 0 && filteredMosques.length === 0 && (
              <p className="text-center text-sm font-medium text-brand-charcoal/50 py-12">
                No matching Cambodia travel elements found for "{textSearch}". Try simpler terms like "Angkor" or "Halal".
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---------------- MAIN LAYOUT WRAPPER ---------------- */}
      <div className="w-full">

        {/* ---------------- 1. WHY TRAVEL WITH AHLAN CAMBODIA ---------------- */}
        <div className="w-full bg-brand-lightbg py-20 border-b border-brand-blue-accent/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section id="why-travel" className="space-y-12">
          
          <div className="text-center space-y-5">
            <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
              WHY CHOOSE AHLAN CAMBODIA
            </h2>
            <p className="text-brand-charcoal/60 text-sm max-w-xl mx-auto leading-relaxed">
              We operate at the intersection of ultimate travel comfort and uncompromising Halal compliance, ensuring your spiritual values are fully respected.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(homepageSettings.whyChooseCards || defaultWhyChooseCards).map((item: any, i: number) => {
              const icons = [
                <ShieldCheck className="w-6 h-6 text-white" />,
                <Star className="w-6 h-6 text-white" />,
                <Utensils className="w-6 h-6 text-white" />,
                <Compass className="w-6 h-6 text-white" />
              ];
              return (
                <div key={i} className="bg-white rounded-2xl border border-brand-blue-accent/15 p-6 hover:scale-[1.03] hover:border-brand-green/30 transition-luxury shadow-sm flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="bg-brand-blue-accent hover:bg-brand-green group-hover:bg-brand-green p-3 rounded-xl inline-block border border-brand-green/20 transition-colors duration-300">
                      {icons[i % icons.length]}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-brand-charcoal">{item.title}</h3>
                    <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- 2. POPULAR DESTINATIONS ---------------- */}
    <div className="w-full bg-white py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="destinations" className="space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-blue-accent/20 pb-4">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
                Popular Destinations
              </h2>
            </div>
            <p className="text-brand-charcoal/60 text-xs sm:text-sm max-w-md leading-relaxed">
              Explore Cambodia's legendary heritage hubs, sophisticated riversides, and private white-sand island reserves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {(() => {
              const phnomPenh = allDestinations.find(d => d.id === "phnom-penh");
              const siemReap = allDestinations.find(d => d.id === "siem-reap");
              const others = allDestinations.filter(d => d.id !== "phnom-penh" && d.id !== "siem-reap");
              const ordered = [];
              if (phnomPenh) ordered.push(phnomPenh);
              if (siemReap) ordered.push(siemReap);
              ordered.push(...others);
              return ordered;
            })().map((dest) => (
              <div 
                key={dest.id} 
                className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm group hover:scale-[1.02] hover:shadow-lg transition-luxury flex flex-col justify-between"
              >
                <div className="relative overflow-hidden h-52">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="inline-block bg-white/95 text-brand-blue-accent border border-brand-blue-accent/20 font-mono text-[9px] font-extrabold px-2.5 py-0.5 rounded-md shadow-sm tracking-widest uppercase mb-1">
                      {dest.region}
                    </span>
                    <h3 className="font-serif text-xl font-bold">{dest.name}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed">
                      {dest.description}
                    </p>

                    {/* Highlights Preview */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-brand-blue-accent tracking-wider uppercase font-bold">
                        ★ Highlights
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dest.highlights.map((h, i) => (
                          <span key={i} className="text-[9px] font-mono bg-brand-lightbg border border-brand-blue-accent/10 px-2 py-0.5 rounded text-brand-charcoal/70">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-brand-blue-accent/10 flex items-center justify-end">
                    <a 
                      href={getItemUrl("destination", dest)}
                      onClick={(e) => handleLinkClick(e, "destination", dest)}
                      className="text-xs font-mono text-brand-charcoal font-bold uppercase tracking-wider hover:text-brand-blue-accent transition-all cursor-pointer"
                    >
                      Explore →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- 3. FEATURED TOUR PACKAGES ---------------- */}
    <div className="w-full bg-brand-lightbg py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="packages" className="space-y-12">
          
          <div className="text-center space-y-5">
            <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
              Featured Tour Packages
            </h2>
            <p className="text-brand-charcoal/60 text-sm max-w-xl mx-auto leading-relaxed">
              Curated master itineraries incorporating seamless custom transit, private local historians, and certified dining.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPackages.slice(0, 3).map((pack) => {
              const isSaved = wishlist.packages.includes(pack.id);
              const destinationTag = pack.destinations && pack.destinations.length > 0
                ? pack.destinations.join(" • ")
                : (pack as any).destination || (pack as any).location || (
                    `${pack.name} ${pack.description}`.toLowerCase().includes("siem reap") ? "Siem Reap" :
                    `${pack.name} ${pack.description}`.toLowerCase().includes("phnom penh") ? "Phnom Penh" :
                    `${pack.name} ${pack.description}`.toLowerCase().includes("koh rong") ? "Koh Rong" : "Cambodia"
                  );

              return (
                <div 
                  key={pack.id} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.008] hover:border-brand-blue-accent transition-luxury flex flex-col border border-brand-blue-accent/15"
                >
                  {/* Top Cover Image */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                    <img 
                      src={pack.image} 
                      alt={pack.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/50 via-transparent to-transparent" />
                    
                    {/* Floating Duration badge */}
                    <div className="absolute top-4 left-4 bg-brand-blue-accent border border-white/10 px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-white flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3 text-white shrink-0" />
                      <span>{pack.duration}</span>
                    </div>

                    {/* Floating Destination Tag on image */}
                    {destinationTag && (
                      <div className="absolute bottom-3 left-3 bg-[#0F1626]/85 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md max-w-[80%]">
                        <MapPin className="w-3 h-3 text-brand-blue-accent shrink-0" />
                        <span className="truncate">{destinationTag}</span>
                      </div>
                    )}

                    {/* Floating Save button */}
                    <button
                      onClick={() => toggleWishlist(pack.id, "packages")}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2 rounded-full shadow border border-brand-blue-accent/20 transition-all cursor-pointer"
                      title={isSaved ? "Saved to wishlist" : "Save Package"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                    </button>
                  </div>

                  {/* Card Content body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-serif font-bold text-brand-charcoal tracking-wide leading-snug">
                        {pack.name}
                      </h3>
                      <p className="text-brand-charcoal/80 text-xs leading-relaxed font-sans">
                        {pack.brief || pack.description}
                      </p>
                    </div>

                    {/* Package Highlights - Individual Pill Chips with Light Blue Background & Checkmark */}
                    <div className="flex flex-col gap-1.5 py-1">
                      {(pack.keyHighlights && pack.keyHighlights.length > 0
                        ? pack.keyHighlights
                        : pack.features.slice(0, 3)
                      ).map((feature, idx) => (
                        <div 
                          key={idx} 
                          className="w-fit max-w-full bg-[#F0F7FF] border border-[#D8E8FC] px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-slate-800 font-sans font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          <span className="text-slate-900 font-bold text-[10px] shrink-0">✓</span>
                          <span className="truncate leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer action button */}
                    <div className="pt-3 border-t border-brand-blue-accent/10 flex items-center justify-between gap-2">
                      <div className="text-left">
                        <span className="text-[8px] font-mono text-brand-charcoal/40 block leading-none">P.P Price from</span>
                        <span className="text-base font-serif font-bold text-brand-green">${pack.price} <span className="text-[10px] font-mono font-normal text-brand-charcoal/50">USD</span></span>
                      </div>
                      <a
                        href={getItemUrl("package", pack)}
                        onClick={(e) => handleLinkClick(e, "package", pack)}
                        className="text-[10px] font-mono bg-brand-blue hover:bg-brand-blue-accent text-white px-3 py-1.5 rounded-lg border border-brand-blue-accent/20 font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        Detail →
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* View More Packages button */}
          <div className="text-center pt-4">
            <a
              href="/packages"
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.button === 1 || e.shiftKey) return;
                e.preventDefault();
                setCurrentView("packages");
                window.history.pushState(null, "", "/packages");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <span>View More Packages</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- 4. HANDPICKED EXPERIENCES ---------------- */}
    <div className="w-full bg-white py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="experiences" className="space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-blue-accent/20 pb-4">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
                Handpicked Khmer Experiences
              </h2>
            </div>
            <p className="text-brand-charcoal/60 text-xs sm:text-sm max-w-md leading-relaxed">
              Elevate your stay with signature day-trips highlighting Cambodia’s pristine natural reserves and Muslim-friendly artisan crafts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allExperiences.slice(0, 3).map((exp) => {
              const isSaved = wishlist.experiences.includes(exp.id);
              return (
                <div key={exp.id} className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm group hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="relative overflow-hidden h-40">
                    <img src={exp.image} alt={exp.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                    <span className={`absolute top-3 left-3 text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg shadow-sm border border-white/10 ${
                      exp.category.toLowerCase() === "heritage" || exp.category.toLowerCase() === "nature"
                        ? "bg-brand-blue-accent"
                        : "bg-cambodia-red"
                    }`}>
                      {exp.category}
                    </span>
                    <button
                      onClick={() => toggleWishlist(exp.id, "experiences")}
                      className="absolute top-3 right-3 bg-white/85 hover:bg-white p-1.5 rounded-lg transition-all"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal"}`} />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-brand-charcoal mb-1">{exp.name}</h4>
                      <p className="text-xs text-brand-charcoal/60 mb-1 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-brand-blue-accent" /> {exp.location} • {exp.duration}
                      </p>
                      <p className="text-brand-charcoal/85 text-xs mt-2 leading-relaxed">
                        {exp.shortDescription || exp.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-brand-blue-accent/10 text-right">
                      <a 
                        href={getItemUrl("experience", exp)}
                        onClick={(e) => handleLinkClick(e, "experience", exp)}
                        className="text-xs font-mono text-brand-charcoal font-bold hover:text-brand-blue-accent transition-all uppercase tracking-wider cursor-pointer"
                      >
                        Explore →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View More Experiences button */}
          <div className="text-center pt-4">
            <a
              href="/experiences"
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.button === 1 || e.shiftKey) return;
                e.preventDefault();
                setCurrentView("experiences");
                window.history.pushState(null, "", "/experiences");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <span>View More Experiences</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- 5. SELECT PREMIUM STAYS ---------------- */}
    <div className="w-full bg-brand-lightbg py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="hotels" className="space-y-12">
          
          <div className="text-center space-y-5">
            <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
              Select Premium Stays
            </h2>
            <p className="text-brand-charcoal/60 text-sm max-w-xl mx-auto leading-relaxed">
              Exquisite properties offering private spaces, certified halal selections, and seamless proximity to mosques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allHotels.slice(0, 3).map((hotel) => {
              const isSaved = wishlist.hotels.includes(hotel.id);
              return (
                <div 
                  key={hotel.id} 
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card image container */}
                  <div className="relative h-52 overflow-hidden">
                    <img 
                      src={hotel.image || NO_PHOTO_AVAILABLE_PLACEHOLDER} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = NO_PHOTO_AVAILABLE_PLACEHOLDER; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Floating Wishlist Heart */}
                    <button
                      onClick={() => toggleWishlist(hotel.id, "hotels")}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow-md transition-all cursor-pointer"
                      title={isSaved ? "Saved to wishlist" : "Save Hotel"}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                    </button>

                    {/* Overlaid Stars */}
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {[...Array(hotel.stars || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Title & Location Overlaid on Bottom of Image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-serif text-lg font-bold uppercase tracking-wide leading-tight drop-shadow-xs line-clamp-1">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-white/90 font-mono flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-brand-blue-accent shrink-0" />
                        <span className="truncate">{hotel.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Content body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-brand-charcoal/75 text-xs leading-relaxed font-sans">
                      {hotel.description}
                    </p>

                    {/* Hotel Features / Highlights - Unboxed & Refined */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-blue-accent tracking-wider uppercase">
                        <Sparkles className="w-3 h-3 text-brand-blue-accent" />
                        <span>Hotel Features</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {(hotel.keyHighlights && hotel.keyHighlights.length > 0
                          ? hotel.keyHighlights
                          : [hotel.prayerFacilities || "Qibla & Prayer Mat", hotel.halalBreakfast || "Halal Breakfast", "Luxury Rooms"]
                        ).slice(0, 3).map((feat, idx) => (
                          <div 
                            key={idx} 
                            className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat.replace("Luxury ", "").replace("Full Service ", "").replace("Free High-Speed ", "Free ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer action button */}
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <a 
                        href={getItemUrl("hotel", hotel)}
                        onClick={(e) => handleLinkClick(e, "hotel", hotel)}
                        className="inline-flex items-center gap-1.5 bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View More Stays button */}
          <div className="text-center pt-4">
            <a
              href="/hotels"
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.button === 1 || e.shiftKey) return;
                e.preventDefault();
                setCurrentView("hotels");
                window.history.pushState(null, "", "/hotels");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <span>View More Stays</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- 6. VERIFIED FOOD GUIDE ---------------- */}
    <div className="w-full bg-white py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="halal-dining" className="space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-blue-accent/20 pb-4">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
                Verified Food Guide
              </h2>
            </div>
            <p className="text-brand-charcoal/60 text-xs sm:text-sm max-w-md leading-relaxed">
              Dine with absolute conviction. Discover verified, clean restaurants serving traditional Khmer, Malaysian, and Mughlai flavors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allRestaurants.slice(0, 4).map((rest) => {
              const isSaved = wishlist.restaurants.includes(rest.id);
              return (
                <div 
                  key={rest.id}
                  className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-brand-blue-accent transition-all duration-300"
                >
                  {/* Cover image with tags */}
                  <div className="relative h-52 overflow-hidden">
                    <img 
                      src={rest.image} 
                      alt={rest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    
                    {/* Floating Save button */}
                    <button
                      onClick={() => toggleWishlist(rest.id, "restaurants")}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-brand-charcoal p-2.5 rounded-full shadow-md transition-all cursor-pointer"
                      title={isSaved ? "Saved to wishlist" : "Save Dining Option"}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "text-brand-red fill-brand-red" : "text-brand-charcoal/60"}`} />
                    </button>

                    {/* Overlaid Dining status tags - Only Halal Verified shown on cards */}
                    {rest.halalCertified && (
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                        <span className="bg-brand-blue-accent text-white text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md shadow-xs">
                          HALAL VERIFIED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1 text-[10px] font-mono uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 text-brand-blue-accent font-bold">
                          <Utensils className="w-3.5 h-3.5 shrink-0" />
                          <span>{rest.cuisine}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-brand-blue-accent font-bold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{rest.location}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-serif font-bold text-brand-charcoal uppercase tracking-wide leading-snug mt-1.5">
                        {rest.name}
                      </h3>
                      <p className="text-brand-charcoal/75 text-xs sm:text-sm leading-relaxed font-sans">
                        {rest.description}
                      </p>
                    </div>

                    {/* Footer action */}
                    <div className="pt-4 border-t border-brand-blue-accent/10 flex items-center justify-end text-xs">
                      <a 
                        href={getItemUrl("restaurant", rest)}
                        onClick={(e) => handleLinkClick(e, "restaurant", rest)}
                        className="bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                      >
                        EXPLORE →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View More Food Options button */}
          <div className="text-center pt-4">
            <a
              href="/dining"
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.button === 1 || e.shiftKey) return;
                e.preventDefault();
                setCurrentView("restaurants");
                window.history.pushState(null, "", "/dining");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <span>View More Food Options</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- 7. FEATURED MOSQUES ---------------- */}
    <div className="w-full bg-brand-lightbg py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="mosques" className="space-y-12">
          
          <div className="text-center space-y-5">
            <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
              Featured Mosques in Cambodia
            </h2>
            <p className="text-brand-charcoal/60 text-sm max-w-xl mx-auto leading-relaxed">
              Majestic hubs of worship providing daily congregation prayers, Jummah services, and serene community connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allMosques.slice(0, 3).map((mosque) => (
              <div key={mosque.id} className="bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm flex flex-col justify-between hover:border-brand-blue-accent transition-all group">
                <div className="relative overflow-hidden h-48">
                  <img src={mosque.image} alt={mosque.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="inline-flex items-center gap-1 bg-white/95 text-brand-blue-accent border border-brand-blue-accent/20 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm tracking-widest uppercase mb-1.5">
                      <MapPin className="w-3 h-3 text-brand-blue-accent" /> {(mosque.location.split(",")[1] || mosque.location).trim()}
                    </span>
                    <h3 className="font-serif text-lg font-bold">{mosque.name}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed">
                    {mosque.description}
                  </p>

                  <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl font-mono text-xs space-y-1 text-brand-charcoal/80">
                    <div>Friday Khutbah: <span className="text-brand-green font-bold">{mosque.fridayPrayerTime}</span></div>
                    <div>Capacity: <span className="text-brand-green font-bold">{mosque.capacity}</span></div>
                  </div>

                  <div className="pt-3 border-t border-brand-blue-accent/10 text-right">
                    <a
                      href={getItemUrl("mosque", mosque)}
                      onClick={(e) => handleLinkClick(e, "mosque", mosque)}
                      className="text-xs font-mono text-brand-charcoal font-bold hover:text-brand-blue-accent transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Discover →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More Mosques button */}
          <div className="text-center pt-4">
            <a
              href="/mosques"
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.button === 1 || e.shiftKey) return;
                e.preventDefault();
                setCurrentView("mosques");
                window.history.pushState(null, "", "/mosques");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <span>View More Mosques</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- INTEGRATED PRAYER WEATHER & CURRENCY WIDGET ---------------- */}
    <div className="w-full bg-white py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <div className="text-center">
            <p className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold mb-1">REAL-TIME TELEMETRY</p>
            <h3 className="font-serif text-2xl text-brand-charcoal font-bold">Kingdom Utilities Terminal</h3>
          </div>
          <PrayerWeatherWidget />
        </section>
      </div>
    </div>

    {/* ---------------- 8. TRAVEL INSPIRATION (EDITORIAL) ---------------- */}
    <div className="w-full bg-brand-lightbg py-20 border-b border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="travel-inspiration" className="space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-blue-accent/20 pb-4">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
                Kingdom Inspiration Chronicles
              </h2>
            </div>
            <p className="text-brand-charcoal/60 text-xs sm:text-sm max-w-md leading-relaxed">
              Carefully researched articles to prepare your journey covering visas, traditional customs, and culinary tips.
            </p>
          </div>

          {(() => {
            // Sort guides by date descending (most recent first)
            const sortedGuides = [...allGuides].sort((a, b) => {
              const timeA = a.date ? new Date(a.date).getTime() : 0;
              const timeB = b.date ? new Date(b.date).getTime() : 0;
              if (isNaN(timeA) || isNaN(timeB) || timeA === timeB) return 0;
              return timeB - timeA;
            });

            // Dynamically take the top 4 most updated posts
            const top4Guides = sortedGuides.slice(0, 4);
            const featuredGuide = top4Guides[0];
            const sideGuides = top4Guides.slice(1, 4);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Featured Article Side */}
                {featuredGuide && (
                  <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-blue-accent/15 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-brand-green/30 transition-all">
                    <div className="flex flex-col flex-1">
                      <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] overflow-hidden rounded-t-3xl">
                        <img src={featuredGuide.image} alt={featuredGuide.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-2">
                          <span className="bg-cambodia-red text-white text-[9px] font-mono font-bold uppercase px-3 py-1 rounded-md shadow-sm border border-white/10 inline-block">
                            {featuredGuide.category}
                          </span>
                          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight leading-tight">{featuredGuide.title}</h3>
                          <p className="text-white/80 text-[10px] sm:text-xs font-mono uppercase font-bold">
                            <span>{featuredGuide.readTime}</span>
                          </p>
                        </div>
                      </div>
                      <div className="p-5 sm:p-6">
                        <p className="text-brand-charcoal/80 text-xs sm:text-sm leading-relaxed">
                          {featuredGuide.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-brand-blue-accent/10 flex justify-end">
                      <a 
                        href={getItemUrl("guide", featuredGuide)}
                        onClick={(e) => handleLinkClick(e, "guide", featuredGuide)}
                        className="bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold tracking-widest uppercase py-2.5 px-6 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg inline-block cursor-pointer"
                      >
                        READ
                      </a>
                    </div>
                  </div>
                )}

                {/* Side Grid Articles (3 side posts) */}
                <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                  {sideGuides.map((guide) => (
                    <div key={guide.id} className="bg-white rounded-3xl border border-brand-blue-accent/15 p-4 sm:p-5 flex gap-4 sm:gap-5 items-center hover:border-brand-blue-accent transition-all shadow-sm flex-1">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 shrink-0 rounded-2xl overflow-hidden border border-brand-blue-accent/10">
                        <img src={guide.image} className="w-full h-full object-cover" alt={guide.title} />
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-0.5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-cambodia-red font-bold uppercase tracking-wider block">{guide.category}</span>
                          <h4 className="font-serif font-bold text-xs sm:text-sm md:text-base text-brand-charcoal uppercase leading-snug tracking-tight line-clamp-2">{guide.title}</h4>
                          <p className="text-xs text-brand-charcoal/65 leading-relaxed line-clamp-2 mt-1">{guide.description}</p>
                        </div>
                        <a 
                          href={getItemUrl("guide", guide)}
                          onClick={(e) => handleLinkClick(e, "guide", guide)}
                          className="text-xs font-mono font-bold text-brand-charcoal hover:text-brand-blue-accent transition-colors flex items-center gap-1 mt-2 cursor-pointer font-serif"
                        >
                          <span>Read</span>
                          <span>→</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* View More Articles button */}
          <div className="text-center pt-4">
            <a
              href="/inspiration"
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey || e.button === 1 || e.shiftKey) return;
                e.preventDefault();
                setCurrentView("inspiration");
                window.history.pushState(null, "", "/inspiration");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent text-white font-mono text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl border border-brand-blue-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer group"
            >
              <span>View More Articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>

    {/* ---------------- 9. VIDEOS FROM MUSLIM TRAVELLERS ---------------- */}
    {combinedHomeVideos.length > 0 && (
      <div className="w-full bg-white py-20 border-b border-brand-blue-accent/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section id="videos" className="space-y-12">
            
            <div className="text-center space-y-5">
              <h2 className="text-3xl sm:text-4xl font-serif text-brand-charcoal font-bold">
                Videos From Muslim Travellers
              </h2>
              <p className="text-brand-charcoal/60 text-sm max-w-xl mx-auto leading-relaxed">
                Step into the sights directly. Watch authentic travel logs, culinary walkthroughs, and pristine island tours from our global guests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {combinedHomeVideos.map((vid) => (
                <SocialVideoCard
                  key={vid.id}
                  video={vid}
                  fallbackName={vid.fallbackName}
                  restaurantImage={vid.restaurantImage}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    )}





    {/* ---------------- CAMBODIA SEASONS & TELEMETRY SECTION ---------------- */}
    <CambodiaEssentialInfo />



    {/* ---------------- 12. NEWSLETTER SUBSCRIPTION ---------------- */}
    <div className="w-full bg-white py-20 border-t border-brand-blue-accent/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="newsletter" className="bg-[#0F1626] text-white rounded-3xl border border-brand-blue-accent/30 p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--color-brand-blue-accent) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          
          <div className="max-w-xl mx-auto space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold">Join the Circle of Connoisseurs</h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Receive periodic private flight announcements, custom seasonal itineraries, and exclusive Halal dining discounts directly in your inbox.
            </p>

            {newsletterSubscribed ? (
              <div className="bg-brand-blue-accent/20 border border-brand-blue-accent/40 rounded-xl p-4 text-xs font-mono font-bold text-brand-blue-accent animate-fade-in">
                ✓ JazakAllah Khair. You are subscribed to the Ahlan Grand Chronicles.
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail) setNewsletterSubscribed(true);
                }}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your refined email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-blue-accent text-white placeholder:text-white/50 text-center sm:text-left"
                />
                <button
                  type="submit"
                  className="bg-brand-blue-accent hover:bg-brand-blue-accent/80 text-white font-serif font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-[10px] text-white/50 font-mono">
              We respect your privacy. Unsubscribe at any time with a single click.
            </p>
          </div>
        </section>
      </div>
    </div>

  </div>

        </>
      ) : currentView === "destinations" ? (
        <DestinationsPage 
          destinations={allDestinations}
          wishlist={wishlist.destinations || []}
          onToggleWishlist={(id) => {
            const category = "destinations";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onSelectItem={(dest) => {
            setActiveDestination(dest);
            setCurrentView("destination-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "destination-detail" && activeDestination ? (
        <DestinationDetailPage 
          destination={activeDestination}
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onUpdateDestination={(updatedDest) => {
            handleUpdateDestination(updatedDest);
            setActiveDestination(updatedDest);
          }}
          onBack={() => {
            setCurrentView("destinations");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          hotels={allHotels}
          packages={allPackages}
          experiences={allExperiences}
          mosques={allMosques}
          restaurants={allRestaurants}
          guides={allGuides}
          wishlist={wishlist}
          onToggleWishlist={(category, id) => {
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onSelectItem={(type, item) => {
            if (type === "experience") {
              setActiveExperience(item);
              setCurrentView("experience-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
              addToRecentlyViewed({
                id: item.id,
                name: item.name,
                category: "experience",
                image: item.image
              });
            } else if (type === "package") {
              setActivePackage(item);
              setCurrentView("package-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
              addToRecentlyViewed({
                id: item.id,
                name: item.name,
                category: "package",
                image: item.image
              });
            } else if (type === "hotel") {
              setActiveHotel(item);
              setCurrentView("hotel-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
              addToRecentlyViewed({
                id: item.id,
                name: item.name,
                category: "hotel",
                image: item.image
              });
            } else if (type === "mosque") {
              setActiveMosque(item);
              setCurrentView("mosque-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
              addToRecentlyViewed({
                id: item.id,
                name: item.name,
                category: "mosque",
                image: item.image
              });
            } else if (type === "restaurant") {
              setActiveRestaurant(item);
              setCurrentView("dining-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
              addToRecentlyViewed({
                id: item.id,
                name: item.name,
                category: "restaurant",
                image: item.image
              });
            } else if (type === "guide") {
              setActiveGuide(item);
              setCurrentView("blog-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
              addToRecentlyViewed({
                id: item.id,
                name: item.title || item.name,
                category: "guide",
                image: item.image
              });
            } else {
              setSelectedItem({ type, data: item });
            }
          }}
          onInquire={() => {
            navigateToSection("quote-builder-section");
          }}
        />
      ) : currentView === "experience-detail" && activeExperience ? (
        <ExperienceDetailPage 
          experience={activeExperience}
          onBack={() => {
            if (activeDestination) {
              setCurrentView("destination-detail");
            } else {
              setCurrentView("experiences");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          wishlist={wishlist.experiences || []}
          onToggleWishlist={(id) => {
            const category = "experiences";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onInquire={() => {
            navigateToSection("quote-builder-section");
          }}
          onSelectExperience={(exp) => {
            setActiveExperience(exp);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "experiences" ? (
        <ExperiencesPage 
          experiences={allExperiences}
          wishlist={wishlist.experiences || []}
          onToggleWishlist={(id) => {
            const category = "experiences";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onSelectItem={(exp) => {
            setActiveExperience(exp);
            setCurrentView("experience-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: exp.id,
              name: exp.name,
              category: "experience",
              image: exp.image
            });
          }}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "package-detail" && activePackage ? (
        <PackageDetailPage 
          tourPackage={activePackage}
          onBack={() => {
            if (activeDestination) {
              setCurrentView("destination-detail");
            } else {
              setCurrentView("packages");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          wishlist={wishlist.packages || []}
          onToggleWishlist={(id) => {
            const category = "packages";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onInquire={(customDetails) => {
            console.log("Inquiry details captured for custom quote:", customDetails);
            navigateToSection("quote-builder-section");
          }}
          allPackages={allPackages}
          onSelectPackage={(pkg) => {
            setActivePackage(pkg);
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: pkg.id,
              name: pkg.name,
              category: "package",
              image: pkg.image
            });
          }}
          onOpenInquiry={(pkg) => {
            setActivePackage(pkg);
            setCurrentView("package-inquiry");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "package-inquiry" && activePackage ? (
        <PackageInquiryPage
          tourPackage={activePackage}
          onBack={() => {
            setCurrentView("package-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "hotel-detail" && (activeHotel || allHotels[0]) ? (
        <HotelDetailV2
          hotel={activeHotel || allHotels[0]}
          allHotels={allHotels}
          allRestaurants={allRestaurants}
          allMosques={allMosques}
          onSelectHotel={(h) => {
            setActiveHotel(h);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateView={(view) => {
            setCurrentView(view as any);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onBack={() => {
            if (activeDestination) {
              setCurrentView("destination-detail");
            } else {
              setCurrentView("hotels");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSelectDestination={(destName) => {
            const found = allDestinations.find(d => d.name.toLowerCase().includes(destName.toLowerCase()));
            if (found) {
              setActiveDestination(found);
              setCurrentView("destination-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onRefreshHotel={async (hotelId) => {
            const target = allHotels.find(h => h.id === hotelId);
            if (!target?.placeId) {
              alert("This hotel has no Google Place ID registered. Please import it via Admin CMS.");
              return;
            }
            const res = await fetch(`/api/google-places/hotel-details?placeId=${encodeURIComponent(target.placeId)}`);
            if (res.ok) {
              try {
                const text = await res.text();
                const data = JSON.parse(text);
                if (data.success && data.hotel) {
                  const updated: Hotel = {
                    ...target,
                    rating: data.hotel.rating || target.rating,
                    reviewCount: data.hotel.reviewCount || target.reviewCount,
                    phoneNumber: data.hotel.phoneNumber || target.phoneNumber,
                    website: data.hotel.website || target.website,
                    photoUrls: data.hotel.photoUrls?.length ? data.hotel.photoUrls : target.photoUrls,
                    image: data.hotel.photoUrls?.[0] || target.image,
                    lastUpdated: new Date().toISOString(),
                    guestReviews: data.hotel.guestReviews || target.guestReviews
                  };
                  await handleUpdateHotel(updated);
                }
              } catch {
                alert("Unable to parse Google Places response.");
              }
            }
          }}
          isAdmin={true}
        />
      ) : currentView === "dining-detail" && activeRestaurant ? (
        <DiningDetailPage 
          restaurant={activeRestaurant}
          onBack={() => {
            if (activeDestination) {
              setCurrentView("destination-detail");
            } else {
              setCurrentView("restaurants");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          wishlist={wishlist.restaurants || []}
          onToggleWishlist={(id) => {
            const category = "restaurants";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onInquire={(details) => {
            console.log("Inquiry details captured for dining:", details);
            navigateToSection("quote-builder-section");
          }}
        />
      ) : currentView === "packages" ? (
        <PackagesPage 
          packages={allPackages}
          wishlist={wishlist.packages || []}
          onToggleWishlist={(id) => {
            const category = "packages";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onSelectItem={(pkg) => {
            setActivePackage(pkg);
            setCurrentView("package-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: pkg.id,
              name: pkg.name,
              category: "package",
              image: pkg.image
            });
          }}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "hotels" ? (
        <HotelsPage 
          hotels={allHotels}
          wishlist={wishlist.hotels || []}
          onToggleWishlist={(id) => {
            const category = "hotels";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onSelectItem={(hotel) => {
            setActiveHotel(hotel);
            setCurrentView("hotel-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: hotel.id,
              name: hotel.name,
              category: "hotel",
              image: hotel.image
            });
          }}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "restaurants" ? (
        <HalalDiningPage 
          restaurants={allRestaurants}
          wishlist={wishlist.restaurants || []}
          onToggleWishlist={(id) => {
            const category = "restaurants";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          onSelectItem={(rest) => {
            setActiveRestaurant(rest);
            setCurrentView("dining-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: rest.id,
              name: rest.name,
              category: "restaurant",
              image: rest.image
            });
          }}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "mosques" ? (
        <MosquesPage 
          mosques={allMosques}
          onSelectItem={(mosque) => {
            setActiveMosque(mosque);
            setCurrentView("mosque-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: mosque.id,
              name: mosque.name,
              category: "mosque",
              image: mosque.image
            });
          }}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "mosque-detail" && activeMosque ? (
        <MosqueDetailPage 
          mosque={activeMosque}
          onBack={() => {
            if (activeDestination) {
              setCurrentView("destination-detail");
            } else {
              setCurrentView("mosques");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          wishlist={wishlist.mosques || []}
          onToggleWishlist={(id) => {
            const category = "mosques";
            const updatedList = wishlist[category]?.includes(id)
              ? wishlist[category].filter((x) => x !== id)
              : [...(wishlist[category] || []), id];
            
            setWishlist({
              ...wishlist,
              [category]: updatedList
            });
          }}
          allRestaurants={allRestaurants}
          onSelectRestaurant={(rest) => {
            setActiveRestaurant(rest);
            setCurrentView("dining-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: rest.id,
              name: rest.name,
              category: "restaurant",
              image: rest.image
            });
          }}
        />
      ) : currentView === "admin-cms" ? (
        <AdminCMS 
          destinations={allDestinations}
          onAddDestination={handleAddDestination}
          onUpdateDestination={handleUpdateDestination}
          onDeleteDestination={handleDeleteDestination}
          experiences={allExperiences}
          onAddExperience={handleAddExperience}
          onUpdateExperience={handleUpdateExperience}
          onDeleteExperience={handleDeleteExperience}
          packages={allPackages}
          onAddPackage={handleAddPackage}
          onUpdatePackage={handleUpdatePackage}
          onDeletePackage={handleDeletePackage}
          hotels={allHotels}
          onAddHotel={handleAddHotel}
          onUpdateHotel={handleUpdateHotel}
          onDeleteHotel={handleDeleteHotel}
          restaurants={allRestaurants}
          onAddRestaurant={handleAddRestaurant}
          onUpdateRestaurant={handleUpdateRestaurant}
          onDeleteRestaurant={handleDeleteRestaurant}
          mosques={allMosques}
          onAddMosque={handleAddMosque}
          onUpdateMosque={handleUpdateMosque}
          onDeleteMosque={handleDeleteMosque}
          homepageSettings={homepageSettings}
          onUpdateHomepageSettings={setHomepageSettings}
          generalConfig={generalConfig}
          onUpdateGeneralConfig={setGeneralConfig}
          travelGuides={allGuides}
          onAddGuide={handleAddGuide}
          onUpdateGuide={handleUpdateGuide}
          onDeleteGuide={handleDeleteGuide}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "inspiration" ? (
        <InspirationPage 
          travelGuides={allGuides}
          onSelectItem={(guide) => {
            setActiveGuide(guide);
            setCurrentView("blog-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: guide.id,
              name: guide.title,
              category: "guide",
              image: guide.image
            });
          }}
          onBack={() => {
            setCurrentView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : currentView === "blog-detail" && activeGuide ? (
        <BlogDetailPage 
          guide={activeGuide}
          onBack={() => {
            if (activeDestination) {
              setCurrentView("destination-detail");
            } else {
              setCurrentView("inspiration");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateView={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          allGuides={allGuides}
          onSelectGuide={(guide) => {
            setActiveGuide(guide);
            setCurrentView("blog-detail");
            window.scrollTo({ top: 0, behavior: "smooth" });
            addToRecentlyViewed({
              id: guide.id,
              name: guide.title,
              category: "guide",
              image: guide.image
            });
          }}
        />
      ) : null}


      {/* ---------------- 13. COMPREHENSIVE MEGA FOOTER ---------------- */}
      {currentView !== "admin-cms" && (
        <footer className="relative bg-[#0F1626] text-white border-t border-brand-blue-accent/20 pt-16 pb-8 font-sans">
        {/* Cambodian Flag Decorative Ribbon Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex select-none pointer-events-none">
          <div className="w-1/4 bg-[#032F6F]" />
          <div className="w-1/2 bg-[#E01A22]" />
          <div className="w-1/4 bg-[#032F6F]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-2">
            {/* Logo - Using Uploaded Logo-Navbar.png Image or Custom Footer Logo */}
            <div className="flex select-none">
              <div className="flex items-center justify-start py-1">
                <TransparentLogo 
                  src={generalConfig.footerLogo || logoImg} 
                  alt="Ahlan Cambodia Logo" 
                  className="h-12 sm:h-16 w-auto object-contain"
                  scrolled={false}
                />
              </div>
            </div>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-sm">
              {generalConfig.companyDesc}
            </p>
            <div className="space-y-2.5 font-mono text-sm text-white/50 pt-2">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-blue-accent" />
                <span>{generalConfig.contactNumber}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-blue-accent" />
                <span>{generalConfig.emailAddress}</span>
              </p>
              {generalConfig.showAddress && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-blue-accent" />
                  <span>{generalConfig.address}</span>
                </p>
              )}
            </div>

            {/* Dynamic Social Links in Footer */}
            {generalConfig.socialLinks && Object.values(generalConfig.socialLinks).some(Boolean) && (
              <div className="flex items-center gap-3 pt-4">
                {generalConfig.socialLinks.facebook && (
                  <a href={generalConfig.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-blue-accent hover:text-[#0F1626] transition-luxury" title="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {generalConfig.socialLinks.instagram && (
                  <a href={generalConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-blue-accent hover:text-[#0F1626] transition-luxury" title="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {generalConfig.socialLinks.twitter && (
                  <a href={generalConfig.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-blue-accent hover:text-[#0F1626] transition-luxury" title="Twitter / X">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {generalConfig.socialLinks.youtube && (
                  <a href={generalConfig.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-blue-accent hover:text-[#0F1626] transition-luxury" title="YouTube">
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4">
            <h4 className="font-serif text-brand-blue-accent text-base font-bold uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2.5 font-mono text-sm text-white/60">
              <li>
                <button 
                  onClick={() => { setCurrentView("packages"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Tour Packages
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView("hotels"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Premium Stays
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView("experiences"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Cultural Daily Tours
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView("restaurants"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Halal Dining
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView("mosques"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Mosque Finder
                </button>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4">
            <h4 className="font-serif text-brand-blue-accent text-base font-bold uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 font-mono text-sm text-white/60">
              <li><a href="https://www.evisa.gov.kh/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue-accent transition-colors">Cambodia eVisa</a></li>
              <li><a href="https://arrival.gov.kh/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue-accent transition-colors">Cambodia e-Arrival</a></li>
              <li><a href="https://tourism.gov.kh/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue-accent transition-colors">Tourism Ministry</a></li>
              <li><a href="https://ahlancambodia.com/destination" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue-accent transition-colors">Explore Destinations</a></li>
              <li>
                <button 
                  onClick={() => { setCurrentView("inspiration"); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Inspirations
                </button>
              </li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div className="space-y-4">
            <h4 className="font-serif text-brand-blue-accent text-base font-bold uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 font-mono text-sm text-white/60">
              <li>
                <button 
                  onClick={() => navigateToSection("about")} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToSection("contact")} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToSection("faq")} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateToSection("newsletter")} 
                  className="hover:text-brand-blue-accent transition-colors cursor-pointer text-left bg-transparent border-none p-0"
                >
                  Booking Conditions
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 mt-12 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40 font-mono">
          <p>© 2026 Ahlan Cambodia DMC. Crafted to the highest standards of luxury and Halal compliance.</p>
          <div className="flex gap-4">
            <span>Terms & Conditions</span>
            <span>•</span>
            <span>Privacy Page</span>
            <span>•</span>
            <button 
              onClick={() => {
                setCurrentView("admin-cms");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-mono"
            >
              Admin Login
            </button>
          </div>
        </div>
        </footer>
      )}


      {/* ---------------- FLOATING DETAILED VIEW MODAL ---------------- */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white text-brand-charcoal rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-brand-blue-accent/30 shadow-2xl animate-scale-in"
          >
            {/* Modal Image Header */}
            <div className="relative h-56 sm:h-64">
              <img src={selectedItem.data.image} className="w-full h-full object-cover" alt={selectedItem.data.name || selectedItem.data.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-brand-charcoal/80 hover:bg-brand-charcoal text-white p-2 rounded-xl transition-all border border-brand-blue-accent/20"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="inline-block bg-white/95 text-brand-blue-accent border border-brand-blue-accent/20 font-mono text-[9px] font-extrabold px-2.5 py-0.5 rounded-md shadow-md backdrop-blur-sm tracking-widest uppercase mb-1">
                  {selectedItem.type}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                  {selectedItem.data.name || selectedItem.data.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Main Desc */}
              <div className="space-y-2">
                <p className="text-brand-charcoal/80 text-sm sm:text-base leading-relaxed">
                  {selectedItem.data.description || selectedItem.data.content}
                </p>
              </div>

              {/* Destination Details */}
              {selectedItem.type === "destination" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold">Unmissable Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-brand-charcoal">
                    {selectedItem.data.highlights && selectedItem.data.highlights.map((h: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 font-medium bg-brand-green/5 border border-brand-green/10 p-2.5 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-brand-green shrink-0 animate-pulse" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-4 rounded-xl text-xs sm:text-sm space-y-2 text-brand-charcoal/80">
                    <p className="font-mono text-[10px] text-brand-blue-accent font-bold uppercase tracking-wider">Spiritual & Travel Access</p>
                    <p>Features certified Halal dining, verified prayer rooms/mosques nearby, and tailored luxury private-tour services.</p>
                  </div>
                </div>
              )}

              {/* Package Details */}
              {selectedItem.type === "package" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold">Bespoke Timeline Overview</h4>
                  <div className="space-y-2.5">
                    {selectedItem.data.itineraryOverview.map((item: string, idx: number) => {
                      const colonIdx = item.indexOf(":");
                      const title = colonIdx !== -1 ? item.substring(0, colonIdx).trim() : `Day ${idx + 1}`;
                      const desc = colonIdx !== -1 ? item.substring(colonIdx + 1).trim() : item;
                      return (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-charcoal/90">
                          <span className="font-mono text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">
                            Day {idx + 1}
                          </span>
                          <div className="leading-relaxed">
                            <span className="font-bold text-brand-charcoal">{title}: </span>
                            <span className="font-normal text-brand-charcoal/80">{desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-brand-green/5 rounded-xl p-4 border border-brand-green/10 space-y-2 text-xs text-brand-green">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider block text-brand-blue-accent">Included Elite Luxuries:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
                      {selectedItem.data.features.map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle className="w-4 h-4 text-brand-blue-accent shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Hotel Details */}
              {selectedItem.type === "hotel" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold">Verified Halal Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-brand-green font-bold uppercase">Room Amenities</span>
                      <p className="text-xs text-brand-charcoal font-medium">{selectedItem.data.prayerFacilities}</p>
                    </div>
                    <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-brand-green font-bold uppercase">Dining Protocol</span>
                      <p className="text-xs text-brand-charcoal font-medium">{selectedItem.data.halalBreakfast}</p>
                    </div>
                  </div>
                  <div className="bg-brand-green/5 p-3.5 rounded-xl border border-brand-green/15 text-xs flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-blue-accent shrink-0" />
                    <span className="font-medium text-brand-green">Nearby Mosque: {selectedItem.data.nearbyMosque}</span>
                  </div>
                </div>
              )}

              {/* Experience Details */}
              {selectedItem.type === "experience" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold">Experience Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-brand-charcoal">
                    {selectedItem.data.highlights.map((h: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurant Details */}
              {selectedItem.type === "restaurant" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold">Restaurant Analytics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl">
                      <span className="text-brand-charcoal/50">Cuisine:</span> <span className="text-brand-green font-bold">{selectedItem.data.cuisine}</span>
                    </div>
                    <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl">
                      <span className="text-brand-charcoal/50">Prayer Room Nearby:</span> <span className="text-brand-green font-bold">{selectedItem.data.prayerRoomNearby}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mosque Details */}
              {selectedItem.type === "mosque" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-brand-blue-accent tracking-widest uppercase font-bold">Mosque Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl">
                      <p className="text-brand-charcoal/50">FRIDAY JUMMAH</p>
                      <p className="text-brand-green font-bold mt-1 text-sm">{selectedItem.data.fridayPrayerTime}</p>
                    </div>
                    <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl">
                      <p className="text-brand-charcoal/50">CAPACITY</p>
                      <p className="text-brand-green font-bold mt-1 text-sm">{selectedItem.data.capacity}</p>
                    </div>
                    <div className="bg-brand-warmwhite border border-brand-blue-accent/15 p-3 rounded-xl">
                      <p className="text-brand-charcoal/50">LOCATION</p>
                      <p className="text-brand-green font-bold mt-1 text-sm">{selectedItem.data.location.split(",")[0]}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-brand-blue-accent font-mono font-bold uppercase tracking-wider block">Recommended Halal Restaurants Nearby:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.data.nearbyRestaurants.map((r: string, idx: number) => (
                        <span key={idx} className="bg-brand-green/5 border border-brand-green/10 text-brand-green font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-brand-blue-accent" /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Guide Details */}
              {selectedItem.type === "guide" && (
                <div className="bg-brand-warmwhite border-l-4 border-brand-blue-accent p-4 rounded-r-xl">
                  <p className="text-xs font-mono text-brand-charcoal/50 flex justify-between">
                    <span>AHLAN EDITORIAL ARCHIVE</span>
                    <span>{selectedItem.data.readTime}</span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-brand-blue-accent/20 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const wishCategoryMap: { [key: string]: string } = {
                      package: "packages",
                      hotel: "hotels",
                      experience: "experiences",
                      restaurant: "restaurants"
                    };
                    const category = wishCategoryMap[selectedItem.type];
                    if (category) {
                      toggleWishlist(selectedItem.data.id, category);
                      alert(`${selectedItem.data.name} added to your saved collection.`);
                    } else {
                      alert(`Information logged to your browse history.`);
                    }
                  }}
                  className="flex-1 bg-white hover:bg-brand-lightbg hover:border-brand-blue/30 text-brand-charcoal font-mono text-xs font-bold py-3.5 rounded-xl border border-brand-blue-accent/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-4 h-4 text-brand-red fill-brand-red" />
                  <span>Save to Collection</span>
                </button>
                <a
                  href="#quote-builder-section"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue-accent text-white font-serif font-bold text-center py-3.5 rounded-xl border border-brand-blue-accent/30 transition-all text-sm block shadow-md hover:shadow-lg"
                >
                  Enquire Custom Quote
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- FLOATING CHAT ASSISTANT WIDGET ---------------- */}
      <AIChatAssistant />

    </div>
  );
}
