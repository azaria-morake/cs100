import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import { Article } from "../types";
import { defaultFeaturedArticle } from "../defaultData";

const COLLECTION_NAME = "articles";

export async function getArticles(): Promise<Article[]> {
  if (!isFirebaseConfigured || !db) {
    return [defaultFeaturedArticle];
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("publishedAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [defaultFeaturedArticle];
    }

    const articles: Article[] = [];
    snapshot.forEach((docSnap) => {
      articles.push({ id: docSnap.id, ...(docSnap.data() as Omit<Article, "id">) });
    });

    return articles;
  } catch (error) {
    console.warn("Firestore fetch error, using fallback data:", error);
    return [defaultFeaturedArticle];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isFirebaseConfigured || !db) {
    if (slug === defaultFeaturedArticle.slug || slug === "featured") {
      return defaultFeaturedArticle;
    }
    return null;
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      if (slug === defaultFeaturedArticle.slug) {
        return defaultFeaturedArticle;
      }
      return null;
    }

    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...(docSnap.data() as Omit<Article, "id">) };
  } catch (error) {
    console.warn("Firestore article fetch error:", error);
    if (slug === defaultFeaturedArticle.slug) {
      return defaultFeaturedArticle;
    }
    return null;
  }
}

export async function saveArticle(article: Article): Promise<string> {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured yet. Please configure your credentials in .env.local"
    );
  }

  const docId = article.id || article.slug || `article-${Date.now()}`;
  const docRef = doc(db, COLLECTION_NAME, docId);

  const dataToSave = {
    slug: article.slug,
    title: article.title,
    category: article.category,
    author: article.author,
    topic: article.topic,
    readTime: article.readTime,
    lead: article.lead,
    body: article.body || [],
    markdownContent: article.markdownContent || '',
    pullquote: article.pullquote || '',
    benchmarks: article.benchmarks || [],
    flameGraphHeader: article.flameGraphHeader || '',
    flameGraphLines: article.flameGraphLines || [],
    publishedAt: article.publishedAt || new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString(),
    isFeatured: Boolean(article.isFeatured),
  };

  await setDoc(docRef, dataToSave, { merge: true });
  return docId;
}

export async function deleteArticle(docId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured yet.");
  }
  const docRef = doc(db, COLLECTION_NAME, docId);
  await deleteDoc(docRef);
}

export async function seedDefaultArticleToFirestore(): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const artRef = doc(db, COLLECTION_NAME, defaultFeaturedArticle.id || defaultFeaturedArticle.slug);
  await setDoc(artRef, defaultFeaturedArticle);
}
