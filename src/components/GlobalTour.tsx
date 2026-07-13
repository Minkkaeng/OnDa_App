import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../hooks/useOnboarding';
import { usePetStore } from '../store/petStore';

const TOUR_STEPS = [
  { path: '/onboarding', selector: '.avatar-upload', text: '📷 프로필 생성\n사진과 기본 정보, 맞춤 케어 정보를 입력하세요.' },
  { path: '/dashboard', selector: '#home-guide-step3', text: '🏃 스마트 대시보드\n원터치 산책 기록과 케어 체크리스트를 한눈에 관리해요.' },
  { path: '/care', selector: '#care-guide-step1', text: '🗓️ 실시간 케어 스케줄러\n투약과 산책 일정을 연동해 데일리 루틴을 자동 생성합니다.' },
  { path: '/calendar', selector: '#view-calendar', text: '📅 통합 캘린더 뷰\n산책, 다이어리, 접종 일정을 날짜별로 모아보세요.' },
  { path: '/diary', selector: '#diary-guide-step1', text: '📝 소중한 일상 다이어리\n사진과 글로 매일의 추억을 예쁘게 기록해 보세요.' }
];

const GlobalTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeGuide } = useOnboarding();
  const { setGlobalTourActive, setGlobalTourStep, showSplash } = usePetStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tourOpacity, setTourOpacity] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!showSplash) {
      const animationFrame = requestAnimationFrame(() => {
        setTourOpacity(1);
      });
      return () => cancelAnimationFrame(animationFrame);
    } else {
      setTourOpacity(0);
    }
  }, [showSplash]);

  // Spotlight Effect Calculation
  useEffect(() => {
    const updateRect = () => {
      if (!isVisible) return;
      const step = TOUR_STEPS[currentStep];
      if (step && step.selector) {
        const el = document.querySelector(step.selector);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      }
    };
    const timer = setTimeout(updateRect, 150); // wait for dom to render
    window.addEventListener('resize', updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
    };
  }, [currentStep, isVisible, location.pathname]);

  // Sync step with global store so subcomponents can react
  useEffect(() => {
    setGlobalTourStep(currentStep);
  }, [currentStep, setGlobalTourStep]);

  // Lock scroll when tour is active
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isVisible]);

  // Keep route synced with step
  useEffect(() => {
    if (isVisible) {
      const targetPath = TOUR_STEPS[currentStep].path;
      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    }
  }, [currentStep, isVisible, navigate, location.pathname]);



  const handleFinish = async () => {
    setIsVisible(false);
    setGlobalTourActive(false);
    await completeGuide('isGlobalTourSeen');
    navigate('/onboarding', { replace: true });
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isVisible) return null;

  // Calculate tooltip bounding box (Clamped within mobile frame)
  const maxTooltipWidth = 340;

  const showTooltip = isVisible;

  // Tooltip position (Constrained to the bottom area of the mobile frame)
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: `${maxTooltipWidth}px`,
    bottom: '90px', // Anchor tooltip card 90px from the bottom
    zIndex: 10,
    opacity: showTooltip ? 1 : 0,
    pointerEvents: showTooltip ? 'auto' : 'none',
    transition: 'opacity 0.25s ease-in-out, transform 0.25s ease-in-out'
  };

  return (
    <div style={{ 
      position: 'absolute', inset: 0, zIndex: 9999, pointerEvents: 'auto', overflow: 'hidden',
      opacity: tourOpacity,
      transition: 'opacity 0.5s ease-out'
    }}>
      {/* Spotlight overlay */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: targetRect 
            ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px, rgba(18, 27, 42, 0.6) ${Math.max(targetRect.width, targetRect.height) / 2 + 25}px)`
            : 'rgba(18, 27, 42, 0.6)',
          transition: 'background 0.4s ease',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      {/* Direct Text Description with integrated controls */}
      <div style={{
        ...tooltipStyle,
        padding: '0'
      }}>
        <div style={{
          backgroundColor: '#FFF',
          color: '#121B2A',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          fontWeight: 500,
          wordBreak: 'keep-all',
          border: '1px solid rgba(20, 195, 163, 0.15)',
          pointerEvents: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px', color: '#334155' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'pre-line' }}>
              {TOUR_STEPS[currentStep] ? TOUR_STEPS[currentStep].text : ''}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            {/* Step indicator dots */}
            <div style={{ display: 'flex', gap: '5px' }}>
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: idx === currentStep ? '#14C3A3' : '#E2E8F0',
                    transition: 'background-color 0.2s'
                  }}
                />
              ))}
            </div>

            {/* Prev / Next & Skip Buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  style={{ 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    border: '1px solid #CBD5E1', 
                    backgroundColor: 'transparent', 
                    color: '#64748B', 
                    fontWeight: 600, 
                    fontSize: '0.8rem',
                    cursor: 'pointer', 
                    transition: 'all 0.2s' 
                  }}
                >
                  이전
                </button>
              )}
              <button
                onClick={handleNext}
                style={{ 
                  padding: '6px 18px', 
                  borderRadius: '20px', 
                  border: 'none', 
                  backgroundColor: '#14C3A3', 
                  color: '#FFF', 
                  fontWeight: 700, 
                  fontSize: '0.8rem',
                  cursor: 'pointer', 
                  boxShadow: '0 2px 6px rgba(20, 195, 163, 0.25)', 
                  transition: 'all 0.2s' 
                }}
              >
                {currentStep === TOUR_STEPS.length - 1 ? '시작하기' : '다음'}
              </button>
              <button
                onClick={handleFinish}
                style={{ 
                  marginLeft: '8px',
                  background: 'none', 
                  border: 'none', 
                  color: '#94A3B8', 
                  fontSize: '0.75rem', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalTour;
