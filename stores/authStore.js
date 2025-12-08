import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../constants/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state, isLoading: false });
      },

      initAuth: async () => {
        try {
          set({ isLoading: false });
        } catch (error) {
          console.error('Init auth error:', error);
          set({ isLoading: false });
        }
      },

      // Register with Firebase Auth
      register: async (email, password, name, phone) => {
        try {
          // Create user in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Update display name
          await updateProfile(firebaseUser, { displayName: name });
          
          // Create customer document in Firestore
          const customerData = {
            email: email,
            first_name: name.split(' ')[0] || name,
            last_name: name.split(' ').slice(1).join(' ') || '',
            phone: phone,
            loyalty_balance: 0,
            total_orders: 0,
            total_spent: 0,
            is_blocked: false,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          };
          
          await setDoc(doc(db, 'customers', firebaseUser.uid), customerData);
          
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: name,
            phone: phone,
            loyalty_balance: 0
          };
          
          set({ 
            token: firebaseUser.uid, 
            user: userData, 
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          console.error('Register error:', error);
          let errorMessage = "Erreur d'inscription";
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Cet email est déjà utilisé";
          } else if (error.code === 'auth/weak-password') {
            errorMessage = "Mot de passe trop faible (min 6 caractères)";
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Email invalide";
          }
          return { success: false, error: errorMessage };
        }
      },

      // Login with Firebase Auth
      login: async (email, password) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Get customer data from Firestore
          const customerDoc = await getDoc(doc(db, 'customers', firebaseUser.uid));
          let customerData = {};
          if (customerDoc.exists()) {
            customerData = customerDoc.data();
          }
          
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: customerData.first_name ? `${customerData.first_name} ${customerData.last_name || ''}`.trim() : firebaseUser.displayName || '',
            phone: customerData.phone || '',
            loyalty_balance: customerData.loyalty_balance || 0
          };
          
          set({ 
            token: firebaseUser.uid, 
            user: userData, 
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          let errorMessage = "Erreur de connexion";
          if (error.code === 'auth/user-not-found') {
            errorMessage = "Utilisateur non trouvé";
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = "Mot de passe incorrect";
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Email invalide";
          } else if (error.code === 'auth/invalid-credential') {
            errorMessage = "Email ou mot de passe incorrect";
          }
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        try {
          await signOut(auth);
          set({ token: null, user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      // Update user
      updateUser: (userData) => {
        const user = { ...get().user, ...userData };
        set({ user });
      },
    }),
    {
      name: 'familys-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
