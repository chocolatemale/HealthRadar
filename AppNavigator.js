import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faHome,
  faClock,
  faUtensils,
  faUser,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import HomePage from "./screens/HomePage";
import ViewCaloriesRecord from "./screens/ViewCaloriesRecord";
import AddCaloriesEntry from "./screens/AddCaloriesEntry";
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
      <Stack.Screen
        name="AddCaloriesEntry"
        options={{ title: "Add Calories Entry" }}
      >
        {(props) => (
          <AddCaloriesEntry {...props} foodRepo={firebaseClient.foodRepo} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppNavigator = ({ firebaseClient }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Overview") {
              iconName = focused ? faHome : faHome;
            } else if (route.name === "Daily") {
              iconName = focused ? faClock : faClock;
            } else if (route.name === "Food") {
              iconName = focused ? faUtensils : faUtensils;
            } else if (route.name === "Profile") {
              iconName = focused ? faUser : faUser;
            }

            return (
              <FontAwesomeIcon icon={iconName} size={size} color={color} />
            );
          },
        })}
        tabBarOptions={{
          activeTintColor: "#3498db",
          inactiveTintColor: "gray",
          labelStyle: {
            fontSize: 12,
            fontWeight: "bold",
          },
          style: {
            backgroundColor: "#f4f4f4", // You can set the background color according to your theme
          },
        }}
      >
        <Tab.Screen name="Overview">
          {(props) => <HomePage {...props} firebaseClient={firebaseClient} />}
        </Tab.Screen>
        <Tab.Screen name="Daily">
          {(props) => <TodayStack {...props} firebaseClient={firebaseClient} />}
        </Tab.Screen>
        {/* You can add other screens here for Food and Profile */}
        <Tab.Screen name="Food">{(props) => <></>}</Tab.Screen>
        <Tab.Screen name="Profile">
            {(props) => <Profile {...props} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
