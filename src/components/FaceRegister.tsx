// src/components/FaceRegister.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { Camera, useCameraDevices, CameraDevice } from "react-native-vision-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "react-native-image-picker";

export default function FaceRegister() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { workerId, name: existingName } = route.params || {};

  const devices = useCameraDevices();
  const backCamera = devices?.find((d) => d.position === "back");
  const frontCamera = devices?.find((d) => d.position === "front");

  const [useFront, setUseFront] = useState(false);
  const device = useFront ? frontCamera : backCamera;

  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [name, setName] = useState(existingName || "");
  const [photoPath, setPhotoPath] = useState<string>("");

  // Request camera permission
  useEffect(() => {
    (async () => {
      const camPermission = await Camera.requestCameraPermission();
      setHasPermission(camPermission === "granted");
    })();
  }, []);

  // Capture photo from camera
  const capturePhoto = async () => {
    if (!camera.current || isProcessing) return;
    try {
      setProcessing(true);
      const photo = await camera.current.takePhoto();
      setPhotoPath(`file://${photo.path}`);
      Toast.show({ type: "success", text1: "Photo Captured" });
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Failed to capture photo" });
    } finally {
      setProcessing(false);
    }
  };

  // Upload photo from gallery
  const uploadPhoto = async () => {
    ImagePicker.launchImageLibrary(
      { mediaType: "photo", includeBase64: false },
      (response) => {
        if (response.didCancel) return;
        if (response.assets && response.assets.length > 0) {
          setPhotoPath(response.assets[0].uri || "");
        }
      }
    );
  };

  const reCapture = () => setPhotoPath("");

  const saveEntry = async () => {
    if (!name || !photoPath) {
      Toast.show({ type: "error", text1: "Name & photo required" });
      return;
    }

    const entry = { workerId, name, photoPath, timestamp: new Date().toISOString() };

    try {
      const existing = await AsyncStorage.getItem("faceEntries");
      const parsed = existing ? JSON.parse(existing) : [];
      const filtered = parsed.filter((item: any) => item.workerId !== workerId);
      filtered.push(entry);
      await AsyncStorage.setItem("faceEntries", JSON.stringify(filtered));
      Toast.show({ type: "success", text1: "Face Registered Successfully" });
      navigation.navigate("EmployeeRegistry", { refresh: true });
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Error saving face" });
    }
  };

  if (!device) return <Text style={styles.centerText}>Loading Camera...</Text>;
  if (!hasPermission) return <Text style={styles.centerText}>Camera Permission Denied</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {!photoPath && (
        <Camera ref={camera} style={StyleSheet.absoluteFill} device={device} isActive={true} photo={true} />
      )}

      {isProcessing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <SafeAreaView style={styles.bottomSheet} edges={["bottom"]}>
        <Text style={styles.title}>👤 Face Registration</Text>
        <Text style={styles.subText}>Name: {name}</Text>
        <Text style={styles.subText}>Worker ID: {workerId}</Text>

        {photoPath ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoPath }} style={styles.previewImage} />
            <View style={styles.editRow}>
              <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={uploadPhoto}>
                <Text style={styles.btnText}>🖼 Upload New</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={reCapture}>
                <Text style={styles.btnText}>♻️ Re-Capture</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.captureBtn]} onPress={capturePhoto}>
              <Text style={styles.btnText}>📸 Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.switchBtn]} onPress={() => setUseFront(!useFront)}>
              <Text style={styles.btnText}>{useFront ? "🔄 Back Cam" : "🤳 Front Cam"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.uploadBtn]} onPress={uploadPhoto}>
              <Text style={styles.btnText}>🖼 Upload</Text>
            </TouchableOpacity>
          </View>
        )}

        {photoPath && (
          <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={saveEntry}>
            <Text style={styles.btnText}>✅ Save Face</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.btn, styles.backBtn]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: { marginTop: 100, textAlign: "center", color: "#fff" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  subText: { fontSize: 14, fontWeight: "500", marginBottom: 4, textAlign: "center" },
  previewContainer: { alignItems: "center", marginVertical: 12 },
  previewImage: { width: 150, height: 150, borderRadius: 8, borderWidth: 3, borderColor: "#28a745", marginBottom: 6 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginVertical: 12 },
  editRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  captureBtn: { backgroundColor: "#ff6600" },
  switchBtn: { backgroundColor: "#17a2b8" },
  uploadBtn: { backgroundColor: "#6f42c1" },
  saveBtn: { backgroundColor: "#28a745", marginTop: 10 },
  backBtn: { backgroundColor: "#6c757d", marginTop: 6 },
  editBtn: { backgroundColor: "#007bff" },
});
