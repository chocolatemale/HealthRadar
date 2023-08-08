import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faClock, faUtensils, faUser, faPlus } from '@fortawesome/free-solid-svg-icons';

import HomePage from './screens/HomePage';
import ViewCaloriesRecord from './screens/ViewCaloriesRecord';
import AddCaloriesEntry from './screens/AddCaloriesEntry';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TodayStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ViewCaloriesRecord"
        component={ViewCaloriesRecord}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddCaloriesEntry" 
        component={AddCaloriesEntry} 
        options={{ title: 'Add Calories Entry' }} // Updated title
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Overview') {
              iconName = focused ? faHome : faHome;
            } else if (route.name === 'Daily') {
              iconName = focused ? faClock : faClock;
            } else if (route.name === 'Food') {
              iconName = focused ? faUtensils : faUtensils;
            } else if (route.name === 'Profile') {
              iconName = focused ? faUser : faUser;
            }

            return <FontAwesomeIcon icon={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#3498db',
          inactiveTintColor: 'gray',
          labelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          style: {
            backgroundColor: '#f4f4f4', // You can set the background color according to your theme
          },
        }}
      >
        <Tab.Screen name="Overview" component={HomePage} />
        <Tab.Screen name="Daily" component={TodayStack} />
        {/* You can add other screens here for Food and Profile */}
        <Tab.Screen name="Food" component={() => <></>} />
        <Tab.Screen name="Profile" component={() => <></>} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
