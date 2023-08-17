import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';  // Add this line
import ENV from '../environment';

const firebaseConfig = {
  apiKey: ENV.API_KEY,
  authDomain: ENV.AUTH_DOMAIN,
  projectId: ENV.PROJECT_ID,
  storageBucket: ENV.STORAGE_BUCKET,
  messagingSenderId: ENV.MESSAGING_SENDER_ID,
  appId: ENV.APP_ID,
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const auth = getAuth(app);  // Add this line

export { database, auth };  // Update this line
