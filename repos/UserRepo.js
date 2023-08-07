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

const USER_DB_NAME = "user";

const docToObject = (doc) => {
  const data = doc.data();
  data.id = doc.id;
  return data;
};

export const getUserRepo = (userId) => {
  return {
    async getUserByEmail(email) {
      const objectsCollection = collection(database, USER_DB_NAME);
      const userQuery = query(objectsCollection, where("email", "==", email));
      const querySnapshot = await getDocs(userQuery);
      const users = querySnapshot.docs.map(docToObject);
      if (users.length != 0) {
        return users[0];
      }

      return null;
    },
    async login(email, password) {
      const user = await this.getUserByEmail(email);
      if (user && user.password == password) {
        return user.id;
      }
      return null;
    },
    async signin(email, password, passwordComfirmed, phoneNumber, username) {
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        // user already exist
        return;
      }
      if (passwordComfirmed !== password) {
        // password not match
        return;
      }
      const objectInput = {
        email,
        password,
        phoneNumber,
        username,
      };
      try {
        const docRef = await addDoc(
          collection(database, USER_DB_NAME),
          objectInput
        );
      } catch (e) {
        console.log(e);
      }
      return objectInput;
    },
    async updateUser(id, updatedUser) {
      const entryRef = doc(database, USER_DB_NAME, id);
      const object = await getDoc(entryRef);
      if (object.id === userId) {
        await updateDoc(entryRef, updatedUser);
      }
    },
  };
};
