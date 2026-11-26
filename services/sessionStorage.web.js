import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore has no web implementation. Browser sessions use browser storage;
// the mobile native build uses the Android Keystore-backed SecureStore adapter.
export const sessionStorage = AsyncStorage;
