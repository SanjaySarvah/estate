import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InternetCheck from '../components/InternetCheck'; // Your existing component

type EmployeeWeight = {
  id: string;
  name: string;
  workerId: string;
  profileImage: string;
  todayWeight: number;
  targetWeight: number;
  batch: 'high' | 'medium' | 'low'; // Performance batch
};

const WeightReportScreen = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeWeight[]>([]);
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  // Mock data fetch - replace with your API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockData: EmployeeWeight[] = [
          {
            id: '1',
            name: 'Kamal',
            workerId: 'KV001',
            profileImage: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
            todayWeight: 26.5,
            targetWeight: 25,
            batch: 'high'
          },
          {
            id: '2',
            name: 'Sinu',
            workerId: 'KV052',
            profileImage: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
            todayWeight: 18.2,
            targetWeight: 20,
            batch: 'medium'
          },
          {
            id: '3',
            name: 'Chittu',
            workerId: 'KV013',
            profileImage: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
            todayWeight: 12.8,
            targetWeight: 15,
            batch: 'low'
          },
        ];

        setEmployees(mockData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEmployees = filter === 'low' 
    ? employees.filter(emp => emp.batch === 'low')
    : employees;

  const renderItem = ({ item }: { item: EmployeeWeight }) => (
    <LinearGradient
      colors={['#ffffff', '#f5f7fa']}
      style={styles.employeeCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: item.profileImage }} 
          style={styles.profileImage} 
        />
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeId}>{item.workerId}</Text>
          <View style={styles.batchContainer}>
            <View style={[
              styles.batchIndicator,
              { 
                backgroundColor: 
                  item.batch === 'high' ? '#4CAF50' : 
                  item.batch === 'medium' ? '#FFC107' : '#F44336'
              }
            ]}>
              <Text style={styles.batchText}>
                {item.batch.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.weightContainer}>
        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Today's Weight:</Text>
          <Text style={styles.weightValue}>{item.todayWeight} kg</Text>
        </View>
        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Target:</Text>
          <Text style={styles.weightValue}>{item.targetWeight} kg</Text>
        </View>
        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Progress:</Text>
          <Text style={[
            styles.weightValue,
            { color: item.todayWeight >= item.targetWeight ? '#4CAF50' : '#F44336' }
          ]}>
            {((item.todayWeight / item.targetWeight) * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <InternetCheck>
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tea Weight Report</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString()}</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterText}>All Workers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'low' && styles.activeFilter]}
            onPress={() => setFilter('low')}
          >
            <Text style={styles.filterText}>Low Performers</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#fff" />
            <Text style={styles.statValue}>
              {employees.reduce((sum, emp) => sum + emp.todayWeight, 0).toFixed(1)} kg
            </Text>
            <Text style={styles.statLabel}>Total Collected</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#fff" />
            <Text style={styles.statValue}>
              {employees.filter(emp => emp.todayWeight >= emp.targetWeight).length}
            </Text>
            <Text style={styles.statLabel}>Targets Achieved</Text>
          </View>
        </View>

        {/* Employee List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <FlatList
            data={filteredEmployees}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </LinearGradient>
    </InternetCheck>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerDate: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 5,
  },
  activeFilter: {
    backgroundColor: '#dd5f16ff',
  },
  filterText: {
    color: '#fff',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 15,
    width: '45%',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
  },
  employeeCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
  },
  batchContainer: {
    marginTop: 5,
  },
  batchIndicator: {
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  batchText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  weightContainer: {
    marginTop: 10,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  weightLabel: {
    fontSize: 16,
    color: '#555',
  },
  weightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default WeightReportScreen;