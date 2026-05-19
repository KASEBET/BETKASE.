import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: In a real app we'd use environment variables.
// The user provided these in their request, so we use them to preserve their backend.
const firebaseConfig = {
  apiKey: "AIzaSyCmop2QaWiyti5kI778fyoVkKqIjUdqSDQ",
  authDomain: "betkase.firebaseapp.com",
  projectId: "betkase",
  storageBucket: "betkase.firebasestorage.app",
  messagingSenderId: "315588136077",
  appId: "1:315588136077:web:4b075235cb83853740e6c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
