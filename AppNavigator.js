import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faHome,
  faClock,
  faAppleAlt,
  faWeight,
} from "@fortawesome/free-solid-svg-icons";

import HomePage from "./screens/HomePage";
import ViewCaloriesRecord from "./screens/ViewCaloriesRecord";
import AddCaloriesEntry from "./screens/AddCaloriesEntry";
import FoodOverview from './screens/FoodOverview';
import FoodDetails from './screens/FoodDetails';
import WeightScreen from './screens/WeightScreen';
import Profile from './screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TodayStack = ({ firebaseClient }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ViewCaloriesRecord" options={{ headerShown: false }}>
        {(props) => (
          <ViewCaloriesRecord {...props} foodRepo={firebaseClient.foodRepo} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const FoodStack = ({ firebaseClient }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FoodOverview" options={{ headerShown: false }}>
        {(props) => <FoodOverview {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppNavigator = ({ firebaseClient }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Back',  // Set default back button title for all screens
        }}
      >
        <Stack.Screen name="TabHome" options={{ headerShown: false }}>
          {(props) => (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;
                  if (route.name === "Overview") {
                    iconName = faHome;
                  } else if (route.name === "Daily") {
                    iconName = faClock;
                  } else if (route.name === "Nutrition") {
                    iconName = faAppleAlt;
                  } else if (route.name === "Weight") {
                    iconName = faWeight;
                  }
                  return (
                    <FontAwesomeIcon icon={iconName} size={size} color={color} />
                  );
                },
                tabBarActiveTintColor: "#3498db",
                tabBarInactiveTintColor: "gray",
                tabBarLabelStyle: {
                  fontSize: 12,
                  fontWeight: "bold",
                },
                tabBarStyle: {
                  backgroundColor: "#f4f4f4",
                },
              })}
            >
              <Tab.Screen name="Overview">
                {(props) => <HomePage {...props} firebaseClient={firebaseClient} />}
              </Tab.Screen>
              <Tab.Screen name="Weight">
                {(props) => <WeightScreen {...props} firebaseClient={firebaseClient}/>}
              </Tab.Screen>
              <Tab.Screen name="Daily">
                {(props) => <TodayStack {...props} firebaseClient={firebaseClient} />}
              </Tab.Screen>
              <Tab.Screen name="Nutrition">
                {(props) => <FoodStack {...props} firebaseClient={firebaseClient} />}
              </Tab.Screen>
            </Tab.Navigator>
          )}
        </Stack.Screen>
        <Stack.Screen name="FoodDetails" options={{ title: "Food Details" }}>
          {(props) => <FoodDetails {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name="AddCaloriesEntry"
          options={{ title: "Add Calories Entry" }}
        >
          {(props) => (
            <AddCaloriesEntry {...props} foodRepo={firebaseClient.foodRepo} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {(props) => <Profile {...props} firebaseClient={firebaseClient} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
