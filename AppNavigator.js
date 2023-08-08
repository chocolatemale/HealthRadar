import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './screens/HomePage';
import ViewCaloriesRecord from './screens/ViewCaloriesRecord'; // Add this import

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="ViewCalories" component={ViewCaloriesRecord} />
        {/* Additional screens will be added here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
