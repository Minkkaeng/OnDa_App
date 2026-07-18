import React, { useState, useEffect } from 'react';
import { ProfileCard } from '../components/ProfileCard';
import { usePetStore } from '../store/petStore';

const Dashboard: React.FC = () => {
  const { 
    addCalendarEvent, pets, activePetId, showAlert, isGlobalTourActive,
    walkState, walkElapsedSec, walkTargetMin, setWalkState, setWalkElapsedSec, setWalkTargetMin
  } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

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

  const SegmentControl = ({ label, category, options }: { label: string, category: 'stool'|'meal'|'energy', options: {value:string, label:string}[] }) => (
    <div>
      <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', background: 'var(--ice-white)', padding: '4px', borderRadius: '12px', position: 'relative' }}>
        {options.map(opt => {
          const isActive = dailyHealth[category] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggleHealth(category, opt.value)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: '8px', border: 'none',
                fontSize: '0.85rem', fontWeight: isActive ? 800 : 600, cursor: 'pointer',
                backgroundColor: isActive ? 'var(--white)' : 'transparent',
                color: isActive ? 'var(--deep-navy)' : 'var(--muted-gray)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div style={{ paddingBottom: '16px' }}>
        <ProfileCard />
      </div>

      <div className="tab-content-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. 데일리 기초 건강 기록 */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>오늘의 컨디션 체크</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--mint-green)', background: 'var(--mint-green-light)', padding: '4px 8px', borderRadius: '12px' }}>
              오늘
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SegmentControl label="배변 상태" category="stool" options={[{ value: 'good', label: '정상 💩' }, { value: 'loose', label: '설사 💧' }, { value: 'hard', label: '변비 🪵' }]} />
            <SegmentControl label="식사 및 음수량" category="meal" options={[{ value: 'full', label: '완식 🍚' }, { value: 'half', label: '보통 🥣' }, { value: 'none', label: '남김 ❌' }]} />
            <SegmentControl label="활력 컨디션" category="energy" options={[{ value: 'active', label: '좋음 ⚡' }, { value: 'normal', label: '보통 🙂' }, { value: 'low', label: '기운없음 😴' }]} />
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
    </>
  );
};

export default Dashboard;
