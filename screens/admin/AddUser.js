import { typography, spacing } from '../../theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { useAppData } from "../../lib/AppDataContext";
import { Field } from "../../component/ui";

const ROLES = [
  { label: 'Guardian', value: 'Guardian' },
  { label: 'Barangay Responder', value: 'Barangay Responder' },
  { label: 'Barangay Official', value: 'Barangay Official' },
];

const POSITIONS = [
  { label: 'Barangay Captain', value: 'Barangay Captain' },
  { label: 'Barangay Secretary', value: 'Barangay Secretary' },
  { label: 'Barangay Kagawad', value: 'Barangay Kagawad' },
];

export default function AddUser({ route, navigation }) {
  const { addUser, account } = useAppData();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', role: route.params?.role || 'Guardian', position: 'Barangay Secretary',
    barangay: account.barangayName || '', address: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleCreate() {
    if (submitting) return;
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Missing information', 'Please enter the full name and mobile number.');
      return;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await addUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        role: form.role,
        position: form.role === 'Barangay Official' ? form.position : '',
        barangay: form.barangay,
        address: form.address.trim(),
        status: 'Active',
      });

      Alert.alert(
        'User created',
        form.role === 'Guardian'
          ? `${form.name.trim()} has been registered as a guardian. You can assign a ward later.`
          : `${form.name.trim()} has been added as ${form.role}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Could not create user', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>ADD USER ACCOUNT</Text>
        <Text style={styles.subheading}>step 1 : Personal Information</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Field label="Enter First Name" required value={form.firstName} onChangeText={(v) => updateField('firstName', v)} />
        <Field label="Enter Last Name" required value={form.lastName} onChangeText={(v) => updateField('lastName', v)} />
        <Text style={styles.fieldLabel}>Enter Phone Number<Text style={styles.required}>*</Text></Text>
        <View style={styles.phoneRow}>
            <View style={styles.countryCode}><Text style={styles.countryCodeText}>+63</Text></View>
            <TextInput style={styles.phoneInput} placeholder="9XX-XXX-XXXX" keyboardType="number-pad" maxLength={10} value={form.phone} onChangeText={(v) => updateField('phone', v.replace(/[^0-9]/g, ''))} />
        </View>
        <Field label="Email (optional)" value={form.email} onChangeText={(v) => update('email', v)} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Select User Role<Text style={styles.required}>*</Text></Text>
          <Dropdown
            style={styles.pickerWrap}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            itemTextStyle={styles.dropdownText}
            fontFamily="Poppins_400Regular"
            data={ROLES}
            labelField="label"
            valueField="value"
            placeholder="Kindly select type"
            value={form.role}
            onChange={(item) => update('role', item.value)}
            iconColor="#666"
          />
        </View>

        {form.role === 'Barangay Official' && (
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Position</Text>
            <Dropdown
              style={styles.pickerWrap}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownText}
              fontFamily="Poppins_400Regular"
              data={POSITIONS}
              labelField="label"
              valueField="value"
              placeholder="Kindly select position"
              value={form.position}
              onChange={(item) => update('position', item.value)}
              iconColor="#666"
            />
          </View>
        )}

        <Field label="Home Address" value={form.address} onChangeText={(v) => update('address', v)} placeholder="House no., street, purok/subdivision" />

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Barangay</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyFieldText}>{form.barangay}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, styles.shadow]} disabled={submitting} onPress={handleCreate}>
          <Text style={styles.buttonText}>{submitting ? 'Creating...' : 'Create User'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#c12b2b', marginBottom: 4, minHeight: 44, paddingVertical: 4, marginTop: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 8 },
  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', marginRight: 6 },
  progressBarActive: { backgroundColor: '#c12b2b' },
  fieldWrap: { marginBottom: spacing.field },
  fieldLabel: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 10 },
  required: { color: '#c12b2b' },
  pickerWrap: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f2f2f2', justifyContent: 'center', height: spacing.control },
  dropdownPlaceholder: { fontFamily: 'Poppins_400Regular', fontSize: typography.body, color: '#999' },
  dropdownText: { fontFamily: 'Poppins_400Regular', fontSize: typography.body, color: '#333' },
  readOnlyField: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#e9e9e9', justifyContent: 'center', height: spacing.control },
  readOnlyFieldText: { fontFamily: 'Poppins_400Regular', fontSize: typography.body, color: '#333' },
  phoneRow: { flexDirection: 'row', marginBottom: spacing.field  },
  countryCode: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', marginRight: 8, backgroundColor: '#f2f2f2' },
  countryCodeText: { fontSize: typography.body, fontWeight: '600' },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f2f2f2', fontSize: typography.body, fontFamily: 'Poppins_400Regular', minHeight: spacing.control },  
  shadow: { shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  button: { borderRadius: 10, backgroundColor: '#fbd1d1', paddingVertical: 16, alignItems: 'center', marginTop: 10, marginBottom: 8, minHeight: spacing.control, justifyContent: 'center' },
  buttonText: { color: '#a83232', fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  cancelButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 10, minHeight: spacing.control, justifyContent: 'center' },
  cancelText: { color: '#a83232', fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
});