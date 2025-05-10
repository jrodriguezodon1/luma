import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import SequencePreset from '../components/SequencePreset';
import * as db from '../services/db';

const PresetsPage = ({ 
  applyPreset,
  currentColor,
  brightness,
  hexColor,
  setHexColor,
  hexToRgb
}) => {
  // Local state
  const [showNewPreset, setShowNewPreset] = useState(false);
  const [showSequencePreset, setShowSequencePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetColor, setNewPresetColor] = useState(hexColor);
  const [newPresetBrightness, setNewPresetBrightness] = useState(brightness);
  const [presets, setPresets] = useState([]);
  const [activePreview, setActivePreview] = useState(null);
  const sliderRef = useRef(null);
  const previewTimerRef = useRef(null);
  const previewColors = useRef({});
  
  // Load presets from database
  useEffect(() => {
    const loadedPresets = db.getPresets();
    setPresets(loadedPresets);
  }, []);
  
  // Update slider fill
  useEffect(() => {
    if (sliderRef.current) {
      const percent = (newPresetBrightness / 255) * 100;
      sliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    }
  }, [newPresetBrightness]);
  
  // Preset preview functionality
  useEffect(() => {
    if (activePreview !== null) {
      const preset = presets.find(p => p.id === activePreview);
      
      if (preset && preset.type === 'sequence') {
        let currentIndex = 0;
        const colors = preset.colors;
        
        const runPreview = () => {
          // Update the preview color for this preset
          previewColors.current = {
            ...previewColors.current,
            [preset.id]: colors[currentIndex].hex
          };
          
          // Force re-render
          setPresets(prevPresets => [...prevPresets]);
          
          // Move to next color with duration
          const duration = colors[currentIndex].duration * 1000; // convert to ms
          currentIndex = (currentIndex + 1) % colors.length;
          
          previewTimerRef.current = setTimeout(runPreview, duration);
        };
        
        runPreview();
        
        return () => {
          if (previewTimerRef.current) {
            clearTimeout(previewTimerRef.current);
          }
        };
      }
    }
  }, [activePreview, presets]);
  
  const togglePreview = (id) => {
    if (activePreview === id) {
      setActivePreview(null);
      // Reset preview colors
      previewColors.current = {};
    } else {
      setActivePreview(id);
    }
  };
  
  const getPresetColor = (preset) => {
    if (preset.type === 'sequence' && activePreview === preset.id) {
      return previewColors.current[preset.id] || preset.colors[0].hex;
    } else if (preset.type === 'sequence') {
      return preset.colors[0].hex;
    } else {
      return `rgb(${preset.color.r}, ${preset.color.g}, ${preset.color.b})`;
    }
  };
  
  const handleColorChange = (newColor) => {
    setNewPresetColor(newColor);
  };
  
  const handleBrightnessChange = (e) => {
    setNewPresetBrightness(parseInt(e.target.value));
  };
  
  const handleSavePreset = () => {
    if (!newPresetName) return;
    
    const preset = {
      name: newPresetName,
      type: 'solid',
      color: hexToRgb(newPresetColor),
      brightness: newPresetBrightness
    };
    
    db.addPreset(preset);
    setPresets(db.getPresets());
    setShowNewPreset(false);
    setNewPresetName('');
  };
  
  const handleSaveSequence = (sequencePreset) => {
    db.addPreset(sequencePreset);
    setPresets(db.getPresets());
    setShowSequencePreset(false);
  };
  
  const handleDeletePreset = (id) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      db.deletePreset(id);
      setPresets(db.getPresets());
      
      // If deleting the active preview, clear it
      if (activePreview === id) {
        setActivePreview(null);
      }
    }
  };
  
  const handleApplyPreset = (preset) => {
    if (preset.type === 'sequence') {
      // For sequence presets, apply the first color
      applyPreset({
        color: hexToRgb(preset.colors[0].hex),
        brightness: preset.brightness
      });
      
      // Here you would also send a sequence to the controller
      // (Requires additional backend implementation)
    } else {
      applyPreset(preset);
    }
  };
  
  return (
    <div className="page">
      <h1>Light Presets</h1>
      
      {!showNewPreset && !showSequencePreset ? (
        <>
          {presets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>No presets yet</h3>
              <p className="text-secondary">Create your first preset to quickly activate your favorite lighting scenes.</p>
            </div>
          ) : (
            <div className="presets-grid">
              {presets.map(preset => (
                <div key={preset.id} className="preset-card">
                  <div
                    className={`preset-color ${activePreview === preset.id ? 'pulse-animation' : ''}`}
                    style={{ backgroundColor: getPresetColor(preset) }}
                  />
                  <h3>{preset.name}</h3>
                  <div className="preset-info">
                    {preset.type === 'sequence' && (
                      <span className="preset-badge">Sequence</span>
                    )}
                  </div>
                  <div className="preset-controls">
                    <button 
                      className="icon-button"
                      onClick={() => handleApplyPreset(preset)}
                      title="Apply"
                    >
                      ▶
                    </button>
                    
                    {preset.type === 'sequence' && (
                      <button 
                        className={`icon-button ${activePreview === preset.id ? 'active' : ''}`}
                        onClick={() => togglePreview(preset.id)}
                        title={activePreview === preset.id ? "Stop Preview" : "Preview"}
                      >
                        👁️
                      </button>
                    )}
                    
                    <button 
                      className="icon-button"
                      onClick={() => handleDeletePreset(preset.id)}
                      title="Delete"
                      style={{ backgroundColor: '#ff6b6b' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="button-group" style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowNewPreset(true)}
              style={{ flex: 1 }}
            >
              + Solid Color
            </button>
            <button 
              onClick={() => setShowSequencePreset(true)}
              style={{ flex: 1 }}
            >
              + Color Sequence
            </button>
          </div>
        </>
      ) : showNewPreset ? (
        <div className="card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <h2>Create Solid Color</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="preset-name">Preset Name</label>
            <input
              id="preset-name"
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Relaxing, Focus, etc."
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '28px' }}>
            <label>Color</label>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <HexColorPicker color={newPresetColor} onChange={handleColorChange} />
              <div 
                style={{ 
                  backgroundColor: newPresetColor,
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  margin: '20px auto',
                  boxShadow: `0 0 30px ${newPresetColor}80`,
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
          </div>
          
          <div className="slider-container">
            <div className="slider-label">
              <label htmlFor="brightness-slider">Brightness</label>
              <span className="slider-value">{newPresetBrightness}</span>
            </div>
            <input
              id="brightness-slider"
              ref={sliderRef}
              type="range"
              min="0"
              max="255"
              value={newPresetBrightness}
              onChange={handleBrightnessChange}
              className="slider"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button
              onClick={() => setShowNewPreset(false)}
              className="secondary-button"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreset}
              style={{ flex: 1 }}
              disabled={!newPresetName}
            >
              Save Preset
            </button>
          </div>
        </div>
      ) : (
        <SequencePreset 
          onSave={handleSaveSequence}
          onCancel={() => setShowSequencePreset(false)}
        />
      )}
    </div>
  );
};

export default PresetsPage; 