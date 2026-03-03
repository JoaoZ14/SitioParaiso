export const storageService = {
  getJSON<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  setJSON<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`storageService: erro ao salvar "${key}"`);
    }
  },
};

export const STORAGE_KEYS = {
  GOALS:     'couple_goals',
  REFS:      'couple_refs',
  TIMELINE:  'couple_timeline',
  EMERGENCY: 'couple_emergency',
} as const;
