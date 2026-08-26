import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import { Paper } from "../types";
import { defaultPapers } from "../defaultData";

const COLLECTION_NAME = "papers";

export async function getPapers(): Promise<Paper[]> {
  if (!isFirebaseConfigured || !db) {
    return defaultPapers;
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("year", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return defaultPapers;
    }

    const papers: Paper[] = [];
    snapshot.forEach((docSnap) => {
      papers.push({ id: docSnap.id, ...(docSnap.data() as Omit<Paper, "id">) });
    });
    return papers;
  } catch (error) {
    console.warn("Firestore papers fetch error, using fallback data:", error);
    return defaultPapers;
  }
}

export async function savePaper(paper: Paper): Promise<string> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured yet. Add credentials to .env.local");
  }

  const docId = paper.id || `paper-${Date.now()}`;
  const docRef = doc(db, COLLECTION_NAME, docId);

  const dataToSave: Paper = {
    ...paper,
    id: docId,
    year: paper.year || new Date().getFullYear(),
  };

  await setDoc(docRef, dataToSave, { merge: true });
  return docId;
}

export async function deletePaper(docId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured yet.");
  }
  const docRef = doc(db, COLLECTION_NAME, docId);
  await deleteDoc(docRef);
}
