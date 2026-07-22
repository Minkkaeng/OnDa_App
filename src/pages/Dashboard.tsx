import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePetStore } from '../store/petStore';
import { ProfileCard } from '../components/ProfileCard';
import AdBanner from '../components/common/AdBanner';
import BottomSheet from '../components/common/BottomSheet';
import { CheckCircle2, Calendar as CalendarIcon, ChevronDown, FileText, Footprints, Stethoscope, Sparkles, Pill } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    addCalendarEvent, pets, activePetId, events, showAlert
  } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  
  const [activeCategory, setActiveCategory] = useState<'stool' | 'meal' | 'energy' | 'water' | 'snack' | null>(null);
  const [selectedTile, setSelectedTile] = useState<'diary' | 'walk' | 'hospital' | 'schedule' | 'ai' | 'medication'>('diary');
  const [waterIntake, setWaterIntake] = useState<number>(250);
  const [snackItems, setSnackItems] = useState<{ [key: string]: boolean }>({
    probiotic: true,
    joint: true,
    treat: false,
    dental: false
  });

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
  const [dailyHealth, setDailyHealth] = useState<{ stool?: string; meal?: string; energy?: string }>({});

  useEffect(() => {
    if (activePetId) {
      const saved = localStorage.getItem(`onda_daily_health_${activePetId}_${todayStr}`);
      if (saved) {
        try {
          setDailyHealth(JSON.parse(saved));
        } catch {
          setDailyHealth({});
        }
      } else {
        setDailyHealth({});
      }
    }
  }, [activePetId, todayStr]);

  const handleToggleHealth = (category: 'stool' | 'meal' | 'energy', value: string) => {
    if (!activePetId) return;
    const updated = { ...dailyHealth, [category]: dailyHealth[category] === value ? undefined : value };
    setDailyHealth(updated);
    localStorage.setItem(`onda_daily_health_${activePetId}_${todayStr}`, JSON.stringify(updated));
  };

  const handleSaveHealthCheck = async () => {
    if (!activePet) return;
    
    // Check if at least one category has a value selected
    if (!dailyHealth.stool && !dailyHealth.meal && !dailyHealth.energy) {
      showAlert('최소 한 가지 항목은 선택하고 저장해 주세요!');
      return;
    }

    const stoolText = 
      dailyHealth.stool === 'good' ? '정상' : 
      dailyHealth.stool === 'loose' ? '설사' : 
      dailyHealth.stool === 'hard' ? '변비' : '기록 없음';
      
    const mealText = 
      dailyHealth.meal === 'full' ? '완식' : 
      dailyHealth.meal === 'half' ? '보통' : 
      dailyHealth.meal === 'none' ? '남김' : '기록 없음';
      
    const energyText = 
      dailyHealth.energy === 'active' ? '좋음' : 
      dailyHealth.energy === 'normal' ? '보통' : 
      dailyHealth.energy === 'low' ? '기운없음' : '기록 없음';

    await addCalendarEvent({
      petId: activePet.id,
      date: todayStr,
      type: 'diary',
      category: '건강',
      title: '오늘의 건강 체크 기록',
      content: `오늘의 일일 건강 체크 결과입니다.\n\n• 배변 상태: ${stoolText}\n• 식사 및 음수량: ${mealText}\n• 활력 컨디션: ${energyText}`
    });

    showAlert('오늘의 건강 체크 기록이 일기장(기록) 탭에 성공적으로 저장되었습니다!');
  };

  const quickTiles: { id: 'diary' | 'walk' | 'hospital' | 'schedule' | 'ai' | 'medication'; label: string; icon: React.ReactNode; bg: string; border: string }[] = [
    { id: 'diary', label: '일기기록', icon: <FileText size={20} color="#FF6B81" />, bg: '#FFF0F3', border: '#FFD6E0' },
    { id: 'walk', label: '산책기록', icon: <Footprints size={20} color="#10B981" />, bg: '#ECFDF5', border: '#A7F3D0' },
    { id: 'hospital', label: '의료기록', icon: <Stethoscope size={20} color="#F59E0B" />, bg: '#FEF3C7', border: '#FDE68A' },
    { id: 'schedule', label: '케어일정', icon: <CalendarIcon size={20} color="#3B82F6" />, bg: '#EFF6FF', border: '#BFDBFE' },
    { id: 'ai', label: 'AI가이드', icon: <Sparkles size={20} color="#8B5CF6" />, bg: '#F5F3FF', border: '#DDD6FE' },
    { id: 'medication', label: '약/영양제', icon: <Pill size={20} color="#6366F1" />, bg: '#EEF2FF', border: '#C7D2FE' }
  ];

  return (
    <>
      <div className="tab-content-fade" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* 상단 프로필 카드 (스크롤 시 자동으로 축소/접힘) */}
        <ProfileCard isScrolled={isScrolled} />

        {/* 상단 프로필 바로 아래 광고 배너 */}
        <AdBanner />

        {/* 6가지 퀵 바로가기 타일 (3x2 Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {quickTiles.map((tile) => {
            const isSelected = selectedTile === tile.id;
            return (
              <div 
                key={tile.id}
                onClick={() => setSelectedTile(tile.id)}
                style={{
                  backgroundColor: isSelected ? tile.bg : 'var(--white)',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: isSelected ? `2.5px solid ${tile.border}` : `1.5px solid ${tile.border}`,
                  boxShadow: isSelected ? '0 4px 12px rgba(13, 148, 136, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: tile.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {tile.icon}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--deep-navy)' }}>
                  {tile.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 선택된 타일의 실시간 최근 기록 미리보기 카드 */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: '18px',
          padding: '14px 16px',
          boxShadow: 'var(--shadow-card)',
          border: '1.5px solid var(--steel-gray)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          animation: 'fadeInTab 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {selectedTile === 'diary' && '✍️ 최근 소중한 일기 기록'}
              {selectedTile === 'walk' && '🐕 최근 산책 활동 기록'}
              {selectedTile === 'hospital' && '🏥 최근 백신 및 병원 의료 기록'}
              {selectedTile === 'schedule' && '🗓️ 오늘의 케어 일정'}
              {selectedTile === 'ai' && '🤖 AI 건강 & 변 분석 리포트'}
              {selectedTile === 'medication' && '💊 등록된 투약 & 알레르기 관리'}
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
              style={{ background: 'none', border: 'none', color: 'var(--mint-green)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              전체보기 ➔
            </button>
          </div>

          {/* 1. 일기 기록 */}
          {selectedTile === 'diary' && (() => {
            const recentDiary = events.filter(e => e.petId === activePet.id && e.type === 'diary').sort((a, b) => b.date.localeCompare(a.date))[0];
            if (!recentDiary) return <p style={{ fontSize: '0.8rem', color: 'var(--muted-gray)', margin: 0 }}>아직 남긴 일기가 없습니다. 오늘 첫 이야기를 작성해보세요! ✨</p>;
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
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{recentDiary.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-gray)' }}>{recentDiary.date}</span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--muted-gray)', 
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
              <button onClick={() => navigate('/care')} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>산책 기록 ➔</button>
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
                <button onClick={() => navigate('/care')} style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>접종/병원 ➔</button>
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
                  <span style={{ fontSize: '0.75rem', color: '#1D4ED8' }}>오늘 추가 예정된 주요 일정이 없습니다. ✨</span>
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
              <button onClick={() => navigate('/care')} style={{ backgroundColor: '#8B5CF6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>AI 분석 ➔</button>
            </div>
          )}

          {/* 6. 약/영양제 */}
          {selectedTile === 'medication' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EEF2FF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #C7D2FE' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3730A3' }}>복용 약/영양제: {activePet.medications || '유산균, 관절 영양제'}</span>
                <span style={{ fontSize: '0.75rem', color: '#4338CA' }}>주의 알레르기: {activePet.allergies || '없음'}</span>
              </div>
              <button onClick={() => navigate('/profile')} style={{ backgroundColor: '#6366F1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>수정 ➔</button>
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
              <CheckCircle2 size={20} color="var(--mint-green)" fill="var(--mint-green-light)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--deep-navy)' }}>오늘의 리포트</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isHealthOpen && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mint-green)', backgroundColor: 'var(--mint-green-light)', padding: '3px 10px', borderRadius: '12px' }}>
                  {dailyHealth.stool || dailyHealth.meal || dailyHealth.energy ? '리포트 작성됨 ✓' : '미작성'}
                </span>
              )}
              <div style={{ transform: isHealthOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'flex', alignItems: 'center' }}>
                <ChevronDown size={20} color="var(--muted-gray)" />
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
                    backgroundColor: '#FFF5EE',
                    border: '1.5px solid #FFD8BE',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>🍖</span>
                  <span style={{ fontSize: '0.8rem', color: '#9A3412', fontWeight: 700 }}>식사/사료</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#C2410C' }}>
                    {dailyHealth.meal === 'full' ? '완식 🍖' : dailyHealth.meal === 'half' ? '보통 🥣' : dailyHealth.meal === 'none' ? '남김 ⚠️' : '0회'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#9A3412', opacity: 0.8 }}>기록 변경 ➔</span>
                </div>

                {/* Card 2: 물/음수량 */}
                <div 
                  onClick={() => setActiveCategory('water')}
                  style={{
                    backgroundColor: '#F0F9FF',
                    border: '1.5px solid #BAE6FD',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>💧</span>
                  <span style={{ fontSize: '0.8rem', color: '#075985', fontWeight: 700 }}>음수량</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284C7' }}>
                    {waterIntake}ml {waterIntake >= 250 ? '💧' : '⚠️'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#075985', opacity: 0.8 }}>기록 및 수정 ➔</span>
                </div>

                {/* Card 3: 간식/영양제 */}
                <div 
                  onClick={() => setActiveCategory('snack')}
                  style={{
                    backgroundColor: '#FEFCE8',
                    border: '1.5px solid #FEF08A',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>🍪</span>
                  <span style={{ fontSize: '0.8rem', color: '#854D0E', fontWeight: 700 }}>간식 / 영양제</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#CA8A04' }}>
                    {Object.values(snackItems).filter(Boolean).length}개 복용 챙김 ✨
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#854D0E', opacity: 0.8 }}>영양제 체크 ➔</span>
                </div>

                {/* Card 4: 배변 */}
                <div 
                  onClick={() => setActiveCategory('stool')}
                  style={{
                    backgroundColor: '#FDF2F8',
                    border: '1.5px solid #FBCFE8',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>💩</span>
                  <span style={{ fontSize: '0.8rem', color: '#9D174D', fontWeight: 700 }}>배변 상태</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#DB2777' }}>
                    {dailyHealth.stool === 'good' ? '정상 💩' : dailyHealth.stool === 'loose' ? '설사 ⚠️' : dailyHealth.stool === 'hard' ? '변비 ⚠️' : '0회'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#9D174D', opacity: 0.8 }}>분석 / 기록 ➔</span>
                </div>

              </div>

              {/* Summary List Box */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                backgroundColor: 'var(--ice-white)',
                padding: '12px 14px',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  color: 'var(--muted-gray)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px',
                  flex: 1
                }}>
                  <p style={{ margin: 0, display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--mint-green)', fontWeight: 800 }}>•</span> 
                    <span>배변 상태: {
                      dailyHealth.stool === 'good' ? '정상' : 
                      dailyHealth.stool === 'loose' ? '설사' : 
                      dailyHealth.stool === 'hard' ? '변비' : 
                      <span style={{ color: 'var(--muted-gray)', opacity: 0.65 }}>기록 없음</span>
                    }</span>
                  </p>
                  <p style={{ margin: 0, display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--mint-green)', fontWeight: 800 }}>•</span> 
                    <span>식사 및 음수량: {
                      dailyHealth.meal === 'full' ? '완식' : 
                      dailyHealth.meal === 'half' ? '보통' : 
                      dailyHealth.meal === 'none' ? '남김' : 
                      <span style={{ color: 'var(--muted-gray)', opacity: 0.65 }}>기록 없음</span>
                    }</span>
                  </p>
                  <p style={{ margin: 0, display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--mint-green)', fontWeight: 800 }}>•</span> 
                    <span>활력 컨디션: {
                      dailyHealth.energy === 'active' ? '좋음' : 
                      dailyHealth.energy === 'normal' ? '보통' : 
                      dailyHealth.energy === 'low' ? '기운없음' : 
                      <span style={{ color: 'var(--muted-gray)', opacity: 0.65 }}>기록 없음</span>
                    }</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveHealthCheck}
                  style={{
                    backgroundColor: 'var(--mint-green)',
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
          activeCategory === 'stool' ? '💩 배변 상태 기록 & AI 분석' :
          activeCategory === 'meal' ? '🍖 식사 및 사료 기록' :
          activeCategory === 'water' ? '💧 음수량 체크 & 기록' :
          activeCategory === 'snack' ? '🍪 간식 & 영양제 복용 체크' :
          activeCategory === 'energy' ? '⚡ 활력 컨디션 기록' : ''
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
          
          {/* Stool Options + AI Camera Link */}
          {activeCategory === 'stool' && (
            <>
              {[
                { value: 'good', label: '정상 💩', desc: '건강하고 단단한 예쁜 대변' },
                { value: 'loose', label: '무른변 / 설사 💧', desc: '묽거나 수분이 많은 대변' },
                { value: 'hard', label: '변비 🪨', desc: '끊기거나 딱딱해서 힘든 대변' }
              ].map(opt => {
                const isSelected = dailyHealth.stool === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      handleToggleHealth('stool', opt.value);
                      setActiveCategory(null);
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '16px', borderRadius: '12px', 
                      border: isSelected ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)',
                      backgroundColor: isSelected ? 'var(--mint-green-light)' : 'var(--white)',
                      cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s',
                      marginTop: 0,
                      whiteSpace: 'normal',
                      wordBreak: 'keep-all'
                    }}
                  >
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{opt.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)', marginTop: '4px' }}>{opt.desc}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  navigate('/care');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '14px',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                }}
              >
                📸 AI 변 사진 분석 카메라 열기 (케어 탭)
              </button>
            </>
          )}

          {/* Water Intake Controls */}
          {activeCategory === 'water' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0284C7' }}>{waterIntake} ml</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#075985', backgroundColor: '#E0F2FE', padding: '4px 10px', borderRadius: '12px' }}>
                  {waterIntake >= 250 ? '권장량 달성 ✨' : '음수 필요 💧'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
                {[100, 200, 300, 500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setWaterIntake(val)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: waterIntake === val ? '2px solid #0284C7' : '1px solid var(--steel-gray)',
                      backgroundColor: waterIntake === val ? '#E0F2FE' : 'var(--white)',
                      color: 'var(--deep-navy)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {val}ml
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => setWaterIntake(prev => prev + 50)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #BAE6FD',
                    backgroundColor: '#F0F9FF',
                    color: '#0284C7',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  + 50ml 추가
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (activePet) {
                      await addCalendarEvent({
                        petId: activePet.id,
                        date: todayStr,
                        type: 'diary',
                        title: '💧 음수량 기록',
                        content: `오늘의 수분 섭취량: ${waterIntake}ml\n${waterIntake >= 250 ? '목표 달성! 잘했어요 ✨' : '조금 더 마셔야 해요 💧'}`
                      });
                    }
                    setActiveCategory(null);
                    showAlert(`음수량 ${waterIntake}ml가 일기장에 저장되었습니다!`);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#0284C7',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  음수량 기록 저장
                </button>
              </div>
            </div>
          )}

          {/* Snack & Supplement Checklist */}
          {activeCategory === 'snack' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'probiotic', label: '💊 유산균', desc: '장 건강 밸런스 유산균 1포' },
                { key: 'joint', label: '🦴 관절 영양제', desc: '슬개골 및 관절 보호 영양제 1알' },
                { key: 'treat', label: '🍗 수제 닭가슴살 간식', desc: '칭찬용 보상 간식 급여' },
                { key: 'dental', label: '🦷 덴탈 스틱', desc: '치석 제거용 껌 1개' }
              ].map(item => {
                const isChecked = snackItems[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => setSnackItems(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px',
                      borderRadius: '12px',
                      border: isChecked ? '2px solid #CA8A04' : '1px solid var(--steel-gray)',
                      backgroundColor: isChecked ? '#FEFCE8' : 'var(--white)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>{item.desc}</span>
                    </div>

                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: isChecked ? '#CA8A04' : '#E2E8F0',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      {isChecked ? '✓' : ''}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={async () => {
                  if (activePet) {
                    const given = Object.entries(snackItems)
                      .filter(([_, v]) => v)
                      .map(([k]) => {
                        if (k === 'probiotic') return '유산균';
                        if (k === 'joint') return '관절 영양제';
                        if (k === 'treat') return '수제 간식';
                        if (k === 'dental') return '덴탈 스틱';
                        return k;
                      });
                    await addCalendarEvent({
                      petId: activePet.id,
                      date: todayStr,
                      type: 'diary',
                      title: '🍪 간식/영양제 기록',
                      content: `오늘 챙겨준 항목:\n${given.length > 0 ? given.join(', ') : '없음'}`
                    });
                  }
                  setActiveCategory(null);
                  showAlert('간식 & 영양제 체크 기록이 일기장에 저장되었습니다!');
                }}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  backgroundColor: '#CA8A04',
                  color: 'white',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                체크 저장 완료 ✨
              </button>
            </div>
          )}

          {/* Meal Options */}
          {activeCategory === 'meal' && [
            { value: 'full', label: '완식 🍖', desc: '남김없이 깨끗하게 다 먹었어요' },
            { value: 'half', label: '보통 🥣', desc: '적당량 남기거나 평소만큼 먹었어요' },
            { value: 'none', label: '남김 ⚠️', desc: '거의 먹지 않거나 다 남겼어요' }
          ].map(opt => {
            const isSelected = dailyHealth.meal === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  handleToggleHealth('meal', opt.value);
                  setActiveCategory(null);
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '16px', borderRadius: '12px', 
                  border: isSelected ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)',
                  backgroundColor: isSelected ? 'var(--mint-green-light)' : 'var(--white)',
                  cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s',
                  marginTop: 0,
                  whiteSpace: 'normal',
                  wordBreak: 'keep-all'
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{opt.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)', marginTop: '4px' }}>{opt.desc}</span>
              </button>
            );
          })}

          {/* Energy Options */}
          {activeCategory === 'energy' && [
            { value: 'active', label: '좋음 ⚡', desc: '평소보다 에너지가 넘치고 신나요' },
            { value: 'normal', label: '보통 💤', desc: '늘 그렇듯 얌전하고 편안해요' },
            { value: 'low', label: '기운없음 🤒', desc: '쳐져 있고 힘이 없어 보여요' }
          ].map(opt => {
            const isSelected = dailyHealth.energy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  handleToggleHealth('energy', opt.value);
                  setActiveCategory(null);
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '16px', borderRadius: '12px', 
                  border: isSelected ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)',
                  backgroundColor: isSelected ? 'var(--mint-green-light)' : 'var(--white)',
                  cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s',
                  marginTop: 0,
                  whiteSpace: 'normal',
                  wordBreak: 'keep-all'
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{opt.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)', marginTop: '4px' }}>{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
};

export default Dashboard;
