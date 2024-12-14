import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { Timestamp} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvWeRTcluug1-W-Gx8sabzel0z7N2AGKg",
  authDomain: "libray-ee82e.firebaseapp.com",
  projectId: "libray-ee82e",
  storageBucket: "libray-ee82e.firebasestorage.app",
  messagingSenderId: "1084135898314",
  appId: "1:1084135898314:web:def758796ffa036515c833",
  measurementId: "G-R4GZZX3RPS"
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage(); // Export the 'storage' module

export default firebase;
export { Timestamp};