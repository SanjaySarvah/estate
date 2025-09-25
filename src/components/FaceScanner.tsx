  // src/components/FaceScanner.tsx
  import React, { useEffect, useRef, useState } from "react";
  import { View, StyleSheet, ActivityIndicator } from "react-native";
  import { Camera } from "react-native-vision-camera";
  import FaceDetector, { Face } from "@react-native-ml-kit/face-detection";
  import Toast from "react-native-toast-message";
  import { compareFace } from "../helpers/photoProcessor";

  type Props = {
    device: any;
    scanType: string;
    onClose: () => void;
  };

  export default function FaceScanner({ device, scanType, onClose }: Props) {
    const camera = useRef<Camera>(null);
    const [isProcessing, setProcessing] = useState(false);
    const [scanned, setScanned] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!scanned) {
      interval = setInterval(() => {
        captureAndDetect();
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanned]);


    const captureAndDetect = async () => {
      if (!camera.current || isProcessing) return;

      try {
        setProcessing(true);
        const photo = await camera.current.takePhoto();
        const photoUri = `file://${photo.path}`;

        const faces: Face[] = await FaceDetector.detect(photoUri);

        if (faces.length > 0) {
          const matchedName = await compareFace(photoUri);

          if (matchedName) {
            Toast.show({ type: "success", text1: "Face Match", text2: matchedName });
            setScanned(true);
            onClose();
          } else {
            Toast.show({ type: "error", text1: "No match found" });
          }
        }
      } catch (e) {
        console.log("Face scan error:", e);
      } finally {
        setProcessing(false);
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

        {isProcessing && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
    );
  }

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
  });
