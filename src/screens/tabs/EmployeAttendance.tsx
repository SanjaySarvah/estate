import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import FaceDetector, { Face } from "@react-native-ml-kit/face-detection";
import { compareFace } from "../../helpers/photoProcessor";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CheckBox from "@react-native-community/checkbox";

export default function EmployeeAttendance() {
  const navigation = useNavigation();
  const frontCamera = useCameraDevice("front");
  const backCamera = useCameraDevice("back");
  const device = frontCamera ?? backCamera;
  const camera = useRef<Camera>(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setCameraActive] = useState(false);

  // Modal states
  const [initialModalVisible, setInitialModalVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "success" | "error" | "duplicate" | null
  >(null);
  const [matchedName, setMatchedName] = useState<string | null>(null);

  // Attendance type states
  const [checkInBeforeLunch, setCheckInBeforeLunch] = useState(false);
  const [checkOutBeforeLunch, setCheckOutBeforeLunch] = useState(false);
  const [checkInAfterLunch, setCheckInAfterLunch] = useState(false);
  const [checkOutAfterLunch, setCheckOutAfterLunch] = useState(false);

  // Request camera permission when screen is focused
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const camPermission = await Camera.requestCameraPermission();
        setHasPermission(camPermission === "granted");

        setInitialModalVisible(true);
        setCameraActive(false);
        setScanned(false);

        // reset all checkboxes
        setCheckInBeforeLunch(false);
        setCheckOutBeforeLunch(false);
        setCheckInAfterLunch(false);
        setCheckOutAfterLunch(false);
      })();

      return () => setCameraActive(false);
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
          const now = new Date();
          const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
          const currentTime = now.toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }); // HH:mm:ss

          const stored = await AsyncStorage.getItem("attendance");
          const attendance = stored ? JSON.parse(stored) : [];

          const context = getContextLabel();

          // Check if already marked
          const alreadyMarked = attendance.find(
            (entry: { name: string; date: string; context: string }) =>
              entry.name === name &&
              entry.date === today &&
              entry.context === context
          );

          if (alreadyMarked) {
            setModalType("duplicate");
            setMatchedName(name);
          } else {
            attendance.push({
              name,
              date: today,
              time: currentTime, // 👈 add scan time here
              context,
            });
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

  const getContextLabel = (): string => {
    const parts: string[] = [];
    if (checkInBeforeLunch) parts.push("Check In (Before Lunch)");
    if (checkOutBeforeLunch) parts.push("Check Out (Before Lunch)");
    if (checkInAfterLunch) parts.push("Check In (After Lunch)");
    if (checkOutAfterLunch) parts.push("Check Out (After Lunch)");
    return parts.join(", ") || "Unknown";
  };

  const handleStartScan = () => {
    if (
      !checkInBeforeLunch &&
      !checkOutBeforeLunch &&
      !checkInAfterLunch &&
      !checkOutAfterLunch
    ) {
      Alert.alert("Please select at least one option before scanning.");
      return;
    }

    setInitialModalVisible(false);
    setCameraActive(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setScanned(false);
    setMatchedName(null);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (!device) return <Text style={styles.centerText}>No Camera Found</Text>;
  if (!hasPermission)
    return <Text style={styles.centerText}>Camera Permission Denied</Text>;

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

      {/* Initial Modal */}
      <Modal visible={initialModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Attendance Type</Text>

            {/* Before Lunch */}
            <Text style={styles.sectionTitle}>Before Lunch</Text>
            <View style={styles.checkboxRow}>
              <CheckBoxWithLabel
                label="Check In"
                value={checkInBeforeLunch}
                onValueChange={setCheckInBeforeLunch}
              />
              <CheckBoxWithLabel
                label="Check Out"
                value={checkOutBeforeLunch}
                onValueChange={setCheckOutBeforeLunch}
              />
            </View>

            {/* After Lunch */}
            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
              After Lunch
            </Text>
            <View style={styles.checkboxRow}>
              <CheckBoxWithLabel
                label="Check In"
                value={checkInAfterLunch}
                onValueChange={setCheckInAfterLunch}
              />
              <CheckBoxWithLabel
                label="Check Out"
                value={checkOutAfterLunch}
                onValueChange={setCheckOutAfterLunch}
              />
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={handleStartScan}>
              <Text style={styles.modalBtnText}>Start Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
              <Text style={styles.backBtnText}>⬅ Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
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

            <TouchableOpacity style={styles.modalBtn} onPress={handleModalClose}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CheckBoxWithLabel = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => (
  <View style={styles.checkboxWithLabel}>
    <CheckBox value={value} onValueChange={onValueChange} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  centerText: { marginTop: 100, textAlign: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    marginTop: 12,
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
    width: "85%",
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
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  checkboxWithLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});
