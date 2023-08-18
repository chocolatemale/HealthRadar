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
import { serverTimestamp, orderBy, writeBatch } from "firebase/firestore";

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

export const getVisitedFoodRepo = (userId) => {
  const HISTORY_DB_NAME = `foodHistory_${userId}`;

  return {
    async getVisitedFoods() {
      const foodsCollection = collection(database, HISTORY_DB_NAME);
      const foodQuery = query(foodsCollection, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(foodQuery);
      return querySnapshot.docs.map(docToObject);
    },
     

    async addVisitedFood(food) {
      const foodCollection = collection(database, HISTORY_DB_NAME);
      const foodQuery = query(foodCollection, where("nix_item_id", "==", food.nix_item_id));
      const querySnapshot = await getDocs(foodQuery);
      if (querySnapshot.empty) {
          // Only add if the food isn't already in the database.
          await addDoc(collection(database, HISTORY_DB_NAME), {
              ...food,
              timestamp: serverTimestamp()
          });
      }
    },
    
    async clearVisitedFoods() {
      const foodsCollection = collection(database, HISTORY_DB_NAME);
      const querySnapshot = await getDocs(foodsCollection);
      const batch = writeBatch(database);
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    },
  };
};