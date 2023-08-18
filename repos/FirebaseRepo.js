import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { database } from "../firebase";

const docToObject = (doc) => {
  const data = doc.data();
  data.id = doc.id;
  return data;
};

export const getFirebaseRepo = (dbName, userId) => {
  return {
    async getAllObjects() {
      const objectsCollection = collection(database, dbName);
      const objectQuery = query(objectsCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(objectQuery);
      return querySnapshot.docs.map(docToObject);
    },
    async getObjectById(id) {
      const docSnapshot = await getDoc(doc(database, dbName, id));
      if (docSnapshot.exists()) {
        return docToObject(docSnapshot);
      }
      return null;
    },
    async addObject(objectInput) {
      try {
        objectInput.userId = userId;
        await addDoc(collection(database, dbName), objectInput);
        return objectInput;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async updateObject(id, updatedObject) {
      const entryRef = doc(database, dbName, id);
      const objectSnapshot = await getDoc(entryRef);
      if (objectSnapshot.exists() && objectSnapshot.data().userId === userId) {
        await updateDoc(entryRef, updatedObject);
      }
    },
    async removeObject(id) {
      const entryRef = doc(database, dbName, id);
      const objectSnapshot = await getDoc(entryRef);
      if (objectSnapshot.exists() && objectSnapshot.data().userId === userId) {
        await deleteDoc(entryRef);
      }
    },
  };
};