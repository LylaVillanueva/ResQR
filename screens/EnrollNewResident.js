import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { api } from '../lib/api';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const CURRENT_YEAR = new Date().getFullYear();
// 120-year span comfortably covers every resident (seniors included).
const YEARS = Array.from({ length: 120 }, (_, i) => String(CURRENT_YEAR - i));

// Backend expects an ISO date (YYYY-MM-DD, see enrollResidentSchema's
// z.string().date()) — this must stay a real calendar day, so day options
// are clamped to the selected month/year (no "February 30").
function daysInMonth(month, year) {
  if (!month || !year) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

export default function EnrollNewResident({ navigation, session }) {
  const [step, setStep] = useState(1); // 1 = page1, 2 = page2, 3 = qr result
  const [loading, setLoading] = useState(false);

  // A resident is always enrolled under the registering official's own
  // barangay (residents.barangay_id is set server-side from req.user, not
  // picked by the form) — so this is read-only, never free text.
  const officialBarangayName = session?.user?.barangayName ?? null;

  const [form, setForm] = useState({
    role: '',
    firstName: '',
    lastName: '',
    birthdate: '',
    barangay: officialBarangayName ?? '',
    guardianName: '',
    relationship: '',
    guardianContact: '',
    guardianEmail: ''
  });

  useEffect(() => {
    updateField('barangay', officialBarangayName ?? '');
  }, [officialBarangayName]);

  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const maxBirthDay = daysInMonth(birthMonth, birthYear);
  const DAYS = Array.from({ length: maxBirthDay }, (_, i) => String(i + 1).padStart(2, '0'));

  // Re-clamp the selected day if switching to a shorter month/year (e.g.
  // Jan 31 -> February) leaves it pointing past the end of the month.
  useEffect(() => {
    if (birthDay && Number(birthDay) > maxBirthDay) {
      setBirthDay(String(maxBirthDay).padStart(2, '0'));
    }
  }, [birthMonth, birthYear]);

  // Only a complete, valid selection becomes the backend-facing value —
  // matches enrollResidentSchema's YYYY-MM-DD expectation directly.
  useEffect(() => {
    updateField('birthdate', birthMonth && birthDay && birthYear ? `${birthYear}-${birthMonth}-${birthDay}` : '');
  }, [birthMonth, birthDay, birthYear]);

  function resetBirthdate() {
    setBirthMonth('');
    setBirthDay('');
    setBirthYear('');
  }

  const isGuardianRole = form.role === 'Guardian';
  // '' (unset) | 'none' | 'existing' | 'new' — a resident holds at most
  // one guardian_id, so this is a single choice, not a multi-select.
  const [guardianMode, setGuardianMode] = useState('');
  const [selectedGuardianId, setSelectedGuardianId] = useState('');
  const [existingGuardians, setExistingGuardians] = useState([]);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [guardiansError, setGuardiansError] = useState(null);
  const [selectedWardIds, setSelectedWardIds] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [wardsError, setWardsError] = useState(null);

  // Fetched from GET /api/users/residents — barangay_official only,
  // scoped server-side to the official's own barangay. Includes residents
  // who already have a guardian; picking one reassigns their guardian_id.
  useEffect(() => {
    if (step !== 2 || !isGuardianRole) return;
    let cancelled = false;
    setLoadingWards(true);
    setWardsError(null);
    api
      .listResidents()
      .then((residents) => {
        if (!cancelled) setAvailableWards(residents);
      })
      .catch((err) => {
        if (!cancelled) setWardsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingWards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, isGuardianRole]);

  function toggleWard(residentId) {
    setSelectedWardIds((prev) =>
      prev.includes(residentId) ? prev.filter((id) => id !== residentId) : [...prev, residentId]
    );
  }

  // Fetched from GET /api/users/guardians — real registered guardian
  // accounts, favoring the official's own barangay (see the endpoint's
  // own doc comment for why accounts with no barangay set are included).
  useEffect(() => {
    if (guardianMode !== 'existing') return;
    let cancelled = false;
    setLoadingGuardians(true);
    setGuardiansError(null);
    api
      .listGuardians()
      .then((guardians) => {
        if (!cancelled) setExistingGuardians(guardians);
      })
      .catch((err) => {
        if (!cancelled) setGuardiansError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingGuardians(false);
      });
    return () => {
      cancelled = true;
    };
  }, [guardianMode]);

  function resetGuardianStep() {
    setGuardianMode('');
    setSelectedGuardianId('');
    setSelectedWardIds([]);
  }

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
    // Registering a Guardian assigns wards instead of asking about a
    // guardian; a resident must first say whether it has one at all.
    if (!isGuardianRole) {
      if (!guardianMode) return;
      if (guardianMode === 'existing' && !selectedGuardianId) return;
      if (guardianMode === 'new' && (!form.guardianName || !form.guardianContact || !form.relationship)) {
        return;
      }
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
        <Text style={styles.heading}>QR Card Generated</Text>

        <View style={styles.qrBox}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>QR CODE{'\n'}PLACEHOLDER</Text>
          </View>
          <Text style={styles.qrName}>{form.fullName || 'NAME'}</Text>
          <Text style={styles.qrDetail}>{form.ID || 'ID: BRG-SC-2026-001'}</Text>
          <Text style={styles.qrDetail}>{form.guardian || 'Guardian: Mang Kanor'}</Text>
          <Text style={styles.qrDetail}>{form.phone ? `+63${form.phone}` : 'Contact: +639XXXXXXXXXX'}</Text>
          <Text style={styles.qrDetail}>{form.brgy || 'Barangay: 206'}</Text>
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
              barangay: officialBarangayName ?? '',
              guardianName: '',
              relationship: '',
              guardianContact: '',
              guardianEmail: '',
            });
            resetBirthdate();
            resetGuardianStep();
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

        {step === 1 ? (
          <>
            <Text style={styles.subheading}>step 1 : Personal Information</Text>
            <ProgressBar activeCount={step} />
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>
                Select Resident Type<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={form.role}
                  onValueChange={(v) => updateField('role', v)}
                  style={{ fontFamily: 'Poppins_400Regular' }}
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
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>
                Enter Birthday<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.birthRow}>
                <View style={[styles.pickerWrap, styles.birthPickerWrap]}>
                  <Picker
                    selectedValue={birthMonth}
                    onValueChange={setBirthMonth}
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    <Picker.Item label="Month" value="" />
                    {MONTHS.map((m) => (
                      <Picker.Item key={m.value} label={m.label} value={m.value} />
                    ))}
                  </Picker>
                </View>
                <View style={[styles.pickerWrap, styles.birthPickerWrap]}>
                  <Picker
                    selectedValue={birthDay}
                    onValueChange={setBirthDay}
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    <Picker.Item label="Day" value="" />
                    {DAYS.map((d) => (
                      <Picker.Item key={d} label={d} value={d} />
                    ))}
                  </Picker>
                </View>
                <View style={[styles.pickerWrap, styles.birthPickerWrapLast]}>
                  <Picker
                    selectedValue={birthYear}
                    onValueChange={setBirthYear}
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    <Picker.Item label="Year" value="" />
                    {YEARS.map((y) => (
                      <Picker.Item key={y} label={y} value={y} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Barangay</Text>
              {officialBarangayName ? (
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyFieldText}>{officialBarangayName}</Text>
                </View>
              ) : (
                <View style={styles.readOnlyFieldWarning}>
                  <Text style={styles.readOnlyFieldWarningText}>
                    Your account isn't linked to a barangay yet. Contact your ResQR administrator before enrolling residents.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : isGuardianRole ? (
          <>
            <Text style={styles.subheading}>step 2 : Assign Wards</Text>
            <ProgressBar activeCount={step} />
            <Text style={styles.fieldLabel}>
              Select any residents in {officialBarangayName || 'this barangay'} to link as this guardian's wards.
              Picking a resident who already has a guardian will reassign them to this one instead.
            </Text>
            {loadingWards ? (
              <ActivityIndicator style={{ marginVertical: 20 }} color="#245490" />
            ) : wardsError ? (
              <Text style={styles.noGuardianNote}>Couldn't load residents: {wardsError}</Text>
            ) : availableWards.length === 0 ? (
              <Text style={styles.noGuardianNote}>No residents found in this barangay.</Text>
            ) : (
              <View style={styles.wardList}>
                {availableWards.map((resident) => {
                  const selected = selectedWardIds.includes(resident.id);
                  return (
                    <TouchableOpacity
                      key={resident.id}
                      style={[styles.wardRow, selected && styles.wardRowSelected]}
                      onPress={() => toggleWard(resident.id)}
                    >
                      <View style={[styles.wardCheckbox, selected && styles.wardCheckboxChecked]}>
                        {selected && <Text style={styles.wardCheckboxMark}>✓</Text>}
                      </View>
                      <View style={styles.wardTextWrap}>
                        <Text style={styles.wardName}>{resident.full_name}</Text>
                        <Text style={styles.wardMeta}>
                          {resident.date_of_birth ? `Born ${resident.date_of_birth}` : 'No birthdate on file'}
                          {resident.guardian_id ? ' · Already has a guardian' : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {!loadingWards && selectedWardIds.length === 0 && (
              <Text style={styles.noGuardianNote}>
                No wards selected yet — you can also register this guardian first and assign wards later.
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.subheading}>step 2 : Guardian Information</Text>
            <ProgressBar activeCount={step} />

            <Text style={styles.fieldLabel}>Does this resident have a guardian?</Text>
            <View style={styles.guardianModeRow}>
              <ModeButton label="No guardian" active={guardianMode === 'none'} onPress={() => setGuardianMode('none')} />
              <ModeButton
                label="Existing guardian"
                active={guardianMode === 'existing'}
                onPress={() => setGuardianMode('existing')}
              />
              <ModeButton label="New guardian" active={guardianMode === 'new'} onPress={() => setGuardianMode('new')} last />
            </View>

            {guardianMode === 'none' && (
              <Text style={styles.noGuardianNote}>
                No guardian will be linked to this resident. You can add one later from their profile.
              </Text>
            )}

            {guardianMode === 'existing' && (
              <>
                <Text style={styles.fieldLabel}>
                  A guardian can have multiple wards, so pick from any registered guardian account.
                </Text>
                {loadingGuardians ? (
                  <ActivityIndicator style={{ marginVertical: 20 }} color="#245490" />
                ) : guardiansError ? (
                  <Text style={styles.noGuardianNote}>Couldn't load guardians: {guardiansError}</Text>
                ) : existingGuardians.length === 0 ? (
                  <Text style={styles.noGuardianNote}>
                    No registered guardian accounts found. Choose "New guardian" instead.
                  </Text>
                ) : (
                  <View style={styles.wardList}>
                    {existingGuardians.map((guardian) => {
                      const selected = selectedGuardianId === guardian.id;
                      return (
                        <TouchableOpacity
                          key={guardian.id}
                          style={[styles.wardRow, selected && styles.wardRowSelected]}
                          onPress={() => setSelectedGuardianId((prev) => (prev === guardian.id ? '' : guardian.id))}
                        >
                          <View style={[styles.wardCheckbox, selected && styles.wardCheckboxChecked]}>
                            {selected && <Text style={styles.wardCheckboxMark}>✓</Text>}
                          </View>
                          <View style={styles.wardTextWrap}>
                            <Text style={styles.wardName}>{guardian.full_name}</Text>
                            <Text style={styles.wardMeta}>
                              {guardian.phone_number || guardian.email || 'No contact on file'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            {guardianMode === 'new' && (
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
                      style={{ fontFamily: 'Poppins_400Regular' }}
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
                <Field
                  label="Guardian Email"
                  placeholder="name@example.com"
                  value={form.guardianEmail}
                  onChangeText={(v) => updateField('guardianEmail', v.trim())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            )}
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

function ModeButton({ label, active, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.modeButton, last && styles.modeButtonLast, active && styles.modeButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, required, value, onChangeText, placeholder, keyboardType, autoCapitalize }) {
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
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#245490', marginBottom: 12 },
  heading: { fontSize: 26, fontFamily: 'Poppins_600SemiBold', marginBottom: -8 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 8 },

  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    marginRight: 6,
  },
  progressBarActive: { backgroundColor: '#245490' },

  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 6 },
  required: { color: '#245490' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f2f2f2f0',
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
  },

  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingLeft: 2,
    backgroundColor: '#f2f2f2f0',
    overflow: 'hidden',
  },

  birthRow: { flexDirection: 'row' },
  birthPickerWrap: { flex: 1, marginRight: 8 },
  birthPickerWrapLast: { flex: 1 },

  readOnlyField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#e9e9e9',
  },
  readOnlyFieldText: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#333' },
  readOnlyFieldWarning: {
    borderWidth: 1,
    borderColor: '#e02f2f',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fdecec',
  },
  readOnlyFieldWarningText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#e02f2f' },

  wardList: { marginTop: 12, marginBottom: 8 },
  wardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  wardRowSelected: { borderColor: '#245490', backgroundColor: '#eef4fb' },
  wardTextWrap: { flex: 1 },
  wardName: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: '#1a1a1a' },
  wardMeta: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#888', marginTop: 2 },

  wardCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#bbb',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  wardCheckboxChecked: { backgroundColor: '#245490', borderColor: '#245490' },
  wardCheckboxMark: { color: '#fff', fontSize: 14, fontWeight: '700' },

  noGuardianNote: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#888', marginBottom: 14, lineHeight: 18 },

  guardianModeRow: { flexDirection: 'row', marginBottom: 14 },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#f2f2f2f0',
  },
  modeButtonLast: { marginRight: 0 },
  modeButtonActive: { borderColor: '#245490', backgroundColor: '#eef4fb' },
  modeButtonText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#666', textAlign: 'center' },
  modeButtonTextActive: { color: '#245490', fontFamily: 'Poppins_600SemiBold' },

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
    backgroundColor: '#f2f2f2f0',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
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
    backgroundColor: '#d3e5f8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#245490', fontSize: 16, fontFamily: 'Poppins_500Medium' },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d3e5f8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#245490', fontSize: 16, fontFamily: 'Poppins_400Regular' },

  pageLabel: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12, fontFamily: 'Poppins_400Regular',},

  qrBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  qrPlaceholder: {
    width: 280,
    height: 280,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 25,
    backgroundColor: '#f2f2f2',
  },
  qrPlaceholderText: { textAlign: 'center', color: '#999', fontSize: 13, fontFamily: 'Poppins_500Medium' },
  qrName: { fontSize: 24, fontFamily: 'Poppins_500Medium', marginBottom: 6 },
  qrDetail: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#333', textAlign: 'center', marginBottom: -2 },
});