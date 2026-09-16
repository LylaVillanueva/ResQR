import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useAdminData } from '../../AdminDataContext';

const relationships = ['Parent', 'Grandparent', 'Child', 'Grandchild', 'Sibling', 'Spouse', 'Guardian', 'Other'];

export default function EnrollNewResident({ navigation }) {
  const { addResident } = useAdminData();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedResident, setSavedResident] = useState(null);
  const [form, setForm] = useState({
    role: '', firstName: '', lastName: '', birthdate: '', barangay: 'Barangay 206',
    guardianName: '', relationship: '', guardianContact: '',
  });

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function handleNext() {
    if (!form.role || !form.firstName.trim() || !form.lastName.trim() || !form.birthdate.trim() || !form.barangay.trim()) {
      Alert.alert('Missing information', 'Please complete all required personal information.');
      return;
    }
    setStep(2);
  }

  function handleEnroll() {
    if ((form.guardianName || form.relationship || form.guardianContact) && (!form.guardianName.trim() || !form.relationship || !form.guardianContact.trim())) {
      Alert.alert('Incomplete guardian information', 'Complete all guardian fields or leave the guardian information blank.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newResident = addResident({
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        type: form.role,
        birthDate: form.birthdate.trim(),
        address: form.barangay.trim(),
        guardianName: form.guardianName.trim(),
        relationship: form.relationship,
        guardianContact: form.guardianContact.trim(),
      });
      setSavedResident(newResident);
      setLoading(false);
      setStep(3);
    }, 500);
  }

  function resetForm() {
    setForm({ role: '', firstName: '', lastName: '', birthdate: '', barangay: 'Barangay 206', guardianName: '', relationship: '', guardianContact: '' });
    setSavedResident(null);
    setStep(1);
  }

  function ProgressBar({ activeCount }) {
    return (
      <View style={styles.progressRow}>
        <View style={[styles.progressBar, activeCount >= 1 && styles.progressBarActive]} />
        <View style={[styles.progressBar, activeCount >= 2 && styles.progressBarActive]} />
      </View>
    );
  }

  if (step === 3 && savedResident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => navigation.navigate('ResidentScreen')}>‹ Done</Text>
          <Text style={styles.heading}>QR Card Generated</Text>

          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>QR CODE{`\n`}PLACEHOLDER</Text>
            </View>
            <Text style={styles.qrName}>{savedResident.name}</Text>
            <Text style={styles.qrDetail}>{savedResident.id}</Text>
            <Text style={styles.qrDetail}>{savedResident.type}</Text>
            <Text style={styles.qrDetail}>{savedResident.guardianName ? `Guardian: ${savedResident.guardianName}` : 'Guardian: Not yet registered'}</Text>
            <Text style={styles.qrDetail}>{savedResident.address}</Text>
          </View>

          <TouchableOpacity style={[styles.button, styles.shadow]} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Save & Print QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guardianButton, styles.shadow]}
            onPress={() => navigation.navigate('AddUser', { role: 'Guardian', wardId: savedResident.id })}
          >
            <Text style={styles.guardianButtonText}>Register Guardian for this Ward</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pdfButton, styles.shadow]} onPress={resetForm}>
            <Text style={styles.pdfButtonText}>Enroll Another Resident</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}>‹ Back</Text>
        <Text style={styles.heading}>ENROLL NEW RESIDENT</Text>
        <Text style={styles.subheading}>
          {step === 1 ? 'step 1 : Personal Information' : 'step 2 : Guardian Information'}
        </Text>
        <ProgressBar activeCount={step} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Select Resident Type<Text style={styles.required}>*</Text></Text>
              <View style={styles.pickerWrap}>
                <Picker selectedValue={form.role} onValueChange={(v) => updateField('role', v)}>
                  <Picker.Item label="Kindly select resident type" value="" />
                  <Picker.Item label="Senior Citizen" value="Senior Citizen" />
                  <Picker.Item label="Person with Disability" value="Person with Disability" />
                </Picker>
              </View>
            </View>
            <Field label="Enter First Name" required value={form.firstName} onChangeText={(v) => updateField('firstName', v)} />
            <Field label="Enter Last Name" required value={form.lastName} onChangeText={(v) => updateField('lastName', v)} />
            <Field label="Enter Birthday" required placeholder="MM/DD/YYYY" value={form.birthdate} onChangeText={(v) => updateField('birthdate', v)} />
            <Field label="Enter Barangay" required value={form.barangay} onChangeText={(v) => updateField('barangay', v)} />
          </>
        ) : (
          <>
            <View style={styles.noticeBox}>
              <FontText text="The ward is registered first. A Guardian account can only be created after this ward has been registered." />
            </View>
            <Field label="Guardian Full Name" value={form.guardianName} onChangeText={(v) => updateField('guardianName', v)} />
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Select Relationship</Text>
              <View style={styles.pickerWrap}>
                <Picker selectedValue={form.relationship} onValueChange={(v) => updateField('relationship', v)}>
                  <Picker.Item label="Kindly select relationship" value="" />
                  {relationships.map((relationship) => <Picker.Item key={relationship} label={relationship} value={relationship} />)}
                </Picker>
              </View>
            </View>
            <Text style={styles.fieldLabel}>Enter Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}><Text style={styles.countryCodeText}>+63</Text></View>
              <TextInput style={styles.phoneInput} placeholder="9XX-XXX-XXXX" keyboardType="number-pad" maxLength={10} value={form.guardianContact} onChangeText={(v) => updateField('guardianContact', v.replace(/[^0-9]/g, ''))} />
            </View>
            <Text style={styles.helperText}>Guardian account registration is completed after the ward is saved.</Text>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.button, styles.shadow]} onPress={step === 1 ? handleNext : handleEnroll} disabled={loading}>
          <Text style={styles.buttonText}>{step === 1 ? 'Next' : loading ? 'Enrolling...' : 'Enroll'}</Text>
        </TouchableOpacity>
        <Text style={styles.pageLabel}>page {step}</Text>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, required, value, onChangeText, placeholder }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}{required && <Text style={styles.required}>*</Text>}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#999" />
    </View>
  );
}

