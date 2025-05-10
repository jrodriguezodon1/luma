import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import './App.css';
import axios from 'axios';

// Pages
import SunsetPage from './pages/SunsetPage';
import WakePage from './pages/WakePage';
import PresetsPage from './pages/PresetsPage';
import SettingsPage from './pages/SettingsPage';
import ConnectionModal from './components/ConnectionModal';

// Database service
import * as db from './services/db';

// Constants
const MODE_OFF = 0;
const MODE_SUNRISE = 1;
const MODE_SUNSET = 2;
const MODE_SOLID = 3;
const MODE_RAINBOW = 4;

const TABS = {
  SUNSET: 0,
  WAKE: 1,
  PRESETS: 2,
  SETTINGS: 3
};

// Mock data for dev mode
const DEV_MODE_SETTINGS = {
  mode: MODE_RAINBOW,
  brightness: 150,
  speed: 8,
  duration: 300,
  active: true,
  color: { r: 255, g: 100, b: 50 }
};

function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState(TABS.SUNSET);
  
  // State for connection and controller settings
  const [ipAddress, setIpAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  // State for controller settings
  const [settings, setSettings] = useState({
    mode: MODE_OFF,
    brightness: 100,
    speed: 5,
    duration: 300,
    active: false,
    color: { r: 255, g: 255, b: 255 }
  });
  
  // State for app settings
  const [sunsetScheduled, setSunsetScheduled] = useState(false);
  const [sunsetTime, setSunsetTime] = useState('21:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [wakeTheme, setWakeTheme] = useState('warm');
  const [presets, setPresets] = useState([]);
  
  // Handle Color Picker
  const [hexColor, setHexColor] = useState('#ffffff');
  
  // Load data from database on initial render
  useEffect(() => {
    // Load connection info
    const connectionInfo = db.getConnectionInfo();
    setIpAddress(connectionInfo.ip || '');
    
    // Load application settings
    const appSettings = db.getSettings();
    setSettings(prev => ({
      ...prev,
      brightness: appSettings.brightness,
      speed: appSettings.speed
    }));
    
    // Load wake configuration
    const wakeConfig = db.getWakeConfig();
    setWakeEnabled(wakeConfig.enabled);
    setWakeTime(wakeConfig.time);
    setWakeTheme(wakeConfig.theme);
    
    // Load sunset configuration
    const sunsetConfig = db.getSunsetConfig();
    setSunsetScheduled(sunsetConfig.scheduled);
    setSunsetTime(sunsetConfig.time);
    
    // Load presets
    const savedPresets = db.getPresets();
    if (savedPresets && savedPresets.length > 0) {
      setPresets(savedPresets);
    }
    
    // Try to connect automatically if we have an IP
    if (connectionInfo.ip) {
      if (connectionInfo.ip.toLowerCase() === 'dev') {
        connectInDevMode();
      } else {
        connectToController(connectionInfo.ip);
      }
    } else {
      // Show connection modal on first load
      setShowConnectionModal(true);
    }
  }, []);
  
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };
  
  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  // Connect in dev mode
  const connectInDevMode = () => {
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        ...DEV_MODE_SETTINGS
      }));
      setHexColor(rgbToHex(
        DEV_MODE_SETTINGS.color.r, 
        DEV_MODE_SETTINGS.color.g, 
        DEV_MODE_SETTINGS.color.b
      ));
      setIsConnected(true);
      setIsDevMode(true);
      setMessage('Connected to development mode!');
      db.saveConnectionInfo({ ip: 'dev' });
      setConnecting(false);
      setShowConnectionModal(false);
    }, 500); // Simulate network delay
  };
  
  // Connect to controller
  const connectToController = async (ip = ipAddress) => {
    if (!ip) {
      setMessage('Please enter an IP address');
      return;
    }
    
    setConnecting(true);
    setMessage('Connecting...');
    
    // Dev mode bypass
    if (ip.toLowerCase() === 'dev') {
      connectInDevMode();
      return;
    }
    
    try {
      const response = await axios.get(`http://${ip}/api/status`, { timeout: 5000 });
      setSettings(prev => ({
        ...prev,
        ...response.data
      }));
      setHexColor(rgbToHex(response.data.color.r, response.data.color.g, response.data.color.b));
      setIsConnected(true);
      setIsDevMode(false);
      setMessage('Connected successfully!');
      db.saveConnectionInfo({ ip });
      setShowConnectionModal(false);
    } catch (error) {
      setIsConnected(false);
      setMessage(`Connection failed: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };
  
  // Update Controller
  const updateController = async (updatedSettings) => {
    if (!isConnected) {
      setShowConnectionModal(true);
      return;
    }
    
    // Handle updates in dev mode
    if (isDevMode) {
      setSettings(prev => ({ ...prev, ...updatedSettings }));
      
      // Save relevant settings to local storage
      if (updatedSettings.brightness || updatedSettings.speed) {
        db.updateSettings({
          brightness: updatedSettings.brightness || settings.brightness,
          speed: updatedSettings.speed || settings.speed
        });
      }
      
      return;
    }
    
    try {
      await axios.post(`http://${ipAddress}/api/control`, updatedSettings);
      setSettings(prev => ({ ...prev, ...updatedSettings }));
      
      // Save relevant settings to local storage
      if (updatedSettings.brightness || updatedSettings.speed) {
        db.updateSettings({
          brightness: updatedSettings.brightness || settings.brightness,
          speed: updatedSettings.speed || settings.speed
        });
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      // If connection was lost, show connection modal
      if (error.message.includes('Network Error')) {
        setIsConnected(false);
        setShowConnectionModal(true);
      }
    }
  };
  
  // Start sunset mode
  const startSunset = (duration = 900) => {
    updateController({ 
      mode: MODE_SUNSET, 
      duration,
      active: true
    });
  };
  
  // Set wake mode
  const setWakeMode = (enabled, theme = 'warm', time = wakeTime, duration = 1800) => {
    setWakeEnabled(enabled);
    setWakeTheme(theme);
    setWakeTime(time);
    
    // Save wake configuration to database
    db.updateWakeConfig({
      enabled,
      theme,
      time,
      duration
    });
  };
  
  // Update sunset configuration
  const updateSunsetConfig = (updates) => {
    if (updates.scheduled !== undefined) setSunsetScheduled(updates.scheduled);
    if (updates.time) setSunsetTime(updates.time);
    
    // Save sunset configuration to database
    db.updateSunsetConfig({
      scheduled: updates.scheduled !== undefined ? updates.scheduled : sunsetScheduled,
      time: updates.time || sunsetTime,
      duration: updates.duration || settings.duration
    });
  };
  
  // Apply a preset
  const applyPreset = (preset) => {
    updateController({
      mode: MODE_SOLID,
      color: preset.color,
      brightness: preset.brightness,
      active: true
    });
  };
  
  // Add a new preset
  const addPreset = (preset) => {
    db.addPreset(preset);
    // Reload presets from database to ensure consistency
    setPresets(db.getPresets());
  };
  
  // Delete a preset
  const deletePreset = (id) => {
    db.deletePreset(id);
    // Reload presets from database to ensure consistency
    setPresets(db.getPresets());
  };
  
  // Set tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.SUNSET:
        return (
          <SunsetPage 
            startSunset={startSunset}
            duration={settings.duration}
            onDurationChange={(duration) => updateController({ duration })}
            scheduled={sunsetScheduled}
            setScheduled={(scheduled) => updateSunsetConfig({ scheduled })}
            time={sunsetTime}
            setTime={(time) => updateSunsetConfig({ time })}
            isConnected={isConnected}
            presets={presets}
            applyPreset={applyPreset}
          />
        );
      case TABS.WAKE:
        return (
          <WakePage 
            enabled={wakeEnabled}
            setEnabled={(enabled) => setWakeMode(enabled, wakeTheme, wakeTime)}
            theme={wakeTheme}
            setTheme={(theme) => setWakeMode(wakeEnabled, theme, wakeTime)}
            time={wakeTime}
            setTime={(time) => setWakeMode(wakeEnabled, wakeTheme, time)}
            duration={settings.duration}
            onDurationChange={(duration) => {
              updateController({ duration });
              setWakeMode(wakeEnabled, wakeTheme, wakeTime, duration);
            }}
            presets={presets}
          />
        );
      case TABS.PRESETS:
        return (
          <PresetsPage 
            presets={presets}
            applyPreset={applyPreset}
            addPreset={addPreset}
            deletePreset={deletePreset}
            currentColor={settings.color}
            brightness={settings.brightness}
            onBrightnessChange={(brightness) => updateController({ brightness })}
            setHexColor={setHexColor}
            hexColor={hexColor}
            hexToRgb={hexToRgb}
          />
        );
      case TABS.SETTINGS:
        return (
          <SettingsPage 
            ipAddress={ipAddress}
            setIpAddress={setIpAddress}
            isConnected={isConnected}
            isDevMode={isDevMode}
            setIsDevMode={setIsDevMode}
            connectToController={connectToController}
            settings={settings}
            updateController={updateController}
          />
        );
      default:
        return null;
    }
  };
  
  // Render app
  return (
    <div className="app-container">
      {isDevMode && <div className="dev-mode-badge">DEV MODE</div>}
      
      <main className="content">
        {renderTabContent()}
      </main>
      
      <nav className="bottom-nav">
        <button 
          className={`nav-button ${activeTab === TABS.SUNSET ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.SUNSET)}
        >
          <span className="nav-icon">🌇</span>
          <span className="nav-label">Sunset</span>
        </button>
        <button 
          className={`nav-button ${activeTab === TABS.WAKE ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.WAKE)}
        >
          <span className="nav-icon">⏰</span>
          <span className="nav-label">Wake</span>
        </button>
        <button 
          className={`nav-button ${activeTab === TABS.PRESETS ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.PRESETS)}
        >
          <span className="nav-icon">🎛</span>
          <span className="nav-label">Presets</span>
        </button>
        <button 
          className={`nav-button ${activeTab === TABS.SETTINGS ? 'active' : ''}`}
          onClick={() => setActiveTab(TABS.SETTINGS)}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
      
      {showConnectionModal && (
        <ConnectionModal
          ipAddress={ipAddress}
          setIpAddress={setIpAddress}
          connectToController={connectToController}
          connecting={connecting}
          message={message}
          isConnected={isConnected}
          onClose={() => isConnected && setShowConnectionModal(false)}
        />
      )}
    </div>
  );
}

export default App; 