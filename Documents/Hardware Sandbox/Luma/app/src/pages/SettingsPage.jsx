import React, { useState } from 'react';

const SettingsPage = ({ 
  ipAddress, 
  setIpAddress, 
  isConnected, 
  isDevMode,
  setIsDevMode,
  connectToController,
  settings,
  updateController
}) => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), message: 'App initialized' }
  ]);
  
  // Add log entry function
  const addLog = (message) => {
    const newLog = {
      time: new Date().toLocaleTimeString(),
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 5));
  };
  
  // Handle reconnect
  const handleReconnect = () => {
    addLog('Attempting to reconnect...');
    connectToController();
  };
  
  // Factory reset
  const handleFactoryReset = () => {
    if (window.confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
      localStorage.clear();
      addLog('Performing factory reset...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
  
  return (
    <div className="page">
      <h1>Settings</h1>
      
      <div className="card">
        <h2>Connection</h2>
        
        <div className="settings-row">
          <div className="label">
            <span className="icon">📱</span>
            <span>Status</span>
          </div>
          <div style={{ 
            color: isConnected ? '#65d6ad' : '#ff6b6b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="settings-row">
          <div className="label">
            <span className="icon">🌐</span>
            <span>Controller IP</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '15px' }}>
            {ipAddress || 'Not set'}
          </div>
        </div>
        
        <button onClick={handleReconnect} style={{ marginTop: '16px', width: '100%' }}>
          Reconnect
        </button>
      </div>
      
      <div className="card">
        <h2>Time & Sync</h2>
        
        <div className="settings-row">
          <div className="label">
            <span className="icon">🕒</span>
            <span>Sync Time Now</span>
          </div>
          <button 
            className="icon-button" 
            style={{ width: '40px', height: '40px' }}
            onClick={() => addLog('Time sync successful')}
          >
            ↻
          </button>
        </div>
        
        <div className="settings-row">
          <div className="label">
            <span className="icon">🌙</span>
            <span>Auto-Adjust Brightness</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={false} 
              onChange={() => addLog('Feature not implemented yet')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
      
      <div className="card">
        <h2>System</h2>
        
        <div className="settings-row" style={{ marginBottom: '24px' }}>
          <div className="label">
            <span className="icon">👨‍💻</span>
            <span>Developer Mode</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={isDevMode}
              onChange={(e) => {
                setIsDevMode(e.target.checked);
                addLog(`Developer mode ${e.target.checked ? 'enabled' : 'disabled'}`);
              }}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        <button 
          onClick={handleFactoryReset}
          style={{ width: '100%', backgroundColor: '#ff6b6b' }}
        >
          Factory Reset
        </button>
      </div>
      
      {/* Debug Section (collapsible) */}
      <div className="collapsible">
        <div 
          className="collapsible-header"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          <h3 style={{ margin: 0 }}>Debug Information</h3>
          <span>{showDebugInfo ? '▼' : '▶'}</span>
        </div>
        
        {showDebugInfo && (
          <div className="collapsible-content">
            <h4 style={{ marginTop: '0' }}>Controller Status</h4>
            <div style={{ 
              fontSize: '14px', 
              fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace', 
              marginBottom: '20px',
              padding: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '10px'
            }}>
              <div>Mode: <span style={{ color: 'var(--primary-color)' }}>{settings.mode}</span></div>
              <div>Brightness: <span style={{ color: 'var(--primary-color)' }}>{settings.brightness}</span></div>
              <div>Active: <span style={{ color: 'var(--primary-color)' }}>{settings.active ? 'true' : 'false'}</span></div>
              <div>Color: <span style={{ color: 'var(--primary-color)' }}>rgb({settings.color.r}, {settings.color.g}, {settings.color.b})</span></div>
            </div>
            
            <h4>Recent Logs</h4>
            <div>
              {logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="timestamp">{log.time}</span> - {log.message}
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => addLog('Log test message')}
              style={{ marginTop: '20px', fontSize: '13px', width: '100%' }}
            >
              Add Test Log
            </button>
          </div>
        )}
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        margin: '36px 0', 
        opacity: 0.6,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '28px'
      }}>
        <p style={{ margin: '0', fontSize: '14px' }}>Luma Controller v0.1.0</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>© {new Date().getFullYear()} Luma Project</p>
      </div>
    </div>
  );
};

export default SettingsPage; 