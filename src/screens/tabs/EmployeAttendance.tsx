import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import FaceDetector, { Face } from "@react-native-ml-kit/face-detection";
import { compareFace } from "../../helpers/photoProcessor";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EmployeeAttendance() {
  const navigation = useNavigation();
  const frontCamera = useCameraDevice("front");
  const backCamera = useCameraDevice("back");
  const device = frontCamera ?? backCamera;
  const camera = useRef<Camera>(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setCameraActive] = useState(true);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "success" | "error" | "duplicate" | null
  >(null);
  const [matchedName, setMatchedName] = useState<string | null>(null);

  // Request permission once
  useEffect(() => {
    (async () => {
      const camPermission = await Camera.requestCameraPermission();
      setHasPermission(camPermission === "granted");
    })();
  }, []);

  // Auto start/stop camera on screen focus
  useFocusEffect(
    useCallback(() => {
      setCameraActive(true); // when screen focused
      return () => {
        setCameraActive(false); // when screen blurred / navigated away
      };
    }, [])
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (hasPermission && !scanned && isCameraActive) {
      interval = setInterval(() => {
        captureAndDetect();
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasPermission, scanned, isCameraActive]);

  const captureAndDetect = async () => {
    if (!camera.current || isProcessing) return;

    try {
      setProcessing(true);
      const photo = await camera.current.takePhoto();
      const photoUri = `file://${photo.path}`;
      const faces: Face[] = await FaceDetector.detect(photoUri);

      if (faces.length > 0) {
        const name = await compareFace(photoUri);

        if (name) {
          const today = new Date().toISOString().split("T")[0];
          const stored = await AsyncStorage.getItem("attendance");
          const attendance = stored ? JSON.parse(stored) : [];

          const alreadyMarked = attendance.find(
            (entry: { name: string; date: string }) =>
              entry.name === name && entry.date === today
          );

          if (alreadyMarked) {
            setModalType("duplicate");
            setMatchedName(name);
          } else {
            attendance.push({ name, date: today, time: new Date().toISOString() });
            await AsyncStorage.setItem("attendance", JSON.stringify(attendance));
            setModalType("success");
            setMatchedName(name);
          }

          setModalVisible(true);
          setScanned(true);
        } else {
          setModalType("error");
          setModalVisible(true);
        }
      }
    } catch (e) {
      console.log("Face scan error:", e);
    } finally {
      setProcessing(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setScanned(false);
    setMatchedName(null);
  };

  const handleGoBack = () => {
    navigation.goBack(); // useFocusEffect will stop camera automatically
  };

  if (!device) return <Text style={styles.centerText}>No Camera Found</Text>;
  if (!hasPermission) return <Text style={styles.centerText}>Camera Permission Denied</Text>;

  return (
    <View style={{ flex: 1 }}>
      {isCameraActive && (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!scanned}
          photo={true}
        />
      )}

      {isProcessing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            {modalType === "success" && (
              <>
                <Text style={styles.successText}>✅ Attendance Marked</Text>
                <Text style={styles.nameText}>{matchedName}</Text>
              </>
            )}

            {modalType === "error" && (
              <>
                <Text style={styles.errorText}>❌ No Match Found</Text>
                <Text style={styles.nameText}>Please try again</Text>
              </>
            )}

            {modalType === "duplicate" && (
              <>
                <Text style={styles.errorText}>⚠ Already Marked</Text>
                <Text style={styles.nameText}>{matchedName} - Today</Text>
              </>
            )}

            <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
              <Text style={styles.backBtnText}>⬅ Go Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={handleModalClose}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backBtn: {
    marginBottom: 12,
    backgroundColor: "#444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  successText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    marginBottom: 10,
  },
  nameText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
