import React, { useState, useEffect } from 'react';

interface AdPreset {
  badge: string;
  title: string;
  desc: string;
  emoji: string;
  link?: string;
}

const AD_PRESETS: AdPreset[] = [
  {
    badge: '마이도기',
    title: '🌾 유기농 수제 케어 푸드 출시!',
    desc: '온다 회원 대상 전상품 15% 런칭 감사 쿠폰 지급 중. 신선한 자연식 사료를 만나보세요.',
    emoji: '🦴'
  },
  {
    badge: '온다 케어',
    title: '🩺 비대면 실시간 수의사 상담 오픈',
    desc: '늦은 밤 갑작스러운 구토나 이상 증세, 당황하지 말고 전문의와 비대면 1:1 상담을 받아보세요.',
    emoji: '🚑'
  },
  {
    badge: '슬기로운 생활',
    title: '🏡 슬개골 방지 논슬립 안심 매트',
    desc: '강아지 슬개골 연골 마모 예방 특허 완료. 1등급 방수 및 무독성 논슬립 패드 35% 특가.',
    emoji: '🐕'
  }
];

const AdBanner: React.FC = () => {
  const [adIdx, setAdIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAdIdx(prev => (prev + 1) % AD_PRESETS.length);
    }, 8000); // Cycle ads every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const activeAd = AD_PRESETS[adIdx];

  return (
    <div 
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, var(--screen-bg) 0%, var(--card-bg) 100%)',
        border: '1.5px solid var(--border-color)',
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
        marginTop: 0
      }}
      onClick={() => {
        // If native capacitor implementation, this could trigger AdMob SDK click tracker
        console.log(`[AdMob Banner Clicked] Tracker event logged for: ${activeAd.badge}`);
      }}
    >
      <div style={{ flex: 1, zIndex: 1, paddingRight: '8px' }}>
        <span style={{ 
          fontSize: '0.65rem', 
          background: 'var(--butter-cream)', 
          color: 'var(--main-primary)',
          padding: '2px 8px', 
          borderRadius: '12px', 
          fontWeight: 800,
          letterSpacing: '0.5px'
        }}>
          {activeAd.badge}
        </span>
        <h4 style={{ margin: '6px 0 2px 0', fontSize: '0.9rem', fontWeight: 800 }}>{activeAd.title}</h4>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {activeAd.desc}
        </p>
      </div>
      <div style={{ fontSize: '2rem', zIndex: 1 }}>{activeAd.emoji}</div>
      
      {/* Subtle background gradient circle */}
      <div style={{
        position: 'absolute',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'var(--butter-cream)',
        top: '-20px',
        right: '-20px',
        filter: 'blur(20px)',
        opacity: 0.5
      }} />
    </div>
  );
};

export default AdBanner;
