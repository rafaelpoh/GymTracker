import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUnxtTSRb4LClBWq6ro1nmf7gH_zn2bIM",
  authDomain: "gymtracker-app-2026.firebaseapp.com",
  projectId: "gymtracker-app-2026",
  storageBucket: "gymtracker-app-2026.firebasestorage.app",
  messagingSenderId: "296404742289",
  appId: "1:296404742289:web:62cf5c809a614942dccf30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
