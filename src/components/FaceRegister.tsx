// src/components/FaceRegister.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Image } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function FaceRegister() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { workerId, name: existingName } = route.params || {};

  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [name, setName] = useState(existingName || "");
  const [photoPath, setPhotoPath] = useState("");

  useEffect(() => {
    (async () => {
      const camPermission = await Camera.requestCameraPermission();
      setHasPermission(camPermission === "granted");
    })();
  }, []);

  const capturePhoto = async () => {
    if (!camera.current || isProcessing) return;

    try {
      setProcessing(true);
      const photo = await camera.current.takePhoto();
      const photoUri = `file://${photo.path}`;
      setPhotoPath(photoUri);
      Toast.show({ type: "success", text1: "Photo Captured" });
    } catch (err) {
      console.log("Error capturing photo:", err);
      Toast.show({ type: "error", text1: "Failed to capture photo" });
    } finally {
      setProcessing(false);
    }
  };

  const saveEntry = async () => {
    if (!name || !photoPath) {
      Toast.show({ type: "error", text1: "Name & photo required" });
      return;
    }

    const entry = { 
      workerId, 
      name, 
      photoPath,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Get existing face entries
      const existing = await AsyncStorage.getItem("faceEntries");
      const parsed = existing ? JSON.parse(existing) : [];
      
      // Remove existing entry for this worker if exists
      const filtered = parsed.filter((item: any) => item.workerId !== workerId);
      
      // Add new entry
      filtered.push(entry);
      
      await AsyncStorage.setItem("faceEntries", JSON.stringify(filtered));
      Toast.show({ type: "success", text1: "Face Registered Successfully" });
      
      // Navigate back and refresh the employee list
      navigation.navigate('EmployeeRegistry', { refresh: true });
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Error saving face" });
    }
  };

  if (!device) return <Text style={styles.centerText}>No Camera Found</Text>;
  if (!hasPermission) return <Text style={styles.centerText}>Camera Permission Denied</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {isProcessing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <View style={styles.bottomSheet}>
        <Text style={styles.label}>Name: {name}</Text>
        <Text style={styles.label}>Worker ID: {workerId}</Text>

        {photoPath ? (
          <View style={styles.previewContainer}>
            <Text style={styles.label}>Photo Preview:</Text>
            <Image source={{ uri: photoPath }} style={styles.previewImage} />
          </View>
        ) : null}

        <TouchableOpacity style={styles.btn} onPress={capturePhoto}>
          <Text style={styles.btnText}>📸 Capture Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: photoPath ? "#28a745" : "#ccc" }]} 
          onPress={saveEntry}
          disabled={!photoPath}
        >
          <Text style={styles.btnText}>✅ Save Face</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: "#6c757d" }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: { marginTop: 100, textAlign: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "50%",
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#ff6600",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});