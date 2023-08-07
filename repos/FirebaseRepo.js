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
      const objectQuery = query(
        objectsCollection,
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(objectQuery);
      return querySnapshot.docs.map(docToObject);
    },
    async getObjectById(id) {
      const docSnapshot = await getDoc(doc(database, dbName, id));
      const object = docToObject(docSnapshot);
      if (object.userId === userId) {
        await deleteDoc(entryRef);
      }
      return object;
    },
    async addObject(objectInput) {
      try {
        objectInput.userId = userId;
        const docRef = await addDoc(collection(database, dbName), objectInput);
      } catch (e) {
        console.log(e);
      }
      return objectInput;
    },
    async updateObject(id, updatedObject) {
      const entryRef = doc(database, dbName, id);
      const object = await getDoc(entryRef);
      if (object.userId === userId) {
        await updateDoc(entryRef, inputObject);
      }
    },
    async removeObject(id) {
      const entryRef = doc(database, dbName, id);
      const object = await getDoc(entryRef);
      if (object.userId === userId) {
        await deleteDoc(entryRef);
      }
    },
  };
};
