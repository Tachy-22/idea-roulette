import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA1nikCG8YlLL5fWvkJBUgEBIeOai44eQo",
  authDomain: "idearoulette-7c2ea.firebaseapp.com",
  projectId: "idearoulette-7c2ea",
  storageBucket: "idearoulette-7c2ea.firebasestorage.app",
  messagingSenderId: "692492052027",
  appId: "1:692492052027:web:4cd4c8275ffdb04255de1e",
  measurementId: "G-7ER41DXYDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;