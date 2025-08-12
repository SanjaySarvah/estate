import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type Props = {
  onClose: () => void;
};

export default function SideMenu({ onClose }: Props) {
  const navigation = useNavigation();

  const menuItems = [
    { label: 'Home', screen: 'Tabs', icon: 'home' },
    { label: 'Redy', screen: 'Redy', icon: 'bolt' },
    { label: 'Attendance Report', screen: 'OnlineAttendanceReport', icon: 'assignment' },
    { label: 'Weight Report', screen: 'OnlineWeightReport', icon: 'monitor-weight' },
  ];

  const handleNavigate = (screen: string) => {
    onClose();
    navigation.navigate(screen as never);
  };

  return (
    <Animated.View style={styles.menu}>
      <Text style={styles.header}>Menu</Text>
      <View style={styles.divider} />

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => handleNavigate(item.screen)}
        >
          <MaterialIcons name={item.icon} size={22} color="#333" />
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.divider} />

      <TouchableOpacity style={styles.menuItem} onPress={onClose}>
        <MaterialIcons name="close" size={22} color="red" />
        <Text style={[styles.menuText, { color: 'red' }]}>Close</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 240,
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});
