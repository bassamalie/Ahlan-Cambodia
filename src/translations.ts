export type LanguageCode = "EN" | "MS" | "AR" | "KH";

export interface Translations {
  // Navigation
  destinations: string;
  experiences: string;
  packages: string;
  halalDining: string;
  hotels: string;
  mosques: string;
  inspiration: string;
  adminCms: string;
  savedItems: string;
  
  // Hero
  kingdomTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  searchBtn: string;
  quickQuoteBtn: string;
  interactiveMapBtn: string;
  prayerTimesBtn: string;

  // Section Headers
  destinationsTitle: string;
  destinationsSubtitle: string;
  packagesTitle: string;
  packagesSubtitle: string;
  experiencesTitle: string;
  experiencesSubtitle: string;
  diningTitle: string;
  diningSubtitle: string;
  mosquesTitle: string;
  mosquesSubtitle: string;
  guidesTitle: string;
  guidesSubtitle: string;
  whyChooseTitle: string;
  whyChooseSubtitle: string;

  // Actions & Badges
  exploreAll: string;
  viewDetails: string;
  bookNow: string;
  inquireNow: string;
  halalCertified: string;
  prayerFacilities: string;
  fromPrice: string;
  perPerson: string;
  perNight: string;
  rating: string;
  allRegions: string;
  
  // Detail Page Keys
  back: string;
  home: string;
  savePackage: string;
  saved: string;
  share: string;
  linkCopied: string;
  atAGlance: string;
  packageHighlights: string;
  itinerary: string;
  inclusions: string;
  exclusions: string;
  customizePackage: string;
  downloadPdf: string;
  daysNights: string;
  overview: string;
  location: string;
  amenities: string;
  similarPackages: string;
  featuredHotels: string;
  verifiedDining: string;
  contactAgent: string;
  highlights: string;
  gallery: string;
  reviews: string;

  // Footer
  footerDesc: string;
  quickLinks: string;
  contactUs: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  emailPlaceholder: string;
  subscribeBtn: string;
  allRightsReserved: string;

  // Common UI
  close: string;
  backToHome: string;
  selectLanguage: string;
  filters: string;
  clearFilters: string;
  sortBy: string;
}

