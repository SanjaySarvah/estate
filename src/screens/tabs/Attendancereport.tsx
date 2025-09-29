import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";

type AttendanceRecord = {
  id: string;
  workerId: string;
  name: string;
  checkInBeforeLunch: string | null;
  checkInAfterLunch: string | null;
  checkOutBeforeLunch: string | null;
  checkOutAfterLunch: string | null;
  date: string;
};

export default function AttendanceReport() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [editData, setEditData] = useState({
    checkInBeforeLunch: "",
    checkInAfterLunch: "",
    checkOutBeforeLunch: "",
    checkOutAfterLunch: "",
  });
  const fadeAnim = useState(new Animated.Value(0))[0];

  // ✅ Format times properly (AM/PM or fallback)
  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    if (moment(time, moment.ISO_8601, true).isValid()) {
      return moment(time).format("hh:mm A");
    }
    if (moment(time, "HH:mm", true).isValid()) {
      return moment(time, "HH:mm").format("hh:mm A");
    }
    if (moment(time, "h:mm A", true).isValid()) {
      return moment(time, "h:mm A").format("hh:mm A");
    }
    return time;
  };

  // Load attendance from AsyncStorage
  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem("attendance");
      if (stored) {
        const parsed: AttendanceRecord[] = JSON.parse(stored);
        const filtered = parsed.filter((a) => a.date === selectedDate);
        setAttendanceData(filtered);
        setFilteredData(filtered);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setAttendanceData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.log("Error loading attendance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(attendanceData);
    } else {
      const filtered = attendanceData.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.workerId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, attendanceData]);

  const handleDateChange = (days: number) => {
    const newDate = moment(selectedDate).add(days, "days").format("YYYY-MM-DD");
    setSelectedDate(newDate);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setCurrentRecord(record);
    setEditData({
      checkInBeforeLunch: record.checkInBeforeLunch || "",
      checkInAfterLunch: record.checkInAfterLunch || "",
      checkOutBeforeLunch: record.checkOutBeforeLunch || "",
      checkOutAfterLunch: record.checkOutAfterLunch || "",
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const updatedData = attendanceData.filter((item) => item.id !== id);
    setAttendanceData(updatedData);
    setFilteredData(updatedData);
    await AsyncStorage.setItem("attendance", JSON.stringify(updatedData));
  };

  const handleSave = async () => {
    if (!currentRecord) return;

    const updatedData = attendanceData.map((item) => {
      if (item.id === currentRecord.id) {
        return {
          ...item,
          checkInBeforeLunch: editData.checkInBeforeLunch || null,
          checkInAfterLunch: editData.checkInAfterLunch || null,
          checkOutBeforeLunch: editData.checkOutBeforeLunch || null,
          checkOutAfterLunch: editData.checkOutAfterLunch || null,
        };
      }
      return item;
    });

    setAttendanceData(updatedData);
    setFilteredData(updatedData);
    await AsyncStorage.setItem("attendance", JSON.stringify(updatedData));
    setIsModalVisible(false);
    Alert.alert("Success", "Attendance updated successfully!");
  };

  const renderStatusIcon = (time: string | null) => {
    if (time) {
      return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
    }
    return <Ionicons name="close-circle" size={20} color="#F44336" />;
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <LinearGradient colors={["#f5f7fa", "#e4e8f0"]} style={styles.cardGradient}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.employeeName}>{item.name}</Text>
            <Text style={styles.employeeId}>{item.workerId}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AM */}
        <View style={styles.attendanceRow}>
          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check In (AM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.checkInBeforeLunch)}
              <Text style={styles.timeText}>{formatTime(item.checkInBeforeLunch)}</Text>
            </View>
          </View>
          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check Out (AM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.checkOutBeforeLunch)}
              <Text style={styles.timeText}>{formatTime(item.checkOutBeforeLunch)}</Text>
            </View>
          </View>
        </View>

        {/* PM */}
        <View style={styles.attendanceRow}>
          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check In (PM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.checkInAfterLunch)}
              <Text style={styles.timeText}>{formatTime(item.checkInAfterLunch)}</Text>
            </View>
          </View>
          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check Out (PM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.checkOutAfterLunch)}
              <Text style={styles.timeText}>{formatTime(item.checkOutAfterLunch)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Attendance Report</Text>
            <TouchableOpacity onPress={loadAttendance} style={styles.syncButton}>
              <Ionicons name="sync" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.dateNavigator}>
            <TouchableOpacity onPress={() => handleDateChange(-1)}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{moment(selectedDate).format("DD MMM YYYY")}</Text>
            <TouchableOpacity onPress={() => handleDateChange(1)}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Summary */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Present</Text>
            <Text style={styles.summaryValue}>
              {attendanceData.filter((a) => a.checkInBeforeLunch || a.checkInAfterLunch).length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Full Day</Text>
            <Text style={styles.summaryValue}>
              {attendanceData.filter((a) => a.checkInBeforeLunch && a.checkOutAfterLunch).length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Half Day</Text>
            <Text style={styles.summaryValue}>
              {
                attendanceData.filter(
                  (a) =>
                    (a.checkInBeforeLunch && !a.checkOutAfterLunch) ||
                    (!a.checkInBeforeLunch && a.checkInAfterLunch)
                ).length
              }
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Absent</Text>
            <Text style={styles.summaryValue}>
              {attendanceData.filter((a) => !a.checkInBeforeLunch && !a.checkInAfterLunch).length}
            </Text>
          </View>
        </ScrollView>

        {/* Attendance List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#fff" />
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Edit Modal */}
        <Modal animationType="slide" transparent visible={isModalVisible}>
          <View style={styles.modalContainer}>
            <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Attendance</Text>
              {currentRecord && (
                <>
                  <Text style={styles.modalEmployee}>
                    {currentRecord.name} ({currentRecord.workerId})
                  </Text>
                  {["checkInBeforeLunch", "checkOutBeforeLunch", "checkInAfterLunch", "checkOutAfterLunch"].map(
                    (field, idx) => (
                      <View key={idx} style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>{field.replace(/([A-Z])/g, " $1")}:</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={(editData as any)[field]}
                          onChangeText={(text) => setEditData({ ...editData, [field]: text })}
                          placeholder="HH:MM"
                          placeholderTextColor="#aaa"
                        />
                      </View>
                    )
                  )}
                  <View style={styles.modalButtons}>
                    <Pressable
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setIsModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
                      <Text style={styles.buttonText}>Save</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </LinearGradient>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  syncButton: { backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 20 },
  dateNavigator: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  dateText: { fontSize: 18, color: "#fff", marginHorizontal: 15, fontWeight: "500" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  summaryContainer: { marginBottom: 15 },
  summaryCard: {
    width: 120,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: "center",
  },
  summaryTitle: { fontSize: 14, color: "#fff", marginBottom: 5, fontWeight: "500" },
  summaryValue: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  listContainer: { paddingBottom: 20 },
  card: { marginBottom: 15, borderRadius: 12, overflow: "hidden" },
  cardGradient: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  employeeName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  employeeId: { fontSize: 14, color: "#666" },
  actionButtons: { flexDirection: "row" },
  editButton: { backgroundColor: "#4CAF50", padding: 6, borderRadius: 20, marginRight: 8 },
  deleteButton: { backgroundColor: "#F44336", padding: 6, borderRadius: 20 },
  attendanceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  attendanceSlot: { width: "48%" },
  slotTitle: { fontSize: 14, color: "#666", marginBottom: 5 },
  slotValue: { flexDirection: "row", alignItems: "center" },
  timeText: { fontSize: 16, fontWeight: "500", color: "#333", marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#fff", marginTop: 10 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "90%", padding: 20, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 15, textAlign: "center" },
  modalEmployee: { fontSize: 16, color: "#fff", marginBottom: 20, textAlign: "center", fontWeight: "500" },
  timeInputContainer: { marginBottom: 15 },
  timeLabel: { fontSize: 14, color: "#fff", marginBottom: 5 },
  timeInput: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, padding: 10, color: "#fff" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#F44336", marginRight: 10 },
  saveButton: { backgroundColor: "#4CAF50" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
