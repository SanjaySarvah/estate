// src/components/FetchEntries.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

type Entry = {
  id: string;
  name: string;
  photoPath: string;
};

export default function FetchEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);

  // Fetch entries from AsyncStorage
  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem("faceEntries");
      const parsed: Entry[] = data ? JSON.parse(data) : [];
      setEntries(parsed);
    } catch (err) {
      console.log("Error fetching entries:", err);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  // Delete entry
  const deleteEntry = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = entries.filter((item) => item.id !== id);
              await AsyncStorage.setItem("faceEntries", JSON.stringify(updated));
              setEntries(updated);
            } catch (err) {
              console.log("Error deleting entry:", err);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Entry }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.photoPath }} style={styles.photo} />
      <Text style={styles.name}>{item.name}</Text>
      <TouchableOpacity onPress={() => deleteEntry(item.id)} style={styles.deleteBtn}>
        <Icon name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {entries.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 50 }}>No entries found.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  photo: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  name: { fontSize: 16, fontWeight: "600", flex: 1 },
  deleteBtn: { padding: 5 },
});
