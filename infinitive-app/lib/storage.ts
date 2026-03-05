
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key) => {
        if (typeof window !== 'undefined') return window.localStorage.getItem(key);
        return Promise.resolve(null);
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') return window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') return window.localStorage.removeItem(key);
        return Promise.resolve();
      }
    };
  }
  return AsyncStorage;
};
