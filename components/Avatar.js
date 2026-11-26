import { colors } from '../constants/theme';
import React from 'react';
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Text from './AppText';

const placeholder = require('../assets/profile.png');

/**
 * A person's photo, or the standard placeholder when there isn't one.
 * Pass `onChangePress` to show a "Change photo" button underneath.
 */
export default function Avatar({ uri, style, name, onChangePress, changeLabel = 'Change photo' }) {
  const image = (
    <Image
      source={uri ? { uri } : placeholder}
      defaultSource={placeholder}
      style={style}
      accessible={!!name}
      accessibilityRole="image"
      accessibilityLabel={name ? (uri ? `Photo of ${name}` : `No photo of ${name}`) : undefined}
    />
  );
  if (!onChangePress) return image;
  return (
    <View style={styles.wrap}>
      {image}
      <TouchableOpacity
        style={styles.change}
        onPress={onChangePress}
        accessibilityRole="button"
        accessibilityLabel={name ? `${changeLabel} for ${name}` : changeLabel}
        hitSlop={8}
      >
        <FontAwesome5 name="camera" size={12} color={colors.primary} />
        <Text style={styles.changeText}>{changeLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  change: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingVertical: 6, paddingHorizontal: 10, minHeight: 36 },
  changeText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: colors.primary },
});
