import React, { useState, useEffect } from 'react';
import { Sparkles, Droplet, Dog } from 'lucide-react';

const GUIDE_PRESETS = [
  {
    badge: '초보 가이드',
    title: '반려동물 양치질 완벽 가이드',
    desc: '치석 예방을 위한 올바른 양치 방법과 치약 선택 팁을 알아봐요.',
    icon: Sparkles
  },
  {
    badge: '건강 상식',
    title: '우리 아이 적정 음수량은?',
    desc: '몸무게 1kg당 50~60ml가 적당해요. 부족하면 방광염 원인이 될 수 있어요.',
    icon: Droplet
  },
  {
    badge: '행동학 가이드',
    title: '산책 중 자꾸 냄새만 맡아요',
    desc: '노즈워크는 스트레스 해소에 필수! 여유를 갖고 기다려주는 것이 좋습니다.',
    icon: Dog
  }
];

const CareGuideBanner: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % GUIDE_PRESETS.length);
    }, 6000); // 6 seconds
    return () => clearInterval(interval);
  }, []);

  const activeGuide = GUIDE_PRESETS[idx];

  return (
    <div 
      style={{
        ...style,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        border: '1.5px solid #BBF7D0',
        padding: '16px 20px',
        color: 'var(--text-main)',
        boxShadow: '0 4px 16px rgba(18, 27, 42, 0.03)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        minHeight: '90px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ flex: 1, zIndex: 1, paddingRight: '8px' }}>
        <span style={{ 
          fontSize: '0.65rem', 
          background: '#86EFAC', 
          color: '#14532D',
          padding: '2px 8px', 
          borderRadius: '12px', 
          fontWeight: 800,
          letterSpacing: '0.5px'
        }}>
          {activeGuide.badge}
        </span>
        <h4 style={{ margin: '6px 0 2px 0', fontSize: '0.9rem', fontWeight: 800, color: '#14532D' }}>{activeGuide.title}</h4>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
          {activeGuide.desc}
        </p>
      </div>
      <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', color: '#14532D', paddingLeft: '8px' }}>
        {React.createElement(activeGuide.icon, { size: 32 })}
      </div>
      
      <div style={{
        position: 'absolute',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#BBF7D0',
        top: '-20px',
        right: '-20px',
        filter: 'blur(20px)',
        opacity: 0.5
      }} />
    </div>
  );
};

export default CareGuideBanner;
