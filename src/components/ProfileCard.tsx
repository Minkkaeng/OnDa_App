import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePetStore } from '../store/petStore';

export const ProfileCard: React.FC = () => {
  const navigate = useNavigate();
  const { pets, activePetId, setActivePetId, events } = usePetStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (!activePet) {
    return (
      <div className="global-profile-card">
        <div className="global-profile-info">
          <h3>등록된 반려동물이 없습니다.</h3>
        </div>
        <button 
          className="global-profile-switch-btn"
          onClick={() => navigate('/onboarding')}
        >
          등록하러 가기
        </button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueEvents = events.filter(e => e.petId === activePet.id && e.type === 'hospital' && e.date < todayStr);
  const overdueCount = overdueEvents.length;

  return (
    <div 
      ref={dropdownRef} 
      style={{ 
        position: 'relative', 
        backgroundColor: 'var(--white)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        border: '1.5px solid var(--steel-gray)'
      }}
    >
      {/* 1. Overdue Care Badge */}
      {overdueCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: '#FF4D4D',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '10px',
          fontSize: '0.7rem',
          fontWeight: 800,
          boxShadow: '0 2px 8px rgba(255,77,77,0.3)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ letterSpacing: '-0.5px' }}>지연 {overdueCount}건</span>
        </div>
      )}

      {/* 2. Top Color Gradient (식시터 그라데이션 디자인 스타일) */}
      <div style={{
        height: '68px',
        background: 'linear-gradient(135deg, #4CE0C4 0%, #0D9488 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '16px'
      }}>
        {/* Brand Logo in top-left of gradient banner */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" style={{ height: '24px' }}>
            <path d="M 98 45 A 15 15 0 0 0 68 45 C 68 70, 98 85, 98 85 C 98 85, 128 70, 128 45 A 15 15 0 0 0 98 45" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 168 25 V 85" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round"/>
            <path d="M 168 25 C 223 25, 223 85, 168 85" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round"/>
            <path d="M 128 85 V 45" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round"/>
            <path d="M 128 55 C 128 35, 168 35, 168 55 V 85" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round"/>
            <circle cx="240" cy="65" r="20" fill="none" stroke="#ffffff" strokeWidth="16"/>
            <path d="M 260 45 V 85" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round"/>
          </svg>
        </Link>
      </div>



      <button 
        type="button"
        className="global-profile-switch-btn" 
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen(!dropdownOpen);
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          border: 'none',
          color: 'white',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: 800,
          cursor: 'pointer',
          zIndex: 5
        }}
      >
        프로필 변경 ▾
      </button>

      {/* 4. Center Overlapping Avatar */}
      <div style={{
        position: 'absolute',
        top: '27px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '82px',
        height: '82px',
        borderRadius: '50%',
        border: '3px solid white',
        backgroundColor: 'white',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        zIndex: 2
      }}>
        <img 
          src={activePet.image} 
          alt={activePet.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* 5. Profile Body Content (이름 및 종이 한 줄에 표시되도록 정돈) */}
      <div style={{ paddingTop: '52px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', position: 'relative', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--deep-navy)', display: 'inline-block' }}>
            {activePet.name}
          </h3>
          <span style={{ 
            position: 'absolute', 
            left: '100%', 
            bottom: '2px', 
            marginLeft: '6px', 
            fontSize: '0.75rem', 
            color: 'var(--muted-gray)', 
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            {activePet.breed}
          </span>
        </div>

        {/* Stats Row (이용자 만족도 스탯 칸막이 디자인 스타일) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'stretch',
          padding: '12px 0',
          borderTop: '1px solid var(--steel-gray)',
          borderBottom: '1px solid var(--steel-gray)',
          width: 'calc(100% - 32px)',
          margin: '0 16px'
        }}>
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--steel-gray)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--deep-navy)', marginBottom: '3px' }}>{activePet.birth}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted-gray)', fontWeight: 700 }}>생일</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--steel-gray)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--deep-navy)', marginBottom: '3px' }}>{activePet.weight}kg</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted-gray)', fontWeight: 700 }}>몸무게</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--deep-navy)', marginBottom: '3px' }}>{activePet.walkDuration || activePet.walkGoal || '30분'}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted-gray)', fontWeight: 700 }}>산책 목표</span>
          </div>
        </div>
      </div>
      
      {/* 6. Profile Swapping Dropdown Menu */}
      <div 
        className={`global-profile-dropdown ${dropdownOpen ? 'open' : ''}`}
        style={{
          position: 'absolute',
          top: '42px',
          right: '12px',
          zIndex: 20
        }}
      >
        {pets.map(pet => (
          <div 
            key={pet.id} 
            className="dropdown-item pet-select-item" 
            onClick={() => {
              setActivePetId(pet.id);
              setDropdownOpen(false);
            }}
          >
            <img src={pet.image} alt={pet.name} className="dropdown-avatar" />
            <span className="dropdown-name">{pet.name}</span>
          </div>
        ))}
        <div 
          className="dropdown-item dropdown-edit-btn" 
          onClick={() => {
            setDropdownOpen(false);
            navigate(`/profile?id=${activePet.id}`);
          }}
          style={{ justifyContent: 'center', color: 'var(--deep-navy)', fontWeight: 'bold', borderTop: '1px solid var(--steel-gray)' }}
        >
          ⚙️ 프로필 수정
        </div>
        <div 
          className="dropdown-item dropdown-add-btn" 
          onClick={() => {
            setDropdownOpen(false);
            navigate('/profile?add=true');
          }}
        >
          + 새 프로필 추가
        </div>
      </div>
    </div>
  );
};
