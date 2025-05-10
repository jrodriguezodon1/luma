import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';

const SequencePreset = ({ onSave, onCancel, initialPreset = null }) => {
  const [presetName, setPresetName] = useState(initialPreset?.name || '');
  const [colors, setColors] = useState(initialPreset?.colors || [{ hex: '#6366f1', duration: 2 }]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [brightness, setBrightness] = useState(initialPreset?.brightness || 180);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewColor, setPreviewColor] = useState(colors[0]?.hex || '#6366f1');
  const sliderRef = useRef(null);
  const previewTimerRef = useRef(null);
  
  // Update slider fill
  useEffect(() => {
    if (sliderRef.current) {
      const percent = (brightness / 255) * 100;
      sliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    }
  }, [brightness]);
  
  // Preview functionality
  useEffect(() => {
    if (isPreviewActive && colors.length > 0) {
      let currentIndex = 0;
      
      const runPreview = () => {
        setPreviewColor(colors[currentIndex].hex);
        
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
  }, [isPreviewActive, colors]);
  
  const togglePreview = () => {
    setIsPreviewActive(!isPreviewActive);
  };
  
  const handleColorChange = (color) => {
    const updatedColors = [...colors];
    updatedColors[currentColorIndex] = {
      ...updatedColors[currentColorIndex],
      hex: color
    };
    setColors(updatedColors);
  };
  
  const handleDurationChange = (index, duration) => {
    const updatedColors = [...colors];
    updatedColors[index] = {
      ...updatedColors[index],
      duration: parseInt(duration)
    };
    setColors(updatedColors);
  };
  
  const addColor = () => {
    const newColorIndex = colors.length;
    // Use the last color as reference for new color
    const lastColor = colors[colors.length - 1];
    const newColor = { 
      hex: lastColor.hex, 
      duration: lastColor.duration 
    };
    setColors([...colors, newColor]);
    setCurrentColorIndex(newColorIndex);
  };
  
  const removeColor = (index) => {
    if (colors.length <= 1) return; // Keep at least one color
    
    const updatedColors = colors.filter((_, i) => i !== index);
    setColors(updatedColors);
    
    // Update current color index if needed
    if (currentColorIndex >= updatedColors.length) {
      setCurrentColorIndex(updatedColors.length - 1);
    } else if (currentColorIndex === index) {
      setCurrentColorIndex(Math.max(0, index - 1));
    }
  };
  
  const handleSave = () => {
    if (!presetName) return;
    
    const preset = {
      name: presetName,
      type: 'sequence',
      colors,
      brightness
    };
    
    onSave(preset);
  };
  
  return (
    <div className="sequence-preset-form">
      <h2>{initialPreset ? 'Edit Sequence' : 'Create Sequence'}</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="preset-name">Sequence Name</label>
        <input
          id="preset-name"
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Relaxing Sequence, Party, etc."
          autoFocus
        />
      </div>
      
      <div className={`preview-orb ${isPreviewActive ? 'active' : ''}`}
        style={{ 
          backgroundColor: previewColor,
          boxShadow: `0 0 40px ${previewColor}80`
        }}
      />
      
      <button
        className={`preview-button ${isPreviewActive ? 'active' : ''}`}
        onClick={togglePreview}
      >
        {isPreviewActive ? 'Stop Preview' : 'Preview Sequence'}
      </button>
      
      <div className="color-sequence">
        <h3>Color Sequence</h3>
        <div className="color-sequence-steps">
          {colors.map((color, index) => (
            <div 
              key={index} 
              className={`color-step ${currentColorIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentColorIndex(index)}
            >
              <div 
                className="color-dot" 
                style={{ backgroundColor: color.hex }}
              />
              <div className="color-step-details">
                <div className="duration-input">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={color.duration}
                    onChange={(e) => handleDurationChange(index, e.target.value)}
                  /> sec
                </div>
                <button 
                  className="remove-color"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeColor(index);
                  }}
                  disabled={colors.length <= 1}
                >
                  ×
                </button>
              </div>
              {index < colors.length - 1 && (
                <div className="step-arrow">→</div>
              )}
            </div>
          ))}
          <button className="add-color-button" onClick={addColor}>
            +
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '28px' }}>
        <h3>Edit Color #{currentColorIndex + 1}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <HexColorPicker 
            color={colors[currentColorIndex]?.hex} 
            onChange={handleColorChange} 
          />
        </div>
      </div>
      
      <div className="slider-container">
        <div className="slider-label">
          <label htmlFor="brightness-slider">Brightness</label>
          <span className="slider-value">{brightness}</span>
        </div>
        <input
          id="brightness-slider"
          ref={sliderRef}
          type="range"
          min="0"
          max="255"
          value={brightness}
          onChange={(e) => setBrightness(parseInt(e.target.value))}
          className="slider"
        />
      </div>
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
        <button
          onClick={onCancel}
          className="secondary-button"
          style={{ flex: 1 }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{ flex: 1 }}
          disabled={!presetName}
        >
          Save Sequence
        </button>
      </div>
    </div>
  );
};

export default SequencePreset; 