import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Added MaterialIcons

import HomeScreen from "../screens/tabs/HomeScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import AddWeightScreen from "../screens/tabs/AddWeightScreen"; // Replace Settings with AddWeight
import Attendancereport from "../screens/tabs/Attendancereport";
import EmployeeAttendance from "../screens/tabs/EmployeAttendance";

// Tab Params
type TabParamList = {
  Home: undefined;
  Attendancereport: undefined;
  AddEmp: undefined;
  AddWeight: undefined;
  Attendancepunch: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Custom Center Tab Button
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
        const icons: Record<keyof TabParamList, { type: "ion" | "material"; name: string }> = {
          Home: { type: "ion", name: "home" },
          AddEmp: { type: "ion", name: "person-add" },
          AddWeight: { type: "material", name: "balance" }, // Weight icon
          Attendancereport: { type: "ion", name: "document-text" },
          Attendancepunch: { type: "ion", name: "finger-print" },
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
          tabBarIcon: ({ color }) => {
            const icon = icons[route.name];
            return icon.type === "ion" ? (
              <Ionicons name={icon.name} size={26} color={color} />
            ) : (
              <MaterialIcons name={icon.name} size={26} color={color} />
            );
          },
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
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen name="AddEmp" component={ProfileScreen} />
      <Tab.Screen name="AddWeight" component={AddWeightScreen} />
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
