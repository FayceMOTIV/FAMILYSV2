/**
 * Service Firestore pour FAMILYS Backoffice
 * CRUD complet pour toutes les collections
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

// ============================================
// SETTINGS
// ============================================

export const getSettings = async () => {
  const docRef = doc(db, 'settings', 'restaurant');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateSettings = async (data) => {
  const docRef = doc(db, 'settings', 'restaurant');
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

// ============================================
// CATEGORIES
// ============================================

export const getCategories = async () => {
  const q = query(collection(db, 'categories'), orderBy('display_order'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCategory = async (data) => {
  const docRef = await addDoc(collection(db, 'categories'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
  return docRef.id;
};

export const updateCategory = async (id, data) => {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

export const deleteCategory = async (id) => {
  await deleteDoc(doc(db, 'categories', id));
};

// ============================================
// PRODUCTS
// ============================================

export const getProducts = async () => {
  const q = query(collection(db, 'products'), orderBy('display_order'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductById = async (id) => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createProduct = async (data) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
  return docRef.id;
};

export const updateProduct = async (id, data) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id));
};

// ============================================
// PROMOTIONS
// ============================================

export const getPromotions = async () => {
  const q = query(collection(db, 'promotions'), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createPromotion = async (data) => {
  const docRef = await addDoc(collection(db, 'promotions'), {
    ...data,
    usage_count: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
  return docRef.id;
};

export const updatePromotion = async (id, data) => {
  const docRef = doc(db, 'promotions', id);
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

export const deletePromotion = async (id) => {
  await deleteDoc(doc(db, 'promotions', id));
};

// ============================================
// ORDERS
// ============================================

export const getOrders = async (statusFilter = null) => {
  let q;
  if (statusFilter) {
    q = query(
      collection(db, 'orders'),
      where('status', '==', statusFilter),
      orderBy('created_at', 'desc'),
      limit(100)
    );
  } else {
    q = query(
      collection(db, 'orders'),
      orderBy('created_at', 'desc'),
      limit(100)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getActiveOrders = async () => {
  const q = query(
    collection(db, 'orders'),
    where('status', 'in', ['new', 'confirmed', 'in_preparation', 'ready', 'delivering']),
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateOrderStatus = async (id, status) => {
  const docRef = doc(db, 'orders', id);
  const order = await getDoc(docRef);
  const currentHistory = order.data()?.status_history || [];
  
  await updateDoc(docRef, {
    status,
    status_history: [...currentHistory, { status, at: new Date(), by: 'admin' }],
    updated_at: serverTimestamp()
  });
};

// ============================================
// CUSTOMERS
// ============================================

export const getCustomers = async () => {
  const q = query(collection(db, 'customers'), orderBy('created_at', 'desc'), limit(500));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCustomerById = async (uid) => {
  const docRef = doc(db, 'customers', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateCustomer = async (uid, data) => {
  const docRef = doc(db, 'customers', uid);
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

// ============================================
// POPUPS
// ============================================

export const getPopups = async () => {
  const q = query(collection(db, 'popups'), orderBy('priority', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createPopup = async (data) => {
  const docRef = await addDoc(collection(db, 'popups'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
  return docRef.id;
};

export const updatePopup = async (id, data) => {
  const docRef = doc(db, 'popups', id);
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

export const deletePopup = async (id) => {
  await deleteDoc(doc(db, 'popups', id));
};

// ============================================
// STORAGE (Upload images)
// ============================================

export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};

export const deleteImage = async (path) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export default {
  // Settings
  getSettings,
  updateSettings,
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Products
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Promotions
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  // Orders
  getOrders,
  getActiveOrders,
  updateOrderStatus,
  // Customers
  getCustomers,
  getCustomerById,
  updateCustomer,
  // Popups
  getPopups,
  createPopup,
  updatePopup,
  deletePopup,
  // Storage
  uploadImage,
  deleteImage
};
