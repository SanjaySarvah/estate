import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import SideMenu from "../components/SideMenu";
import Header from "../components/Header";
import RedyScreen from "../screens/RedyScreen";
import OnlineAttendanceReport from "../screens/OnlineAttendanceReport";
import OnlineWeightReport from "../screens/OnlineWeightReport";

// ✅ Import FaceRegister screen
import FaceRegister from "../components/FaceRegister";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Header onMenuPress={() => setMenuVisible(true)} />

      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Bottom Tabs */}
          <Stack.Screen name="Tabs" component={TabNavigator} />

          {/* Individual Screens */}
          <Stack.Screen name="OnlineAttendanceReport" component={OnlineAttendanceReport} />
          <Stack.Screen name="OnlineWeightReport" component={OnlineWeightReport} />

          {/* ✅ Add FaceRegister screen */}
          <Stack.Screen name="FaceRegister" component={FaceRegister} />
        </Stack.Navigator>
      </View>

      {menuVisible && <SideMenu onClose={() => setMenuVisible(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
