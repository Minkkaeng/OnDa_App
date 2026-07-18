import React, { useEffect, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  const [animate, setAnimate] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Wait for next tick to trigger transition
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(18, 27, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          opacity: animate ? 1 : 0,
          transition: 'opacity 0.25s ease-out',
          zIndex: 1
        }}
      />

      {/* Sheet Body */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'var(--white)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '16px 20px 24px 20px',
        boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.12)',
        transform: animate ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Drag Handle Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: '16px',
          cursor: 'pointer'
        }} onClick={onClose}>
          <div style={{
            width: '40px',
            height: '5px',
            borderRadius: '3px',
            backgroundColor: '#E2E8F0', // steel/light gray
          }} />
        </div>

        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--deep-navy)',
            }}>{title}</h3>
            <button 
              onClick={onClose}
              style={{
                border: 'none',
                background: '#F1F5F9',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--muted-gray)',
                fontWeight: 'bold',
                marginTop: 0,
                padding: 0
              }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Content Section (Scrollable) */}
        <div style={{
          overflowY: 'auto',
          flex: 1,
          paddingRight: '4px',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
