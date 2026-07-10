import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD9bkARaHWCzpNQlXUZEYHDCAl29qhyVQA",
  authDomain: "personal-os-4e81b.firebaseapp.com",
  projectId: "personal-os-4e81b",
  storageBucket: "personal-os-4e81b.firebasestorage.app",
  messagingSenderId: "589567833064",
  appId: "1:589567833064:web:3351f204cf389488de2a5d",
  measurementId: "G-HS9E0ZKXGL"
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Conditionally get Analytics
export const analyticsPromise = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);
