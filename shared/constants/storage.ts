// Clés de stockage localStorage
export const STORAGE_KEYS = {
  CURRENT_USER: 'gestion_patients_current_user',
  AUTH_TOKEN: 'gestion_patients_auth_token'
} as const;

// Utilitaires de stockage
export const storage = {
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null') {
        return defaultValue;
      }
      let cleanedItem = item;
      if (item.startsWith('"') && item.endsWith('"')) {
        cleanedItem = item.slice(1, -1);
      }
      return JSON.parse(cleanedItem);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};