import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

export interface OnboardingStep0TermsProps {
  agreeLocation: boolean;
  setAgreeLocation: (val: boolean) => void;
  agreePrivacy: boolean;
  setAgreePrivacy: (val: boolean) => void;
  agreeNotification: boolean;
  setAgreeNotification: (val: boolean) => void;
  onShowTermsModal: (type: 'location' | 'privacy') => void;
  onConfirmTerms: () => void;
  colors: {
    cardBg: string;
    textMain: string;
    textMuted: string;
    mainPrimary: string;
    borderColor: string;
  };
  commonCardStyle?: React.CSSProperties;
}

const OnboardingStep0Terms: React.FC<OnboardingStep0TermsProps> = ({
  agreeLocation,
  setAgreeLocation,
  agreePrivacy,
  setAgreePrivacy,
  agreeNotification,
  setAgreeNotification,
  onShowTermsModal,
  onConfirmTerms,
  colors
}) => {
  const isAllRequiredAgreed = agreeLocation && agreePrivacy;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(18, 27, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      boxSizing: 'border-box',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '380px',
        padding: '24px 20px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
        border: '1px solid #EFECE6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        animation: 'scaleUp 0.2s ease-out'
      }}>
        {/* Header Round Badge */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--main-primary, #5C715E)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(92,113,94,0.3)',
          marginBottom: '14px'
        }}>
          <ShieldCheck size={28} />
        </div>

        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: colors.textMain,
          margin: '0 0 6px 0',
          textAlign: 'center'
        }}>
          서비스 이용약관 동의
        </h3>

        <p style={{
          margin: '0 0 16px 0',
          fontSize: '0.8rem',
          color: colors.textMuted,
          lineHeight: 1.45,
          textAlign: 'center',
          wordBreak: 'keep-all'
        }}>
          우리아이 맞춤 케어 시작을 위해<br/>필수 서비스 약관에 동의해 주세요.
        </p>

        {/* Checkboxes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginBottom: '20px' }}>
          {/* All Agree Banner */}
          <div 
            onClick={() => {
              const target = !isAllRequiredAgreed;
              setAgreeLocation(target);
              setAgreePrivacy(target);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: isAllRequiredAgreed ? 'var(--main-primary-light, #D4E2D2)' : '#F8F7F3',
              border: `1.5px solid ${isAllRequiredAgreed ? colors.mainPrimary : '#E8E2D9'}`,
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              backgroundColor: isAllRequiredAgreed ? colors.mainPrimary : '#FFFFFF',
              border: `1.5px solid ${isAllRequiredAgreed ? colors.mainPrimary : '#C0B8B0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              {isAllRequiredAgreed && <Check size={14} strokeWidth={3} />}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: colors.textMain }}>
              약관 전체 동의하기
            </span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#EFECE6', margin: '2px 0' }} />

          {/* 1. Location Terms */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#FCFAF7', borderRadius: '12px', border: '1px solid #EFECE6' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: colors.textMain, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={agreeLocation} 
                onChange={(e) => setAgreeLocation(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: colors.mainPrimary, cursor: 'pointer' }} 
              />
              <span>[필수] 위치기반서비스 이용동의</span>
            </label>
            <button 
              type="button" 
              onClick={() => onShowTermsModal('location')} 
              style={{ border: 'none', background: 'none', color: colors.mainPrimary, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
            >
              보기
            </button>
          </div>

          {/* 2. Privacy Terms */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#FCFAF7', borderRadius: '12px', border: '1px solid #EFECE6' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: colors.textMain, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={agreePrivacy} 
                onChange={(e) => setAgreePrivacy(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: colors.mainPrimary, cursor: 'pointer' }} 
              />
              <span>[필수] 개인정보 수집·이용 동의</span>
            </label>
            <button 
              type="button" 
              onClick={() => onShowTermsModal('privacy')} 
              style={{ border: 'none', background: 'none', color: colors.mainPrimary, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
            >
              보기
            </button>
          </div>

          {/* 3. Notification Option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', backgroundColor: '#FCFAF7', borderRadius: '12px', border: '1px solid #EFECE6', textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: colors.textMain, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={agreeNotification} 
                onChange={(e) => setAgreeNotification(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: colors.mainPrimary, cursor: 'pointer' }} 
              />
              <span>[선택] 일일 케어 & 약 복용 알림 수신</span>
            </label>
            <p style={{ margin: '0 0 0 24px', fontSize: '0.7rem', color: colors.textMuted, lineHeight: 1.3 }}>
              맞춤 산책 및 투약 스케줄 알림을 발송해 드립니다.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={!isAllRequiredAgreed}
          onClick={onConfirmTerms}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: isAllRequiredAgreed ? colors.mainPrimary : '#D0D0D0',
            color: 'white',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: isAllRequiredAgreed ? 'pointer' : 'not-allowed',
            boxShadow: isAllRequiredAgreed ? '0 4px 12px rgba(92,113,94,0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep0Terms;
