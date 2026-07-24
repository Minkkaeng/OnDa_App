import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePetStore } from '../store/petStore';
import { ProfileCard } from '../components/ProfileCard';
import AdBanner from '../components/common/AdBanner';
import BottomSheet from '../components/common/BottomSheet';
import { CheckCircle2, Calendar as CalendarIcon, ChevronDown, FileText, Footprints, Stethoscope, Sparkles, Pill, Utensils, Droplet, Cookie, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    addCalendarEvent, pets, activePetId, events, showAlert
  } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  
  const [activeCategory, setActiveCategory] = useState<'stool' | 'meal' | 'water' | 'snack' | null>(null);
  const [selectedTile, setSelectedTile] = useState<'diary' | 'walk' | 'hospital' | 'schedule' | 'ai' | 'medication'>('diary');
  
  // New Array-based States
  const [meals, setMeals] = useState<{time: string, amount: string}[]>([]);
  const [waters, setWaters] = useState<{time: string, amount: number}[]>([]);
  const [snacks, setSnacks] = useState<{time: string, name: string}[]>([]);
  const [stools, setStools] = useState<{time: string, status: string}[]>([]);

  // Scroll position state for Collapsible Top Profile Header
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Accordion Card States
  const [isHealthOpen, setIsHealthOpen] = useState(true);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();

  // Load saved multi-records
  useEffect(() => {
    if (activePetId) {
      const loadArr = (key: string) => {
        const saved = localStorage.getItem(`onda_${key}_${activePetId}_${todayStr}`);
        return saved ? JSON.parse(saved) : [];
      };
      setMeals(loadArr('meals'));
      setWaters(loadArr('waters'));
      setSnacks(loadArr('snacks'));
      setStools(loadArr('stools'));
    }
  }, [activePetId, todayStr]);

  // Save specific array to local storage
  const saveArr = (key: string, arr: any[]) => {
    if (!activePetId) return;
    localStorage.setItem(`onda_${key}_${activePetId}_${todayStr}`, JSON.stringify(arr));
  };

  const getCurrentTimeStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleAddMeal = (amount: string) => {
    const newRecord = { time: getCurrentTimeStr(), amount };
    const updated = [...meals, newRecord];
    setMeals(updated);
    saveArr('meals', updated);
  };

  const handleAddWater = (amount: number) => {
    const newRecord = { time: getCurrentTimeStr(), amount };
    const updated = [...waters, newRecord];
    setWaters(updated);
    saveArr('waters', updated);
  };

  const handleAddSnack = (name: string) => {
    const newRecord = { time: getCurrentTimeStr(), name };
    const updated = [...snacks, newRecord];
    setSnacks(updated);
    saveArr('snacks', updated);
  };

  const handleAddStool = (status: string) => {
    const newRecord = { time: getCurrentTimeStr(), status };
    const updated = [...stools, newRecord];
    setStools(updated);
    saveArr('stools', updated);
  };

  const handleSaveHealthCheck = async () => {
    if (!activePet) return;
    
    const totalWater = waters.reduce((acc, curr) => acc + curr.amount, 0);
    const mealTexts = meals.map(m => `[${m.time}] ${m.amount}`).join(', ');
    const stoolTexts = stools.map(s => `[${s.time}] ${s.status}`).join(', ');
    const snackTexts = snacks.map(s => `[${s.time}] ${s.name}`).join(', ');

    await addCalendarEvent({
      petId: activePet.id,
      date: todayStr,
      type: 'diary',
      category: '건강',
      title: '오늘의 종합 건강 리포트',
      content: `• 식사 기록: ${meals.length > 0 ? mealTexts : '기록 없음'}\n• 음수량: 총 ${totalWater}ml (${waters.length}회)\n• 간식 기록: ${snacks.length > 0 ? snackTexts : '기록 없음'}\n• 배변 기록: ${stools.length > 0 ? stoolTexts : '기록 없음'}`
    });

    showAlert('오늘의 건강 체크 기록이 일기장(기록) 탭에 성공적으로 저장되었습니다!');
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 상단 메인 기능 (일기, 산책) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {quickTiles.slice(0, 2).map((tile) => {
              const isSelected = selectedTile === tile.id;
              return (
                <div 
                  key={tile.id}
                  onClick={() => setSelectedTile(tile.id)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    border: isSelected ? `2.5px solid var(--main-primary)` : `1.5px solid var(--border-color)`,
                    boxShadow: isSelected ? '0 4px 12px rgba(74, 59, 50, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {quickTiles.slice(2).map((tile) => {
              const isSelected = selectedTile === tile.id;
              return (
                <div 
                  key={tile.id}
                  onClick={() => setSelectedTile(tile.id)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '14px',
                    padding: '10px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: isSelected ? `2px solid var(--main-primary)` : `1px solid var(--border-color)`,
                    boxShadow: isSelected ? '0 4px 8px rgba(74, 59, 50, 0.1)' : 'none',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
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
                    {React.cloneElement(tile.icon as React.ReactElement, { size: 16 })}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
              onClick={() => {
                if (selectedTile === 'diary') navigate('/diary');
                else if (selectedTile === 'walk') navigate('/calendar');
                else if (selectedTile === 'hospital') navigate('/care');
                else if (selectedTile === 'schedule') navigate('/calendar');
                else if (selectedTile === 'ai') navigate('/care');
                else if (selectedTile === 'medication') navigate('/profile');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--main-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              전체보기
            </button>
          </div>

          {/* 1. 일기 기록 */}
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
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📖</div>
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
                <span style={{ fontSize: '0.75rem', color: '#047857' }}>하루 권장 운동량을 채워 아이의 건강을 지켜주세요! 🏃</span>
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

        {/* 1. 오늘의 건강 체크 - 아코디언 카드 */}
        <div className="panel" style={{ padding: '14px 16px', borderRadius: '20px', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(13, 148, 136, 0.15)', transition: 'all 0.2s ease' }}>
          {/* Clickable Header Row */}
          <div 
            onClick={() => setIsHealthOpen(!isHealthOpen)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} color="var(--main-primary)" fill="var(--butter-cream)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>오늘의 리포트</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isHealthOpen && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--main-primary)', backgroundColor: 'var(--butter-cream)', padding: '3px 10px', borderRadius: '12px' }}>
                  {meals.length > 0 || waters.length > 0 || snacks.length > 0 || stools.length > 0 ? '리포트 작성됨' : '미작성'}
                </span>
              )}
              <div style={{ transform: isHealthOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'flex', alignItems: 'center' }}>
                <ChevronDown size={20} color="var(--text-muted)" />
              </div>
            </div>
          </div>

          {/* Collapsible Body Content */}
          {isHealthOpen && (
            <div style={{ marginTop: '16px', animation: 'fadeInTab 0.2s ease-out' }}>
              
              {/* 2x2 Pastel Health Report Cards (사료 🍖, 물 💧, 간식 🍪, 배변 💩) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                
                {/* Card 1: 사료/식사 */}
                <div 
                  onClick={() => setActiveCategory('meal')}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ backgroundColor: 'var(--butter-yellow)', padding: '6px 8px', borderRadius: '10px' }}>
                    <Utensils size={20} color="#B45309" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 700 }}>식사/사료</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>
                    {meals.length > 0 ? `총 ${meals.length}회 급여` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8 }}>기록 변경</span>
                </div>

                {/* Card 2: 물/음수량 */}
                <div 
                  onClick={() => setActiveCategory('water')}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ backgroundColor: 'var(--butter-yellow)', padding: '6px 8px', borderRadius: '10px' }}>
                    <Droplet size={20} color="#0284C7" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 700 }}>음수량</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>
                    {waters.length > 0 ? `총 ${waters.reduce((acc, curr) => acc + curr.amount, 0)}ml` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8 }}>기록 및 수정</span>
                </div>

                {/* Card 3: 간식 */}
                <div 
                  onClick={() => setActiveCategory('snack')}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ backgroundColor: 'var(--butter-cream)', padding: '6px 8px', borderRadius: '10px' }}>
                    <Cookie size={20} color="#92400E" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 700 }}>간식</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>
                    {snacks.length > 0 ? `총 ${snacks.length}회 급여` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8 }}>상세 기록</span>
                </div>

                {/* Card 4: 배변 */}
                <div 
                  onClick={() => setActiveCategory('stool')}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ backgroundColor: 'var(--butter-cream)', padding: '6px 8px', borderRadius: '10px' }}>
                    <Activity size={20} color="#9D174D" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 700 }}>배변 상태</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>
                    {stools.length > 0 ? `총 ${stools.length}회 배변` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#9D174D', opacity: 0.8 }}>상태 기록</span>
                </div>

              </div>

              {/* Save Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>

                <button
                  type="button"
                  onClick={handleSaveHealthCheck}
                  style={{
                    backgroundColor: 'var(--main-primary)',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 건강 카테고리 입력을 위한 바텀시트 */}
      <BottomSheet 
        isOpen={activeCategory !== null} 
        onClose={() => setActiveCategory(null)}
        title={
          activeCategory === 'stool' ? '배변 상태 기록 & AI 분석' :
          activeCategory === 'meal' ? '식사 및 사료 기록' :
          activeCategory === 'water' ? '음수량 체크 & 기록' :
          activeCategory === 'snack' ? '간식 & 영양제 복용 체크' :
          activeCategory === 'energy' ? '활력 컨디션 기록' : ''
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
          
          {/* Stool List & Options */}
          {activeCategory === 'stool' && (
            <>
              {stools.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>오늘의 배변 기록</h4>
                  {stools.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.time}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--main-primary)', fontWeight: 800 }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {['정상', '무른변', '변비'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleAddStool(status)}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--butter-cream)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800,
                      color: 'var(--text-main)'
                    }}
                  >
                    + {status}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  navigate('/care');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px', borderRadius: '14px', backgroundColor: '#8B5CF6', color: 'white',
                  border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  marginTop: '8px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                }}
              >
                AI 변 사진 분석 카메라 열기 (케어 탭)
              </button>
            </>
          )}

          {/* Water Intake Controls */}
          {activeCategory === 'water' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0284C7' }}>{waters.reduce((a,c) => a + c.amount, 0)} ml</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#075985', backgroundColor: '#E0F2FE', padding: '4px 10px', borderRadius: '12px' }}>
                  총 {waters.length}회 섭취
                </span>
              </div>
              
              {waters.length > 0 && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                  {waters.map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.time}</span>
                      <span style={{ fontSize: '0.85rem', color: '#0284C7', fontWeight: 800 }}>+{w.amount}ml</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
                {[50, 100, 150, 200].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddWater(val)}
                    style={{
                      padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)',
                      backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    +{val}ml
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Snack Checklist */}
          {activeCategory === 'snack' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {snacks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>오늘 급여한 간식</h4>
                  {snacks.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.time}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--main-primary)', fontWeight: 800 }}>{s.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {['육포', '개껌', '동결건조', '츄르'].map(snack => (
                  <button
                    key={snack}
                    type="button"
                    onClick={() => handleAddSnack(snack)}
                    style={{
                      padding: '12px 8px', borderRadius: '12px', border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--butter-cream)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800,
                      color: 'var(--text-main)'
                    }}
                  >
                    + {snack}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meal Options */}
          {activeCategory === 'meal' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {meals.length > 0 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>오늘의 식사 기록</h4>
                 {meals.map((m, idx) => (
                   <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                     <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.time}</span>
                     <span style={{ fontSize: '0.85rem', color: 'var(--main-primary)', fontWeight: 800 }}>{m.amount}</span>
                   </div>
                 ))}
               </div>
             )}

             <div style={{ display: 'flex', gap: '8px' }}>
               {['완식', '보통', '남김'].map(amount => (
                 <button
                   key={amount}
                   type="button"
                   onClick={() => handleAddMeal(amount)}
                   style={{
                     flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px solid var(--border-color)',
                     backgroundColor: 'var(--butter-cream)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800,
                     color: 'var(--text-main)'
                   }}
                 >
                   + {amount}
                 </button>
               ))}
             </div>
           </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
};

export default Dashboard;
