import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { useAccessibilitySettings } from "../lib/AccessibilitySettingsContext";
import { colors, font, spacing, typography } from '../theme';

// Match text fields, including the user's preferred font size, on every platform.
export function Picker({ children, style, itemStyle, ...props }) {
  const { fontScale, fontFamilyKey } = useAccessibilitySettings();
  const textStyle = { fontSize: Math.round(typography.body * fontScale), color: colors.textPrimary,
    fontFamily: fontFamilyKey === 'system' ? undefined : font.regular };
  return <NativePicker {...props}
    style={[{ minHeight: spacing.control }, Platform.OS === 'web' && textStyle, style]}
    itemStyle={[textStyle, itemStyle]}>
    {React.Children.map(children, child => React.isValidElement(child)
      ? React.cloneElement(child, { style: { ...textStyle, ...StyleSheet.flatten(child.props.style) } }) : child)}
  </NativePicker>;
}
Picker.Item = NativePicker.Item;
