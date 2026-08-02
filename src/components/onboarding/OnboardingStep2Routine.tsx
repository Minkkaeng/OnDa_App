import React from 'react';

export interface OnboardingStep2RoutineProps {
  walkDuration: string;
  setWalkDuration: (val: string) => void;
  walkDepartTime: string;
  onOpenTimePicker: () => void;
  getArchCoordinates: (index: number, total: number) => { x: number; y: number; rotateDeg: number };
  colors: {
    textMain: string;
    textMuted: string;
    mainPrimary: string;
    mainPrimaryLight: string;
    borderColor: string;
  };
  commonCardStyle: React.CSSProperties;
}

const OnboardingStep2Routine: React.FC<OnboardingStep2RoutineProps> = ({
  walkDuration,
  setWalkDuration,
  walkDepartTime,
  onOpenTimePicker,
  getArchCoordinates,
  colors,
  commonCardStyle
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Card 2-1: Arch Sector Walk Goal Option */}
      <div className="onboarding-card" style={{ ...commonCardStyle, padding: '20px 16px' }}>
        <label className="form-label" style={{ fontSize: '0.92rem', color: colors.textMain, fontWeight: 800, display: 'block', textAlign: 'center', marginBottom: '14px' }}>
          목표 산책 시간 (일일)
        </label>
        
        {/* Arch Sector Interactive Wheel SVG Container */}
        <div style={{ position: 'relative', width: '320px', height: '175px', paddingTop: '16px', margin: '0 auto', overflow: 'visible', boxSizing: 'border-box' }}>
          <svg width="320" height="160" viewBox="0 0 320 160" style={{ position: 'absolute', top: '16px', left: 0 }}>
            <path 
              d="M 20 160 A 140 140 0 0 1 300 160" 
              fill="none" 
              stroke={colors.borderColor} 
              strokeWidth="12" 
              strokeLinecap="round"
            />
            <path 
              d="M 20 160 A 140 140 0 0 1 300 160" 
              fill="none" 
              stroke={colors.mainPrimaryLight} 
              strokeWidth="5" 
              strokeLinecap="round"
            />
          </svg>

          {/* Interactive Arch Option Buttons */}
          {['15분', '30분', '45분', '1시간', '1.5시간+'].map((opt, idx) => {
            const isSelected = walkDuration === opt;
            const { x, y } = getArchCoordinates ? getArchCoordinates(idx, 5) : {
              x: 160 + 140 * Math.sin((-60 + idx * 30) * (Math.PI / 180)),
              y: 160 - 140 * Math.cos((-60 + idx * 30) * (Math.PI / 180))
            };

            return (
              <button
                key={opt}
                type="button"
                onClick={() => setWalkDuration(opt)}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y + 16}px`,
                  transform: 'translate(-50%, -50%)',
                  padding: isSelected ? '7px 15px' : '5px 12px',
                  borderRadius: '20px',
                  border: isSelected ? `2px solid ${colors.mainPrimary}` : `1.5px solid ${colors.borderColor}`,
                  backgroundColor: isSelected ? colors.mainPrimary : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : colors.textMain,
                  fontSize: isSelected ? '0.82rem' : '0.78rem',
                  fontWeight: isSelected ? 800 : 700,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 14px rgba(92,113,94,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: isSelected ? 10 : 2,
                  whiteSpace: 'nowrap'
                }}
              >
                {opt}
              </button>
            );
          })}
          {/* Center Integrated Direct Input Box */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FCFAF7',
            border: `1.5px solid ${colors.borderColor}`,
            borderRadius: '20px',
            padding: '4px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 5
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.textMuted, whiteSpace: 'nowrap' }}>직접 입력:</span>
            <input 
              type="text" 
              value={walkDuration} 
              onChange={(e) => setWalkDuration(e.target.value)} 
              placeholder="예) 45분" 
              style={{
                width: '75px',
                height: '28px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: colors.textMain,
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Card 2-2: Walk Departure Time Picker Button */}
      <div className="onboarding-card" style={{ ...commonCardStyle, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontSize: '0.88rem', color: colors.textMain, fontWeight: 800, margin: 0 }}>
              주로 나가는 산책 시간
            </label>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
              알림 설정 시 이 시간에 맞추어 챙겨드려요.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTimePicker}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1.5px solid ${colors.mainPrimary}`,
              backgroundColor: '#F4F7F4',
              color: colors.mainPrimary,
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(92,113,94,0.15)'
            }}
          >
            ⏰ {walkDepartTime || '시간 선택'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2Routine;
