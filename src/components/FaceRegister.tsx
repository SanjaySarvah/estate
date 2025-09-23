// src/components/FaceRegister.tsx
import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { Camera } from "react-native-vision-camera";
import FaceDetector from "@react-native-ml-kit/face-detection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

type Props = {
  device: any;
  onClose: () => void;
};

export default function FaceRegister({ device, onClose }: Props) {
  const camera = useRef<Camera>(null);
  const [photoPath, setPhotoPath] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const capturePhoto = async () => {
    if (!camera.current) return;
    try {
      setProcessing(true);
      const photo = await camera.current.takePhoto();
      const photoUri = `file://${photo.path}`;

      const faces = await FaceDetector.detect(photoUri);
      if (faces.length > 0) {
        setPhotoPath(photoUri);
        setModalVisible(true);
      } else {
        Toast.show({ type: "error", text1: "No Face Detected" });
      }
      setProcessing(false);
    } catch (e) {
      setProcessing(false);
      console.log(e);
      Toast.show({ type: "error", text1: "Capture failed" });
    }
  };

  const saveEntry = async () => {
    const id = Date.now().toString();
    const entry = { id, name, photoPath };
    try {
      const existing = await AsyncStorage.getItem("faceEntries");
      const parsed = existing ? JSON.parse(existing) : [];
      parsed.push(entry);
      await AsyncStorage.setItem("faceEntries", JSON.stringify(parsed));
      Toast.show({ type: "success", text1: "Employee Registered" });
      setModalVisible(false);
      setName("");
      setPhotoPath("");
      onClose();
    } catch (err) {
      console.log(err);
      Toast.show({ type: "error", text1: "Error saving employee" });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      <TouchableOpacity
        style={styles.captureButton}
        onPress={capturePhoto}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Icon name="camera-alt" size={28} color="#fff" />
        )}
      </TouchableOpacity>

      {/* Modal for entering employee name */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.card}>
            <Image source={{ uri: photoPath }} style={styles.empImage} />
            <Text>Enter Employee Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
            />
            <TouchableOpacity
              style={[styles.saveBtn, !name && { backgroundColor: "grey" }]}
              disabled={!name}
              onPress={saveEntry}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  captureButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#ff4b2b",
    padding: 15,
    borderRadius: 35,
  },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  card: { backgroundColor: "#fff", margin: 20, padding: 20, borderRadius: 10, alignItems: "center" },
  empImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", width: "100%", padding: 10, marginVertical: 10 },
  saveBtn: { backgroundColor: "#ff4b2b", padding: 10, borderRadius: 8, width: "100%", alignItems: "center" }
});
