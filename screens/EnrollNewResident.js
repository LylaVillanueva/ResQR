import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

export default function EnrollNewResident({ navigation }) {
  const [step, setStep] = useState(1); // 1 = page1, 2 = page2, 3 = qr result
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    role: '',
    firstName: '',
    lastName: '',
    birthdate: '',
    barangay: '',
    guardianName: '',
    relationship: '',
    guardianContact: ''
  });

  const [role, setRole] = useState('Select Role');
  <Picker selectedValue={role} onValueChange={setRole}>
    <Picker.Item label="Senior Citizen" value="Senior Citizen" />
    <Picker.Item label="Person with Disability" value="Person with Disability" />
    <Picker.Item label="Guardian" value="Guardian" />
    <Picker.Item label="Responder" value="Responder" />
    <Picker.Item label="Barangay Official" value="Barangay Official" />
  </Picker>

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (!form.firstName || !form.lastName || !form.birthdate || !form.barangay || !form.role) {
      return; // could show an Alert here for missing required fields
    }
    setStep(2);
  }

  const [relationship, setRelationship] = useState('Select Relationship');
  <Picker selectedValue={relationship} onValueChange={setRelationship}>
    <Picker.Item label="Parent" value="Parent" />
    <Picker.Item label="Grandparent" value="Grandparent" />
    <Picker.Item label="Child" value="Child" />
    <Picker.Item label="Grandchild" value="Grandchild" />
    <Picker.Item label="Sibling" value="Sibling" />
    <Picker.Item label="Spouse" value="Spouse" />
    <Picker.Item label="Guardian" value="Guardian" />
  </Picker>

  function handleEnroll() {
    if (!form.guardianName || !form.guardianContact || !form.relationship) {
      return;
    }
    setLoading(true);
    // --- MOCK ENROLL / QR GENERATION ---
    // Replace later with actual API call to create the resident + generate QR
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 800);
  }

  function ProgressBar({ activeCount }) {
    return (
      <View style={styles.progressRow}>
        <View style={[styles.progressBar, activeCount >= 1 && styles.progressBarActive]} />
        <View style={[styles.progressBar, activeCount >= 2 && styles.progressBarActive]} />
      </View>
    );
  }

  // ---------------- STEP 3: QR RESULT ----------------
  // sample result
  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>QR GENERATED</Text>

        <View style={styles.qrBox}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>QR CODE{'\n'}PLACEHOLDER</Text>
          </View>
          <Text style={styles.qrName}>{form.fullName || 'NAME'}</Text>
          <Text style={styles.qrDetail}>{form.address || 'text text text text text'}</Text>
          <Text style={styles.qrDetail}>{form.barangay || 'text text text text text'}</Text>
          <Text style={styles.qrDetail}>{form.phone ? `+63${form.phone}` : 'text text text text text'}</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryButtonText}>Save & Print QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setForm({
              role: '',
              firstName: '',
              lastName: '',
              birthdate: '',
              barangay: '',
              guardianName: '',
              relationship: '',
              guardianContact: '',
            });
            setStep(1);
          }}
        >
          <Text style={styles.secondaryButtonText}>Download PDF</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------------- STEP 1 & 2: FORM ----------------
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.back} onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}>
          ‹ Back
        </Text>
        <Text style={styles.heading}>ENROLL NEW RESIDENT</Text>
        <Text style={styles.subheading}>please fill up all fields</Text>

        <ProgressBar activeCount={step} />

        {step === 1 ? (
          <>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>
                Select Resident Type<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={form.role}
                  onValueChange={(v) => updateField('role', v)}
                >
                  <Picker.Item label="Kindly select role" value="" />
                  <Picker.Item label="Senior Citizen" value="Senior Citizen" />
                  <Picker.Item label="Person with Disability" value="Person with Disability" />
                  <Picker.Item label="Guardian" value="Guardian" />
                  <Picker.Item label="Responder" value="Responder" />
                  <Picker.Item label="Barangay Official" value="Barangay Official" />
                </Picker>
              </View>
            </View>
            <Field
              label="Enter First Name"
              required
              value={form.firstName}
              onChangeText={(v) => updateField('firstName', v)}
            />
            <Field
              label="Enter Last Name"
              required
              value={form.lastName}
              onChangeText={(v) => updateField('lastName', v)}
            />
            <Field
              label="Enter Birthday"
              required
              placeholder="MM/DD/YYYY"
              value={form.birthdate}
              onChangeText={(v) => updateField('birthdate', v)}
            />
            <Field
              label="Enter Barangay"
              value={form.barangay}
              onChangeText={(v) => updateField('barangay', v)}
            />
          </>
        ) : (
          <>
            <Field
              label="Guardian Full Name"
              required
              value={form.guardianName}
              onChangeText={(v) => updateField('guardianName', v)}
            />
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>
                Select Relationship<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={form.relationship}
                  onValueChange={(v) => updateField('relationship', v)}
                >
                  <Picker.Item label="Kindly select relationship" value="" />
                  <Picker.Item label="Parent" value="Parent" />
                  <Picker.Item label="Grandparent" value="Grandparent" />
                  <Picker.Item label="Child" value="Child" />
                  <Picker.Item label="Grandchild" value="Grandchild" />
                  <Picker.Item label="Sibling" value="Sibling" />
                  <Picker.Item label="Spouse" value="Spouse" />
                  <Picker.Item label="Guardian" value="Guardian" />
                </Picker>
              </View>
            </View>
            <Text style={styles.fieldLabel}>Enter Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+63</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="9XX-XXX-XXXX"
                keyboardType="number-pad"
                maxLength={10}
                value={form.guardianContact}
                onChangeText={(v) => updateField('guardianContact', v.replace(/[^0-9]/g, ''))}
              />
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={step === 1 ? handleNext : handleEnroll}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {step === 1 ? 'Next' : loading ? 'Enrolling...' : 'Enroll'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.pageLabel}>page {step}</Text>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, required, value, onChangeText, placeholder }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  back: { fontSize: 16, color: '#e02f2f', marginBottom: 12 },
  heading: { fontSize: 22, fontWeight: 'bold' },
  subheading: { fontSize: 14, color: '#666', marginBottom: 16 },

  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    marginRight: 6,
  },
  progressBarActive: { backgroundColor: '#e02f2f' },

  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, color: '#333', marginBottom: 6, fontWeight: '500' },
  required: { color: '#e02f2f' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },

  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },

  phoneRow: { flexDirection: 'row', marginBottom: 14 },
  countryCode: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#f2f2f2',
  },
  countryCodeText: { fontSize: 16, fontWeight: '600' },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },

  primaryButton: {
    backgroundColor: '#e02f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#e02f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#e02f2f', fontSize: 16, fontWeight: '600' },

  pageLabel: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12 },

  qrBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f2f2f2',
  },
  qrPlaceholderText: { textAlign: 'center', color: '#999', fontSize: 13 },
  qrName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  qrDetail: { fontSize: 13, color: '#333', textAlign: 'center' },
});