'use client';

import { useState, useEffect, useCallback } from 'react';

function dispatchStorageEvent<T>(key: string, newValue: T) {
  if (typeof window !== 'undefined') {
    // This custom event is to notify other useLocalStorage hooks in the same tab.
    const event = new CustomEvent('local-storage-change', { detail: { key, newValue: JSON.stringify(newValue) } });
    window.dispatchEvent(event);
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This function now only runs once on initialization.
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      let eventKey: string | null = null;
      let eventNewValue: string | null = null;
  
      if (e instanceof StorageEvent) { // From other tabs
        eventKey = e.key;
        eventNewValue = e.newValue;
      } else if (e instanceof CustomEvent && e.type === 'local-storage-change') { // From same tab
        eventKey = e.detail.key;
        eventNewValue = e.detail.newValue;
      }
      
      if (eventKey === key) {
        if (eventNewValue) {
          try {
            setStoredValue(JSON.parse(eventNewValue));
          } catch (error) {
            console.error(error);
          }
        } else {
           setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          dispatchStorageEvent(key, valueToStore);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
