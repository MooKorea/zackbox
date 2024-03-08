// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUftpMEb5TZIaZLpZfzgdq0P9RZS7nf3g",
  authDomain: "zackbox.firebaseapp.com",
  databaseURL: "https://zackbox-default-rtdb.firebaseio.com",
  projectId: "zackbox",
  storageBucket: "zackbox.appspot.com",
  messagingSenderId: "10803210523",
  appId: "1:10803210523:web:e6398f2f3a694437c98bbe",
  measurementId: "G-V75EKHENT7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);