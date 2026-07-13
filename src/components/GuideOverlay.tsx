import React, { useEffect, useState } from 'react';

export interface GuideStep {
  selector: string;
  text: string;
}

interface GuideOverlayProps {
  steps: GuideStep[];
  onFinish: () => void;
}

const GuideOverlay: React.FC<GuideOverlayProps> = ({ steps, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onFinish();
      return;
    }
    
    const updateRect = () => {
      const el = document.querySelector(steps[currentStep].selector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    updateRect();
    const timeoutId = setTimeout(updateRect, 300);

    return () => clearTimeout(timeoutId);
  }, [currentStep, steps, onFinish]);

  if (currentStep >= steps.length) return null;

  const handleAdvance = () => {
    setCurrentStep(prev => prev + 1);
  };

  return (
    <>
      {/* Background Overlay - clickable to advance */}
      <div 
        onClick={handleAdvance}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          pointerEvents: 'auto',
          overflow: 'hidden',
          cursor: 'pointer' // indicating it's clickable
        }}
      >
        {targetRect ? (
          <div style={{
            position: 'absolute',
            top: targetRect.top - 12,
            left: targetRect.left - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            backgroundColor: 'transparent',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            borderRadius: '12px',
            transition: 'none',
            pointerEvents: 'none',
            zIndex: 10000
          }} />
        ) : (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 10000
          }} />
        )}
      </div>
      
      {targetRect && (
        <div style={{
          position: 'fixed',
          top: targetRect.bottom > window.innerHeight - 150 
               ? targetRect.top - 140 
               : targetRect.bottom + 24,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#FFF',
          padding: '20px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '320px',
          zIndex: 10001,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          pointerEvents: 'auto'
        }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', lineHeight: '1.4', color: '#121B2A' }}>
            {steps[currentStep].text}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={onFinish}
              style={{
                backgroundColor: 'transparent',
                color: '#6b6375',
                border: 'none',
                padding: '8px 0',
                cursor: 'pointer',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Skip
            </button>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>화면을 터치해 다음으로</span>
          </div>
        </div>
      )}
    </>
  );
};

export default GuideOverlay;
