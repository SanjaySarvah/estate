import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message'

export default function App() {
  useEffect(() => {
    StatusBar.setHidden(false); // ✅ Force it to show
  }, []);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        hidden={false}
      />
      <NavigationContainer>
        <RootNavigator />
        <Toast />

      </NavigationContainer>
    </>
  );
}
