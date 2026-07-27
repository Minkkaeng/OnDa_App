import React, { useState, useEffect, useRef } from 'react';
import { usePetStore } from '../store/petStore';
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

interface WalkTimerProps {
  onClose: () => void;
}

export const WalkTimer: React.FC<WalkTimerProps> = ({ onClose }) => {
  const { activePetId, pets, addCalendarEvent, showAlert } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  // 로컬 알림 권한 및 백그라운드 전환 감지
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (e) {
        console.log('Local Notifications not available (Web)', e);
      }
    };
    requestPermissions();

    const handleAppStateChange = async ({ isActive }: { isActive: boolean }) => {
      if (!isActive && isRunning) {
        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: '산책 진행 중',
                body: `${activePet.name}와(과)의 산책 시간이 기록되고 있습니다!`,
                id: 101,
                schedule: { at: new Date(Date.now() + 500) }
              }
            ]
          });
        } catch (e) {
          console.log(e);
        }
      } else if (isActive) {
        try {
          await LocalNotifications.cancel({ notifications: [{ id: 101 }] });
        } catch (e) {
          console.log(e);
        }
        
        // 포그라운드 복귀 시 시간 점프 계산
        if (isRunning && lastTickRef.current > 0) {
          const now = Date.now();
          const delta = Math.floor((now - lastTickRef.current) / 1000);
          if (delta > 0) {
            setSeconds(prev => prev + delta);
            lastTickRef.current = now;
          }
        }
      }
    };

    const listenerPromise = CapacitorApp.addListener('appStateChange', handleAppStateChange);

    return () => {
      listenerPromise.then(listener => listener.remove()).catch(() => {});
    };
  }, [isRunning, activePet.name]);

  // Delta(절대 시간) 기반 타이머 틱
  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        if (delta >= 1) {
          setSeconds(prev => prev + delta);
          lastTickRef.current = now;
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        LocalNotifications.cancel({ notifications: [{ id: 101 }] });
      } catch (e) {}
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
