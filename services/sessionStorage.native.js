import * as SecureStore from 'expo-secure-store';
import { createSecureSessionStorageAdapter } from './secureSessionStorageAdapter';

export const sessionStorage = createSecureSessionStorageAdapter(SecureStore);
