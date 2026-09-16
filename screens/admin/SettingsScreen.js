import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';

const account = { name: 'Maria Reyes', position: 'Barangay Secretary', barangay: 'Barangay 206' };

export default function SettingsScreen({ navigation, setSession }) {
  const [push, setPush] = useState(true);
  const [sound, setSound] = useState(true);
  const [newAlert, setNewAlert] = useState(true);
  const [assignment, setAssignment] = useState(true);
  const [escalated, setEscalated] = useState(true);

  const info = (title, message) => Alert.alert(title, message);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.photo} />
          <View style={{ flex: 1 }}><Text style={styles.name}>{account.name}</Text><Text style={styles.meta}>{account.position} • {account.barangay}</Text></View>
        </View>
        <Text style={styles.heading}>Settings</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section title="Account Information">
          <Info label="Name" value={account.name} /><Info label="Position" value={account.position} /><Info label="Barangay" value={account.barangay} />
        </Section>

        <Section title="Notifications">
          <ToggleRow label="Push Notifications" value={push} onChange={setPush} />
          <Divider />
          <ToggleRow label="Emergency Alert Sound" value={sound} onChange={setSound} />
          <Divider />
          <ToggleRow label="New Emergency Alert" value={newAlert} onChange={setNewAlert} />
          <Divider />
          <ToggleRow label="Responder Assignment Update" value={assignment} onChange={setAssignment} />
          <Divider />
          <ToggleRow label="Escalated Alert Notification" value={escalated} onChange={setEscalated} />
        </Section>

        <Section title="User & Access Management">
          <LinkRow icon="users-cog" label="Manage Users" onPress={() => navigation.navigate('ManageUsers')} />
        </Section>

        <Section title="Accessibility">
          <LinkRow icon="language" label="Language" value="English" onPress={() => info('Language', 'English / Filipino')} />
          <Divider /><LinkRow icon="font" label="Font" value="Poppins" onPress={() => info('Font', 'Poppins')} />
          <Divider /><LinkRow icon="text-height" label="Font Size" value="Default" onPress={() => info('Font Size', 'Choose a readable text size.')} />
        </Section>

        <Section title="Help & Support">
          <LinkRow icon="question-circle" label="FAQ" onPress={() => info('FAQ', 'Frequently asked questions about using ResQR.')} />
          <Divider /><LinkRow icon="phone" label="Barangay Contact Number" value="View contact" onPress={() => info('Barangay Contact', 'Barangay 206 contact number')} />
          <Divider /><LinkRow icon="bug" label="Report a Problem / Bug" onPress={() => info('Report a Problem', 'Please provide the issue you encountered.')} />
        </Section>

        <Section title="About">
          <LinkRow icon="info-circle" label="About ResQR" onPress={() => info('About ResQR', 'ResQR is a barangay emergency response and resident safety system that uses QR-based identification and coordinated Guardian–Responder confirmation.')} />
          <Divider /><LinkRow label="App Version" value="1.0" />
          <Divider /><LinkRow icon="file-contract" label="Terms of Service / Agreement" onPress={() => info('Terms of Service', 'Terms of Service / Agreement content goes here.')} />
          <Divider /><LinkRow icon="user-shield" label="Privacy Policy" onPress={() => info('Privacy Policy', 'Privacy Policy content goes here.')} />
        </Section>

        <TouchableOpacity style={styles.logout} onPress={() => Alert.alert('Log Out?', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', style: 'destructive', onPress: () => setSession?.(null) }])}>
          <FontAwesome5 name="sign-out-alt" size={15} color="#a83232" /><Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function Section({ title, children }) { return <View><Text style={styles.section}>{title}</Text><View style={styles.card}>{children}</View></View>; }
function Divider() { return <View style={styles.innerDivider} />; }
function ToggleRow({ label, value, onChange }) { return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Switch value={value} onValueChange={onChange} trackColor={{ false: '#ccc', true: '#fbd1d1' }} thumbColor={value ? '#a83232' : '#f4f3f4'} /></View>; }
function LinkRow({ icon, label, value, onPress }) { return <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>{icon ? <FontAwesome5 name={icon} size={15} color="#a83232" style={{ marginRight: 10 }} /> : null}<Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>{value ? <Text style={styles.value}>{value}</Text> : null}{onPress ? <FontAwesome5 name="chevron-right" size={11} color="#888" style={{ marginLeft: 7 }} /> : null}</TouchableOpacity>; }
function Info({ label, value }) { return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollContent: { padding: 20, paddingTop: 5, paddingBottom: 30 }, profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }, photo: { width: 82, height: 82, borderRadius: 41, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 13 }, name: { fontSize: 21, fontFamily: 'Poppins_600SemiBold' }, meta: { fontSize: 13, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, heading: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 6 }, divider: { borderTopWidth: 1, borderTopColor: '#ddd' }, section: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 }, card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff', padding: 5, shadowColor: '#777', shadowOffset: { width: 3, height: 5 }, shadowOpacity: 0.14, shadowRadius: 5, elevation: 3 }, row: { minHeight: 48, paddingHorizontal: 9, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }, rowLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#333' }, value: { fontSize: 11, color: '#777', fontFamily: 'Poppins_400Regular' }, innerDivider: { height: 1, backgroundColor: '#eee' }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 9, borderBottomWidth: 1, borderBottomColor: '#eee' }, infoLabel: { fontSize: 12, color: '#777', fontFamily: 'Poppins_400Regular' }, infoValue: { fontSize: 12, fontFamily: 'Poppins_500Medium' }, logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ffdcdc', borderRadius: 10, paddingVertical: 13, marginTop: 22 }, logoutText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', marginLeft: 7 },
});
