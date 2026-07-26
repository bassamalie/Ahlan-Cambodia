import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, Settings, LayoutGrid, Image as ImageIcon, CheckCircle, 
  Trash2, Eye, Star, Upload, CloudLightning, FileText, Sparkles, 
  ArrowLeft, Compass, MapPin, SlidersHorizontal, Info, AlertCircle, Heart,
  Bell, MessageSquare, Search, ChevronRight, User, Users, Briefcase, Building, 
  HelpCircle, ArrowRight, BookOpen, ShieldCheck, Mail, Phone, ExternalLink,
  Calendar, RefreshCw, Layers, CheckSquare, X, DollarSign, Clock, HelpCircle as MosqueIcon, Globe, Utensils, FolderOpen,
  Lock, Unlock, Key, LogOut, UserPlus, Shield, Edit2, EyeOff, Loader2
} from "lucide-react";
import { Destination, Experience, TourPackage, Hotel, Restaurant, Mosque, TravelGuide } from "../types";
import { tourPackages, hotels, restaurants, mosques, travelGuides } from "../data";
import { DEFAULT_CUSTOM_HEAD_SCRIPT } from "../App";
import logoImg from "../../Logo-Navbar.png";
import TransparentLogo from "./TransparentLogo";
import RichTextEditor from "./RichTextEditor";
import { SocialVideoCard } from "./SocialVideoCard";
import { uploadToFirebaseStorage, listAllUploadedFiles, deleteFromFirebaseStorage } from "../firebase";
import { saveDocInCollection, fetchDocument, saveDocument } from "../dbService";
import { sanitizeHotelPhotoGallery, NO_PHOTO_AVAILABLE_PLACEHOLDER, isValidPhotoUrl } from "../googlePlacesPhotoService";
import { getEffectiveRoomTiers } from "./HotelDetailV2";

export interface CmsUserPermission {
  id: "guest-inquiries" | "destinations" | "experiences" | "packages" | "resorts-hotels" | "dining" | "mosques" | "travel-blog" | "media-library" | "homepage-settings" | "general-config";
  label: string;
  defaultAllowed: boolean;
}

export const CMS_PERMISSIONS_LIST: CmsUserPermission[] = [
  { id: "guest-inquiries", label: "Guest Inquiries", defaultAllowed: true },
  { id: "destinations", label: "Destinations", defaultAllowed: true },
  { id: "experiences", label: "Curated Experiences", defaultAllowed: true },
  { id: "packages", label: "Tour Packages", defaultAllowed: true },
  { id: "resorts-hotels", label: "Resorts & Hotels", defaultAllowed: true },
  { id: "dining", label: "Halal Dining", defaultAllowed: true },
  { id: "mosques", label: "Mosque Finder", defaultAllowed: true },
  { id: "travel-blog", label: "Travel Blog & Guides", defaultAllowed: true },
  { id: "media-library", label: "Media Library", defaultAllowed: false },
  { id: "homepage-settings", label: "Homepage Settings", defaultAllowed: false },
  { id: "general-config", label: "General Config", defaultAllowed: false },
];

export interface CmsUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "CURATOR";
  password: string;
  createdAt: string;
  allowedTabs: string[];
}

const DEFAULT_SUPER_USER: CmsUser = {
  id: "usr-super-1",
  email: "bassamalie@gmail.com",
  name: "Bassamalie",
  role: "SUPER_ADMIN",
  password: "password123",
  createdAt: "2024-01-01T00:00:00.000Z",
  allowedTabs: CMS_PERMISSIONS_LIST.map(p => p.id)
};

interface AdminCMSProps {
  destinations: Destination[];
  onAddDestination: (newDest: Destination) => void;
  onUpdateDestination: (updatedDest: Destination) => void;
  onDeleteDestination: (id: string) => void;
  onBack: () => void;
  experiences: Experience[];
  onAddExperience: (newExp: Experience) => void;
  onUpdateExperience: (updatedExp: Experience) => void;
  onDeleteExperience: (id: string) => void;
  packages?: TourPackage[];
  onAddPackage?: (newPkg: TourPackage) => void;
  onUpdatePackage?: (updatedPkg: TourPackage) => void;
  onDeletePackage?: (id: string) => void;
  hotels?: Hotel[];
  onAddHotel?: (newHotel: Hotel) => void;
  onUpdateHotel?: (updatedHotel: Hotel) => void;
  onDeleteHotel?: (id: string) => void;
  restaurants?: Restaurant[];
  onAddRestaurant?: (newRest: Restaurant) => void;
  onUpdateRestaurant?: (updatedRest: Restaurant) => void;
  onDeleteRestaurant?: (id: string) => void;
  mosques?: Mosque[];
  onAddMosque?: (newMosque: Mosque) => void;
  onUpdateMosque?: (updatedMosque: Mosque) => void;
  onDeleteMosque?: (id: string) => void;
  travelGuides?: TravelGuide[];
  onAddGuide?: (newGuide: TravelGuide) => void;
  onUpdateGuide?: (updatedGuide: TravelGuide) => void;
  onDeleteGuide?: (id: string) => void;
  homepageSettings?: any;
  onUpdateHomepageSettings?: (updated: any) => void;
  generalConfig?: any;
  onUpdateGeneralConfig?: (updated: any) => void;
}

// Package Hotel Slot Item
export interface PackageHotelItem {
  type: "predefined" | "custom";
  hotelId?: string;
  customHotel?: {
    name: string;
    location: string;
    image: string;
    description: string;
    highlights: string[];
  };
}

// Inquiries Mock Data Type
interface GuestInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  query: string;
  date: string;
  status: "PENDING" | "REVIEWED" | "SENT" | "CLOSED";
  region: string;
}

