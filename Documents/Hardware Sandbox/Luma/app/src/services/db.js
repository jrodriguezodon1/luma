// Simple localStorage-based database for Luma app

const DB_KEYS = {
  SETTINGS: 'luma_settings',
  PRESETS: 'luma_presets',
  WAKE_CONFIG: 'luma_wake_config',
  SUNSET_CONFIG: 'luma_sunset_config',
  CONNECTION: 'luma_connection'
};

// Default values
const DEFAULT_SETTINGS = {
  brightness: 150,
  speed: 5
};

const DEFAULT_WAKE_CONFIG = {
  enabled: false,
  time: '07:00',
  theme: 'warm',
  duration: 1800
};

const DEFAULT_SUNSET_CONFIG = {
  scheduled: false,
  time: '21:00',
  duration: 900
};

// Generic get/set functions
const get = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// Settings
export const getSettings = () => get(DB_KEYS.SETTINGS, DEFAULT_SETTINGS);
export const saveSettings = (settings) => set(DB_KEYS.SETTINGS, settings);
export const updateSettings = (updates) => {
  const current = getSettings();
  return saveSettings({ ...current, ...updates });
};

// Presets
export const getPresets = () => get(DB_KEYS.PRESETS, []);
export const savePresets = (presets) => set(DB_KEYS.PRESETS, presets);
export const addPreset = (preset) => {
  const presets = getPresets();
  const newPreset = {
    id: Date.now(),
    ...preset
  };
  return savePresets([...presets, newPreset]);
};
export const deletePreset = (id) => {
  const presets = getPresets();
  return savePresets(presets.filter(preset => preset.id !== id));
};
export const updatePreset = (id, updates) => {
  const presets = getPresets();
  const updatedPresets = presets.map(preset => 
    preset.id === id ? { ...preset, ...updates } : preset
  );
  return savePresets(updatedPresets);
};

// Wake configuration
export const getWakeConfig = () => get(DB_KEYS.WAKE_CONFIG, DEFAULT_WAKE_CONFIG);
export const saveWakeConfig = (config) => set(DB_KEYS.WAKE_CONFIG, config);
export const updateWakeConfig = (updates) => {
  const current = getWakeConfig();
  return saveWakeConfig({ ...current, ...updates });
};

// Sunset configuration
export const getSunsetConfig = () => get(DB_KEYS.SUNSET_CONFIG, DEFAULT_SUNSET_CONFIG);
export const saveSunsetConfig = (config) => set(DB_KEYS.SUNSET_CONFIG, config);
export const updateSunsetConfig = (updates) => {
  const current = getSunsetConfig();
  return saveSunsetConfig({ ...current, ...updates });
};

// Connection
export const getConnectionInfo = () => get(DB_KEYS.CONNECTION, { ip: '' });
export const saveConnectionInfo = (info) => set(DB_KEYS.CONNECTION, info);

// Clear all data (for factory reset)
export const clearAllData = () => {
  Object.values(DB_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  return true;
};

export default {
  getSettings,
  saveSettings,
  updateSettings,
  getPresets,
  savePresets,
  addPreset,
  deletePreset,
  updatePreset,
  getWakeConfig,
  saveWakeConfig,
  updateWakeConfig,
  getSunsetConfig,
  saveSunsetConfig,
  updateSunsetConfig,
  getConnectionInfo,
  saveConnectionInfo,
  clearAllData
}; 