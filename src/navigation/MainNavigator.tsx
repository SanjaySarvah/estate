import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import TabNavigator from './TabNavigator';
import SideMenu from '../components/SideMenu';
import Header from '../components/Header';

export default function MainNavigator() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setMenuVisible(true)} />
      <View style={styles.content}>
        <TabNavigator />
      </View>

      {menuVisible && (
        <View style={StyleSheet.absoluteFill}>
          {/* Background overlay that closes menu when pressed */}
          <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)} />

          {/* Actual menu */}
          <SideMenu onClose={() => setMenuVisible(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
