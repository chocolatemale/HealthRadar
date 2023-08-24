import React, { useState, useEffect } from "react";
import AppNavigator from "./AppNavigator";
import LoginPage from "./screens/LoginPage";
import { getFirebaseRepo, getCaloriesGoalRepo } from "./repos/FirebaseRepo";
import { getUserRepo } from "./repos/UserRepo";
import { auth } from './firebase'; // Import your Firebase auth module
import { LogBox } from 'react-native';

export default function App() {
  const [userId, setUserId] = useState(null);
  LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
  LogBox.ignoreAllLogs();//Ignore all log notifications  const [userId, setUserId] = useState(null);
  const firebaseClient = {
    foodRepo: getFirebaseRepo("food", userId),
    caloriesGoalRepo: getCaloriesGoalRepo(userId)  // Added this line
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);  // Assuming you use the uid as userId
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();  // Cleanup on component unmount
  }, []);

  if (userId) {
    return <AppNavigator firebaseClient={firebaseClient} />;
  } else {
    return <LoginPage setUserId={setUserId}></LoginPage>;
  }
}
