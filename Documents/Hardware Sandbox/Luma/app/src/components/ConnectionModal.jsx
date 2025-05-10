import React from 'react';

const ConnectionModal = ({ 
  ipAddress, 
  setIpAddress, 
  connectToController, 
  connecting, 
  message, 
  isConnected,
  onClose
}) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    connectToController();
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Connect to Luma</h2>
          {isConnected && (
            <button className="modal-close" onClick={onClose}>×</button>
          )}
        </div>
        
        <div className="modal-body">
          <div className="connection-icon">
            <div className="connection-orb">
              <div className="connection-waves"></div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <label htmlFor="ipAddress">Controller IP Address</label>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '15px', 
              position: 'relative'
            }}>
              <input
                id="ipAddress"
                type="text"
                placeholder="Enter IP address or 'dev'"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                disabled={connecting}
                autoFocus
              />
              {connecting && (
                <div className="spinner"></div>
              )}
            </div>
            
            {message && (
              <p className={`message ${isConnected ? 'success' : 'error'}`}>
                {message}
              </p>
            )}
            
            <div className="quick-connect">
              <span>Quick connect:</span>
              <button 
                type="button" 
                className="quick-ip-button"
                onClick={() => setIpAddress('dev')}
              >
                Dev Mode
              </button>
            </div>
            
            <div className="modal-footer">
              <button 
                type="submit" 
                disabled={connecting || !ipAddress}
                className="main-action-button"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConnectionModal; 