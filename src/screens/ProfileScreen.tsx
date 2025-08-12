import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TabNavigator from '../navigation/TabNavigator';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
