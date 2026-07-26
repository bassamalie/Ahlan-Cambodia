import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, getMetadata, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDr56PVvJIp0c9vWmtM92jBkcOzTTH4V9M",
  authDomain: "ahlan-cambodia.firebaseapp.com",
  projectId: "ahlan-cambodia",
  storageBucket: "ahlan-cambodia.firebasestorage.app",
  messagingSenderId: "1027223873690",
  appId: "1:1027223873690:web:98d296b96599d3ebb2d723",
  measurementId: "G-RHJ85WZY0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Firestore
import { initializeFirestore } from "firebase/firestore";
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});

/**
 * Uploads a File object (from file inputs) directly to Firebase Storage.
 * @param file The File object to upload
 * @param pathPrefix Optional path prefix, defaults to "ahlancambodia_uploads"
 * @returns The public download URL of the uploaded file
 */
export async function uploadToFirebaseStorage(file: File, pathPrefix = "ahlancambodia_uploads"): Promise<string> {
  const fileExtension = file.name.split(".").pop() || "png";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const fileName = `${uniqueId}.${fileExtension}`;
  const storageRef = ref(storage, `${pathPrefix}/${fileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Uploads a base64 DataURL (as used in existing reader callbacks) to Firebase Storage.
 * This is perfect for migrating or intercepting existing base64 reader results and converting them to Firebase URLs.
 * @param dataUrl The base64 DataURL (e.g. data:image/png;base64,...)
 * @param pathPrefix Optional path prefix, defaults to "ahlancambodia_uploads"
 * @returns The public download URL of the uploaded file
 */
export async function uploadBase64ToFirebaseStorage(dataUrl: string, pathPrefix = "ahlancambodia_uploads"): Promise<string> {
  // If it's already an http or https url, return it directly
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }
  
  try {
    // Split the header and mime-type from the base64 content
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    const fileExtension = mime.split("/").pop() || "png";
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileName = `${uniqueId}.${fileExtension}`;
    const storageRef = ref(storage, `${pathPrefix}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, u8arr, { contentType: mime });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.error("Failed to upload base64 to Firebase Storage, returning original dataUrl", err);
    return dataUrl;
  }
}

/**
 * Lists all uploaded files from a given path prefix in Firebase Storage.
 */
export async function listAllUploadedFiles(pathPrefix = "ahlancambodia_uploads"): Promise<{ url: string; name: string; fullPath: string; timeCreated?: string }[]> {
  try {
    const listRef = ref(storage, pathPrefix);
    const res = await listAll(listRef);
    const items = await Promise.all(
      res.items.map(async (itemRef) => {
        try {
          const url = await getDownloadURL(itemRef);
          let timeCreated: string | undefined;
          try {
            const metadata = await getMetadata(itemRef);
            timeCreated = metadata.timeCreated;
          } catch (me) {
            console.warn("Failed to get metadata for", itemRef.name, me);
          }
          return {
            url,
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            timeCreated
          };
        } catch (itemErr) {
          console.error("Failed to process storage item", itemRef.name, itemErr);
          return null;
        }
      })
    );
    
    // Filter out nulls and sort by creation time (newest first)
    const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null);
    
    return validItems.sort((a, b) => {
      if (a.timeCreated && b.timeCreated) {
        return new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime();
      }
      return b.name.localeCompare(a.name);
    });
  } catch (err) {
    console.error("Failed to list files from Firebase Storage", err);
    return [];
  }
}

/**
 * Deletes a file from Firebase Storage.
 */
export async function deleteFromFirebaseStorage(fullPath: string): Promise<void> {
  try {
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
  } catch (err) {
    console.error("Failed to delete file from Firebase Storage", err);
    throw err;
  }
}
