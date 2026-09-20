import { typography, spacing } from "../theme";
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Text from "../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, EFFECTIVE_DATE } from "../lib/legalContent";

const DOCS = {
  privacy: { title: 'Privacy Policy', sections: PRIVACY_POLICY },
  terms: { title: 'Terms of Service', sections: TERMS_OF_SERVICE },
};

export default function LegalScreen({ route, navigation }) {
  const doc = DOCS[route.params?.type] || DOCS.privacy;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>{doc.title}</Text>
        <Text style={styles.effective}>Effective date: {EFFECTIVE_DATE}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {doc.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 4 , paddingTop: 4 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, minHeight: 44, paddingVertical: 4, marginTop: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 },
  effective: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888', marginTop: 4 },
  scrollContent: { padding: spacing.screen, paddingTop: 8, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionHeading: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#1a1a1a', marginBottom: 6 },
  sectionBody: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#444', lineHeight: Math.ceil(typography.body * 1.5) },
});
