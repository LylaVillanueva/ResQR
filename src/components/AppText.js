// Drop-in replacement for RN's <Text> that actually applies the user's
// Font Size / Font settings from Settings > Accessibility. Every screen's
// `import { Text } from 'react-native'` was swapped to import this instead
// (same name, so no JSX changed) — that's what makes the setting apply
// app-wide instead of on one screen at a time.
import React, { createContext, useContext } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useAccessibilitySettings } from '../context/AccessibilitySettingsContext';
import { colors, font, typography } from '../theme';

const TextNestingContext = createContext(false);
export const defaultTextStyle = { fontSize: typography.body, fontFamily: font.regular, color: colors.textPrimary };

const WEIGHT_BY_POPPINS = {
  Poppins_400Regular: '400',
  Poppins_500Medium: '500',
  Poppins_600SemiBold: '600',
  Poppins_700Bold: '700',
  Poppins_400Regular_Italic: '400',
};

export function scaleTextStyle(style, fontScale, fontFamilyKey) {
  const flat = StyleSheet.flatten(style) || {};
  const next = { ...flat };
  if (typeof next.fontSize === 'number') next.fontSize = Math.round(next.fontSize * fontScale);
  if (typeof next.lineHeight === 'number') next.lineHeight = Math.ceil(next.lineHeight * fontScale);
  if (fontFamilyKey === 'system' && next.fontFamily) {
    next.fontWeight = WEIGHT_BY_POPPINS[next.fontFamily] || next.fontWeight;
    delete next.fontFamily;
  }
  return next;
}

const AppText = React.forwardRef(function AppText({ style, ...rest }, ref) {
  const { fontScale, fontFamilyKey } = useAccessibilitySettings();
  const nested = useContext(TextNestingContext);
  return <TextNestingContext.Provider value={true}>
    <RNText ref={ref} allowFontScaling={false} {...rest}
      style={scaleTextStyle([!nested && defaultTextStyle, style], fontScale, fontFamilyKey)} />
  </TextNestingContext.Provider>;
});

export default AppText;
