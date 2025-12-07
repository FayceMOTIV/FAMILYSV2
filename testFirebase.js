// Test de connexion Firebase depuis l'app
// Lance avec: node testFirebase.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAozXl0nSFgnDjCPNaczf3pyFaNIcQUzZY",
  authDomain: "family-2026.firebaseapp.com",
  projectId: "family-2026",
  storageBucket: "family-2026.firebasestorage.app",
  messagingSenderId: "430855066870",
  appId: "1:430855066870:web:67280cbebd6fb78db988d7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  console.log("🔥 Test connexion Firebase depuis JS...\n");
  
  try {
    // 1. Lire settings
    const settingsDoc = await getDoc(doc(db, "settings", "restaurant"));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      console.log("✅ Settings:", data.name, "-", data.phone);
    }
    
    // 2. Lire categories
    const categoriesSnap = await getDocs(collection(db, "categories"));
    console.log(`✅ Categories: ${categoriesSnap.size} trouvée(s)`);
    categoriesSnap.forEach(doc => {
      console.log(`   - ${doc.data().name}`);
    });
    
    // 3. Lire products
    const productsSnap = await getDocs(collection(db, "products"));
    console.log(`✅ Products: ${productsSnap.size} trouvé(s)`);
    productsSnap.forEach(doc => {
      console.log(`   - ${doc.data().name} (${doc.data().base_price}€)`);
    });
    
    console.log("\n🎉 Connexion Firebase OK !");
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
  
  process.exit(0);
}

testConnection();
