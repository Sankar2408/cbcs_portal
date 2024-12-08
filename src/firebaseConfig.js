import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBAwMsLcp68ia6x2MRwkj7bRitripTaIhw",
  authDomain: "cbcs-189c0.firebaseapp.com",
  projectId: "cbcs-189c0",
  storageBucket: "cbcs-189c0.firebasestorage.app",
  messagingSenderId: "320011290510",
  appId: "1:320011290510:web:7dedf8782bed526f2606df",
  measurementId: "G-YF7ZVMZCLX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