function FontText({ text }) {
  return <Text style={styles.noticeText}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#c12b2b', marginBottom: 12 },
  heading: { fontSize: 26, fontFamily: 'Poppins_600SemiBold', marginBottom: -8 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 8 },
  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', marginRight: 6 },
  progressBarActive: { backgroundColor: '#c12b2b' },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 6 },
  required: { color: '#c12b2b' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#f2f2f2f0', fontFamily: 'Poppins_400Regular', fontSize: 16 },
  pickerWrap: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingLeft: 2, backgroundColor: '#f2f2f2f0', overflow: 'hidden' },
  phoneRow: { flexDirection: 'row', marginBottom: 8 },
  countryCode: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', marginRight: 8, backgroundColor: '#f2f2f2' },
  countryCodeText: { fontSize: 16, fontWeight: '600' },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#f2f2f2f0', fontSize: 16, fontFamily: 'Poppins_400Regular' },
  helperText: { color: '#777', fontSize: 12, fontFamily: 'Poppins_400Regular', marginBottom: 20 },
  noticeBox: { borderWidth: 1, borderColor: '#8a6d1d', borderRadius: 8, backgroundColor: '#fbf1a1', padding: 12, marginBottom: 16 },
  noticeText: { color: '#6f5a16', fontSize: 12, lineHeight: 18, fontFamily: 'Poppins_400Regular' },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  shadow: { shadowColor: '#625350', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  button: { borderRadius: 10, backgroundColor: '#fbd1d1', paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#a83232', fontSize: 16, fontFamily: 'Poppins_500Medium' },
  pageLabel: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12, fontFamily: 'Poppins_400Regular' },
  qrBox: { borderWidth: 1, borderColor: '#ccc', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 20, marginBottom: 20, marginHorizontal: 16 },
  qrPlaceholder: { width: 280, height: 280, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 5, marginBottom: 25, backgroundColor: '#f2f2f2' },
  qrPlaceholderText: { textAlign: 'center', color: '#999', fontSize: 13, fontFamily: 'Poppins_500Medium' },
  qrName: { fontSize: 24, fontFamily: 'Poppins_500Medium', marginBottom: 6 },
  qrDetail: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#333', textAlign: 'center', marginBottom: -2 },
  guardianButton: { borderWidth: 1, borderColor: '#245490', backgroundColor: '#d3e5f8', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginHorizontal: 20, marginBottom: 10 },
  guardianButtonText: { color: '#245490', fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  pdfButton: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginHorizontal: 20 },
  pdfButtonText: { color: '#c12b2b', fontSize: 14, fontFamily: 'Poppins_400Regular' },
});
