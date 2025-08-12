// components/AddRegistration.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const jobTitles = [
  'Nursery Preparation',
  'Sapling Propagation and Transplanting',
  'Crop Maintenance',
  'Post-Harvest Handling',
];
const roles = ['Employee', 'Manager', 'Admin'];

type FormData = {
  workerId: string;
  name: string;
  jobTitle: string;
  section: string;
  joiningDate: string;
  role: string;
  password?: string;
};

export default function AddRegistration() {
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    workerId: '',
    name: '',
    jobTitle: jobTitles[0],
    section: '',
    joiningDate: '',
    role: 'Employee',
    password: '',
  });
  const [registrations, setRegistrations] = useState<FormData[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const stored = await AsyncStorage.getItem('registrationData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRegistrations(parsed);
        }
      } catch {
        setRegistrations([]);
      }
    }
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

    setModalVisible(false);
    setFormData({
      workerId: '',
      name: '',
      jobTitle: jobTitles[0],
      section: '',
      joiningDate: '',
      role: 'Employee',
      password: '',
    });
    setEditIndex(null);
    setIsSubmitting(false);
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

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="person-add" size={20} color="white" />
        <Text style={styles.addButtonText}>Add Employee</Text>
      </TouchableOpacity>

      {/* Employee Cards */}
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        {registrations.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDetail}>ID: {item.workerId}</Text>
              <Text style={styles.cardDetail}>Job: {item.jobTitle}</Text>
              <Text style={styles.cardDetail}>Section: {item.section}</Text>
              <Text style={styles.cardDetail}>Joining: {item.joiningDate}</Text>
              <Text style={styles.cardDetail}>Role: {item.role}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(index)} style={styles.iconButton}>
                <Ionicons name="create" size={22} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(index)} style={styles.iconButton}>
                <Ionicons name="trash" size={22} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.heading}>
                  {editIndex !== null ? 'Edit Employee' : 'Add New Employee'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Worker ID */}
              <Text style={styles.label}>Worker ID *</Text>
              <TextInput
                style={styles.input}
                placeholder="Worker ID"
                value={formData.workerId}
                editable={editIndex === null}
                onChangeText={t => handleChange('workerId', t)}
              />

              {/* Name */}
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formData.name}
                onChangeText={t => handleChange('name', t)}
              />

              {/* Job Title */}
              <Text style={styles.label}>Job Title</Text>
              {jobTitles.map(title => (
                <TouchableOpacity
                  key={title}
                  style={[
                    styles.option,
                    formData.jobTitle === title && styles.optionSelected,
                  ]}
                  onPress={() => handleChange('jobTitle', title)}
                >
                  <Text>{title}</Text>
                </TouchableOpacity>
              ))}

              {/* Section */}
              <Text style={styles.label}>Section</Text>
              <TextInput
                style={styles.input}
                placeholder="Section"
                value={formData.section}
                onChangeText={t => handleChange('section', t)}
              />

              {/* Joining Date */}
              <Text style={styles.label}>Joining Date</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={formData.joiningDate}
                onChangeText={handleDateChange}
                maxLength={10}
              />

              {/* Role */}
              <Text style={styles.label}>Role</Text>
              {roles.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.option,
                    formData.role === r && styles.optionSelected,
                  ]}
                  onPress={() => handleChange('role', r)}
                >
                  <Text>{r}</Text>
                </TouchableOpacity>
              ))}

              {/* Password for Manager/Admin */}
              {(formData.role === 'Manager' || formData.role === 'Admin') && (
                <>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      value={formData.password}
                      onChangeText={t => handleChange('password', t)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Save/Cancel */}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={handleSubmit}>
                  {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{editIndex !== null ? 'Update' : 'Save'}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  addButtonText: { color: 'white', marginLeft: 8, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDetail: { fontSize: 14, color: '#555' },
  cardActions: { justifyContent: 'space-between', alignItems: 'center', marginLeft: 10 },
  iconButton: { padding: 6 },
  keyboardAvoidingView: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  modalContainer: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  heading: { fontSize: 20, fontWeight: '700' },
  label: { fontWeight: '600', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 5 },
  option: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 5 },
  optionSelected: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
});
