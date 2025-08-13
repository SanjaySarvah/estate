import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

type Employee = {
  id: string;
  workerId: string;
  name: string;
  profileImage: string;
};

type AttendanceRecord = {
  id: string;
  employeeId: string;
  checkInBeforeLunch: string | null;
  checkInAfterLunch: string | null;
  checkOutBeforeLunch: string | null;
  checkOutAfterLunch: string | null;
  morningWeight: number | null;
  eveningWeight: number | null;
  date: string;
};

type EmployeeWithAttendance = Employee & {
  attendance?: AttendanceRecord;
  totalWeight?: number | null;
};

export default function AttendanceReport() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'weight'>('attendance');
  const [employees, setEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeWithAttendance | null>(null);
  const [weightData, setWeightData] = useState({
    morning: '',
    evening: ''
  });
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Sample employee data with profile images
  const sampleEmployees: Employee[] = [
    {
      id: '1',
      workerId: 'KV001',
      name: 'Kamal',
      profileImage: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
    },
    {
      id: '2',
      workerId: 'KV052',
      name: 'Sinu',
      profileImage: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
    },
    {
      id: '3',
      workerId: 'KV013',
      name: 'Chittu',
      profileImage: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
    },
  ];

  // Sample attendance data
  const sampleAttendance: AttendanceRecord[] = [
    {
      id: '1',
      employeeId: '1',
      checkInBeforeLunch: '08:45',
      checkInAfterLunch: '13:15',
      checkOutBeforeLunch: '12:30',
      checkOutAfterLunch: '17:45',
      morningWeight: 12.5,
      eveningWeight: 8.2,
      date: selectedDate
    },
    {
      id: '2',
      employeeId: '2',
      checkInBeforeLunch: '09:00',
      checkInAfterLunch: '13:30',
      checkOutBeforeLunch: null,
      checkOutAfterLunch: '18:00',
      morningWeight: 10.8,
      eveningWeight: null,
      date: selectedDate
    },
    {
      id: '3',
      employeeId: '3',
      checkInBeforeLunch: '08:30',
      checkInAfterLunch: null,
      checkOutBeforeLunch: '12:45',
      checkOutAfterLunch: null,
      morningWeight: null,
      eveningWeight: 7.5,
      date: selectedDate
    },
  ];

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Merge employee data with attendance records
      const mergedData = sampleEmployees.map(employee => {
        const attendance = sampleAttendance.find(a => a.employeeId === employee.id);
        const totalWeight = attendance 
          ? (attendance.morningWeight ?? 0) + (attendance.eveningWeight ?? 0)
          : null;
        return {
          ...employee,
          attendance,
          totalWeight: totalWeight && totalWeight > 0 ? totalWeight : null
        };
      });

      setEmployees(mergedData);
      setFilteredEmployees(mergedData);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Real-time search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.workerId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const handleDateChange = (days: number) => {
    const newDate = moment(selectedDate).add(days, 'days').format('YYYY-MM-DD');
    setSelectedDate(newDate);
  };

  const handleSync = () => {
    fetchData();
  };

  const openWeightModal = (employee: EmployeeWithAttendance) => {
    setCurrentEmployee(employee);
    setWeightData({
      morning: employee.attendance?.morningWeight?.toString() ?? '',
      evening: employee.attendance?.eveningWeight?.toString() ?? ''
    });
    setIsWeightModalVisible(true);
  };

  const saveWeightData = () => {
    if (!currentEmployee) return;
    
    const updatedEmployees = employees.map(emp => {
      if (emp.id === currentEmployee.id) {
        const morning = weightData.morning ? parseFloat(weightData.morning) : null;
        const evening = weightData.evening ? parseFloat(weightData.evening) : null;
        const totalWeight = (morning ?? 0) + (evening ?? 0);
        
        return {
          ...emp,
          attendance: {
            ...(emp.attendance || {
              id: `${emp.id}-${selectedDate}`,
              employeeId: emp.id,
              date: selectedDate,
              checkInBeforeLunch: null,
              checkInAfterLunch: null,
              checkOutBeforeLunch: null,
              checkOutAfterLunch: null,
              morningWeight: null,
              eveningWeight: null
            }),
            morningWeight: morning,
            eveningWeight: evening
          },
          totalWeight: totalWeight > 0 ? totalWeight : null
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
    setIsWeightModalVisible(false);
  };

  const renderStatusIcon = (time: string | null) => {
    if (time) {
      return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
    }
    return <Ionicons name="close-circle" size={20} color="#F44336" />;
  };

  const renderWeightIndicator = (weight: number | null | undefined) => {
    if (weight !== null && weight !== undefined) {
      return <Text style={styles.weightText}>{weight} kg</Text>;
    }
    return <Text style={styles.weightText}>--</Text>;
  };

  const renderAttendanceItem = ({ item }: { item: EmployeeWithAttendance }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#f5f7fa', '#e4e8f0']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.employeeInfo}>
            <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
            <View>
              <Text style={styles.employeeName}>{item.name}</Text>
              <Text style={styles.employeeId}>{item.workerId}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => openWeightModal(item)} 
            style={styles.weightButton}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6a11cb" />
          </TouchableOpacity>
        </View>

        <View style={styles.attendanceRow}>
          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check In (AM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.attendance?.checkInBeforeLunch ?? null)}
              <Text style={styles.timeText}>
                {item.attendance?.checkInBeforeLunch ?? '--:--'}
              </Text>
            </View>
          </View>

          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check Out (AM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.attendance?.checkOutBeforeLunch ?? null)}
              <Text style={styles.timeText}>
                {item.attendance?.checkOutBeforeLunch ?? '--:--'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceRow}>
          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check In (PM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.attendance?.checkInAfterLunch ?? null)}
              <Text style={styles.timeText}>
                {item.attendance?.checkInAfterLunch ?? '--:--'}
              </Text>
            </View>
          </View>

          <View style={styles.attendanceSlot}>
            <Text style={styles.slotTitle}>Check Out (PM)</Text>
            <View style={styles.slotValue}>
              {renderStatusIcon(item.attendance?.checkOutAfterLunch ?? null)}
              <Text style={styles.timeText}>
                {item.attendance?.checkOutAfterLunch ?? '--:--'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderWeightItem = ({ item }: { item: EmployeeWithAttendance }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#f5f7fa', '#e4e8f0']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.employeeInfo}>
            <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
            <View>
              <Text style={styles.employeeName}>{item.name}</Text>
              <Text style={styles.employeeId}>{item.workerId}</Text>
            </View>
          </View>
          <View style={styles.totalWeightContainer}>
            <Text style={styles.totalWeightLabel}>Total:</Text>
            {renderWeightIndicator(item.totalWeight)}
          </View>
        </View>

        <View style={styles.weightRow}>
          <View style={styles.weightSlot}>
            <Text style={styles.slotTitle}>Morning Weight</Text>
            <View style={styles.slotValue}>
              {renderWeightIndicator(item.attendance?.morningWeight)}
            </View>
          </View>

          <View style={styles.weightSlot}>
            <Text style={styles.slotTitle}>Evening Weight</Text>
            <View style={styles.slotValue}>
              {renderWeightIndicator(item.attendance?.eveningWeight)}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => openWeightModal(item)} 
          style={styles.updateWeightButton}
        >
          <Text style={styles.updateWeightButtonText}>Update Weight</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Tea Estate Management</Text>
            <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
              <Ionicons name="sync" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.dateNavigator}>
            <TouchableOpacity onPress={() => handleDateChange(-1)}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.dateText}>
              {moment(selectedDate).format('DD MMM YYYY')}
            </Text>
            <TouchableOpacity onPress={() => handleDateChange(1)}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'attendance' && styles.activeTab]}
            onPress={() => setActiveTab('attendance')}
          >
            <Ionicons 
              name="time-outline" 
              size={20} 
              color={activeTab === 'attendance' ? '#6a11cb' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
              Attendance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'weight' && styles.activeTab]}
            onPress={() => setActiveTab('weight')}
          >
            <Ionicons 
              name="leaf-outline" 
              size={20} 
              color={activeTab === 'weight' ? '#6a11cb' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'weight' && styles.activeTabText]}>
              Tea Weight
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
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
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Summary Cards */}
      {/* Summary Cards */}
{/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>Present</Text>
    <Text style={styles.summaryValue}>
      {employees.filter(e => 
        e.attendance?.checkInBeforeLunch || e.attendance?.checkInAfterLunch
      ).length}
    </Text>
  </View>
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>Total Weight</Text>
    <Text style={styles.summaryValue}>
      {employees.reduce((sum, emp) => sum + (emp.totalWeight ?? 0), 0).toFixed(1)} kg
    </Text>
  </View>
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>Avg/Employee</Text>
    <Text style={styles.summaryValue}>
      {(
        employees.reduce((sum, emp) => sum + (emp.totalWeight ?? 0), 0) / 
        Math.max(1, employees.filter(e => e.totalWeight !== null).length)
      ).toFixed(1)} kg
    </Text>
  </View>
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>Absent</Text>
    <Text style={styles.summaryValue}>
      {employees.filter(e => 
        !e.attendance?.checkInBeforeLunch && !e.attendance?.checkInAfterLunch
      ).length}
    </Text>
  </View>
</ScrollView> */}

        {/* Employee List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : filteredEmployees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#fff" />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEmployees}
            renderItem={activeTab === 'attendance' ? renderAttendanceItem : renderWeightItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Weight Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isWeightModalVisible}
          onRequestClose={() => setIsWeightModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#6a11cb', '#2575fc']}
              style={styles.modalContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modalTitle}>Record Tea Weight</Text>
              
              {currentEmployee && (
                <>
                  <View style={styles.modalEmployeeInfo}>
                    <Image 
                      source={{ uri: currentEmployee.profileImage }} 
                      style={styles.modalProfileImage} 
                    />
                    <View>
                      <Text style={styles.modalEmployeeName}>{currentEmployee.name}</Text>
                      <Text style={styles.modalEmployeeId}>{currentEmployee.workerId}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.weightInputContainer}>
                    <Text style={styles.weightLabel}>Morning Weight (kg):</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={weightData.morning}
                      onChangeText={text => setWeightData({...weightData, morning: text})}
                      placeholder="0.0"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.weightInputContainer}>
                    <Text style={styles.weightLabel}>Evening Weight (kg):</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={weightData.evening}
                      onChangeText={text => setWeightData({...weightData, evening: text})}
                      placeholder="0.0"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.modalButtons}>
                    <Pressable
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setIsWeightModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={saveWeightData}
                    >
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
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 18,
    color: '#fff',
    marginHorizontal: 15,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#6a11cb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6a11cb',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  summaryContainer: {
    marginBottom: 15,
  },
  summaryCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
  },
  weightButton: {
    backgroundColor: 'rgba(106, 17, 203, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  totalWeightContainer: {
    alignItems: 'flex-end',
  },
  totalWeightLabel: {
    fontSize: 12,
    color: '#666',
  },
  weightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  attendanceSlot: {
    width: '48%',
  },
  weightSlot: {
    width: '48%',
    alignItems: 'center',
  },
  slotTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  slotValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  updateWeightButton: {
    backgroundColor: '#6a11cb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateWeightButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalEmployeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  modalEmployeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalEmployeeId: {
    fontSize: 14,
    color: '#ddd',
  },
  weightInputContainer: {
    marginBottom: 15,
  },
  weightLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  weightInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});