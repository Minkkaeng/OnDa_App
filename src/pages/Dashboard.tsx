import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePetStore } from '../store/petStore';
import { ProfileCard } from '../components/ProfileCard';
import { WalkTimer } from '../components/WalkTimer';
import AdBanner from '../components/common/AdBanner';
import CareGuideBanner from '../components/common/CareGuideBanner';
import { DashboardManageModal } from '../components/DashboardManageModal';
import { Calendar as CalendarIcon, FileText, Footprints, Stethoscope, Sparkles, Pill, Settings, BookOpen } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    pets, activePetId, events
  } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  
  const [selectedTile, setSelectedTile] = useState<'diary' | 'walk' | 'hospital' | 'schedule' | 'ai' | 'medication'>('diary');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showWalkTimer, setShowWalkTimer] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    const contentEl = document.querySelector('.content-center');
    if (!contentEl) return;
    const handleScroll = () => {
      if (contentEl.scrollTop > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    contentEl.addEventListener('scroll', handleScroll);
    return () => contentEl.removeEventListener('scroll', handleScroll);
  }, []);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();


  const quickTiles: { id: 'diary' | 'walk' | 'hospital' | 'schedule' | 'ai' | 'medication'; label: string; icon: React.ReactNode }[] = [
    { id: 'diary', label: '일기기록', icon: <FileText size={20} color="var(--main-primary)" /> },
    { id: 'walk', label: '산책기록', icon: <Footprints size={20} color="var(--main-primary)" /> },
    { id: 'hospital', label: '의료기록', icon: <Stethoscope size={20} color="var(--main-primary)" /> },
    { id: 'schedule', label: '케어일정', icon: <CalendarIcon size={20} color="var(--main-primary)" /> },
    { id: 'ai', label: 'AI가이드', icon: <Sparkles size={20} color="var(--main-primary)" /> },
    { id: 'medication', label: '약/영양제', icon: <Pill size={20} color="var(--main-primary)" /> }
  ];

  return (
    <>
      <div className="tab-content-fade" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* 상단 프로필 카드 (스크롤 시 자동으로 축소/접힘) */}
        <ProfileCard isScrolled={isScrolled} />

        {/* 상단 프로필 바로 아래 광고 배너 */}
        <AdBanner />

        {/* 6가지 퀵 바로가기 타일 (구조 최적화) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
          {/* 상단 메인 기능 (일기, 산책) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            {quickTiles.slice(0, 2).map((tile) => {
              const isSelected = selectedTile === tile.id;
              return (
                <div 
                  key={tile.id}
                  onClick={() => setSelectedTile(tile.id)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    border: isSelected ? `1.5px solid var(--main-primary)` : `1.5px solid var(--border-color)`,
                    boxShadow: isSelected ? '0 4px 12px rgba(74, 59, 50, 0.15), inset 0 0 0 1px var(--main-primary)' : '0 2px 8px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--butter-cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tile.icon}
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {tile.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* 하단 서브 기능 (나머지 4개) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
            {quickTiles.slice(2).map((tile) => {
              const isSelected = selectedTile === tile.id;
              return (
                <div 
                  key={tile.id}
                  onClick={() => setSelectedTile(tile.id)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '14px',
                    padding: '10px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: isSelected ? `1px solid var(--main-primary)` : `1px solid var(--border-color)`,
                    boxShadow: isSelected ? '0 4px 8px rgba(74, 59, 50, 0.1), inset 0 0 0 1px var(--main-primary)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--butter-cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {React.cloneElement(tile.icon as React.ReactElement<any>, { size: 16 })}
                  </div>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    textAlign: 'center',
                    letterSpacing: '-0.3px'
                  }}>
                    {tile.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 선택된 타일의 실시간 최근 기록 미리보기 카드 */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '18px',
          padding: '14px 16px',
          boxShadow: 'var(--shadow-card)',
          border: '1.5px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          animation: 'fadeInTab 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {selectedTile === 'diary' && '최근 소중한 일기 기록'}
              {selectedTile === 'walk' && '최근 산책 활동 기록'}
              {selectedTile === 'hospital' && '최근 백신 및 병원 의료 기록'}
              {selectedTile === 'schedule' && '오늘의 케어 일정'}
              {selectedTile === 'ai' && 'AI 건강 & 변 분석 리포트'}
              {selectedTile === 'medication' && '등록된 투약 & 알레르기 관리'}
            </span>
            <button 
              type="button"
              onClick={() => setShowManageModal(true)}
              style={{ background: 'var(--card-bg)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Settings size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedTile === 'diary' && (() => {
            const recentDiary = events.filter(e => e.petId === activePet.id && e.type === 'diary').sort((a, b) => b.date.localeCompare(a.date))[0];
            if (!recentDiary) return <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>아직 남긴 일기가 없습니다. 오늘 첫 이야기를 작성해보세요!</p>;
            return (
              <div 
                onClick={() => navigate('/diary')}
                style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#FFF0F3', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #FFD6E0' }}
              >
                {recentDiary.imageUrl ? (
                  <img src={recentDiary.imageUrl} alt="Diary" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--main-primary)' }}>
                    <BookOpen size={24} />
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{recentDiary.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{recentDiary.date}</span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)', 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal'
                  }}>
                    {recentDiary.content}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* 2. 산책 기록 */}
          {selectedTile === 'walk' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ECFDF5', padding: '10px 14px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065F46' }}>오늘 산책 목표: {activePet.walkDuration || activePet.walkGoal || '30분'}</span>
                <span style={{ fontSize: '0.75rem', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>하루 권장 운동량을 채워 아이의 건강을 지켜주세요! <Footprints size={12} /></span>
              </div>
              <button onClick={() => setShowWalkTimer(true)} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>산책 시작</button>
            </div>
          )}

          {/* 3. 의료 기록 */}
          {selectedTile === 'hospital' && (() => {
            const hospitalEvents = events.filter(e => e.petId === activePet.id && e.type === 'hospital').sort((a, b) => b.date.localeCompare(a.date));
            const latest = hospitalEvents[0];
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FEF3C7', padding: '10px 14px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E' }}>{latest ? `최근 진료: ${latest.title} (${latest.date})` : '등록된 최근 병원 진료 기록이 없습니다.'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#B45309' }}>주치 병원: {activePet.hospitalName || '미지정'}</span>
                </div>
                <button onClick={() => navigate('/care')} style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>접종/병원</button>
              </div>
            );
          })()}

          {/* 4. 케어 일정 */}
          {selectedTile === 'schedule' && (() => {
            const todayEvts = events.filter(e => e.petId === activePet.id && e.date === todayStr);
            return (
              <div style={{ backgroundColor: '#EFF6FF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>오늘 케어 일정 ({todayEvts.length}건 예정)</span>
                {todayEvts.length === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: '#1D4ED8' }}>오늘 추가 예정된 주요 일정이 없습니다.</span>
                ) : (
                  todayEvts.slice(0, 2).map(ev => (
                    <div key={ev.id} style={{ fontSize: '0.8rem', color: '#1E3A8A', fontWeight: 700 }}>• {ev.title}</div>
                  ))
                )}
              </div>
            );
          })()}

          {/* 5. AI 가이드 */}
          {selectedTile === 'ai' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F3FF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#5B21B6' }}>AI 변 건강 상태 분석 리포트</span>
                <span style={{ fontSize: '0.75rem', color: '#6D28D9' }}>사진 촬영 시 대변 성상 & 건강 이상징후 AI 즉시 진단</span>
              </div>
              <button onClick={() => navigate('/care')} style={{ backgroundColor: '#8B5CF6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>AI 분석</button>
            </div>
          )}

          {/* 6. 약/영양제 */}
          {selectedTile === 'medication' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EEF2FF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #C7D2FE' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3730A3' }}>복용 약/영양제: {activePet.medications || '유산균, 관절 영양제'}</span>
                <span style={{ fontSize: '0.75rem', color: '#4338CA' }}>주의 알레르기: {activePet.allergies || '없음'}</span>
              </div>
              <button onClick={() => navigate('/profile')} style={{ backgroundColor: '#6366F1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>수정</button>
            </div>
          )}
          </div>
        </div>

        {/* 초보 반려인 케어 가이드 슬라이더 */}
        <CareGuideBanner style={{ marginTop: '16px' }} />

        {showWalkTimer && <WalkTimer onClose={() => setShowWalkTimer(false)} />}
      </div>

      <DashboardManageModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        selectedTile={selectedTile}
        activePetId={activePet.id}
      />
    </>
  );
};

export default Dashboard;
