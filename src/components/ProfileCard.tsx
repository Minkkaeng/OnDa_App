import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import { Settings, AlertTriangle, PawPrint } from 'lucide-react';

interface ProfileCardProps {
  isScrolled?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ isScrolled = false }) => {
  const navigate = useNavigate();
  const { pets, activePetId, events } = usePetStore();

  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  if (!activePet) {
    return (
      <div className="onda-card" style={{ textAlign: 'center', padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
          등록된 반려동물이 없습니다.
        </h3>
        <button 
          className="onda-btn-primary"
          onClick={() => navigate('/onboarding')}
          style={{ width: 'auto', padding: '0 20px', margin: '0 auto' }}
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
      className="onda-card"
      style={{ 
        position: 'relative', 
        padding: isScrolled ? '12px 16px' : '18px 20px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: isScrolled ? '4px' : '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Paw Icon */}
      <PawPrint 
        size={90} 
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          color: 'var(--main-primary-light)',
          opacity: 0.25,
          pointerEvents: 'none'
        }} 
      />

      {/* Overdue Care Alert Badge */}
      {overdueCount > 0 && (
        <div 
          style={{ 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FECACA', 
            padding: '8px 12px', 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer', 
            zIndex: 2 
          }} 
          onClick={() => navigate('/calendar')}
        >
          <AlertTriangle size={16} color="#DC2626" />
          <span style={{ fontSize: '0.8rem', color: '#B91C1C', fontWeight: 800 }}>지연된 병원/접종 일정이 {overdueCount}건 있습니다.</span>
        </div>
      )}

      {/* Main Pet Hero Banner Content */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
        {/* Left Side: Header Labels & Large Pet Name */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            오늘의 케어
          </span>
          <h2 style={{ 
            fontSize: isScrolled ? '1.3rem' : '1.8rem', 
            fontWeight: 800, 
            color: 'var(--text-main)', 
            margin: '0 0 4px 0', 
            lineHeight: 1.1,
            transition: 'all 0.3s ease'
          }}>
            {activePet.name}
          </h2>

          {!isScrolled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--main-primary)', fontWeight: 800, backgroundColor: 'var(--main-primary-light)', padding: '3px 10px', borderRadius: '12px' }}>
                {activePet.breed}
              </span>
              {activePet.weight && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 800, backgroundColor: '#F8F7F3', padding: '3px 10px', borderRadius: '12px', border: '1px solid var(--onda-border-light)' }}>
                  {activePet.weight}kg
                </span>
              )}
              {calculateAge(activePet.birth) && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {calculateAge(activePet.birth)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Large Character Pet Avatar & Edit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            onClick={() => navigate(`/profile?id=${activePet.id}`)}
            style={{
              width: isScrolled ? '46px' : '68px',
              height: isScrolled ? '46px' : '68px',
              borderRadius: '50%',
              border: '3px solid var(--main-primary)',
              padding: '2px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 6px 18px rgba(92, 113, 94, 0.25)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <img 
              src={activePet.image || '/default_paw.png'} 
              alt={activePet.name} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/default_paw.png' }}
            />
          </div>
          <button
            onClick={() => navigate(`/profile?id=${activePet.id}`)}
            style={{
              backgroundColor: '#F8F7F3',
              color: 'var(--text-main)',
              border: '1px solid var(--onda-border)',
              padding: '6px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
