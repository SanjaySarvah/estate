// src/components/CameraScanner.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Dimensions } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ScanType = "checkInBefore" | "checkInAfter" | "checkOutBefore" | "checkOutAfter" | null;

const { width, height } = Dimensions.get('window');

export default function CameraScanner() {
  const device = useCameraDevice("back");
  const [hasPermission, setHasPermission] = useState(false);
  const [scanType, setScanType] = useState<ScanType>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === "granted");
    })();
  }, []);

  const handleSelectScanType = () => {
    Alert.alert(
      "Select Action",
      "Choose Check In or Check Out",
      [
        {
          text: "Check In",
          onPress: () =>
            Alert.alert(
              "Check In Time",
              "Select Before Lunch or After Lunch",
              [
                { 
                  text: "Before Lunch", 
                  onPress: () => startScan("checkInBefore"),
                  style: 'default'
                },
                { 
                  text: "After Lunch", 
                  onPress: () => startScan("checkInAfter"),
                  style: 'default'
                },
                { 
                  text: "Cancel", 
                  style: "cancel" 
                }
              ]
            ),
        },
        {
          text: "Check Out",
          onPress: () =>
            Alert.alert(
              "Check Out Time",
              "Select Before Lunch or After Lunch",
              [
                { 
                  text: "Before Lunch", 
                  onPress: () => startScan("checkOutBefore"),
                  style: 'default'
                },
                { 
                  text: "After Lunch", 
                  onPress: () => startScan("checkOutAfter"),
                  style: 'default'
                },
                { 
                  text: "Cancel", 
                  style: "cancel" 
                }
              ]
            ),
        },
        { 
          text: "Cancel", 
          style: "cancel" 
        }
      ]
    );
  };

  const startScan = (type: ScanType) => {
    setScanType(type);
    setIsScanning(true);
  };

  const stopScan = () => {
    setIsScanning(false);
    setScanType(null);
  };

  if (!device) {
    return (
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.center}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name="camera-off" size={50} color="#fff" />
        <Text style={styles.errorText}>No camera device found</Text>
      </LinearGradient>
    );
  }

  if (!hasPermission) {
    return (
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.center}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name="no-photography" size={50} color="#fff" />
        <Text style={styles.errorText}>Camera permission not granted</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {isScanning ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isScanning}
            photo={true}
          />
          <View style={styles.overlay}>
            <View style={styles.scanIndicator}>
              <Text style={styles.scanText}>
                {scanType === "checkInBefore" && "Check In - Before Lunch"}
                {scanType === "checkInAfter" && "Check In - After Lunch"}
                {scanType === "checkOutBefore" && "Check Out - Before Lunch"}
                {scanType === "checkOutAfter" && "Check Out - After Lunch"}
              </Text>
            </View>
            <View style={styles.scanFrame} />
            <TouchableOpacity style={styles.stopButton} onPress={stopScan}>
              <LinearGradient
                colors={['#ff416c', '#ff4b2b']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="stop" size={24} color="#fff" />
                <Text style={styles.buttonText}>Stop Scan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <LinearGradient
          colors={['#6a11cb', '#2575fc']}
          style={styles.center}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.welcomeContainer}>
            <Icon name="camera-alt" size={60} color="#fff" style={styles.icon} />
            <Text style={styles.welcomeText}>Attendance Scanner</Text>
            <Text style={styles.subText}>Scan your QR code to record attendance</Text>
          </View>
          <TouchableOpacity onPress={handleSelectScanType}>
            <LinearGradient
              colors={["#ff9966", "#ff5e62"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="qr-code-scanner" size={24} color="#fff" />
              <Text style={styles.buttonText}>Start Scanning</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    width: '100%',
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    alignItems: "center",
    width: '100%',
  },
  scanIndicator: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  scanText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16,
    marginLeft: 10,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
  },
  stopButton: {
    width: '80%',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 30,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});