import React, { useState, useEffect, useRef } from 'react';
import { ProfileCard } from '../components/ProfileCard';
import { usePetStore } from '../store/petStore';
import { useOnboarding } from '../hooks/useOnboarding';

const Dashboard: React.FC = () => {
  const { addCalendarEvent, pets, activePetId, isGlobalTourActive, showAlert } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  const { isCoachMarkSeen, completeGuide, isLoading } = useOnboarding();

  // Walk states
  const [walkState, setWalkState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [targetTime, setTargetTime] = useState('19:00');
  // Scroll Freeze for Coachmark
  useEffect(() => {
    if (!isLoading && !isCoachMarkSeen && !isGlobalTourActive) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    }
  }, [isCoachMarkSeen, isLoading, isGlobalTourActive]);

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [modalHour, setModalHour] = useState('19');
  const [modalMinute, setModalMinute] = useState('00');
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalAccumulatedRef = useRef<number>(0);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartWalk = () => {
    if (walkState === 'idle') {
      // Start timer
      setWalkState('running');
      startTimeRef.current = Date.now();
      totalAccumulatedRef.current = 0;
      setElapsedSec(0);

      timerRef.current = window.setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSec(currentElapsed);
      }, 1000);
    } else if (walkState === 'running') {
      // Pause timer
      setWalkState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      totalAccumulatedRef.current = elapsedSec;
    } else if (walkState === 'paused') {
      // Resume timer
      setWalkState('running');
      startTimeRef.current = Date.now() - (totalAccumulatedRef.current * 1000);
      timerRef.current = window.setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSec(currentElapsed);
      }, 1000);
    }
  };

  const handleFinishWalk = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!activePet) return;

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const formattedWalkTime = formatTime(elapsedSec);

    await addCalendarEvent({
      petId: activePet.id,
      date: dateStr,
      type: 'diary',
      title: '🐶 산책 완료!',
      content: `총 산책 시간: ${formattedWalkTime} / 목표 시간: ${targetTime}`
    });

    showAlert('산책 기록이 캘린더에 성공적으로 저장되었습니다!');
    
    // Reset state
    setWalkState('idle');
    setElapsedSec(0);
    totalAccumulatedRef.current = 0;
  };

  const handleTimeConfirm = () => {
    const h = modalHour.padStart(2, '0');
    const m = modalMinute.padStart(2, '0');
    setTargetTime(`${h}:${m}`);
    setShowTimeModal(false);
  };

  const getChecklist = () => {
    if (isGlobalTourActive) {
      return [
        { title: '영양제 및 사료 급여', desc: '오전 루틴 정상 급여 완료', status: '완료 09:30', completed: true },
        { title: '위생 케어 및 브러싱', desc: '기본 피모 정돈 및 위생 케어 완료', status: '완료 14:00', completed: true },
        { title: '저녁 정기 산책 예정', desc: '보호자 동반 야외 활동 예정', status: '대기 18:00', completed: false }
      ];
    }

    const list = [];
    if (activePet) {
      if (activePet.allergies) {
        list.push({
          title: '질병 및 주의사항',
          desc: activePet.allergies,
          status: '확인 완료',
          completed: true
        });
      }
      if (activePet.medications) {
        list.push({
          title: '정기 투약',
          desc: activePet.medications,
          status: '대기',
          completed: false
        });
      }
      if (activePet.notes) {
        list.push({
          title: '산책 설정 정보',
          desc: activePet.notes,
          status: '확인',
          completed: true
        });
      }
    }
    return list;
  };

  const checklist = getChecklist();

  return (
    <>
      {!isLoading && !isCoachMarkSeen && !isGlobalTourActive && (
        <div 
          onClick={() => completeGuide('isCoachMarkSeen')}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(18, 27, 42, 0.7)', // #121B2A at 70% opacity
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{
            color: '#F0F3F5',
            backgroundColor: 'transparent',
            textAlign: 'center',
            padding: '24px',
            maxWidth: '80%',
            pointerEvents: 'none'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 700, color: '#14C3A3' }}>오늘의 케어 체크리스트</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: '#D1D9E1' }}>
              오늘 급여할 사료나 투약 일정을 체크하는 공간입니다.<br />
              항목을 터치해 완료하면 민트 그린 컬러로 활성화됩니다.
            </p>
            <span style={{ display: 'block', marginTop: '24px', fontSize: '0.8rem', opacity: 0.7, color: '#D1D9E1' }}>
              화면을 터치하여 시작하기
            </span>
          </div>
        </div>
      )}

      <div>
        <ProfileCard />
      </div>

      {/* 2. AD Zone */}
      <div className="ad-zone-top" style={{ marginBottom: '24px' }}>
        <div style={{ flexGrow: 1 }}>
          <span className="ad-badge">AD ZONE</span>
          <div style={{ marginTop: '12px' }}>
            <p className="ad-text" style={{ fontWeight: 700, fontSize: '1.1rem' }}>내 손안의 반려동물 주치의, 프리미엄 온다 케어 멤버십 오픈!</p>
            <p className="ad-subtext" style={{ color: '#555' }}>실시간 전문가 비대면 상담 및 맞춤형 케어 솔루션 정식 런칭</p>
          </div>
        </div>
      </div>

      {/* 3. Quick Walk Form */}
      <div id="home-guide-step3" className="panel" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>오늘의 산책 기록</h3>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">산책 시간 및 목표</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              onClick={() => {
                const parts = targetTime.split(':');
                setModalHour(parts[0]);
                setModalMinute(parts[1]);
                setShowTimeModal(true);
              }} 
              className="form-input" 
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              {targetTime}
            </button>
            <div 
              id="walk-timer-display" 
              className="form-input" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontVariantNumeric: 'tabular-nums', 
                fontWeight: 700, 
                background: 'var(--ice-white)', 
                color: 'var(--mint-green)', 
                fontSize: '1.1rem' 
              }}
            >
              {formatTime(elapsedSec)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            onClick={handleStartWalk} 
            className="btn-submit" 
            style={{ 
              flex: 1, 
              backgroundColor: walkState === 'running' ? '#4CE0C4' : 'var(--mint-green)',
              borderColor: walkState === 'running' ? '#4CE0C4' : 'var(--mint-green)'
            }}
          >
            {walkState === 'idle' ? '시작하기' : walkState === 'running' ? '중단하기' : '재시작'}
          </button>
          {walkState !== 'idle' && (
            <button 
              type="button" 
              onClick={handleFinishWalk} 
              className="btn-submit" 
              style={{ flex: 1, backgroundColor: 'var(--muted-gray)', borderColor: 'var(--muted-gray)' }}
            >
              완료하기
            </button>
          )}
        </div>
      </div>

      {/* 4. Care Task List */}
      <div 
        id="home-guide-step2"
        style={!isLoading && !isCoachMarkSeen && !isGlobalTourActive ? {
          position: 'relative',
          zIndex: 10000,
          backgroundColor: '#FFF',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 0 0 4px rgba(20, 195, 163, 0.5)'
        } : {}}
      >
        <div className="task-list">
          {checklist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted-gray)' }}>
              오늘 예정된 케어 일정이 없습니다.<br />
              <span style={{ fontSize: '0.85rem' }}>케어 탭에서 주의사항 및 투약 주기를 설정해 보세요!</span>
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

      {/* Time Picker Modal */}
      {showTimeModal && (
        <div 
          className="modal-overlay" 
          style={{ 
            display: 'flex', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.5)', 
            zIndex: 1000, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTimeModal(false);
          }}
        >
          <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '20px', color: 'var(--deep-navy)', fontSize: '1.1rem' }}>산책 목표 시간 입력</h4>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
              <input 
                type="number" 
                min="0" 
                max="23" 
                value={modalHour} 
                onChange={(e) => setModalHour(e.target.value)} 
                className="form-input" 
                style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--deep-navy)' }}>:</span>
              <input 
                type="number" 
                min="0" 
                max="59" 
                value={modalMinute} 
                onChange={(e) => setModalMinute(e.target.value)} 
                className="form-input" 
                style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => setShowTimeModal(false)} 
                className="btn-submit" 
                style={{ flex: 1, backgroundColor: 'var(--muted-gray)', borderColor: 'var(--muted-gray)' }}
              >
                취소
              </button>
              <button 
                type="button" 
                onClick={handleTimeConfirm} 
                className="btn-submit" 
                style={{ flex: 1 }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
