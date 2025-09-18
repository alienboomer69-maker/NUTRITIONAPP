import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvhYc4HbN1mbvme09gsi_OWy7XbJp8NXM",
  authDomain: "nuts-28ea8.firebaseapp.com",
  projectId: "nuts-28ea8",
  storageBucket: "nuts-28ea8.appspot.com",
  messagingSenderId: "217520693624",
  appId: "1:217520693624:web:084c305668b9a30aece88d",
  measurementId: "G-RBLD6RGNVL"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
