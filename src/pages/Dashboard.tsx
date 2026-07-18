import React, { useState, useEffect } from 'react';
import { ProfileCard } from '../components/ProfileCard';
import { usePetStore } from '../store/petStore';
import AdBanner from '../components/common/AdBanner';
import BottomSheet from '../components/common/BottomSheet';
import { ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    addCalendarEvent, pets, activePetId, showAlert, isGlobalTourActive,
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
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
    await addCalendarEvent({
      petId: activePet.id,
      date: todayStr,
      type: 'diary',
      title: '🐶 산책 완료!',
      content: `총 산책 시간: ${formattedWalkTime} / 목표 시간: ${walkTargetMin}분`
    });
    showAlert('산책 기록이 캘린더에 성공적으로 저장되었습니다!');
    setWalkState('idle');
    setWalkElapsedSec(0);
  };

  const getChecklist = () => {
    if (isGlobalTourActive) {
      return [
        { title: '영양제 및 사료 급여', desc: '오전 루틴 정상 급여 완료', status: '완료 09:30', completed: true },
        { title: '위생 케어 및 브러싱', desc: '기본 털망 정돈 및 위생 케어 완료', status: '완료 14:00', completed: true },
        { title: '저녁 정기 산책 예정', desc: '보호자 동반 야외 활동 예정', status: '대기중 18:00', completed: false }
      ];
    }

    const list = [];
    if (activePet) {
      if (activePet.allergies) {
        list.push({ title: '질병 및 주의사항', desc: activePet.allergies, status: '확인 완료', completed: true });
      }
      if (activePet.medications) {
        list.push({ title: '정기 투약', desc: activePet.medications, status: '대기중', completed: false });
      }
      if (activePet.notes) {
        list.push({ title: '산책 일정 정보', desc: activePet.notes, status: '확인', completed: true });
      }
    }
    return list;
  };
  const checklist = getChecklist();

  return (
    <>
      <div style={{ paddingBottom: '16px' }}>
        <ProfileCard />
      </div>

      <div className="tab-content-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. 데일리 기초 건강 기록 */}
        <div className="panel" style={{ padding: '20px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(18, 27, 42, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--deep-navy)' }}>오늘의 건강 체크</h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mint-green)', background: 'var(--mint-green-light)', padding: '4px 10px', borderRadius: '20px' }}>
              오늘 기록
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 배변 상태 카드 */}
            <div 
              onClick={() => setActiveCategory('stool')}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--steel-gray)',
                backgroundColor: 'var(--white)', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>💩</span>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep-navy)' }}>배변 상태</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--muted-gray)' }}>변의 묽기와 상태 기록</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dailyHealth.stool ? (
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--mint-green)', background: 'var(--mint-green-light)', padding: '4px 8px', borderRadius: '6px' }}>
                    {dailyHealth.stool === 'good' ? '정상 💩' : dailyHealth.stool === 'loose' ? '설사 💧' : '변비 🪵'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>기록하기</span>
                )}
                <ChevronRight size={16} color="var(--muted-gray)" />
              </div>
            </div>

            {/* 식사 및 음수량 카드 */}
            <div 
              onClick={() => setActiveCategory('meal')}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--steel-gray)',
                backgroundColor: 'var(--white)', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>🍚</span>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep-navy)' }}>식사 및 음수량</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--muted-gray)' }}>오늘 먹은 밥과 물의 양</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dailyHealth.meal ? (
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--mint-green)', background: 'var(--mint-green-light)', padding: '4px 8px', borderRadius: '6px' }}>
                    {dailyHealth.meal === 'full' ? '완식 🍚' : dailyHealth.meal === 'half' ? '보통 🥣' : '남김 ❌'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>기록하기</span>
                )}
                <ChevronRight size={16} color="var(--muted-gray)" />
              </div>
            </div>

            {/* 활력 컨디션 카드 */}
            <div 
              onClick={() => setActiveCategory('energy')}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--steel-gray)',
                backgroundColor: 'var(--white)', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>⚡</span>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep-navy)' }}>활력 컨디션</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--muted-gray)' }}>활동성과 전반적인 기분</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {dailyHealth.energy ? (
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--mint-green)', background: 'var(--mint-green-light)', padding: '4px 8px', borderRadius: '6px' }}>
                    {dailyHealth.energy === 'active' ? '좋음 ⚡' : dailyHealth.energy === 'normal' ? '보통 🙂' : '기운없음 😴'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>기록하기</span>
                )}
                <ChevronRight size={16} color="var(--muted-gray)" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Quick Walk Form */}
        <div id="home-guide-step3" className="panel">
          <h3 style={{ marginBottom: '12px', fontSize: '1.15rem', fontWeight: 800 }}>오늘의 산책 기록</h3>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">산책 목표 시간</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ 
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '1.2rem', fontWeight: 800, color: 'var(--mint-green)',
                background: 'var(--ice-white)', borderRadius: '12px', border: '1.5px solid var(--steel-gray)'
              }}>
                {walkTargetMin}분
              </div>
              <div style={{ display: 'flex', gap: '8px', flex: 2 }}>
                <button type="button" onClick={() => setWalkTargetMin(Math.max(10, walkTargetMin - 10))} className="btn-submit" style={{ flex: 1, margin: 0, padding: '10px 0', backgroundColor: 'var(--steel-gray)', color: 'var(--deep-navy)' }}>
                  -10분
                </button>
                <button type="button" onClick={() => setWalkTargetMin(walkTargetMin + 10)} className="btn-submit" style={{ flex: 1, margin: 0, padding: '10px 0', backgroundColor: 'var(--ice-white)', color: 'var(--deep-navy)', border: '1px solid var(--mint-green)' }}>
                  +10분
                </button>
                <button type="button" onClick={() => setWalkTargetMin(walkTargetMin + 30)} className="btn-submit" style={{ flex: 1, margin: 0, padding: '10px 0', backgroundColor: 'var(--mint-green)', color: 'white' }}>
                  +30분
                </button>
              </div>
            </div>
            <label className="form-label">현재 산책 시간</label>
            <div 
              id="walk-timer-display" 
              className="form-input" 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontVariantNumeric: 'tabular-nums', fontWeight: 800, 
                background: walkState === 'running' ? '#E6FAF6' : 'var(--ice-white)', 
                color: walkState === 'running' ? 'var(--mint-green)' : 'var(--muted-gray)', 
                fontSize: '1.8rem', height: '60px', padding: '0', transition: 'all 0.3s'
              }}
            >
              {formatTime(walkElapsedSec)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" onClick={handleStartWalk} className="btn-submit" 
              style={{ flex: 1, backgroundColor: walkState === 'running' ? '#4CE0C4' : 'var(--mint-green)', borderColor: walkState === 'running' ? '#4CE0C4' : 'var(--mint-green)', marginTop: 0, padding: '10px' }}
            >
              {walkState === 'idle' ? '시작하기' : walkState === 'running' ? '중단하기' : '재시작'}
            </button>
            {walkState !== 'idle' && (
              <button 
                type="button" onClick={handleFinishWalk} className="btn-submit" 
                style={{ flex: 1, backgroundColor: 'var(--muted-gray)', borderColor: 'var(--muted-gray)', marginTop: 0, padding: '10px' }}
              >
                완료하기
              </button>
            )}
          </div>
        </div>

        <AdBanner />

        {/* 3. Care Task List */}
        <div id="home-guide-step2" className="panel">
          <h3 style={{ marginBottom: '12px', fontSize: '1.15rem', fontWeight: 800 }}>오늘의 케어 체크리스트</h3>
          <div className="task-list">
            {checklist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted-gray)' }}>
                오늘 예정된 케어 일정이 없습니다.<br />
                <span style={{ fontSize: '0.85rem' }}>캘린더 탭에서 주의사항 및 투약 주기를 설정해 보세요!</span>
              </div>
            ) : (
              checklist.map((item, idx) => (
                <div key={idx} className={`task-card ${item.completed ? '' : 'pending'}`}>
                  <div className="task-info">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <div className={`task-status ${item.completed ? 'completed' : 'pending'}`}>
                    {item.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 건강 카테고리 입력을 위한 바텀시트 */}
      <BottomSheet 
        isOpen={activeCategory !== null} 
        onClose={() => setActiveCategory(null)}
        title={
          activeCategory === 'stool' ? '💩 배변 상태 기록' :
          activeCategory === 'meal' ? '🍚 식사 및 음수량 기록' :
          activeCategory === 'energy' ? '⚡ 활력 컨디션 기록' : ''
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
          {activeCategory === 'stool' && [
            { value: 'good', label: '정상 💩', desc: '건강하고 단단한 예쁜 대변' },
            { value: 'loose', label: '설사 💧', desc: '묽거나 수분이 많은 대변' },
            { value: 'hard', label: '변비 🪵', desc: '끊기거나 딱딱해서 힘든 대변' }
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
            { value: 'full', label: '완식 🍚', desc: '남김없이 깨끗하게 다 먹었어요' },
            { value: 'half', label: '보통 🥣', desc: '적당량 남기거나 평소만큼 먹었어요' },
            { value: 'none', label: '남김 ❌', desc: '거의 먹지 않거나 다 남겼어요' }
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
            { value: 'active', label: '좋음 ⚡', desc: '평소보다 에너지가 넘치고 신나요' },
            { value: 'normal', label: '보통 🙂', desc: '늘 그렇듯 얌전하고 편안해요' },
            { value: 'low', label: '기운없음 😴', desc: '쳐져 있고 힘이 없어 보여요' }
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
