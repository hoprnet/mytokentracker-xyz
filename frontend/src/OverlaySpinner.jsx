import React from 'react';

/**
 * OverlaySpinner
 * Props:
 *  - show (boolean): controls visibility
 *  - message (string | ReactNode): optional label under spinner
 *  - onBackdropClick (function): optional click handler for backdrop
 *  - fullscreen (boolean): if false uses relative positioning wrapper style
 */
export default function OverlaySpinner({ show = false, message, onBackdropClick, fullscreen = true }) {
  if (!show) return null;

  const overlayStyle = {
    position: fullscreen ? 'fixed' : 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    color: '#fff',
    padding: '1rem'
  };

  const spinnerStyle = {
    width: 56,
    height: 56,
    border: '6px solid rgba(255,255,255,0.25)',
    borderTopColor: '#4da3ff',
    borderRadius: '50%',
    animation: 'mtt-spin 0.8s linear infinite',
    boxShadow: '0 0 12px rgba(77,163,255,0.6)'
  };

  return (
    <div style={overlayStyle} onClick={onBackdropClick} role="status" aria-live="polite" aria-label={typeof message === 'string' ? message : 'Loading'}>
      {/* Keyframes injected locally */}
      <style>{`@keyframes mtt-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={spinnerStyle} />
      {message && (
        <div style={{ marginTop: '1rem', fontSize: '0.95rem', textAlign: 'center', maxWidth: 300, lineHeight: 1.4 }}>
          {message}
        </div>
      )}
    </div>
  );
}
