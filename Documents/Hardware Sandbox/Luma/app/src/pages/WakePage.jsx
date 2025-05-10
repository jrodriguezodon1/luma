import React, { useRef, useEffect, useState } from 'react';

const WAKE_THEMES = [
  { id: 'warm', name: 'Warm Sunrise', color: '#ffcc33' },
  { id: 'cool', name: 'Cool Morning', color: '#64B5F6' },
  { id: 'energetic', name: 'Energetic', color: '#FF7043' },
  { id: 'gentle', name: 'Gentle Dawn', color: '#FFECB3' },
];

const WakePage = ({ 
  enabled, 
  setEnabled, 
  theme, 
  setTheme, 
  time, 
  setTime, 
  duration, 
  onDurationChange,
  presets
}) => {
  const sliderRef = useRef(null);
  const [showCustomPresets, setShowCustomPresets] = useState(false);
  
  // Update slider fill
  useEffect(() => {
    if (sliderRef.current) {
      const percent = ((duration - 600) / (3600 - 600)) * 100;
      sliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    }
  }, [duration]);
  
  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    onDurationChange(newDuration);
  };
  
  // Get current theme color
  const currentTheme = WAKE_THEMES.find(t => t.id === theme) || WAKE_THEMES[0];
  
  // Find preset by ID (if theme is a custom preset)
  const getPresetById = (id) => {
    const idNum = parseInt(id.replace('preset-', ''));
    return presets.find(p => p.id === idNum);
  };
  
  // Get color for current theme
  const getCurrentThemeColor = () => {
    if (theme.startsWith('preset-')) {
      const preset = getPresetById(theme);
      if (preset) {
        if (preset.type === 'sequence') {
          return preset.colors[0].hex;
        } else {
          return `rgb(${preset.color.r}, ${preset.color.g}, ${preset.color.b})`;
        }
      }
    }
    return currentTheme.color;
  };
  
  const themeColor = getCurrentThemeColor();
  
  return (
    <div className="page">
      <h1>Wake Mode</h1>
      
      <div 
        className={`color-orb ${enabled ? 'pulse-animation' : ''}`}
        style={{ 
          backgroundColor: themeColor,
          boxShadow: enabled ? `0 0 60px ${themeColor}80` : 'none',
          opacity: enabled ? 1 : 0.6
        }}
      />
      
      <div className="card">
        <div className="settings-row">
          <div className="label">
            <span>Enable Wake Alarm</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        <div style={{ 
          opacity: enabled ? 1 : 0.5, 
          transition: 'opacity 0.3s',
          pointerEvents: enabled ? 'auto' : 'none'
        }}>
          <div style={{ marginTop: '24px' }}>
            <label htmlFor="wake-time">Wake Time</label>
            <input
              id="wake-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          
          <div className="slider-container" style={{ marginTop: '24px' }}>
            <div className="slider-label">
              <label htmlFor="duration-slider">Fade-In Duration</label>
              <span className="slider-value">{Math.floor(duration/60)} minutes</span>
            </div>
            <input
              id="duration-slider"
              ref={sliderRef}
              type="range"
              min="600"
              max="3600"
              step="60"
              value={duration}
              onChange={handleDurationChange}
              className="slider"
            />
            <p className="text-secondary" style={{ fontSize: '14px', marginTop: '10px' }}>
              Light gradually brightens over this period before wake time.
            </p>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Wake Theme</label>
              <button 
                className="secondary-button" 
                style={{ padding: '6px 12px', minHeight: 'auto', fontSize: '13px' }}
                onClick={() => setShowCustomPresets(!showCustomPresets)}
              >
                {showCustomPresets ? 'Show Defaults' : 'Show Presets'}
              </button>
            </div>
            
            {!showCustomPresets ? (
              <div className="theme-selector">
                {WAKE_THEMES.map(themeOption => (
                  <div 
                    key={themeOption.id}
                    className={`theme-option ${theme === themeOption.id ? 'active' : ''}`}
                    onClick={() => setTheme(themeOption.id)}
                  >
                    <div 
                      className="theme-color" 
                      style={{ backgroundColor: themeOption.color }}
                    />
                    <div className="theme-name">{themeOption.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="theme-selector">
                {presets.map(preset => (
                  <div 
                    key={`preset-${preset.id}`}
                    className={`theme-option ${theme === `preset-${preset.id}` ? 'active' : ''}`}
                    onClick={() => setTheme(`preset-${preset.id}`)}
                  >
                    <div 
                      className="theme-color" 
                      style={{ 
                        backgroundColor: preset.type === 'sequence' 
                          ? preset.colors[0].hex 
                          : `rgb(${preset.color.r}, ${preset.color.g}, ${preset.color.b})`
                      }}
                    />
                    <div className="theme-name">{preset.name}</div>
                  </div>
                ))}
                
                {presets.length === 0 && (
                  <div style={{ padding: '10px', fontSize: '14px', color: 'var(--text-color-secondary)' }}>
                    No custom presets found. Create some in the Presets tab.
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-secondary" style={{ fontSize: '14px', marginTop: '20px' }}>
            The light will gradually brighten to wake you naturally before your alarm.
          </p>
        </div>
      </div>
      
      {enabled && (
        <div className="card" style={{ marginTop: '16px', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            <span style={{ opacity: 0.7 }}>Next alarm:</span>{' '}
            <span style={{ color: 'var(--primary-color)', fontSize: '18px', fontWeight: 600 }}>{time}</span>{' '}
            <span style={{ opacity: 0.7 }}>tomorrow</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WakePage; 