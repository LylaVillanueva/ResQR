import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { font, typography } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenState({ loading, error, onBack, onRetry }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 4 }}>
    {onBack && <Text onPress={onBack} style={{ fontFamily: font.regular, fontSize: typography.body, color: '#a83232', marginBottom: 4, paddingVertical: 4, minHeight: 44 }}>‹ Back</Text>}
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      {loading ? <ActivityIndicator color="#a83232" /> : <Text style={{ fontFamily: font.regular, fontSize: typography.body, textAlign: 'center' }}>{error || 'Record not found.'}</Text>}
      {!loading && onRetry && <TouchableOpacity onPress={onRetry}><Text style={{ fontFamily: font.medium, fontSize: typography.body, color: '#a83232', padding: 16 }}>Try again</Text></TouchableOpacity>}
    </View>
  </SafeAreaView>;
}