function getAutoThumbnail(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. Check if the URL is actually a direct image
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed) || trimmed.includes("images.unsplash.com")) {
    return trimmed;
  }

  // 2. YouTube Thumbnail
  try {
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const ytMatch = trimmed.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://img.youtube.com/vi/${ytMatch[2]}/hqdefault.jpg`;
    }
  } catch (e) {
    // ignore
  }

  // 3. Instagram Thumbnail (supports posts & reels)
  try {
    const instaRegExp = /instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/i;
    const instaMatch = trimmed.match(instaRegExp);
    if (instaMatch && instaMatch[2]) {
      return `https://www.instagram.com/p/${instaMatch[2]}/media/?size=l`;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

interface ImageUploadZoneProps {
  imageSrc: string;
  onChange: (base64: string) => void;
  label: string;
  description?: string;
}

function ImageUploadZone({ imageSrc, onChange, label, description }: ImageUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setIsUploading(true);
      setUploadError(null);
      try {
        const url = await uploadToFirebaseStorage(file);
        onChange(url);
      } catch (err: any) {
        console.error("Firebase upload error:", err);
        setUploadError("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
        {label}
      </label>
      {description && (
        <p className="text-[9px] font-mono text-slate-400 leading-relaxed">{description}</p>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
          dragActive 
            ? "border-brand-blue-accent bg-brand-blue-accent/5" 
            : "border-slate-200 hover:border-brand-blue-accent hover:bg-slate-50 bg-slate-50"
        } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden" 
          disabled={isUploading}
        />
        
        <div className="space-y-2.5">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <RefreshCw className="w-6 h-6 text-brand-blue-accent animate-spin" />
              <p className="text-xs font-sans font-bold text-brand-blue-accent">Uploading to Firebase Storage...</p>
            </div>
          ) : imageSrc ? (
            <div className="relative max-w-sm mx-auto h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white font-mono text-[9px] font-bold uppercase tracking-widest bg-black/75 px-2.5 py-1.5 rounded-lg border border-white/20">Change Photo</span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                <Upload className="w-3.5 h-3.5 text-brand-blue-accent" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-sans font-bold text-[#0F1626]">
                  Drag & drop photo here, or <span className="text-brand-blue-accent underline">browse files</span>
                </p>
                {uploadError ? (
                  <p className="text-[10px] font-sans font-semibold text-red-500">{uploadError}</p>
                ) : (
                  <p className="text-[9px] font-mono text-slate-400">
                    Supports JPG, PNG, WEBP, or SVG formats
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface MultiImageUploadZoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  label: string;
  description?: string;
  maxCount?: number;
}

function MultiImageUploadZone({ images, onChange, label, description, maxCount = 8 }: MultiImageUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    // Filter out any empty/placeholder slots in currently saved list
    const currentImages = images.filter(img => img.trim() !== "");
    const remainingSlots = maxCount - currentImages.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploadPromises = filesToProcess.map(file => uploadToFirebaseStorage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const finalImages = [...currentImages, ...uploadedUrls];
      if (maxCount === 8) {
        const padded = [...finalImages];
        while (padded.length < 8) {
          padded.push("");
        }
        onChange(padded);
      } else {
        onChange(finalImages);
      }
    } catch (err: any) {
      console.error("Firebase multi-upload error:", err);
      setUploadError("Failed to upload one or more photos.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = images.filter(img => img.trim() !== "");
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    if (maxCount === 8) {
      const padded = [...updatedImages];
      while (padded.length < 8) {
        padded.push("");
      }
      onChange(padded);
    } else {
      onChange(updatedImages);
    }
  };

  const activeImages = images.filter(img => img && img.trim() !== "");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            {label} ({activeImages.length}/{maxCount})
          </label>
          {description && (
            <p className="text-[9px] font-mono text-slate-400">{description}</p>
          )}
        </div>
        {activeImages.length < maxCount && !isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            + Upload Photos
          </button>
        )}
      </div>

      <div 
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          dragActive 
            ? "border-brand-blue-accent bg-brand-blue-accent/5" 
            : "border-slate-200 hover:border-brand-blue-accent hover:bg-slate-50 bg-slate-50"
        } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={(e) => {
          if (activeImages.length < maxCount && !isUploading) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden" 
          disabled={isUploading}
        />
        
        <div className="space-y-1">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <RefreshCw className="w-6 h-6 text-brand-blue-accent animate-spin" />
              <p className="text-xs font-sans font-bold text-brand-blue-accent">Uploading to Firebase Storage...</p>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                <Upload className="w-3.5 h-3.5 text-brand-blue-accent" />
              </div>
              <p className="text-xs font-sans font-bold text-[#0F1626]">
                Drag & drop photos here (or <span className="text-brand-blue-accent underline">browse files</span>)
              </p>
              {uploadError ? (
                <p className="text-[10px] font-sans font-semibold text-red-500">{uploadError}</p>
              ) : (
                <p className="text-[9px] font-mono text-slate-400">
                  You can select multiple photos at once. Supports JPG, PNG, WEBP, or SVG
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {activeImages.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            Gallery Preview & Management
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {activeImages.map((img, idx) => (
              <div key={idx} className="relative group aspect-[4/3] rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm animate-fade-in">
                <img src={img} alt={`Gallery Photo #${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
                >
                  Delete
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-center text-[9px] text-white font-mono font-semibold">
                  Photo #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCMS({
  destinations,
  onAddDestination,
  onUpdateDestination,
  onDeleteDestination,
  onBack,
  experiences,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  packages,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  hotels: hotelsProp,
  onAddHotel,
  onUpdateHotel,
  onDeleteHotel,
  restaurants: restaurantsProp,
  onAddRestaurant,
  onUpdateRestaurant,
  onDeleteRestaurant,
  mosques: mosquesProp,
  onAddMosque,
  onUpdateMosque,
  onDeleteMosque,
  travelGuides: travelGuidesProp,
  onAddGuide,
  onUpdateGuide,
  onDeleteGuide,
  homepageSettings,
  onUpdateHomepageSettings,
  generalConfig,
  onUpdateGeneralConfig
}: AdminCMSProps) {
  // Sidebar Navigation
  const [activeTab, setActiveTab] = useState<
    "guest-inquiries" | "destinations" | "experiences" | "packages" | "resorts-hotels" | "dining" | "mosques" | "travel-blog" | 
    "general-config" | "homepage-settings" | "user-accounts" | "media-library"
  >("guest-inquiries");

  // User Management & Authentication State
  const [cmsUsers, setCmsUsers] = useState<CmsUser[]>(() => {
    try {
      const saved = localStorage.getItem("ahlan_cms_users_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [DEFAULT_SUPER_USER];
  });

  const [currentUser, setCurrentUser] = useState<CmsUser | null>(() => {
    try {
      const saved = localStorage.getItem("ahlan_admin_session_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {}
    return null; // Requires login
  });

  // Login Form state
  const [loginEmail, setLoginEmail] = useState("bassamalie@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmailInput, setResetEmailInput] = useState("");
  const [foundResetUser, setFoundResetUser] = useState<CmsUser | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [showResetPasswordToggle, setShowResetPasswordToggle] = useState(false);

  // New Curator Account Form state (Super User only)
  const [newCuratorEmail, setNewCuratorEmail] = useState("");
  const [newCuratorName, setNewCuratorName] = useState("");
  const [newCuratorPassword, setNewCuratorPassword] = useState("");
  const [newCuratorPermissions, setNewCuratorPermissions] = useState<string[]>(
    CMS_PERMISSIONS_LIST.filter(p => p.defaultAllowed).map(p => p.id)
  );
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Super User password change state
  const [superOldPassword, setSuperOldPassword] = useState("");
  const [superNewPassword, setSuperNewPassword] = useState("");

  // Helper to persist cmsUsers to state, localStorage, AND Firestore permanently
  const syncUsers = async (newUsers: CmsUser[]) => {
    setCmsUsers(newUsers);
    try {
      localStorage.setItem("ahlan_cms_users_v3", JSON.stringify(newUsers));
    } catch (e) {}
    try {
      await saveDocument("settings", "cms_users", { users: newUsers });
    } catch (e) {
      console.error("Error persisting cms_users to Firestore:", e);
    }
  };

  // On initial mount, fetch stored cmsUsers from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadCmsUsersFromFirestore() {
      try {
        const data = await fetchDocument<{ users: CmsUser[] }>("settings", "cms_users", { users: [DEFAULT_SUPER_USER] });
        if (isMounted && data && Array.isArray(data.users) && data.users.length > 0) {
          setCmsUsers(data.users);
          try {
            localStorage.setItem("ahlan_cms_users_v3", JSON.stringify(data.users));
          } catch (e) {}
        }
      } catch (err) {
        console.error("Error fetching cms_users from Firestore:", err);
      }
    }
    loadCmsUsersFromFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync current user session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("ahlan_admin_session_v3", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("ahlan_admin_session_v3");
      }
    } catch (e) {}
  }, [currentUser]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrim = loginEmail.trim().toLowerCase();
    const passTrim = loginPassword.trim();

    if (!emailTrim || !passTrim) {
      setLoginError("Please enter both Gmail address and password.");
      return;
    }

    const matchedUser = cmsUsers.find(
      u => u.email.toLowerCase() === emailTrim && u.password === passTrim
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      triggerToast(`Welcome back, ${matchedUser.name}!`, "success");
      if (matchedUser.role === "SUPER_ADMIN") {
        setActiveTab("guest-inquiries");
      } else {
        const firstAllowed = matchedUser.allowedTabs[0] || "guest-inquiries";
        setActiveTab(firstAllowed as any);
      }
    } else {
      setLoginError("Invalid credentials. Please verify your Gmail address and password.");
    }
  };

  const handleAdminLogout = () => {
    setCurrentUser(null);
    setLoginPassword("");
    setLoginError(null);
    triggerToast("Logged out of Admin Portal.", "info");
  };

  const handleStartForgotPassword = () => {
    setResetStep(1);
    setResetEmailInput(loginEmail || "bassamalie@gmail.com");
    setFoundResetUser(null);
    setResetNewPassword("");
    setResetConfirmPassword("");
    setResetError(null);
    setResetSuccessMsg(null);
    setShowForgotPasswordModal(true);
  };

  const handleVerifyResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    const emailTrim = resetEmailInput.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes("@")) {
      setResetError("Please enter a valid Gmail address.");
      return;
    }

    const matched = cmsUsers.find(u => u.email.toLowerCase() === emailTrim);
    if (matched) {
      setFoundResetUser(matched);
      setResetStep(2);
      setResetError(null);
    } else if (emailTrim === "bassamalie@gmail.com") {
      const superUser = cmsUsers.find(u => u.role === "SUPER_ADMIN") || DEFAULT_SUPER_USER;
      setFoundResetUser(superUser);
      setResetStep(2);
      setResetError(null);
    } else {
      setResetError(`No admin or curator account found for ${emailTrim}. Please verify your Gmail address.`);
    }
  };

  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!foundResetUser) return;

    const newPass = resetNewPassword.trim();
    const confirmPass = resetConfirmPassword.trim();

    if (!newPass || newPass.length < 4) {
      setResetError("New password must be at least 4 characters long.");
      return;
    }

    if (newPass !== confirmPass) {
      setResetError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    const updatedUsers = cmsUsers.map(u => 
      u.id === foundResetUser.id || (u.role === "SUPER_ADMIN" && foundResetUser.role === "SUPER_ADMIN")
        ? { ...u, password: newPass } 
        : u
    );

    await syncUsers(updatedUsers);

    if (currentUser && currentUser.id === foundResetUser.id) {
      setCurrentUser({ ...currentUser, password: newPass });
    }

    setLoginEmail(foundResetUser.email);
    setLoginPassword(newPass);

    setResetSuccessMsg("Password successfully reset and saved permanently! You can now log in.");
    triggerToast("Password reset successfully!", "success");

    setTimeout(() => {
      setShowForgotPasswordModal(false);
    }, 2000);
  };

  const handleCreateCuratorUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") return;

    const emailTrim = newCuratorEmail.trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes("@")) {
      triggerToast("Please enter a valid Gmail address.", "error");
      return;
    }

    if (!newCuratorName.trim()) {
      triggerToast("Please enter curator full name.", "error");
      return;
    }

    if (!newCuratorPassword.trim() || newCuratorPassword.trim().length < 4) {
      triggerToast("Password must be at least 4 characters long.", "error");
      return;
    }

    if (editingUserId) {
      const updated = cmsUsers.map(u => {
        if (u.id === editingUserId) {
          return {
            ...u,
            email: emailTrim,
            name: newCuratorName.trim(),
            password: newCuratorPassword.trim(),
            allowedTabs: newCuratorPermissions
          };
        }
        return u;
      });
      syncUsers(updated);
      triggerToast(`Updated curator account permissions for ${newCuratorName}`, "success");
      setEditingUserId(null);
    } else {
      if (cmsUsers.some(u => u.email.toLowerCase() === emailTrim)) {
        triggerToast("An account with this email address already exists.", "error");
        return;
      }

      const newUser: CmsUser = {
        id: `usr-${Date.now()}`,
        email: emailTrim,
        name: newCuratorName.trim(),
        role: "CURATOR",
        password: newCuratorPassword.trim(),
        createdAt: new Date().toISOString(),
        allowedTabs: newCuratorPermissions
      };

      const updated = [...cmsUsers, newUser];
      syncUsers(updated);
      triggerToast(`Successfully created curator account for ${newUser.name} (${newUser.email})`, "success");
    }

    setNewCuratorEmail("");
    setNewCuratorName("");
    setNewCuratorPassword("");
    setNewCuratorPermissions(CMS_PERMISSIONS_LIST.filter(p => p.defaultAllowed).map(p => p.id));
  };

  // Local state for Homepage Settings
  const [localHeroTitle, setLocalHeroTitle] = useState("");
  const [localHeroSubtitle, setLocalHeroSubtitle] = useState("");
  const [localHeroImages, setLocalHeroImages] = useState<string[]>([]);
  const [localWhyChooseCards, setLocalWhyChooseCards] = useState<any[]>([]);

  // Local state for Media Library
  const [mediaFiles, setMediaFiles] = useState<{ url: string; name: string; fullPath: string; timeCreated?: string }[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);
  const [deleteConfirmPath, setDeleteConfirmPath] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'destination' | 'experience' | 'package' | 'hotel' | 'restaurant' | 'mosque' | 'guide';
    id: string;
    name: string;
  } | null>(null);

  const executeItemDelete = () => {
    if (!itemToDelete) return;
    const { type, id, name } = itemToDelete;

    switch (type) {
      case 'destination':
        if (onDeleteDestination) onDeleteDestination(id);
        triggerToast(`Permanently removed destination: ${name}`, "info");
        break;

      case 'experience':
        if (onDeleteExperience) onDeleteExperience(id);
        triggerToast(`Successfully deleted experience: ${name}`, "info");
        break;

      case 'package':
        if (onDeletePackage) onDeletePackage(id);
        setLocalPackages(prev => prev.filter(p => p.id !== id));
        triggerToast(`Successfully deleted tour package: ${name}`, "info");
        break;

      case 'hotel':
        if (onDeleteHotel) onDeleteHotel(id);
        setLocalHotels(prev => prev.filter(h => h.id !== id));
        triggerToast(`Successfully deleted hotel property: ${name}`, "info");
        break;

      case 'restaurant':
        if (onDeleteRestaurant) onDeleteRestaurant(id);
        setLocalRestaurants(prev => prev.filter(r => r.id !== id));
        triggerToast(`Successfully deleted dining spot: ${name}`, "info");
        break;

      case 'mosque':
        if (onDeleteMosque) onDeleteMosque(id);
        setLocalMosques(prev => prev.filter(m => m.id !== id));
        triggerToast(`Successfully deleted mosque: ${name}`, "info");
        break;

      case 'guide':
        if (onDeleteGuide) onDeleteGuide(id);
        setLocalGuides(prev => prev.filter(g => g.id !== id));
        triggerToast(`Successfully deleted blog post: ${name}`, "info");
        break;
    }

    setItemToDelete(null);
  };

  const filteredMediaFiles = mediaFiles.filter(f => 
    f.name.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  // Local state for General Config
  const [localCompanyDesc, setLocalCompanyDesc] = useState("");
  const [localContactNumber, setLocalContactNumber] = useState("");
  const [localEmailAddress, setLocalEmailAddress] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [localShowAddress, setLocalShowAddress] = useState(true);
  const [localSocialLinks, setLocalSocialLinks] = useState<any>({});
  const [localWebsiteLogo, setLocalWebsiteLogo] = useState("");
  const [localFooterLogo, setLocalFooterLogo] = useState("");
  const [localFavicon, setLocalFavicon] = useState("");
  const [localCustomHeadScript, setLocalCustomHeadScript] = useState(DEFAULT_CUSTOM_HEAD_SCRIPT);

  useEffect(() => {
    if (homepageSettings) {
      setLocalHeroTitle(homepageSettings.heroTitle || "");
      setLocalHeroSubtitle(homepageSettings.heroSubtitle || "");
      setLocalHeroImages(homepageSettings.heroImages || []);
      setLocalWhyChooseCards(homepageSettings.whyChooseCards || []);
    }
  }, [homepageSettings]);

  useEffect(() => {
    if (generalConfig) {
      setLocalCompanyDesc(generalConfig.companyDesc || "");
      setLocalContactNumber(generalConfig.contactNumber || "");
      setLocalEmailAddress(generalConfig.emailAddress || "");
      setLocalAddress(generalConfig.address || "");
      setLocalShowAddress(generalConfig.showAddress !== false);
      setLocalSocialLinks(generalConfig.socialLinks || {});
      setLocalWebsiteLogo(generalConfig.websiteLogo || "");
      setLocalFooterLogo(generalConfig.footerLogo || "");
      setLocalFavicon(generalConfig.favicon || "");
      setLocalCustomHeadScript(generalConfig.customHeadScript !== undefined ? generalConfig.customHeadScript : DEFAULT_CUSTOM_HEAD_SCRIPT);
    }
  }, [generalConfig]);

  // Destination tab inner view ("list" or "form" for add/edit)
  const [destView, setDestView] = useState<"list" | "form">("list");

  // Search and global inputs
  const [searchCrmQuery, setSearchCrmQuery] = useState("");
  const [searchDossierQuery, setSearchDossierQuery] = useState("");
  const [dossierFilter, setDossierFilter] = useState("ALL");
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");

  // Simulated checking modal
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  // Stateful copy of inquiries for live dashboard interactivity
  const [inquiries, setInquiries] = useState<GuestInquiry[]>([
    {
      id: "inq-1",
      name: "Fatima Al-Sayed",
      email: "fatima.alsayed@dubaitravel.ae",
      phone: "+971 50 123 4567",
      query: "Requesting 7 days Halal Luxury Tour in Siem Reap for family of 5. Needs high-end private pool villa with certified Halal chef, and wheelchair accessible transportation.",
      date: "2026-07-16",
      status: "PENDING",
      region: "Siem Reap"
    },
    {
      id: "inq-2",
      name: "Ahmad Zain",
      email: "ahmad.zain@klnational.my",
      phone: "+60 12 345 6789",
      query: "Looking for an exclusive honeymoon package on Koh Rong islands. Needs overwater luxury villa, daily private beach prayer spot set-up, and Halal mocktail packages.",
      date: "2026-07-14",
      status: "REVIEWED",
      region: "Southern Islands"
    },
    {
      id: "inq-3",
      name: "Zahra Ibrahim",
      email: "z.ibrahim@londonhalal.co.uk",
      phone: "+44 7911 123456",
      query: "Customized corporate retreat for 15 Muslim executives in Phnom Penh. Requires multi-lingual tour guides, executive boardrooms with Qibla alignment, and verified halal gourmet lunch.",
      date: "2026-07-12",
      status: "SENT",
      region: "Phnom Penh"
    },
    {
      id: "inq-4",
      name: "Omar Farooq",
      email: "omar.farooq@riyadhholding.sa",
      phone: "+966 50 987 6543",
      query: "Completed Kampot-Kep organic farm trip. Extremely satisfied with prayer spaces and halal seafood options. Requesting copies of final invoices and itineraries.",
      date: "2026-07-10",
      status: "CLOSED",
      region: "Southern Coastline"
    }
  ]);

  // Stateful package price/availability for interactivity
  const [localPackages, setLocalPackages] = useState<TourPackage[]>(packages || []);

  useEffect(() => {
    if (packages) {
      setLocalPackages(packages);
    }
  }, [packages]);

  // Stateful hotels for editing/pricing
  const [localHotels, setLocalHotels] = useState<Hotel[]>(hotelsProp || []);

  useEffect(() => {
    if (hotelsProp) {
      setLocalHotels(hotelsProp);
    }
  }, [hotelsProp]);

  // Stateful restaurants for editing/pricing
  const [localRestaurants, setLocalRestaurants] = useState<Restaurant[]>(restaurantsProp || []);

  useEffect(() => {
    if (restaurantsProp) {
      setLocalRestaurants(restaurantsProp);
    }
  }, [restaurantsProp]);

  // Dining form & wizard states
  const [diningView, setDiningView] = useState<"list" | "wizard">("list");
  const [diningFormStep, setDiningFormStep] = useState<number>(1);
  const [editingDiningId, setEditingDiningId] = useState<string | null>(null);

  // Dining wizard step variables
  // Step 1: Basic parameters
  const [diningName, setDiningName] = useState("");
  const [diningHalalVerified, setDiningHalalVerified] = useState(true);
  const [diningMuslimOwned, setDiningMuslimOwned] = useState(false);
  const [diningMuslimFriendly, setDiningMuslimFriendly] = useState(false);
  const [diningLocation, setDiningLocation] = useState("");
  const [diningCuisine, setDiningCuisine] = useState("");
  const [diningShortDesc, setDiningShortDesc] = useState("");
  const [diningHeroImage, setDiningHeroImage] = useState("");

  // Step 2: About & Ambiance
  const [diningAbout, setDiningAbout] = useState("");
  const [diningAmbiance, setDiningAmbiance] = useState("");

  // Step 3: Logistics & Maps
  const [diningGoogleMapsUrl, setDiningGoogleMapsUrl] = useState("");
  const [diningOpeningHours, setDiningOpeningHours] = useState("");
  const [diningContactNumber, setDiningContactNumber] = useState("");
  const [diningAddress, setDiningAddress] = useState("");
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationCapturedSuccess, setLocationCapturedSuccess] = useState(false);

  const handleAutoCaptureLocation = async (urlOverride?: string) => {
    const targetUrl = (urlOverride !== undefined ? urlOverride : diningGoogleMapsUrl).trim();
    if (!targetUrl) return;

    setIsCapturingLocation(true);
    setLocationCapturedSuccess(false);

    try {
      const res = await fetch(`/api/parse-google-maps-url?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      if (data.success) {
        if (data.address) setDiningAddress(data.address);
        if (data.contactNumber) setDiningContactNumber(data.contactNumber);
        if (data.openingHours) setDiningOpeningHours(data.openingHours);
        setLocationCapturedSuccess(true);
        triggerToast("Location details auto-captured from Google Maps!", "success");
      }
    } catch (err) {
      console.error("Error auto-capturing location details:", err);
    } finally {
      setIsCapturingLocation(false);
    }
  };

  // Step 4: Signature Dishes
  const [diningSignatureDishes, setDiningSignatureDishes] = useState<{
    image: string;
    name: string;
    description: string;
  }[]>([
    { image: "", name: "", description: "" }
  ]);

  const addSignatureDish = () => {
    setDiningSignatureDishes(prev => [...prev, { image: "", name: "", description: "" }]);
  };

  const removeSignatureDish = (index: number) => {
    setDiningSignatureDishes(prev => prev.filter((_, idx) => idx !== index));
  };

  // Step 5: Dietary Policy & Prayers
  const [diningHalalDietaryPolicyDesc, setDiningHalalDietaryPolicyDesc] = useState("Our kitchen operates on strict segregated prep flows. We maintain absolute compliance to international Halal criteria with zero ethanol or derivative compounds on site.");
  const [diningHalalDietaryPolicyBullets, setDiningHalalDietaryPolicyBullets] = useState<string[]>([
    "100% strictly Halal verified ingredient sourcing only",
    "Segregated prep areas, fryers, utensils, and cold storage units",
    "Fully alcohol-free dining room environment and mocktail bar"
  ]);
  const [diningPrayerSpaceDesc, setDiningPrayerSpaceDesc] = useState("A quiet, beautifully appointed multi-faith prayer area is located on our second level, complete with clean ablution facilities, soft carpets, premium prayer mats, and Qibla alignments.");
  const [diningPrayerSpaceNote, setDiningPrayerSpaceNote] = useState("Please contact our restaurant captain upon arrival to gain priority access.");

  // Step 6: FAQ
  const [diningFaqs, setDiningFaqs] = useState<{ q: string; a: string }[]>([
    { q: "Is the meat 100% Halal verified?", a: "Yes, every cut of poultry, beef, and lamb is sourced from certified Islamic Council suppliers with verifiable trace tracking." },
    { q: "Do you serve any alcohol on the premises?", a: "No, our entire establishment is 100% dry. We offer a beautifully curated gourmet mocktail bar instead." },
    { q: "Is there a private prayer space inside?", a: "Yes, we feature a dedicated prayer room with ablution areas, prayer mats, and Quran copies." },
    { q: "Is reservation required for families?", a: "While walk-ins are welcome, we highly recommend booking ahead for our private high-walled family salons." },
    { q: "Do you accommodate other allergen requests?", a: "Yes, our culinary team is fully trained to manage gluten-free, dairy-free, and nut-free requests alongside our Halal protocol." }
  ]);

  // Step 6: Social Media Links & Video Reels
  const [diningSocialVideos, setDiningSocialVideos] = useState<{ 
    platform: "tiktok" | "instagram" | "youtube" | "facebook" | "x" | "other" | string; 
    url: string; 
    title?: string; 
    thumbnailUrl?: string; 
    creatorName?: string; 
    creatorHandle?: string; 
    creatorAvatar?: string;
    duration?: string;
    views?: string;
    likes?: string;
    isFetching?: boolean;
    isUploadingThumb?: boolean;
    fetchError?: string | null;
    fetchSuccess?: boolean;
  }[]>([]);

  const addSocialVideo = () => {
    setDiningSocialVideos(prev => [...prev, { platform: "tiktok", url: "", title: "", thumbnailUrl: "", creatorName: "", creatorHandle: "", creatorAvatar: "", duration: "0:45" }]);
  };

  const removeSocialVideo = (index: number) => {
    setDiningSocialVideos(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUploadThumbnail = async (index: number, file: File) => {
    if (!file) return;
    setDiningSocialVideos(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], isUploadingThumb: true };
      return copy;
    });

    try {
      const uploadedUrl = await uploadToFirebaseStorage(file);
      setDiningSocialVideos(prev => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          thumbnailUrl: uploadedUrl,
          isUploadingThumb: false,
          fetchError: null
        };
        return copy;
      });
      triggerToast("Cover photo uploaded successfully!", "success");
    } catch (err) {
      console.error("Error uploading custom cover image:", err);
      setDiningSocialVideos(prev => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          isUploadingThumb: false,
          fetchError: "Failed to upload cover image. Please try again or paste a direct image URL."
        };
        return copy;
      });
      triggerToast("Failed to upload cover image.", "error");
    }
  };

  const fetchSocialMediaMetadata = async (index: number) => {
    const item = diningSocialVideos[index];
    if (!item || !item.url || !item.url.trim()) {
      setDiningSocialVideos(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], fetchError: "Please enter a valid social media URL first." };
        return copy;
      });
      return;
    }

    // Set loading state
    setDiningSocialVideos(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], isFetching: true, fetchError: null, fetchSuccess: false };
      return copy;
    });

    try {
      const res = await fetch("/api/fetch-social-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: item.url.trim() })
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { success: false, error: text }; }

      if (data.success) {
        setDiningSocialVideos(prev => {
          const copy = [...prev];
          const existingThumb = copy[index]?.thumbnailUrl;
          copy[index] = {
            ...copy[index],
            platform: data.platform || "tiktok",
            url: data.url || item.url.trim(),
            title: data.title || copy[index]?.title || "",
            thumbnailUrl: (data.thumbnailUrl && data.thumbnailUrl.trim()) ? data.thumbnailUrl : (existingThumb || ""),
            creatorName: data.creatorName || copy[index]?.creatorName || "",
            creatorHandle: data.creatorHandle || copy[index]?.creatorHandle || "",
            creatorAvatar: data.creatorAvatar || copy[index]?.creatorAvatar || "",
            duration: data.duration || copy[index]?.duration || "0:45",
            isFetching: false,
            fetchError: null,
            fetchSuccess: true
          };
          return copy;
        });
      } else {
        setDiningSocialVideos(prev => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            isFetching: false,
            fetchSuccess: false,
            fetchError: data.error || "Unable to retrieve metadata. Please verify that the URL is a valid, public social media link."
          };
          return copy;
        });
      }
    } catch (err: any) {
      setDiningSocialVideos(prev => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          isFetching: false,
          fetchSuccess: false,
          fetchError: "Network or server error while fetching metadata. Please verify the URL and try again."
        };
        return copy;
      });
    }
  };

  const resetDiningForm = () => {
    setEditingDiningId(null);
    setDiningFormStep(1);
    setDiningName("");
    setDiningHalalVerified(true);
    setDiningMuslimOwned(false);
    setDiningMuslimFriendly(false);
    setDiningLocation(destinations[0]?.name || "Phnom Penh");
    setDiningCuisine("");
    setDiningShortDesc("");
    setDiningHeroImage("");
    setDiningAbout("");
    setDiningAmbiance("");
    setDiningGoogleMapsUrl("");
    setDiningOpeningHours("Daily: 11:00 AM - 10:00 PM");
    setDiningContactNumber("+855 (0) 23 777 999");
    setDiningAddress("");
    setDiningSignatureDishes([
      { image: "", name: "", description: "" }
    ]);
    setDiningHalalDietaryPolicyDesc("Our kitchen operates on strict segregated prep flows. We maintain absolute compliance to international Halal criteria with zero ethanol or derivative compounds on site.");
    setDiningHalalDietaryPolicyBullets([
      "100% strictly Halal certified ingredient sourcing only",
      "Segregated prep areas, fryers, utensils, and cold storage units",
      "Fully alcohol-free dining room environment and mocktail bar"
    ]);
    setDiningPrayerSpaceDesc("A quiet, beautifully appointed multi-faith prayer area is located on our second level, complete with clean ablution facilities, soft carpets, premium prayer mats, and Qibla alignments.");
    setDiningPrayerSpaceNote("Please contact our restaurant captain upon arrival to gain priority access.");
    setDiningFaqs([
      { q: "Is the meat 100% Halal verified?", a: "Yes, every cut of poultry, beef, and lamb is sourced from certified Islamic Council suppliers with verifiable trace tracking." },
      { q: "Do you serve any alcohol on the premises?", a: "No, our entire establishment is 100% dry. We offer a beautifully curated gourmet mocktail bar instead." },
      { q: "Is there a private prayer space inside?", a: "Yes, we feature a dedicated prayer room with ablution areas, prayer mats, and Quran copies." },
      { q: "Is reservation required for families?", a: "While walk-ins are welcome, we highly recommend booking ahead for our private high-walled family salons." },
      { q: "Do you accommodate other allergen requests?", a: "Yes, our culinary team is fully trained to manage gluten-free, dairy-free, and nut-free requests alongside our Halal protocol." }
    ]);
    setDiningSocialVideos([]);
  };

  const populateDiningForm = (diningItem: Restaurant) => {
    setEditingDiningId(diningItem.id);
    setDiningFormStep(1);
    setDiningName(diningItem.name);
    setDiningHalalVerified(diningItem.halalCertified);
    setDiningMuslimOwned(diningItem.muslimOwned);
    setDiningMuslimFriendly(!!diningItem.muslimFriendly);
    setDiningLocation(diningItem.location);
    setDiningCuisine(diningItem.cuisine);
    setDiningShortDesc(diningItem.description || "");
    setDiningHeroImage(diningItem.image || "");
    
    setDiningAbout(diningItem.about || "");
    setDiningAmbiance(diningItem.ambianceStyle || "");
    setDiningGoogleMapsUrl(diningItem.googleMapsUrl || "https://maps.google.com");
    setDiningOpeningHours(diningItem.openingHours || "Daily: 11:00 AM - 10:00 PM");
    setDiningContactNumber(diningItem.contactNumber || "+855 (0) 23 777 999");
    setDiningAddress(diningItem.address || "");
    
    if (diningItem.signatureDishes && diningItem.signatureDishes.length > 0) {
      setDiningSignatureDishes(diningItem.signatureDishes);
    } else {
      setDiningSignatureDishes([{ image: "", name: "", description: "" }]);
    }
    
    setDiningHalalDietaryPolicyDesc(diningItem.halalDietaryPolicyDesc || "Our kitchen operates on strict segregated prep flows. We maintain absolute compliance to international Halal criteria with zero ethanol or derivative compounds on site.");
    if (diningItem.halalDietaryPolicyBullets && diningItem.halalDietaryPolicyBullets.length > 0) {
      setDiningHalalDietaryPolicyBullets(diningItem.halalDietaryPolicyBullets);
    } else {
      setDiningHalalDietaryPolicyBullets([
        "100% strictly Halal certified ingredient sourcing only",
        "Segregated prep areas, fryers, utensils, and cold storage units",
        "Fully alcohol-free dining room environment and mocktail bar"
      ]);
    }
    
    setDiningPrayerSpaceDesc(diningItem.prayerSpaceDesc || "A quiet, beautifully appointed multi-faith prayer area is located on our second level, complete with clean ablution facilities, soft carpets, premium prayer mats, and Qibla alignments.");
    setDiningPrayerSpaceNote(diningItem.prayerSpaceNote || "Please contact our restaurant captain upon arrival to gain priority access.");
    
    if (diningItem.faqs && diningItem.faqs.length > 0) {
      setDiningFaqs(diningItem.faqs);
    } else {
      setDiningFaqs([
        { q: "Is the meat 100% Halal verified?", a: "Yes, every cut of poultry, beef, and lamb is sourced from certified Islamic Council suppliers with verifiable trace tracking." },
        { q: "Do you serve any alcohol on the premises?", a: "No, our entire establishment is 100% dry. We offer a beautifully curated gourmet mocktail bar instead." },
        { q: "Is there a private prayer space inside?", a: "Yes, we feature a dedicated prayer room with ablution areas, prayer mats, and Quran copies." },
        { q: "Is reservation required for families?", a: "While walk-ins are welcome, we highly recommend booking ahead for our private high-walled family salons." },
        { q: "Do you accommodate other allergen requests?", a: "Yes, our culinary team is fully trained to manage gluten-free, dairy-free, and nut-free requests alongside our Halal protocol." }
      ]);
    }
    setDiningSocialVideos(diningItem.socialVideos || []);
  };

  const handleSaveDining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diningName.trim()) {
      triggerToast("Dining Name is required", "error");
      return;
    }
    if (!diningLocation.trim()) {
      triggerToast("Please choose a location", "error");
      return;
    }
    if (!diningCuisine.trim()) {
      triggerToast("Please enter a meal cuisine type", "error");
      return;
    }

    const finalId = editingDiningId || `dining-${diningName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const preparedDining: Restaurant = {
      id: finalId,
      name: diningName,
      cuisine: diningCuisine,
      rating: editingDiningId ? (localRestaurants.find(r => r.id === editingDiningId)?.rating || 4.8) : 4.8,
      image: diningHeroImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      halalCertified: diningHalalVerified,
      muslimOwned: false,
      muslimFriendly: diningMuslimFriendly,
      prayerRoomNearby: diningPrayerSpaceDesc ? "In-House Prayer Space Available" : "Prayer Room Nearby",
      location: diningLocation,
      description: diningShortDesc,

      // Extended fields
      about: diningAbout,
      ambianceStyle: diningAmbiance,
      halalStanding: diningMuslimFriendly ? "Muslim Friendly" : "Halal Verified",
      googleMapsUrl: diningGoogleMapsUrl,
      openingHours: diningOpeningHours,
      contactNumber: diningContactNumber,
      address: diningAddress,
      signatureDishes: diningSignatureDishes,
      halalDietaryPolicyDesc: diningHalalDietaryPolicyDesc,
      halalDietaryPolicyBullets: diningHalalDietaryPolicyBullets,
      prayerSpaceDesc: diningPrayerSpaceDesc,
      prayerSpaceNote: diningPrayerSpaceNote,
      faqs: diningFaqs,
      socialVideos: diningSocialVideos.map(v => {
        const { isFetching, isUploadingThumb, fetchError, fetchSuccess, ...clean } = v;
        return clean;
      })
    };

    if (editingDiningId) {
      if (onUpdateRestaurant) {
        onUpdateRestaurant(preparedDining);
      } else {
        setLocalRestaurants(prev => prev.map(r => r.id === editingDiningId ? preparedDining : r));
      }
      triggerToast(`Dining "${diningName}" successfully updated!`, "success");
    } else {
      if (onAddRestaurant) {
        onAddRestaurant(preparedDining);
      } else {
        setLocalRestaurants(prev => [preparedDining, ...prev]);
      }
      triggerToast(`Dining "${diningName}" successfully published!`, "success");
    }

    setDiningView("list");
  };

  // --- Hotel Form/Wizard States ---
  const [hotelView, setHotelView] = useState<"list" | "wizard">("list");
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [hotelFormStep, setHotelFormStep] = useState(1);

  // Step 1: Basic Info
  const [hotelName, setHotelName] = useState("");
  const [hotelStars, setHotelStars] = useState<number>(5);
  const [hotelPrice, setHotelPrice] = useState("");
  const [hotelLocation, setHotelLocation] = useState(""); // chosen destination
  const [hotelShortDesc, setHotelShortDesc] = useState("");
  const [hotelImage, setHotelImage] = useState("");
  const [hotelPrayerFacilities, setHotelPrayerFacilities] = useState("");
  const [hotelHalalBreakfast, setHotelHalalBreakfast] = useState("");
  const [hotelNearbyMosque, setHotelNearbyMosque] = useState("");
  const [hotelPrayerFacilitiesLabel, setHotelPrayerFacilitiesLabel] = useState("Prayer Facilities Highlight");
  const [hotelHalalBreakfastLabel, setHotelHalalBreakfastLabel] = useState("Halal Breakfast Highlight");
  const [hotelNearbyMosqueLabel, setHotelNearbyMosqueLabel] = useState("Nearby Mosque Highlight");

  // Step 2: Overview & Features
  const [hotelOverviewText, setHotelOverviewText] = useState("");
  const [hotelAtmosphere, setHotelAtmosphere] = useState("");
  const [hotelAmenities, setHotelAmenities] = useState<string[]>([""]);

  // Step 3: Experiences
  const [hotelSelectedExperiences, setHotelSelectedExperiences] = useState<string[]>([]);
  // Mini form for adding experience inside Step 3
  const [showAddExpMiniForm, setShowAddExpMiniForm] = useState(false);
  const [miniExpName, setMiniExpName] = useState("");
  const [miniExpCategory, setMiniExpCategory] = useState<"Heritage" | "Nature" | "Culture" | "Adventure">("Heritage");
  const [miniExpDescription, setMiniExpDescription] = useState("");
  const [miniExpImage, setMiniExpImage] = useState("");
  const [miniExpDuration, setMiniExpDuration] = useState("");
  const [miniExpHighlights, setMiniExpHighlights] = useState<string[]>([""]);

  // Step 4: Room Types
  const [hotelRooms, setHotelRooms] = useState<{
    name: string;
    image: string;
    capacity: string;
    features: string[];
    priceMultiplier?: number;
    size?: string;
    description?: string;
  }[]>([
    { name: "", image: "", capacity: "", features: [""] }
  ]);

  // Step 5: Location & Travel
  const [hotelAddress, setHotelAddress] = useState("");
  const [hotelMapUrl, setHotelMapUrl] = useState("");
  const [hotelStay22Url, setHotelStay22Url] = useState("");
  const [hotelStay22HotelId, setHotelStay22HotelId] = useState("");
  const [hotelStay22Aid, setHotelStay22Aid] = useState("ahlancambodia");
  const [hotelNearbyAttractions, setHotelNearbyAttractions] = useState<{
    name: string;
    distance: string;
    description: string;
  }[]>([
    { name: "", distance: "", description: "" }
  ]);

  // Step 6: Gallery
  const [hotelGallery, setHotelGallery] = useState<string[]>([]);

  // Step 7: FAQ
  const [hotelFaqsState, setHotelFaqsState] = useState<{ q: string; a: string }[]>([
    { q: "Is the swimming pool private?", a: "" },
    { q: "How is cross-contamination prevented for Halal meals?", a: "" },
    { q: "Are prayer mats and Qibla coordinates provided?", a: "" },
    { q: "Is there a mosque nearby?", a: "" },
    { q: "What halal breakfast options are available?", a: "" }
  ]);

  // --- Google Places Hotel Import & Refresh States ---
  const [gpSearchQuery, setGpSearchQuery] = useState("");
  const [gpSearchResults, setGpSearchResults] = useState<any[]>([]);
  const [gpSearchSource, setGpSearchSource] = useState<string | null>(null);
  const [isGpKeyConfigured, setIsGpKeyConfigured] = useState<boolean | null>(null);
  const [isSearchingGp, setIsSearchingGp] = useState(false);
  const [isImportingGpId, setIsImportingGpId] = useState<string | null>(null);
  const [refreshingHotelId, setRefreshingHotelId] = useState<string | null>(null);

  // --- Slot-specific Google Places Search States & Handlers for Package Editor ---
  const [slotSearchIndex, setSlotSearchIndex] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [slotSearchResults, setSlotSearchResults] = useState<any[]>([]);
  const [isSlotSearchingGp, setIsSlotSearchingGp] = useState(false);
  const [isSlotImportingPlaceId, setIsSlotImportingPlaceId] = useState<string | null>(null);

  const handleSlotGooglePlacesSearch = async (sIdx: number, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!slotSearchQuery.trim()) return;
    setIsSlotSearchingGp(true);
    try {
      const res = await fetch(`/api/google-places/search-hotels?q=${encodeURIComponent(slotSearchQuery)}`);
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { success: false, error: text || "Rate limit or invalid response." }; }
      if (data.success && Array.isArray(data.hotels)) {
        setSlotSearchResults(data.hotels);
        if (data.hotels.length === 0) {
          triggerToast("No matching hotels found on Google Places.", "info");
        }
      } else {
        triggerToast(data.error || "Search failed.", "error");
      }
    } catch (err) {
      console.error("Slot GP Search error:", err);
      triggerToast("Error searching Google Places.", "error");
    } finally {
      setIsSlotSearchingGp(false);
    }
  };

  const handleSlotImportGooglePlacesHotel = async (sIdx: number, placeId: string) => {
    setIsSlotImportingPlaceId(placeId);
    try {
      const res = await fetch(`/api/google-places/hotel-details?placeId=${encodeURIComponent(placeId)}`);
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { success: false, error: text || "Failed to parse response." }; }
      if (!data.success) {
        alert(data.error || "Failed to import hotel.");
        return;
      }
      const h = data.hotel;
      const { primaryImage, validPhotos } = sanitizeHotelPhotoGallery(h.photoUrls, h.image);
      const effectiveTiers = (h.roomTiers && h.roomTiers.length > 0) ? h.roomTiers : getEffectiveRoomTiers(h);

      const newHotel: Hotel = {
        id: `gp-${Date.now()}`,
        name: h.name,
        location: h.address || h.destination || "Cambodia",
        destination: h.destination || "Phnom Penh",
        rating: h.rating || 4.8,
        price: h.lowestPrice || 350,
        lowestPrice: h.lowestPrice || 350,
        stars: 5,
        image: primaryImage,
        photoUrls: validPhotos,
        galleryImages: validPhotos,
        description: h.editorialDescription || `${h.name} is a luxury estate in ${h.destination || "Cambodia"}.`,
        extendedDescription: h.editorialDescription,
        prayerFacilities: "In-room prayer mats and Qibla direction",
        halalBreakfast: "Certified Halal breakfast options",
        nearbyMosque: `Grand Mosque in ${h.destination || "Cambodia"} (10 mins)`,
        amenities: h.amenities || ["Swimming Pool", "Spa", "Free WiFi", "Halal Options"],
        roomTiers: effectiveTiers,
        highlights: [
          `Located in ${h.destination || "Cambodia"}`,
          `Rated ${h.rating || 4.8} on Google Places`,
          "Luxury Partner Stay"
        ],
        guestReviews: h.guestReviews || [],
        placeId: h.placeId,
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude,
        reviewCount: h.reviewCount,
        website: h.website,
        phoneNumber: h.phoneNumber,
        lastUpdated: new Date().toISOString(),
        layoutVersion: "v2",
        isGoogleImport: true,
        muslimFriendly: false,
        priceCategory: h.priceCategory || "$$$$ Luxury",
        propertyType: h.propertyType || "5-Star Luxury Resort",
        checkIn: h.checkIn || "14:00",
        checkOut: h.checkOut || "12:00"
      };

      if (onAddHotel) {
        await onAddHotel(newHotel);
      } else {
        await saveDocInCollection("hotels", newHotel);
      }

      setLocalHotels(prev => {
        const exists = prev.some(x => x.id === newHotel.id);
        return exists ? prev : [newHotel, ...prev];
      });

      // Update current package slot with the newly added hotel
      setPackageHotelSlots(prev => {
        const updated = [...prev];
        if (updated[sIdx]) {
          updated[sIdx] = { type: "predefined", hotelId: newHotel.id };
        }
        return updated;
      });

      triggerToast(`Added "${newHotel.name}" to Hotels register & assigned to Slot #${sIdx + 1}!`, "success");

      setSlotSearchIndex(null);
      setSlotSearchQuery("");
      setSlotSearchResults([]);
    } catch (err) {
      console.error("Slot import error:", err);
      alert("Failed to import hotel.");
    } finally {
      setIsSlotImportingPlaceId(null);
    }
  };

  const handleSearchGooglePlaces = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gpSearchQuery.trim()) return;
    setIsSearchingGp(true);
    try {
      const res = await fetch(`/api/google-places/search-hotels?q=${encodeURIComponent(gpSearchQuery)}`);
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { success: false, error: text || "Rate limit or non-JSON response from server." }; }
      if (data.success && Array.isArray(data.hotels)) {
        setGpSearchResults(data.hotels);
        setGpSearchSource(data.source || null);
        setIsGpKeyConfigured(typeof data.apiKeyConfigured === "boolean" ? data.apiKeyConfigured : null);
        if (data.hotels.length === 0) {
          triggerToast("No matching hotels found.", "info");
        }
      } else {
        triggerToast(data.error || "Search failed.", "error");
      }
    } catch (err: any) {
      console.error("Google Places search error:", err);
      triggerToast("Error searching Google Places.", "error");
    } finally {
      setIsSearchingGp(false);
    }
  };

  const handleImportGooglePlacesHotel = async (placeId: string) => {
    setIsImportingGpId(placeId);
    try {
      const res = await fetch(`/api/google-places/hotel-details?placeId=${encodeURIComponent(placeId)}`);
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { success: false, error: text || "Rate limit or non-JSON response from server." }; }
      if (!data.success) {
        alert(data.error || "Failed to import hotel.");
        return;
      }
      const h = data.hotel;
      const { primaryImage, validPhotos } = sanitizeHotelPhotoGallery(h.photoUrls, h.image);
      const effectiveTiers = (h.roomTiers && h.roomTiers.length > 0) ? h.roomTiers : getEffectiveRoomTiers(h);

      const newHotel: Hotel = {
        id: `gp-${Date.now()}`,
        name: h.name,
        location: h.address,
        destination: h.destination || "Phnom Penh",
        rating: h.rating || 4.8,
        price: h.lowestPrice || 350,
        lowestPrice: h.lowestPrice || 350,
        stars: 5,
        image: primaryImage,
        photoUrls: validPhotos,
        galleryImages: validPhotos,
        description: h.editorialDescription || `${h.name} is a luxury estate in ${h.destination || "Cambodia"}.`,
        extendedDescription: h.editorialDescription,
        prayerFacilities: "In-room prayer mats and Qibla direction",
        halalBreakfast: "Certified Halal breakfast options",
        nearbyMosque: `Grand Mosque in ${h.destination || "Cambodia"} (10 mins)`,
        amenities: h.amenities || ["Swimming Pool", "Spa", "Free WiFi", "Halal Options"],
        roomTiers: effectiveTiers,
        highlights: [
          `Located in ${h.destination || "Cambodia"}`,
          `Rated ${h.rating || 4.8} on Google Places`,
          "Halal Certified Gastronomy"
        ],
        guestReviews: h.guestReviews || [],
        placeId: h.placeId,
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude,
        reviewCount: h.reviewCount,
        website: h.website,
        phoneNumber: h.phoneNumber,
        lastUpdated: new Date().toISOString(),
        layoutVersion: "v2",
        isGoogleImport: true,
        muslimFriendly: false,
        priceCategory: h.priceCategory || "$$$$ Luxury",
        propertyType: h.propertyType || "5-Star Luxury Resort",
        checkIn: h.checkIn || "14:00",
        checkOut: h.checkOut || "12:00"
      };

      if (onAddHotel) {
        await onAddHotel(newHotel);
      } else {
        await saveDocInCollection("hotels", newHotel);
      }
      setLocalHotels(prev => [newHotel, ...prev]);
      triggerToast(`Imported "${newHotel.name}" with layoutVersion="v2"!`, "success");
      setGpSearchResults([]);
      setGpSearchQuery("");
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to import hotel.");
    } finally {
      setIsImportingGpId(null);
    }
  };

  const handleRefreshHotelInCms = async (hotelItem: Hotel) => {
    if (!hotelItem.placeId) {
      alert("This hotel does not have a Google Place ID attached. Only imported Google Places hotels can be refreshed.");
      return;
    }
    setRefreshingHotelId(hotelItem.id);
    try {
      const res = await fetch(`/api/google-places/hotel-details?placeId=${encodeURIComponent(hotelItem.placeId)}`);
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { data = { success: false, error: text || "Rate limit or non-JSON response from server." }; }
      if (!data.success) {
        alert(data.error || "Failed to refresh hotel.");
        return;
      }
      const updated = data.hotel;
      const { primaryImage, validPhotos } = sanitizeHotelPhotoGallery(
        updated.photoUrls,
        updated.image || hotelItem.image
      );

      const refreshed: Hotel = {
        ...hotelItem,
        rating: updated.rating || hotelItem.rating,
        reviewCount: updated.reviewCount || hotelItem.reviewCount,
        phoneNumber: updated.phoneNumber || hotelItem.phoneNumber,
        website: updated.website || hotelItem.website,
        photoUrls: validPhotos,
        galleryImages: validPhotos,
        image: primaryImage,
        roomTiers: (hotelItem.roomTiers && hotelItem.roomTiers.length > 0) ? hotelItem.roomTiers : getEffectiveRoomTiers(updated),
        lastUpdated: new Date().toISOString(),
        guestReviews: updated.guestReviews || hotelItem.guestReviews
      };

      if (onUpdateHotel) {
        await onUpdateHotel(refreshed);
      } else {
        await saveDocInCollection("hotels", refreshed);
      }
      setLocalHotels(prev => prev.map(h => h.id === refreshed.id ? refreshed : h));
      triggerToast(`Refreshed "${refreshed.name}" metrics & authentic photos from Google Places!`, "success");
    } catch (err) {
      console.error("Refresh error:", err);
      alert("Failed to refresh hotel.");
    } finally {
      setRefreshingHotelId(null);
    }
  };

  // --- Mosque Form/Wizard States & Helpers ---
  const [localMosques, setLocalMosques] = useState<Mosque[]>(mosquesProp || []);

  useEffect(() => {
    if (mosquesProp) {
      setLocalMosques(mosquesProp);
    }
  }, [mosquesProp]);

  const [mosqueView, setMosqueView] = useState<"list" | "wizard">("list");
  const [mosqueFormStep, setMosqueFormStep] = useState<number>(1);
  const [editingMosqueId, setEditingMosqueId] = useState<string | null>(null);

  const getJummahTimeForCity = (city: string) => {
    const norm = city.toLowerCase();
    if (norm.includes("phnom") || norm.includes("penh")) {
      return "12:30 PM (Khutbah starts at 12:15 PM)";
    } else if (norm.includes("siem") || norm.includes("reap")) {
      return "12:30 PM (Khutbah starts at 12:15 PM)";
    } else if (norm.includes("battambang")) {
      return "12:40 PM (Khutbah starts at 12:20 PM)";
    } else if (norm.includes("kampot") || norm.includes("kep")) {
      return "12:35 PM (Khutbah starts at 12:15 PM)";
    } else {
      return "12:30 PM (Khutbah starts at 12:15 PM)";
    }
  };

  const defaultMosqueGuidelines = [
    { title: "Modest Attire", content: "Loose-fitting clothing covering shoulders to ankles is required. Scarves are available at the entrance for female visitors." },
    { title: "Shoe Removal", content: "Please remove footwear before stepping onto the tiled veranda. Racks are located immediately outside." },
    { title: "Sermon Language", content: "Jummah khutbah is delivered in Khmer with brief Malay/Arabic summaries to accommodate foreign guests." },
    { title: "Charity & Sadakah", content: "A donation box is available for supporting local village education, micro-schools, and water-well initiatives." }
  ];

  // Step 1: Basic parameters
  const [mosqueName, setMosqueName] = useState("");
  const [mosqueLocation, setMosqueLocation] = useState("");
  const [mosqueCapacity, setMosqueCapacity] = useState("");
  const [mosqueFridayPrayerTime, setMosqueFridayPrayerTime] = useState("");
  const [mosqueShortDesc, setMosqueShortDesc] = useState("");
  const [mosqueIsHeritageCenter, setMosqueIsHeritageCenter] = useState(true);
  const [mosqueIsActiveJummah, setMosqueIsActiveJummah] = useState(true);
  const [mosqueHeroPhoto, setMosqueHeroPhoto] = useState("");

  // Step 2: About & Style
  const [mosqueLongDesc, setMosqueLongDesc] = useState("");
  const [mosqueArchitectureStyle, setMosqueArchitectureStyle] = useState("");
  const [mosqueHistoricalLegacy, setMosqueHistoricalLegacy] = useState("");

  // Step 3: Map & Location
  const [mosqueGoogleMapsUrl, setMosqueGoogleMapsUrl] = useState("");
  const [mosqueFullAddress, setMosqueFullAddress] = useState("");

  const autoCaptureAddressFromMapLink = (mapUrl: string, name: string, location: string): string => {
    const loc = location ? `${location}, Cambodia` : "Cambodia";
    if (!mapUrl || !mapUrl.trim()) {
      return name ? `${name}, ${loc}` : loc;
    }
    try {
      let queryParam = "";
      if (mapUrl.includes("q=")) {
        queryParam = mapUrl.split("q=")[1]?.split("&")[0] || "";
      } else if (mapUrl.includes("/place/")) {
        queryParam = mapUrl.split("/place/")[1]?.split("/")[0] || "";
      } else if (mapUrl.includes("query=")) {
        queryParam = mapUrl.split("query=")[1]?.split("&")[0] || "";
      }

      if (queryParam) {
        const decoded = decodeURIComponent(queryParam.replace(/\+/g, " ")).trim();
        if (decoded) {
          if (decoded.toLowerCase().includes("cambodia") || (location && decoded.toLowerCase().includes(location.toLowerCase()))) {
            return decoded;
          }
          return `${decoded}, ${loc}`;
        }
      }
    } catch {
      // fallback
    }
    return name ? `${name}, ${loc}` : loc;
  };

  // Step 4: Amenities
  const [mosqueAmenities, setMosqueAmenities] = useState<string[]>([""]);

  // Step 5: Guidelines
  const [mosqueGuidelines, setMosqueGuidelines] = useState<{ title: string; content: string }[]>(defaultMosqueGuidelines);

  const resetMosqueForm = () => {
    setEditingMosqueId(null);
    setMosqueFormStep(1);
    setMosqueName("");
    setMosqueLocation("");
    setMosqueCapacity("1,000 worshippers");
    setMosqueFridayPrayerTime("12:30 PM (Khutbah starts at 12:15 PM)");
    setMosqueShortDesc("");
    setMosqueIsHeritageCenter(true);
    setMosqueIsActiveJummah(true);
    setMosqueHeroPhoto("");
    setMosqueLongDesc("");
    setMosqueArchitectureStyle("");
    setMosqueHistoricalLegacy("");
    setMosqueGoogleMapsUrl("");
    setMosqueFullAddress("");
    setMosqueAmenities([""]);
    setMosqueGuidelines(defaultMosqueGuidelines);
  };

  const populateMosqueForm = (mosqueItem: Mosque) => {
    setEditingMosqueId(mosqueItem.id);
    setMosqueFormStep(1);
    setMosqueName(mosqueItem.name);
    setMosqueLocation(mosqueItem.location);
    setMosqueCapacity(mosqueItem.capacity || "1,000 worshippers");
    setMosqueFridayPrayerTime(mosqueItem.fridayPrayerTime || "12:30 PM");
    setMosqueShortDesc(mosqueItem.description || "");
    setMosqueIsHeritageCenter(mosqueItem.isHeritageCenter !== false);
    setMosqueIsActiveJummah(mosqueItem.isActiveJummah !== false);
    setMosqueHeroPhoto(mosqueItem.image || "");

    setMosqueLongDesc(mosqueItem.extendedDescription || "");
    setMosqueArchitectureStyle(mosqueItem.architectureType || "");
    setMosqueHistoricalLegacy(mosqueItem.historicalContext || "");

    setMosqueGoogleMapsUrl("https://maps.google.com");
    setMosqueFullAddress(mosqueItem.address || "");

    if (mosqueItem.amenities && mosqueItem.amenities.length > 0) {
      setMosqueAmenities(mosqueItem.amenities);
    } else {
      setMosqueAmenities([""]);
    }

    if (mosqueItem.visitorGuidelines && mosqueItem.visitorGuidelines.length > 0) {
      setMosqueGuidelines(mosqueItem.visitorGuidelines.map(g => ({ title: g.title, content: g.desc })));
    } else {
      setMosqueGuidelines(defaultMosqueGuidelines);
    }
  };

  // --- Blog Form/Wizard States & Helpers ---
  const [localGuides, setLocalGuides] = useState<TravelGuide[]>(travelGuidesProp || []);

  useEffect(() => {
    if (travelGuidesProp) {
      setLocalGuides(travelGuidesProp);
    }
  }, [travelGuidesProp]);

  const [blogView, setBlogView] = useState<"list" | "wizard">("list");
  const [blogFormStep, setBlogFormStep] = useState<number>(1);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Step 1: Basic Info
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogDestinationId, setBlogDestinationId] = useState<string>("general");

  // Step 2: Exactly 4 Key Highlights
  const [blogHighlights, setBlogHighlights] = useState<string[]>(["", "", "", ""]);

  // Step 3: Excerpt & Wordpress-like Rich content
  const [blogQuoteExcerpt, setBlogQuoteExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogReadTime, setBlogReadTime] = useState("5 min read");

  const blogStep3MountedAtRef = useRef<number>(0);
  useEffect(() => {
    if (blogFormStep === 3) {
      blogStep3MountedAtRef.current = Date.now();
    }
  }, [blogFormStep]);

  // Auto-calculate read time based on blogContent
  useEffect(() => {
    const plainText = blogContent.replace(/<[^>]*>/g, " ");
    const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    setBlogReadTime(`${minutes} min read`);
  }, [blogContent]);

  const handleStepClick = (targetStep: number) => {
    if (targetStep < blogFormStep) {
      setBlogFormStep(targetStep);
      return;
    }

    if (targetStep > 1 && blogFormStep === 1) {
      if (!blogTitle.trim() || !blogDescription.trim() || (!blogCategory && !newCategoryName.trim())) {
        triggerToast("Please complete all Step 1 required parameters.", "error");
        return;
      }
      if (blogDescription.length > 150) {
        triggerToast("Short description must be 150 characters or less.", "error");
        return;
      }
    }

    if (targetStep > 2) {
      // First, ensure Step 1 is valid
      if (!blogTitle.trim() || !blogDescription.trim() || (!blogCategory && !newCategoryName.trim())) {
        triggerToast("Please complete all Step 1 required parameters.", "error");
        return;
      }
      if (blogDescription.length > 150) {
        triggerToast("Short description must be 150 characters or less.", "error");
        return;
      }
    }

    setBlogFormStep(targetStep);
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogFormStep(1);
    setBlogTitle("");
    setBlogDescription("");
    setBlogCategory("");
    setNewCategoryName("");
    setBlogImage("");
    setBlogDestinationId("general");
    setBlogHighlights(["", "", "", ""]);
    setBlogQuoteExcerpt("");
    setBlogContent("");
    setBlogReadTime("5 min read");
  };

  const populateBlogForm = (blogItem: TravelGuide) => {
    setEditingBlogId(blogItem.id);
    setBlogFormStep(1);
    setBlogTitle(blogItem.title);
    setBlogDescription(blogItem.description);
    setBlogCategory(blogItem.category);
    setNewCategoryName("");
    setBlogImage(blogItem.image || "");
    setBlogDestinationId(blogItem.destinationId || "general");
    
    // Fallback if highlights doesn't exist
    const h = blogItem.highlights || [];
    setBlogHighlights([h[0] || "", h[1] || "", h[2] || "", h[3] || ""]);
    setBlogQuoteExcerpt(blogItem.quoteExcerpt || "");
    setBlogContent(blogItem.content || "");
    setBlogReadTime(blogItem.readTime || "5 min read");
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();

    if (blogFormStep < 3) {
      if (blogFormStep === 1) {
        if (!blogTitle.trim()) {
          triggerToast("Post title is required.", "error");
          return;
        }
        if (!blogDescription.trim()) {
          triggerToast("Short description is required.", "error");
          return;
        }
        if (blogDescription.length > 150) {
          triggerToast("Short description must be 150 characters or less.", "error");
          return;
        }
        const finalCategory = blogCategory === "ADD_NEW" ? newCategoryName.trim() : blogCategory.trim();
        if (!finalCategory) {
          triggerToast("Category is required.", "error");
          return;
        }
      }
      blogStep3MountedAtRef.current = Date.now();
      setBlogFormStep(prev => Math.min(3, prev + 1));
      return;
    }

    // --- PUBLISH / SAVE (ONLY ON STEP 3) ---
    // Prevent accidental submit triggered during transition from Step 2 to Step 3
    if (Date.now() - blogStep3MountedAtRef.current < 500) {
      return;
    }

    if (!blogTitle.trim()) {
      triggerToast("Post title is required.", "error");
      setBlogFormStep(1);
      return;
    }
    if (!blogDescription.trim()) {
      triggerToast("Short description is required.", "error");
      setBlogFormStep(1);
      return;
    }
    if (blogDescription.length > 150) {
      triggerToast("Short description must be 150 characters or less.", "error");
      setBlogFormStep(1);
      return;
    }

    const finalCategory = blogCategory === "ADD_NEW" ? newCategoryName.trim() : blogCategory.trim();
    if (!finalCategory) {
      triggerToast("Category is required.", "error");
      setBlogFormStep(1);
      return;
    }

    const highlightsToSave = blogHighlights.map(h => h.trim()).filter(Boolean);

    if (!blogContent.trim() || blogContent.trim() === "<p><br></p>") {
      triggerToast("Full post content is required in Step 3.", "error");
      return;
    }

    const finalImage = blogImage.trim() || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600";

    const preparedBlog: TravelGuide = {
      id: editingBlogId || `guide-${Date.now()}`,
      title: blogTitle.trim(),
      category: finalCategory,
      image: finalImage,
      readTime: blogReadTime || "5 min read",
      description: blogDescription.trim(),
      date: editingBlogId 
        ? (localGuides.find(g => g.id === editingBlogId)?.date || new Date().toISOString().split("T")[0]) 
        : new Date().toISOString().split("T")[0],
      content: blogContent,
      highlights: highlightsToSave,
      quoteExcerpt: blogQuoteExcerpt.trim() || undefined,
      destinationId: blogDestinationId || "general"
    };

    if (editingBlogId) {
      setLocalGuides(prev => prev.map(g => g.id === editingBlogId ? preparedBlog : g));
      if (onUpdateGuide) {
        onUpdateGuide(preparedBlog);
      }
      triggerToast("Blog post successfully updated!", "success");
    } else {
      setLocalGuides(prev => [preparedBlog, ...prev]);
      if (onAddGuide) {
        onAddGuide(preparedBlog);
      }
      triggerToast("New blog post successfully published!", "success");
    }

    setBlogView("list");
  };

  const handleBlogDelete = (id: string, title?: string) => {
    const item = localGuides.find(g => g.id === id);
    setItemToDelete({ type: 'guide', id, name: title || item?.title || "this blog post" });
  };

  const handleSaveMosque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mosqueName.trim()) {
      triggerToast("Mosque Name is required", "error");
      return;
    }
    if (!mosqueLocation.trim()) {
      triggerToast("Mosque Location/Destination is required", "error");
      return;
    }

    const finalId = editingMosqueId || `mosque-${mosqueName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const preparedMosque: Mosque = {
      id: finalId,
      name: mosqueName,
      location: mosqueLocation,
      image: mosqueHeroPhoto || "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800",
      fridayPrayerTime: mosqueFridayPrayerTime || "12:30 PM",
      capacity: mosqueCapacity || "1,000 worshippers",
      description: mosqueShortDesc,
      nearbyRestaurants: editingMosqueId ? (localMosques.find(m => m.id === editingMosqueId)?.nearbyRestaurants || []) : [],

      isHeritageCenter: mosqueIsHeritageCenter,
      isActiveJummah: mosqueIsActiveJummah,
      extendedDescription: mosqueLongDesc,
      architectureType: mosqueArchitectureStyle,
      historicalContext: mosqueHistoricalLegacy,
      address: mosqueFullAddress || autoCaptureAddressFromMapLink(mosqueGoogleMapsUrl, mosqueName, mosqueLocation),
      amenities: mosqueAmenities.filter(a => a.trim() !== ""),
      visitorGuidelines: mosqueGuidelines.map(g => ({ title: g.title, desc: g.content })),
      prayerTimes: {
        fajr: "04:45 AM",
        dhuhr: "12:15 PM",
        asr: "03:40 PM",
        maghrib: "06:35 PM",
        isha: "07:50 PM",
        jummah: mosqueFridayPrayerTime || "12:30 PM"
      }
    };

    if (editingMosqueId) {
      if (onUpdateMosque) {
        onUpdateMosque(preparedMosque);
      } else {
        setLocalMosques(prev => prev.map(m => m.id === editingMosqueId ? preparedMosque : m));
      }
      triggerToast(`Mosque "${mosqueName}" successfully updated!`, "success");
    } else {
      if (onAddMosque) {
        onAddMosque(preparedMosque);
      } else {
        setLocalMosques(prev => [preparedMosque, ...prev]);
      }
      triggerToast(`Mosque "${mosqueName}" successfully published!`, "success");
    }

    setMosqueView("list");
  };

  const handleMosqueDelete = (id: string, name?: string) => {
    const item = localMosques.find(m => m.id === id);
    setItemToDelete({ type: 'mosque', id, name: name || item?.name || "this mosque" });
  };

  // --- Hotel Helper Functions ---
  const handleHotelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "cover" | "room" | "gallery" | "mini-exp", extraParams?: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      triggerToast("Uploading to Firebase Storage...", "info");
      const url = await uploadToFirebaseStorage(file);
      if (target === "cover") {
        setHotelImage(url);
        triggerToast("Cover image uploaded to Firebase Storage successfully!", "success");
      } else if (target === "mini-exp") {
        setMiniExpImage(url);
        triggerToast("Experience photo uploaded to Firebase Storage successfully!", "success");
      } else if (target === "room") {
        const roomIdx = extraParams?.idx;
        const updated = [...hotelRooms];
        if (updated[roomIdx]) {
          updated[roomIdx].image = url;
          setHotelRooms(updated);
          triggerToast("Room photo uploaded to Firebase Storage successfully!", "success");
        }
      } else if (target === "gallery") {
        const slotIdx = extraParams?.idx;
        const updated = [...hotelGallery];
        updated[slotIdx] = url;
        setHotelGallery(updated);
        triggerToast(`Gallery photo ${slotIdx + 1} uploaded to Firebase Storage successfully!`, "success");
      }
    } catch (err: any) {
      console.error("Firebase hotel upload failed", err);
      triggerToast("Failed to upload photo. Please try again.", "error");
    }
  };

  const resetHotelForm = () => {
    setEditingHotelId(null);
    setHotelFormStep(1);
    setHotelName("");
    setHotelStars(5);
    setHotelPrice("");
    setHotelLocation(destinations[0]?.name || "Siem Reap");
    setHotelShortDesc("");
    setHotelImage("");
    setHotelPrayerFacilities("Prayer mat, localized Qibla direction indicators, and pristine Quran copy are pre-positioned in-room prior to check-in.");
    setHotelHalalBreakfast("All gourmet morning selections are sourced from fully certified purveyors and prepared in a strictly segregated Halal section of the main kitchen.");
    setHotelNearbyMosque("Al-Serkal Mosque is located approximately 10 minutes away, with private chauffeur service available upon request.");
    setHotelPrayerFacilitiesLabel("Prayer Facilities Highlight");
    setHotelHalalBreakfastLabel("Halal Breakfast Highlight");
    setHotelNearbyMosqueLabel("Nearby Mosque Highlight");
    setHotelOverviewText("");
    setHotelAtmosphere("Heritage Colonial Elegance");
    setHotelAmenities(["Halal Certified Dining", "Segregated Wellness Hours", "Alcohol-Free Minibar Options", "Private In-Villa Pools", "Feminine-Only Spa Facilities"]);
    setHotelSelectedExperiences([]);
    setHotelRooms([
      { 
        name: "Deluxe Pool Suite", 
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800", 
        capacity: "2 Adults, 1 Child", 
        features: ["Private high-walled balcony", "Alcohol-free minibar pre-stocked", "Local Qibla arrow indicator"] 
      }
    ]);
    setHotelAddress("");
    setHotelMapUrl("");
    setHotelStay22Url("");
    setHotelStay22HotelId("");
    setHotelStay22Aid("ahlancambodia");
    setHotelNearbyAttractions([
      { name: "Al-Serkal Central Mosque", distance: "4 mins drive", description: "Beautiful historic mosque offering regular congregational prayers." }
    ]);
    setHotelGallery(Array(10).fill(""));
    setHotelFaqsState([
      { q: "Is the swimming pool private?", a: "The main 35m saltwater swimming pool is a beautiful shared space. However, for complete privacy, our luxury Private Pool Villas feature high-walled private gardens with individual plunge pools ensuring zero external visibility." },
      { q: "How is cross-contamination prevented for Halal meals?", a: "Raffles operates a designated, certified Halal food preparation station. All Halal items are stored in segregated cooling units, and cooked with certified-only utensils and pans to guarantee 100% integrity." },
      { q: "Are prayer mats and Qibla coordinates provided?", a: "Yes, every Muslim guest is provided with sanitized premium prayer mats and a localized Qibla indicator map automatically. Qurans are also pre-stocked in your room upon requesting at booking." },
      { q: "Is there a mosque nearby?", a: "Yes, Siem Reap Mosque is just 4 minutes away by car or 12 minutes by foot." },
      { q: "What halal breakfast options are available?", a: "Certified Halal breakfast prepared in a dedicated, strictly sanitized section of the royal kitchen with exclusive cookware." }
    ]);
  };

  const populateHotelForm = (hotelItem: Hotel) => {
    // Attempt to read from global/local structures
    setEditingHotelId(hotelItem.id);
    setHotelFormStep(1);
    setHotelName(hotelItem.name);
    setHotelStars(hotelItem.stars || 5);
    setHotelPrice(hotelItem.price ? hotelItem.price.toString() : "");
    setHotelLocation(hotelItem.location);
    setHotelShortDesc(hotelItem.description || "");
    setHotelImage(hotelItem.image || "");
    
    setHotelPrayerFacilities(hotelItem.prayerFacilities || "Prayer mat, localized Qibla direction indicators, and pristine Quran copy are pre-positioned in-room prior to check-in.");
    setHotelHalalBreakfast(hotelItem.halalBreakfast || "All gourmet morning selections are sourced from fully certified purveyors and prepared in a strictly segregated Halal section of the main kitchen.");
    setHotelNearbyMosque(hotelItem.nearbyMosque || "Al-Serkal Mosque is located approximately 10 minutes away, with private chauffeur service available upon request.");
    setHotelPrayerFacilitiesLabel(hotelItem.prayerFacilitiesLabel || "Prayer Facilities Highlight");
    setHotelHalalBreakfastLabel(hotelItem.halalBreakfastLabel || "Halal Breakfast Highlight");
    setHotelNearbyMosqueLabel(hotelItem.nearbyMosqueLabel || "Nearby Mosque Highlight");
    
    setHotelOverviewText(hotelItem.extendedDescription || hotelItem.description || "");
    setHotelAtmosphere(hotelItem.atmosphere || "Colonial Luxury Heritage");
    setHotelAmenities(hotelItem.amenities && hotelItem.amenities.length > 0 ? hotelItem.amenities : ["Halal Certified Dining", "Private Pool Hours"]);
    
    // Auto check experiences matching this hotel location
    const matchedExps = experiences
      .filter(exp => exp.location.toLowerCase().includes(hotelItem.location.toLowerCase()))
      .map(exp => exp.id);
    setHotelSelectedExperiences(matchedExps);
    
    // Rooms
    if (hotelItem.roomTiers && hotelItem.roomTiers.length > 0) {
      setHotelRooms(hotelItem.roomTiers.map(r => ({
        name: r.name,
        image: r.image || "",
        capacity: r.capacity || "2 Guests",
        features: r.features || [""]
      })));
    } else {
      setHotelRooms([
        { name: "Deluxe Pool Suite", image: hotelItem.image || "", capacity: "2 Adults, 1 Child", features: ["Private high-walled balcony"] }
      ]);
    }
    
    setHotelAddress(hotelItem.address || `Street 23, Charles de Gaulle, ${hotelItem.location}`);
    setHotelMapUrl(hotelItem.mapUrl || "https://maps.google.com");
    setHotelStay22Url(hotelItem.stay22Url || "");
    setHotelStay22HotelId(hotelItem.stay22HotelId || "");
    setHotelStay22Aid(hotelItem.stay22Aid || "ahlancambodia");
    
    if (hotelItem.nearbyAttractions && hotelItem.nearbyAttractions.length > 0) {
      setHotelNearbyAttractions(hotelItem.nearbyAttractions);
    } else {
      setHotelNearbyAttractions([
        { name: "Central Islamic Mosque", distance: "4 mins drive", description: "Vibrant place of worship." }
      ]);
    }
    
    // Gallery
    if (hotelItem.galleryImages && hotelItem.galleryImages.length > 0) {
      const images = [...hotelItem.galleryImages];
      while (images.length < 10) {
        images.push("");
      }
      setHotelGallery(images.slice(0, 10));
    } else {
      const images = [hotelItem.image];
      while (images.length < 10) {
        images.push("");
      }
      setHotelGallery(images);
    }
    
    // FAQs
    if (hotelItem.faqs && hotelItem.faqs.length > 0) {
      setHotelFaqsState(hotelItem.faqs);
    } else {
      setHotelFaqsState([
        { q: "Is the swimming pool private?", a: "Yes, our Private Pool Villas feature absolute high-walled privacy with no visibility." },
        { q: "How is cross-contamination prevented for Halal meals?", a: "Segregated cookware, dedicated storage units, and isolated prep stations." },
        { q: "Are prayer mats and Qibla coordinates provided?", a: "Yes, pre-positioned prior to check-in." },
        { q: "Is there a mosque nearby?", a: "Yes, 4 minutes away." },
        { q: "What halal breakfast options are available?", a: "Fully certified Halal breakfast served daily." }
      ]);
    }
  };

  const handleSaveHotel = () => {
    if (!hotelName.trim()) {
      triggerToast("Hotel Name is required", "error");
      return;
    }
    if (!hotelLocation.trim()) {
      triggerToast("Please choose a location", "error");
      return;
    }
    
    const priceNum = parseFloat(hotelPrice) || 0;
    const finalId = editingHotelId || `hotel-${hotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    
    const { primaryImage, validPhotos } = sanitizeHotelPhotoGallery(hotelGallery, hotelImage);

    const preparedHotel: Hotel = {
      id: finalId,
      name: hotelName,
      location: hotelLocation,
      rating: editingHotelId ? (localHotels.find(h => h.id === editingHotelId)?.rating || 4.9) : 4.9,
      price: priceNum,
      image: primaryImage,
      photoUrls: validPhotos,
      galleryImages: validPhotos,
      stars: hotelStars,
      prayerFacilities: hotelPrayerFacilities,
      halalBreakfast: hotelHalalBreakfast,
      nearbyMosque: hotelNearbyMosque,
      prayerFacilitiesLabel: hotelPrayerFacilitiesLabel,
      halalBreakfastLabel: hotelHalalBreakfastLabel,
      nearbyMosqueLabel: hotelNearbyMosqueLabel,
      description: hotelShortDesc,
      highlights: [hotelPrayerFacilities, hotelHalalBreakfast, hotelNearbyMosque],
      priceRange: priceNum > 300 ? "$$$" : priceNum > 150 ? "$$" : "$",
      amenities: hotelAmenities.filter(a => a.trim() !== ""),
      
      // Extended fields
      extendedDescription: hotelOverviewText,
      atmosphere: hotelAtmosphere,
      muslimFacilitiesDetail: hotelPrayerFacilities,
      halalBreakfastDetail: hotelHalalBreakfast,
      mosqueDetail: hotelNearbyMosque,
      amenitiesList: hotelAmenities.filter(a => a.trim() !== "").map(name => ({ name, category: "general" })),
      roomTiers: hotelRooms.filter(r => r.name.trim() !== "").map(r => ({
        name: r.name,
        priceMultiplier: r.priceMultiplier || 1.0,
        size: r.size || "45 sqm",
        capacity: r.capacity || "2 Guests",
        description: r.description || `${r.name} with premium facilities and absolute privacy.`,
        image: r.image || hotelImage,
        features: r.features.filter(f => f.trim() !== "")
      })),
      faqs: hotelFaqsState.filter(f => f.q.trim() !== ""),
      nearbyAttractions: hotelNearbyAttractions.filter(a => a.name.trim() !== ""),
      address: hotelAddress,
      mapUrl: hotelMapUrl,
      stay22Url: hotelStay22Url.trim() || "",
      stay22HotelId: hotelStay22HotelId.trim() || "",
      stay22Aid: hotelStay22Aid.trim() || ""
    };

    if (editingHotelId) {
      if (onUpdateHotel) {
        onUpdateHotel(preparedHotel);
      } else {
        saveDocInCollection("hotels", preparedHotel);
        setLocalHotels(prev => prev.map(h => h.id === editingHotelId ? preparedHotel : h));
      }
      triggerToast(`Successfully saved amendments for: ${hotelName}`, "success");
    } else {
      if (onAddHotel) {
        onAddHotel(preparedHotel);
      } else {
        saveDocInCollection("hotels", preparedHotel);
        setLocalHotels(prev => [preparedHotel, ...prev]);
      }
      triggerToast(`Successfully deployed hotel: ${hotelName}`, "success");
    }

    setHotelView("list");
  };

  // --- Destination Form States ---
  const [name, setName] = useState("");
  const [region, setRegion] = useState("Northwestern Cambodia");
  const [shortDesc, setShortDesc] = useState("");
  const [overviewText, setOverviewText] = useState("");
  const [highlights, setHighlights] = useState<string[]>(["", "", "", "", ""]);
  const [insights, setInsights] = useState<string[]>(["", "", ""]);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isListHidden, setIsListHidden] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Experience Form States ---
  const [expName, setExpName] = useState("");
  const [expShortDescription, setExpShortDescription] = useState("");
  const [expDestId, setExpDestId] = useState("");
  const [expDuration, setExpDuration] = useState("");
  const [expIsFamilyFriendly, setExpIsFamilyFriendly] = useState(false);
  const [expCategory, setExpCategory] = useState<"Heritage" | "Nature" | "Culture" | "Adventure">("Heritage");
  const [expOverviewText, setExpOverviewText] = useState("");
  const [expOverviewImageSrc, setExpOverviewImageSrc] = useState("");
  const [expHighlights, setExpHighlights] = useState<string[]>([""]);
  const [expGalleryImages, setExpGalleryImages] = useState<string[]>([""]);
  const [expGoogleMapsUrl, setExpGoogleMapsUrl] = useState("");
  const [expFaqs, setExpFaqs] = useState<{ question: string; answer: string }[]>([{ question: "", answer: "" }]);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [expView, setExpView] = useState<"list" | "form">("list");
  const [expFormStep, setExpFormStep] = useState(0);

  // --- Package Form/Wizard States ---
  const [packView, setPackView] = useState<"list" | "wizard">("list");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Step 1: Basic Info
  const [packName, setPackName] = useState("");
  const [packDuration, setPackDuration] = useState("");
  const [packDestinations, setPackDestinations] = useState<string[]>([]);
  const [packPrice, setPackPrice] = useState<string>("");
  const [packBrief, setPackBrief] = useState("");
  const [packFeaturedImage, setPackFeaturedImage] = useState("");
  const [packKeyHighlights, setPackKeyHighlights] = useState<string[]>(["", "", ""]);
  const [packIsHalalMeals, setPackIsHalalMeals] = useState<boolean>(true);
  const [packTransportType, setPackTransportType] = useState<"Private Transfer & Guide" | "Group Transfer & Guide" | string>("Private Transfer & Guide");
  const [packPaceStyle, setPackPaceStyle] = useState<"Leisure" | "Group" | string>("Leisure");

  // Step 2: Overview
  const [packOverview, setPackOverview] = useState("");

  // Step 3: Itinerary, Inclusions, and Exclusions
  const [packItinerary, setPackItinerary] = useState<{ day: number; title: string; description: string; meals?: string; highlights?: string }[]>([
    { day: 1, title: "", description: "", meals: "", highlights: "" }
  ]);
  const [packInclusions, setPackInclusions] = useState<string[]>([]);
  const [newInclusion, setNewInclusion] = useState("");
  const [packExclusions, setPackExclusions] = useState<string[]>([]);
  const [newExclusion, setNewExclusion] = useState("");

  // Step 4: Multi-Hotel Association (Up to 4 Hotels - Mix and Match)
  const [packageHotelSlots, setPackageHotelSlots] = useState<PackageHotelItem[]>([
    { type: "predefined", hotelId: "" }
  ]);

  // Step 5: Gallery Images (Optional)
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // Step 6: FAQs (Optional)
  const [faqList, setFaqList] = useState<{ q: string; a: string }[]>([]);

  const imagePresets = [
    { name: "Pristine Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200" },
    { name: "Mystic Temple", url: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=1200" },
    { name: "Deep Jungle", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200" },
    { name: "Riverside Sunset", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200" }
  ];

  // Helper to trigger toast notifications
  const triggerToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadMediaFiles = async () => {
    setIsMediaLoading(true);
    try {
      const files = await listAllUploadedFiles("ahlancambodia_uploads");
      setMediaFiles(files);
    } catch (err) {
      console.error("Error listing media files:", err);
      triggerToast("Failed to fetch media library items", "error");
    } finally {
      setIsMediaLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "media-library") {
      loadMediaFiles();
    }
  }, [activeTab]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setIsUploadingMedia(true);
      setMediaUploadError(null);
      triggerToast("Uploading asset to Firebase Storage...", "info");
      try {
        await uploadToFirebaseStorage(file);
        triggerToast("Asset uploaded successfully!", "success");
        loadMediaFiles();
      } catch (err) {
        console.error("Media upload error:", err);
        setMediaUploadError("Upload failed. Please try again.");
        triggerToast("Failed to upload asset.", "error");
      } finally {
        setIsUploadingMedia(false);
      }
    }
  };

  const executeMediaDelete = async (fullPath: string) => {
    triggerToast("Deleting file...", "info");
    try {
      await deleteFromFirebaseStorage(fullPath);
      triggerToast("File deleted successfully", "success");
      setDeleteConfirmPath(null);
      loadMediaFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      triggerToast("Failed to delete file from Storage", "error");
    }
  };

  const handleMediaDelete = (fullPath: string) => {
    setDeleteConfirmPath(fullPath);
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      try {
        triggerToast("Uploading photo to Firebase Storage...", "info");
        const url = await uploadToFirebaseStorage(file);
        setImageSrc(url);
        triggerToast("Destination cover photo uploaded to Firebase Storage successfully!", "success");
      } catch (err: any) {
        console.error("Firebase cover upload failed", err);
        triggerToast("Failed to upload photo. Please try again.", "error");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Submit Handler for Destination
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !region || !shortDesc || !overviewText) {
      triggerToast("Please fill in all required fields.", "error");
      return;
    }

    if (!imageSrc) {
      triggerToast("Uploading a destination cover photo is mandatory.", "error");
      return;
    }

    const finalImage = imageSrc;
    
    // Process Highlights (up to 5 items)
    const processedHighlights = highlights.map(h => h.trim()).filter(h => h !== "");
    if (processedHighlights.length === 0) {
      processedHighlights.push("Immerse yourself in spectacular cultural discoveries.");
    }

    // Process Insights (exactly 3 items)
    const processedInsights = insights.map(i => i.trim()).filter(i => i !== "");
    while (processedInsights.length < 3) {
      if (processedInsights.length === 0) processedInsights.push("Breathtaking historical monuments & sightseeing hubs.");
      else if (processedInsights.length === 1) processedInsights.push("Certified Halal food selections and dining options nearby.");
      else processedInsights.push("Unmatched local hospitality with robust heritage legacy.");
    }

    if (editingDestinationId) {
      const updatedDestination: Destination = {
        id: editingDestinationId,
        name,
        region,
        description: shortDesc,
        image: finalImage,
        rating: 4.8,
        highlights: processedHighlights,
        insights: processedInsights,
        overviewText
      };
      onUpdateDestination(updatedDestination);
      triggerToast(`Successfully saved amendments for: ${name}`, "success");
    } else {
      const generatedId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newDestination: Destination = {
        id: generatedId,
        name,
        region,
        description: shortDesc,
        image: finalImage,
        rating: 4.8,
        highlights: processedHighlights,
        insights: processedInsights,
        overviewText
      };
      onAddDestination(newDestination);
      triggerToast(`Successfully deployed destination: ${name}`, "success");
    }
    
    // Reset Form
    setName("");
    setRegion("Northwestern Cambodia");
    setShortDesc("");
    setOverviewText("");
    setHighlights(["", "", "", "", ""]);
    setInsights(["", "", ""]);
    setImageSrc("");
    setEditingDestinationId(null);
    setDestView("list");
  };

  // Coordinate & distance calculation helpers
  const destinationCityCenters: { [id: string]: { lat: number; lng: number, name: string } } = {
    "siem-reap": { lat: 13.3618, lng: 103.8568, name: "Siem Reap City Centre" },
    "phnom-penh": { lat: 11.5564, lng: 104.9282, name: "Phnom Penh City Centre" },
    "koh-rong": { lat: 10.4286, lng: 103.6261, name: "Koh Rong Center" },
    "kampot-kep": { lat: 10.6111, lng: 104.1814, name: "Kampot Town Centre" },
    "battambang": { lat: 13.0957, lng: 103.2022, name: "Battambang Town Centre" },
    "kratie": { lat: 12.4883, lng: 106.0188, name: "Kratie Town Centre" }
  };

  const calculateDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in km
  };

  const getDestinationCenter = (destId: string, destName: string) => {
    if (destinationCityCenters[destId]) {
      return destinationCityCenters[destId];
    }
    const key = Object.keys(destinationCityCenters).find(k => destId.toLowerCase().includes(k) || k.includes(destId.toLowerCase()));
    if (key) return destinationCityCenters[key];
    return { lat: 12.5, lng: 104.9, name: `${destName} Centre` };
  };

  const getAutoDistanceLabel = (coordsStr: string, destId: string) => {
    const parts = coordsStr.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        const dest = destinations.find(d => d.id === destId);
        const center = getDestinationCenter(destId, dest?.name || "Destination");
        const dist = calculateDistanceInKm(lat, lng, center.lat, center.lng);
        const mins = Math.max(Math.round(dist * 1.5), 5); // Rough travel time estimate
        return `${dist.toFixed(1)} km (approx. ${mins} mins drive) from ${center.name}`;
      }
    }
    return "";
  };

  const parseCoordinates = (coordsStr: string) => {
    const parts = coordsStr.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  };

  // Submit Handler for Experience
  const handleExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expName || !expDestId || !expDuration || !expOverviewText) {
      triggerToast("Please fill in all required fields on preceding steps.", "error");
      return;
    }

    // Process highlights: remove empty items, limit to 10
    const processedHighlights = expHighlights.map(h => h.trim()).filter(h => h !== "").slice(0, 10);
    if (processedHighlights.length === 0) {
      processedHighlights.push("Immerse yourself in a luxurious cultural discovery.");
    }

    // Process gallery images: remove empty items, limit to 5
    const processedGallery = expGalleryImages.map(img => img.trim()).filter(img => img !== "").slice(0, 5);
    
    // Process FAQs: remove empty questions/answers, limit to 5
    const processedFaqs = expFaqs.filter(faq => faq.question.trim() !== "" && faq.answer.trim() !== "").slice(0, 5);

    const dest = destinations.find(d => d.id === expDestId);
    const locationLabel = dest ? `${dest.name}, Cambodia` : "Cambodia";

    const mainImage = processedGallery[0] || expOverviewImageSrc || "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=800";

    const updatedExperience: Experience = {
      id: editingExperienceId || expName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: expName,
      category: expCategory,
      shortDescription: expShortDescription || expOverviewText.slice(0, 150) + (expOverviewText.length > 150 ? "..." : ""),
      description: expShortDescription || expOverviewText.slice(0, 150) + (expOverviewText.length > 150 ? "..." : ""),
      image: mainImage,
      location: locationLabel,
      duration: expDuration,
      highlights: processedHighlights,
      
      // Dynamic fields
      isFamilyFriendly: expIsFamilyFriendly,
      destinationId: expDestId,
      overviewText: expOverviewText,
      overviewImage: expOverviewImageSrc || mainImage,
      gallery: processedGallery.length > 0 ? processedGallery : [mainImage],
      googleMapsUrl: expGoogleMapsUrl,
      mapUrl: expGoogleMapsUrl,
      faqs: processedFaqs
    };

    if (editingExperienceId) {
      onUpdateExperience(updatedExperience);
      triggerToast(`Successfully saved amendments for: ${expName}`, "success");
    } else {
      onAddExperience(updatedExperience);
      triggerToast(`Successfully deployed experience: ${expName}`, "success");
    }

    // Reset Form & switch back to list
    setExpName("");
    setExpShortDescription("");
    setExpDestId("");
    setExpDuration("");
    setExpIsFamilyFriendly(false);
    setExpCategory("Heritage");
    setExpOverviewText("");
    setExpOverviewImageSrc("");
    setExpHighlights([""]);
    setExpGalleryImages([""]);
    setExpGoogleMapsUrl("");
    setExpFaqs([{ question: "", answer: "" }]);
    setEditingExperienceId(null);
    setExpFormStep(0);
    setExpView("list");
  };

  // --- Package Form/Wizard Action Handlers ---
  const openAddPackage = () => {
    setEditingPackageId(null);
    setWizardStep(1);
    setPackName("");
    setPackDuration("");
    setPackDestinations([]);
    setPackPrice("");
    setPackBrief("");
    setPackFeaturedImage("");
    setPackKeyHighlights(["", "", ""]);
    setPackIsHalalMeals(true);
    setPackTransportType("Private Transfer & Guide");
    setPackPaceStyle("Leisure");
    setPackOverview("");
    setPackItinerary([{ day: 1, title: "", description: "", meals: "", highlights: "" }]);
    setPackInclusions([]);
    setNewInclusion("");
    setPackExclusions([]);
    setNewExclusion("");
    setPackageHotelSlots([{ type: "predefined", hotelId: "" }]);
    setGalleryUrls(["", "", "", "", "", "", "", ""]);
    setFaqList([
      { q: "Are all meals included in the package verified Halal?", a: "Yes, absolutely. We strictly partner with certified Halal kitchens, or pre-vetted pork-free and alcohol-free dining establishments." },
      { q: "How does prayer-time coordination work during our tours?", a: "Our private guides and chauffeurs are fully aware of daily prayer schedules. Vehicles are stocked with clean prayer mats, Qibla compasses, and water spray bottles." },
      { q: "Can this itinerary be fully customized to our group's preferences?", a: "Absolutely! This package serves as a master layout. You can adjust the duration, swap out hotels, or add specific experiences." },
      { q: "What is the visa policy for traveling to Cambodia?", a: "Most international travelers can obtain a Tourist Visa (Type T) either online as an e-Visa before departure, or on arrival." },
      { q: "What is your support and health safety protocol during the trip?", a: "We offer 24/7 dedicated local concierge support. All guests travel in top-tier private air-conditioned vehicles." }
    ]);
    setPackView("wizard");
  };

  const openEditPackage = (pkg: TourPackage) => {
    setEditingPackageId(pkg.id);
    setWizardStep(1);
    setPackName(pkg.name || (pkg as any).title || "");
    setPackDuration(pkg.duration);
    setPackDestinations(pkg.destinations || []);
    setPackPrice(typeof pkg.price === "number" ? pkg.price.toString() : pkg.price);
    setPackBrief(pkg.brief || "");
    setPackFeaturedImage(pkg.image);
    setPackIsHalalMeals(pkg.isHalalMeals !== false);
    setPackTransportType(pkg.transportType || "Private Transfer & Guide");
    setPackPaceStyle(pkg.paceStyle || "Leisure");
    
    const pHighlights = pkg.keyHighlights || [];
    setPackKeyHighlights([
      pHighlights[0] || "",
      pHighlights[1] || "",
      pHighlights[2] || ""
    ]);
    
    setPackOverview(pkg.description);
    
    if (pkg.itineraryDetails && pkg.itineraryDetails.length > 0) {
      setPackItinerary(pkg.itineraryDetails.map((item, idx) => ({
        day: item.day || idx + 1,
        title: item.title || "",
        description: item.description || "",
        meals: item.meals || "",
        highlights: item.highlights || ""
      })));
    } else if (pkg.itineraryOverview && pkg.itineraryOverview.length > 0) {
      setPackItinerary(pkg.itineraryOverview.map((desc, idx) => {
        const colonIdx = desc.indexOf(":");
        if (colonIdx !== -1) {
          return {
            day: idx + 1,
            title: desc.substring(0, colonIdx).trim(),
            description: desc.substring(colonIdx + 1).trim(),
            meals: "",
            highlights: ""
          };
        }
        return {
          day: idx + 1,
          title: `Day ${idx + 1}`,
          description: desc,
          meals: "",
          highlights: ""
        };
      }));
    } else {
      setPackItinerary([{ day: 1, title: "Day 1 - Arrival", description: "Welcome greeting and airport transfer.", meals: "", highlights: "" }]);
    }
    
    setPackInclusions(pkg.features || []);
    setNewInclusion("");
    setPackExclusions(pkg.exclusions || []);
    setNewExclusion("");
    
    if (pkg.packageHotelsList && pkg.packageHotelsList.length > 0) {
      setPackageHotelSlots(pkg.packageHotelsList.map(item => ({
        type: item.type,
        hotelId: item.hotelId || "",
        customHotel: item.customHotel ? {
          name: item.customHotel.name || "",
          location: item.customHotel.location || "",
          image: item.customHotel.image || "",
          description: item.customHotel.description || "",
          highlights: item.customHotel.highlights || ["", "", ""]
        } : { name: "", location: "", image: "", description: "", highlights: ["", "", ""] }
      })));
    } else {
      const initialSlots: PackageHotelItem[] = [];
      if (pkg.hotelIds && pkg.hotelIds.length > 0) {
        pkg.hotelIds.forEach(hid => {
          initialSlots.push({ type: "predefined", hotelId: hid });
        });
      }
      if (pkg.customHotels && pkg.customHotels.length > 0) {
        pkg.customHotels.forEach(ch => {
          initialSlots.push({
            type: "custom",
            customHotel: { ...ch }
          });
        });
      } else if (pkg.customHotel) {
        initialSlots.push({
          type: "custom",
          customHotel: { ...pkg.customHotel }
        });
      }
      if (initialSlots.length === 0) {
        initialSlots.push({ type: "predefined", hotelId: localHotels[0]?.id || "" });
      }
      setPackageHotelSlots(initialSlots.slice(0, 4));
    }
    
    if (pkg.gallery && pkg.gallery.length > 0) {
      setGalleryUrls([...pkg.gallery]);
    } else {
      setGalleryUrls([]);
    }
    
    if (pkg.faqs && pkg.faqs.length > 0) {
      setFaqList(pkg.faqs.map(f => ({ q: f.q, a: f.a })));
    } else {
      setFaqList([]);
    }
    
    setPackView("wizard");
  };

  const handlePackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packName || !packDuration || !packPrice || !packBrief || !packFeaturedImage) {
      triggerToast("Please fill in all required Step 1 Basic Info fields.", "error");
      return;
    }
    
    if (packKeyHighlights.some(h => h.trim() === "")) {
      triggerToast("Please fill in all 3 Key Highlights in Step 1.", "error");
      return;
    }

    const compiledItineraryDetails = packItinerary.map((item, idx) => ({
      day: idx + 1,
      title: item.title ? item.title.trim() : `Day ${idx + 1}`,
      description: item.description ? item.description.trim() : "",
      meals: item.meals ? item.meals.trim() : "",
      highlights: item.highlights ? item.highlights.trim() : ""
    }));
    
    const itineraryOverview = compiledItineraryDetails.map((item, idx) => {
      if (item.title && item.description) {
        return `${item.title}: ${item.description}`;
      }
      return item.title || item.description || `Day ${idx + 1} activity.`;
    }).filter(x => x !== "");
    
    const cleanSlots = packageHotelSlots.filter(s => {
      if (s.type === "predefined") {
        return !!s.hotelId;
      } else {
        return !!(s.customHotel && s.customHotel.name && s.customHotel.name.trim() !== "");
      }
    });

    const predefinedIds = cleanSlots.filter(s => s.type === "predefined" && s.hotelId).map(s => s.hotelId!);
    const customHotelsArr = cleanSlots.filter(s => s.type === "custom" && s.customHotel).map(s => s.customHotel!);
    
    const cleanGallery = galleryUrls.filter(url => url.trim() !== "");
    const cleanFaqs = faqList.filter(f => f.q.trim() !== "" && f.a.trim() !== "");
    
    const targetId = editingPackageId || packName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const compiledPrice = parseFloat(packPrice.replace(/[^0-9.]/g, "")) || 1899;

    const compiledPackage: TourPackage = {
      id: targetId,
      name: packName,
      duration: packDuration,
      description: packOverview || packBrief,
      image: packFeaturedImage,
      price: compiledPrice,
      rating: 4.9,
      features: packInclusions.length > 0 ? packInclusions : ["Elite Halal Gastronomy", "Private Chauffeur Service", "Wudu-enabled Vehicles"],
      itineraryOverview: itineraryOverview,
      itineraryDetails: compiledItineraryDetails,
      brief: packBrief,
      destinations: packDestinations,
      exclusions: packExclusions,
      packageHotelsList: cleanSlots.length > 0 ? cleanSlots : [{ type: "predefined", hotelId: localHotels[0]?.id || "" }],
      hotelIds: predefinedIds,
      customHotels: customHotelsArr,
      customHotel: customHotelsArr[0] || undefined,
      gallery: cleanGallery,
      faqs: cleanFaqs,
      keyHighlights: packKeyHighlights.filter(h => h.trim() !== ""),
      isHalalMeals: packIsHalalMeals,
      transportType: packTransportType,
      paceStyle: packPaceStyle
    };
    
    if (editingPackageId) {
      if (onUpdatePackage) {
        onUpdatePackage(compiledPackage);
      } else {
        setLocalPackages(prev => prev.map(p => p.id === editingPackageId ? compiledPackage : p));
      }
      triggerToast(`Successfully saved amendments for package: ${packName}`, "success");
    } else {
      if (onAddPackage) {
        onAddPackage(compiledPackage);
      } else {
        setLocalPackages(prev => [compiledPackage, ...prev]);
      }
      triggerToast(`Successfully deployed package: ${packName}`, "success");
    }
    
    setPackView("list");
  };

  const handlePackDelete = (id: string, title?: string) => {
    const item = localPackages.find(p => p.id === id);
    setItemToDelete({ type: 'package', id, name: title || item?.title || "this tour package" });
  };

  // Helper to change pipeline status of guest inquiries
  const updateInquiryStatus = (id: string, newStatus: "PENDING" | "REVIEWED" | "SENT" | "CLOSED") => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    triggerToast(`Inquiry status updated to ${newStatus}`, "success");
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(inq => inq.id !== id));
    triggerToast("Inquiry removed from CRM records.", "info");
  };

  // Verify Checkout simulation
  const runVerifyCheckout = () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult("VERIFICATION SUCCESSFUL: 4/4 Guest Dossiers are fully secured, payment ledgers reconciled, and synchronized with main Cloud Run ledger.");
      triggerToast("System verification check complete!", "success");
    }, 2000);
  };

  // Preset Notifications
  const notificationsList = [
    { id: 1, text: "New High-Value Inquiry: Fatima Al-Sayed requested Siem Reap private pool villa.", time: "1 min ago", read: false },
    { id: 2, text: "Mosque Update: Al-Serkal Mosque updated their Ramadan prayer timing directories.", time: "1 hr ago", read: true },
    { id: 3, text: "Editorial Draft: 'The Halal Food Guide to Kampot' is ready for review.", time: "4 hrs ago", read: true },
    { id: 4, text: "System Integrity Sync: Asset caches optimized and live in production.", time: "1 day ago", read: true }
  ];

  // If not logged in, render the password-protected Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Ambient Backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue-accent/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6 animate-fade-in">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <TransparentLogo 
                src={generalConfig?.websiteLogo || logoImg} 
                alt="Ahlan Cambodia Logo" 
                className="h-14 sm:h-16 w-auto object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity drop-shadow-md"
              />
            </div>
            <div className="inline-flex items-center gap-2 bg-brand-blue-accent/10 border border-brand-blue-accent/20 px-3.5 py-1 rounded-full text-[10px] font-mono text-brand-blue-accent font-bold uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              <span>Password Protected Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-wider uppercase">
              Admin Login
            </h1>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
              Please enter your authorized Gmail account credentials to access the Ahlan Cambodia CMS platform.
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-[#0F1626] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {loginError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block flex items-center justify-between">
                  <span>Curator Gmail Address</span>
                  <Mail className="w-3.5 h-3.5 text-brand-blue-accent/80" />
                </label>
                
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. bassamalie@gmail.com"
                  required
                  className="w-full bg-[#070A11] border border-white/10 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-xs text-white outline-none font-mono font-medium transition-all focus:ring-1 focus:ring-brand-blue-accent"
                />
              </div>

              {/* Password Entry */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span>Portal Password</span>
                    <Lock className="w-3.5 h-3.5 text-brand-blue-accent/80" />
                  </label>
                  <button
                    type="button"
                    onClick={handleStartForgotPassword}
                    className="text-[10px] font-mono text-brand-blue-accent hover:text-white transition-colors underline cursor-pointer font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    className="w-full bg-[#070A11] border border-white/10 focus:border-brand-blue-accent rounded-xl pl-4 pr-10 py-3 text-xs text-white outline-none font-mono font-medium transition-all focus:ring-1 focus:ring-brand-blue-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-blue-accent hover:bg-white text-[#0B0F19] font-mono font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Key className="w-4 h-4" />
                <span>Authenticate & Access Console</span>
              </button>

            </form>

            {/* Account Recovery Helper Badge */}
            <div className="pt-4 border-t border-white/5 text-center text-[10px] font-mono text-slate-400 space-y-1.5 bg-[#070A11]/60 p-3.5 rounded-2xl border border-white/5">
              <p className="font-bold text-brand-blue-accent uppercase tracking-wider flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super User Account & Recovery</span>
              </p>
              <p>Registered Gmail: <span className="text-white font-bold">bassamalie@gmail.com</span></p>
              <p className="text-slate-400 leading-normal">
                Forgotten your password? Click{" "}
                <button
                  type="button"
                  onClick={handleStartForgotPassword}
                  className="text-brand-blue-accent hover:text-white underline font-bold cursor-pointer"
                >
                  Forgot Password?
                </button>{" "}
                to reset it securely anytime.
              </p>
            </div>

          </div>

          {/* Return to Public Platform */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Platform</span>
            </button>
          </div>

        </div>

        {/* Forgot Password Reset Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="relative max-w-md w-full bg-[#0F1626] rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue-accent/15 border border-brand-blue-accent/30 text-brand-blue-accent flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-base tracking-wide uppercase">Reset Admin Password</h3>
                    <p className="text-[10px] font-mono text-brand-blue-accent font-bold uppercase tracking-wider">
                      Step {resetStep} of 2: {resetStep === 1 ? "Verify Gmail Account" : "Set New Password"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-red-400 text-xs font-sans leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-400 text-xs font-sans font-bold leading-relaxed">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {/* Step 1: Verify Email */}
              {resetStep === 1 && (
                <form onSubmit={handleVerifyResetEmail} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Select a user account or enter a registered Gmail email address to reset the password.
                  </p>
                  
                  {cmsUsers.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        Select Account to Reset *
                      </label>
                      <select
                        value={resetEmailInput}
                        onChange={(e) => setResetEmailInput(e.target.value)}
                        className="w-full bg-[#070A11] border border-white/10 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-xs text-white outline-none font-mono"
                      >
                        {cmsUsers.map(u => (
                          <option key={u.id} value={u.email} className="bg-[#0F1626] text-white">
                            {u.role === "SUPER_ADMIN" ? "Super Admin" : "Curator"}: {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Or Type Registered Gmail Address
                    </label>
                    <input
                      type="email"
                      value={resetEmailInput}
                      onChange={(e) => setResetEmailInput(e.target.value)}
                      placeholder="e.g. bassamalie@gmail.com"
                      required
                      className="w-full bg-[#070A11] border border-white/10 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-blue-accent hover:bg-white text-[#0B0F19] px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Verify & Proceed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Enter New Password */}
              {resetStep === 2 && foundResetUser && (
                <form onSubmit={handleCompletePasswordReset} className="space-y-4">
                  <div className="bg-slate-900 border border-brand-blue-accent/30 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-blue-accent text-[#0F1626] font-bold font-serif flex items-center justify-center text-xs uppercase">
                      {foundResetUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white font-bold truncate">{foundResetUser.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{foundResetUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showResetPasswordToggle ? "text" : "password"}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Enter new password (min 4 characters)"
                        required
                        className="w-full bg-[#070A11] border border-white/10 focus:border-brand-blue-accent rounded-xl pl-4 pr-10 py-3 text-xs text-white outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPasswordToggle(!showResetPasswordToggle)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showResetPasswordToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Confirm New Password *
                    </label>
                    <input
                      type={showResetPasswordToggle ? "text" : "password"}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full bg-[#070A11] border border-white/10 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-blue-accent hover:bg-white text-[#0B0F19] px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save New Password</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </div>
    );
  }

  // Filter sidebar navigation items based on current logged in user permissions
  const allNavItems = [
    { id: "guest-inquiries", label: "Guest Inquiries", icon: MessageSquare, count: inquiries.length },
    { id: "homepage-settings", label: "Homepage Settings", icon: Settings },
    { id: "destinations", label: "Destinations", icon: Compass, count: destinations.length },
    { id: "experiences", label: "Experiences", icon: Star, count: experiences.length },
    { id: "packages", label: "Packages", icon: Briefcase, count: localPackages.length },
    { id: "resorts-hotels", label: "Hotel", icon: ImageIcon, count: localHotels.length },
    { id: "dining", label: "Dining", icon: Utensils, count: localRestaurants.length },
    { id: "mosques", label: "Mosques", icon: MosqueIcon, count: localMosques.length },
    { id: "travel-blog", label: "BLOG", icon: BookOpen, count: localGuides.length },
    { id: "media-library", label: "Media Library", icon: FolderOpen },
    { id: "general-config", label: "General Config", icon: Layers },
    { id: "user-accounts", label: "User Accounts", icon: Users, count: cmsUsers.length }
  ];

  const visibleNavItems = allNavItems.filter(item => {
    if (currentUser.role === "SUPER_ADMIN") return true;
    if (item.id === "user-accounts") return false; // Super admin only
    return currentUser.allowedTabs.includes(item.id);
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased">
      
      {/* ----------------- SIDEBAR ----------------- */}
      <aside className="w-full lg:w-[290px] bg-[#0F1626] shrink-0 border-r border-brand-blue-accent/15 flex flex-col justify-between py-6 text-white relative z-20 shadow-xl">
        
        <div className="space-y-6">
          {/* Logo & Branding Area */}
          <div className="px-5 flex flex-col space-y-4">
            <div className="flex items-center">
              <TransparentLogo 
                src={generalConfig?.websiteLogo || logoImg} 
                alt="Ahlan Cambodia Logo" 
                className="h-12 sm:h-14 w-auto max-w-[220px] object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity drop-shadow-md"
              />
            </div>
            
            {/* Return To Live Site Button */}
            <button 
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 border border-brand-blue-accent/30 hover:border-brand-blue-accent bg-brand-blue-accent/10 hover:bg-brand-blue-accent/20 text-brand-blue-accent text-[10px] font-mono font-bold uppercase tracking-widest py-2.5 px-4 rounded-xl transition-luxury shadow-inner cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Live Site</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setDossierFilter("ALL");
                    setSearchDossierQuery("");
                    if (item.id === "destinations") {
                      setDestView("list");
                    }
                    if (item.id === "experiences") {
                      setExpView("list");
                      setExpFormStep(0);
                    }
                    if (item.id === "mosques") {
                      setMosqueView("list");
                      setMosqueFormStep(1);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-luxury cursor-pointer ${
                    isActive 
                      ? "bg-brand-blue-accent text-[#0B0F19] shadow-lg border border-brand-blue-accent/40 transform scale-[1.02]" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0B0F19]" : "text-brand-blue-accent/80"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive 
                        ? "bg-[#0B0F19] text-brand-blue-accent" 
                        : "bg-slate-800 border border-slate-700 text-slate-300"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Verify Checkout */}
        <div className="px-4 mt-6">
          <button
            onClick={runVerifyCheckout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-brand-blue-accent/30 rounded-xl py-3 px-4 text-[10px] font-mono font-bold uppercase tracking-widest transition-luxury cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-brand-blue-accent animate-pulse" />
            <span>Verify Checkout</span>
          </button>
        </div>

      </aside>

      {/* ----------------- MAIN PANEL AREA ----------------- */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* --- TOP BAR HEADER --- */}
        <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
          
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-serif text-[#0F1626] font-bold tracking-wider uppercase">
              {activeTab === "guest-inquiries" && "Guest Inquiries"}
              {activeTab === "destinations" && "Destinations"}
              {activeTab === "experiences" && "Experiences"}
              {activeTab === "packages" && "Packages"}
              {activeTab === "resorts-hotels" && "Hotel"}
              {activeTab === "dining" && "Dining"}
              {activeTab === "mosques" && "Mosques"}
              {activeTab === "travel-blog" && "BLOG"}
              {activeTab === "media-library" && "Media Library"}
              {activeTab === "cambodia-hub" && "Cambodia Hub Portal"}
              {activeTab === "general-config" && "General Configuration"}
              {activeTab === "homepage-settings" && "Homepage Customizations"}
              {activeTab === "privacy-policy" && "Privacy Policy"}
              {activeTab === "terms-conditions" && "Terms & Conditions"}
              {activeTab === "user-accounts" && "Curator Accounts"}
            </h1>
            <p className="text-[11px] font-mono text-slate-500 font-medium">
              {activeTab === "guest-inquiries" && `Track, verify, and resolve real-time inbound guest inquiries (${inquiries.length} total entries)`}
              {activeTab === "destinations" && `Add, edit, and optimize luxury destinations on the live platform (${destinations.length} total)`}
              {activeTab === "experiences" && `Add, edit, and optimize luxury day experiences and cultural itineraries (${experiences.length} total)`}
              {activeTab === "packages" && `Configure custom tour packages, price lists, and regional durations (${localPackages.length} packages)`}
              {activeTab === "resorts-hotels" && "Manage certified luxury hospitality partners, room services, and halal compliance"}
              {activeTab === "dining" && "Manage curated halal dining listings, menus, and certifications"}
              {activeTab === "mosques" && `Configure sacred mosques, jummah schedules, and visitor parameters (${localMosques.length} total)`}
              {activeTab === "travel-blog" && "Publish and schedule inspirational guides, tips, and Halal travel narratives"}
              {activeTab === "media-library" && "Browse, retrieve, copy, and manage files uploaded to Firebase Storage"}
              {activeTab === "cambodia-hub" && "Central control center for local Halal dining, mosques, and Islamic resources"}
              {activeTab === "general-config" && "Adjust brand assets, website/footer logos, favicon, contact details, and social handles"}
              {activeTab === "homepage-settings" && "Customize homepage promotional highlights, video banners, and text assets"}
              {activeTab === "privacy-policy" && "Edit and update system compliance directives and privacy laws"}
              {activeTab === "terms-conditions" && "Edit and publish customer usage policies and financial conditions"}
              {activeTab === "user-accounts" && "Manage admin permissions, digital curators, and access tokens"}
            </p>
          </div>

          <div className="flex items-center justify-end gap-4">
            
            {/* Interactive Search CRM */}
            <div className="relative w-48 sm:w-64 max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search CRM..."
                value={searchCrmQuery}
                onChange={(e) => {
                  setSearchCrmQuery(e.target.value);
                  setSearchDossierQuery(e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-luxury font-mono text-slate-700"
              />
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-red-500 transition-luxury relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-bounce" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30 animate-fade-in text-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="font-mono font-bold uppercase text-slate-700 tracking-wider">Curator Notifications</span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">New Updates</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notificationsList.map(notif => (
                      <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? "bg-slate-300" : "bg-red-500"}`} />
                        <div>
                          <p className="text-slate-700 font-medium">{notif.text}</p>
                          <span className="text-[9px] font-mono text-slate-400 block mt-1">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Widget & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-serif font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[9px] font-mono text-brand-blue-accent font-bold uppercase tracking-wider">
                  {currentUser.role === "SUPER_ADMIN" ? "Super User" : "Curator Account"}
                </p>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-[#0F1626] text-brand-blue-accent border border-brand-blue-accent/30 font-bold flex items-center justify-center select-none shadow-md uppercase font-serif"
                title={currentUser.email}
              >
                {currentUser.name.charAt(0) || "U"}
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                title="Log Out of CMS"
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </header>

        {/* --- DYNAMIC MAIN WRAPPER --- */}
        <div className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* ---------------- KPI CARDS CONTAINER ---------------- */}
          {activeTab === "guest-inquiries" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 animate-fade-in">
              {[
                { label: "Total Inquiries", value: inquiries.length, trend: "▲ 12.5%", sub: "vs last 30d", color: "text-emerald-600 bg-emerald-50", icon: MessageSquare },
                { label: "New Inquiries", value: inquiries.filter(i => i.status === "PENDING").length, trend: "▲ 8.3%", sub: "vs last 30d", color: "text-brand-blue-accent bg-brand-blue-accent/10", icon: Calendar },
                { label: "In Progress", value: inquiries.filter(i => i.status === "REVIEWED").length, trend: "▲ 3.1%", sub: "vs last 30d", color: "text-amber-500 bg-amber-50", icon: RefreshCw },
                { label: "Proposal Sent", value: inquiries.filter(i => i.status === "SENT").length, trend: "▲ 14.2%", sub: "vs last 30d", color: "text-indigo-600 bg-indigo-50", icon: Sparkles },
                { label: "Closed", value: inquiries.filter(i => i.status === "CLOSED").length, trend: "— 0%", sub: "vs last 30d", color: "text-slate-500 bg-slate-100", icon: CheckCircle },
                { label: "Total Customers", value: inquiries.length, trend: "▲ 11.7%", sub: "active hub", color: "text-emerald-600 bg-emerald-50", icon: Users }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-luxury">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                        {stat.label}
                      </span>
                      <div className={`p-1.5 rounded-lg border border-slate-100 ${stat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-extrabold text-slate-800">{stat.value}</h3>
                      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
                        <span className="text-emerald-600 font-bold">{stat.trend}</span>
                        <span className="text-slate-400">{stat.sub}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {activeTab === "destinations" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {[
                { label: "ACTIVE COUNTRIES", value: destinations.length, color: "text-blue-600 bg-blue-50 border-blue-100", icon: Globe },
                { label: "SUB-REGIONS CURATED", value: "23", color: "text-amber-600 bg-amber-50 border-amber-100", icon: Compass },
                { label: "CURATED COUNTRY FACTS", value: "0", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: Star },
                { label: "DESTINATIONS FAQS", value: "66", color: "text-purple-600 bg-purple-50 border-purple-100", icon: BookOpen }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center justify-between min-h-[110px] hover:shadow-md transition-luxury">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {stat.label}
                      </span>
                      <h3 className="text-3xl font-sans font-extrabold text-[#0F1626] leading-none">{stat.value}</h3>
                    </div>
                    <div className={`p-4 rounded-2xl border ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {activeTab === "experiences" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {[
                { label: "EXPERIENCES", value: experiences.length, color: "text-blue-600 bg-blue-50 border-blue-100", icon: Star },
                { label: "FAMILY FRIENDLY", value: experiences.filter(e => e.isFamilyFriendly).length, color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: Heart },
                { label: "CATEGORIES ACTIVE", value: "4", color: "text-purple-600 bg-purple-50 border-purple-100", icon: Compass },
                { label: "AVG DURATION", value: "4.5 Hours", color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm flex items-center justify-between min-h-[110px] hover:shadow-md transition-luxury">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {stat.label}
                      </span>
                      <h3 className="text-3xl font-sans font-extrabold text-[#0F1626] leading-none">{stat.value}</h3>
                    </div>
                    <div className={`p-4 rounded-2xl border ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {activeTab === "packages" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 animate-fade-in">
              {[
                { label: "Active Packages", value: localPackages.length, trend: "▲ 20%", sub: "vs last year", color: "text-indigo-600 bg-indigo-50", icon: Briefcase },
                { label: "Avg Itinerary", value: "6.3 Days", trend: "Optimal", sub: "Muslim leisure", color: "text-brand-blue-accent bg-brand-blue-accent/10", icon: Clock },
                { label: "Halal Verified", value: "100%", trend: "Guaranteed", sub: "Meals & prayer", color: "text-emerald-600 bg-emerald-50", icon: ShieldCheck },
                { label: "Bookings", value: "18 Active", trend: "▲ 8.3%", sub: "this month", color: "text-emerald-600 bg-emerald-50", icon: Users },
                { label: "Review Rate", value: "4.9 ★", trend: "Excellent", sub: "Guest satisfaction", color: "text-amber-500 bg-amber-50", icon: Star },
                { label: "Catalog Value", value: "$3,400 Avg", trend: "Premium", sub: "High tier tier", color: "text-slate-500 bg-slate-100", icon: DollarSign }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-luxury">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                        {stat.label}
                      </span>
                      <div className={`p-1.5 rounded-lg border border-slate-100 ${stat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-extrabold text-slate-800">{stat.value}</h3>
                      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
                        <span className="text-emerald-600 font-bold">{stat.trend}</span>
                        <span className="text-slate-400">{stat.sub}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Verification Progress Modal Overlay */}
          {isVerifying && (
            <div className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white border border-brand-blue-accent/30 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-brand-blue-accent/10 border border-brand-blue-accent/30 flex items-center justify-center mx-auto text-brand-blue-accent animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-serif font-extrabold text-[#0B0F19] tracking-wider uppercase">VERIFYING CUSTOMER LEDGERS</h3>
                  <p className="text-xs font-mono text-slate-500">Connecting securely with isolated transaction databases to verify Halal allocations, transport manifests, and customer profiles...</p>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue-accent animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Results Panel */}
          {verificationResult && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-emerald-800 text-xs font-mono shadow-sm animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider">SYSTEM INTEGRITY SANITY CHECK: GREEN</span>
                  <button onClick={() => setVerificationResult(null)} className="text-emerald-500 hover:text-emerald-700 font-bold">Dismiss</button>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed">{verificationResult}</p>
              </div>
            </div>
          )}

          {/* Interactive Session Toast Alert */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-[#0B0F19] text-white border border-brand-blue-accent/30 rounded-2xl px-5 py-4 shadow-2xl z-50 flex items-center gap-3 animate-slide-in text-xs max-w-sm">
              <div className={`p-1.5 rounded-lg ${toastType === "success" ? "bg-emerald-500/20 text-emerald-400" : toastType === "error" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                {toastType === "success" ? <CheckCircle className="w-4 h-4" /> : toastType === "error" ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              </div>
              <p className="font-medium flex-1">{toastMessage}</p>
              <button onClick={() => setToastMessage(null)} className="text-white/40 hover:text-white ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}


          {/* ---------------------------------------------------- */}
          {/* ------------------ TAB SPECIFIC DOSSIER CONTENT ---- */}
          {/* ---------------------------------------------------- */}

          {/* 1. GUEST INQUIRIES DOSSIER */}
          {activeTab === "guest-inquiries" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-serif font-extrabold text-[#0F1626] tracking-wider uppercase flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-blue-accent" />
                    <span>Real Customer Inquiries Dossier</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage real-time guest inquiries, review travel scopes, and update pipeline statuses
                  </p>
                </div>

                {/* Filter and segmented tab selectors */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                  {["ALL", "PENDING", "REVIEWED", "SENT", "CLOSED"].map(filterKey => {
                    const count = filterKey === "ALL" 
                      ? inquiries.length 
                      : inquiries.filter(i => i.status === filterKey).length;
                    const isSelected = dossierFilter === filterKey;
                    return (
                      <button
                        key={filterKey}
                        onClick={() => setDossierFilter(filterKey)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-luxury cursor-pointer ${
                          isSelected 
                            ? "bg-[#0F1626] text-white shadow-sm" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {filterKey} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dossier Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search name, email, query, region..."
                  value={searchDossierQuery}
                  onChange={(e) => setSearchDossierQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-luxury font-mono text-slate-700"
                />
              </div>

              {/* Inquiries table */}
              {(() => {
                const filteredInquiries = inquiries.filter(i => {
                  const matchesFilter = dossierFilter === "ALL" || i.status === dossierFilter;
                  const queryLower = searchDossierQuery.toLowerCase();
                  const matchesSearch = !searchDossierQuery || 
                    i.name.toLowerCase().includes(queryLower) ||
                    i.email.toLowerCase().includes(queryLower) ||
                    i.query.toLowerCase().includes(queryLower) ||
                    i.region.toLowerCase().includes(queryLower);
                  return matchesFilter && matchesSearch;
                });

                if (filteredInquiries.length === 0) {
                  return (
                    <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Heart className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#0F1626]">No Inquiry Records Found Matching Criteria</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Try clearing your active query search filters or switching tabs
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                          <th className="py-3.5 px-4">Guest Information</th>
                          <th className="py-3.5 px-4">Requested Tour Scope & Query Details</th>
                          <th className="py-3.5 px-4">Territory</th>
                          <th className="py-3.5 px-4">Pipeline Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredInquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors text-xs font-sans">
                            <td className="py-4 px-4 space-y-1">
                              <h4 className="font-bold text-[#0F1626] text-sm">{inq.name}</h4>
                              <div className="space-y-0.5 text-[10px] font-mono text-slate-500">
                                <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-brand-blue-accent/80" /> {inq.email}</p>
                                <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-brand-blue-accent/80" /> {inq.phone}</p>
                                <p className="text-[9px] text-slate-400">Received on {inq.date}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4 max-w-sm">
                              <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                "{inq.query}"
                              </p>
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px] font-semibold text-slate-700">
                              {inq.region}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider inline-block ${
                                inq.status === "PENDING" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                inq.status === "REVIEWED" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                inq.status === "SENT" ? "bg-indigo-100 text-indigo-700 border border-indigo-200" :
                                "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}>
                                {inq.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <select
                                  value={inq.status}
                                  onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                                  className="bg-slate-50 hover:bg-white text-[10px] font-mono font-bold uppercase border border-slate-200 hover:border-brand-blue-accent rounded-lg py-1 px-2 outline-none cursor-pointer text-slate-700"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="REVIEWED">REVIEWED</option>
                                  <option value="SENT">SENT</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                                <button
                                  onClick={() => deleteInquiry(inq.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-100 transition-luxury cursor-pointer"
                                  title="Delete Inquiry Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

            </div>
          )}


          {/* 2. DESTINATIONS MANAGEMENT DOSSIER */}
          {activeTab === "destinations" && (
            <div className="space-y-6">
              
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* LEFT COLUMN: CURRENT CATALOG */}
                {!isListHidden && (
                  <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-brand-blue-accent shrink-0" />
                        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#0F1626]">
                          CURRENT CATALOG ({destinations.length})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsListHidden(true)}
                        className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-[#0F1626] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Hide List <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Search inside Destinations */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search catalog..."
                        value={searchDossierQuery}
                        onChange={(e) => setSearchDossierQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white text-xs rounded-xl pl-9 pr-4 py-2 outline-none transition-all font-mono text-slate-700"
                      />
                    </div>

                    {/* Add New Destination Shortcut button */}
                    <button
                      type="button"
                      onClick={() => {
                        setName("");
                        setRegion("Northwestern Cambodia");
                        setShortDesc("");
                        setOverviewText("");
                        setHighlights(["", "", "", "", ""]);
                        setInsights(["", "", ""]);
                        setImageSrc("");
                        setEditingDestinationId(null);
                        setFormStep(0);
                        triggerToast("Form initialized for a new destination!", "info");
                      }}
                      className="w-full bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Deploy New Destination</span>
                    </button>

                    {/* Scrollable container of destinations */}
                    <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                      {(() => {
                        const filtered = destinations.filter(d => {
                          const queryLower = searchDossierQuery.toLowerCase();
                          return !searchDossierQuery ||
                            d.name.toLowerCase().includes(queryLower) ||
                            d.region.toLowerCase().includes(queryLower) ||
                            d.description.toLowerCase().includes(queryLower) ||
                            d.highlights.some(h => h.toLowerCase().includes(queryLower));
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-8 space-y-2">
                              <p className="text-xs font-mono text-slate-400">No destinations found</p>
                            </div>
                          );
                        }

                        return filtered.map((dest) => (
                          <div
                            key={dest.id}
                            className={`p-3 bg-white border rounded-2xl flex items-center justify-between gap-3 shadow-sm transition-all duration-200 hover:shadow ${
                              editingDestinationId === dest.id 
                                ? "border-brand-blue-accent ring-1 ring-brand-blue-accent/30 bg-brand-blue-accent/5" 
                                : "border-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 shadow-sm">
                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-sans font-bold text-xs text-[#0F1626] uppercase tracking-wide truncate">
                                  {dest.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate max-w-[130px] leading-snug">
                                  {dest.description}
                                </p>
                                <span className="text-[9px] font-mono text-brand-blue-accent font-bold uppercase tracking-wider block mt-0.5 bg-amber-100/40 px-1.5 py-0.5 rounded w-max">
                                  ID: {dest.id}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setName(dest.name);
                                  setRegion(dest.region);
                                  setShortDesc(dest.description);
                                  setOverviewText(dest.overviewText || "");
                                  
                                  // Load highlights
                                  const loadedHighlights = [...dest.highlights];
                                  while (loadedHighlights.length < 5) loadedHighlights.push("");
                                  setHighlights(loadedHighlights);
                                  
                                  // Load insights
                                  const loadedInsights = dest.insights ? [...dest.insights] : [];
                                  while (loadedInsights.length < 3) loadedInsights.push("");
                                  setInsights(loadedInsights);

                                  setImageSrc(dest.image);
                                  setEditingDestinationId(dest.id);
                                  setFormStep(0);
                                  triggerToast(`Loaded: ${dest.name}`, "info");
                                }}
                                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-[#0F1626] hover:bg-[#0F1626] hover:text-white border border-slate-200 hover:border-[#0F1626] rounded-lg transition-colors cursor-pointer"
                              >
                                EDIT
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setItemToDelete({ type: 'destination', id: dest.id, name: dest.name });
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* RIGHT COLUMN: WORK AREA & FORM */}
                <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm min-w-0 w-full">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      {isListHidden && (
                        <button
                          type="button"
                          onClick={() => setIsListHidden(false)}
                          className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-brand-blue-accent flex items-center gap-1 mb-2 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm"
                        >
                          <ChevronRight className="w-3 h-3 rotate-180 animate-pulse" /> Show Catalog List
                        </button>
                      )}
                      <h3 className="font-sans font-extrabold text-xs uppercase tracking-wider text-slate-400">
                        {editingDestinationId ? "AMEND DESTINATION AND CATALOG INFORMATION" : "CREATE NEW COUNTRY AND CATALOG INFORMATION"}
                      </h3>
                      {editingDestinationId && (
                        <p className="text-[10px] font-mono text-brand-blue-accent font-bold uppercase">
                          Currently adjusting metadata for: {name} (ID: {editingDestinationId})
                        </p>
                      )}
                    </div>
                    {editingDestinationId && (
                      <button
                        type="button"
                        onClick={() => {
                          setName("");
                          setRegion("Northwestern Cambodia");
                          setShortDesc("");
                          setOverviewText("");
                          setHighlights(["", "", "", "", ""]);
                          setInsights(["", "", ""]);
                          setImageSrc("");
                          setEditingDestinationId(null);
                          setFormStep(0);
                          triggerToast("Form reset to create a new destination record.", "info");
                        }}
                        className="text-[10px] font-mono font-bold uppercase text-slate-500 hover:text-[#0F1626] border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                      >
                        Create New Instead
                      </button>
                    )}
                  </div>

                  {/* Horizontal Tabs / Steps */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                    {[
                      { label: "1. GENERAL INFO & BANNER", step: 0 },
                      { label: "2. CARD HIGHLIGHTS", step: 1 },
                      { label: "3. TRAVELER INSIGHTS", step: 2 }
                    ].map(tab => (
                      <button
                        key={tab.step}
                        type="button"
                        onClick={() => setFormStep(tab.step)}
                        className={`px-4 py-2 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          formStep === tab.step
                            ? "bg-[#0F1626] text-white shadow-md border border-[#0F1626]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* STEP 0: GENERAL INFO & BANNER */}
                    {formStep === 0 && (
                      <div className="space-y-6 animate-fade-in">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Country Name Display
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., Kep Beachfront"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-blue-accent focus:bg-white transition-all font-medium text-slate-700"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Predefined Cambodia Region *
                            </label>
                            <select
                              required
                              value={region}
                              onChange={(e) => setRegion(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-blue-accent focus:bg-white transition-all text-slate-700 font-semibold cursor-pointer appearance-none"
                            >
                              <option value="Northwestern Cambodia">Northwestern Cambodia (Siem Reap, Angkor Wat)</option>
                              <option value="Central Cambodia">Central Cambodia (Phnom Penh, capital province)</option>
                              <option value="Southern Islands">Southern Islands (Koh Rong, Sihanoukville)</option>
                              <option value="Southern Coastline">Southern Coastline (Kampot, Kep Beachfront)</option>
                              <option value="Western Cambodia">Western Cambodia (Battambang, local crafts)</option>
                              <option value="Northeastern Mekong">Northeastern Mekong (Kratie river dolphin country)</option>
                            </select>
                          </div>
                        </div>

                        {/* Branded Tagline Subtitle */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                            Branded Tagline Subtitle *
                          </label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Seaside temples & white sand cliffs"
                            value={shortDesc}
                            onChange={(e) => setShortDesc(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-blue-accent focus:bg-white transition-all resize-none leading-relaxed text-slate-600"
                            maxLength={180}
                          />
                          <p className="text-[9px] font-mono text-slate-400 text-right font-semibold">
                            {shortDesc.length}/180 characters limit.
                          </p>
                        </div>

                        {/* Detailed Overview editorial */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                            Detailed Editorial Overview Description *
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Provide a comprehensive travel editorial introduction for Muslim travelers visiting this beautiful area..."
                            value={overviewText}
                            onChange={(e) => setOverviewText(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-blue-accent focus:bg-white transition-all leading-relaxed text-slate-600"
                          />
                        </div>

                        {/* Hero Photo upload & presets */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                            Destination Cover Image *
                          </label>
                          
                          <div 
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                              dragActive 
                                ? "border-brand-blue-accent bg-brand-blue-accent/5" 
                                : "border-slate-200 hover:border-brand-blue-accent hover:bg-slate-50 bg-slate-50"
                            }`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                          >
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden" 
                            />
                            
                            <div className="space-y-3">
                              {imageSrc ? (
                                <div className="relative max-w-sm mx-auto h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                  <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="text-white font-mono text-[9px] font-bold uppercase tracking-widest bg-black/75 px-2.5 py-1.5 rounded-lg border border-white/20">Change Photo</span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                                    <Upload className="w-4 h-4 text-brand-blue-accent" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-sans font-bold text-[#0F1626]">
                                      Drag & drop your destination photo here, or <span className="text-brand-blue-accent underline">browse files</span>
                                    </p>
                                    <p className="text-[9px] font-mono text-slate-400">
                                      Supports JPG, PNG, WEBP, or SVG formats
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* STEP 1: CARD HIGHLIGHTS */}
                    {formStep === 1 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                            Card Highlights (Up to 5 points) *
                          </label>
                          <p className="text-[9px] font-mono text-slate-400">
                            These points represent key travel landmarks shown on the main card list (1 required, 4 optional).
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {highlights.map((hl, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                              <span className="text-[10px] font-mono font-bold text-brand-blue-accent px-1">{idx + 1}</span>
                              <input
                                type="text"
                                required={idx === 0}
                                placeholder={
                                  idx === 0
                                    ? "e.g., Legendary sunset over ancient historic ruins. (Required)"
                                    : `Highlight #${idx + 1} (Optional)`
                                }
                                value={hl}
                                onChange={(e) => {
                                  const updated = [...highlights];
                                  updated[idx] = e.target.value;
                                  setHighlights(updated);
                                }}
                                className="w-full bg-transparent border-none outline-none py-1.5 text-xs text-slate-700"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: TRAVELER INSIGHTS */}
                    {formStep === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                            Traveler Insights (Exactly 3 points) *
                          </label>
                          <p className="text-[9px] font-mono text-slate-400">
                            These points represent certified Halal facilities/amenities featured below the overview.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {insights.map((ins, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
                              <span className="text-[10px] font-mono font-bold text-[#0F1626] px-1">{idx + 1}</span>
                              <input
                                type="text"
                                required
                                placeholder={
                                  idx === 0
                                    ? "e.g., Convenient prayer facility locations and designated zones."
                                    : idx === 1
                                    ? "e.g., Certified halal gourmet options and restaurant networks."
                                    : "e.g., Family-focused scenic pathways and transport guides."
                                }
                                value={ins}
                                onChange={(e) => {
                                  const updated = [...insights];
                                  updated[idx] = e.target.value;
                                  setInsights(updated);
                                }}
                                className="w-full bg-transparent border-none outline-none py-1.5 text-xs text-slate-700"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form actions / Step navigation */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                      <div className="flex gap-2">
                        {formStep > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormStep(s => s - 1)}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            Previous Step
                          </button>
                        )}
                        {formStep < 2 && (
                          <button
                            type="button"
                            onClick={() => setFormStep(s => s + 1)}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            Next Step
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md cursor-pointer"
                      >
                        {editingDestinationId ? "Save Amendments" : "Publish Destination Asset"}
                      </button>
                    </div>

                  </form>

                </div>

              </div>

            </div>
          )}


          {/* EXPERIENCES MANAGEMENT DOSSIER */}
          {activeTab === "experiences" && (
            <div className="space-y-6">
              
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* LEFT COLUMN: CURRENT EXPERIENCES CATALOG */}
                {expView === "list" && (
                  <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-brand-blue-accent shrink-0" />
                        <h3 className="font-serif font-bold text-base text-[#0F1626]">
                          EXPERIENCES DIRECTORY ({experiences.length})
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          // Reset form states for clean additions
                          setExpName("");
                          setExpShortDescription("");
                          setExpDestId(destinations[0]?.id || "");
                          setExpDuration("4 Hours");
                          setExpIsFamilyFriendly(true);
                          setExpCategory("Heritage");
                          setExpOverviewText("");
                          setExpOverviewImageSrc("");
                          setExpHighlights(["", ""]);
                          setExpGalleryImages([""]);
                          setExpGoogleMapsUrl("");
                          setExpFaqs([{ question: "", answer: "" }]);
                          setEditingExperienceId(null);
                          setExpFormStep(0);
                          setExpView("form");
                        }}
                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border border-transparent hover:border-brand-blue-accent cursor-pointer"
                      >
                        + Create Experience
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {experiences.map((exp) => {
                        return (
                          <div key={exp.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                            <div className="h-44 relative bg-slate-200 overflow-hidden shrink-0">
                              <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold text-[#0F1626] uppercase">
                                {exp.category}
                              </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-serif font-extrabold text-slate-800 text-base leading-tight truncate">{exp.name}</h4>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Compass className="w-3.5 h-3.5 text-brand-blue-accent shrink-0" />
                                  <span className="truncate">{exp.location}</span>
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <span className="bg-slate-100 text-slate-600 rounded px-2 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" /> {exp.duration}
                                  </span>
                                  {exp.isFamilyFriendly && (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded px-2 py-0.5 text-[9px] font-mono font-bold">
                                      Family Friendly
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-auto">
                                <button
                                  onClick={() => {
                                    setExpName(exp.name);
                                    setExpShortDescription(exp.shortDescription || exp.description || "");
                                    setExpDestId(exp.destinationId || destinations[0]?.id || "");
                                    setExpDuration(exp.duration);
                                    setExpIsFamilyFriendly(!!exp.isFamilyFriendly);
                                    setExpCategory(exp.category);
                                    setExpOverviewText(exp.overviewText || exp.description);
                                    setExpOverviewImageSrc(exp.overviewImage || exp.image);
                                    setExpHighlights(exp.highlights.length > 0 ? exp.highlights : [""]);
                                    setExpGalleryImages(exp.gallery && exp.gallery.length > 0 ? exp.gallery : [exp.image]);
                                    setExpGoogleMapsUrl(exp.googleMapsUrl || exp.mapUrl || "");
                                    setExpFaqs(exp.faqs && exp.faqs.length > 0 ? exp.faqs : [{ question: "", answer: "" }]);
                                    setEditingExperienceId(exp.id);
                                    setExpFormStep(0);
                                    setExpView("form");
                                  }}
                                  className="border border-slate-300 hover:border-[#0F1626] bg-white text-[#0F1626] hover:bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Edit Info
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete experience "${exp.name}"?`)) {
                                      onDeleteExperience(exp.id);
                                      triggerToast(`Successfully deleted ${exp.name}`, "info");
                                    }
                                  }}
                                  className="border border-transparent hover:border-red-200 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Experience"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* EDIT/ADD MULTI-STEP WIZARD FORM */}
                {expView === "form" && (
                  <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-blue-accent font-bold">
                          {editingExperienceId ? "AMEND EXISTING EXPERIENCE" : "CREATE NEW EXPERIENCE"}
                        </span>
                        <h3 className="font-serif font-extrabold text-[#0F1626] text-xl">
                          {editingExperienceId ? `Editing: ${expName}` : "New Curated Adventure Asset"}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpView("list")}
                        className="text-slate-400 hover:text-slate-600 font-mono text-[10px] font-bold uppercase tracking-widest border border-slate-200 px-3.5 py-1.5 rounded-xl cursor-pointer bg-white"
                      >
                        Cancel & Return
                      </button>
                    </div>

                    {/* Step Wizard Horizontal Progress Header */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 border-b border-slate-100 pb-5">
                      {[
                        { step: 0, title: "1. BASIC INFO" },
                        { step: 1, title: "2. OVERVIEW" },
                        { step: 2, title: "3. HIGHLIGHTS" },
                        { step: 3, title: "4. GALLERY" },
                        { step: 4, title: "5. LOCATION" },
                        { step: 5, title: "6. FAQS" }
                      ].map((item) => {
                        const isActive = expFormStep === item.step;
                        const isCompleted = expFormStep > item.step;
                        return (
                          <button
                            key={item.step}
                            type="button"
                            onClick={() => setExpFormStep(item.step)}
                            className={`py-2.5 px-3 rounded-xl text-[10px] font-mono font-bold text-center uppercase tracking-wider transition-all duration-300 border ${
                              isActive 
                                ? "bg-[#0F1626] text-brand-blue-accent border-brand-blue-accent" 
                                : isCompleted 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {item.title} {isCompleted && "✓"}
                          </button>
                        );
                      })}
                    </div>

                    <form onSubmit={handleExpSubmit} className="space-y-6">
                      
                      {/* STEP 1: BASIC DETAILS */}
                      {expFormStep === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Experience Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., Angkor Sunrise Spiritual Cycle Tour"
                              value={expName}
                              onChange={(e) => setExpName(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700 font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Associated Destination *
                            </label>
                            <select
                              required
                              value={expDestId}
                              onChange={(e) => setExpDestId(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700 font-medium cursor-pointer"
                            >
                              <option value="" disabled>Select live destination...</option>
                              {destinations.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Duration Label *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g., 4 Hours, 1 Day, etc."
                              value={expDuration}
                              onChange={(e) => setExpDuration(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700 font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Category Tab *
                            </label>
                            <select
                              required
                              value={expCategory}
                              onChange={(e) => setExpCategory(e.target.value as any)}
                              className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700 font-medium cursor-pointer"
                            >
                              <option value="Heritage">Heritage</option>
                              <option value="Nature">Nature</option>
                              <option value="Culture">Culture</option>
                              <option value="Adventure">Adventure</option>
                            </select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Short Description *
                            </label>
                            <p className="text-[10px] text-slate-400 font-sans">
                              Brief summary displayed below the experience title and on display cards.
                            </p>
                            <textarea
                              required
                              rows={2}
                              placeholder="e.g., Witness the legendary lotus towers of Angkor Wat slowly silhouette against a breathtaking spectrum of purple, pink, and gold."
                              value={expShortDescription}
                              onChange={(e) => setExpShortDescription(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700 font-medium leading-relaxed"
                            />
                          </div>

                          <div className="flex items-center gap-3 pt-2 md:col-span-2">
                            <input
                              id="family-friendly-toggle"
                              type="checkbox"
                              checked={expIsFamilyFriendly}
                              onChange={(e) => setExpIsFamilyFriendly(e.target.checked)}
                              className="w-4.5 h-4.5 text-brand-blue-accent border-slate-300 focus:ring-brand-blue-accent rounded cursor-pointer"
                            />
                            <label htmlFor="family-friendly-toggle" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 select-none cursor-pointer">
                              Family Friendly Excursion
                            </label>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: OVERVIEW narrative & image */}
                      {expFormStep === 1 && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Detailed Experience Overview Text *
                            </label>
                            <textarea
                              required
                              rows={5}
                              placeholder="Provide a comprehensive travel narrative detailing the flow, style, comfort parameters, and cultural context of this day experience..."
                              value={expOverviewText}
                              onChange={(e) => setExpOverviewText(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-4 py-3 text-xs outline-none transition-all leading-relaxed text-slate-700 font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <ImageUploadZone
                              imageSrc={expOverviewImageSrc}
                              onChange={(val) => setExpOverviewImageSrc(val)}
                              label="Overview Banner Photo *"
                              description="Drag and drop your overview photo, or click to browse."
                            />
                          </div>
                        </div>
                      )}

                      {/* STEP 3: HIGHLIGHTS LIST */}
                      {expFormStep === 2 && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                                Experience Highlights (Up to 10 highlights) *
                              </label>
                              <p className="text-[9px] font-mono text-slate-400">
                                These represent key curated details that describe the flow of the tour. Maximum 10 points.
                              </p>
                            </div>
                            {expHighlights.length < 10 && (
                              <button
                                type="button"
                                onClick={() => setExpHighlights([...expHighlights, ""])}
                                className="px-3 py-1.5 bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all"
                              >
                                + Add Highlight
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {expHighlights.map((hl, idx) => (
                              <div key={idx} className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                                <span className="text-[10px] font-mono font-bold text-brand-blue-accent px-1">{idx + 1}</span>
                                <input
                                  type="text"
                                  required={idx === 0}
                                  placeholder={`e.g., Sunrise entry with private cycling tour guide #${idx + 1}`}
                                  value={hl}
                                  onChange={(e) => {
                                    const updated = [...expHighlights];
                                    updated[idx] = e.target.value;
                                    setExpHighlights(updated);
                                  }}
                                  className="w-full bg-transparent border-none outline-none text-xs text-slate-700 font-medium"
                                />
                                {expHighlights.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setExpHighlights(expHighlights.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700 font-mono text-[10px] font-bold px-1"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 4: PHOTO GALLERY */}
                      {expFormStep === 3 && (
                        <div className="space-y-4 animate-fade-in">
                          <MultiImageUploadZone
                            images={expGalleryImages}
                            onChange={(updated) => setExpGalleryImages(updated)}
                            label="Visual Gallery Images"
                            description="Curate up to 5 beautiful photographs for the image carousel. You can drag and drop multiple images at once together."
                            maxCount={5}
                          />
                        </div>
                      )}

                      {/* STEP 5: GOOGLE MAPS LINK */}
                      {expFormStep === 4 && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Google Maps Link *
                            </label>
                            <p className="text-[9px] font-mono text-slate-400">
                              Copy and paste the full Google Maps URL or share link for this experience location.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <input
                              type="url"
                              required
                              placeholder="e.g., https://maps.google.com/?q=Angkor+Wat+Siem+Reap"
                              value={expGoogleMapsUrl}
                              onChange={(e) => setExpGoogleMapsUrl(e.target.value)}
                              className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700 font-mono font-medium"
                            />

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-500 space-y-2 leading-relaxed">
                              <p className="font-bold text-[#0F1626]">QUICK SAMPLE GOOGLE MAPS LINKS:</p>
                              <p>• Siem Reap (Angkor Wat): <span className="text-brand-blue-accent select-all font-semibold cursor-pointer" onClick={() => setExpGoogleMapsUrl("https://maps.google.com/?q=Angkor+Wat+Siem+Reap")}>https://maps.google.com/?q=Angkor+Wat+Siem+Reap</span></p>
                              <p>• Phnom Penh (Royal Palace): <span className="text-brand-blue-accent select-all font-semibold cursor-pointer" onClick={() => setExpGoogleMapsUrl("https://maps.google.com/?q=Royal+Palace+Phnom+Penh")}>https://maps.google.com/?q=Royal+Palace+Phnom+Penh</span></p>
                              <p>• Koh Rong (Sok San Beach): <span className="text-brand-blue-accent select-all font-semibold cursor-pointer" onClick={() => setExpGoogleMapsUrl("https://maps.google.com/?q=Sok+San+Beach+Koh+Rong")}>https://maps.google.com/?q=Sok+San+Beach+Koh+Rong</span></p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 6: FREQUENTLY ASKED QUESTIONS */}
                      {expFormStep === 5 && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                                Curated FAQs (Up to 5 questions & answers)
                              </label>
                              <p className="text-[9px] font-mono text-slate-400">
                                Address guest concerns regarding clothing requirements, weather conditions, prayer timing syncs, and meal safety.
                              </p>
                            </div>
                            {expFaqs.length < 5 && (
                              <button
                                type="button"
                                onClick={() => setExpFaqs([...expFaqs, { question: "", answer: "" }])}
                                className="px-3 py-1.5 bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all"
                              >
                                + Add FAQ Item
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            {expFaqs.map((faq, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-brand-blue-accent uppercase">FAQ Item #{idx + 1}</span>
                                  {expFaqs.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpFaqs(expFaqs.filter((_, i) => i !== idx))}
                                      className="text-red-500 hover:text-red-700 font-mono text-[10px] font-bold"
                                    >
                                      Remove FAQ
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      placeholder="e.g., Is halal catering guaranteed during the entire excursion?"
                                      value={faq.question}
                                      onChange={(e) => {
                                        const updated = [...expFaqs];
                                        updated[idx].question = e.target.value;
                                        setExpFaqs(updated);
                                      }}
                                      className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none transition-all text-slate-700 font-medium"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <textarea
                                      rows={2}
                                      placeholder="e.g., Yes, we coordinate exclusively with certified kitchens using isolated Halal utensils..."
                                      value={faq.answer}
                                      onChange={(e) => {
                                        const updated = [...expFaqs];
                                        updated[idx].answer = e.target.value;
                                        setExpFaqs(updated);
                                      }}
                                      className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none transition-all resize-none text-slate-600 font-medium leading-relaxed"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step form navigation bottom buttons */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                        <div className="flex gap-2">
                          {expFormStep > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpFormStep(s => s - 1)}
                              className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            >
                              Previous Step
                            </button>
                          )}
                          {expFormStep < 5 && (
                            <button
                              type="button"
                              onClick={() => setExpFormStep(s => s + 1)}
                              className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              Next Step
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md cursor-pointer"
                        >
                          {editingExperienceId ? "Save Amendments" : "Publish Curated Experience"}
                        </button>
                      </div>

                    </form>
                  </div>
                )}

              </div>

            </div>
          )}


          {/* 3. PACKAGES TAB */}
          {activeTab === "packages" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
              
              {packView === "list" ? (
                // --- LIST VIEW ---
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-serif font-extrabold text-[#0F1626] tracking-wider uppercase flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-brand-blue-accent" />
                        <span>Travel Packages Catalog</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Edit, update, and manage predefined Halal luxury tour itineraries
                      </p>
                    </div>
                    <button
                      onClick={openAddPackage}
                      className="flex items-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border border-brand-blue-accent/10 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Tour Package</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                          <th className="py-3.5 px-4">Package Info</th>
                          <th className="py-3.5 px-4">Destinations</th>
                          <th className="py-3.5 px-4 text-center">Duration</th>
                          <th className="py-3.5 px-4 text-center">Base Price</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {localPackages.map((pkg, idx) => (
                          <tr key={pkg.id || idx} className="hover:bg-slate-50/50 transition-colors text-xs font-sans">
                            <td className="py-4 px-4 flex items-center gap-3.5 max-w-sm">
                              <img 
                                src={pkg.image} 
                                alt={pkg.name || (pkg as any).title} 
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <h4 className="font-bold text-sm text-[#0F1626] truncate">{pkg.name || (pkg as any).title}</h4>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate">
                                  {pkg.brief || pkg.description}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px] text-slate-500">
                              {pkg.destinations && pkg.destinations.length > 0 
                                ? pkg.destinations.join(", ") 
                                : "Cambodia"}
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-[10px] font-bold text-slate-700">
                              {pkg.duration}
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                              ${pkg.price}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditPackage(pkg)}
                                  className="p-2 text-slate-600 hover:text-brand-blue-accent bg-slate-50 hover:bg-[#0F1626] rounded-lg transition-all"
                                  title="Edit Package Details"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handlePackDelete(pkg.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Delete Package"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // --- 6-STEP WIZARD VIEW ---
                <div className="space-y-8">
                  {/* Wizard Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-extrabold text-[#0F1626] uppercase tracking-wider">
                        {editingPackageId ? "Modify Existing Package" : "Publish New Tour Package"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Complete the 6-step curriculum to catalog a high-fidelity luxury journey
                      </p>
                    </div>
                    <button
                      onClick={() => setPackView("list")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase text-slate-500 hover:text-[#0F1626] hover:bg-slate-50 transition-all border border-slate-200 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Catalog</span>
                    </button>
                  </div>

                  {/* Wizard Step Progress Indicator */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    {[
                      { step: 1, title: "Basic Info" },
                      { step: 2, title: "Overview" },
                      { step: 3, title: "Logistics" },
                      { step: 4, title: "Hotel Link" },
                      { step: 5, title: "Imagery" },
                      { step: 6, title: "FAQs" }
                    ].map((s) => (
                      <button
                        type="button"
                        key={s.step}
                        onClick={() => {
                          if (s.step < wizardStep || packName) {
                            setWizardStep(s.step);
                          }
                        }}
                        className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                          wizardStep === s.step
                            ? "bg-[#0F1626] border-brand-blue-accent/30 text-white shadow-md"
                            : wizardStep > s.step
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-slate-50/50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-0.5">
                          Step 0{s.step}
                        </span>
                        <span className="text-xs font-sans font-bold leading-tight block">
                          {s.title}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Form Container */}
                  <form onSubmit={handlePackSubmit} className="space-y-6">
                    
                    {/* STEP 1: BASIC INFO */}
                    {wizardStep === 1 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="p-4 bg-brand-lightbg border border-brand-blue-accent/20 rounded-2xl">
                          <h4 className="text-xs font-bold font-mono text-brand-blue-accent uppercase tracking-wider mb-1">Step 1 Guidelines:</h4>
                          <p className="text-[11px] text-brand-charcoal/70 leading-relaxed font-sans">
                            Declare the identifying parameters of this luxury package. Note that the "brief" is displayed directly beneath titles on home cards and page headers.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Package Name *</label>
                            <input
                              type="text"
                              value={packName}
                              onChange={(e) => setPackName(e.target.value)}
                              placeholder="e.g., Cambodia Spiritual & Scenic Retreat"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-sm outline-none transition-all text-slate-800 font-medium"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Duration *</label>
                            <input
                              type="text"
                              value={packDuration}
                              onChange={(e) => setPackDuration(e.target.value)}
                              placeholder="e.g., 8 Days / 7 Nights"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-sm outline-none transition-all text-slate-800 font-medium"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Base Price ($ USD) *</label>
                            <input
                              type="text"
                              value={packPrice}
                              onChange={(e) => setPackPrice(e.target.value)}
                              placeholder="e.g., 2450"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-sm outline-none transition-all text-slate-800 font-mono font-bold"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <ImageUploadZone
                            imageSrc={packFeaturedImage}
                            onChange={(val) => setPackFeaturedImage(val)}
                            label="Package Featured Cover Image *"
                            description="Upload the main high-res image representing this luxury tour package."
                          />
                        </div>

                        {/* Destinations Selector */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Regional Destinations (Multi-Select) *</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {destinations.map((d) => {
                              const isChecked = packDestinations.includes(d.name);
                              return (
                                <button
                                  type="button"
                                  key={d.id}
                                  onClick={() => {
                                    if (isChecked) {
                                      setPackDestinations(packDestinations.filter(x => x !== d.name));
                                    } else {
                                      setPackDestinations([...packDestinations, d.name]);
                                    }
                                  }}
                                  className={`p-3 rounded-xl border text-left text-xs font-bold font-sans transition-all flex items-center justify-between ${
                                    isChecked
                                      ? "bg-[#0F1626] border-brand-blue-accent text-white"
                                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                                  }`}
                                >
                                  <span>{d.name}</span>
                                  {isChecked && <CheckCircle className="w-3.5 h-3.5 text-brand-blue-accent" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Package Service Options: Halal Meals, Transport & Guide, Pace & Style */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                          <h4 className="text-xs font-bold font-mono text-[#0F1626] uppercase tracking-wider">Service Specifications & Highlights Settings</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Halal Meals Toggle */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Halal Meals Included? *</label>
                              <button
                                type="button"
                                onClick={() => setPackIsHalalMeals(!packIsHalalMeals)}
                                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold font-sans transition-all flex items-center justify-between ${
                                  packIsHalalMeals
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                                    : "bg-slate-100 border-slate-300 text-slate-500"
                                }`}
                              >
                                <span>{packIsHalalMeals ? "Halal Meals Included (Muslim Meals)" : "No Halal Dining Card"}</span>
                                <CheckCircle className={`w-4 h-4 ${packIsHalalMeals ? "text-emerald-600" : "text-slate-300"}`} />
                              </button>
                            </div>

                            {/* Transportation & Guide Type */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Transportation & Guide Type *</label>
                              <select
                                value={packTransportType}
                                onChange={(e) => setPackTransportType(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2.5 text-xs outline-none font-sans font-bold text-slate-800"
                              >
                                <option value="Private Transfer & Guide">Private Transfer & Guide</option>
                                <option value="Group Transfer & Guide">Group Transfer & Guide</option>
                              </select>
                            </div>

                            {/* Pace & Style */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Pace & Style *</label>
                              <select
                                value={packPaceStyle}
                                onChange={(e) => setPackPaceStyle(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2.5 text-xs outline-none font-sans font-bold text-slate-800"
                              >
                                <option value="Leisure">Leisure</option>
                                <option value="Group">Group</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Short Brief Description * (Max 180 chars)</label>
                          <textarea
                            rows={3}
                            maxLength={180}
                            value={packBrief}
                            onChange={(e) => setPackBrief(e.target.value)}
                            placeholder="Provide a quick, highly compelling summaries displayed on package cards and below headers."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none text-slate-700 leading-relaxed font-sans"
                            required
                          />
                          <p className="text-[10px] text-right font-mono text-slate-400">{packBrief.length}/180 characters</p>
                        </div>

                        {/* Key Highlights Section */}
                        <div className="space-y-3 p-5 bg-brand-lightbg border border-brand-blue-accent/15 rounded-2xl">
                          <div>
                            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-blue-accent block mb-1">
                              Key Highlights * (3 items)
                            </label>
                            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                              These 3 bullet points represent the absolute premier aspects of this tour package, displayed in the key highlights card and the main catalog cards.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            {packKeyHighlights.map((highlight, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Highlight {idx + 1}</label>
                                <input
                                  type="text"
                                  value={highlight}
                                  onChange={(e) => {
                                    const updated = [...packKeyHighlights];
                                    updated[idx] = e.target.value;
                                    setPackKeyHighlights(updated);
                                  }}
                                  placeholder={`e.g., ${idx === 0 ? "Premium 5-star halal hotels" : idx === 1 ? "100% gourmet Halal culinary tour" : "Private Sunrise access at Angkor Wat"}`}
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all text-slate-800 font-medium"
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: OVERVIEW */}
                    {wizardStep === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <h4 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider mb-1">Step 2 Guidelines:</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                            Draft a complete narrative breakdown for this tour. Write about the spiritual and historical context, halal logistics, culinary provisions, and travel flow.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Detailed Package Overview Narrative *</label>
                          <textarea
                            rows={12}
                            value={packOverview}
                            onChange={(e) => setPackOverview(e.target.value)}
                            placeholder="Explain the highlights, general pace, private guide arrangements, and custom halal meal setups..."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none text-slate-700 leading-relaxed font-sans"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 3: ITINERARY, INCLUSIONS, AND EXCLUSIONS */}
                    {wizardStep === 3 && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Day-by-day itinerary */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="font-serif font-bold text-sm text-[#0F1626]">Day-by-Day Itinerary Plan</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setPackItinerary([...packItinerary, { day: packItinerary.length + 1, title: "", description: "" }]);
                              }}
                              className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue hover:text-brand-blue-accent transition-colors flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Day
                            </button>
                          </div>

                          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                            {packItinerary.map((item, index) => (
                              <div key={index} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                                <div className="bg-[#0F1626] text-white w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0">
                                  D0{item.day}
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <input
                                      type="text"
                                      placeholder={`e.g., Day ${item.day}: Arrival & Sunset Cruise`}
                                      value={item.title}
                                      onChange={(e) => {
                                        const updated = [...packItinerary];
                                        updated[index].title = e.target.value;
                                        setPackItinerary(updated);
                                      }}
                                      className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none font-sans font-bold text-slate-800"
                                    />
                                    {packItinerary.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const filtered = packItinerary.filter((_, i) => i !== index);
                                          const reindexed = filtered.map((item, idx) => ({ ...item, day: idx + 1 }));
                                          setPackItinerary(reindexed);
                                        }}
                                        className="text-[10px] font-mono text-red-500 hover:text-red-700 font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100/50 px-2.5 py-1 rounded-lg border border-red-100 shrink-0"
                                      >
                                        Remove Day
                                      </button>
                                    )}
                                  </div>

                                  {/* Meals & Highlights for Day */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Meals Available On Day</label>
                                      <input
                                        type="text"
                                        placeholder="e.g., Breakfast, Halal Lunch, Welcome Dinner"
                                        value={item.meals || ""}
                                        onChange={(e) => {
                                          const updated = [...packItinerary];
                                          updated[index].meals = e.target.value;
                                          setPackItinerary(updated);
                                        }}
                                        className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none font-sans text-slate-700 font-medium"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Day Highlights</label>
                                      <input
                                        type="text"
                                        placeholder="e.g., Royal Palace, Silver Pagoda, Sunset Cruise"
                                        value={item.highlights || ""}
                                        onChange={(e) => {
                                          const updated = [...packItinerary];
                                          updated[index].highlights = e.target.value;
                                          setPackItinerary(updated);
                                        }}
                                        className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none font-sans text-slate-700 font-medium"
                                      />
                                    </div>
                                  </div>

                                  {/* Day Content Paragraphs */}
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Day Content / Narrative (Allows Multiple Paragraphs)</label>
                                    <textarea
                                      rows={4}
                                      placeholder="Provide detailed description of tours, locations visited, certified dining stops, and prayer timing pauses. Press Enter for multiple paragraphs..."
                                      value={item.description}
                                      onChange={(e) => {
                                        const updated = [...packItinerary];
                                        updated[index].description = e.target.value;
                                        setPackItinerary(updated);
                                      }}
                                      className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none font-sans text-slate-600 leading-relaxed"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Inclusions & Exclusions row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          {/* Inclusions */}
                          <div className="space-y-3 bg-brand-lightbg/50 border border-brand-blue-accent/15 p-5 rounded-2xl">
                            <h4 className="font-serif font-bold text-sm text-[#0F1626] flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>Package Inclusions</span>
                            </h4>
                            <p className="text-[10px] text-slate-500">List specific luxury inclusions or services (VIP pass, Halal dining, transfers, etc.)</p>
                            
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="e.g., Private English & Arabic-fluent Muslim guide"
                                value={newInclusion}
                                onChange={(e) => setNewInclusion(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (newInclusion.trim()) {
                                      setPackInclusions([...packInclusions, newInclusion.trim()]);
                                      setNewInclusion("");
                                    }
                                  }
                                }}
                                className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newInclusion.trim()) {
                                    setPackInclusions([...packInclusions, newInclusion.trim()]);
                                    setNewInclusion("");
                                  }
                                }}
                                className="bg-[#0F1626] text-white hover:bg-brand-blue-accent hover:text-[#0F1626] px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                              >
                                Add
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {packInclusions.map((tag, tIdx) => (
                                <span key={tIdx} className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-sans font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                  <span>{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => setPackInclusions(packInclusions.filter((_, i) => i !== tIdx))}
                                    className="text-emerald-600 hover:text-emerald-900 font-mono font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              {packInclusions.length === 0 && (
                                <span className="text-[10px] text-slate-400 font-sans italic">No custom inclusions listed. Falling back to defaults.</span>
                              )}
                            </div>
                          </div>

                          {/* Exclusions */}
                          <div className="space-y-3 bg-brand-lightbg/50 border border-brand-blue-accent/15 p-5 rounded-2xl">
                            <h4 className="font-serif font-bold text-sm text-[#0F1626] flex items-center gap-1">
                              <X className="w-4 h-4 text-rose-600" />
                              <span>Package Exclusions</span>
                            </h4>
                            <p className="text-[10px] text-slate-500">List specific exclusions (Flights, personal souvenirs, tip gratuities, etc.)</p>
                            
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="e.g., International flights and terminal taxes"
                                value={newExclusion}
                                onChange={(e) => setNewExclusion(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (newExclusion.trim()) {
                                      setPackExclusions([...packExclusions, newExclusion.trim()]);
                                      setNewExclusion("");
                                    }
                                  }
                                }}
                                className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newExclusion.trim()) {
                                    setPackExclusions([...packExclusions, newExclusion.trim()]);
                                    setNewExclusion("");
                                  }
                                }}
                                className="bg-[#0F1626] text-white hover:bg-brand-blue-accent hover:text-[#0F1626] px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                              >
                                Add
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {packExclusions.map((tag, tIdx) => (
                                <span key={tIdx} className="bg-rose-50 border border-rose-100 text-rose-800 text-[10px] font-sans font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                  <span>{tag}</span>
                                  <button
                                    type="button"
                                    onClick={() => setPackExclusions(packExclusions.filter((_, i) => i !== tIdx))}
                                    className="text-rose-600 hover:text-rose-900 font-mono font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                              {packExclusions.length === 0 && (
                                <span className="text-[10px] text-slate-400 font-sans italic">No custom exclusions listed. Falling back to defaults.</span>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* STEP 4: HOTEL ASSOCIATION (Up to 4 Hotels Max) */}
                    {wizardStep === 4 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <Building className="w-5 h-5 text-brand-blue-accent shrink-0" />
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold font-sans text-slate-700 uppercase tracking-wide">
                                Stay Accommodations (1 to 4 Hotels Max)
                              </h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                                Select registered stay partners for this package (up to 4 hotels). If a hotel is not in the list, search and add it directly via Google Places.
                              </p>
                            </div>
                          </div>
                          {packageHotelSlots.length < 4 && (
                            <button
                              type="button"
                              onClick={() => setPackageHotelSlots(prev => [...prev, { type: "predefined", hotelId: localHotels[0]?.id || "" }])}
                              className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Hotel Slot</span>
                            </button>
                          )}
                        </div>

                        {/* Slots List */}
                        <div className="space-y-5">
                          {packageHotelSlots.map((slot, sIdx) => (
                            <div key={sIdx} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm relative">
                              {/* Slot Header */}
                              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#0F1626] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                                    {sIdx + 1}
                                  </span>
                                  <h5 className="text-xs font-serif font-bold text-[#0F1626] uppercase tracking-wider">
                                    Hotel Slot #{sIdx + 1}
                                  </h5>
                                </div>
                                {packageHotelSlots.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setPackageHotelSlots(prev => prev.filter((_, idx) => idx !== sIdx))}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove Slot</span>
                                  </button>
                                )}
                              </div>

                              {/* Hotel Selection & Google Places Add Option */}
                              <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200/80">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                                    Select Hotel from Database
                                  </label>
                                  <select
                                    value={slot.hotelId || ""}
                                    onChange={(e) => {
                                      const updated = [...packageHotelSlots];
                                      updated[sIdx].hotelId = e.target.value;
                                      updated[sIdx].type = "predefined";
                                      setPackageHotelSlots(updated);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
                                  >
                                    <option value="">-- Choose Hotel from Register --</option>
                                    {localHotels.map(h => (
                                      <option key={h.id} value={h.id}>
                                        {h.name} ({h.location})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Preview Selected Hotel */}
                                {slot.hotelId && (() => {
                                  const h = localHotels.find(x => x.id === slot.hotelId);
                                  if (!h) return null;
                                  return (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                                      <img src={h.image} alt={h.name} className="w-12 h-12 rounded-lg object-cover" />
                                      <div className="space-y-0.5 min-w-0">
                                        <h6 className="text-xs font-bold text-slate-800 truncate">{h.name}</h6>
                                        <p className="text-[10px] text-slate-400 font-light truncate">{h.location}</p>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Option to Search & Add via Google Places */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-light">
                                    <span>Can't find your hotel in the list?</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (slotSearchIndex === sIdx) {
                                        setSlotSearchIndex(null);
                                        setSlotSearchResults([]);
                                        setSlotSearchQuery("");
                                      } else {
                                        setSlotSearchIndex(sIdx);
                                        setSlotSearchResults([]);
                                        setSlotSearchQuery("");
                                      }
                                    }}
                                    className="bg-brand-blue-accent/10 hover:bg-brand-blue-accent/20 text-brand-blue-accent border border-brand-blue-accent/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Search className="w-3.5 h-3.5" />
                                    <span>{slotSearchIndex === sIdx ? "Close Search" : "Search & Add via Google Places"}</span>
                                  </button>
                                </div>

                                {/* Expanded Google Places Search Widget for this Slot */}
                                {slotSearchIndex === sIdx && (
                                  <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-brand-blue-accent/30 space-y-3 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                      <h6 className="text-xs font-mono font-bold text-brand-blue-accent uppercase tracking-wider flex items-center gap-1.5">
                                        <Search className="w-3.5 h-3.5" />
                                        <span>Search & Add Hotel via Google Places</span>
                                      </h6>
                                      <span className="text-[10px] text-slate-400 font-mono">Will save to database & sync automatically</span>
                                    </div>

                                    <form onSubmit={(e) => handleSlotGooglePlacesSearch(sIdx, e)} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={slotSearchQuery}
                                        onChange={(e) => setSlotSearchQuery(e.target.value)}
                                        placeholder="Type hotel name (e.g., Rosewood Phnom Penh, Raffles Grand Hotel)..."
                                        className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-800"
                                      />
                                      <button
                                        type="submit"
                                        disabled={isSlotSearchingGp}
                                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                                      >
                                        {isSlotSearchingGp ? (
                                          <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Searching...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Search className="w-3.5 h-3.5" />
                                            <span>Search</span>
                                          </>
                                        )}
                                      </button>
                                    </form>

                                    {/* Search Results */}
                                    {slotSearchResults.length > 0 && (
                                      <div className="space-y-2 pt-2 border-t border-slate-200/60 max-h-60 overflow-y-auto">
                                        {slotSearchResults.map((item: any) => (
                                          <div key={item.placeId} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                                            <div className="flex items-center gap-3 min-w-0">
                                              <img
                                                src={item.image || NO_PHOTO_AVAILABLE_PLACEHOLDER}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                                              />
                                              <div className="min-w-0 space-y-0.5">
                                                <h6 className="text-xs font-bold text-slate-800 truncate">{item.name}</h6>
                                                <p className="text-[10px] text-slate-500 truncate">{item.address || item.destination}</p>
                                                {item.rating && (
                                                  <span className="text-[10px] text-amber-600 font-bold">★ {item.rating}</span>
                                                )}
                                              </div>
                                            </div>

                                            <button
                                              type="button"
                                              disabled={isSlotImportingPlaceId === item.placeId}
                                              onClick={() => handleSlotImportGooglePlacesHotel(sIdx, item.placeId)}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1 cursor-pointer"
                                            >
                                              {isSlotImportingPlaceId === item.placeId ? (
                                                <>
                                                  <Loader2 className="w-3 h-3 animate-spin" />
                                                  <span>Adding...</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Plus className="w-3 h-3" />
                                                  <span>Add & Select</span>
                                                </>
                                              )}
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 5: GALLERY IMAGES (OPTIONAL) */}
                    {wizardStep === 5 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold font-mono text-brand-blue-accent uppercase tracking-wider mb-1">
                              Step 5: Media Photo Gallery (Optional)
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                              Upload high-resolution scenery or accommodation photos for this package. You can leave this blank or clear all photos if you do not wish to display a photo gallery.
                            </p>
                          </div>
                          {galleryUrls.some(u => u.trim() !== "") && (
                            <button
                              type="button"
                              onClick={() => setGalleryUrls([])}
                              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors shrink-0 cursor-pointer"
                            >
                              Clear Gallery Photos
                            </button>
                          )}
                        </div>

                        <MultiImageUploadZone
                          images={galleryUrls.length > 0 ? galleryUrls : ["", "", "", "", "", "", "", ""]}
                          onChange={(updated) => setGalleryUrls(updated)}
                          label="Media Gallery Images"
                          description="Upload up to 8 high-resolution photos. Drag & drop or paste image URLs."
                          maxCount={8}
                        />
                      </div>
                    )}

                    {/* STEP 6: FAQS (OPTIONAL) */}
                    {wizardStep === 6 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold font-mono text-brand-blue-accent uppercase tracking-wider mb-1">
                              Step 6: Frequently Asked Questions (Optional)
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                              Provide Questions and Answers regarding local Halal logistics, transport, visa protocols, etc. Leave empty if you do not wish to display an FAQ section.
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFaqList(prev => [...prev, { q: "", a: "" }])}
                              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-brand-blue-accent hover:bg-slate-100 border border-brand-blue-accent/30 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add FAQ</span>
                            </button>
                            {faqList.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setFaqList([])}
                                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              >
                                Clear All FAQs
                              </button>
                            )}
                          </div>
                        </div>

                        {faqList.length === 0 ? (
                          <div className="p-8 bg-slate-50/60 rounded-2xl border border-slate-200 text-center space-y-2">
                            <p className="text-xs text-slate-500 font-sans">No FAQs configured for this package (Optional).</p>
                            <button
                              type="button"
                              onClick={() => setFaqList([
                                { q: "Are all meals included in the package verified Halal?", a: "Yes, absolutely. We strictly partner with certified Halal kitchens, or pre-vetted pork-free and alcohol-free dining establishments." },
                                { q: "How does prayer-time coordination work during our tours?", a: "Our private guides and chauffeurs are fully aware of daily prayer schedules." }
                              ])}
                              className="text-xs font-mono font-bold text-brand-blue-accent underline cursor-pointer"
                            >
                              Load Sample Halal FAQ Items
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {faqList.map((faq, fIdx) => (
                              <div key={fIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-3 relative">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono font-bold uppercase text-brand-blue-accent">
                                    FAQ Item {fIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setFaqList(prev => prev.filter((_, idx) => idx !== fIdx))}
                                    className="text-rose-500 hover:text-rose-700 text-xs font-mono font-bold uppercase cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  <input
                                    type="text"
                                    value={faq.q}
                                    onChange={(e) => {
                                      const updated = [...faqList];
                                      updated[fIdx].q = e.target.value;
                                      setFaqList(updated);
                                    }}
                                    placeholder="Enter Question..."
                                    className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none font-bold text-slate-800"
                                  />
                                  <textarea
                                    rows={2}
                                    value={faq.a}
                                    onChange={(e) => {
                                      const updated = [...faqList];
                                      updated[fIdx].a = e.target.value;
                                      setFaqList(updated);
                                    }}
                                    placeholder="Enter Answer..."
                                    className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none resize-none text-slate-600"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step form navigation bottom buttons */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                      <div className="flex gap-2">
                        {wizardStep > 1 && (
                          <button
                            type="button"
                            onClick={() => setWizardStep(s => s - 1)}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            Previous Step
                          </button>
                        )}
                        {wizardStep < 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (wizardStep === 1) {
                                if (!packName || !packDuration || !packPrice || !packBrief || !packFeaturedImage) {
                                  triggerToast("Please fill in all required Step 1 fields before proceeding.", "error");
                                  return;
                                }
                              }
                              setWizardStep(s => s + 1);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            Next Step
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md cursor-pointer"
                      >
                        {editingPackageId ? "Save Amendments" : "Publish Curated Package"}
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          )}


          {/* 4. RESORTS & HOTELS TAB */}
          {activeTab === "resorts-hotels" && (
            <div className="w-full space-y-6">
              
              {/* LIST VIEW */}
              {hotelView === "list" && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-serif font-extrabold text-[#0F1626] tracking-wider uppercase flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-brand-blue-accent" />
                        <span>Partner Hotels & Luxury Resorts Register</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage certified properties, star ratings, customized room layouts, and Halal specifications
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetHotelForm();
                        setHotelView("wizard");
                      }}
                      className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" /> Add New Hotel
                    </button>
                  </div>

                  {/* GOOGLE PLACES IMPORT SECTION */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-xs font-mono font-bold text-[#0F1626] uppercase tracking-wider flex items-center gap-2">
                          <Globe className="w-4 h-4 text-brand-blue-accent" />
                          <span>Import Hotel via Google Places API</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-sans">
                          Search for hotels inside Cambodia (e.g. Fairfield by Marriott, Rosewood Phnom Penh, Raffles Siem Reap) to automatically fetch real photos, ratings, and details into Firebase.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isGpKeyConfigured === false ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                            ⚠️ GOOGLE_PLACES_API_KEY Missing (Curated Catalog Mode)
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                            Cambodia Verification Enabled
                          </span>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSearchGooglePlaces} className="flex gap-2">
                      <input
                        type="text"
                        value={gpSearchQuery}
                        onChange={(e) => setGpSearchQuery(e.target.value)}
                        placeholder="Search Cambodia hotel name or city (e.g. Raffles Grand Hotel d'Angkor)..."
                        className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626]"
                      />
                      <button
                        type="submit"
                        disabled={isSearchingGp}
                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{isSearchingGp ? "Searching..." : "Search Google Places"}</span>
                      </button>
                    </form>

                    {/* Google Places Search Results Grid */}
                    {gpSearchResults.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Search Results ({gpSearchResults.length} properties)
                          </h4>
                          <button
                            type="button"
                            onClick={() => setGpSearchResults([])}
                            className="text-[10px] font-mono text-slate-400 hover:text-slate-600 underline cursor-pointer"
                          >
                            Clear Results
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                          {gpSearchResults.map((gp, gIdx) => (
                            <div
                              key={gp.placeId || gIdx}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-bold text-xs text-[#0F1626] truncate">{gp.name}</h5>
                                  <span className="bg-amber-50 text-amber-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                                    {gp.rating || 4.8} ★
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 truncate">{gp.address}</p>
                                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                                  <span className="text-brand-blue-accent font-bold">{gp.destination || "Cambodia"}</span>
                                  <span>•</span>
                                  <span>Layout V2</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={isImportingGpId === gp.placeId}
                                onClick={() => handleImportGooglePlacesHotel(gp.placeId)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                              >
                                {isImportingGpId === gp.placeId ? "Importing..." : "Import Hotel"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                          <th className="py-3.5 px-4">Hotel Property Info</th>
                          <th className="py-3.5 px-4">Location</th>
                          <th className="py-3.5 px-4 text-center">Version</th>
                          <th className="py-3.5 px-4 text-center">Stars</th>
                          <th className="py-3.5 px-4 text-center">Avg Rate</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {localHotels.map((hot, idx) => (
                          <tr key={hot.id || idx} className="hover:bg-slate-50/50 transition-colors text-xs font-sans">
                            <td className="py-4 px-4 flex items-center gap-4 max-w-sm">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 shadow-sm relative">
                                <img src={hot.image} alt={hot.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-sm text-[#0F1626]">{hot.name}</h4>
                                  {hot.placeId && (
                                    <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold" title={`Google Place ID: ${hot.placeId}`}>
                                      Google
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium truncate">{hot.description}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px] font-semibold text-slate-600">
                              {hot.destination || hot.location}
                            </td>
                            <td className="py-4 px-4 text-center font-mono">
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                hot.layoutVersion === "v2" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {hot.layoutVersion === "v2" ? "V2" : "V1"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center font-mono">
                              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                {hot.stars || 5} ★
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-[10px] font-bold text-slate-700">
                              ${hot.lowestPrice || hot.price || "350"} / Night
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {hot.placeId && (
                                  <button
                                    type="button"
                                    disabled={refreshingHotelId === hot.id}
                                    onClick={() => handleRefreshHotelInCms(hot)}
                                    className="text-[10px] font-mono font-bold bg-[#0F1626] hover:bg-brand-blue-accent text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                    title="Refresh metrics from Google Places"
                                  >
                                    <RefreshCw className={`w-3 h-3 ${refreshingHotelId === hot.id ? "animate-spin" : ""}`} />
                                    <span>{refreshingHotelId === hot.id ? "Syncing" : "Refresh"}</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    populateHotelForm(hot);
                                    setHotelView("wizard");
                                  }}
                                  className="text-[10px] font-mono font-bold border border-slate-200 hover:border-[#0F1626] bg-white text-[#0F1626] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Edit Info
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemToDelete({ type: 'hotel', id: hot.id, name: hot.name });
                                  }}
                                  className="border border-transparent hover:border-red-200 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Hotel"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7-STEP WIZARD VIEW */}
              {hotelView === "wizard" && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in text-left">
                  
                  {/* Wizard Header / Breadcrumb Progress */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-semibold">
                        <span className="hover:text-brand-blue-accent cursor-pointer" onClick={() => setHotelView("list")}>Hotels List</span>
                        <span>/</span>
                        <span className="text-slate-600">{editingHotelId ? "Edit Property Record" : "New Property Record"}</span>
                      </div>
                      <h3 className="font-serif font-extrabold text-[#0F1626] text-lg uppercase tracking-wider">
                        {editingHotelId ? `Edit: ${hotelName}` : "Register New Hotel Property"}
                      </h3>
                    </div>
                    
                    {/* Stepper controls */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((s) => {
                        const isActive = s === hotelFormStep;
                        const isCompleted = s < hotelFormStep;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              if (isCompleted || editingHotelId) {
                                setHotelFormStep(s);
                              } else if (s === hotelFormStep + 1) {
                                if (hotelFormStep === 1 && (!hotelName || !hotelLocation || !hotelPrice)) {
                                  triggerToast("Please fill in basic details first.", "error");
                                  return;
                                }
                                setHotelFormStep(s);
                              }
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center border transition-all cursor-pointer ${
                              isActive 
                                ? "bg-[#0F1626] text-white border-[#0F1626] ring-2 ring-brand-blue-accent/30" 
                                : isCompleted 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {isCompleted ? "✓" : s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step Description Banner */}
                  <div className="p-4 bg-brand-lightbg border border-brand-blue-accent/15 rounded-2xl">
                    <h4 className="text-xs font-bold font-mono text-brand-blue-accent uppercase tracking-wider mb-0.5">
                      Step {hotelFormStep} of 7: {
                        hotelFormStep === 1 ? "Basic Information Profile" :
                        hotelFormStep === 2 ? "Property Overview & Amenities" :
                        hotelFormStep === 3 ? "Curated Day Experiences" :
                        hotelFormStep === 4 ? "Luxurious Room Configurations" :
                        hotelFormStep === 5 ? "Exact Location & Attractions" :
                        hotelFormStep === 6 ? "High-Resolution Image Gallery" :
                        "Islamic Logistics FAQ"
                      }
                    </h4>
                    <p className="text-[11px] text-brand-charcoal/70 leading-relaxed font-sans">
                      {hotelFormStep === 1 && "Specify general credentials including name, pricing, star level, local highlights, and cover photos."}
                      {hotelFormStep === 2 && "Introduce the resort atmosphere, a comprehensive descriptive overview, and premium dynamic amenities."}
                      {hotelFormStep === 3 && "Select and link existing day experiences in the destination, or instantly deploy a new linked experience."}
                      {hotelFormStep === 4 && "Configure the various suite tiers, individual room highlights, capacities, and private plunge pool parameters."}
                      {hotelFormStep === 5 && "Publish precise travel coordinates, map integrations, and local distances to central landmarks."}
                      {hotelFormStep === 6 && "Maintain a premium album of exactly 10 photos displaying the grandeur of your luxury estate."}
                      {hotelFormStep === 7 && "Formulate 5 precise Q&A sets centered on privacy, certified food, and prayer coordination."}
                    </p>
                  </div>

                  {/* STEP CONTENT FIELDS */}
                  <div className="space-y-6">
                    
                    {/* STEP 1: BASIC INFO */}
                    {hotelFormStep === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Hotel Name *</label>
                          <input
                            type="text"
                            value={hotelName}
                            onChange={(e) => setHotelName(e.target.value)}
                            placeholder="e.g., Raffles Grand Hotel d'Angkor"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Star Level *</label>
                          <div className="flex gap-2">
                            {[5, 4, 3].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setHotelStars(star)}
                                className={`flex-1 py-2 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                                  hotelStars === star
                                    ? "bg-[#0F1626] border-[#0F1626] text-white"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {star} Star
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Average Per Night Rate ($ USD) *</label>
                          <input
                            type="number"
                            value={hotelPrice}
                            onChange={(e) => setHotelPrice(e.target.value)}
                            placeholder="e.g., 380"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Destination *</label>
                          <select
                            value={hotelLocation}
                            onChange={(e) => setHotelLocation(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-700"
                          >
                            <option value="">Choose Location...</option>
                            {destinations.map((d) => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Short Description (Max 150 Chars) *</label>
                            <span className={`text-[9px] font-mono font-bold ${hotelShortDesc.length > 150 ? "text-red-500" : "text-slate-400"}`}>
                              {hotelShortDesc.length} / 150
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            maxLength={150}
                            value={hotelShortDesc}
                            onChange={(e) => setHotelShortDesc(e.target.value)}
                            placeholder="A landmark luxury resort in Siem Reap with colonial heritage charm and award-winning private pool villas."
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-600 leading-relaxed resize-none"
                          />
                        </div>

                        {/* Cover Image Upload */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Hotel Cover Photo *</label>
                          {hotelImage ? (
                            <div className="relative rounded-2xl overflow-hidden aspect-[16/6] border border-slate-200">
                              <img src={hotelImage} className="w-full h-full object-cover" alt="Hotel Cover" />
                              <button
                                type="button"
                                onClick={() => setHotelImage("")}
                                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all shadow"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-slate-200 hover:border-brand-blue-accent rounded-2xl p-7 transition-all text-center flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-50">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleHotelFileUpload(e, "cover")}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Upload className="w-7 h-7 text-slate-400 mb-2" />
                              <p className="text-xs font-bold text-[#0F1626]">Click to upload hotel cover image</p>
                              <p className="text-[10px] text-slate-400 mt-1">Accepts high resolution PNG, JPG, or WEBP</p>
                            </div>
                          )}
                        </div>

                        {/* Muslim Highlights */}
                        <div className="sm:col-span-2 space-y-4 border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-bold font-mono text-brand-blue-accent uppercase tracking-wider">Islamic Hospitality Profile Highlights</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                <input
                                  type="text"
                                  value={hotelPrayerFacilitiesLabel}
                                  onChange={(e) => setHotelPrayerFacilitiesLabel(e.target.value)}
                                  placeholder="Prayer Facilities Highlight"
                                  className="w-full bg-transparent hover:bg-slate-100/80 focus:bg-white border-b border-dashed border-transparent hover:border-slate-300 focus:border-brand-blue-accent outline-none py-0.5 px-1 font-bold text-slate-500 rounded transition-colors"
                                />
                              </label>
                              <textarea
                                rows={3}
                                value={hotelPrayerFacilities}
                                onChange={(e) => setHotelPrayerFacilities(e.target.value)}
                                placeholder="Prayer mats, Qibla indicators, and pre-positioned Qurans in room..."
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none text-slate-600 leading-relaxed"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                <input
                                  type="text"
                                  value={hotelHalalBreakfastLabel}
                                  onChange={(e) => setHotelHalalBreakfastLabel(e.target.value)}
                                  placeholder="Halal Breakfast Highlight"
                                  className="w-full bg-transparent hover:bg-slate-100/80 focus:bg-white border-b border-dashed border-transparent hover:border-slate-300 focus:border-brand-blue-accent outline-none py-0.5 px-1 font-bold text-slate-500 rounded transition-colors"
                                />
                              </label>
                              <textarea
                                rows={3}
                                value={hotelHalalBreakfast}
                                onChange={(e) => setHotelHalalBreakfast(e.target.value)}
                                placeholder="Gourmet breakfast from designated Halal sections..."
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none text-slate-600 leading-relaxed"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                <input
                                  type="text"
                                  value={hotelNearbyMosqueLabel}
                                  onChange={(e) => setHotelNearbyMosqueLabel(e.target.value)}
                                  placeholder="Nearby Mosque Highlight"
                                  className="w-full bg-transparent hover:bg-slate-100/80 focus:bg-white border-b border-dashed border-transparent hover:border-slate-300 focus:border-brand-blue-accent outline-none py-0.5 px-1 font-bold text-slate-500 rounded transition-colors"
                                />
                              </label>
                              <textarea
                                rows={3}
                                value={hotelNearbyMosque}
                                onChange={(e) => setHotelNearbyMosque(e.target.value)}
                                placeholder="Local mosque within 5-10 mins drive..."
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none text-slate-600 leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: OVERVIEW & AMENITIES */}
                    {hotelFormStep === 2 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Detailed Overview Description</label>
                          <textarea
                            rows={5}
                            value={hotelOverviewText}
                            onChange={(e) => setHotelOverviewText(e.target.value)}
                            placeholder="Provide a comprehensive introduction of the grand layout, gardens, colonial architecture, and customized features."
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2.5 text-xs outline-none text-slate-700 leading-relaxed"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Atmosphere Style</label>
                          <input
                            type="text"
                            value={hotelAtmosphere}
                            onChange={(e) => setHotelAtmosphere(e.target.value)}
                            placeholder="e.g., French-Colonial Grandeur & Royal Heritage Sanctuary"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-700 font-medium"
                          />
                        </div>

                        {/* Amenities Dynamic Grid */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Premium Amenities List</label>
                            <button
                              type="button"
                              onClick={() => setHotelAmenities([...hotelAmenities, ""])}
                              className="text-[10px] font-mono font-bold text-brand-blue-accent hover:text-brand-charcoal flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Amenity Option
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {hotelAmenities.map((amenity, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={amenity}
                                  onChange={(e) => {
                                    const updated = [...hotelAmenities];
                                    updated[idx] = e.target.value;
                                    setHotelAmenities(updated);
                                  }}
                                  placeholder={`Amenity e.g., Private Butler Service`}
                                  className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none text-slate-700 font-medium"
                                />
                                {hotelAmenities.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setHotelAmenities(hotelAmenities.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: EXPERIENCES */}
                    {hotelFormStep === 3 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                          <div>
                            <p className="text-xs font-bold text-slate-700">Filter Destination: {hotelLocation || "Unselected"}</p>
                            <p className="text-[10px] text-slate-400">Select day tours that should be recommended to guests booking this property.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddExpMiniForm(true)}
                            className="bg-[#0F1626] hover:bg-brand-blue-accent text-white hover:text-[#0F1626] px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Deploy New Experience
                          </button>
                        </div>

                        {/* List checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {experiences
                            .filter(exp => !hotelLocation || exp.location.toLowerCase().includes(hotelLocation.toLowerCase()))
                            .map((exp) => {
                              const isChecked = hotelSelectedExperiences.includes(exp.id);
                              return (
                                <label
                                  key={exp.id}
                                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                                    isChecked
                                      ? "bg-slate-50/80 border-brand-blue-accent ring-2 ring-brand-blue-accent/10"
                                      : "bg-white hover:bg-slate-50/50 border-slate-200"
                                  }`}
                                >
                                  <img src={exp.image} alt={exp.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-[#0F1626] block truncate">{exp.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{exp.category} • {exp.duration}</span>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setHotelSelectedExperiences(hotelSelectedExperiences.filter(id => id !== exp.id));
                                      } else {
                                        setHotelSelectedExperiences([...hotelSelectedExperiences, exp.id]);
                                      }
                                    }}
                                    className="rounded border-slate-300 text-[#0F1626] focus:ring-brand-blue-accent cursor-pointer"
                                  />
                                </label>
                              );
                            })}
                        </div>

                        {/* Mini Form Modal */}
                        {showAddExpMiniForm && (
                          <div className="bg-slate-50 border border-brand-blue-accent/20 p-5 rounded-2xl space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                              <h5 className="font-serif font-extrabold text-[#0F1626] text-xs uppercase tracking-wider">Create New Linked Experience</h5>
                              <button type="button" onClick={() => setShowAddExpMiniForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Experience Name *</label>
                                <input
                                  type="text"
                                  value={miniExpName}
                                  onChange={(e) => setMiniExpName(e.target.value)}
                                  placeholder="e.g., Sunrise Angkor Halal Guided Tour"
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Category *</label>
                                <select
                                  value={miniExpCategory}
                                  onChange={(e) => setMiniExpCategory(e.target.value as any)}
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none"
                                >
                                  <option value="Heritage">Heritage</option>
                                  <option value="Nature">Nature</option>
                                  <option value="Culture">Culture</option>
                                  <option value="Adventure">Adventure</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Duration *</label>
                                <input
                                  type="text"
                                  value={miniExpDuration}
                                  onChange={(e) => setMiniExpDuration(e.target.value)}
                                  placeholder="e.g., 4 Hours"
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Experience Cover Photo *</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleHotelFileUpload(e, "mini-exp")}
                                  className="w-full text-xs"
                                />
                              </div>
                              <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Brief Description *</label>
                                <textarea
                                  rows={2}
                                  value={miniExpDescription}
                                  onChange={(e) => setMiniExpDescription(e.target.value)}
                                  placeholder="Describe the cultural itinerary and halal lunch parameters..."
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs outline-none"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!miniExpName || !miniExpDescription || !miniExpDuration || !miniExpImage) {
                                  triggerToast("Please fill in all Experience mini-form fields.", "error");
                                  return;
                                }
                                const newExpId = `exp-mini-${Date.now()}`;
                                const newExpItem = {
                                  id: newExpId,
                                  name: miniExpName,
                                  location: hotelLocation,
                                  duration: miniExpDuration,
                                  category: miniExpCategory,
                                  description: miniExpDescription,
                                  image: miniExpImage,
                                  highlights: ["Private Halal Transfer", "Localized Muslim Guide Included"],
                                  gallery: [miniExpImage],
                                  isFamilyFriendly: true
                                };
                                onAddExperience(newExpItem);
                                setHotelSelectedExperiences([...hotelSelectedExperiences, newExpId]);
                                setShowAddExpMiniForm(false);
                                setMiniExpName("");
                                setMiniExpDescription("");
                                setMiniExpImage("");
                                setMiniExpDuration("");
                                triggerToast(`Successfully added and linked ${miniExpName}`, "success");
                              }}
                              className="bg-brand-blue-accent hover:bg-[#0F1626] hover:text-white text-[#0F1626] px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                            >
                              Add and Link Experience
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 4: ROOM TYPES */}
                    {hotelFormStep === 4 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold font-mono text-brand-blue-accent uppercase tracking-wider">Property Room Configurations & Suites</h4>
                          <button
                            type="button"
                            onClick={() => setHotelRooms([...hotelRooms, { name: "", image: "", capacity: "2 Guests", features: [""] }])}
                            className="text-[10px] font-mono font-bold text-brand-blue-accent hover:text-brand-charcoal flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Room configuration
                          </button>
                        </div>

                        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
                          {hotelRooms.map((room, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-4 relative">
                              <div className="absolute top-4 right-4 flex items-center gap-2">
                                {hotelRooms.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setHotelRooms(hotelRooms.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:bg-red-100 p-1 rounded-lg transition-all cursor-pointer"
                                    title="Remove Room Type"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <span className="text-[9px] font-mono font-bold uppercase text-brand-blue-accent block">Suite Config {idx + 1}</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Suite Name *</label>
                                  <input
                                    type="text"
                                    value={room.name}
                                    onChange={(e) => {
                                      const updated = [...hotelRooms];
                                      updated[idx].name = e.target.value;
                                      setHotelRooms(updated);
                                    }}
                                    placeholder="e.g., Royal Heritage Garden Villa"
                                    className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none font-bold"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Max Occupancy *</label>
                                  <input
                                    type="text"
                                    value={room.capacity}
                                    onChange={(e) => {
                                      const updated = [...hotelRooms];
                                      updated[idx].capacity = e.target.value;
                                      setHotelRooms(updated);
                                    }}
                                    placeholder="e.g., 2 Adults, 2 Children"
                                    className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none"
                                  />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                  <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Suite Cover Photo *</label>
                                  {room.image ? (
                                    <div className="relative rounded-xl overflow-hidden aspect-[16/5] border border-slate-200 bg-white">
                                      <img src={room.image} className="w-full h-full object-cover" alt="Room Suite" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...hotelRooms];
                                          updated[idx].image = "";
                                          setHotelRooms(updated);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white transition-colors bg-white/50">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleHotelFileUpload(e, "room", { idx })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      />
                                      <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                                      <span className="text-[9px] font-bold text-slate-600 block">Upload suite photo file</span>
                                    </div>
                                  )}
                                </div>

                                {/* Room Features */}
                                <div className="sm:col-span-2 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Suite Amenities Highlights</label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...hotelRooms];
                                        updated[idx].features = [...updated[idx].features, ""];
                                        setHotelRooms(updated);
                                      }}
                                      className="text-[9px] font-mono text-brand-blue-accent hover:text-brand-charcoal flex items-center gap-0.5 font-bold cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" /> Add Highlight
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {room.features.map((feat, fIdx) => (
                                      <div key={fIdx} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={feat}
                                          onChange={(e) => {
                                            const updated = [...hotelRooms];
                                            updated[idx].features[fIdx] = e.target.value;
                                            setHotelRooms(updated);
                                          }}
                                          placeholder="e.g., Secluded high-walled garden pool"
                                          className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-2.5 py-1 text-xs outline-none"
                                        />
                                        {room.features.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [...hotelRooms];
                                              updated[idx].features = updated[idx].features.filter((_, i) => i !== fIdx);
                                              setHotelRooms(updated);
                                            }}
                                            className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 5: LOCATION & TRAVEL */}
                    {hotelFormStep === 5 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Exact Postal Address *</label>
                            <input
                              type="text"
                              value={hotelAddress}
                              onChange={(e) => setHotelAddress(e.target.value)}
                              placeholder="e.g., Charles De Gaulle Blvd, Siem Reap, Cambodia"
                              className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Google Maps Link URL *</label>
                            <input
                              type="text"
                              value={hotelMapUrl}
                              onChange={(e) => setHotelMapUrl(e.target.value)}
                              placeholder="e.g., https://maps.google.com/?q=Raffles"
                              className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none font-medium"
                            />
                          </div>
                        </div>

                        {/* Stay22 Partner Integration & Affiliate Tagging */}
                        <div className="bg-[#0F1626] border border-emerald-500/30 rounded-2xl p-5 text-white space-y-4 shadow-md">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-xs">
                                S22
                              </div>
                              <div>
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                  <span>Stay22 Partner Tagging & Booking Link</span>
                                  <span className="text-[9px] font-sans font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                    Active Integration
                                  </span>
                                </h4>
                                <p className="text-[10px] text-slate-300 font-sans">Tag this hotel to your Stay22 affiliate account for live rates and partner commissions.</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                                Stay22 Affiliate ID (AID)
                              </label>
                              <input
                                type="text"
                                value={hotelStay22Aid}
                                onChange={(e) => setHotelStay22Aid(e.target.value)}
                                placeholder="e.g. ahlancambodia"
                                className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
                              />
                              <span className="text-[9px] text-slate-400 block font-mono">Default: "ahlancambodia"</span>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                                Stay22 Hotel Query / Search Address
                              </label>
                              <input
                                type="text"
                                value={hotelStay22HotelId}
                                onChange={(e) => setHotelStay22HotelId(e.target.value)}
                                placeholder={hotelName ? `${hotelName}, ${hotelLocation || "Cambodia"}` : "e.g. Raffles Grand Hotel d'Angkor, Siem Reap"}
                                className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-medium"
                              />
                              <span className="text-[9px] text-slate-400 block font-mono">Custom search address for Stay22 map engine (Leave empty to auto-use Hotel Name + City)</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                              Direct Stay22 URL / Affiliate Deep Link (Optional Override)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={hotelStay22Url}
                                onChange={(e) => setHotelStay22Url(e.target.value)}
                                placeholder="e.g. https://www.stay22.com/embed/gm?aid=ahlancambodia&address=..."
                                className="flex-1 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
                              />
                              <a
                                href={hotelStay22Url.trim() || `https://www.stay22.com/embed/gm?aid=${encodeURIComponent(hotelStay22Aid.trim() || "ahlancambodia")}&address=${encodeURIComponent(hotelStay22HotelId.trim() || ((hotelName || "Hotel") + ", " + (hotelLocation || "Cambodia")))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-500 hover:bg-emerald-400 text-[#0F1626] font-mono text-[10px] uppercase tracking-wider font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm"
                              >
                                <span>Test Link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                            <span className="text-[9px] text-slate-400 block font-mono">
                              Optionally paste a direct Stay22 custom link to override default map parameters.
                            </span>
                          </div>
                        </div>

                        {/* Attractions Grid */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Nearby Sightseeing Details & Distances</label>
                            <button
                              type="button"
                              onClick={() => setHotelNearbyAttractions([...hotelNearbyAttractions, { name: "", distance: "", description: "" }])}
                              className="text-[10px] font-mono text-brand-blue-accent hover:text-brand-charcoal flex items-center gap-1 font-bold cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Sightseeing Attraction
                            </button>
                          </div>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {hotelNearbyAttractions.map((attr, idx) => (
                              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                                <div className="absolute top-2 right-2">
                                  {hotelNearbyAttractions.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setHotelNearbyAttractions(hotelNearbyAttractions.filter((_, i) => i !== idx))}
                                      className="text-red-500 hover:bg-red-50 p-1 rounded-lg cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  <label className="text-[8px] font-mono uppercase text-slate-400 block font-bold">Attraction Name *</label>
                                  <input
                                    type="text"
                                    value={attr.name}
                                    onChange={(e) => {
                                      const updated = [...hotelNearbyAttractions];
                                      updated[idx].name = e.target.value;
                                      setHotelNearbyAttractions(updated);
                                    }}
                                    placeholder="e.g., Angkor Wat West Gate"
                                    className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-lg px-2.5 py-1 text-xs outline-none font-bold"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[8px] font-mono uppercase text-slate-400 block font-bold">Distance / Commute *</label>
                                  <input
                                    type="text"
                                    value={attr.distance}
                                    onChange={(e) => {
                                      const updated = [...hotelNearbyAttractions];
                                      updated[idx].distance = e.target.value;
                                      setHotelNearbyAttractions(updated);
                                    }}
                                    placeholder="e.g., 6 mins drive"
                                    className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-lg px-2.5 py-1 text-xs outline-none"
                                  />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[8px] font-mono uppercase text-slate-400 block font-bold">Attraction Short Description</label>
                                  <input
                                    type="text"
                                    value={attr.description}
                                    onChange={(e) => {
                                      const updated = [...hotelNearbyAttractions];
                                      updated[idx].description = e.target.value;
                                      setHotelNearbyAttractions(updated);
                                    }}
                                    placeholder="e.g., Prime entrance for crowd-free sunrise viewings."
                                    className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-lg px-2.5 py-1 text-xs outline-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 6: GALLERY */}
                    {hotelFormStep === 6 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {hotelGallery.map((val, slotIdx) => (
                            <div key={slotIdx} className="aspect-square bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden group flex flex-col items-center justify-center text-center p-2 bg-slate-50/40">
                              {val ? (
                                <>
                                  <img src={val} className="w-full h-full object-cover rounded-lg" alt={`Gallery slot ${slotIdx + 1}`} />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...hotelGallery];
                                      updated[slotIdx] = "";
                                      setHotelGallery(updated);
                                    }}
                                    className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <span className="absolute bottom-1 right-1 bg-black/60 text-white font-mono text-[8px] px-1 rounded font-bold">SLOT {slotIdx + 1}</span>
                                </>
                              ) : (
                                <div className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleHotelFileUpload(e, "gallery", { idx: slotIdx })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Upload className="w-5 h-5 text-slate-300 mb-1" />
                                  <span className="text-[8px] font-mono font-bold text-slate-400">UPLOAD #{slotIdx + 1}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 7: FAQ */}
                    {hotelFormStep === 7 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                          {hotelFaqsState.map((faq, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                              <span className="text-[9px] font-mono font-bold uppercase text-brand-blue-accent block">Property FAQ {idx + 1}</span>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={faq.q}
                                  onChange={(e) => {
                                    const updated = [...hotelFaqsState];
                                    updated[idx].q = e.target.value;
                                    setHotelFaqsState(updated);
                                  }}
                                  placeholder="Question..."
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-bold"
                                />
                                <textarea
                                  rows={2}
                                  value={faq.a}
                                  onChange={(e) => {
                                    const updated = [...hotelFaqsState];
                                    updated[idx].a = e.target.value;
                                    setHotelFaqsState(updated);
                                  }}
                                  placeholder="Answer..."
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none resize-none text-slate-600 leading-relaxed"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* BOTTOM STEP NAVIGATION */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                    <div className="flex gap-2">
                      {hotelFormStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setHotelFormStep(s => s - 1)}
                          className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        >
                          Previous Step
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to discard your draft? All unsaved changes will be lost.")) {
                              setHotelView("list");
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
                        >
                          Cancel Draft
                        </button>
                      )}

                      {hotelFormStep < 7 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (hotelFormStep === 1) {
                              if (!hotelName.trim() || !hotelLocation.trim() || !hotelPrice.trim()) {
                                triggerToast("Please fill in all Step 1 mandatory fields.", "error");
                                return;
                              }
                            }
                            setHotelFormStep(s => s + 1);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer animate-pulse"
                        >
                          Next Step
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveHotel}
                      className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md cursor-pointer"
                    >
                      {editingHotelId ? "Save Amendments" : "Publish Curated Hotel"}
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}


          {/* 5. TRAVEL BLOG TAB */}
          {activeTab === "travel-blog" && (
            <div className="w-full space-y-6 animate-fade-in">
              
              {/* LIST VIEW */}
              {blogView === "list" && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-serif font-extrabold text-[#0F1626] tracking-wider uppercase flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-brand-blue-accent" />
                        <span>Editorial BLOG Archives & Travel Guides</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Publish, edit, and optimize luxury articles, Muslim-friendly guides, and local advice
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetBlogForm();
                        setBlogView("wizard");
                      }}
                      className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" /> Add New Post
                    </button>
                  </div>

                  {/* List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localGuides.map((guide) => (
                      <div key={guide.id} className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden hover:bg-white transition-luxury hover:shadow-md flex flex-col justify-between">
                        <div>
                          {/* Image */}
                          <div className="relative w-full h-40 bg-slate-200 overflow-hidden">
                            <img 
                              src={guide.image} 
                              alt={guide.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute top-3 left-3 bg-[#0F1626] text-brand-blue-accent text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md shadow-sm">
                              {guide.category}
                            </div>
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[9px] font-mono px-2 py-1 rounded-md shadow-sm">
                              {guide.readTime}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-5 space-y-2.5 text-left">
                            <h4 className="font-serif font-bold text-sm text-[#0F1626] line-clamp-1">{guide.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{guide.description}</p>
                            <div className="text-[10px] font-mono text-slate-400 uppercase">
                              {guide.readTime}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              populateBlogForm(guide);
                              setBlogView("wizard");
                            }}
                            className="p-2 rounded-lg text-slate-600 hover:text-[#0F1626] hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold uppercase cursor-pointer"
                            title="Edit Post"
                          >
                            <Settings className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBlogDelete(guide.id, guide.title)}
                            className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold uppercase cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* WIZARD VIEW */}
              {blogView === "wizard" && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  {/* Title & Cancel */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-serif font-extrabold text-[#0F1626] tracking-wider uppercase flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-brand-blue-accent animate-pulse" />
                        <span>{editingBlogId ? "Edit Blog Post" : "Create Blog Post"}</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        {editingBlogId ? "Edit and optimize your published article parameters" : "Draft and design a rich luxury blog post or travel guide"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBlogView("list")}
                      className="text-slate-500 hover:text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Cancel
                    </button>
                  </div>

                  {/* Stepper Status Bar */}
                  <div className="flex items-center justify-between max-w-lg mx-auto pb-4">
                    {[
                      { step: 1, label: "Basic Info" },
                      { step: 2, label: "Highlights" },
                      { step: 3, label: "Rich Content" }
                    ].map((s, idx) => (
                      <React.Fragment key={s.step}>
                        <button
                          type="button"
                          onClick={() => handleStepClick(s.step)}
                          className="flex flex-col items-center space-y-1.5 relative z-10 focus:outline-none cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                            blogFormStep === s.step
                              ? "bg-[#0F1626] text-white ring-4 ring-brand-blue-accent/20"
                              : blogFormStep > s.step
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-400"
                          }`}>
                            {blogFormStep > s.step ? "✓" : s.step}
                          </div>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                            blogFormStep === s.step ? "text-[#0F1626]" : "text-slate-400"
                          }`}>{s.label}</span>
                        </button>
                        {idx < 2 && (
                          <div className="flex-1 h-[2px] bg-slate-100 mx-2 -mt-4 transition-all duration-300">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{
                              width: blogFormStep > s.step ? "100%" : "0%"
                            }} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* STEPPER CONTENT FORM */}
                  <form onSubmit={handleSaveBlog} className="space-y-6 text-left">
                    
                    {/* STEP 1: BASIC INFO */}
                    {blogFormStep === 1 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Post Title */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                              <span>Post Title</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              value={blogTitle}
                              onChange={(e) => setBlogTitle(e.target.value)}
                              placeholder="e.g. Savoring Siem Reap: A Culinary Journey"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue-accent focus:outline-none text-slate-800 text-sm font-sans"
                            />
                          </div>

                          {/* Cover Image Upload */}
                          <div className="space-y-1.5">
                            <ImageUploadZone
                              imageSrc={blogImage}
                              onChange={(base64) => setBlogImage(base64)}
                              label="Cover Image"
                              description="Upload a local high-quality cover photo."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Choose Category */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                              <span>Category</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              value={blogCategory}
                              onChange={(e) => setBlogCategory(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue-accent focus:outline-none text-slate-800 text-sm bg-white"
                            >
                              <option value="">-- Choose Category --</option>
                              {Array.from(new Set(localGuides.map(g => g.category)))
                                .filter(Boolean)
                                .map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))
                              }
                              <option value="ADD_NEW">+ Add New Category...</option>
                            </select>
                          </div>

                          {/* Target Destination Dropdown */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                              <span>Target Destination (Chronicles Tag)</span>
                            </label>
                            <select
                              value={blogDestinationId}
                              onChange={(e) => setBlogDestinationId(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue-accent focus:outline-none text-slate-800 text-sm bg-white font-sans"
                            >
                              <option value="general">🇰🇭 General Cambodia Post (All Destinations)</option>
                              {destinations && destinations.map(dest => (
                                <option key={dest.id} value={dest.id}>📍 {dest.name} ({dest.region || "Cambodia"})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Read Time Info */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                            Auto-Computed Read Time
                          </span>
                          <div className="text-sm font-mono text-[#0F1626] bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 inline-block font-bold">
                            {blogReadTime || "1 min read"}
                          </div>
                        </div>

                        {/* Custom Category Field if selected */}
                        {blogCategory === "ADD_NEW" && (
                          <div className="space-y-1.5 max-w-md animate-fade-in">
                            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                              <span>New Category Name</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="e.g. Adventure Guides"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue-accent focus:outline-none text-slate-800 text-sm font-sans"
                            />
                          </div>
                        )}

                        {/* Short Description with Counter */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                              <span>Short Description</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <span className={`text-[10px] font-mono font-bold uppercase ${
                              blogDescription.length > 150 ? "text-red-500" : "text-emerald-500"
                            }`}>
                              {blogDescription.length} / 150 chars max
                            </span>
                          </div>
                          <textarea 
                            required
                            maxLength={170}
                            value={blogDescription}
                            onChange={(e) => setBlogDescription(e.target.value)}
                            placeholder="Provide a quick, fascinating intro to display below the title and on index cards (exactly 150 chars recommended)..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue-accent focus:outline-none text-slate-800 text-sm font-sans leading-relaxed min-h-[80px]"
                          />
                          {blogDescription.length > 150 && (
                            <p className="text-[10px] text-red-500 font-mono">
                              ⚠️ Warning: Please trim this down to 150 characters or less for optimal layout.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: KEY HIGHLIGHTS */}
                    {blogFormStep === 2 && (
                      <div className="space-y-5 animate-fade-in text-left">
                        <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-2xl space-y-2">
                          <h3 className="text-sm font-serif font-bold text-[#0F1626] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-blue-accent" />
                            <span>Article Takeaways & Highlight Points</span>
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Specify exactly 4 key highlights or takeaway points. These will be beautifully bulleted on the side drawer under "Key Highlights" with checks!
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="space-y-1.5">
                              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Takeaway / Highlight {index + 1}</span>
                                <span className="text-red-500">*</span>
                              </label>
                              <input 
                                type="text" 
                                required
                                value={blogHighlights[index]}
                                onChange={(e) => {
                                  const updated = [...blogHighlights];
                                  updated[index] = e.target.value;
                                  setBlogHighlights(updated);
                                }}
                                placeholder={`e.g. Highlight point ${index + 1}...`}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue-accent focus:outline-none text-slate-800 text-sm font-sans"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: QUOTE EXCERPT & RICH WORDPRESS EDITOR */}
                    {blogFormStep === 3 && (
                      <div className="space-y-5 animate-fade-in">
                        {/* Quote Excerpt Box */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <span>Pull Quote / Excerpt</span>
                            <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <textarea 
                            value={blogQuoteExcerpt}
                            onChange={(e) => setBlogQuoteExcerpt(e.target.value)}
                            placeholder="e.g. 'Witnessing Angkor Wat at sunrise is a spiritual pilgrimage that lingers in your memory forever.'"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue-accent focus:outline-none text-slate-800 text-sm font-sans leading-relaxed min-h-[70px]"
                          />
                        </div>

                        {/* Full Wordpress-style HTML content */}
                        <div className="space-y-2">
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F1626] flex items-center gap-1.5 font-bold">
                            <span>Full Article Content</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <RichTextEditor 
                            value={blogContent}
                            onChange={setBlogContent}
                            placeholder="Draft your gorgeous blog guide. Use headings, bold, italics, bullets, blockquotes or even link custom images..."
                          />
                        </div>
                      </div>
                    )}

                    {/* ACTIONS BAR FOOTER */}
                    <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                      {/* Left side: Back or Cancel */}
                      {blogFormStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setBlogFormStep(prev => prev - 1)}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBlogView("list")}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Right side: Next or Save */}
                      {blogFormStep < 3 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (blogFormStep === 1) {
                              if (!blogTitle.trim() || !blogDescription.trim() || (!blogCategory && !newCategoryName.trim())) {
                                triggerToast("Please complete all Step 1 required parameters.", "error");
                                return;
                              }
                              if (blogDescription.length > 150) {
                                triggerToast("Short description must be 150 characters or less.", "error");
                                return;
                              }
                            }
                            if (blogFormStep === 2) {
                              blogStep3MountedAtRef.current = Date.now();
                            }
                            setBlogFormStep(prev => prev + 1);
                          }}
                          className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          Next Step <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" /> Publish Post
                        </button>
                      )}
                    </div>

                  </form>

                </div>
              )}

            </div>
          )}


          {/* 6. DINING / RESTAURANT TAB */}
          {activeTab === "dining" && (
            <div className="w-full space-y-6 animate-fade-in">
              
              {/* LIST VIEW */}
              {diningView === "list" && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <h2 className="text-lg font-serif font-extrabold text-[#0F1626] tracking-wider uppercase flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-brand-blue-accent" />
                        <span>Halal Dining & Gourmet Cafes Register</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage halal verified & muslim friendly restaurants, cuisines, signature dishes, and guest amenities
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetDiningForm();
                        setDiningView("wizard");
                      }}
                      className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" /> Add New Dining
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                          <th className="py-3.5 px-4">Dining Spot Info</th>
                          <th className="py-3.5 px-4">Location</th>
                          <th className="py-3.5 px-4">Cuisine</th>
                          <th className="py-3.5 px-4 text-center">Standing</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {localRestaurants.map((rest, idx) => (
                          <tr key={rest.id || idx} className="hover:bg-slate-50/50 transition-colors text-xs font-sans">
                            <td className="py-4 px-4 flex items-center gap-4 max-w-sm">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 shadow-sm">
                                <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-sm text-[#0F1626]">{rest.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium truncate">{rest.description}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px] font-semibold text-slate-600">
                              {rest.location}
                            </td>
                            <td className="py-4 px-4 text-slate-600 font-medium">
                              {rest.cuisine}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {rest.halalCertified ? (
                                <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                  Halal Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded text-[10px] font-bold">
                                  Muslim Friendly
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    populateDiningForm(rest);
                                    setDiningView("wizard");
                                  }}
                                  className="text-[10px] font-mono font-bold border border-slate-200 hover:border-[#0F1626] bg-white text-[#0F1626] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Edit Info
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemToDelete({ type: 'restaurant', id: rest.id, name: rest.name });
                                  }}
                                  className="border border-transparent hover:border-red-200 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Dining"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6-STEP WIZARD VIEW */}
              {diningView === "wizard" && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
                  
                  {/* Wizard Header / Breadcrumb Progress */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-semibold">
                        <span className="hover:text-brand-blue-accent cursor-pointer" onClick={() => setDiningView("list")}>Dining List</span>
                        <span>/</span>
                        <span className="text-slate-600">{editingDiningId ? "Edit Dining Record" : "New Dining Record"}</span>
                      </div>
                      <h3 className="font-serif font-extrabold text-[#0F1626] text-lg uppercase tracking-wider">
                        {editingDiningId ? `Edit: ${diningName}` : "Register New Dining Spot"}
                      </h3>
                    </div>
                    
                    {/* Stepper controls */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {[1, 2, 3, 4, 5, 6].map((s) => {
                        const isActive = s === diningFormStep;
                        const isCompleted = s < diningFormStep;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              if (isCompleted || editingDiningId) {
                                setDiningFormStep(s);
                              } else if (s === diningFormStep + 1) {
                                if (diningFormStep === 1 && (!diningName || !diningLocation || !diningCuisine)) {
                                  triggerToast("Please fill in basic details first.", "error");
                                  return;
                                }
                                setDiningFormStep(s);
                              }
                            }}
                            className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center border transition-all cursor-pointer ${
                              isActive 
                                ? "bg-[#0F1626] text-white border-[#0F1626] ring-2 ring-brand-blue-accent/30" 
                                : isCompleted 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {isCompleted ? "✓" : s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step Description Banner */}
                  <div className="p-4 bg-brand-lightbg border border-brand-blue-accent/15 rounded-2xl">
                    <h4 className="text-xs font-bold font-mono text-brand-blue-accent uppercase tracking-wider mb-0.5">
                      Step {diningFormStep} of 6: {
                        diningFormStep === 1 ? "Basic Credentials Profile" :
                        diningFormStep === 2 ? "Detailed Overview & Ambiance" :
                        diningFormStep === 3 ? "Location Logistics & Contacts" :
                        diningFormStep === 4 ? "Must-Try Signature Dishes" :
                        diningFormStep === 5 ? "Frequently Asked Questions" :
                        "Social Media Video Reels (Optional)"
                      }
                    </h4>
                    <p className="text-[11px] text-brand-charcoal/70 leading-relaxed font-sans">
                      {diningFormStep === 1 && "Specify general parameters including name, destination link, cuisine specialty, cover photos, and verified status."}
                      {diningFormStep === 2 && "Introduce the dining background, detailed description, interior design, ambiance style, and automated standing profile."}
                      {diningFormStep === 3 && "Provide precise Google Maps locations, opening hours, contact phone numbers, and full physical address."}
                      {diningFormStep === 4 && "Configure must-try signature dishes. Upload dish photographs manually and provide rich culinary descriptions."}
                      {diningFormStep === 5 && "Maintain 5 informative Q&As regarding cross-contamination prevention, families facilities, or group requirements."}
                      {diningFormStep === 6 && "Embed optional social media links (TikTok, Instagram Reels, or YouTube) featuring the restaurant or cafe."}
                    </p>
                  </div>

                  {/* STEP CONTENT FIELDS */}
                  <form onSubmit={handleSaveDining} className="space-y-6 text-left">
                    
                    {/* STEP 1: BASIC INFO */}
                    {diningFormStep === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Dining Spot Name *</label>
                          <input
                            type="text"
                            value={diningName}
                            onChange={(e) => setDiningName(e.target.value)}
                            placeholder="e.g., Shamyana Halal Restaurant"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Islamic Standing *</label>
                          <div className="flex flex-wrap gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                              <input
                                type="radio"
                                name="islamicStanding"
                                checked={diningHalalVerified}
                                onChange={() => {
                                  setDiningHalalVerified(true);
                                  setDiningMuslimFriendly(false);
                                }}
                                className="w-4 h-4 text-[#0F1626] focus:ring-brand-blue-accent"
                              />
                              <span>Halal Verified</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                              <input
                                type="radio"
                                name="islamicStanding"
                                checked={diningMuslimFriendly}
                                onChange={() => {
                                  setDiningHalalVerified(false);
                                  setDiningMuslimFriendly(true);
                                }}
                                className="w-4 h-4 text-[#0F1626] focus:ring-brand-blue-accent"
                              />
                              <span>Muslim Friendly</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Cuisine Specialty Type *</label>
                          <input
                            type="text"
                            value={diningCuisine}
                            onChange={(e) => setDiningCuisine(e.target.value)}
                            placeholder="e.g., Authentic Indian & Middle Eastern"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Destination *</label>
                          <select
                            value={diningLocation}
                            onChange={(e) => setDiningLocation(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-700"
                          >
                            <option value="">Choose Destination...</option>
                            {destinations.map((d) => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Short Description (Max 150 Chars) *</label>
                            <span className={`text-[9px] font-mono font-bold ${diningShortDesc.length > 150 ? "text-red-500" : "text-slate-400"}`}>
                              {diningShortDesc.length} / 150
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            maxLength={150}
                            value={diningShortDesc}
                            onChange={(e) => setDiningShortDesc(e.target.value)}
                            placeholder="Enjoy exquisite Indian curries and gourmet Middle Eastern kababs cooked in an absolute 100% Halal verified kitchen in Phnom Penh."
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-600 leading-relaxed resize-none"
                          />
                        </div>

                        {/* Cover Image Upload */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Hero cover photo *</label>
                          <ImageUploadZone
                            imageSrc={diningHeroImage}
                            onChange={setDiningHeroImage}
                            label="Upload Hero Cover Image"
                            description="Used for detail page hero section and listings cards"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: ABOUT & AMBIANCE */}
                    {diningFormStep === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">About / Detailed Overview *</label>
                          <textarea
                            rows={4}
                            value={diningAbout}
                            onChange={(e) => setDiningAbout(e.target.value)}
                            placeholder="Provide deep details about the restaurant history, dining options, seating layouts, and specialty hospitality standards..."
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-600 leading-relaxed resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Ambiance Style *</label>
                            <input
                              type="text"
                              value={diningAmbiance}
                              onChange={(e) => setDiningAmbiance(e.target.value)}
                              placeholder="e.g., Intimate Heritage Luxury, Modern Bistro, Cozy Family Haven"
                              className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Halal Standing (Pulled from Step 1)</label>
                            <input
                              type="text"
                              readOnly
                              value={diningMuslimFriendly ? "Muslim Friendly" : "Halal Verified"}
                              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none text-slate-600 font-bold select-none cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: LOCATION & MAPS */}
                    {diningFormStep === 3 && (
                      <div className="space-y-5 animate-fade-in">
                        {/* Google Maps URL Input & Auto-Capture Controller */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0F1626] flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-brand-blue-accent" />
                              Google Maps Location Link *
                            </label>
                            {locationCapturedSuccess && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Auto-Captured
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={diningGoogleMapsUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDiningGoogleMapsUrl(val);
                                if (val.includes("http") || val.includes("maps") || val.includes("goo.gl")) {
                                  handleAutoCaptureLocation(val);
                                }
                              }}
                              onBlur={() => {
                                if (diningGoogleMapsUrl.trim() && (!diningAddress || !diningContactNumber || !diningOpeningHours)) {
                                  handleAutoCaptureLocation();
                                }
                              }}
                              placeholder="Paste Google Maps URL e.g. https://maps.google.com/?q=Shamyana+Phnom+Penh"
                              className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2.5 text-xs outline-none text-[#0F1626] font-medium"
                            />
                            <button
                              type="button"
                              disabled={isCapturingLocation || !diningGoogleMapsUrl.trim()}
                              onClick={() => handleAutoCaptureLocation()}
                              className="bg-brand-blue-accent hover:bg-brand-blue-accent/90 disabled:opacity-50 text-[#0F1626] px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-sm shrink-0"
                            >
                              {isCapturingLocation ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-Capturing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" /> Auto-Capture
                                </>
                              )}
                            </button>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 font-sans">
                            Enter the Google Maps URL above. Address, Contact Phone Number, and Opening Hours will be automatically captured from Google Maps below. You can edit any field if needed.
                          </p>
                        </div>

                        {/* Auto-Captured Details (Fully Editable) */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                              Captured Location Details (Editable)
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              Review or adjust any details if needed
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                                Full Physical Address *
                              </label>
                              <input
                                type="text"
                                value={diningAddress}
                                onChange={(e) => setDiningAddress(e.target.value)}
                                placeholder="Auto-captured address e.g. No. 24, Street 130, Phnom Penh"
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2.5 text-xs outline-none text-[#0F1626] font-medium"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                                Contact / Telephone Number *
                              </label>
                              <input
                                type="text"
                                value={diningContactNumber}
                                onChange={(e) => setDiningContactNumber(e.target.value)}
                                placeholder="Auto-captured phone e.g. +855 (0) 23 777 999"
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2.5 text-xs outline-none text-[#0F1626] font-medium"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                                Opening Hours *
                              </label>
                              <input
                                type="text"
                                value={diningOpeningHours}
                                onChange={(e) => setDiningOpeningHours(e.target.value)}
                                placeholder="Auto-captured hours e.g. Daily: 11:00 AM - 10:30 PM"
                                className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2.5 text-xs outline-none text-[#0F1626] font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: SIGNATURE DISHES */}
                    {diningFormStep === 4 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold font-mono text-[#0F1626] uppercase">Must-Try Signature Dishes</h4>
                          <button
                            type="button"
                            onClick={addSignatureDish}
                            className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add New Dish
                          </button>
                        </div>

                        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
                          {diningSignatureDishes.map((dish, idx) => (
                            <div key={idx} className="bg-slate-50/70 border border-slate-200/85 p-4 rounded-2xl relative space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono font-bold uppercase text-brand-blue-accent">Signature Dish #{idx + 1}</span>
                                {diningSignatureDishes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSignatureDish(idx)}
                                    className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Dish"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1 space-y-1">
                                  <label className="text-[9px] font-mono font-bold uppercase text-slate-500">Dish Photo *</label>
                                  <ImageUploadZone
                                    imageSrc={dish.image}
                                    onChange={(base64) => {
                                      const updated = [...diningSignatureDishes];
                                      updated[idx].image = base64;
                                      setDiningSignatureDishes(updated);
                                    }}
                                    label={`Upload Photo #${idx + 1}`}
                                  />
                                </div>

                                <div className="sm:col-span-2 space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Dish Name *</label>
                                    <input
                                      type="text"
                                      value={dish.name}
                                      onChange={(e) => {
                                        const updated = [...diningSignatureDishes];
                                        updated[idx].name = e.target.value;
                                        setDiningSignatureDishes(updated);
                                      }}
                                      placeholder="e.g., Royal Mogul Lamb Shank Biryani"
                                      className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-bold"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Dish Description *</label>
                                    <textarea
                                      rows={2}
                                      value={dish.description}
                                      onChange={(e) => {
                                        const updated = [...diningSignatureDishes];
                                        updated[idx].description = e.target.value;
                                        setDiningSignatureDishes(updated);
                                      }}
                                      placeholder="Melt-in-your-mouth tender grass-fed lamb shank cooked for 8 hours in rich spices and served with saffron basmati rice."
                                      className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-slate-600 resize-none leading-relaxed"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 5: FAQ */}
                    {diningFormStep === 5 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                          {diningFaqs.map((faq, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                              <span className="text-[9px] font-mono font-bold uppercase text-brand-blue-accent block">Dining FAQ {idx + 1}</span>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={faq.q}
                                  onChange={(e) => {
                                    const updated = [...diningFaqs];
                                    updated[idx].q = e.target.value;
                                    setDiningFaqs(updated);
                                  }}
                                  placeholder="Question..."
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-bold"
                                />
                                <textarea
                                  rows={2}
                                  value={faq.a}
                                  onChange={(e) => {
                                    const updated = [...diningFaqs];
                                    updated[idx].a = e.target.value;
                                    setDiningFaqs(updated);
                                  }}
                                  placeholder="Answer..."
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none resize-none text-slate-600 leading-relaxed"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 6: SOCIAL MEDIA VIDEO REELS */}
                    {diningFormStep === 6 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <h4 className="text-xs font-bold font-mono text-[#0F1626] uppercase tracking-wider flex items-center gap-2">
                              <Globe className="w-4 h-4 text-brand-blue-accent" /> Social Media Video Reels (Optional)
                            </h4>
                            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                              Paste links from TikTok, Instagram Reels, YouTube, Facebook, or X. Click <strong>Fetch Media</strong> to auto-populate metadata without Gemini.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addSocialVideo}
                            className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-3.5 py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Social Link
                          </button>
                        </div>

                        {diningSocialVideos.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                            <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500 font-medium font-sans">No social media links added yet.</p>
                            <p className="text-[11px] text-slate-400 font-sans">Click 'Add Social Link' above to embed food reviews, chef interviews, or kitchen tours.</p>
                          </div>
                        ) : (
                          <div className="space-y-6 max-h-[650px] overflow-y-auto pr-1">
                            {diningSocialVideos.map((video, idx) => (
                              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-brand-blue-accent/10 text-brand-blue-accent flex items-center justify-center font-mono text-xs font-bold">
                                      #{idx + 1}
                                    </span>
                                    <span className="text-xs font-mono font-bold uppercase text-[#0F1626]">
                                      Social Media Reel
                                    </span>
                                    {video.fetchSuccess && (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Auto-Fetched
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeSocialVideo(idx)}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono"
                                    title="Remove Link"
                                  >
                                    <Trash2 className="w-4 h-4" /> Remove
                                  </button>
                                </div>

                                {/* 1. URL Field & Fetch Media Button */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                                    Social Media URL (TikTok, Instagram, YouTube, Facebook, X) *
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={video.url}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const updated = [...diningSocialVideos];
                                        updated[idx].url = val;
                                        
                                        // Auto-detect platform when typing/pasting
                                        const lower = val.toLowerCase();
                                        if (lower.includes("tiktok.com")) updated[idx].platform = "tiktok";
                                        else if (lower.includes("instagram.com")) updated[idx].platform = "instagram";
                                        else if (lower.includes("youtube.com") || lower.includes("youtu.be")) updated[idx].platform = "youtube";
                                        else if (lower.includes("facebook.com") || lower.includes("fb.watch")) updated[idx].platform = "facebook";
                                        else if (lower.includes("x.com") || lower.includes("twitter.com")) updated[idx].platform = "x";
                                        
                                        // Reset fetch feedback on manual editing
                                        updated[idx].fetchError = null;
                                        updated[idx].fetchSuccess = false;
                                        setDiningSocialVideos(updated);
                                      }}
                                      placeholder="e.g. https://www.tiktok.com/@user/video/1234567890 or https://www.instagram.com/reel/C3_abc/"
                                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none text-[#0F1626] font-bold transition-all"
                                    />
                                    <button
                                      type="button"
                                      disabled={video.isFetching || !video.url?.trim()}
                                      onClick={() => fetchSocialMediaMetadata(idx)}
                                      className="bg-brand-blue-accent hover:bg-brand-blue-accent/90 disabled:opacity-50 text-[#0F1626] px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-sm shrink-0"
                                    >
                                      {video.isFetching ? (
                                        <>
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching...
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="w-3.5 h-3.5" /> Fetch Media
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Error Message if metadata retrieval failed */}
                                  {video.fetchError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 animate-fade-in">
                                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                      <div className="text-xs font-sans font-medium">
                                        <p className="font-bold">Metadata Fetch Error</p>
                                        <p>{video.fetchError}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* 2. Populated Editable Fields & Live Preview Card Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                                  {/* Form Fields Column */}
                                  <div className="lg:col-span-7 space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-1.5">
                                      Populated CMS Metadata Fields
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Platform</label>
                                        <select
                                          value={video.platform || "tiktok"}
                                          onChange={(e) => {
                                            const updated = [...diningSocialVideos];
                                            updated[idx].platform = e.target.value as any;
                                            setDiningSocialVideos(updated);
                                          }}
                                          className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-2.5 py-1.5 text-xs outline-none text-[#0F1626] font-medium"
                                        >
                                          <option value="tiktok">TikTok</option>
                                          <option value="instagram">Instagram Reel</option>
                                          <option value="youtube">YouTube</option>
                                          <option value="facebook">Facebook</option>
                                          <option value="x">X / Twitter</option>
                                          <option value="other">Other Link</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Duration</label>
                                        <input
                                          type="text"
                                          value={video.duration || "0:45"}
                                          onChange={(e) => {
                                            const updated = [...diningSocialVideos];
                                            updated[idx].duration = e.target.value;
                                            setDiningSocialVideos(updated);
                                          }}
                                          placeholder="e.g. 0:45"
                                          className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-2.5 py-1.5 text-xs outline-none text-[#0F1626] font-medium"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Video / Post Title</label>
                                      <input
                                        type="text"
                                        value={video.title || ""}
                                        onChange={(e) => {
                                          const updated = [...diningSocialVideos];
                                          updated[idx].title = e.target.value;
                                          setDiningSocialVideos(updated);
                                        }}
                                        placeholder="e.g. Gourmet Kebab Review by Foodie"
                                        className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-medium"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Creator Name</label>
                                        <input
                                          type="text"
                                          value={video.creatorName || ""}
                                          onChange={(e) => {
                                            const updated = [...diningSocialVideos];
                                            updated[idx].creatorName = e.target.value;
                                            setDiningSocialVideos(updated);
                                          }}
                                          placeholder="e.g. Claypot SG"
                                          className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-medium"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Creator Handle</label>
                                        <input
                                          type="text"
                                          value={video.creatorHandle || ""}
                                          onChange={(e) => {
                                            const updated = [...diningSocialVideos];
                                            updated[idx].creatorHandle = e.target.value;
                                            setDiningSocialVideos(updated);
                                          }}
                                          placeholder="e.g. @claypotsg"
                                          className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-medium"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">Creator Avatar / Profile Logo URL</label>
                                      <input
                                        type="text"
                                        value={video.creatorAvatar || ""}
                                        onChange={(e) => {
                                          const updated = [...diningSocialVideos];
                                          updated[idx].creatorAvatar = e.target.value;
                                          setDiningSocialVideos(updated);
                                        }}
                                        placeholder="https://..."
                                        className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-medium"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-mono font-bold uppercase text-slate-500 block">
                                          Thumbnail / Cover Image (Auto-Retrieved or Upload)
                                        </label>
                                        {video.thumbnailUrl && (
                                          <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Image Set
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={video.thumbnailUrl || ""}
                                          onChange={(e) => {
                                            const updated = [...diningSocialVideos];
                                            updated[idx].thumbnailUrl = e.target.value;
                                            setDiningSocialVideos(updated);
                                          }}
                                          placeholder="Auto-filled image URL or paste https://..."
                                          className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-medium"
                                        />
                                        <label className="cursor-pointer bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors shadow-sm">
                                          <Upload className="w-3.5 h-3.5 text-brand-blue-accent" />
                                          {video.isUploadingThumb ? "Uploading..." : "Upload Cover"}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={video.isUploadingThumb}
                                            onChange={(e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                handleUploadThumbnail(idx, e.target.files[0]);
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>

                                      {/* Fallback Notice if no cover image was retrieved */}
                                      {!video.thumbnailUrl && (
                                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between gap-2 animate-fade-in">
                                          <div className="flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                            <span>Cover image not retrieved yet. Upload a custom cover image or paste a link.</span>
                                          </div>
                                          <label className="cursor-pointer text-amber-900 underline font-bold font-mono text-[10px] uppercase hover:text-black shrink-0">
                                            Upload File
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              disabled={video.isUploadingThumb}
                                              onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                  handleUploadThumbnail(idx, e.target.files[0]);
                                                }
                                              }}
                                            />
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Live Card Preview Column */}
                                  <div className="lg:col-span-5 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5 text-brand-blue-accent" /> Live Website Card Preview
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-400">Exact layout on site</span>
                                    </div>
                                    
                                    <div className="border border-slate-200 rounded-3xl p-2 bg-[#080b14] shadow-inner max-w-sm mx-auto">
                                      <SocialVideoCard
                                        video={{
                                          platform: video.platform || "tiktok",
                                          url: video.url || "https://tiktok.com",
                                          title: video.title || "Delicious food review in Cambodia!",
                                          thumbnailUrl: video.thumbnailUrl,
                                          creatorName: video.creatorName || "Foodie Explorer",
                                          creatorHandle: video.creatorHandle || "@foodie",
                                          creatorAvatar: video.creatorAvatar,
                                          duration: video.duration || "0:45",
                                          views: "140K",
                                          likes: "12K"
                                        }}
                                        fallbackName={diningName || "Restaurant"}
                                        restaurantName={diningName || "Restaurant"}
                                        restaurantImage={diningImages && diningImages.length > 0 ? diningImages[0] : ""}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BOTTOM STEP NAVIGATION */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                      <div className="flex gap-2">
                        {diningFormStep > 1 ? (
                          <button
                            type="button"
                            onClick={() => setDiningFormStep(s => s - 1)}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          >
                            Previous Step
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to discard your draft? All unsaved changes will be lost.")) {
                                setDiningView("list");
                              }
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
                          >
                            Cancel Draft
                          </button>
                        )}

                        {diningFormStep < 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (diningFormStep === 1) {
                                if (!diningName.trim() || !diningLocation.trim() || !diningCuisine.trim()) {
                                  triggerToast("Please fill in name, destination, and cuisine type.", "error");
                                  return;
                                }
                              }
                              setDiningFormStep(s => s + 1);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer animate-pulse"
                          >
                            Next Step
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md cursor-pointer"
                      >
                        {editingDiningId ? "Save Amendments" : "Publish Curated Dining"}
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          )}


          {/* MOSQUES MANAGEMENT DOSSIER */}
          {activeTab === "mosques" && (
            <div className="space-y-6">
              {mosqueView === "list" ? (
                <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <MosqueIcon className="w-5 h-5 text-brand-blue-accent shrink-0" />
                      <h3 className="font-serif font-bold text-base text-[#0F1626]">
                        MOSQUE REGISTRY ({localMosques.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        resetMosqueForm();
                        setMosqueView("wizard");
                      }}
                      className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border border-transparent hover:border-brand-blue-accent cursor-pointer"
                    >
                      + Register Mosque
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {localMosques.map((mq) => (
                      <div key={mq.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                        <div className="h-44 relative bg-slate-200 overflow-hidden shrink-0">
                          <img src={mq.image} alt={mq.name} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                            {mq.isHeritageCenter !== false && (
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wide">
                                Heritage Center
                              </span>
                            )}
                            {mq.isActiveJummah !== false && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wide">
                                Active Jummah
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-serif font-extrabold text-slate-800 text-base leading-tight truncate">{mq.name}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-blue-accent shrink-0" />
                              <span className="truncate">{mq.location}</span>
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-brand-blue-accent shrink-0" />
                              <span>Capacity: {mq.capacity || "1,000 worshippers"}</span>
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-blue-accent shrink-0" />
                              <span>Friday Jummah: {mq.fridayPrayerTime || "12:30 PM"}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium italic mt-2 line-clamp-2">
                              {mq.description || "No short description provided."}
                            </p>
                          </div>
                          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-auto">
                            <button
                              onClick={() => {
                                populateMosqueForm(mq);
                                setMosqueView("wizard");
                              }}
                              className="bg-slate-100 hover:bg-[#0F1626] text-slate-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Edit details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMosqueDelete(mq.id, mq.name)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Remove asset
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto animate-fade-in space-y-6">
                  
                  {/* STEP TRACKER BAR */}
                  <div className="border-b border-slate-100 pb-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MosqueIcon className="w-5 h-5 text-brand-blue-accent" />
                        <h3 className="font-serif font-bold text-lg text-[#0F1626]">
                          {editingMosqueId ? `AMEND MOSQUE PROFILE: ${mosqueName}` : "DEPLOY NEW MOSQUE PROFILE"}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono bg-[#0F1626] text-brand-blue-accent font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Step {mosqueFormStep} of 5
                      </span>
                    </div>

                    <div className="relative">
                      {/* Connection bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-brand-blue-accent -translate-y-1/2 z-0 transition-all duration-300"
                        style={{ width: `${((mosqueFormStep - 1) / 4) * 100}%` }}
                      />

                      <div className="relative flex justify-between z-10">
                        {[
                          "Basic Info",
                          "Profile details",
                          "Address",
                          "Amenities",
                          "Guidelines"
                        ].map((label, stepIdx) => {
                          const currStep = stepIdx + 1;
                          const isCompleted = currStep < mosqueFormStep;
                          const isCurrent = currStep === mosqueFormStep;
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                if (mosqueFormStep === 1 && currStep > 1) {
                                  if (!mosqueName.trim() || !mosqueLocation.trim()) {
                                    triggerToast("Complete Step 1 required parameters first.", "error");
                                    return;
                                  }
                                }
                                setMosqueFormStep(currStep);
                              }}
                              className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                                isCompleted 
                                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" 
                                  : isCurrent 
                                  ? "bg-brand-blue-accent text-[#0F1626] shadow-md shadow-amber-100 border-2 border-[#0F1626]" 
                                  : "bg-white border border-slate-200 text-slate-400"
                              }`}>
                                {currStep}
                              </div>
                              <span className={`text-[9px] font-mono font-bold tracking-wider uppercase hidden sm:block ${
                                isCurrent ? "text-brand-blue-accent" : isCompleted ? "text-slate-600" : "text-slate-400"
                              }`}>
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* FORM FIELDS */}
                  <form onSubmit={handleSaveMosque} className="space-y-6 text-left">
                    
                    {/* STEP 1: BASIC INFO */}
                    {mosqueFormStep === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Mosque Name *</label>
                          <input
                            type="text"
                            value={mosqueName}
                            onChange={(e) => setMosqueName(e.target.value)}
                            placeholder="e.g., Al-Serkal Mosque"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Destination / Location *</label>
                          <select
                            value={mosqueLocation}
                            onChange={(e) => {
                              const city = e.target.value;
                              setMosqueLocation(city);
                              // Dynamically update Friday Jummah time based on city, keeping it editable!
                              if (city) {
                                setMosqueFridayPrayerTime(getJummahTimeForCity(city));
                              }
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-700 font-medium"
                          >
                            <option value="">Choose Location...</option>
                            {destinations.map((d) => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Worshippers Capacity *</label>
                          <input
                            type="text"
                            value={mosqueCapacity}
                            onChange={(e) => setMosqueCapacity(e.target.value)}
                            placeholder="e.g., 1,000 worshippers"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Friday Jummah Prayer Time (Dynamically prefilled based on City) *</label>
                          <input
                            type="text"
                            value={mosqueFridayPrayerTime}
                            onChange={(e) => setMosqueFridayPrayerTime(e.target.value)}
                            placeholder="e.g., 12:30 PM (Khutbah starts at 12:15 PM)"
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Short Description (Max 150 Chars) *</label>
                            <span className={`text-[9px] font-mono font-bold ${mosqueShortDesc.length > 150 ? "text-red-500" : "text-slate-400"}`}>
                              {mosqueShortDesc.length} / 150
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            maxLength={150}
                            value={mosqueShortDesc}
                            onChange={(e) => setMosqueShortDesc(e.target.value)}
                            placeholder="Brief elegant snippet. This will be visible below the title and all mosque cards."
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-600 leading-relaxed resize-none"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Standing / Category (Tick either or both) *</label>
                          <div className="flex gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <label className="flex items-center gap-2.5 text-xs font-semibold text-[#0F1626] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mosqueIsHeritageCenter}
                                onChange={(e) => setMosqueIsHeritageCenter(e.target.checked)}
                                className="w-4 h-4 text-brand-blue-accent rounded focus:ring-brand-blue-accent"
                              />
                              <span>Islamic Heritage Center</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs font-semibold text-[#0F1626] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mosqueIsActiveJummah}
                                onChange={(e) => setMosqueIsActiveJummah(e.target.checked)}
                                className="w-4 h-4 text-brand-blue-accent rounded focus:ring-brand-blue-accent"
                              />
                              <span>Active Jummah Congregation</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Hero photo cover *</label>
                          <ImageUploadZone
                            imageSrc={mosqueHeroPhoto}
                            onChange={setMosqueHeroPhoto}
                            label="Upload Hero Cover Image"
                            description="Used as main background photo and cards illustration"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: PROFILE DETAILS */}
                    {mosqueFormStep === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">About / Detailed Overview *</label>
                          <textarea
                            rows={4}
                            value={mosqueLongDesc}
                            onChange={(e) => setMosqueLongDesc(e.target.value)}
                            placeholder="Provide deep details about the history of the mosque, its community development, role in the local province, and services..."
                            className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-slate-600 leading-relaxed resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Architecture Style *</label>
                            <input
                              type="text"
                              value={mosqueArchitectureStyle}
                              onChange={(e) => setMosqueArchitectureStyle(e.target.value)}
                              placeholder="e.g., Contemporary Middle Eastern Domes, Traditional Cham Wooden Pavilions"
                              className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Historical Legacy *</label>
                            <input
                              type="text"
                              value={mosqueHistoricalLegacy}
                              onChange={(e) => setMosqueHistoricalLegacy(e.target.value)}
                              placeholder="e.g., Gifted by international patrons in 2011, serving as local sanctuary"
                              className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: ADDRESS & MAP */}
                    {mosqueFormStep === 3 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Google Maps Location Link *</label>
                            <input
                              type="text"
                              value={mosqueGoogleMapsUrl}
                              onChange={(e) => {
                                const url = e.target.value;
                                setMosqueGoogleMapsUrl(url);
                                const autoCaptured = autoCaptureAddressFromMapLink(url, mosqueName, mosqueLocation);
                                setMosqueFullAddress(autoCaptured);
                              }}
                              placeholder="e.g., https://maps.google.com/?q=Al-Serkal+Mosque+Phnom+Penh"
                              className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                            />
                            <p className="text-[10px] text-slate-400 font-mono">Paste Google Maps URL or location link to auto-capture exact address parameters.</p>
                          </div>

                          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-emerald-800 font-mono text-[10px] uppercase font-bold tracking-wider">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Auto-Captured Physical Address</span>
                            </div>
                            <p className="text-xs text-slate-800 font-sans font-semibold">
                              {mosqueFullAddress || autoCaptureAddressFromMapLink(mosqueGoogleMapsUrl, mosqueName, mosqueLocation)}
                            </p>
                            <p className="text-[10px] text-slate-500 italic">
                              Address is automatically captured from the Google Maps location link &amp; destination context.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: AMENITIES */}
                    {mosqueFormStep === 4 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold font-mono text-[#0F1626] uppercase">Spiritual & Travel Amenities</h4>
                          <button
                            type="button"
                            onClick={() => setMosqueAmenities([...mosqueAmenities, ""])}
                            className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Amenity
                          </button>
                        </div>

                        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                          {mosqueAmenities.map((amenity, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <span className="text-[10px] font-mono font-bold text-slate-400 w-5 text-right">#{idx + 1}</span>
                              <input
                                type="text"
                                value={amenity}
                                onChange={(e) => {
                                  const updated = [...mosqueAmenities];
                                  updated[idx] = e.target.value;
                                  setMosqueAmenities(updated);
                                }}
                                placeholder="e.g., Separate Dedicated Sisters Prayer Section, Quran with English translations available..."
                                className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3.5 py-2 text-xs outline-none text-[#0F1626] font-medium"
                              />
                              {mosqueAmenities.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setMosqueAmenities(mosqueAmenities.filter((_, i) => i !== idx))}
                                  className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 5: VISITOR GUIDELINES */}
                    {mosqueFormStep === 5 && (
                      <div className="space-y-4 animate-fade-in">
                        <h4 className="text-xs font-bold font-mono text-[#0F1626] uppercase border-b border-slate-100 pb-2">Edit Respectful Visitor Guidelines</h4>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                          {mosqueGuidelines.map((guideline, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                              <span className="text-[10px] font-mono font-bold uppercase text-brand-blue-accent block">Guideline Item {idx + 1}</span>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={guideline.title}
                                  onChange={(e) => {
                                    const updated = [...mosqueGuidelines];
                                    updated[idx].title = e.target.value;
                                    setMosqueGuidelines(updated);
                                  }}
                                  placeholder="Guideline Title (e.g. Modest Attire)"
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none text-[#0F1626] font-bold"
                                />
                                <textarea
                                  rows={2}
                                  value={guideline.content}
                                  onChange={(e) => {
                                    const updated = [...mosqueGuidelines];
                                    updated[idx].content = e.target.value;
                                    setMosqueGuidelines(updated);
                                  }}
                                  placeholder="Guideline Description..."
                                  className="w-full bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-1.5 text-xs outline-none resize-none text-slate-600 leading-relaxed"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BOTTOM STEP NAVIGATION */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                      <div className="flex gap-2">
                        {mosqueFormStep > 1 ? (
                          <button
                            type="button"
                            onClick={() => setMosqueFormStep(s => s - 1)}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          >
                            Previous Step
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to discard your draft? All unsaved changes will be lost.")) {
                                setMosqueView("list");
                              }
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
                          >
                            Cancel Draft
                          </button>
                        )}

                        {mosqueFormStep < 5 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (mosqueFormStep === 1) {
                                if (!mosqueName.trim() || !mosqueLocation.trim()) {
                                  triggerToast("Please fill in Mosque Name and Destination.", "error");
                                  return;
                                }
                              }
                              setMosqueFormStep(s => s + 1);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                          >
                            Next Step
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest border border-brand-blue-accent/15 transition-all shadow-md cursor-pointer"
                      >
                        {editingMosqueId ? "Save Amendments" : "Publish Mosque Asset"}
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          )}


          {/* MEDIA LIBRARY TAB */}
          {activeTab === "media-library" && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                
                {/* Header & Stats & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-serif font-extrabold text-[#0F1626] tracking-wider uppercase flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-brand-blue-accent" />
                      <span>Firebase Storage Asset Vault</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Browse, copy, and retrieve all previously uploaded photos. Pasted URLs are fully durable and compatible across all CMS image inputs.
                    </p>
                  </div>
                  <button
                    onClick={loadMediaFiles}
                    disabled={isMediaLoading}
                    className="flex items-center justify-center gap-2 bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border border-brand-blue-accent/15 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isMediaLoading ? "animate-spin" : ""}`} />
                    <span>Synchronize Vault</span>
                  </button>
                </div>

                {/* Upload & Drag Drop New Asset Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Direct Upload Box */}
                  <div className="md:col-span-4 border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3 transition-colors hover:bg-slate-50 relative group">
                    <input
                      type="file"
                      id="media-library-upload-input"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleMediaUpload}
                      disabled={isUploadingMedia}
                    />
                    <div className="w-10 h-10 rounded-xl bg-brand-blue-accent/10 flex items-center justify-center text-brand-blue-accent">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Upload New Photo</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Drag-and-drop or click to browse</p>
                    </div>
                    {isUploadingMedia && (
                      <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-5 h-5 text-brand-blue-accent animate-spin" />
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Description Info card */}
                  <div className="md:col-span-8 bg-[#0F1626] rounded-2xl p-6 text-white flex flex-col justify-between border border-white/5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-brand-blue-accent/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-blue-accent" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-blue-accent">Durable Retrieval Solution</span>
                      </div>
                      <h3 className="font-serif font-bold text-sm">Where are my previous uploads?</h3>
                      <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                        When the Firebase backend was synchronized, the local browser memory (<code className="bg-white/10 px-1 rounded text-[10px] text-brand-blue-accent">localStorage</code>) was reset to initial configurations. However, all files themselves are completely safe. You can retrieve them below, copy their URL, and paste it into any custom image field.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center gap-4 text-[11px] font-mono text-brand-blue-accent">
                      <span>Total Synced Items: <strong className="text-white">{mediaFiles.length}</strong></span>
                    </div>
                  </div>

                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 px-4 py-3 rounded-2xl">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search image filename..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-[#0F1626] placeholder-slate-400 focus:outline-none focus:ring-0"
                  />
                  {mediaSearch && (
                    <button
                      onClick={() => setMediaSearch("")}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider font-mono cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Library Grid Display */}
                {isMediaLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-brand-blue-accent animate-spin" />
                    <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Querying Storage Bucket...</p>
                  </div>
                ) : filteredMediaFiles.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/20 space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No matching assets found</p>
                    <p className="text-[10px] text-slate-400">Try uploading a new photo or clearing search criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredMediaFiles.map((file) => {
                      const formattedDate = file.timeCreated 
                        ? new Date(file.timeCreated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
                        : "Unknown date";
                      
                      return (
                        <div key={file.fullPath} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-brand-blue-accent/40 transition-all">
                          {/* Image Thumbnail */}
                          <div className="aspect-square bg-slate-100 overflow-hidden relative cursor-pointer" onClick={() => setSelectedMediaUrl(file.url)}>
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="bg-white/95 text-[#0F1626] p-1.5 rounded-lg shadow hover:bg-brand-blue-accent transition-colors">
                                <Eye className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>

                          {/* File Details */}
                          <div className="p-3 space-y-1 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-[10px] font-bold text-slate-700 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[8px] font-mono text-slate-400">
                              {formattedDate}
                            </p>
                          </div>

                          {/* Action Bar */}
                          <div className="p-2 border-t border-slate-100 flex items-center justify-between gap-1 bg-white">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(file.url);
                                triggerToast("Image URL copied successfully!", "success");
                              }}
                              className="w-full bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white text-[9px] font-mono font-bold uppercase tracking-wider py-1.5 rounded-lg border border-brand-blue-accent/10 transition-colors cursor-pointer text-center"
                            >
                              Copy URL
                            </button>
                            <button
                              onClick={() => handleMediaDelete(file.fullPath)}
                              className="bg-red-50 hover:bg-red-100 text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          )}


          {/* 7. GENERAL CONFIG */}
          {activeTab === "general-config" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm max-w-3xl mx-auto animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-serif font-extrabold text-[#0F1626] uppercase tracking-wide">General Config Parameters</h2>
                <p className="text-xs text-slate-500">Manage digital assets, helpline directories, address scopes, and verified social coordinates</p>
              </div>

              {/* SECTION A: DIGITAL BRAND ASSETS */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F1626] font-bold">Brand Logo Assets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Website Logo (Header)</label>
                    <ImageUploadZone
                      imageSrc={localWebsiteLogo}
                      onChange={setLocalWebsiteLogo}
                      label="Upload Website Logo"
                      description="Displays on header navbar"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Footer Logo (Footer)</label>
                    <ImageUploadZone
                      imageSrc={localFooterLogo}
                      onChange={setLocalFooterLogo}
                      label="Upload Footer Logo"
                      description="Displays in site footer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Favicon (Shortcut Icon)</label>
                    <ImageUploadZone
                      imageSrc={localFavicon}
                      onChange={setLocalFavicon}
                      label="Upload Favicon"
                      description="Browser window icon shortcut"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: COMPANY DIRECTORIES */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F1626] font-bold">Company Information</h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Company Description (Displays in Footer)</label>
                  <textarea
                    rows={3}
                    value={localCompanyDesc}
                    onChange={(e) => setLocalCompanyDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-600 font-sans leading-relaxed text-xs"
                    placeholder="Enter company description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Official Helpline Phone</label>
                    <input
                      type="text"
                      value={localContactNumber}
                      onChange={(e) => setLocalContactNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Official Inquiry Email</label>
                    <input
                      type="text"
                      value={localEmailAddress}
                      onChange={(e) => setLocalEmailAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#0F1626] font-bold block">Display Physical Address</span>
                      <p className="text-[11px] text-slate-400">Toggle whether visitors can see the address in the footer directory</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalShowAddress(!localShowAddress)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        localShowAddress ? "bg-brand-blue-accent" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          localShowAddress ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {localShowAddress && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Physical Office Address</label>
                      <input
                        type="text"
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                        placeholder="Enter physical office address..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION C: SOCIAL COORDINATES */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F1626] font-bold">Social Media Accounts</h3>
                <p className="text-[10px] text-slate-400 font-sans -mt-2">Filled social handles are displayed as clickable icons in the footer ribbon</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Facebook Link</label>
                    <input
                      type="text"
                      value={localSocialLinks.facebook || ""}
                      onChange={(e) => setLocalSocialLinks({ ...localSocialLinks, facebook: e.target.value })}
                      placeholder="https://facebook.com/ahlancambodia"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Instagram Link</label>
                    <input
                      type="text"
                      value={localSocialLinks.instagram || ""}
                      onChange={(e) => setLocalSocialLinks({ ...localSocialLinks, instagram: e.target.value })}
                      placeholder="https://instagram.com/ahlancambodia"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Twitter / X Link</label>
                    <input
                      type="text"
                      value={localSocialLinks.twitter || ""}
                      onChange={(e) => setLocalSocialLinks({ ...localSocialLinks, twitter: e.target.value })}
                      placeholder="https://twitter.com/ahlancambodia"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">YouTube Link</label>
                    <input
                      type="text"
                      value={localSocialLinks.youtube || ""}
                      onChange={(e) => setLocalSocialLinks({ ...localSocialLinks, youtube: e.target.value })}
                      placeholder="https://youtube.com/ahlancambodia"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: CUSTOM HEAD SCRIPTS & TRACKING CODES */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F1626] font-bold">Custom Head Scripts & Tracking</h3>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Inject affiliate scripts (e.g. Stay22), Google Analytics, Facebook Pixel, or custom JavaScript directly into the website's <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-blue-accent font-mono">&lt;head&gt;</code> tag.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalCustomHeadScript(DEFAULT_CUSTOM_HEAD_SCRIPT);
                      triggerToast("Restored default Stay22 affiliate script template.", "info");
                    }}
                    className="text-[10px] font-mono font-bold text-brand-blue-accent hover:underline bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all self-start sm:self-center cursor-pointer"
                  >
                    Restore Stay22 Default
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                    Header Script / Code Block
                  </label>
                  <textarea
                    rows={8}
                    value={localCustomHeadScript}
                    onChange={(e) => setLocalCustomHeadScript(e.target.value)}
                    className="w-full bg-[#0F1626] text-emerald-400 border border-slate-700 rounded-xl p-4 outline-none focus:border-brand-blue-accent font-mono text-xs leading-relaxed shadow-inner"
                    placeholder="<script>... your custom script or tracking code here ...</script>"
                    spellCheck={false}
                  />
                  <p className="text-[10px] text-slate-400">
                    Changes take effect immediately upon saving and dynamically execute across all pages.
                  </p>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateGeneralConfig) {
                      onUpdateGeneralConfig({
                        companyDesc: localCompanyDesc,
                        contactNumber: localContactNumber,
                        emailAddress: localEmailAddress,
                        address: localAddress,
                        showAddress: localShowAddress,
                        socialLinks: localSocialLinks,
                        websiteLogo: localWebsiteLogo,
                        footerLogo: localFooterLogo,
                        favicon: localFavicon,
                        customHeadScript: localCustomHeadScript
                      });
                      triggerToast("General configurations saved and synchronized successfully!", "success");
                    }
                  }}
                  className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-3 rounded-xl font-bold font-mono text-[10px] uppercase tracking-widest transition-luxury shadow-md cursor-pointer"
                >
                  Save Brand Settings
                </button>
              </div>
            </div>
          )}


          {/* 8. HOMEPAGE SETTINGS */}
          {activeTab === "homepage-settings" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm max-w-3xl mx-auto animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-serif font-extrabold text-[#0F1626] uppercase tracking-wide">Homepage Hero & Layout Config</h2>
                <p className="text-xs text-slate-500">Edit major slogans, backdrop images slideshow, and primary introductory features</p>
              </div>

              {/* SECTION A: HERO SLOGANS */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F1626] font-bold">Hero Slogans</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Primary Hero Slogan (Serif font)</label>
                  <input
                    type="text"
                    value={localHeroTitle}
                    onChange={(e) => setLocalHeroTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-700 font-bold text-xs"
                    placeholder="e.g. Welcome to Cambodia"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Homepage Supporting Subtitle</label>
                  <textarea
                    rows={3}
                    value={localHeroSubtitle}
                    onChange={(e) => setLocalHeroSubtitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-blue-accent focus:bg-white text-slate-600 text-xs leading-relaxed"
                    placeholder="Enter short brief supporting subtitle..."
                  />
                </div>
              </div>

              {/* SECTION B: 4 HERO IMAGES (SLIDESHOW) */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F1626] font-bold">Backdrop Slideshow (4 Images)</h3>
                  <p className="text-[10px] text-slate-400">These 4 images will keep auto-changing on the homepage background every 5 seconds</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="space-y-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Hero Backdrop #{index + 1}</label>
                      <ImageUploadZone
                        imageSrc={localHeroImages[index] || ""}
                        onChange={(base64) => {
                          const updated = [...localHeroImages];
                          updated[index] = base64;
                          setLocalHeroImages(updated);
                        }}
                        label={`Upload #${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: WHY CHOOSE AHLAN CAMBODIA CARDS */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#0F1626] font-bold">"Why Choose" Feature Cards (4 Cards)</h3>
                  <p className="text-[10px] text-slate-400 font-sans">Customize the titles and detailed descriptive texts for the 4 core promotional widgets</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localWhyChooseCards.map((card, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3 shadow-inner">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-blue-accent font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-brand-blue-accent rounded-full" />
                        <span>Card #{idx + 1}</span>
                      </h4>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Card Title</label>
                        <input
                          type="text"
                          value={card.title || ""}
                          onChange={(e) => {
                            const updated = [...localWhyChooseCards];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setLocalWhyChooseCards(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-blue-accent text-slate-700 font-bold text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Card Description</label>
                        <textarea
                          rows={3}
                          value={card.desc || ""}
                          onChange={(e) => {
                            const updated = [...localWhyChooseCards];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            setLocalWhyChooseCards(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-blue-accent text-slate-600 text-xs leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateHomepageSettings) {
                      onUpdateHomepageSettings({
                        heroTitle: localHeroTitle,
                        heroSubtitle: localHeroSubtitle,
                        heroImages: localHeroImages,
                        whyChooseCards: localWhyChooseCards
                      });
                      triggerToast("Homepage layout configuration published successfully!", "success");
                    }
                  }}
                  className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-3 rounded-xl font-bold font-mono text-[10px] uppercase tracking-widest transition-luxury shadow-md"
                >
                  Save Layout Config
                </button>
              </div>
            </div>
          )}


          {/* 11. USER ACCOUNTS & PERMISSIONS (SUPER USER ONLY) */}
          {activeTab === "user-accounts" && (
            <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
              
              {/* Header Banner */}
              <div className="bg-[#0F1626] border border-brand-blue-accent/20 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 bg-brand-blue-accent/10 border border-brand-blue-accent/20 px-3 py-1 rounded-full text-[10px] font-mono text-brand-blue-accent font-bold uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Super User Access Console</span>
                    </div>
                    <h2 className="text-xl font-serif font-extrabold text-white uppercase tracking-wider">
                      User Management & Role Permissions
                    </h2>
                    <p className="text-xs text-slate-400 max-w-2xl">
                      As Super User, you can register new team members using their Gmail address, define their access functions, and manage password security.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Registered Accounts</span>
                    <span className="text-2xl font-mono font-bold text-brand-blue-accent">{cmsUsers.length}</span>
                  </div>
                </div>
              </div>

              {/* Super User Account Card & Password Update */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-serif font-bold text-[#0F1626] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-blue-accent" />
                    <span>Super User Account</span>
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Super User (Full Control)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="w-12 h-12 rounded-full bg-[#0F1626] text-brand-blue-accent border border-brand-blue-accent/20 font-serif font-bold text-lg flex items-center justify-center select-none shadow-sm uppercase shrink-0">
                      B
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-sm text-[#0F1626]">Bassamalie</h4>
                      <p className="text-[10px] font-mono text-brand-blue-accent font-bold uppercase tracking-wider">Super User</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">bassamalie@gmail.com</p>
                    </div>
                  </div>

                  {/* Super User Password Change */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!superNewPassword || superNewPassword.length < 4) {
                        triggerToast("New password must be at least 4 characters.", "error");
                        return;
                      }
                      const updated = cmsUsers.map(u => u.role === "SUPER_ADMIN" ? { ...u, password: superNewPassword } : u);
                      syncUsers(updated);
                      if (currentUser?.role === "SUPER_ADMIN") {
                        setCurrentUser({ ...currentUser, password: superNewPassword });
                      }
                      setSuperNewPassword("");
                      triggerToast("Super User password updated and saved permanently!", "success");
                    }} 
                    className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl"
                  >
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                      Update Super User Password
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={superNewPassword}
                        onChange={(e) => setSuperNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="flex-1 bg-white border border-slate-200 focus:border-brand-blue-accent rounded-xl px-3 py-2 text-xs font-mono outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                      >
                        Update
                      </button>
                    </div>
                  </form>

                </div>
              </div>

              {/* Create / Edit Curator Account Form */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#0F1626] uppercase tracking-wider flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-brand-blue-accent" />
                      <span>{editingUserId ? "Edit Curator Account Permissions" : "Add New Curator User"}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the team member's Gmail address and select allowed access functions.
                    </p>
                  </div>

                  {editingUserId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUserId(null);
                        setNewCuratorEmail("");
                        setNewCuratorName("");
                        setNewCuratorPassword("");
                        setNewCuratorPermissions(CMS_PERMISSIONS_LIST.filter(p => p.defaultAllowed).map(p => p.id));
                      }}
                      className="text-xs font-mono font-bold text-slate-500 hover:text-red-500 bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleCreateCuratorUser} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Gmail Address */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        Gmail Email Address *
                      </label>
                      <input
                        type="email"
                        value={newCuratorEmail}
                        onChange={(e) => setNewCuratorEmail(e.target.value)}
                        placeholder="e.g. curator@gmail.com"
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none text-[#0F1626] font-medium"
                      />
                    </div>

                    {/* Curator Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        Curator Full Name *
                      </label>
                      <input
                        type="text"
                        value={newCuratorName}
                        onChange={(e) => setNewCuratorName(e.target.value)}
                        placeholder="e.g. Ahmad Al-Mansoor"
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none text-[#0F1626] font-medium"
                      />
                    </div>

                    {/* Account Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        Assign Initial Password *
                      </label>
                      <input
                        type="text"
                        value={newCuratorPassword}
                        onChange={(e) => setNewCuratorPassword(e.target.value)}
                        placeholder="e.g. curator2026"
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-blue-accent focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none text-[#0F1626] font-medium"
                      />
                    </div>

                  </div>

                  {/* Access Functions Checklist */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0F1626] block">
                        Assign Accessible Feature Functions
                      </label>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {newCuratorPermissions.length} / {CMS_PERMISSIONS_LIST.length} Functions Assigned
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      {CMS_PERMISSIONS_LIST.map((perm) => {
                        const isChecked = newCuratorPermissions.includes(perm.id);
                        const isDefaultDisabled = !perm.defaultAllowed;
                        return (
                          <label 
                            key={perm.id} 
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked 
                                ? "bg-white border-brand-blue-accent/50 shadow-sm" 
                                : "bg-slate-100/60 border-slate-200 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewCuratorPermissions([...newCuratorPermissions, perm.id]);
                                } else {
                                  setNewCuratorPermissions(newCuratorPermissions.filter(id => id !== perm.id));
                                }
                              }}
                              className="w-4 h-4 text-brand-blue-accent rounded focus:ring-brand-blue-accent"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-[#0F1626] block truncate">{perm.label}</span>
                              {isDefaultDisabled && (
                                <span className="text-[8px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider inline-block mt-0.5">
                                  Disabled By Default
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    
                    <p className="text-[10px] font-sans text-slate-500 italic bg-amber-50 border border-amber-200/60 p-3 rounded-xl flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Note: By default, new users do NOT receive access to Homepage Settings, Media Library, or General Config unless explicitly checked above.</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0F1626] hover:bg-brand-blue-accent hover:text-[#0F1626] text-white px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-luxury shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{editingUserId ? "Save Updated Permissions" : "Register Curator Account"}</span>
                  </button>

                </form>
              </div>

              {/* Active Curator Users Table */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-serif font-bold text-[#0F1626] uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-blue-accent" />
                    <span>Active Curator Accounts ({cmsUsers.length})</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  {cmsUsers.map((usr) => {
                    const isSuper = usr.role === "SUPER_ADMIN";
                    return (
                      <div 
                        key={usr.id} 
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSuper 
                            ? "bg-slate-900 text-white border-brand-blue-accent/30 shadow-md" 
                            : "bg-slate-50 text-slate-800 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-full font-serif font-bold flex items-center justify-center text-sm uppercase shrink-0 ${
                            isSuper ? "bg-brand-blue-accent text-[#0F1626]" : "bg-[#0F1626] text-brand-blue-accent"
                          }`}>
                            {usr.name.charAt(0)}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm truncate">{usr.name}</h4>
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isSuper 
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                  : "bg-brand-blue-accent/15 text-brand-blue-accent border border-brand-blue-accent/20"
                              }`}>
                                {usr.role}
                              </span>
                            </div>
                            <p className={`text-[10px] font-mono truncate ${isSuper ? "text-slate-400" : "text-slate-500"}`}>
                              {usr.email} • Password: <span className="font-bold">{usr.password}</span>
                            </p>
                            {!isSuper && (
                              <p className="text-[10px] font-mono text-slate-400">
                                Access Functions: <strong className="text-brand-blue-accent">{usr.allowedTabs?.length || 0}</strong> of {CMS_PERMISSIONS_LIST.length} modules enabled
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setFoundResetUser(usr);
                              setResetStep(2);
                              setResetNewPassword("");
                              setResetConfirmPassword("");
                              setResetError(null);
                              setResetSuccessMsg(null);
                              setShowForgotPasswordModal(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                              isSuper
                                ? "bg-brand-blue-accent text-[#0F1626] hover:bg-white"
                                : "bg-slate-100 hover:bg-brand-blue-accent text-slate-700 hover:text-[#0F1626] border border-slate-200"
                            }`}
                            title={`Reset password for ${usr.name}`}
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Reset Password</span>
                          </button>

                          {!isSuper && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUserId(usr.id);
                                  setNewCuratorEmail(usr.email);
                                  setNewCuratorName(usr.name);
                                  setNewCuratorPassword(usr.password);
                                  setNewCuratorPermissions(usr.allowedTabs || []);
                                  window.scrollTo({ top: 400, behavior: "smooth" });
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white border border-slate-200 hover:border-brand-blue-accent text-slate-700 hover:text-brand-blue-accent transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Permissions</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove curator account ${usr.name} (${usr.email})?`)) {
                                    const updated = cmsUsers.filter(u => u.id !== usr.id);
                                    syncUsers(updated);
                                    triggerToast(`Removed curator account: ${usr.name}`, "info");
                                  }
                                }}
                                className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* Media Library Fullscreen Lightbox Modal */}
      {selectedMediaUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-4xl w-full bg-[#0F1626] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between text-white bg-[#0B0F19]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-brand-blue-accent uppercase tracking-widest">Image Inspector</span>
                <h4 className="text-xs font-mono truncate max-w-md" title={selectedMediaUrl}>
                  {selectedMediaUrl.split("/").pop()?.split("?")[0] || "inspect_file.png"}
                </h4>
              </div>
              <button
                onClick={() => setSelectedMediaUrl(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 min-h-[300px] sm:min-h-[450px] bg-[#070A11] flex items-center justify-center p-6 relative">
              <img
                src={selectedMediaUrl}
                alt="Fullscreen Preview"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg border border-white/5"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Footer with copy URL functionality */}
            <div className="p-4 sm:p-5 border-t border-white/5 bg-[#0B0F19] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-slate-400 mb-1 font-bold uppercase tracking-wider">Public Resource URL</p>
                <input
                  type="text"
                  readOnly
                  value={selectedMediaUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono text-brand-blue-accent outline-none"
                />
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMediaUrl);
                  triggerToast("Image URL copied successfully!", "success");
                }}
                className="bg-brand-blue-accent hover:bg-white text-[#0B0F19] px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                Copy Public URL
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full bg-[#0F1626] rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-8 h-8 animate-pulse" />
              <div>
                <h3 className="font-serif font-extrabold text-white text-base tracking-wide uppercase">Confirm Permanent Deletion</h3>
                <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">Action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you absolutely sure you want to permanently delete this file from Firebase Storage? This will release the storage bucket size, but any listings still referencing this exact image URL will break.
              <code className="block mt-3 bg-slate-950 px-2.5 py-1.5 rounded-xl text-[9px] font-mono text-brand-blue-accent break-all select-all border border-white/5">
                {deleteConfirmPath}
              </code>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmPath(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executeMediaDelete(deleteConfirmPath)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Deletion Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full bg-[#0F1626] rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-8 h-8 animate-pulse" />
              <div>
                <h3 className="font-serif font-extrabold text-white text-base tracking-wide uppercase">Delete Item Confirmation</h3>
                <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                  {itemToDelete.type.toUpperCase()} REMOVAL
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you sure you want to permanently delete <strong className="text-white font-bold">{itemToDelete.name}</strong>? This action will remove it from the live catalog and backend storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeItemDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
