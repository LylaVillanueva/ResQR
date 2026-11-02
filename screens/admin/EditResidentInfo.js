import { typography, spacing } from '../../theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Text from "../../component/AppText";
import TextInput from "../../component/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditResidentScreen({ route, navigation }) {
  const { resident, onSave } = route.params;
  
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
      await onSave(draft);
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
        <Text style={styles.subheading}>step 1 : Personal Information</Text>
        
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
        </View>
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
        <Text style={styles.pageLabel}>page 1</Text>
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
        placeholderTextColor="#999" 
        keyboardType={keyboardType} 
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 20 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#c12b2b', marginBottom: 4, minHeight: 44, paddingVertical: 4, marginTop: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 8 },
  
  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', marginRight: 6 },
  progressBarActive: { backgroundColor: '#c12b2b' },

  fieldWrap: { marginBottom: spacing.field },
  fieldLabel: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 10 },
  required: { color: '#c12b2b' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f2f2f2', fontFamily: 'Poppins_400Regular', fontSize: typography.body, minHeight: spacing.control },
  
  readOnlyInput: { backgroundColor: '#e9e9e9', color: '#888'},

  bottomBar: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  shadow: { shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  button: { borderRadius: 10, backgroundColor: '#fbd1d1', paddingVertical: 16, alignItems: 'center', marginBottom: 8, minHeight: spacing.control, justifyContent: 'center' },
  buttonText: { color: '#a83232', fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  cancelButton: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 16, alignItems: 'center', minHeight: spacing.control, justifyContent: 'center' },
  cancelText: { color: '#c12b2b', fontSize: typography.body, fontFamily: 'Poppins_400Regular' },
  pageLabel: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: typography.caption, fontFamily: 'Poppins_400Regular' },
});