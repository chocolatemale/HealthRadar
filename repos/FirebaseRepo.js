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
  setDoc
} from "firebase/firestore";
import { database } from "../firebase";

const docToObject = (doc) => {
  const data = doc.data();
  data.id = doc.id;
  return data;
};

const simplifyName = name => {
  return name.toLowerCase().replace(/\s+/g, " ").replace(/s\b|\bon\b|s\b/g, "").trim();
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
    async addVisitedRecord(record) {
      const existingRecords = await this.getAllObjects();
      const existingRecord = existingRecords.find(
        r => r.foodId === record.foodId && r.type === record.type
      );
      
      if (existingRecord) {
        await this.updateObject(existingRecord.id, { timestamp: record.timestamp });
      } else {
        await this.addObject(record);
      }
    },
    
    async clearVisitedRecords() {
      const records = await this.getAllObjects();
      for (const record of records) {
        await this.removeObject(record.id);
      }
    },
    async deleteVisitedRecord(foodId, type) {
      const records = await this.getAllObjects();
      let matchingRecords = [];
      
      if (type === 'common') {
        matchingRecords = records.filter(record => simplifyName(record.foodId) === simplifyName(foodId) && record.type === 'common');
      } else {
        matchingRecords = records.filter(record => record.foodId === foodId && record.type !== 'common');
      }
      
      if (matchingRecords.length > 0) {
        // Sort by timestamp
        matchingRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Remove the oldest one
        await this.removeObject(matchingRecords[0].id);
      }
    },
    async setCaloriesGoal(goalData) {
      const goalsCollection = collection(database, "caloriesGoal");
      const goalQuery = query(goalsCollection, where("userId", "==", goalData.userId));
      const querySnapshot = await getDocs(goalQuery);
  
      if (!querySnapshot.empty) {
          const goalId = querySnapshot.docs[0].id;
          await this.updateObject(goalId, goalData);
      } else {
          await this.addObject(goalData);
      }
    },          
  };
};

export const getCaloriesGoalRepo = (userId) => {
  return {
    async getCaloriesGoal() {
      const docSnapshot = await getDoc(doc(database, "caloriesGoal", userId));
      if (docSnapshot.exists()) {
        return docSnapshot.data().caloriesGoal;
      }
      return null;
    },
    async setCaloriesGoal(goal) {
      await setDoc(doc(database, "caloriesGoal", userId), {
        caloriesGoal: goal
      });
    }
  };
};
