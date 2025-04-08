import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import GroupDetailsScreen from './screens/GroupDetailsScreen';
import CreateGroupScreen from './screens/CreateGroupScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
