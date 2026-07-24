import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

/**
 * Fetches an entire collection from Firestore.
 * Performs a one-time initial seed into Firestore if the collection is brand new and has never been seeded.
 * If the collection has been seeded previously and is empty (e.g., user deleted all items), returns empty array [].
 */
export async function fetchCollection<T extends { id: string }>(
  collectionName: string, 
  defaultData: T[] = []
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    
    // Check seed status in settings/seed_status
    const seedStatusRef = doc(db, "settings", "seed_status");
    let seedStatusSnap;
    try {
      seedStatusSnap = await getDoc(seedStatusRef);
    } catch (e) {
      // ignore
    }
    const seedData = seedStatusSnap && seedStatusSnap.exists() ? seedStatusSnap.data() : {};
    const isSeeded = !!seedData[collectionName];

    if (snapshot.empty) {
      if (isSeeded) {
        // Collection was already seeded in the past and is now empty because user explicitly deleted items
        console.log(`Collection "${collectionName}" is empty in Firestore (previously seeded). Returning [].`);
        return [];
      } else if (defaultData && defaultData.length > 0) {
        // Brand new database initialization: seed sample items ONCE into Firestore
        console.log(`Collection "${collectionName}" is empty in Firestore. Seeding initial default data...`);
        try {
          const batch = writeBatch(db);
          for (const item of defaultData) {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
          }
          await batch.commit();

          // Record that initial seeding was completed for this collection
          await setDoc(seedStatusRef, { [collectionName]: true }, { merge: true });
        } catch (seedErr) {
          console.error(`Error seeding collection "${collectionName}":`, seedErr);
        }
        return defaultData;
      } else {
        return [];
      }
    } else {
      // Collection is not empty; ensure seed status is recorded as true so we know it has been initialized
      if (!isSeeded) {
        try {
          await setDoc(seedStatusRef, { [collectionName]: true }, { merge: true });
        } catch (e) {
          // ignore
        }
      }
      
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as T);
      });
      return items;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return defaultData;
  }
}

/**
 * Saves or updates a document in a Firestore collection.
 */
export async function saveDocInCollection<T extends { id: string }>(
  collectionName: string, 
  item: T
): Promise<void> {
  const path = `${collectionName}/${item.id}`;
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a document from a Firestore collection.
 */
export async function deleteDocFromCollection(
  collectionName: string, 
  id: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetches a single document from Firestore.
 * If it doesn't exist, initializes it with defaultData.
 */
export async function fetchDocument<T>(
  collectionName: string, 
  docId: string, 
  defaultData: T
): Promise<T> {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log(`Document "${path}" does not exist. Initializing with default data...`);
      await setDoc(docRef, defaultData as any);
      return defaultData;
    }
    
    return docSnap.data() as T;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return defaultData;
  }
}

/**
 * Updates a single document in Firestore.
 */
export async function saveDocument<T>(
  collectionName: string, 
  docId: string, 
  data: T
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
