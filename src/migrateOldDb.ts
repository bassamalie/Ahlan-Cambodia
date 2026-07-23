import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db as newDb } from "./firebase";

const OLD_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBXav3bP59lGzEHiXAbVoIFh7_t8rPT2Fo",
  authDomain: "gen-lang-client-0425149549.firebaseapp.com",
  projectId: "gen-lang-client-0425149549",
  storageBucket: "gen-lang-client-0425149549.firebasestorage.app",
  messagingSenderId: "101126313243",
  appId: "1:101126313243:web:c14f4f3ee913b135c12fbe"
};
const OLD_DATABASE_ID = "ai-studio-ahlancambodia-29a99332-36f4-4403-bbd4-12ac70af94ae";

let oldDb: ReturnType<typeof getFirestore> | null = null;

try {
  const existingApps = getApps();
  const oldApp = existingApps.find(app => app.name === "oldApp") || initializeApp(OLD_FIREBASE_CONFIG, "oldApp");
  oldDb = getFirestore(oldApp, OLD_DATABASE_ID);
} catch (err) {
  console.error("Failed to initialize old Firebase app for migration:", err);
}

export async function migrateDataFromOldDatabase(): Promise<{ success: boolean; migratedCount: number; details: string }> {
  if (!oldDb) {
    return { success: false, migratedCount: 0, details: "Could not connect to old database." };
  }

  const collectionsToMigrate = [
    "destinations",
    "experiences",
    "packages",
    "tours",
    "hotels",
    "restaurants",
    "dining",
    "mosques",
    "travelGuides",
    "travelTips",
    "blogs",
    "reviews",
    "gallery",
    "homeBanners",
    "settings"
  ];

  let totalMigrated = 0;
  const log: string[] = [];

  for (const colName of collectionsToMigrate) {
    try {
      const oldColRef = collection(oldDb, colName);
      const snapshot = await getDocs(oldColRef);

      if (!snapshot.empty) {
        let colCount = 0;
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const docId = docSnap.id;
          const newDocRef = doc(newDb, colName, docId);
          await setDoc(newDocRef, data, { merge: true });
          colCount++;
          totalMigrated++;
        }
        log.push(`${colName}: ${colCount}`);
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      console.warn(`Migration skipped or failed for collection ${colName}:`, err);
    }
  }

  return {
    success: true,
    migratedCount: totalMigrated,
    details: log.join(", ") || "No items found in previous database."
  };
}
