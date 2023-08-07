// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const apiKey = "AIzaSyBh68U9kxMWbG6rVpGDjL_A9iZJADHRp04";
const authDomain = "cs5520-project-3f564.firebaseapp.com";
const projectId = "cs5520-project-3f564";
const storageBucket = "cs5520-project-3f564.appspot.com";
const messagingSenderId = "236556494060";
const appId = "1:236556494060:web:5f94df063b11af32e9b1c9";
const usdaApiKey = "acofLVfCIyS3JVfhnbVfjBgXYYa56SiJ1bqTQ8wh";

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

export { database };
