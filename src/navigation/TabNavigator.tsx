import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons"; // Using Ionicons instead of MaterialIcons
import HomeScreen from "../screens/tabs/HomeScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import SettingsScreen from "../screens/tabs/SettingsScreen";
import Attendancereport from "../screens/tabs/Attendancereport";
import EmployeeAttendance from "../screens/tabs/EmployeAttendance";

// Define tab names and their params
type TabParamList = {
  Home: undefined;
  Attendancereport: undefined;
  AddEmp: undefined;
  Settings: undefined;
  Attendancepunch: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Custom Center Tab Button for Punch
function CustomCenterButton({ children, onPress }: any) {
  return (
    <TouchableOpacity
      style={{
        top: Platform.OS === "ios" ? -20 : -25,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["#FF9800", "#FF5722"]}
        style={styles.centerButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
      <Text style={styles.centerLabel}>Punch</Text>
    </TouchableOpacity>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const icons: Record<keyof TabParamList, string> = {
          Home: "home",
          AddEmp: "person-add",
          Settings: "settings",
          Attendancereport: "document-text",
          Attendancepunch: "finger-print",
        };

        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#e0e0e0",
          tabBarStyle: {
            height: 70,
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: "transparent",
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={["#6a11cb", "#2575fc"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons
              name={icons[route.name] || "help-circle-outline"}
              size={26}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Attendancereport" component={Attendancereport} />
      <Tab.Screen
        name="Attendancepunch"
        component={EmployeeAttendance}
        options={{
          tabBarButton: (props) => <CustomCenterButton {...props} />,
          tabBarIcon: () => (
            <Ionicons name="finger-print" size={30} color="#fff" />
          ),
          tabBarLabel: () => null, // Hide default label
        }}
      />
      <Tab.Screen name="AddEmp" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  centerLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});
