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
import { database, auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";

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
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user) {
          return user.uid;  // Return Firebase User UID
        }
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    
    async resetPassword(email) {
      try {
          await sendPasswordResetEmail(auth, email);
      } catch (error) {
          console.error("Error resetting password:", error);
          throw error;
      }
     },
     
    async signin(email, password, passwordConfirmed, username, firstName, lastName, phoneNumber) {
      try {
        if (password !== passwordConfirmed) {
          console.log("Passwords do not match!");
          return null;
        }
            
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (user) {
          // Update the user details with the new fields
          const objectInput = {
            email: user.email,
            uid: user.uid,
            username: username,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber
          };
          const docRef = await addDoc(collection(database, USER_DB_NAME), objectInput);
          return objectInput;
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
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
