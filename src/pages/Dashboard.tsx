import React, { useState, useEffect } from 'react';

import { usePetStore } from '../store/petStore';
import AdBanner from '../components/common/AdBanner';
import BottomSheet from '../components/common/BottomSheet';
import { CheckCircle2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    addCalendarEvent, pets, activePetId, showAlert,
    walkState, walkElapsedSec, walkTargetMin, setWalkState, setWalkElapsedSec, setWalkTargetMin
  } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  
  const [activeCategory, setActiveCategory] = useState<'stool' | 'meal' | 'energy' | null>(null);

  // 초기화면(프로필)에서 설정한 산책 목표 시간을 대시보드 산책 기록에 연동
  useEffect(() => {
    if (activePet) {
      const goalStr = activePet.walkDuration || activePet.walkGoal || '';
      const match = goalStr.match(/(\d+)/);
      if (match) {
        setWalkTargetMin(parseInt(match[1], 10));
      }
    }
  }, [activePet, setWalkTargetMin]);

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

  // Walk timer 1-second interval
  useEffect(() => {
    let interval: any = null;
    if (walkState === 'running') {
      interval = setInterval(() => {
        setWalkElapsedSec((prev: number) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [walkState, setWalkElapsedSec]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getRemainingSec = () => {
    const totalTargetSec = walkTargetMin * 60;
    return totalTargetSec - walkElapsedSec;
  };

  const remainingSec = getRemainingSec();

  const formatCountdownTime = (remSec: number) => {
    if (remSec < 0) {
      const overtime = Math.abs(remSec);
      const m = Math.floor(overtime / 60).toString().padStart(2, '0');
      const s = (overtime % 60).toString().padStart(2, '0');
      return `+${m}:${s}`;
    }
    const m = Math.floor(remSec / 60).toString().padStart(2, '0');
    const s = (remSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartWalk = () => {
    if (walkState === 'idle') {
      setWalkElapsedSec(0);
      setWalkState('running');
    } else if (walkState === 'running') {
      setWalkState('paused');
    } else if (walkState === 'paused') {
      setWalkState('running');
    }
  };

  const handleFinishWalk = async () => {
    if (!activePet) return;
    const formattedWalkTime = formatTime(walkElapsedSec);
    const totalTargetSec = walkTargetMin * 60;
    
    let contentDetail = '';
    if (walkElapsedSec > totalTargetSec) {
      const overtimeSec = walkElapsedSec - totalTargetSec;
      const formattedOvertime = formatTime(overtimeSec);
      contentDetail = `총 산책 시간: ${formattedWalkTime} (목표 ${walkTargetMin}분 + 추가 ${formattedOvertime})`;
    } else {
      contentDetail = `총 산책 시간: ${formattedWalkTime} / 목표 시간: ${walkTargetMin}분`;
    }

    await addCalendarEvent({
      petId: activePet.id,
      date: todayStr,
      type: 'diary',
      title: '산책 완료',
      content: contentDetail
    });
    showAlert(`산책 기록이 캘린더에 저장되었습니다!\n\n${contentDetail}`);
    setWalkState('idle');
    setWalkElapsedSec(0);
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





  return (
    <>


      <div className="tab-content-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 오늘의 건강 체크 - 이미지 1 디자인 스타일 접목 */}
        <div className="panel" style={{ padding: '24px 20px', borderRadius: '20px', boxShadow: 'var(--shadow-card)', borderTop: '5px solid var(--mint-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--deep-navy)' }}>오늘의 건강 체크</h3>
            <CheckCircle2 size={18} color="var(--mint-green)" fill="var(--mint-green-light)" />
          </div>

          {/* 3 Circles Grid Row (식인증 마크 디자인 스타일) */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
            
            {/* Circle 1: Stool */}
            <div 
              onClick={() => setActiveCategory('stool')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: dailyHealth.stool ? 'var(--white)' : '#EEF2F6',
                border: dailyHealth.stool ? '2.5px solid var(--mint-green)' : '1.5px solid var(--steel-gray)',
                boxShadow: dailyHealth.stool ? '0 4px 12px rgba(20, 195, 163, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: dailyHealth.stool ? 'var(--mint-green)' : 'var(--deep-navy)' }}>배변</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: dailyHealth.stool ? 'var(--mint-green)' : 'var(--deep-navy)' }}>
                배변 상태
              </span>
            </div>

            {/* Circle 2: Meal */}
            <div 
              onClick={() => setActiveCategory('meal')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: dailyHealth.meal ? 'var(--white)' : '#EEF2F6',
                border: dailyHealth.meal ? '2.5px solid var(--mint-green)' : '1.5px solid var(--steel-gray)',
                boxShadow: dailyHealth.meal ? '0 4px 12px rgba(20, 195, 163, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: dailyHealth.meal ? 'var(--mint-green)' : 'var(--deep-navy)' }}>식사</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: dailyHealth.meal ? 'var(--mint-green)' : 'var(--deep-navy)' }}>
                식사 & 음수
              </span>
            </div>

            {/* Circle 3: Energy */}
            <div 
              onClick={() => setActiveCategory('energy')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: dailyHealth.energy ? 'var(--white)' : '#EEF2F6',
                border: dailyHealth.energy ? '2.5px solid var(--mint-green)' : '1.5px solid var(--steel-gray)',
                boxShadow: dailyHealth.energy ? '0 4px 12px rgba(20, 195, 163, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: dailyHealth.energy ? 'var(--mint-green)' : 'var(--deep-navy)' }}>활력</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: dailyHealth.energy ? 'var(--mint-green)' : 'var(--deep-navy)' }}>
                활력 컨디션
              </span>
            </div>

          </div>

          {/* Bullets Summary List Box (인증 안내글 박스 디자인 스타일) */}
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

        {/* 2. Compact Quick Walk Tracker */}
        <div id="home-guide-step3" className="panel" style={{ padding: '16px 20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--deep-navy)' }}>오늘의 산책</h3>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)', fontWeight: 700, marginRight: '2px' }}>목표:</span>
              {[15, 30, 45, 60].map(min => (
                <button
                  key={min}
                  type="button"
                  disabled={walkState !== 'idle'}
                  onClick={() => setWalkTargetMin(min)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    border: walkTargetMin === min ? '1.5px solid var(--mint-green)' : '1px solid var(--steel-gray)',
                    backgroundColor: walkTargetMin === min ? 'var(--mint-green-light)' : 'var(--white)',
                    color: walkTargetMin === min ? 'var(--mint-green)' : 'var(--muted-gray)',
                    cursor: walkState !== 'idle' ? 'not-allowed' : 'pointer',
                    opacity: walkState !== 'idle' ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {min}분
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: walkState === 'running' ? '#E6FAF6' : 'var(--ice-white)',
            padding: '12px 16px',
            borderRadius: '14px',
            transition: 'all 0.3s',
            border: walkState === 'running' ? '1.5px solid var(--mint-green)' : '1px solid var(--steel-gray)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: remainingSec < 0 ? '#D97706' : 'var(--muted-gray)', fontWeight: 700 }}>
                {walkState === 'idle' ? '목표 시간' : remainingSec < 0 ? '추가 진행 시간 (+)' : '남은 시간'}
              </span>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: remainingSec < 0 ? '#D97706' : walkState === 'running' ? 'var(--mint-green)' : 'var(--deep-navy)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.1
              }}>
                {formatCountdownTime(remainingSec)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleStartWalk}
                style={{
                  backgroundColor: walkState === 'running' ? '#F59E0B' : 'var(--mint-green)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                {walkState === 'idle' ? '산책 시작' : walkState === 'running' ? '일시정지' : '재시작'}
              </button>

              {walkState !== 'idle' && (
                <button
                  type="button"
                  onClick={handleFinishWalk}
                  style={{
                    backgroundColor: 'var(--mint-green)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  기록 저장
                </button>
              )}
            </div>
          </div>
        </div>

        <AdBanner />


      </div>

      {/* 건강 카테고리 입력을 위한 바텀시트 */}
      <BottomSheet 
        isOpen={activeCategory !== null} 
        onClose={() => setActiveCategory(null)}
        title={
          activeCategory === 'stool' ? '배변 상태 기록' :
          activeCategory === 'meal' ? '식사 및 음수량 기록' :
          activeCategory === 'energy' ? '활력 컨디션 기록' : ''
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
          {activeCategory === 'stool' && [
            { value: 'good', label: '정상', desc: '건강하고 단단한 예쁜 대변' },
            { value: 'loose', label: '설사', desc: '묽거나 수분이 많은 대변' },
            { value: 'hard', label: '변비', desc: '끊기거나 딱딱해서 힘든 대변' }
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
                  marginTop: 0
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{opt.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)', marginTop: '4px' }}>{opt.desc}</span>
              </button>
            );
          })}

          {activeCategory === 'meal' && [
            { value: 'full', label: '완식', desc: '남김없이 깨끗하게 다 먹었어요' },
            { value: 'half', label: '보통', desc: '적당량 남기거나 평소만큼 먹었어요' },
            { value: 'none', label: '남김', desc: '거의 먹지 않거나 다 남겼어요' }
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
                  marginTop: 0
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{opt.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)', marginTop: '4px' }}>{opt.desc}</span>
              </button>
            );
          })}

          {activeCategory === 'energy' && [
            { value: 'active', label: '좋음', desc: '평소보다 에너지가 넘치고 신나요' },
            { value: 'normal', label: '보통', desc: '늘 그렇듯 얌전하고 편안해요' },
            { value: 'low', label: '기운없음', desc: '쳐져 있고 힘이 없어 보여요' }
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
                  marginTop: 0
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
