import { typography, spacing, colors } from '../../constants/theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Text from "../../components/AppText";
import TextInput from "../../components/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

export default function EditResidentScreen({ route, navigation }) {
  const { resident } = route.params;

  const [draft, setDraft] = useState({
    name: resident.name || '',
    birthDate: resident.birthDate || '',
    address: resident.address || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  async function handleSave() {
    if (saving) return;
    if (!draft.name?.trim()) { Alert.alert('Full name required'); return; }
    if (draft.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate)) {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD for the date of birth.'); return;
    }
    
    setSaving(true);
    try {
      await api.updateResident(resident.id, {
        fullName: draft.name.trim(),
        homeAddress: draft.address,
        ...(draft.birthDate ? { dateOfBirth: draft.birthDate } : {}),
      });
      // ProfileScreen reloads from the backend when it regains focus.
      Alert.alert('Resident updated', 'The resident information has been saved.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save resident', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>Edit Resident Information</Text>
        <Text style={styles.subheading}>Personal Information</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Editable Fields */}
        <Field label="Full Name" required value={draft.name} onChangeText={(v) => set('name', v)} />
        <Field label="Date of Birth" value={draft.birthDate} onChangeText={(v) => set('birthDate', v)} placeholder="YYYY-MM-DD" />
        <Field label="Address" value={draft.address} onChangeText={(v) => set('address', v)} />
        
        <Field  label="Guardian Name" value={resident.guardianName} editable={false} style={styles.readOnlyInput}/>
        <Field label="Guardian Contact" value={resident.guardianContact} editable={false} style={styles.readOnlyInput}/>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.button, styles.shadow]} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, required, editable = true, style }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput 
        style={[styles.input, style]} 
        value={value || ''} 
        onChangeText={onChangeText} 
        placeholder={placeholder} 
        placeholderTextColor={colors.textMuted} 
        keyboardType={keyboardType} 
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 20 },
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
  
  readOnlyInput: { backgroundColor: colors.border, color: colors.textSecondary},

  bottomBar: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  button: { borderRadius: 10, backgroundColor: colors.primarySoft, paddingVertical: 16, alignItems: 'center', marginBottom: 8, minHeight: spacing.control, justifyContent: 'center' },
  buttonText: { color: colors.primary, fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  cancelButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, paddingVertical: 16, alignItems: 'center', minHeight: spacing.control, justifyContent: 'center' },
  cancelText: { color: colors.primary, fontSize: typography.body, fontFamily: 'Poppins_400Regular' },
  pageLabel: { textAlign: 'center', color: colors.textMuted, marginTop: 8, fontSize: typography.caption, fontFamily: 'Poppins_400Regular' },
});