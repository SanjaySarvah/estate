import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Get actual status bar height
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;

type Props = {
  onMenuPress: () => void;
};

export default function Header({ onMenuPress }: Props) {
  return (
    <>
      {/* Gradient background covering both status bar and header */}
      <LinearGradient
        colors={['#6a11cb', '#2575fc']} // Gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true} // Makes gradient show under status bar
        />

        {/* Push content below status bar */}
        <View style={{ height: STATUSBAR_HEIGHT }} />

        {/* Header content */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onMenuPress}>
            <Icon name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Kannavari Estate</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    paddingTop: 0,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
