import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { font, typography, colors } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenState({ loading, error, onBack, onRetry }) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface, padding: 24, paddingTop: 4 }}>
    {onBack && <Text onPress={onBack} style={{ fontFamily: font.regular, fontSize: typography.body, color: colors.primary, marginBottom: 4, paddingVertical: 4, minHeight: 44 }}>‹ Back</Text>}
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={{ fontFamily: font.regular, fontSize: typography.body, textAlign: 'center' }}>{error || 'Record not found.'}</Text>}
      {!loading && onRetry && <TouchableOpacity onPress={onRetry}><Text style={{ fontFamily: font.medium, fontSize: typography.body, color: colors.primary, padding: 16 }}>Try again</Text></TouchableOpacity>}
    </View>
  </SafeAreaView>;
}
