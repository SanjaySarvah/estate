import AsyncStorage from '@react-native-async-storage/async-storage';
import FaceDetector from "@react-native-ml-kit/face-detection";

// --- Utils for comparison ---
const dist = (p1: any, p2: any) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

const getFaceSignature = (face: any) => {
    const { landmarks, frame } = face;
    if (!landmarks || !frame) return null;

    // Bounding box center and scale
    const centerX = frame.left + frame.width / 2;
    const centerY = frame.top + frame.height / 2;
    const scale = frame.width; // normalize by face width

    // helper to normalize a landmark point
    const norm = (point: any) => ({
        x: (point.position.x - centerX) / scale,
        y: (point.position.y - centerY) / scale,
    });

    const leftEye = landmarks.leftEye && norm(landmarks.leftEye);
    const rightEye = landmarks.rightEye && norm(landmarks.rightEye);
    const nose = landmarks.noseBase && norm(landmarks.noseBase);
    const mouthLeft = landmarks.mouthLeft && norm(landmarks.mouthLeft);
    const mouthRight = landmarks.mouthRight && norm(landmarks.mouthRight);
    const mouthBottom = landmarks.mouthBottom && norm(landmarks.mouthBottom);

    if (!(leftEye && rightEye && nose && mouthLeft && mouthRight && mouthBottom))
        return null;

    // distances between normalized points
    const eyeDist = dist(leftEye, rightEye);
    const eyeNose = dist(nose, leftEye);
    const noseMouth = dist(nose, mouthBottom);
    const mouthWidth = dist(mouthLeft, mouthRight);

    return {
        eyeNose: eyeNose / eyeDist,
        noseMouth: noseMouth / eyeDist,
        mouthWidth: mouthWidth / eyeDist,
    };
};
const isSameFace = (sig1: any, sig2: any, threshold = 0.15) => {
    if (!sig1 || !sig2) return false;

    // helper to compute difference safely
    const safeDiff = (a: number | null, b: number | null) =>
        a !== null && b !== null ? Math.abs(a - b) : 0; // treat missing as 0

    const diff =
        safeDiff(sig1.eyeNose, sig2.eyeNose) +
        safeDiff(sig1.noseMouth, sig2.noseMouth) +
        safeDiff(sig1.mouthWidth, sig2.mouthWidth);

    return diff < threshold;
};



export const compareFace = async (uri: string) => {
    const existing = await AsyncStorage.getItem("faceEntries");
    if (!existing) return false;

    const parsed = JSON.parse(existing);

    const newFaces = await FaceDetector.detect(uri, {
        landmarkMode: 'all',
        classificationMode: 'all',
        performanceMode: 'accurate',
    });
    if (!newFaces.length) return "No face detected!";
    const newSig = getFaceSignature(newFaces[0]);

    for (const entry of parsed) {
        const oldFaces = await FaceDetector.detect(entry.photoPath, {
            landmarkMode: 'all',
            classificationMode: 'all',
            performanceMode: 'accurate',
        });

        if (!oldFaces.length) continue;
        const oldSig = getFaceSignature(oldFaces[0]);

        if (isSameFace(oldSig, newSig)) {
            return `Matched with ${entry.name}`;
        }
    }
    return false;
};
