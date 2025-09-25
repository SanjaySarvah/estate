// components/AddRegistration.tsx
import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,Modal,TouchableOpacity,StyleSheet,Alert,ScrollView,Platform,
  KeyboardAvoidingView,ActivityIndicator,Dimensions,Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const jobTitles = [
  'Nursery Preparation',
  'Sapling Propagation',
  'Crop Maintenance',
  'Harvesting',
  'Post-Harvest',
];

const sections = [
  'Section A',
  'Section B',
  'Section C',
  'Greenhouse',
  'Field',
];

const roles = [
  { value: 'Employee', icon: 'person-outline' },
  { value: 'Manager', icon: 'people-outline' },
  { value: 'Admin', icon: 'shield-outline' },
];

type FormData = {
  workerId: string;
  name: string;
  jobTitle: string;
  section: string;
  joiningDate: string;
  role: string;
  password?: string;
  
};

type FaceEntry = {
  workerId: string;
  name: string;
  photoPath: string;
  timestamp: string;
};

export default function AddRegistration() {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Add this to refresh when returning from FaceRegister
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    workerId: '',
    name: '',
    jobTitle: jobTitles[0],
    section: sections[0],
    joiningDate: '',
    role: 'Employee',
    password: '',
  });
  const [registrations, setRegistrations] = useState<FormData[]>([]);
  const [faceEntries, setFaceEntries] = useState<FaceEntry[]>([]); // Add state for face entries
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    employees: 0,
    managers: 0,
    admins: 0,
  });

  useEffect(() => {
    loadData();
    loadFaceEntries(); // Load face entries when component mounts
  }, []);

  // Reload face entries when screen is focused (returning from FaceRegister)
  useEffect(() => {
    if (isFocused) {
      loadFaceEntries();
    }
  }, [isFocused]);

  useEffect(() => {
    calculateStats();
  }, [registrations]);

  const calculateStats = () => {
    setStats({
      total: registrations.length,
      employees: registrations.filter(r => r.role === 'Employee').length,
      managers: registrations.filter(r => r.role === 'Manager').length,
      admins: registrations.filter(r => r.role === 'Admin').length,
    });
  };

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('registrationData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRegistrations(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  // Add this function to load face entries
  const loadFaceEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem('faceEntries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFaceEntries(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load face entries', error);
    }
  };

  // Add this function to get photo for a worker
  const getWorkerPhoto = (workerId: string) => {
    const faceEntry = faceEntries.find(entry => entry.workerId === workerId);
    return faceEntry ? faceEntry.photoPath : null;
  };

  const handleFaceRegistration = (workerId: string, name: string) => {
    if (!workerId || !name) {
      Alert.alert('Error', 'Worker ID and Name are required for face registration');
      return;
    }
    
    navigation.navigate('FaceRegister', { 
      workerId, 
      name 
    });
  };

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (value: string) => {
    let formatted = value.replace(/[^0-9]/g, '');
    if (formatted.length >= 3 && formatted.length <= 4) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    } else if (formatted.length >= 5) {
      formatted =
        formatted.slice(0, 2) +
        '/' +
        formatted.slice(2, 4) +
        '/' +
        formatted.slice(4, 8);
    }
    handleChange('joiningDate', formatted);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.workerId.trim() || !formData.name.trim()) {
      Alert.alert('Validation Error', 'Worker ID and Name are required');
      setIsSubmitting(false);
      return;
    }

    try {
      let updatedData = [...registrations];

      if (editIndex !== null) {
        updatedData[editIndex] = { ...formData };
      } else {
        const duplicate = updatedData.some(
          item => item.workerId.toLowerCase() === formData.workerId.toLowerCase()
        );
        if (duplicate) {
          Alert.alert('Duplicate Worker ID', 'This Worker ID already exists');
          setIsSubmitting(false);
          return;
        }
        updatedData.push({ ...formData });
      }

      await AsyncStorage.setItem('registrationData', JSON.stringify(updatedData));
      setRegistrations(updatedData);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setModalVisible(false);
    setFormData({
      workerId: '',
      name: '',
      jobTitle: jobTitles[0],
      section: sections[0],
      joiningDate: '',
      role: 'Employee',
      password: '',
    });
    setEditIndex(null);
  };

  const handleEdit = (index: number) => {
    setFormData(registrations[index]);
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleDelete = async (index: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = registrations.filter((_, i) => i !== index);
          setRegistrations(updated);
          await AsyncStorage.setItem('registrationData', JSON.stringify(updated));
        },
      },
    ]);
  };

  const filteredRegistrations = registrations
    .filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.workerId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aMatch = a.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
                     a.workerId.toLowerCase().startsWith(searchQuery.toLowerCase());
      const bMatch = b.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
                     b.workerId.toLowerCase().startsWith(searchQuery.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e4e8f0']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Employee Registry</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={20} color="#fff" />
            <Text style={styles.statText}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.statText}>{stats.employees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-circle" size={20} color="#fff" />
            <Text style={styles.statText}>{stats.managers}</Text>
            <Text style={styles.statLabel}>Managers</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="shield" size={20} color="#fff" />
            <Text style={styles.statText}>{stats.admins}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <LinearGradient
            colors={['#6a11cb', '#2575fc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButton}
          >
            <Ionicons name="person-add" size={20} color="white" />
            <Text style={styles.actionButtonText}>Add Employee</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Alert.alert('Syncing...')}
          style={styles.syncButton}
        >
          <Ionicons name="sync" size={20} color="#2575fc" />
          <Text style={styles.syncButtonText}>Sync Data</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Employee List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredRegistrations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No employees found</Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addFirstButtonText}>Add First Employee</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredRegistrations.map((item, index) => {
            const workerPhoto = getWorkerPhoto(item.workerId);
            
            return (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    {workerPhoto ? (
                      <Image 
                        source={{ uri: workerPhoto }} 
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Ionicons 
                        name="person" 
                        size={24} 
                        color={item.role === 'Admin' ? '#6a11cb' : 
                              item.role === 'Manager' ? '#2575fc' : '#4CAF50'} 
                      />
                    )}
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>ID: {item.workerId}</Text>
                    {workerPhoto && (
                      <Text style={styles.faceRegisteredText}>✓ Face Registered</Text>
                    )}
                  </View>
                  <View style={styles.roleBadge}>
                    <Ionicons 
                      name={roles.find(r => r.value === item.role)?.icon || 'person'} 
                      size={16} 
                      color="#fff" 
                    />
                    <Text style={styles.roleText}>{item.role}</Text>
                  </View>
                </View>
                
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Ionicons name="briefcase-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.jobTitle}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.section}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {item.joiningDate || 'Not specified'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(index)}
                  >
                    <Ionicons name="create-outline" size={18} color="#2575fc" />
                    <Text style={styles.footerButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(index)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    <Text style={styles.footerButtonText}>Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.faceButton,
                      workerPhoto && styles.faceButtonRegistered
                    ]}
                    onPress={() => handleFaceRegistration(item.workerId, item.name)}
                  >
                    <Ionicons 
                      name={workerPhoto ? "camera" : "camera-outline"} 
                      size={18} 
                      color={workerPhoto ? "#fff" : "#28a745"} 
                    />
                    <Text style={[
                      styles.footerButtonText,
                      workerPhoto && styles.faceButtonTextRegistered
                    ]}>
                      {workerPhoto ? 'Update Face' : 'Add Face'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal 
        visible={modalVisible} 
        animationType="slide"
        transparent={false}
      >
        <LinearGradient
          colors={['#f5f7fa', '#e4e8f0']}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editIndex !== null ? 'Edit Employee' : 'Add New Employee'}
                </Text>
                <TouchableOpacity 
                  onPress={resetForm}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                {/* Worker ID */}
                <Text style={styles.formLabel}>Worker ID *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="id-card" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter worker ID"
                    placeholderTextColor="#999"
                    value={formData.workerId}
                    editable={editIndex === null}
                    onChangeText={t => handleChange('workerId', t)}
                  />
                </View>

                {/* Name */}
                <Text style={styles.formLabel}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter full name"
                    placeholderTextColor="#999"
                    value={formData.name}
                    onChangeText={t => handleChange('name', t)}
                  />
                </View>

                {/* Job Title */}
                <Text style={styles.formLabel}>Job Title</Text>
                <View style={styles.optionsContainer}>
                  {jobTitles.map(title => (
                    <TouchableOpacity
                      key={title}
                      style={[
                        styles.optionButton,
                        formData.jobTitle === title && styles.optionButtonSelected,
                      ]}
                      onPress={() => handleChange('jobTitle', title)}
                    >
                      <Text style={[
                        styles.optionText,
                        formData.jobTitle === title && styles.optionTextSelected,
                      ]}>
                        {title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Section */}
                <Text style={styles.formLabel}>Section</Text>
                <View style={styles.pickerContainer}>
                  <Ionicons name="map" size={20} color="#666" style={styles.inputIcon} />
                  <View style={styles.picker}>
                    {sections.map(section => (
                      <TouchableOpacity
                        key={section}
                        style={[
                          styles.sectionOption,
                          formData.section === section && styles.sectionOptionSelected,
                        ]}
                        onPress={() => handleChange('section', section)}
                      >
                        <Text>{section}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Joining Date */}
                <Text style={styles.formLabel}>Joining Date</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    value={formData.joiningDate}
                    onChangeText={handleDateChange}
                    maxLength={10}
                    keyboardType="numeric"
                  />
                </View>

                {/* Role */}
                <Text style={styles.formLabel}>Role</Text>
                <View style={styles.roleOptions}>
                  {roles.map(role => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleOption,
                        formData.role === role.value && styles.roleOptionSelected,
                      ]}
                      onPress={() => handleChange('role', role.value)}
                    >
                      <Ionicons 
                        name={role.icon} 
                        size={20} 
                        color={formData.role === role.value ? '#fff' : '#6a11cb'} 
                      />
                      <Text style={[
                        styles.roleOptionText,
                        formData.role === role.value && styles.roleOptionTextSelected,
                      ]}>
                        {role.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Password */}
                {(formData.role === 'Manager' || formData.role === 'Admin') && (
                  <>
                    <Text style={styles.formLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.formInput, { flex: 1 }]}
                        placeholder="Set password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={t => handleChange('password', t)}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.passwordToggle}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              {/* Form Actions */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <LinearGradient
                      colors={['#6a11cb', '#2575fc']}
                      style={styles.submitGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons 
                        name={editIndex !== null ? 'save' : 'add'} 
                        size={20} 
                        color="#fff" 
                      />
                      <Text style={styles.submitButtonText}>
                        {editIndex !== null ? 'Update' : 'Save'}
                      </Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 3,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#6a11cb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2575fc',
  },
  syncButtonText: {
    color: '#2575fc',
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#6a11cb',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  addFirstButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  faceRegisteredText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6a11cb',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 'auto',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    flexWrap: 'wrap',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#e3f2fd',
    marginRight: 8,
    marginBottom: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    marginRight: 8,
    marginBottom: 5,
  },
  faceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#eafbea',
    marginBottom: 5,
  },
  faceButtonRegistered: {
    backgroundColor: '#28a745',
  },
  faceButtonTextRegistered: {
    color: '#fff',
  },
  footerButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  formInput: {
    flex: 1,
    height: 45,
    color: '#333',
  },
  passwordToggle: {
    padding: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  optionText: {
    color: '#666',
  },
  optionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  sectionOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '30%',
    justifyContent: 'center',
  },
  roleOptionSelected: {
    backgroundColor: '#6a11cb',
    borderColor: '#6a11cb',
  },
  roleOptionText: {
    marginLeft: 8,
    color: '#666',
  },
  roleOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});