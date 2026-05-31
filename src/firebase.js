import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDdSi_lV1JEFxxUSTjXbAS0GC02NHFo5mA",
  authDomain: "pantangcare-690ba.firebaseapp.com",
  databaseURL: "https://pantangcare-690ba-default-rtdb.firebaseio.com",
  projectId: "pantangcare-690ba",
  storageBucket: "pantangcare-690ba.firebasestorage.app",
  messagingSenderId: "586564443501",
  appId: "1:586564443501:web:6cbf7aab2ff53849918e64",
  measurementId: "G-WPT77SZ246"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
