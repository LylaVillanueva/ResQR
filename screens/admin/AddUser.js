import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { TextInput } from 'react-native';
import { useAdminData } from '../../AdminDataContext';

const roles = ['Guardian', 'Barangay Responder', 'Barangay Official'];
const positions = ['Barangay Captain', 'Barangay Secretary', 'Barangay Kagawad'];
const relationships = ['Parent', 'Child', 'Sibling', 'Spouse', 'Grandparent', 'Grandchild', 'Guardian', 'Other'];

export default function AddUser({ route, navigation }) {
  const { residents, addUser } = useAdminData();
  const preselectedWard = route.params?.wardId || '';
  const [form, setForm] = useState({
    name: '', phone: '', role: route.params?.role || 'Guardian', position: 'Barangay Secretary',
    relationship: 'Child', wardId: preselectedWard, barangay: 'Barangay 206',
  });

  const availableWards = useMemo(() => residents, [residents]);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function handleCreate() {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Missing information', 'Please enter the full name and mobile number.');
      return;
    }

    if (form.role === 'Guardian' && !form.wardId) {
      Alert.alert('Ward required', 'A Guardian can only be registered after selecting an existing ward.');
      return;
    }

    addUser({
      name: form.name.trim(),
      phone: form.phone.trim(),
      role: form.role,
      position: form.role === 'Barangay Official' ? form.position : '',
      relationship: form.role === 'Guardian' ? form.relationship : '',
      wardIds: form.role === 'Guardian' ? [form.wardId] : [],
      barangay: form.barangay,
      status: 'Active',
    });

    const ward = residents.find((resident) => resident.id === form.wardId);
    Alert.alert(
      'User created',
      form.role === 'Guardian'
        ? `${form.name.trim()} has been registered as the guardian of ${ward?.name || 'the selected ward'}.`
        : `${form.name.trim()} has been added as ${form.role}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>Add User</Text>
        <Text style={styles.subheading}>Create a ResQR account for an authorized user.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Field label="Full Name *" value={form.name} onChangeText={(v) => update('name', v)} placeholder="Enter full name" />
        <Field label="Mobile Number *" value={form.phone} onChangeText={(v) => update('phone', v)} placeholder="09XX XXX XXXX" keyboardType="phone-pad" />

        <Text style={styles.label}>Role *</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={form.role} onValueChange={(v) => update('role', v)}>
            {roles.map((role) => <Picker.Item key={role} label={role} value={role} />)}
          </Picker>
        </View>

        {form.role === 'Guardian' && (
          <>
            <Text style={styles.label}>Ward *</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={form.wardId} onValueChange={(v) => update('wardId', v)}>
                <Picker.Item label="Kindly select ward" value="" />
                {availableWards.map((resident) => (
                  <Picker.Item key={resident.id} label={`${resident.name} • ${resident.type === 'Senior Citizen' ? 'SC' : 'PWD'}`} value={resident.id} />
                ))}
              </Picker>
            </View>
            <Text style={styles.helperText}>A Guardian account must be linked to an existing Senior Citizen or PWD ward.</Text>

            <Text style={styles.label}>Relationship to Ward *</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={form.relationship} onValueChange={(v) => update('relationship', v)}>
                {relationships.map((relationship) => <Picker.Item key={relationship} label={relationship} value={relationship} />)}
              </Picker>
            </View>
          </>
        )}

        {form.role === 'Barangay Official' && (
          <>
            <Text style={styles.label}>Position *</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={form.position} onValueChange={(v) => update('position', v)}>
                {positions.map((position) => <Picker.Item key={position} label={position} value={position} />)}
              </Picker>
            </View>
          </>
        )}

        <Text style={styles.label}>Barangay</Text>
        <View style={[styles.input, styles.disabled]}><Text style={styles.disabledText}>{form.barangay}</Text></View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
          <Text style={styles.primaryText}>Create User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#999" keyboardType={keyboardType} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollContent: { padding: 20, paddingTop: 8, paddingBottom: 30 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 12, marginTop: -12 }, heading: { fontSize: 28, fontFamily: 'Poppins_700Bold' }, subheading: { fontSize: 14, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2, marginBottom: 16 },
  label: { fontSize: 14, fontFamily: 'Poppins_500Medium', marginTop: 12, marginBottom: 6, color: '#444' }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontFamily: 'Poppins_400Regular', fontSize: 14, backgroundColor: '#fff' }, pickerWrap: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' }, disabled: { backgroundColor: '#f3f3f3', justifyContent: 'center' }, disabledText: { color: '#777', fontFamily: 'Poppins_400Regular', fontSize: 14 }, helperText: { fontSize: 11, color: '#777', fontFamily: 'Poppins_400Regular', marginTop: 5 },
  primaryButton: { backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 }, primaryText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 15 }, secondaryButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 }, secondaryText: { color: '#a83232', fontFamily: 'Poppins_500Medium', fontSize: 15 },
});
