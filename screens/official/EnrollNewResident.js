import { typography, spacing, colors } from '../../constants/theme';
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Text from "../../components/AppText";
import TextInput from "../../components/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import QRCode from 'react-native-qrcode-svg';
import { api } from '../../services/api';
import { exportQrCard } from '../../services/qrCardExport';
import { Field } from "../../components/ui";

const MONTHS = [
  { value: '01', label: 'JAN' },
  { value: '02', label: 'FEB' },
  { value: '03', label: 'MAR' },
  { value: '04', label: 'APR' },
  { value: '05', label: 'MAY' },
  { value: '06', label: 'JUN' },
  { value: '07', label: 'JUL' },
  { value: '08', label: 'AUG' },
  { value: '09', label: 'SEP' },
  { value: '10', label: 'OCT' },
  { value: '11', label: 'NOV' },
  { value: '12', label: 'DEC' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => String(CURRENT_YEAR - i));

const RESIDENT_TYPES = [
  { label: 'Senior Citizen', value: 'Senior Citizen' },
  { label: 'Person with Disability', value: 'Person with Disability' },
];

const RELATIONSHIPS = [
  { label: 'Parent', value: 'Parent' },
  { label: 'Grandparent', value: 'Grandparent' },
  { label: 'Child', value: 'Child' },
  { label: 'Grandchild', value: 'Grandchild' },
  { label: 'Sibling', value: 'Sibling' },
  { label: 'Spouse', value: 'Spouse' },
  { label: 'Guardian', value: 'Guardian' },
];

function daysInMonth(month, year) {
  if (!month || !year) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

export default function EnrollNewResident({ navigation, session }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdResident, setCreatedResident] = useState(null);
  const [createdQr, setCreatedQr] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [savingQr, setSavingQr] = useState(false);
  const qrRef = useRef(null);

  const officialBarangayName = session?.user?.barangayName ?? null;

  const [form, setForm] = useState({
    role: '', firstName: '', lastName: '', birthdate: '', homeAddress: '',
    barangay: officialBarangayName ?? '', guardianName: '', relationship: '',
    guardianContact: '', guardianEmail: ''
  });

  useEffect(() => { updateField('barangay', officialBarangayName ?? ''); }, [officialBarangayName]);

  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const maxBirthDay = daysInMonth(birthMonth, birthYear);
  const DAYS = Array.from({ length: maxBirthDay }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') }));

  useEffect(() => {
    if (birthDay && Number(birthDay) > maxBirthDay) {
      setBirthDay(String(maxBirthDay).padStart(2, '0'));
    }
  }, [birthMonth, birthYear]);

  useEffect(() => {
    updateField('birthdate', birthMonth && birthDay && birthYear ? `${birthYear}-${birthMonth}-${birthDay}` : '');
  }, [birthMonth, birthDay, birthYear]);

  function resetBirthdate() { setBirthMonth(''); setBirthDay(''); setBirthYear(''); }

  const [guardianMode, setGuardianMode] = useState('');
  const [selectedGuardianId, setSelectedGuardianId] = useState('');
  const [existingGuardians, setExistingGuardians] = useState([]);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [guardiansError, setGuardiansError] = useState(null);

  useEffect(() => {
    if (guardianMode !== 'existing') return;
    let cancelled = false;
    setLoadingGuardians(true);
    setGuardiansError(null);
    api.listGuardians()
      .then((guardians) => { if (!cancelled) setExistingGuardians(guardians.filter((guardian) => guardian.is_active !== false)); })
      .catch((err) => { if (!cancelled) setGuardiansError(err.message); })
      .finally(() => { if (!cancelled) setLoadingGuardians(false); });
    return () => { cancelled = true; };
  }, [guardianMode]);

  function resetGuardianStep() { setGuardianMode(''); setSelectedGuardianId(''); }
  function updateField(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  function handleNext() {
    if (!form.firstName || !form.lastName || !form.birthdate || !form.barangay || !form.role) {
      Alert.alert('Missing information', 'Complete the fields marked * before continuing.');
      return;
    }
    setStep(2);
  }

  async function generateQrForResident(residentId) {
    setGeneratingQr(true);
    setQrError(null);
    try {
      const qr = await api.generateQr({ residentId });
      setCreatedQr(qr);
    } catch (err) {
      setQrError(err.message);
    } finally {
      setGeneratingQr(false);
    }
  }

  function handleEnroll() {
    if (loading) return;
    if (!guardianMode) { Alert.alert('Guardian', 'Choose whether this resident has a guardian.'); return; }
    if (guardianMode === 'existing' && (!selectedGuardianId || !form.relationship)) {
      Alert.alert('Existing guardian', 'Select a guardian and their relationship to the resident.'); return;
    }
    if (guardianMode === 'new' && (!form.guardianName || !form.relationship || !form.guardianEmail)) {
      Alert.alert('New guardian', 'Enter the guardian name, relationship and email address. The invitation is sent by email.'); return;
    }
    if (guardianMode === 'existing') {
      const guardian = existingGuardians.find((item) => item.id === selectedGuardianId);
      Alert.alert(
        'Confirm guardian',
        `Confirm that you have verified ${guardianDisplayName(guardian)}'s identity and their relationship (${form.relationship}) to this resident.`,
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => { void submitEnrollment(true); } }],
      );
      return;
    }
    void submitEnrollment(false);
  }

  async function submitEnrollment(guardianVerifiedByOfficial) {
    if (loading) return;
    setLoading(true);
    try {
      const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ');
      const resident = await api.enrollResident({
        fullName,
        residentType: form.role || undefined,
        dateOfBirth: form.birthdate || undefined,
        homeAddress: form.homeAddress || undefined,
        guardianId: guardianMode === 'existing' ? selectedGuardianId : undefined,
        relationship: guardianMode === 'existing' ? form.relationship : undefined,
        guardianVerifiedByOfficial,
        newGuardian: guardianMode === 'new' ? {
          fullName: form.guardianName.trim(),
          relation: form.relationship,
          phone: form.guardianContact ? `+63${form.guardianContact}` : undefined,
          email: form.guardianEmail || undefined,
        } : undefined,
      });
      setCreatedResident(resident);
      await generateQrForResident(resident.id);
      setStep(3);
    } catch (err) {
      if (err.residentId) {
        // The resident was saved but a guardian step failed. Continue with the
        // saved resident instead of letting a retry create a duplicate.
        setCreatedResident({ id: err.residentId, full_name: err.residentName });
        await generateQrForResident(err.residentId);
        setStep(3);
        Alert.alert('Resident saved', err.message);
      } else {
        Alert.alert('Enrollment Failed', err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveQrCard() {
    if (savingQr || !createdQr?.publicScanUrl) return;
    setSavingQr(true);
    try { await exportQrCard(qrRef); }
    catch (err) { Alert.alert('Could not save QR card', err.message); }
    finally { setSavingQr(false); }
  }

  function ProgressBar({ activeCount }) {
    return (
      <View style={styles.progressRow}>
        <View style={[styles.progressBar, activeCount >= 1 && styles.progressBarActive]} />
        <View style={[styles.progressBar, activeCount >= 2 && styles.progressBarActive]} />
      </View>
    );
  }

  function resetEnrollmentForm() {
    setForm({ role: '', firstName: '', lastName: '', birthdate: '', homeAddress: '', barangay: officialBarangayName ?? '', guardianName: '', relationship: '', guardianContact: '', guardianEmail: '' });
    resetBirthdate();
    resetGuardianStep();
    setCreatedResident(null);
    setCreatedQr(null);
    setQrError(null);
    setStep(1);
  }

  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => navigation.navigate('ResidentScreen')}>‹ Done</Text>
          <Text style={styles.heading}>QR Card Generated</Text>
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              {generatingQr ? (
                <ActivityIndicator color={colors.primary} />
              ) : createdQr?.publicScanUrl ? (
                <QRCode value={createdQr.publicScanUrl} size={240} ecl={(createdQr.error_correction || 'Q').toUpperCase()} getRef={(node) => { qrRef.current = node; }} />
              ) : (
                <>
                  <Text style={styles.qrPlaceholderText}>{qrError ? `QR generation failed:\n${qrError}` : 'QR CODE\nUNAVAILABLE'}</Text>
                  <TouchableOpacity style={styles.qrRetryButton} onPress={() => generateQrForResident(createdResident.id)}>
                    <Text style={styles.qrRetryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <Text style={styles.qrName}>{createdResident?.full_name}</Text>
            <Text style={styles.qrDetail}>{createdResident?.resident_code}</Text>
            <Text style={styles.qrDetail}>{officialBarangayName}</Text>
          </View>
          <TouchableOpacity style={[styles.button, styles.shadow]} disabled={savingQr || !createdQr?.publicScanUrl} onPress={saveQrCard}>
            <Text style={styles.buttonText}>{savingQr ? 'Preparing QR Card…' : 'Save / Share QR Card'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pdfButton, styles.shadow]} onPress={() => navigation.replace('ProfileScreen', { residentId: createdResident.id })}>
            <Text style={styles.pdfButtonText}>View Resident Profile</Text>
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
        <Text style={styles.subheading}>{step === 1 ? 'step 1 : Personal Information' : 'step 2 : Guardian Information'}</Text>
        <ProgressBar activeCount={step} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Select Resident Type<Text style={styles.required}>*</Text></Text>
              <Dropdown
                style={styles.pickerWrap}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={styles.dropdownText}
                fontFamily="Poppins_400Regular"
                data={RESIDENT_TYPES}
                labelField="label"
                valueField="value"
                placeholder="Kindly select type"
                value={form.role}
                onChange={(item) => updateField('role', item.value)}
                iconColor={colors.textSecondary}
              />
            </View>

            <Field label="Enter First Name" required value={form.firstName} onChangeText={(v) => updateField('firstName', v)} />
            <Field label="Enter Last Name" required value={form.lastName} onChangeText={(v) => updateField('lastName', v)} />

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Enter Birthday<Text style={styles.required}>*</Text></Text>
              <View style={styles.birthRow}>
                <View style={styles.birthPickerWrap}>
                  <Dropdown
                    style={styles.pickerWrap}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownText}
                    itemTextStyle={styles.dropdownText}
                    fontFamily="Poppins_400Regular"
                    data={MONTHS}
                    labelField="label"
                    valueField="value"
                    placeholder="Month"
                    value={birthMonth}
                    onChange={(item) => setBirthMonth(item.value)}
                    iconColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.birthPickerWrap}>
                  <Dropdown
                    style={styles.pickerWrap}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownText}
                    itemTextStyle={styles.dropdownText}
                    fontFamily="Poppins_400Regular"
                    data={DAYS}
                    labelField="label"
                    valueField="value"
                    placeholder="Day"
                    value={birthDay}
                    onChange={(item) => setBirthDay(item.value)}
                    iconColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.birthPickerWrapLast}>
                  <Dropdown
                    style={styles.pickerWrap}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownText}
                    itemTextStyle={styles.dropdownText}
                    fontFamily="Poppins_400Regular"
                    data={YEARS.map((y) => ({ label: y, value: y }))}
                    labelField="label"
                    valueField="value"
                    placeholder="Year"
                    value={birthYear}
                    onChange={(item) => setBirthYear(item.value)}
                    iconColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            <Field label="Enter Home Address" value={form.homeAddress} onChangeText={(v) => updateField('homeAddress', v)} placeholder="House no., street, purok/subdivision" />

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Barangay</Text>
              {officialBarangayName ? (
                <View style={styles.readOnlyField}><Text style={styles.readOnlyFieldText}>{officialBarangayName}</Text></View>
              ) : (
                <View style={styles.readOnlyFieldWarning}><Text style={styles.readOnlyFieldWarningText}>Your account isn't linked to a barangay yet. Contact your QRAlalay administrator before enrolling residents.</Text></View>
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Does this resident have a guardian?</Text>
            <View style={styles.guardianModeRow}>
              <ModeButton label="No guardian" active={guardianMode === 'none'} onPress={() => setGuardianMode('none')} />
              <ModeButton label="Existing guardian" active={guardianMode === 'existing'} onPress={() => setGuardianMode('existing')} />
              <ModeButton label="New guardian" active={guardianMode === 'new'} onPress={() => setGuardianMode('new')} last />
            </View>

            {guardianMode === 'none' && (<Text style={styles.noGuardianNote}>No guardian will be linked to this resident. You can add one later from their profile.</Text>)}

            {guardianMode === 'existing' && (
              <>
                <Text style={styles.fieldLabel}>A guardian can have multiple wards, so pick from any registered guardian account.</Text>
                {loadingGuardians ? (
                  <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />
                ) : guardiansError ? (
                  <Text style={styles.noGuardianNote}>Couldn't load guardians: {guardiansError}</Text>
                ) : existingGuardians.length === 0 ? (
                  <Text style={styles.noGuardianNote}>No active guardian accounts found. Choose "New guardian" instead.</Text>
                ) : (
                  <View style={styles.wardList}>
                    {existingGuardians.map((guardian) => {
                      const selected = selectedGuardianId === guardian.id;
                      return (
                        <TouchableOpacity key={guardian.id} style={[styles.wardRow, selected && styles.wardRowSelected]} onPress={() => setSelectedGuardianId((prev) => (prev === guardian.id ? '' : guardian.id))}>
                          <View style={[styles.wardCheckbox, selected && styles.wardCheckboxChecked]}>{selected && <Text style={styles.wardCheckboxMark}>✓</Text>}</View>
                          <View style={styles.wardTextWrap}>
                            <Text style={styles.wardName}>{guardianDisplayName(guardian)}</Text>
                            <Text style={styles.wardMeta}>{guardian.phoneNumber || guardian.phone_number || guardian.email || 'No contact on file'}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {!!selectedGuardianId && (
                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>Select Relationship<Text style={styles.required}>*</Text></Text>
                    <Dropdown
                      style={styles.pickerWrap}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownText}
                      itemTextStyle={styles.dropdownText}
                      fontFamily="Poppins_400Regular"
                      data={RELATIONSHIPS}
                      labelField="label"
                      valueField="value"
                      placeholder="Kindly select relationship"
                      value={form.relationship}
                      onChange={(item) => updateField('relationship', item.value)}
                      iconColor={colors.textSecondary}
                    />
                  </View>
                )}
              </>
            )}

            {guardianMode === 'new' && (
              <>
                <Field label="Guardian Full Name" required value={form.guardianName} onChangeText={(v) => updateField('guardianName', v)} />
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Select Relationship<Text style={styles.required}>*</Text></Text>
                  <Dropdown
                    style={styles.pickerWrap}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownText}
                    itemTextStyle={styles.dropdownText}
                    fontFamily="Poppins_400Regular"
                    data={RELATIONSHIPS}
                    labelField="label"
                    valueField="value"
                    placeholder="Kindly select relationship"
                    value={form.relationship}
                    onChange={(item) => updateField('relationship', item.value)}
                    iconColor={colors.textSecondary}
                  />
                </View>
                <Text style={styles.fieldLabel}>Phone Number (optional)</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}><Text style={styles.countryCodeText}>+63</Text></View>
                  <TextInput style={styles.phoneInput} placeholder="9XX-XXX-XXXX" keyboardType="number-pad" maxLength={10} value={form.guardianContact} onChangeText={(v) => updateField('guardianContact', v.replace(/[^0-9]/g, ''))} />
                </View>
                <Field label="Guardian Email" required placeholder="name@example.com" value={form.guardianEmail} onChangeText={(v) => updateField('guardianEmail', v.trim())} keyboardType="email-address" autoCapitalize="none" />
              </>
            )}
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

function guardianDisplayName(guardian) {
  return guardian?.fullName || guardian?.full_name || 'this guardian';
}

function ModeButton({ label, active, onPress, last }) {
  return (
    <TouchableOpacity style={[styles.modeButton, last && styles.modeButtonLast, active && styles.modeButtonActive]} onPress={onPress}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, minHeight: 44, paddingVertical: 4, marginTop: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 8 },
  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, marginRight: 6 },
  progressBarActive: { backgroundColor: colors.primary },
  fieldWrap: { marginBottom: spacing.field },
  fieldLabel: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 10 },
  required: { color: colors.alertInk },
  input: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: 12, backgroundColor: colors.surfaceSunken, fontFamily: 'Poppins_400Regular', fontSize: typography.body, minHeight: spacing.control },
  pickerWrap: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: 12, backgroundColor: colors.surfaceSunken, minHeight: spacing.control },
  dropdownPlaceholder: { fontFamily: 'Poppins_400Regular', fontSize: typography.body, color: colors.textMuted },
  dropdownText: { fontFamily: 'Poppins_400Regular', fontSize: typography.detail, color: colors.textPrimary },
  birthRow: { flexDirection: 'row' },
  birthPickerWrap: { flex: 1, marginRight: 8 },
  birthPickerWrapLast: { flex: 1 },
  readOnlyField: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, padding: 12, backgroundColor: colors.border, minHeight: spacing.control },
  readOnlyFieldText: { fontFamily: 'Poppins_400Regular', fontSize: typography.body, color: colors.textPrimary },
  readOnlyFieldWarning: { borderWidth: 1, borderColor: colors.warning, borderRadius: 8, padding: 12, backgroundColor: colors.warningSoft, minHeight: spacing.control },
  readOnlyFieldWarningText: { fontFamily: 'Poppins_400Regular', fontSize: typography.caption, color: colors.warningInk },
  wardList: { marginTop: 12, marginBottom: 8 },
  wardRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: colors.surface },
  wardRowSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  wardTextWrap: { flex: 1 },
  wardName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textPrimary },
  wardMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 2 },
  wardCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.textMuted, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  wardCheckboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  wardCheckboxMark: { color: colors.onPrimary, fontSize: typography.detail, fontFamily: 'Poppins_400Regular' },
  noGuardianNote: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 14, lineHeight: Math.ceil(typography.caption * 1.5) },
  guardianModeRow: { flexDirection: 'row', marginBottom: 14 },
  modeButton: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingVertical: 10, marginRight: 8, alignItems: 'center', backgroundColor: colors.surfaceSunken },
  modeButtonLast: { marginRight: 0 },
  modeButtonActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  modeButtonText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, textAlign: 'center' },
  modeButtonTextActive: { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  phoneRow: { flexDirection: 'row', marginBottom: 14 },
  countryCode: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', marginRight: 8, backgroundColor: colors.surfaceSunken },
  countryCodeText: { fontSize: typography.body, fontWeight: '600' },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, padding: 16, backgroundColor: colors.surfaceSunken, fontSize: typography.body, fontFamily: 'Poppins_400Regular', minHeight: spacing.control },
  bottomBar: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  button: { borderRadius: 10, backgroundColor: colors.primarySoft, paddingVertical: 16, alignItems: 'center', marginBottom: 8, minHeight: spacing.control, justifyContent: 'center' },
  buttonText: { color: colors.primary, fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  pdfButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 12, minHeight: spacing.control, justifyContent: 'center' },
  pdfButtonText: { color: colors.primary, fontSize: typography.body, fontFamily: 'Poppins_400Regular' },
  pageLabel: { textAlign: 'center', color: colors.textMuted, marginTop: 8, fontSize: typography.caption, fontFamily: 'Poppins_400Regular' },
  qrBox: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 20, marginBottom: 20, marginHorizontal: 16 },
  qrPlaceholder: { width: 280, height: 280, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 5, marginBottom: 25, backgroundColor: colors.surfaceSunken },
  qrPlaceholderText: { textAlign: 'center', color: colors.textMuted, fontSize: typography.caption, fontFamily: 'Poppins_500Medium', marginBottom: 12 },
  qrRetryButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  qrRetryButtonText: { color: colors.primary, fontSize: typography.detail, fontFamily: 'Poppins_500Medium' },
  qrName: { fontSize: typography.title, fontFamily: 'Poppins_500Medium', marginBottom: 6 },
  qrDetail: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textPrimary, textAlign: 'center', marginBottom: 4 },
});