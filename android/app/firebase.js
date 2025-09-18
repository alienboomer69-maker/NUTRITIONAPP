// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvhYc4HbN1mbvme09gsi_OWy7XbJp8NXM",
  authDomain: "nuts-28ea8.firebaseapp.com",
  projectId: "nuts-28ea8",
  storageBucket: "nuts-28ea8.firebasestorage.app",
  messagingSenderId: "217520693624",
  appId: "1:217520693624:web:084c305668b9a30aece88d",
  measurementId: "G-RBLD6RGNVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the initialized app and any other services you want to use globally
export { app, analytics };