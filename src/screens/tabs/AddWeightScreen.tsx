// src/screens/FaceEntries.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

interface FaceEntry {
  workerId: string;
  name: string;
  photoPath: string;
  timestamp: string;
}

export default function FaceEntries() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<FaceEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem("faceEntries");
      if (data) {
        setEntries(JSON.parse(data));
      }
    } catch (err) {
      console.log("Error loading entries:", err);
    }
  };

  const clearAll = async () => {
    await AsyncStorage.removeItem("faceEntries");
    setEntries([]);
  };

  const renderItem = ({ item }: { item: FaceEntry }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.photoPath }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.id}>Worker ID: {item.workerId}</Text>
        <Text style={styles.timestamp}>
          Registered: {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 Registered Faces</Text>

      {entries.length === 0 ? (
        <Text style={styles.empty}>No entries found</Text>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.workerId + index}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#6c757d" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btnText}>⬅ Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#dc3545" }]}
        onPress={clearAll}
      >
        <Text style={styles.btnText}>🗑 Clear All</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  empty: { textAlign: "center", marginTop: 50, color: "#666" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 60, height: 60, borderRadius: 30 },
  name: { fontSize: 16, fontWeight: "bold" },
  id: { fontSize: 14, color: "#555" },
  timestamp: { fontSize: 12, color: "#888" },
  btn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
