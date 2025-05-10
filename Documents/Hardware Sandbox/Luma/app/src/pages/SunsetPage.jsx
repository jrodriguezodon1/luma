import React, { useState, useRef, useEffect } from 'react';

const SunsetPage = ({ 
  startSunset, 
  duration, 
  onDurationChange, 
  scheduled, 
  setScheduled, 
  time, 
  setTime,
  isConnected,
  presets,
  applyPreset
}) => {
  const [scrubberPosition, setScrubberPosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const scrubberRef = useRef(null);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const animationRef = useRef(null);
  const sunsetOrb = useRef(null);
  
  // Demo sunset orb color 
  const calculateOrbColor = (position) => {
    // Maps position from 0 to 100 to a sunset color progression
    if (position < 25) {
      // Orange to red
      return `rgb(255, ${Math.round(255 - position * 8)}, 100)`;
    } else if (position < 50) {
      // Red to purple
      const pos = (position - 25) * 4;
      return `rgb(${Math.round(255 - pos)}, 50, ${Math.round(100 + pos * 5)})`;
    } else if (position < 75) {
      // Purple to deep blue
      const pos = (position - 50) * 4;
      return `rgb(${Math.round(150 - pos * 4)}, ${Math.round(50 - pos)}, ${Math.round(200 - pos * 2)})`;
    } else {
      // Deep blue to black
      const pos = (position - 75) * 4;
      return `rgb(${Math.round(50 - pos * 2)}, ${Math.round(30 - pos)}, ${Math.round(120 - pos * 4)})`;
    }
  };
  
  const orbColor = calculateOrbColor(scrubberPosition);
  
  // Update slider fill
  useEffect(() => {
    if (sliderRef.current) {
      const percent = ((duration - 300) / (1800 - 300)) * 100;
      sliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    }
  }, [duration]);
  
  // Handle scrubber mouse/touch events
  const handleScrubberMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleScrubberMove(e);
  };
  
  const handleScrubberMove = (e) => {
    if (isDragging && scrubberRef.current) {
      const rect = scrubberRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const position = (clientX - rect.left) / rect.width;
      const newPosition = Math.max(0, Math.min(100, position * 100));
      setScrubberPosition(newPosition);
    }
  };
  
  const handleScrubberRelease = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    const handleDocumentMove = (e) => {
      handleScrubberMove(e);
    };
    
    const handleDocumentRelease = () => {
      handleScrubberRelease();
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleDocumentMove);
      document.addEventListener('mouseup', handleDocumentRelease);
      document.addEventListener('touchmove', handleDocumentMove);
      document.addEventListener('touchend', handleDocumentRelease);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDocumentMove);
      document.removeEventListener('mouseup', handleDocumentRelease);
      document.removeEventListener('touchmove', handleDocumentMove);
      document.removeEventListener('touchend', handleDocumentRelease);
    };
  }, [isDragging]);
  
  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    onDurationChange(newDuration);
  };
  
  // Full sunset animation
  const startSunsetAnimation = () => {
    // Start real sunset if connected
    if (isConnected) {
      startSunset(duration);
    }
    
    // Start animation preview
    setIsAnimating(true);
    setAnimationTime(0);
    
    // Calculate sunset duration for the preview (speed up for demo)
    const previewDuration = 8000; // 8 seconds for the preview
    const startTime = Date.now();
    
    // Reset animation position
    setScrubberPosition(0);
    
    // Create animation loop
    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / previewDuration);
      
      if (progress < 1) {
        // Update scrubber position based on progress
        const newPosition = progress * 100;
        setScrubberPosition(newPosition);
        
        // Calculate new opacity for the orb (fade from 1 to 0.1)
        if (sunsetOrb.current) {
          const newOpacity = 1 - (progress * 0.9);
          sunsetOrb.current.style.opacity = newOpacity;
        }
        
        // Continue animation
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        // Animation finished
        setIsAnimating(false);
        if (sunsetOrb.current) {
          sunsetOrb.current.style.opacity = 0.1;
        }
      }
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animateFrame);
    
    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  };
  
  // Stop animation if running when component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Handle preset selection
  const handleApplyPreset = (preset) => {
    // For sunset, we want to use presets in reverse (getting dimmer)
    applyPreset(preset);
  };
  
  return (
    <div className="page">
      <h1>Sunset Mode</h1>
      
      <div 
        className={`color-orb ${!isAnimating ? 'pulse-animation' : ''}`}
        style={{ 
          backgroundColor: orbColor,
          boxShadow: `0 0 60px ${orbColor}80`,
          transition: isAnimating ? 'background-color 0.3s ease' : 'none'
        }}
        ref={sunsetOrb}
      />
      
      <div 
        className="gradient-scrubber sunset-gradient" 
        ref={scrubberRef}
        onMouseDown={handleScrubberMouseDown}
        onTouchStart={handleScrubberMouseDown}
      >
        <div 
          className="scrubber-handle" 
          style={{ left: `${scrubberPosition}%` }}
        />
      </div>
      
      <div className="slider-container">
        <div className="slider-label">
          <label htmlFor="duration-slider">Fade Duration</label>
          <span className="slider-value">{Math.floor(duration/60)} minutes</span>
        </div>
        <input
          id="duration-slider"
          ref={sliderRef}
          type="range"
          min="300"
          max="1800"
          step="60"
          value={duration}
          onChange={handleDurationChange}
          className="slider"
        />
      </div>
      
      <button 
        className="main-action-button"
        onClick={startSunsetAnimation}
        disabled={isAnimating}
      >
        Start Sunset Now
      </button>
      
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="settings-row">
          <div className="label">
            <span>Schedule Sunset</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={scheduled}
              onChange={(e) => setScheduled(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        
        {scheduled && (
          <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease-out' }}>
            <label htmlFor="sunset-time">Sunset Time</label>
            <input
              id="sunset-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <p className="text-secondary" style={{ marginTop: '12px', fontSize: '14px' }}>
              Lights will gradually fade to off at the scheduled time.
            </p>
          </div>
        )}
      </div>
      
      {/* Presets Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="settings-row" onClick={() => setShowPresets(!showPresets)} style={{ cursor: 'pointer' }}>
          <div className="label">
            <span>Sunset Presets</span>
          </div>
          <div style={{ fontSize: '18px', transition: 'transform 0.3s' }}>
            {showPresets ? '▼' : '▶'}
          </div>
        </div>
        
        {showPresets && presets.length > 0 && (
          <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease-out' }}>
            <p className="text-secondary" style={{ marginBottom: '16px', fontSize: '14px' }}>
              Select a preset to start with before fading out:
            </p>
            <div className="presets-grid">
              {presets.map(preset => (
                <div key={preset.id} 
                  className="preset-card"
                  onClick={() => handleApplyPreset(preset)}
                >
                  <div
                    className="preset-color"
                    style={{ 
                      backgroundColor: preset.type === 'sequence' 
                        ? preset.colors[0].hex 
                        : `rgb(${preset.color.r}, ${preset.color.g}, ${preset.color.b})`
                    }}
                  />
                  <h3>{preset.name}</h3>
                  {preset.type === 'sequence' && (
                    <div className="preset-info">
                      <span className="preset-badge">Sequence</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showPresets && presets.length === 0 && (
          <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease-out' }}>
            <p className="text-secondary">
              No presets available. Create presets in the Presets tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SunsetPage; 