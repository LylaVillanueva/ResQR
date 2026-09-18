// Same idea as AppText.js, for form fields — so a resident's guardian
// typing in a larger font size can actually read what they're entering.
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { useAccessibilitySettings } from '../context/AccessibilitySettingsContext';
import { defaultTextStyle, scaleTextStyle } from './AppText';

const AppTextInput = React.forwardRef(function AppTextInput({ style, ...rest }, ref) {
  const { fontScale, fontFamilyKey } = useAccessibilitySettings();
  return <RNTextInput ref={ref} allowFontScaling={false} {...rest} style={scaleTextStyle([defaultTextStyle, style], fontScale, fontFamilyKey)} />;
});

export default AppTextInput;
