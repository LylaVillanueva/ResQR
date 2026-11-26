import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Photos are shrunk on the phone before upload: a 600px JPEG is plenty for a
// profile picture and keeps uploads small on slow mobile data.
const MAX_SIDE = 600;

async function pick(source) {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', source === 'camera'
      ? 'Allow camera access in your phone settings to take a photo.'
      : 'Allow photo access in your phone settings to choose a photo.');
    return null;
  }
  const options = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.[0]) return null;

  const { uri, width, height } = result.assets[0];
  const resize = width >= height ? { width: Math.min(width, MAX_SIDE), height: null } : { width: null, height: Math.min(height, MAX_SIDE) };
  const rendered = await ImageManipulator.manipulate(uri).resize(resize).renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  return saved.base64;
}

/**
 * Shows "Take photo / Choose from library / Remove photo" and runs `save`
 * with the new photo (base64 JPEG) or null to remove it.
 */
export function changePhoto({ title = 'Profile photo', hasPhoto, save }) {
  const run = async (source) => {
    try {
      const image = source === 'remove' ? null : await pick(source);
      if (image === null && source !== 'remove') return;
      await save(image);
    } catch (err) {
      Alert.alert('Photo not saved', err.message || 'Please try again.');
    }
  };
  Alert.alert(title, undefined, [
    { text: 'Take photo', onPress: () => run('camera') },
    { text: 'Choose from library', onPress: () => run('library') },
    ...(hasPhoto ? [{ text: 'Remove photo', style: 'destructive', onPress: () => run('remove') }] : []),
    { text: 'Cancel', style: 'cancel' },
  ]);
}