export const translations: Record<LanguageCode, Translations> = {
  EN: {
    destinations: "DESTINATIONS",
    experiences: "EXPERIENCES",
    packages: "PACKAGES",
    halalDining: "HALAL DINING",
    hotels: "HOTELS",
    mosques: "MOSQUES",
    inspiration: "INSPIRATION",
    adminCms: "ADMIN CMS",
    savedItems: "Saved Items",

    kingdomTagline: "KINGDOM OF WONDER",
    heroTitle: "Curated Halal Luxury Travel in Cambodia",
    heroSubtitle: "Empowering Muslim Travelers across Siem Reap, Phnom Penh & Beyond with 100% Certified Halal Dining, Private Prayer Spaces & Bespoke Journeys.",
    searchPlaceholder: "Search mosques, halal food, hotels, tours in Cambodia...",
    searchBtn: "Search",
    quickQuoteBtn: "Instant Quote",
    interactiveMapBtn: "Interactive Map",
    prayerTimesBtn: "Prayer Times",

    destinationsTitle: "Top Halal Destinations in Cambodia",
    destinationsSubtitle: "Explore ancient temples, bustling capital riverfronts, and serene tropical islands.",
    packagesTitle: "Bespoke Halal Tour Packages",
    packagesSubtitle: "Private Muslim-friendly itineraries with dedicated prayer breaks and certified halal dining.",
    experiencesTitle: "Authentic Curated Experiences",
    experiencesSubtitle: "Unforgettable cultural encounters, river cruises, and artisan silk weaving tours.",
    diningTitle: "Featured Certified Halal Dining",
    diningSubtitle: "Savor authentic Cambodian Khmer flavors and international Muslim cuisines.",
    mosquesTitle: "Sacred Mosques & Prayer Spaces",
    mosquesSubtitle: "Historical places of worship and accessible prayer facilities for travelers.",
    guidesTitle: "Curated Travel Guides & Insights",
    guidesSubtitle: "Essential travel advice, prayer etiquette, and local Muslim heritage stories.",
    whyChooseTitle: "Why Choose Ahlan Cambodia",
    whyChooseSubtitle: "Uncompromising quality, genuine Muslim hospitality, and authentic local expertise.",

    exploreAll: "Explore All",
    viewDetails: "View Details",
    bookNow: "Book Now",
    inquireNow: "Inquire Now",
    halalCertified: "100% Halal Certified",
    prayerFacilities: "Prayer Facilities",
    fromPrice: "From",
    perPerson: "per guest",
    perNight: "per night",
    rating: "Rating",
    allRegions: "All Regions",

    back: "Back",
    home: "Home",
    savePackage: "Save Package",
    saved: "Saved",
    share: "Share",
    linkCopied: "Link Copied!",
    atAGlance: "At a Glance",
    packageHighlights: "Package Highlights",
    itinerary: "Itinerary",
    inclusions: "Inclusions",
    exclusions: "Exclusions",
    customizePackage: "Customize Package",
    downloadPdf: "Download PDF",
    daysNights: "Days / Nights",
    overview: "Overview",
    location: "Location",
    amenities: "Amenities",
    similarPackages: "Recommended Packages",
    featuredHotels: "Featured Luxury Hotels",
    verifiedDining: "Verified Halal Dining",
    contactAgent: "Contact Travel Specialist",
    highlights: "Highlights",
    gallery: "Gallery",
    reviews: "Guest Reviews",

    footerDesc: "Cambodia's premier luxury Halal travel portal. Tailored itineraries, verified Halal dining, and authentic heritage experiences.",
    quickLinks: "Quick Navigation",
    contactUs: "Contact Us",
    newsletterTitle: "Join Our Halal Travel Club",
    newsletterSubtitle: "Receive exclusive luxury offers, seasonal guides, and prayer timetable updates.",
    emailPlaceholder: "Enter your email address...",
    subscribeBtn: "Subscribe",
    allRightsReserved: "All rights reserved. Ahlan Cambodia Halal Travel.",

    close: "Close",
    backToHome: "Back to Home",
    selectLanguage: "Language",
    filters: "Filters",
    clearFilters: "Clear Filters",
    sortBy: "Sort By"
  },

  MS: {
    destinations: "DESTINASI",
    experiences: "PENGALAMAN",
    packages: "PAKEJ",
    halalDining: "MAKANAN HALAL",
    hotels: "HOTEL",
    mosques: "MASJID",
    inspiration: "INSPIRASI",
    adminCms: "ADMIN CMS",
    savedItems: "Item Disimpan",

    kingdomTagline: "KERAJAAN KEAJAIBAN",
    heroTitle: "Pelancongan Halal Mewah di Kemboja",
    heroSubtitle: "Memperkasakan Pelancong Muslim di Siem Reap, Phnom Penh & Lain-lain dengan Makanan Halal 100% Disahkan, Ruang Solat Peribadi & Perjalanan Khas.",
    searchPlaceholder: "Cari masjid, makanan halal, hotel, pakej di Kemboja...",
    searchBtn: "Cari",
    quickQuoteBtn: "Sebutharga Segera",
    interactiveMapBtn: "Peta Interaktif",
    prayerTimesBtn: "Waktu Solat",

    destinationsTitle: "Destinasi Halal Utama di Kemboja",
    destinationsSubtitle: "Jelajahi candi purba, tebing sungai ibu kota yang meriah, dan pulau tropika yang tenang.",
    packagesTitle: "Pakej Pelancongan Halal Khas",
    packagesSubtitle: "Laluan perjalanan mesra Muslim dengan waktu solat khas dan makanan halal disahkan.",
    experiencesTitle: "Pengalaman Teratur Autentik",
    experiencesSubtitle: "Kenangan budaya indah, pelayaran sungai, dan bengkel tenunan sutera tempatan.",
    diningTitle: "Sajian Halal Disahkan Pilihan",
    diningSubtitle: "Nikmati masakan asli Khmer Kemboja dan sajian Muslim antarabangsa.",
    mosquesTitle: "Masjid & Ruang Solat Suci",
    mosquesSubtitle: "Tempat ibadah bersejarah dan kemudahan solat yang selesa untuk pelancong.",
    guidesTitle: "Panduan Pelancongan & Wawasan",
    guidesSubtitle: "Nasihat perjalanan penting, adab solat, dan kisah warisan Muslim tempatan.",
    whyChooseTitle: "Mengapa Memilih Ahlan Cambodia",
    whyChooseSubtitle: "Kualiti cemerlang, kesantunan Muslim sejati, dan kepakaran tempatan yang sah.",

    exploreAll: "Jelajahi Semua",
    viewDetails: "Lihat Butiran",
    bookNow: "Tempah Sekarang",
    inquireNow: "Tanya Sekarang",
    halalCertified: "Disahkan Halal 100%",
    prayerFacilities: "Kemudahan Solat",
    fromPrice: "Dari",
    perPerson: "setiap tetamu",
    perNight: "semalam",
    rating: "Penilaian",
    allRegions: "Semua Wilayah",

    back: "Kembali",
    home: "Laman Utama",
    savePackage: "Simpan Pakej",
    saved: "Tersimpan",
    share: "Kongsi",
    linkCopied: "Pautan Dicipta!",
    atAGlance: "Sepintas Lalu",
    packageHighlights: "Sorotan Pakej",
    itinerary: "Atur Cara",
    inclusions: "Termasuk",
    exclusions: "Tidak Termasuk",
    customizePackage: "Sesuaikan Pakej",
    downloadPdf: "Muat Turun PDF",
    daysNights: "Hari / Malam",
    overview: "Gambaran Keseluruhan",
    location: "Lokasi",
    amenities: "Kemudahan",
    similarPackages: "Pakej Disyorkan",
    featuredHotels: "Hotel Mewah Pilihan",
    verifiedDining: "Sajian Halal Disahkan",
    contactAgent: "Hubungi Pakar Pelancongan",
    highlights: "Sorotan",
    gallery: "Galeri",
    reviews: "Ulasan Tetamu",

    footerDesc: "Portal pelancongan Halal mewah utama Kemboja. Pakej khas, makanan Halal disahkan, dan pengalaman warisan autentik.",
    quickLinks: "Pautan Pantas",
    contactUs: "Hubungi Kami",
    newsletterTitle: "Sertai Kelab Pelancongan Halal Kami",
    newsletterSubtitle: "Dapatkan tawaran eksklusif, panduan musim, dan kemaskini jadual waktu solat.",
    emailPlaceholder: "Masukkan alamat e-mel anda...",
    subscribeBtn: "Langgan",
    allRightsReserved: "Hak cipta terpelihara. Ahlan Cambodia Halal Travel.",

    close: "Tutup",
    backToHome: "Kembali ke Halaman Utama",
    selectLanguage: "Bahasa",
    filters: "Penapis",
    clearFilters: "Kosongkan Penapis",
    sortBy: "Susun Mengikut"
  },

  AR: {
    destinations: "الوجهات",
    experiences: "التجارب",
    packages: "الباقات",
    halalDining: "مطاعم حلال",
    hotels: "الفنادق",
    mosques: "المساجد",
    inspiration: "إلهام السفر",
    adminCms: "لوحة التحكم",
    savedItems: "المحفوظات",

    kingdomTagline: "مملكة العجائب",
    heroTitle: "السفر الحلال الفاخر في كمبوديا",
    heroSubtitle: "تمكين المسافرين المسلمين عبر سيم ريب، بنوم بنه وما ورائهما مع وجبات حلال معتمدة 100٪، ومساحات صلاة خاصة، ورحلات مخصصة.",
    searchPlaceholder: "ابحث عن المساجد، الطعام الحلال، الفنادق، والجولات في كمبوديا...",
    searchBtn: "بحث",
    quickQuoteBtn: "عرض سعر فوري",
    interactiveMapBtn: "الخريطة التفاعلية",
    prayerTimesBtn: "مواقيت الصلاة",

    destinationsTitle: "أبرز الوجهات الحلال في كمبوديا",
    destinationsSubtitle: "استكشف المعابد القديمة، واجهات الأنهار بالعاصمة، والجزائر الاستوائية الهادئة.",
    packagesTitle: "باقات جولات حلال مخصصة",
    packagesSubtitle: "برامج سياحية خاصة تناسب المسلمين مع أوقات مخصصة للصلاة ومطاعم حلال معتمدة.",
    experiencesTitle: "تجارب أصيلة مميزة",
    experiencesSubtitle: "لقاءات ثقافية لا تُنسى، رحلات نهارية نهرية، وورش عمل حياكة الحرير التقليدي.",
    diningTitle: "مطاعم حلال معتمدة مختارة",
    diningSubtitle: "استمتع بالنكهات الكمبودية الخميرية الأصيلة والأطباق الإسلامية العالمية.",
    mosquesTitle: "المساجد والمصليات المقدسة",
    mosquesSubtitle: "دور عبادة تاريخية ومرافق صلاة مريحة ومتاحة للمسافرين.",
    guidesTitle: "أدلة ورؤى سفر مميزة",
    guidesSubtitle: "نصائح سفر جوهرية، آداب الصلاة، وقصص التراث الإسلامي المحلي.",
    whyChooseTitle: "لماذا تختار أهلاً كمبوديا",
    whyChooseSubtitle: "جودة لا تهاون فيها، ضيافة إسلامية أصيلة، وخبرة محلية موثوقة.",

    exploreAll: "استكشف الكل",
    viewDetails: "عرض التفاصيل",
    bookNow: "احجز الآن",
    inquireNow: "استفسر الآن",
    halalCertified: "معتمد حلال 100٪",
    prayerFacilities: "مرافق الصلاة",
    fromPrice: "من",
    perPerson: "لكل ضيف",
    perNight: "لكل ليلة",
    rating: "التقييم",
    allRegions: "جميع المناطق",

    back: "رجوع",
    home: "الرئيسية",
    savePackage: "حفظ الباقة",
    saved: "محفوظ",
    share: "مشاركة",
    linkCopied: "تم نسخ الرابط!",
    atAGlance: "نظرة عامة",
    packageHighlights: "أبرز مميزات الباقة",
    itinerary: "جدول الرحلة",
    inclusions: "شامل",
    exclusions: "غير شامل",
    customizePackage: "تخصيص الباقة",
    downloadPdf: "تحميل PDF",
    daysNights: "أيام / ليالي",
    overview: "نظرة عامة",
    location: "الموقع",
    amenities: "المرافق",
    similarPackages: "باقات موصى بها",
    featuredHotels: "فنادق فاخرة مميزة",
    verifiedDining: "مطاعم حلال معتمدة",
    contactAgent: "تواصل مع خبير السفر",
    highlights: "أبرز المعالم",
    gallery: "معرض الصور",
    reviews: "مراجعات الضيوف",

    footerDesc: "البوابة السياحية الحلال الفاخرة الأولى في كمبوديا. رحلات مخصصة، وجبات حلال موثقة، وتجارب تراثية أصيلة.",
    quickLinks: "روابط سريعة",
    contactUs: "اتصل بنا",
    newsletterTitle: "انضم إلى نادي السفر الحلال",
    newsletterSubtitle: "احصل على عروض حصرية، أدلة موسيقية، وتحديثات مواقيت الصلاة.",
    emailPlaceholder: "أدخل بريدك الإلكتروني...",
    subscribeBtn: "اشتراك",
    allRightsReserved: "جميع الحقوق محفوظة. أهلاً كمبوديا للسياحة الحلال.",

    close: "إغلاق",
    backToHome: "العودة للرئيسية",
    selectLanguage: "اللغة",
    filters: "تصفية",
    clearFilters: "إلغاء التصفية",
    sortBy: "ترتيب حسب"
  },

  KH: {
    destinations: "គោលដៅ",
    experiences: "បទពិសោធន៍",
    packages: "កញ្ចប់ទេសចរណ៍",
    halalDining: "អាហារហាឡាល់",
    hotels: "សណ្ឋាគារ",
    mosques: "វិហារឥស្លាម",
    inspiration: "ការបំផុសគំនិត",
    adminCms: "ផ្ទាំងគ្រប់គ្រង",
    savedItems: "វត្ថុដែលបានរក្សាទុក",

    kingdomTagline: "ព្រះរាជាណាចក្រអស្ចារ្យ",
    heroTitle: "ការធ្វើដំណើរហាឡាល់ប្រណីតនៅកម្ពុជា",
    heroSubtitle: "ពង្រឹងសមត្ថភាពអ្នកធ្វើដំណើរកាន់សាសនាឥស្លាមនៅសៀមរាប ភ្នំពេញ និងលើសពីនេះ ជាមួយអាហារហាឡាល់ ១០០% កន្លែងថ្វាយបង្គំផ្ទាល់ខ្លួន និងការធ្វើដំណើរកម្រិតខ្ពស់។",
    searchPlaceholder: "ស្វែងរកវិហារឥស្លាម អាហារហាឡាល់ សណ្ឋាគារ ទេសចរណ៍នៅកម្ពុជា...",
    searchBtn: "ស្វែងរក",
    quickQuoteBtn: "ការប៉ាន់ប្រមាណតម្លៃ",
    interactiveMapBtn: "ផែនទីអន្តរកម្ម",
    prayerTimesBtn: "ម៉ោងថ្វាយបង្គំ",

    destinationsTitle: "គោលដៅហាឡាល់កំពូលនៅកម្ពុជា",
    destinationsSubtitle: "រុករកប្រាសាទបុរាណ ឆ្នេរទន្លេរាជធានី និងកោះត្រពាំងដ៏ស្រស់ស្អាត។",
    packagesTitle: "កញ្ចប់ទេសចរណ៍ហាឡាល់",
    packagesSubtitle: "កម្មវិធីធ្វើដំណើរសម្រាប់អ្នកកាន់សាសនាឥស្លាម ជាមួយម៉ោងថ្វាយបង្គំ និងអាហារហាឡាល់។",
    experiencesTitle: "បទពិសោធន៍ដ៏ពិតប្រាកដ",
    experiencesSubtitle: "ការជួបជុំវប្បធម៌ដ៏អស្ចារ្យ ការទស្សនាតាមទូក និងការត្បាញសូត្របុរាណ។",
    diningTitle: "អាហារដ្ឋានហាឡាល់ដែលបានបញ្ជាក់",
    diningSubtitle: "ភ្លក់រសជាតិអាហារខ្មែរពិតៗ និងអាហារឥស្លាមអន្តរជាតិ។",
    mosquesTitle: "វិហារឥស្លាម និងកន្លែងថ្វាយបង្គំ",
    mosquesSubtitle: "ទីកន្លែងសក្ការបូជាប្រវត្តិសាស្ត្រ និងកន្លែងថ្វាយបង្គំដ៏មានផាសុកភាព។",
    guidesTitle: "មគ្គុទ្ទេសក៍ទេសចរណ៍ និងព័ត៌មានយល់ដឹង",
    guidesSubtitle: "ការណែនាំធ្វើដំណើរ ការអនុវត្តថ្វាយបង្គំ និងរឿងរ៉ាវបេតិកភណ្ឌឥស្លាម។",
    whyChooseTitle: "ហេតុអ្វីជ្រើសរើស Ahlan Cambodia",
    whyChooseSubtitle: "គុណភាពខ្ពស់បំផុត ការស្វាគមន៍បែបឥស្លាមដ៏ស្មោះស្ម័គ្រ និងជំនាញក្នុងស្រុក។",

    exploreAll: "រុករកទាំងអស់",
    viewDetails: "មើលព័ត៌មានលម្អិត",
    bookNow: "កក់ឥឡូវនេះ",
    inquireNow: "សាកសួរឥឡូវនេះ",
    halalCertified: "បញ្ជាក់ហាឡាល់ ១០០%",
    prayerFacilities: "កន្លែងថ្វាយបង្គំ",
    fromPrice: "ចាប់ពី",
    perPerson: "ក្នុងម្នាក់",
    perNight: "ក្នុងមួយយប់",
    rating: "ការវាយតម្លៃ",
    allRegions: "តំបន់ទាំងអស់",

    back: "ត្រឡប់ក្រោយ",
    home: "ទំព័រដើម",
    savePackage: "រក្សាទុកកញ្ចប់",
    saved: "បានរក្សាទុក",
    share: "ចែករំលែក",
    linkCopied: "បានចម្លងតំណ!",
    atAGlance: "ទិដ្ឋភាពទូទៅ",
    packageHighlights: "ចំណុចសំខាន់ៗនៃកញ្ចប់",
    itinerary: "កម្មវិធីធ្វើដំណើរ",
    inclusions: "រួមបញ្ចូល",
    exclusions: "មិនរាប់បញ្ចូល",
    customizePackage: "កែសម្រួលកញ្ចប់",
    downloadPdf: "ទាញយក PDF",
    daysNights: "ថ្ងៃ / យប់",
    overview: "ទិដ្ឋភាពទូទៅ",
    location: "ទីតាំង",
    amenities: "បរិក្ខារ",
    similarPackages: "កញ្ចប់ដែលបានណែនាំ",
    featuredHotels: "សណ្ឋាគារប្រណីត",
    verifiedDining: "អាហារដ្ឋានហាឡាល់ដែលបានបញ្ជាក់",
    contactAgent: "ទំនាក់ទំនងអ្នកជំនាញទេសចរណ៍",
    highlights: "ចំណុចសំខាន់ៗ",
    gallery: "កម្រងរូបភាព",
    reviews: "ការវាយតម្លៃរបស់ភ្ញៀវ",

    footerDesc: "គេហទំព័រទេសចរណ៍ហាឡាល់ប្រណីតឈានមុខគេនៅកម្ពុជា។ កម្មវិធីធ្វើដំណើរពិសេស អាហារហាឡាល់ និងបទពិសោធន៍បេតិកភណ្ឌ។",
    quickLinks: "តំណភ្ជាប់រហ័ស",
    contactUs: "ទំនាក់ទំនងយើងខ្ញុំ",
    newsletterTitle: "ចូលរួមជាមួយក្លឹបទេសចរណ៍ហាឡាល់",
    newsletterSubtitle: "ទទួលការផ្តល់ជូនពិសេស មគ្គុទ្ទេសក៍តាមរដូវ និងព័ត៌មានម៉ោងថ្វាយបង្គំ។",
    emailPlaceholder: "បញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក...",
    subscribeBtn: "ជាវ",
    allRightsReserved: "រក្សាសិទ្ធិគ្រប់យ៉ាង។ Ahlan Cambodia Halal Travel។",

    close: "បិទ",
    backToHome: "ត្រឡប់ទៅទំព័រដើម",
    selectLanguage: "ភាសា",
    filters: "តម្រង",
    clearFilters: "សម្អាតតម្រង",
    sortBy: "តម្រៀបតាម"
  }
};

