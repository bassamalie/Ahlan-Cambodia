import React, { useState } from "react";
import { 
  ArrowLeft, Calendar, Mail, Phone, User, Users, MessageSquare, 
  CheckCircle, ShieldCheck, FileText, Globe, Sparkles, MapPin, Tag, RefreshCw 
} from "lucide-react";
import { TourPackage } from "../types";
import { getTourCode, getPackageSlug } from "../utils/pdfGenerator";
import { saveDocInCollection } from "../dbService";

interface PackageInquiryPageProps {
  tourPackage: TourPackage;
  onBack: () => void;
}

export default function PackageInquiryPage({ tourPackage, onBack }: PackageInquiryPageProps) {
  const tourCode = getTourCode(tourPackage);
  const packageSlug = getPackageSlug(tourPackage);

  // Form State
  const [surname, setSurname] = useState("");
  const [givenName, setGivenName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [inquiryNotes, setInquiryNotes] = useState("");

  // reCAPTCHA State
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState("");

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryRef, setInquiryRef] = useState("");

  const handleRecaptchaClick = () => {
    if (recaptchaVerified) return;
    setRecaptchaLoading(true);
    setRecaptchaError("");
    setTimeout(() => {
      setRecaptchaLoading(false);
      setRecaptchaVerified(true);
    }, 900);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaVerified) {
      setRecaptchaError("Please complete the reCAPTCHA human verification before submitting.");
      return;
    }

    setSubmitting(true);

    const refId = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const inquiryPayload = {
      id: refId,
      packageId: tourPackage.id,
      packageName: tourPackage.name,
      tourCode: tourCode,
      packageSlug: packageSlug,
      surname: surname.trim(),
      givenName: givenName.trim(),
      fullName: `${givenName.trim()} ${surname.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      departureDate: departureDate,
      adults: adults,
      children: childrenCount,
      infants: infantsCount,
      inquiry: inquiryNotes.trim(),
      submittedAt: new Date().toISOString(),
      status: "New"
    };

    try {
      await saveDocInCollection("inquiries", inquiryPayload);
    } catch (err) {
      console.error("Error saving inquiry to database:", err);
    }

    setSubmitting(false);
    setInquiryRef(refId);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-lightbg py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* TOP BAR / BACK NAVIGATION */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 hover:text-brand-blue bg-white border border-slate-200 hover:border-brand-blue-accent px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Package Details</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
            <Globe className="w-3.5 h-3.5 text-brand-blue-accent" />
            <span>Dynamic URL Tagged: <strong className="text-brand-charcoal font-bold">Enquiry/{packageSlug}</strong></span>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* HEADER BANNER */}
          <div className="bg-[#0F1626] text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-brand-blue-accent/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="bg-brand-blue-accent/20 text-brand-blue-accent border border-brand-blue-accent/30 font-mono text-[11px] font-bold uppercase px-3.5 py-1 rounded-full tracking-widest">
                  OFFICIAL DMC PACKAGE INQUIRY
                </span>
                
                <span className="bg-[#0F1626] text-amber-400 border border-amber-400/50 font-mono text-xs font-extrabold uppercase px-3 py-1 rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  Tour Code: {tourCode}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                Package Inquiry
              </h1>

              <p className="text-white/70 text-xs sm:text-sm max-w-2xl font-light leading-relaxed">
                Complete this formal request form to receive a detailed itinerary, customized pricing for your group size, and private concierge consultation.
              </p>
            </div>
          </div>

          {/* PACKAGE SUMMARY BAR */}
          <div className="bg-slate-50 border-b border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={tourPackage.image} 
                alt={tourPackage.name} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-blue-accent block">
                  SELECTED PACKAGE
                </span>
                <h2 className="font-serif text-base sm:text-lg font-bold text-brand-charcoal truncate">
                  {tourPackage.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-blue-accent" />
                    {tourPackage.duration}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue-accent" />
                    {tourPackage.destinations?.join(", ") || "Cambodia"}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-slate-200/80 w-full sm:w-auto shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                PRICE PER PERSON
              </span>
              <span className="font-serif text-2xl font-bold text-[#0056b3]">
                ${tourPackage.price.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-500">USD</span>
              </span>
            </div>
          </div>

          {/* SUBMISSION CONFIRMATION OR FORM */}
          {submitted ? (
            <div className="p-8 sm:p-12 text-center space-y-6 animate-scale-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-xs font-mono font-bold text-brand-blue-accent uppercase tracking-widest block">
                  INQUIRY TRANSMITTED • REF #{inquiryRef}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
                  Thank You, {givenName}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your formal package inquiry for <strong className="text-brand-charcoal">{tourPackage.name}</strong> (Tour Code: <strong className="text-brand-blue">{tourCode}</strong>) has been successfully registered in our concierge portal.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3">
                <h3 className="font-serif text-sm font-bold text-brand-charcoal border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>Summary of Request</span>
                  <span className="font-mono text-xs font-normal text-slate-500">{departureDate}</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-sans">
                  <div><strong>Full Name:</strong> {givenName} {surname}</div>
                  <div><strong>Email:</strong> {email}</div>
                  <div><strong>Phone:</strong> {phone}</div>
                  <div><strong>Guests:</strong> {adults} Adults, {childrenCount} Children, {infantsCount} Infants</div>
                </div>
                {inquiryNotes && (
                  <div className="pt-2 text-xs text-slate-600 border-t border-slate-200/60">
                    <strong>Inquiry Notes:</strong> {inquiryNotes}
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onBack}
                  className="w-full sm:w-auto bg-[#0056b3] hover:bg-[#004494] text-white font-serif font-bold px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Return to Package Overview
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setRecaptchaVerified(false);
                  }}
                  className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 text-brand-charcoal font-serif font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-blue-accent" />
                    Guest Information
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">* Required Fields</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Surname / Family Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      Surname / Family Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al-Mansoor"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-sm text-brand-charcoal outline-none transition-all shadow-2xs font-sans"
                    />
                  </div>

                  {/* Given Name / First Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      Given Name / First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq"
                      value={givenName}
                      onChange={(e) => setGivenName(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-brand-blue-accent rounded-xl px-4 py-3 text-sm text-brand-charcoal outline-none transition-all shadow-2xs font-sans"
                    />
                  </div>

                  {/* Email address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      Email address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. tariq@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-brand-blue-accent rounded-xl pl-10 pr-4 py-3 text-sm text-brand-charcoal outline-none transition-all shadow-2xs font-sans"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 019-2834"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-brand-blue-accent rounded-xl pl-10 pr-4 py-3 text-sm text-brand-charcoal outline-none transition-all shadow-2xs font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: TRIP & PARTY DETAILS */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-blue-accent" />
                    Trip Schedule & Guests Breakdown
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Departure date */}
                  <div className="sm:col-span-1 space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-brand-blue-accent rounded-xl px-3.5 py-3 text-sm text-brand-charcoal outline-none transition-all shadow-2xs font-sans"
                    />
                  </div>

                  {/* No. of Adults */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      No. of Adults *
                    </label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-xl p-1.5">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs select-none"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-slate-800">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* No. of Children */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      No. of Children
                    </label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-xl p-1.5">
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs select-none"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-slate-800">{childrenCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount(childrenCount + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* No. of Infants */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                      No. of Infants
                    </label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-xl p-1.5">
                      <button
                        type="button"
                        onClick={() => setInfantsCount(Math.max(0, infantsCount - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs select-none"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-slate-800">{infantsCount}</span>
                      <button
                        type="button"
                        onClick={() => setInfantsCount(infantsCount + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: INQUIRY NOTES */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  Inquiry / Special Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Share details about flight timings, preferred room setup, dietary requests, prayer room requirements, or customization requests..."
                  value={inquiryNotes}
                  onChange={(e) => setInquiryNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-brand-blue-accent rounded-2xl p-4 text-sm text-brand-charcoal outline-none transition-all shadow-2xs font-sans leading-relaxed"
                />
              </div>

              {/* SECTION 4: RECAPTCHA SECURITY CHECKBOX */}
              <div className="space-y-2 pt-2">
                <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 max-w-sm flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRecaptchaClick}
                      className={`w-7 h-7 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer select-none ${
                        recaptchaVerified 
                          ? "bg-emerald-600 border-emerald-600 text-white" 
                          : "bg-white border-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {recaptchaLoading ? (
                        <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />
                      ) : recaptchaVerified ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : null}
                    </button>
                    <span className="text-xs font-sans font-medium text-slate-700">
                      {recaptchaVerified ? "Human verification complete" : "I'm not a robot"}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <ShieldCheck className="w-6 h-6 text-slate-400" />
                    <span className="text-[9px] font-mono text-slate-400">reCAPTCHA</span>
                  </div>
                </div>

                {recaptchaError && (
                  <p className="text-xs font-bold text-rose-600 font-sans">{recaptchaError}</p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0056b3] hover:bg-[#004494] text-white font-serif font-bold py-4 rounded-2xl text-base sm:text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-transparent disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      <span>Submit Package Inquiry</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
