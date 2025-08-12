// src/screens/Summary.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import * as Progress from 'react-native-progress';

const { width } = Dimensions.get('window');

type DivisionData = {
  division: string;
  totalEmployees: number;
  present: number;
  absent: number;
};

type AttendanceSlots = {
  checkInBeforeLunch: number;
  checkInAfterLunch: number;
  checkOutBeforeLunch: number;
  checkOutAfterLunch: number;
};

type WeightReport = {
  month: string;
  totalWeightKg: number;
  averagePerEmployee: number;
  targetWeight: number;
};

export default function Summary() {
  const [divisionList, setDivisionList] = useState<DivisionData[]>([]);
  const [attendanceSlots, setAttendanceSlots] = useState<AttendanceSlots>({
    checkInBeforeLunch: 0,
    checkInAfterLunch: 0,
    checkOutBeforeLunch: 0,
    checkOutAfterLunch: 0,
  });
  const [weightReport, setWeightReport] = useState<WeightReport>({
    month: "August 2025",
    totalWeightKg: 0,
    averagePerEmployee: 0,
    targetWeight: 1500,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Dummy sample data (replace with AsyncStorage.getItem later)
    const sampleDivisionData: DivisionData[] = [
      { division: "Batalada", totalEmployees: 35, present: 32, absent: 3 },
      { division: "Balada", totalEmployees: 28, present: 27, absent: 1 },
      // { division: "Sundarapatti", totalEmployees: 40, present: 39, absent: 1 },
    ];

    const sampleAttendance: AttendanceSlots = {
      checkInBeforeLunch: 90,
      checkInAfterLunch: 85,
      checkOutBeforeLunch: 88,
      checkOutAfterLunch: 86,
    };

    const sampleWeight: WeightReport = {
      month: "August 2025",
      totalWeightKg: 1280,
      averagePerEmployee: 14.2,
      targetWeight: 1500,
    };

    setDivisionList(sampleDivisionData);
    setAttendanceSlots(sampleAttendance);
    setWeightReport(sampleWeight);
  }, []);

  const getAttendancePercentage = (present: number, total: number) => {
    return Math.round((present / total) * 100);
  };

  const renderOverviewTab = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Header with Stats */}
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.headerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Monthly Overview</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Ionicons name="people-outline" size={24} color="#fff" />
            <Text style={styles.headerStatText}>
              {divisionList.reduce((sum, div) => sum + div.totalEmployees, 0)} Employees
            </Text>
          </View>
          <View style={styles.headerStatItem}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
            <Text style={styles.headerStatText}>
              {divisionList.reduce((sum, div) => sum + div.present, 0)} Present
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Attendance Slots */}
      <Text style={styles.sectionTitle}>Attendance Slots</Text>
      <View style={styles.cardRow}>
        {Object.entries(attendanceSlots).map(([key, value], index) => (
          <TouchableOpacity key={index} activeOpacity={0.9} style={styles.cardTouchable}>
            <LinearGradient
               colors={["#ff9966", "#ff5e62"]}
              style={[styles.card, styles.cardWithShadow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={
                  key.includes("checkIn") ? "log-in-outline" : "log-out-outline"
                }
                size={26}
                color="#fff"
              />
              <Text style={styles.cardTitle}>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </Text>
              <Text style={styles.cardValue}>{value}%</Text>
              <Progress.Circle 
                size={60} 
                progress={value / 100} 
                color="#fff" 
                thickness={4} 
                borderWidth={0}
                showsText
                formatText={() => `${value}%`}
                style={styles.progressCircle}
                textStyle={styles.circleText}
              />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Division-wise Count */}
      <Text style={styles.sectionTitle}>Division Wise Employees</Text>
      {divisionList.map((div, index) => {
        const attendancePercentage = getAttendancePercentage(div.present, div.totalEmployees);
        return (
          <TouchableOpacity key={index} activeOpacity={0.9}>
            <LinearGradient
            colors={['#6a11cb', '#2575fc']}
              style={[styles.divisionCard, styles.cardWithShadow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.divisionHeader}>
                <Text style={styles.divisionName}>{div.division}</Text>
                <Text style={styles.divisionPercentage}>{attendancePercentage}%</Text>
              </View>
              <Progress.Bar 
                progress={attendancePercentage / 100} 
                width={width - 60} 
                height={8}
                color="#fff" 
                borderRadius={4}
                borderWidth={0}
              />
              <View style={styles.divisionStats}>
                <View style={styles.statItem}>
                  <Ionicons name="people-outline" size={16} color="#fff" />
                  <Text style={styles.divisionText}>Total: {div.totalEmployees}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Text style={styles.divisionText}>Present: {div.present}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="close-outline" size={16} color="#fff" />
                  <Text style={styles.divisionText}>Absent: {div.absent}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );

  const renderWeightTab = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Weight Report */}
      <Text style={styles.sectionTitle}>This Month's Weight Report</Text>
      <LinearGradient
        colors={["#ff9966", "#ff5e62"]}
        style={[styles.weightCard, styles.cardWithShadow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.weightHeader}>
          <Ionicons name="leaf-outline" size={28} color="#fff" />
          <Text style={styles.weightMonth}>{weightReport.month}</Text>
        </View>
        
        <View style={styles.weightProgressContainer}>
          <Progress.Circle 
            size={width * 0.5} 
            progress={weightReport.totalWeightKg / weightReport.targetWeight} 
            color="#fff" 
            thickness={12} 
            borderWidth={0}
            showsText
            formatText={() => `${Math.round((weightReport.totalWeightKg / weightReport.targetWeight) * 100)}%`}
            textStyle={styles.progressText}
          />
          <View style={styles.weightStats}>
            <Text style={styles.weightStatText}>
              🌱 Collected: {weightReport.totalWeightKg} kg
            </Text>
            <Text style={styles.weightStatText}>
              🎯 Target: {weightReport.targetWeight} kg
            </Text>
            <Text style={styles.weightStatText}>
              ⚖️ Avg/Employee: {weightReport.averagePerEmployee} kg
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons name="stats-chart-outline" size={20} color={activeTab === 'overview' ? '#6a11cb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'weight' && styles.activeTab]}
          onPress={() => setActiveTab('weight')}
        >
          <Ionicons name="leaf-outline" size={20} color={activeTab === 'weight' ? '#6a11cb' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'weight' && styles.activeTabText]}>Weight</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' ? renderOverviewTab() : renderWeightTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#444",
    marginLeft: 5,
  },
  cardRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTouchable: {
    width: '48%',
    marginBottom: 15,
  },
  card: {
    width: '100%',
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: 'center',
    aspectRatio: 1,
  },
  cardWithShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  cardTitle: { 
    fontSize: 14, 
    color: "#fff", 
    textAlign: "center",
    marginTop: 10,
    fontWeight: '500',
  },
  cardValue: { 
    fontSize: 24, 
    color: "#fff", 
    fontWeight: "bold", 
    marginTop: 5,
    marginBottom: 10,
  },
  progressCircle: {
    marginTop: 5,
  },
  circleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divisionCard: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
  },
  divisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  divisionName: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  divisionPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  divisionStats: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divisionText: { 
    color: "#fff", 
    fontSize: 14,
    marginLeft: 5,
  },
  weightCard: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
  },
  weightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weightMonth: {
    color: "#fff", 
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  weightProgressContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  weightStats: {
    marginTop: 20,
    width: '100%',
  },
  weightStatText: {
    color: "#fff", 
    fontSize: 16,
    marginVertical: 5,
  },
  progressText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#6a11cb',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#6a11cb',
    fontWeight: 'bold',
  },
});