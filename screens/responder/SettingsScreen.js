import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/ResponderTabButtons';
import { useAdminData } from '../../AdminDataContext';

const RESPONDER_NAME = 'Rowendo Carpino';

export default function SettingsScreen({ navigation, setSession }) {
  const [push, setPush] = useState(true);
  const [sound, setSound] = useState(true);
  const [assignment, setAssignment] = useState(true);
  const [escalated, setEscalated] = useState(true);

  const info = (title, message) => Alert.alert(title, message);

  const handleLogout = () => {
    Alert.alert('Log Out?', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => setSession?.(null),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.photo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{RESPONDER_NAME}</Text>
            <Text style={styles.meta}>Barangay Responder • Barangay 206</Text>
          </View>
        </View>
        <Text style={styles.heading}>Settings</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section title="Account Information">
          <Info label="Name" value={RESPONDER_NAME} />
          <Info label="Position" value="Barangay Responder" />
          <Info label="Barangay" value="Barangay 206" />
        </Section>

        <Section title="Notifications">
          <ToggleRow label="Push Notifications" value={push} onChange={setPush} />
          <Divider />
          <ToggleRow label="Emergency Alert Sound" value={sound} onChange={setSound} />
          <Divider />
          <ToggleRow label="Responder Assignment Update" value={assignment} onChange={setAssignment} />
          <Divider />
          <ToggleRow label="Escalated Alert Notification" value={escalated} onChange={setEscalated} />
        </Section>

        <Section title="Accessibility">
          <LinkRow icon="language" label="Language" value="English" onPress={() => info('Language', 'English / Filipino')} />
          <Divider />
          <LinkRow icon="font" label="Font" value="Poppins" onPress={() => info('Font', 'Poppins')} />
          <Divider />
          <LinkRow icon="text-height" label="Font Size" value="Default" onPress={() => info('Font Size', 'Choose a readable text size.')} />
        </Section>

        <Section title="Help & Support">
          <LinkRow icon="question-circle" label="FAQ" onPress={() => info('FAQ', 'Frequently asked questions about using ResQR.')} />
          <Divider />
          <LinkRow icon="phone" label="Barangay Contact Number" value="View contact" onPress={() => info('Barangay Contact', 'Barangay 206 contact number')} />
          <Divider />
          <LinkRow icon="bug" label="Report a Problem / Bug" onPress={() => info('Report a Problem', 'Please provide the issue you encountered.')} />
        </Section>

        <Section title="About">
          <LinkRow icon="info-circle" label="About ResQR" onPress={() => info('About ResQR', 'ResQR is a barangay emergency response and resident safety system that uses QR-based identification and coordinated Guardian–Responder confirmation.')} />
          <Divider />
          <LinkRow label="App Version" value="1.0" />
          <Divider />
          <LinkRow icon="file-contract" label="Terms of Service / Agreement" onPress={() => info('Terms of Service', 'Terms of Service / Agreement content goes here.')} />
          <Divider />
          <LinkRow icon="user-shield" label="Privacy Policy" onPress={() => info('Privacy Policy', 'Privacy Policy content goes here.')} />
        </Section>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={15} color="#a83232" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View>
      <Text style={styles.section}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.innerDivider} />;
}

function ToggleRow({ label, value, onChange }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#ccc', true: '#fbd1d1' }}
        thumbColor={value ? '#a83232' : '#f4f3f4'}
      />
    </View>
  );
}

function LinkRow({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      {icon ? <FontAwesome5 name={icon} size={15} color="#a83232" style={{ marginRight: 10 }} /> : null}
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {onPress ? <FontAwesome5 name="chevron-right" size={11} color="#888" style={{ marginLeft: 7 }} /> : null}
    </TouchableOpacity>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollContent: { padding: 20, paddingTop: 5, paddingBottom: 30 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  photo: { width: 82, height: 82, borderRadius: 41, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 13 },
  name: { fontSize: 21, fontFamily: 'Poppins_600SemiBold' },
  meta: { fontSize: 13, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 },
  heading: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 6 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  section: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  row: { minHeight: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  rowLabel: { fontSize: 15, fontFamily: 'Poppins_400Regular' },
  value: { fontSize: 13, color: '#777', fontFamily: 'Poppins_400Regular' },
  innerDivider: { borderTopWidth: 1, borderTopColor: '#eee', marginHorizontal: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  infoLabel: { fontSize: 14, color: '#777', fontFamily: 'Poppins_400Regular' },
  infoValue: { fontSize: 14, fontFamily: 'Poppins_500Medium', maxWidth: '60%', textAlign: 'right' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#a83232', backgroundColor: '#f1bdbd', borderRadius: 10, paddingVertical: 13, marginTop: 20, marginBottom: 20 },
  logoutText: { color: '#a83232', fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
});