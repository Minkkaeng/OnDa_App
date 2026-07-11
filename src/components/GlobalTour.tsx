import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../hooks/useOnboarding';
import { usePetStore } from '../store/petStore';

const TOUR_STEPS = [
  { path: '/onboarding', selector: '.avatar-upload', text: '예쁜 내 아이의 사진을 탭하여 프로필 이미지를 등록해 주세요.' },
  { path: '/onboarding', selector: '.onboarding-form', text: '이름, 생일, 몸무게 등 기본 정보를 입력해 프로필을 만들어주세요.' },
  { path: '/dashboard', selector: '#home-guide-step3', text: '오늘의 산책 기록 위젯을 통해 산책 시간을 실시간으로 측정하고 편하게 저장하세요.' },
  { path: '/dashboard', selector: '#home-guide-step2', text: '대시보드 하단에서 오늘 하루 케어 일정을 한눈에 확인하고 체크할 수 있습니다.' },
  { path: '/care', selector: '#care-guide-step1', text: '케어 탭에서는 프로필에서 설정한 투약 정보, 알러지, 산책 스케줄을 실시간 타임라인으로 확인할 수 있습니다.' },
  { path: '/diary', selector: '#diary-guide-step1', text: '우측 하단 버튼을 눌러 소중한 추억을 사진과 함께 기록해 보세요.' },
  { path: '/diary', selector: '.cal-modal-content', text: '사진을 첨부하고 일기 날짜, 제목, 내용을 기입하여 소중한 하루를 기록할 수 있습니다.' }
];

const GlobalTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeGuide } = useOnboarding();
  const { setGlobalTourActive, setGlobalTourStep } = usePetStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

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

  // Track target element
  useEffect(() => {
    if (!isVisible) return;

    let timeoutId: number;
    const updateRect = () => {
      const selector = TOUR_STEPS[currentStep].selector;
      const el = document.querySelector(selector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        // Fallback or wait
        setTargetRect(null);
        timeoutId = window.setTimeout(updateRect, 300);
      }
    };

    updateRect();
    // Poll a few times to ensure rendering
    timeoutId = window.setTimeout(updateRect, 500);

    return () => clearTimeout(timeoutId);
  }, [currentStep, isVisible, location.pathname]);

  const handleFinish = () => {
    setIsVisible(false);
    setGlobalTourActive(false);
    completeGuide('isGlobalTourSeen');
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

  // Use the middle of the screen to decide tooltip placement (maximizes available vertical space)
  const isBottom = targetRect && (targetRect.top + targetRect.height / 2 > window.innerHeight / 2);

  const boxTop = targetRect ? targetRect.top - 4 : 0;
  const boxLeft = targetRect ? targetRect.left - 4 : 0;
  const boxWidth = targetRect ? targetRect.width + 8 : 0;
  const boxHeight = targetRect ? targetRect.height + 8 : 0;

  // Line anchor at the target bounding box (bottom-center or top-center)
  const startX = boxLeft + (boxWidth / 2);
  const startY = isBottom ? boxTop : boxTop + boxHeight;

  // Calculate tooltip bounding box so the line always connects nicely
  const maxTooltipWidth = 400;
  const tooltipWidth = Math.min(window.innerWidth - 48, maxTooltipWidth);
  const renderLeft = (window.innerWidth - tooltipWidth) / 2;
  const renderRight = renderLeft + tooltipWidth;

  // Line anchor at the tooltip (clamp X so it doesn't detach from the box)
  const endX = Math.max(renderLeft + 24, Math.min(renderRight - 24, startX));
  const endY = isBottom ? boxTop - 32 : boxTop + boxHeight + 32;

  // Tooltip position
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: `${maxTooltipWidth}px`,
    ...(isBottom ? { bottom: window.innerHeight - endY } : { top: endY })
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'auto', overflow: 'hidden' }}>
      {!targetRect && (
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(18, 27, 42, 0.85)',
            transition: 'background-color 0.4s ease'
          }}
        />
      )}

      {targetRect && (
        <>
          {/* Completely transparent hole with dashed border */}
          <div style={{
            position: 'absolute',
            top: boxTop,
            left: boxLeft,
            width: boxWidth,
            height: boxHeight,
            backgroundColor: 'transparent',
            boxShadow: '0 0 0 9999px rgba(26, 33, 46, 0.12)',
            border: '1.5px dashed #14C3A3',
            borderRadius: '8px',
            zIndex: 1,
            pointerEvents: 'none',
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }} />

          {/* SVG Connecting Line */}
          <svg style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 2, pointerEvents: 'none'
          }}>
            <path
              d={`M ${startX} ${startY} Q ${startX} ${(startY + endY) / 2}, ${endX} ${endY}`}
              fill="none"
              stroke="#14C3A3"
              strokeWidth="2"
              strokeDasharray="4 4"
              style={{ transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
            />
            <circle cx={startX} cy={startY} r="4" fill="#14C3A3" style={{ transition: 'all 0.4s ease' }} />
            <circle cx={endX} cy={endY} r="4" fill="#14C3A3" style={{ transition: 'all 0.4s ease' }} />
          </svg>

          {/* Direct Text Description */}
          <div style={{
            position: 'absolute',
            ...tooltipStyle,
            padding: '0 24px', // To keep it within screen bounds while matching width 100%
            zIndex: 3,
            pointerEvents: 'none',
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}>
            <div style={{
              backgroundColor: '#FFF',
              color: '#14C3A3',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              fontSize: '1rem',
              lineHeight: '1.5',
              fontWeight: 700,
              wordBreak: 'keep-all',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span>{TOUR_STEPS[currentStep].text}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fixed Bottom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '40px', left: 0, right: 0,
        padding: '24px 20px',
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 4,
      }}>
        {/* Step Indicators */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
        }}>
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: idx === currentStep ? '#14C3A3' : 'rgba(255,255,255,0.3)',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Center: Prev / Next */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              style={{ padding: '10px 24px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'transparent', color: '#FFF', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            style={{ padding: '10px 32px', borderRadius: '30px', border: 'none', backgroundColor: '#14C3A3', color: '#121B2A', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20, 195, 163, 0.3)', transition: 'all 0.2s' }}
          >
            {currentStep === TOUR_STEPS.length - 1 ? '시작하기' : '다음'}
          </button>
        </div>

        {/* Right: Skip */}
        <button
          onClick={handleFinish}
          style={{ position: 'absolute', right: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default GlobalTour;
