/**
 * Service Firebase pour FAMILYS App Mobile
 * Remplace les appels API vers le backend pour les données publiques
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';

// ============================================
// SETTINGS
// ============================================

export const getSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'restaurant');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Erreur getSettings:', error);
    return null;
  }
};

// ============================================
// CATEGORIES
// ============================================

export const getCategories = async () => {
  try {
    const q = query(
      collection(db, 'categories'),
      where('is_active', '==', true),
      orderBy('display_order')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur getCategories:', error);
    return [];
  }
};

// ============================================
// PRODUCTS
// ============================================

export const getProducts = async () => {
  try {
    const q = query(
      collection(db, 'products'),
      where('is_available', '==', true),
      orderBy('display_order')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur getProducts:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('category_id', '==', categoryId),
      where('is_available', '==', true),
      orderBy('display_order')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur getProductsByCategory:', error);
    return [];
  }
};

export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Erreur getProductById:', error);
    return null;
  }
};

// ============================================
// PROMOTIONS
// ============================================

export const getActivePromotions = async () => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'promotions'),
      where('is_active', '==', true)
    );
    const snapshot = await getDocs(q);
    
    // Filtrer par date côté client (Firestore limite les requêtes composées)
    const promos = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(promo => {
        const startDate = promo.start_date?.toDate?.() || new Date(promo.start_date);
        const endDate = promo.end_date?.toDate?.() || new Date(promo.end_date);
        return startDate <= now && endDate >= now;
      });
    
    return promos;
  } catch (error) {
    console.error('Erreur getActivePromotions:', error);
    return [];
  }
};

// ============================================
// POPUPS
// ============================================

export const getActivePopups = async () => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'popups'),
      where('is_active', '==', true)
    );
    const snapshot = await getDocs(q);
    
    // Filtrer par date
    const popups = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(popup => {
        if (!popup.start_date || !popup.end_date) return true;
        const startDate = popup.start_date?.toDate?.() || new Date(popup.start_date);
        const endDate = popup.end_date?.toDate?.() || new Date(popup.end_date);
        return startDate <= now && endDate >= now;
      });
    
    return popups;
  } catch (error) {
    console.error('Erreur getActivePopups:', error);
    return [];
  }
};

// ============================================
// CUSTOMER (nécessite auth)
// ============================================

export const getCustomer = async (uid) => {
  try {
    const docRef = doc(db, 'customers', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Erreur getCustomer:', error);
    return null;
  }
};

export const updateCustomer = async (uid, data) => {
  try {
    const docRef = doc(db, 'customers', uid);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Erreur updateCustomer:', error);
    return false;
  }
};

// ============================================
// ORDERS
// ============================================

export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur createOrder:', error);
    return null;
  }
};

export const getCustomerOrders = async (uid) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('customer_uid', '==', uid),
      orderBy('created_at', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur getCustomerOrders:', error);
    return [];
  }
};

// Écouter les changements d'une commande en temps réel
export const subscribeToOrder = (orderId, callback) => {
  const docRef = doc(db, 'orders', orderId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

export default {
  getSettings,
  getCategories,
  getProducts,
  getProductsByCategory,
  getProductById,
  getActivePromotions,
  getActivePopups,
  getCustomer,
  updateCustomer,
  createOrder,
  getCustomerOrders,
  subscribeToOrder
};
