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
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onClose: () => void;
};

export default function SideMenu({ onClose }: Props) {
  const navigation = useNavigation();

  const menuItems = [
    { label: 'Home', screen: 'Tabs', icon: 'home' },
    // { label: 'Redy', screen: 'Redy', icon: 'bolt' },
    { label: 'Attendance Report', screen: 'OnlineAttendanceReport', icon: 'assignment' },
    { label: 'Weight Report', screen: 'OnlineWeightReport', icon: 'monitor-weight' },
  ];

  const handleNavigate = (screen: string) => {
    onClose();
    navigation.navigate(screen as never);
  };

  return (
    <Animated.View style={styles.menu}>
  
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <Text style={styles.header}>Menu</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          activeOpacity={0.8}
          onPress={() => handleNavigate(item.screen)}
        >
          <View style={styles.iconWrapper}>
            <MaterialIcons name={item.icon} size={22} color="#fff" />
          </View>
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 260,
    height: '100%',
    backgroundColor: '#f9f9f9',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    
  },
  headerContainer: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6a11cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 3,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
