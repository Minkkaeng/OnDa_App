import React, { useState, useEffect } from 'react';
import { usePetStore } from '../store/petStore';

interface WalkTimerProps {
  onClose: () => void;
}

export const WalkTimer: React.FC<WalkTimerProps> = ({ onClose }) => {
  const { activePetId, pets, addCalendarEvent, showAlert } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    if (seconds === 0) {
      onClose();
      return;
    }
    const minutes = Math.ceil(seconds / 60);
    
    // YYYY-MM-DD
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    try {
      await addCalendarEvent({
        petId: activePet.id,
        date: todayStr,
        type: 'walk',
        title: `산책 ${minutes}분 완료!`,
        content: `오늘 ${minutes}분 동안 산책을 다녀왔습니다. 너무 즐거운 시간이었어요!`
      });
      showAlert(`산책 기록(${minutes}분)이 저장되었습니다!`);
    } catch (err) {
      console.error(err);
      showAlert('저장 중 오류가 발생했습니다.');
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ backgroundColor: 'var(--screen-bg)', padding: '24px', borderRadius: '24px', width: '85%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800 }}>산책 타이머</h3>
        <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{activePet.name}와 함께 걷고 있어요!</p>
        
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--main-primary)', fontFamily: 'monospace', marginBottom: '24px', letterSpacing: '-2px' }}>
          {formatTime(seconds)}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: isRunning ? 'var(--butter-yellow)' : 'var(--main-primary)', color: isRunning ? 'var(--text-main)' : 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {isRunning ? '일시정지' : (seconds > 0 ? '계속하기' : '시작하기')}
          </button>
          <button 
            onClick={handleFinish}
            style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            산책 종료
          </button>
        </div>
        
        <button 
          onClick={onClose}
          style={{ marginTop: '16px', padding: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          기록하지 않고 닫기
        </button>
      </div>
    </div>
  );
};
