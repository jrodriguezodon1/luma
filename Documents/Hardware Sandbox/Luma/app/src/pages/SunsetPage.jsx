import React, { useState, useRef, useEffect } from 'react';

const SunsetPage = ({ 
  startSunset, 
  duration, 
  onDurationChange, 
  scheduled, 
  setScheduled, 
  time, 
  setTime,
  isConnected
}) => {
  const [scrubberPosition, setScrubberPosition] = useState(0);
  const scrubberRef = useRef(null);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Demo sunset orb color 
  const calculateOrbColor = () => {
    // Maps position from 0 to 100 to a sunset color progression
    if (scrubberPosition < 25) {
      // Orange to red
      return `rgb(255, ${Math.round(255 - scrubberPosition * 8)}, 100)`;
    } else if (scrubberPosition < 50) {
      // Red to purple
      const pos = (scrubberPosition - 25) * 4;
      return `rgb(${Math.round(255 - pos)}, 50, ${Math.round(100 + pos * 5)})`;
    } else if (scrubberPosition < 75) {
      // Purple to deep blue
      const pos = (scrubberPosition - 50) * 4;
      return `rgb(${Math.round(150 - pos * 4)}, ${Math.round(50 - pos)}, ${Math.round(200 - pos * 2)})`;
    } else {
      // Deep blue to black
      const pos = (scrubberPosition - 75) * 4;
      return `rgb(${Math.round(50 - pos * 2)}, ${Math.round(30 - pos)}, ${Math.round(120 - pos * 4)})`;
    }
  };
  
  const orbColor = calculateOrbColor();
  
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
  
  return (
    <div className="page">
      <h1>Sunset Mode</h1>
      
      <div 
        className="color-orb pulse-animation" 
        style={{ 
          backgroundColor: orbColor,
          boxShadow: `0 0 60px ${orbColor}80`
        }}
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
        onClick={() => startSunset(duration)}
        disabled={!isConnected}
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
    </div>
  );
};

export default SunsetPage; 