export const languagesList: { code: LanguageCode; name: string; nativeName: string; flag: string }[] = [
  { code: "EN", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "MS", name: "Melayu", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "AR", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "KH", name: "Khmer", nativeName: "ខ្មែរ", flag: "🇰🇭" }
];

// Entity Title & Phrase Dictionary Mappings
const phraseMap: Record<string, Record<LanguageCode, string>> = {
  // Tour Package titles
  "Discover Cambodia 5D4N Muslim-Friendly Tour": {
    EN: "Discover Cambodia 5D4N Muslim-Friendly Tour",
    MS: "Jelajahi Kemboja 5Hari 4Malam Pakej Mesra Muslim",
    AR: "اكتشف كمبوديا 5 أيام 4 ليالي جولة سياحية حلال للمسلمين",
    KH: "ទស្សនាកម្ពុជា ៥ថ្ងៃ ៤យប់ កញ្ចប់ទេសចរណ៍ហាឡាល់"
  },
  "Grand Cambodia 7D6N Muslim Heritage & Island Sanctuary": {
    EN: "Grand Cambodia 7D6N Muslim Heritage & Island Sanctuary",
    MS: "Kemboja Agung 7Hari 6Malam Warisan Muslim & Pulau Peranginan",
    AR: "كمبوديا الكبرى 7 أيام 6 ليالي التراث الإسلامي ومحمية الجزر",
    KH: "កម្ពុជាដ៏អស្ចារ្យ ៧ថ្ងៃ ៦យប់ បេតិកភណ្ឌឥស្លាម និងកោះរមណីយដ្ឋាន"
  },
  "Phnom Penh & Siem Reap 4D3N Cultural Classic": {
    EN: "Phnom Penh & Siem Reap 4D3N Cultural Classic",
    MS: "Phnom Penh & Siem Reap 4Hari 3Malam Klasik Kebudayaan",
    AR: "بنوم بنه وسيم ريب 4 أيام 3 ليالي الكلاسيكية الثقافية",
    KH: "ភ្នំពេញ និងសៀមរាប ៤ថ្ងៃ ៣យប់ វប្បធម៌ក្លាសិក"
  },
  "Siem Reap 3D2N Angkor Wat Express Halal Gateway": {
    EN: "Siem Reap 3D2N Angkor Wat Express Halal Gateway",
    MS: "Siem Reap 3Hari 2Malam Percutian Halal Ekspres Angkor Wat",
    AR: "سيم ريب 3 أيام وليلتين رحلة أنغكور وات السريعة الحلال",
    KH: "សៀមរាប ៣ថ្ងៃ ២យប់ អង្គរវត្តអេកប្រេស"
  },

  // Descriptions & Briefs
  "Discover Cambodia's treasures with Angkor Wat, Tonlé Sap Lake, floating villages, vibrant Siem Reap, and historic Phnom Penh, where culture, history, and local charm await.": {
    EN: "Discover Cambodia's treasures with Angkor Wat, Tonlé Sap Lake, floating villages, vibrant Siem Reap, and historic Phnom Penh, where culture, history, and local charm await.",
    MS: "Terokai keindahan Kemboja dengan Angkor Wat, Tasik Tonle Sap, kampung terapung, Siem Reap yang meriah, dan Phnom Penh yang bersejarah.",
    AR: "اكتشف كنز كمبوديا مع أنغكور وات، وبحيرة تونلي ساب، والقرى العائمة، وسيم ريب النابضة بالحياة، وبنوم بنه التاريخية حيث تتجلى الثقافة والتاريخ والتراث الحلال.",
    KH: "ស្វែងរកសម្បត្តិរបស់ប្រទេសកម្ពុជាជាមួយអង្គរវត្ត បឹងទន្លេសាប ភូមិបណ្ដែតទឹក សៀមរាប និងភ្នំពេញប្រវត្តិសាស្ត្រ។"
  },
  "An epic multi-city journey combining the wonders of Angkor Wat, Cham Muslim heritage along the Mekong, and private island relaxation in Sihanoukville.": {
    EN: "An epic multi-city journey combining the wonders of Angkor Wat, Cham Muslim heritage along the Mekong, and private island relaxation in Sihanoukville.",
    MS: "Perjalanan hebat merangkumi keajaiban Angkor Wat, warisan Muslim Cham di sepanjang Mekong, dan percutian pulau peribadi di Sihanoukville.",
    AR: "رحلة ملحمية عبر عدة مدن تجمع بين عجائب أنغكور وات، وتراث شام المسلم على طول نهر ميكونغ، والاسترخاء في جزيرة خاصة بسيهانوكفيل.",
    KH: "ការធ្វើដំណើរដ៏អស្ចារ្យដែលបូកបញ្ចូលនូវអព្ភូតហេតុនៃអង្គរវត្ត បេតិកភណ្ឌឥស្លាមចាម និងការសម្រាកកាយនៅលើកោះ។"
  },

  // Destination names
  "Siem Reap": { EN: "Siem Reap", MS: "Siem Reap", AR: "سيم ريب", KH: "សៀមរាប" },
  "Phnom Penh": { EN: "Phnom Penh", MS: "Phnom Penh", AR: "بنوم بنه", KH: "ភ្នំពេញ" },
  "Sihanoukville & Islands": { EN: "Sihanoukville & Islands", MS: "Sihanoukville & Kepulauan", AR: "سيهانوكفيل والجزر", KH: "ក្រុងព្រះសីហនុ និងកោះ" },
  "Battambang": { EN: "Battambang", MS: "Battambang", AR: "باتامبانغ", KH: "បាត់ដំបង" },
  "Kampot & Kep": { EN: "Kampot & Kep", MS: "Kampot & Kep", AR: "كامبوت وكيب", KH: "កំពត និងកែប" },
  "Mondulkiri": { EN: "Mondulkiri", MS: "Mondulkiri", AR: "موندولكيري", KH: "មណ្ឌលគិរី" },

  // Common phrases & tags
  "Cultural Exploration & Iconic Landmarks": {
    EN: "Cultural Exploration & Iconic Landmarks",
    MS: "Penerokaan Budaya & Mercu Tanda Ikonik",
    AR: "استكشاف ثقافي ومعالم بارزة",
    KH: "ការរុករកវប្បធម៌ និងទីសក្ការបូជា"
  },
  "100% Certified Halal Dining": {
    EN: "100% Certified Halal Dining",
    MS: "Sajian Halal Disahkan 100%",
    AR: "وجبات حلال معتمدة 100%",
    KH: "អាហារដ្ឋានហាឡាល់ដែលបានបញ្ជាក់ ១០០%"
  },
  "Private Prayer Spaces": {
    EN: "Private Prayer Spaces",
    MS: "Ruang Solat Peribadi",
    AR: "مساحات صلاة خاصة",
    KH: "កន្លែងថ្វាយបង្គំផ្ទាល់ខ្លួន"
  }
};

