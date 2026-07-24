import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import { Settings, AlertTriangle } from 'lucide-react';

interface ProfileCardProps {
  isScrolled?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ isScrolled = false }) => {
  const navigate = useNavigate();
  const { pets, activePetId, events } = usePetStore();
  const [isManualCollapsed, setIsManualCollapsed] = useState(false);
  const effectivelyScrolled = isScrolled || isManualCollapsed;

  const activePet = pets.find(p => p.id === activePetId) || pets[0];

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

  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return '';
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0) return `${months}개월`;
    return `${years}살 ${months}개월`;
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        backgroundColor: 'var(--card-bg)',
        borderRadius: isScrolled ? '14px' : '20px',
        padding: isScrolled ? '8px 12px' : '12px 14px',
        boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.06)' : 'var(--shadow-card)',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: effectivelyScrolled ? '4px' : '10px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Overdue Care Alert Badge */}
      {overdueCount > 0 && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/calendar')}>
          <AlertTriangle size={18} color="#DC2626" />
          <span style={{ fontSize: '0.85rem', color: '#B91C1C', fontWeight: 800 }}>지연된 병원/접종 일정이 {overdueCount}건 있습니다.</span>
        </div>
      )}

      {/* Main Pet Info Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar Image */}
          <div style={{
            width: effectivelyScrolled ? '42px' : '52px',
            height: effectivelyScrolled ? '42px' : '52px',
            borderRadius: '50%',
            border: '2px solid var(--main-primary)',
            padding: '2px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)',
            flexShrink: 0,
            transition: 'all 0.3s ease'
          }}>
            <img 
              src={activePet.image || '/default_paw.png'} 
              alt={activePet.name} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/default_paw.png' }}
            />
          </div>

          {/* Name & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ margin: 0, fontSize: isScrolled ? '1.05rem' : '1.2rem', fontWeight: 800, color: 'var(--text-main)', transition: 'all 0.3s ease' }}>
                {activePet.name}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--main-primary)', fontWeight: 800, backgroundColor: 'var(--butter-cream)', padding: '2px 8px', borderRadius: '10px' }}>
                {activePet.breed}
              </span>
            </div>
            {!effectivelyScrolled && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, animation: 'fadeInTab 0.2s ease-out' }}>
                {activePet.birth || '생일 미설정'} {calculateAge(activePet.birth) ? `(${calculateAge(activePet.birth)})` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Profile Edit Button */}
        <button
          onClick={() => navigate(`/profile?id=${activePet.id}`)}
          style={{
            backgroundColor: 'var(--screen-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            padding: effectivelyScrolled ? '4px 10px' : '6px 12px',
            borderRadius: '14px',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease'
          }}
        >
          <Settings size={14} /> 수정
        </button>
      </div>

      {/* Manual Collapse Toggle Button */}
      {!isScrolled && (
        <button
          onClick={() => setIsManualCollapsed(!isManualCollapsed)}
          style={{
            position: 'absolute',
            bottom: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--card-bg)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            zIndex: 10,
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}
        >
          {isManualCollapsed ? '▼' : '▲'}
        </button>
      )}

      {/* Collapsible Stats Row */}
      <div style={{
        maxHeight: effectivelyScrolled ? '0px' : '80px',
        opacity: effectivelyScrolled ? 0 : 1,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: effectivelyScrolled ? 0 : '10px',
        borderTop: effectivelyScrolled ? 'none' : '1px dashed var(--border-color)',
        marginTop: effectivelyScrolled ? 0 : '2px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePet.weight ? `${activePet.weight}kg` : '-'}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>몸무게</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePet.walkDuration || activePet.walkGoal || '30분'}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>산책 목표</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: activePet.allergies && activePet.allergies !== '없음' ? '#D97706' : 'var(--main-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activePet.allergies && activePet.allergies !== '없음' ? '주의' : '양호'}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>알레르기</span>
        </div>
      </div>
    </div>
  );
};
