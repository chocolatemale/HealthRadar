import { useState } from "react";
import React from "react";
import AppNavigator from "./AppNavigator";
import LoginPage from "./screens/LoginPage";
import { getFirebaseRepo } from "./repos/FirebaseRepo";
import { getUserRepo } from "./repos/UserRepo";

export default function App() {
  const [userId, setUserId] = useState(null);
  const firebaseClient = {
    foodRepo: getFirebaseRepo("food", userId),
  };
  if (userId) {
    return <AppNavigator firebaseClient={firebaseClient} />;
  } else {
    return <LoginPage setUserId={setUserId}></LoginPage>;
  }
}
