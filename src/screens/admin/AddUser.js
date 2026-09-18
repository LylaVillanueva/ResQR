import { typography, spacing } from '../../theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '../../components/AppPicker';
import { useAppData } from '../../context/AppDataContext';
import { Field } from '../../components/ui';

const roles = ['Guardian', 'Barangay Responder', 'Barangay Official'];
const positions = ['Barangay Captain', 'Barangay Secretary', 'Barangay Kagawad'];

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
    } catch (err) { Alert.alert('Could not create user', err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>Add User</Text>
        <Text style={styles.subheading}>Create a QRAlalay account for an authorized user.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Field label="Full Name *" value={form.name} onChangeText={(v) => update('name', v)} placeholder="Enter full name" />
        <Field label="Mobile Number *" value={form.phone} onChangeText={(v) => update('phone', v)} placeholder="09XX XXX XXXX" keyboardType="phone-pad" />

        <Field label="Email (optional)" value={form.email} onChangeText={(v) => update('email', v)} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />

        <Text style={styles.label}>Role *</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={form.role} onValueChange={(v) => update('role', v)}>
            {roles.map((role) => <Picker.Item key={role} label={role} value={role} />)}
          </Picker>
        </View>

        {form.role === 'Barangay Official' && <>
          <Text style={styles.label}>Position</Text>
          <View style={styles.pickerWrap}><Picker selectedValue={form.position} onValueChange={(v) => update('position', v)}>
            {positions.map((position) => <Picker.Item key={position} label={position} value={position} />)}
          </Picker></View>
        </>}
        <Field label="Home Address" value={form.address} onChangeText={(v) => update('address', v)} placeholder="House no., street, purok/subdivision" />
        <Text style={styles.label}>Barangay</Text>
        <View style={styles.disabled}><Text style={styles.disabledText}>{form.barangay}</Text></View>

        <TouchableOpacity style={styles.primaryButton} disabled={submitting} onPress={handleCreate}>
          <Text style={styles.primaryText}>Create User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 }, scrollContent: { padding: spacing.screen, paddingTop: 8, paddingBottom: 30 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4}, heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 }, subheading: { fontSize: typography.detail, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2, marginBottom: 16 },
  label: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginBottom: 10, color: '#666' }, pickerWrap: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', backgroundColor: '#f2f2f2', marginBottom: 14 , minHeight: spacing.control }, disabled: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#f2f2f2', justifyContent: 'center', marginBottom: 14 }, disabledText: { color: '#777', fontFamily: 'Poppins_400Regular', fontSize: typography.body }, helperText: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular', marginTop: 4, marginBottom: 14 },
  primaryButton: { backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 10 , minHeight: spacing.control, justifyContent: 'center' }, primaryText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: typography.body }, secondaryButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 10 , minHeight: spacing.control, justifyContent: 'center' }, secondaryText: { color: '#a83232', fontFamily: 'Poppins_500Medium', fontSize: typography.body },
});
