import React from 'react';

export interface OnboardingTermsModalProps {
  showTermsModal: 'location' | 'privacy' | null;
  onClose: () => void;
  colors: {
    textMain: string;
    textMuted: string;
    mainPrimary: string;
  };
}

const OnboardingTermsModal: React.FC<OnboardingTermsModalProps> = ({
  showTermsModal,
  onClose,
  colors
}) => {
  if (!showTermsModal) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px',
        width: '100%', maxWidth: '400px', maxHeight: '70vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: colors.textMain }}>
          {showTermsModal === 'location' ? '위치기반서비스 이용약관' : '개인정보 수집 및 이용 동의'}
        </h3>
        <div style={{ fontSize: '0.8rem', color: colors.textMuted, whiteSpace: 'pre-wrap', lineHeight: 1.4, padding: '8px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #EDEDED', maxHeight: '260px', overflowY: 'auto' }}>
          {showTermsModal === 'location' ? (
            `제1조 (목적)\n본 약관은 OnDa Pet Care가 제공하는 위치기반서비스의 이용 조건 및 절차를 규정합니다.\n\n제2조 (위치정보의 수집 및 이용)\n1. 본 서비스는 주변 동물병원 및 약국 검색을 위해 사용자의 GPS 정보를 임시 수집할 수 있습니다.\n2. 수집된 좌표 정보는 병원 검색용 reverse geocoding 목적으로만 사용되며, 서버에 저장되지 않고 즉시 휘발됩니다.`
          ) : (
            `1. 개인정보 수집 및 이용 목적: 반려동물 맞춤형 케어 가이드 생성 및 프로필 서비스 기능 제공\n2. 수집 항목: 반려동물 이름, 종류, 품종, 생년월일, 몸무게, 알레르기 목록, 복용 약 및 기저 질환\n3. 보유 및 이용 기간: 이용자 로컬 디바이스 내 Dexie(IndexedDB) 저장소에 영구 보관되며, 앱 삭제 또는 데이터 초기화 시 즉시 폐기됩니다.`
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', padding: '10px', backgroundColor: colors.mainPrimary,
            color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800,
            cursor: 'pointer', marginTop: '10px'
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default OnboardingTermsModal;
