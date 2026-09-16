import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import GuardianTabBar from '../../component/GuardianTabButtons';
import { useAdminData } from '../../AdminDataContext';

const GUARDIAN_NAME = 'Ana Santos';

export default function SettingsScreen({ navigation, setSession }) {
  const { users, residents } = useAdminData();
  const [push, setPush] = useState(true);
  const [sound, setSound] = useState(true);
  const [alertUpdate, setAlertUpdate] = useState(true);
  const [responderUpdate, setResponderUpdate] = useState(true);

  const guardianAccount = useMemo(() => users.find((user) => user.name === GUARDIAN_NAME), [users]);
  const wardIds = guardianAccount?.wardIds || [];
  const wards = residents.filter((r) => wardIds.includes(r.id));
  const relationship = wards[0]?.relationship || guardianAccount?.relationship || 'Guardian';
  const phone = guardianAccount?.phone || wards[0]?.guardianContact || 'Not available';

  const info = (title, message) => Alert.alert(title, message);
  const handleLogout = () => Alert.alert('Log Out?', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', style: 'destructive', onPress: () => setSession?.(null) },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.photo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{GUARDIAN_NAME}</Text>
            <Text style={styles.meta}>Guardian • Barangay 206</Text>
          </View>
        </View>
        <Text style={styles.heading}>Settings</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section title="Account Information">
          <Info label="Name" value={GUARDIAN_NAME} />
          <Info label="Mobile Number" value={phone} />
          <Info label="Relationship" value={relationship} />
          <Info label="Role" value="Guardian" />
          <Info label="Barangay" value="Barangay 206" />
          <Info label="Wards Linked" value={`${wards.length} ward${wards.length === 1 ? '' : 's'}`} />
        </Section>

        <Section title="Notifications">
          <ToggleRow label="Push Notifications" value={push} onChange={setPush} />
          <Divider />
          <ToggleRow label="Emergency Alert Sound" value={sound} onChange={setSound} />
          <Divider />
          <ToggleRow label="Emergency Alert Updates" value={alertUpdate} onChange={setAlertUpdate} />
          <Divider />
          <ToggleRow label="Responder Confirmation Update" value={responderUpdate} onChange={setResponderUpdate} />
        </Section>

        <Section title="Accessibility">
          <LinkRow icon="language" label="Language" value="English" onPress={() => info('Language', 'English / Filipino')} />
          <Divider />
          <LinkRow icon="font" label="Font" value="Poppins" onPress={() => info('Font', 'Poppins')} />
          <Divider />
          <LinkRow icon="text-height" label="Font Size" value="Default" onPress={() => info('Font Size', 'Choose a readable text size.')} />
        </Section>

        <Section title="Emergency Contacts">
          <LinkRow icon="phone-alt" label="Barangay 206" value="View contact" onPress={() => info('Barangay Contact', 'The official Barangay 206 contact number should be configured by the project administrator.')} />
          <Divider />
          <LinkRow icon="ambulance" label="National Emergency" value="911" onPress={() => navigation.navigate('EmergencyHelp')} />
        </Section>

        <Section title="Help & Support">
          <LinkRow icon="question-circle" label="FAQ" onPress={() => info('FAQ', 'Frequently asked questions about using ResQR.')} />
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
      <GuardianTabBar />
    </SafeAreaView>
  );
}

function Section({ title, children }) { return <View><Text style={styles.section}>{title}</Text><View style={styles.card}>{children}</View></View>; }
function Divider() { return <View style={styles.innerDivider} />; }
function ToggleRow({ label, value, onChange }) { return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Switch value={value} onValueChange={onChange} trackColor={{ false: '#ccc', true: '#fbd1d1' }} thumbColor={value ? '#a83232' : '#f4f3f4'} /></View>; }
function LinkRow({ icon, label, value, onPress }) { return <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>{icon ? <FontAwesome5 name={icon} size={14} color="#a83232" style={{ marginRight: 10 }} /> : null}<Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>{value ? <Text style={styles.value}>{value}</Text> : null}{onPress ? <FontAwesome5 name="chevron-right" size={10} color="#888" style={{ marginLeft: 7 }} /> : null}</TouchableOpacity>; }
function Info({ label, value }) { return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollContent: { padding: 20, paddingTop: 4, paddingBottom: 25 }, profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 }, photo: { width: 65, height: 65, borderRadius: 33, borderWidth: 1.5, borderColor: '#a83232', marginRight: 11 }, name: { fontSize: 19, fontFamily: 'Poppins_600SemiBold' }, meta: { fontSize: 11, color: '#666', fontFamily: 'Poppins_400Regular' }, heading: { fontSize: 25, fontFamily: 'Poppins_700Bold', marginBottom: 7 }, divider: { borderTopWidth: 1, borderTopColor: '#ddd' }, section: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', marginTop: 14, marginBottom: 6 }, card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', elevation: 3 }, row: { minHeight: 49, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 }, rowLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#222' }, value: { fontSize: 11, color: '#777', fontFamily: 'Poppins_400Regular' }, innerDivider: { borderTopWidth: 1, borderTopColor: '#eee', marginHorizontal: 13 }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 13, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#eee' }, infoLabel: { fontSize: 12, color: '#777', fontFamily: 'Poppins_400Regular' }, infoValue: { flex: 1, marginLeft: 15, textAlign: 'right', fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#333' }, logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#a83232', backgroundColor: '#f1bdbd', borderRadius: 10, paddingVertical: 13, marginTop: 19, marginBottom: 18 }, logoutText: { color: '#a83232', fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
});
