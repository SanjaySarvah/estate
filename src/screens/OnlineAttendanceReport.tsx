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
  Image,
  Modal,
  Pressable,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';
import moment from 'moment';
import InternetCheck from '../components/InternetCheck'; 





const { width } = Dimensions.get('window');

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
  date: string;
};

type EmployeeWithAttendance = Employee & {
  attendance?: AttendanceRecord;
  workedHours?: number | null;
};

const DEFAULT_PROFILE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

export default function AttendanceReport() {
  const [employees, setEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [filters, setFilters] = useState({
    checkInBeforeLunch: false,
    checkInAfterLunch: false,
    checkOutBeforeLunch: false,
    checkOutAfterLunch: false,
    extraHours: false
  });

  // Sample data
  const sampleEmployees: Employee[] = [
    { id: '1', workerId: 'KV001', name: 'Kamal', profileImage: DEFAULT_PROFILE_IMAGE },
    { id: '2', workerId: 'KV052', name: 'Sinu', profileImage: DEFAULT_PROFILE_IMAGE },
    { id: '3', workerId: 'KV013', name: 'Chittu', profileImage: DEFAULT_PROFILE_IMAGE },
  ];

  const sampleAttendance: AttendanceRecord[] = [
    {
      id: '1',
      employeeId: '1',
      checkInBeforeLunch: '08:45',
      checkInAfterLunch: '13:15',
      checkOutBeforeLunch: '12:30',
      checkOutAfterLunch: '17:45',
      date: selectedDate
    },
    {
      id: '2',
      employeeId: '2',
      checkInBeforeLunch: '09:00',
      checkInAfterLunch: '13:30',
      checkOutBeforeLunch: null,
      checkOutAfterLunch: '18:00',
      date: selectedDate
    },
    {
      id: '3',
      employeeId: '3',
      checkInBeforeLunch: '08:30',
      checkInAfterLunch: null,
      checkOutBeforeLunch: '12:45',
      checkOutAfterLunch: null,
      date: selectedDate
    },
  ];

  const calculateWorkedHours = (attendance: AttendanceRecord | undefined): number | null => {
    if (!attendance) return null;
    
    const { checkInBeforeLunch, checkOutAfterLunch } = attendance;
    if (!checkInBeforeLunch || !checkOutAfterLunch) return null;

    const start = moment(checkInBeforeLunch, 'HH:mm');
    const end = moment(checkOutAfterLunch, 'HH:mm');
    return end.diff(start, 'hours', true);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mergedData = sampleEmployees.map(employee => {
        const attendance = sampleAttendance.find(a => a.employeeId === employee.id);
        return {
          ...employee,
          attendance,
          workedHours: calculateWorkedHours(attendance)
        };
      });

      setEmployees(mergedData);
      setFilteredEmployees(mergedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    let result = employees;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.workerId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply attendance filters
    if (filters.checkInBeforeLunch) {
      result = result.filter(e => e.attendance?.checkInBeforeLunch);
    }
    if (filters.checkInAfterLunch) {
      result = result.filter(e => e.attendance?.checkInAfterLunch);
    }
    if (filters.checkOutBeforeLunch) {
      result = result.filter(e => e.attendance?.checkOutBeforeLunch);
    }
    if (filters.checkOutAfterLunch) {
      result = result.filter(e => e.attendance?.checkOutAfterLunch);
    }
    if (filters.extraHours) {
      result = result.filter(e => (e.workedHours ?? 0) > 8);
    }

    setFilteredEmployees(result);
  }, [searchQuery, employees, filters]);

  const handleDateChange = (days: number) => {
    setSelectedDate(moment(selectedDate).add(days, 'days').format('YYYY-MM-DD'));
  };

  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const renderFilterButton = (icon: string, label: string, filterName: keyof typeof filters) => (
    <TouchableOpacity
      style={[styles.filterButton, filters[filterName] && styles.activeFilter]}
      onPress={() => toggleFilter(filterName)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={filters[filterName] ? '#6a11cb' : '#666'} 
      />
      <Text style={[styles.filterText, filters[filterName] && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

const renderTimeSlot = (time: string | null | undefined, label: string) => (
  <View style={styles.timeSlot}>
    <Text style={styles.timeLabel}>{label}</Text>
    <Text style={styles.timeValue}>{time ?? '--:--'}</Text>
  </View>
);

  const renderEmployeeCard = ({ item }: { item: EmployeeWithAttendance }) => (
    <LinearGradient
      colors={['#ffffff', '#f8f9fa']}
      style={styles.employeeCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: item.profileImage || DEFAULT_PROFILE_IMAGE }} 
          style={styles.profileImage} 
        />
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeId}>{item.workerId}</Text>
        </View>
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursLabel}>Worked:</Text>
          <Text style={styles.hoursValue}>
            {item.workedHours ? `${item.workedHours.toFixed(1)} hrs` : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.timingsContainer}>
        {renderTimeSlot(item.attendance?.checkInBeforeLunch, 'Check-in AM')}
        {renderTimeSlot(item.attendance?.checkOutBeforeLunch, 'Check-out AM')}
        {renderTimeSlot(item.attendance?.checkInAfterLunch, 'Check-in PM')}
        {renderTimeSlot(item.attendance?.checkOutAfterLunch, 'Check-out PM')}
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusPill}>
          <Ionicons 
            name={item.workedHours ? 'checkmark-circle' : 'close-circle'} 
            size={16} 
            color={item.workedHours ? '#4CAF50' : '#F44336'} 
          />
          <Text style={styles.statusText}>
            {item.workedHours ? 'Present' : 'Absent'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
     <InternetCheck>
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Attendance Report</Text>
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
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {renderFilterButton('time-outline', 'Check-in AM', 'checkInBeforeLunch')}
          {renderFilterButton('time-outline', 'Check-out AM', 'checkOutBeforeLunch')}
          {renderFilterButton('time-outline', 'Check-in PM', 'checkInAfterLunch')}
          {renderFilterButton('time-outline', 'Check-out PM', 'checkOutAfterLunch')}
          {renderFilterButton('alarm-outline', 'Extra Hours', 'extraHours')}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {filteredEmployees.filter(e => e.workedHours).length}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {filteredEmployees.filter(e => !e.workedHours).length}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {filteredEmployees.filter(e => (e.workedHours ?? 0) > 8).length}
            </Text>
            <Text style={styles.statLabel}>Extra Hours</Text>
          </View>
        </View>

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
            renderItem={renderEmployeeCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
    </InternetCheck>
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
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 18,
    color: '#fff',
    marginHorizontal: 15,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filtersContent: {
    paddingHorizontal: 5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    elevation: 2,
  },
  activeFilter: {
    backgroundColor: '#e6e6fa',
    borderWidth: 1,
    borderColor: '#6a11cb',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#6a11cb',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  employeeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
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
  hoursContainer: {
    alignItems: 'flex-end',
  },
  hoursLabel: {
    fontSize: 12,
    color: '#666',
  },
  hoursValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a11cb',
  },
  timingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeSlot: {
    width: '48%',
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  statusText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
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
});