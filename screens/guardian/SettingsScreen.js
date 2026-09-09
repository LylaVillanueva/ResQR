import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';

export default function ProfileScreen({ route, navigation }) {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
            <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
            <View style={styles.profileTextWrap}>
                <Text style={styles.name}>Poncho Reyes</Text>
                <Text style={styles.meta}>Role: Guardian</Text>
                <Text style={styles.meta}>Barangay: 206</Text>
            </View>
        </View>
        <Text style={styles.heading1}>Settings</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Notification Settings</Text>
        <View style={[styles.settingsCard]}>
          <View style={[styles.settingsWrap]}>
            <Text style={styles.settingsSubtitle}>Push Notification</Text>                  
        
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: '#ccc', true: '#fbd1d1' }}
              thumbColor={isEnabled ? '#a83232' : '#f4f3f4'}
              style={[styles.switch]}
            />
          </View>
          
          <View style={[styles.divider, {marginBottom: 0}]} />
          
          <View style={[styles.settingsWrap]}>
            <Text style={styles.settingsSubtitle}>Emergency Alert Sound</Text>                  
        
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: '#ccc', true: '#fbd1d1' }}
              thumbColor={isEnabled ? '#a83232' : '#f4f3f4'}
              style={[styles.switch]}
            />
          </View>
        </View>

        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Camera Settings</Text>
        <View style={[styles.settingsCard]}>
          <View style={[styles.settingsWrap]}>
            <Text style={styles.settingsSubtitle}>Allow Camera for QR Scan</Text>                  
        
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: '#ccc', true: '#fbd1d1' }}
              thumbColor={isEnabled ? '#a83232' : '#f4f3f4'}
              style={[styles.switch]}
            />
          </View>
        </View>

        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>User Access Management</Text>
        <View style={[styles.settingsCard]}>
            <View style={styles.buttonContent}>
              <TouchableOpacity
                onPress={() => navigation.navigate('')}
              >
                <Text style={styles.settingsSubtitle}>Manage User Role</Text>
              </TouchableOpacity>
            </View>
        </View>

        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Accessibility</Text>
        <View style={[styles.settingsCard]}>
            <View style={styles.buttonContent}>
              <TouchableOpacity
                onPress={() => navigation.navigate('')}
              >
                <Text style={styles.settingsSubtitle}>Language</Text>
              </TouchableOpacity>
            </View>
        </View>

        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Help and Support</Text>
        <View style={[styles.settingsCard]}>
            <View style={styles.buttonContent}>
              <TouchableOpacity
                onPress={() => navigation.navigate('')}
              >
                <Text style={styles.settingsSubtitle}>FAQ (Frequently Asked Question)</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, {marginBottom: 0}]} />

            <View style={styles.buttonContent}>
              <TouchableOpacity
                onPress={() => navigation.navigate('')}
              >
                <Text style={styles.settingsSubtitle}>Report A Problem / Bug</Text>
              </TouchableOpacity>
            </View>
        </View>

        <View style={[styles.settingsCard, { backgroundColor: '#f1bdbd', borderColor: '#a83232', marginTop: 20 }]}>
            <View style={styles.buttonContent}>
              <TouchableOpacity
                onPress={() => navigation.navigate('')}
              >
                <Text style={[styles.settingsSubtitle, { fontFamily: 'Poppins_500Medium', color: '#a83232', textAlign: 'center' }]}>Log out</Text>
              </TouchableOpacity>
            </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.aboutContent}>
          <Text style={styles.note}>ResQR ver1.0</Text>
          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.note, { textDecorationLine: 'underline' }]}>Terms of Agreement</Text>
            </TouchableOpacity>
            <Text style={styles.note}>  |  </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.note, { textDecorationLine: 'underline' }]}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

    <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0, },
  aboutContent: { marginTop: 20, marginBottom: 20 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end', marginLeft: -7 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20 },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginTop: -10 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_400Regular', marginBottom: 6 },
  note: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#666', textAlign: 'center', marginBottom: -2 },

  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 90,
    borderWidth: 1.8,
    borderColor: '#a83232',
    backgroundColor: '#c4c4c4',
    marginRight: 14,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  profileTextWrap: { flex: 1 },
  name: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  meta: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666' },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    margin: -10,
    marginRight: -4,
  },

  settingsCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsSubtitle: { fontSize: 16, fontFamily: 'Poppins_400Regular', marginLeft: 4 },
  settingsWrap: { flexDirection: 'row', justifyContent: 'space-between', padding: 12,},
  settingsButtons: { 
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 42,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2,
    justifyContent: 'right',
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#a83232',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingBottom: 0,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tabLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#fff' },
  tabLabelActive: { color: '#ffdcdc', fontFamily: 'Poppins_700Bold' },
  iconWrap: {
    borderRadius: 20,
    width: 40,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: '#fbd1d1',
    shadowColor: '#fbd1d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.3,
    borderColor: '#a83232',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -22,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});