import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import FaceRegister from "../../components/FaceRegister";
import FaceScanner from "../../components/FaceScanner";

type ScanType = "register" | "scanner" | null;

export default function CameraScanner() {
  const device = useCameraDevice("back");
  const [hasPermission, setHasPermission] = useState(false);
  const [scanType, setScanType] = useState<ScanType>(null);

  useEffect(() => {
    (async () => {
      const camPermission = await Camera.requestCameraPermission();
      setHasPermission(camPermission === "granted");
    })();
  }, []);

  if (!device) return <Text>No Camera Found</Text>;
  if (!hasPermission) return <Text>Camera Permission Denied</Text>;

  return (
    <View style={{ flex: 1 }}>
      {scanType === "register" && (
        <FaceRegister device={device} onClose={() => setScanType(null)} />
      )}
      {scanType === "scanner" && (
        <FaceScanner device={device} scanType="checkInBefore" onClose={() => setScanType(null)} />
      )}

      {!scanType && (
        <View style={styles.center}>
          <TouchableOpacity onPress={() => setScanType("scanner")}>
            <LinearGradient colors={["#ff9966", "#ff5e62"]} style={styles.btn}>
              <Icon name="qr-code-scanner" size={24} color="#fff" />
              <Text style={styles.txt}>Start Scanning</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScanType("register")}>
            <LinearGradient colors={["#2575fc", "#6a11cb"]} style={styles.btn}>
              <Icon name="camera" size={24} color="#fff" />
              <Text style={styles.txt}>Register Face</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  btn: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 30, marginVertical: 10 },
  txt: { color: "#fff", marginLeft: 10, fontWeight: "bold" }
});
