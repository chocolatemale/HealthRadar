import { useState } from "react";
import React from "react";
import AppNavigator from "./AppNavigator";
import LoginPage from "./screens/LoginPage";

export default function App() {
  const [userId, setUserId] = useState(null);

  if (userId) {
    return <AppNavigator client={firebaseClient} />;
  } else {
    return <LoginPage setUserId={setUserId}></LoginPage>;
  }
}
