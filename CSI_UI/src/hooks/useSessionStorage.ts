/**
 * useSessionStorage Hook
 * Provides session-based storage for temporary configuration
 */

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseSessionStorageOptions {
  serializer?: (value: any) => string;
  deserializer?: (value: string) => any;
  initializeWithValue?: boolean;
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: UseSessionStorageOptions = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    initializeWithValue = true,
  } = options;

  // Get from session storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, deserializer]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(
    initializeWithValue ? readValue : initialValue
  );

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      // Prevent build error "window is undefined" but keeps working
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting sessionStorage key "${key}" even though environment is not a client`
        );
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to session storage
        window.sessionStorage.setItem(key, serializer(newValue));

        // Save state
        setStoredValue(newValue);

        // We dispatch a custom event so every useSessionStorage hook are notified
        window.dispatchEvent(new Event('session-storage'));
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue]
  );

  // Remove value from sessionStorage
  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('session-storage'));
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // this is a custom event, triggered in setValue
    window.addEventListener('session-storage', handleStorageChange);

    return () => {
      window.removeEventListener('session-storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue, removeValue];
}