/**
 * Utility helper to get localized text for any dynamic content string
 */
export function getLocalizedText(text: string | undefined | null, lang: LanguageCode): string {
  if (!text) return "";
  if (lang === "EN") return text;

  const trimmed = text.trim();
  
  // Check exact map
  if (phraseMap[trimmed] && phraseMap[trimmed][lang]) {
    return phraseMap[trimmed][lang];
  }

  // Look for partial sentence or phrase matches
  let result = trimmed;

  // Day pattern translation e.g. "Day 1: Arrival in Phnom Penh"
  if (/^Day\s*(\d+)/i.test(result)) {
    if (lang === "MS") result = result.replace(/^Day\s*(\d+)/i, "Hari $1");
    if (lang === "AR") result = result.replace(/^Day\s*(\d+)/i, "اليوم $1");
    if (lang === "KH") result = result.replace(/^Day\s*(\d+)/i, "ថ្ងៃទី $1");
  }

  // Common keywords replacement if lang is AR
  if (lang === "AR") {
    result = result
      .replace(/\bDays\b/gi, "أيام")
      .replace(/\bNights\b/gi, "ليالي")
      .replace(/\bHalal Certified\b/gi, "حلال معتمد")
      .replace(/\bHalal Dining\b/gi, "مطاعم حلال")
      .replace(/\bMuslim-Friendly\b/gi, "مناسب للمسلمين")
      .replace(/\bPrayer Facilities\b/gi, "مرافق الصلاة")
      .replace(/\bBreakfast\b/gi, "الإفطار")
      .replace(/\bLunch\b/gi, "الغداء")
      .replace(/\bDinner\b/gi, "العشاء")
      .replace(/\bTour\b/gi, "جولة")
      .replace(/\bPackage\b/gi, "باقة")
      .replace(/\bHotel\b/gi, "فندق")
      .replace(/\bMosque\b/gi, "مسجد");
  } else if (lang === "MS") {
    result = result
      .replace(/\bDays\b/gi, "Hari")
      .replace(/\bNights\b/gi, "Malam")
      .replace(/\bHalal Certified\b/gi, "Disahkan Halal")
      .replace(/\bHalal Dining\b/gi, "Makanan Halal")
      .replace(/\bMuslim-Friendly\b/gi, "Mesra Muslim")
      .replace(/\bPrayer Facilities\b/gi, "Kemudahan Solat")
      .replace(/\bBreakfast\b/gi, "Sarapan")
      .replace(/\bLunch\b/gi, "Makan Tengah Hari")
      .replace(/\bDinner\b/gi, "Makan Malam")
      .replace(/\bTour\b/gi, "Lawatan")
      .replace(/\bPackage\b/gi, "Pakej")
      .replace(/\bHotel\b/gi, "Hotel")
      .replace(/\bMosque\b/gi, "Masjid");
  } else if (lang === "KH") {
    result = result
      .replace(/\bDays\b/gi, "ថ្ងៃ")
      .replace(/\bNights\b/gi, "យប់")
      .replace(/\bHalal Certified\b/gi, "បញ្ជាក់ហាឡាល់")
      .replace(/\bHalal Dining\b/gi, "អាហារហាឡាល់")
      .replace(/\bMuslim-Friendly\b/gi, "សម្រាប់ឥស្លាម")
      .replace(/\bPrayer Facilities\b/gi, "កន្លែងថ្វាយបង្គំ");
  }

  return result;
}

