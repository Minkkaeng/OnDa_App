import React from 'react';
import { usePetStore } from '../store/petStore';

const Care: React.FC = () => {
  const { pets, activePetId, isGlobalTourActive } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  const getSchedulerTasks = () => {
    if (isGlobalTourActive) {
      return [
        {
          id: 'task-1',
          title: '만성 안구 건조증 안약 투여',
          desc: '오전 10:00 / 정기 복용 완료 상태',
          status: '완료 10:05',
          completed: true
        },
        {
          id: 'task-2',
          title: '저녁 정기 산책 (30분 목표)',
          desc: '오후 07:00 / 실시간 보호자 동반 산책',
          status: '대기중',
          completed: false
        }
      ];
    }

    const tasks = [];
    if (activePet) {
      if (activePet.allergies) {
        tasks.push({
          id: 't-allergies',
          title: activePet.allergies,
          desc: '주의 특이사항 및 의학적 관리 항목',
          status: '완료',
          completed: true
        });
      }
      if (activePet.medications) {
        tasks.push({
          id: 't-meds',
          title: activePet.medications,
          desc: '정기 복용 및 약 관리 스케줄',
          status: '대기중',
          completed: false
        });
      }
      if (activePet.walkTime || activePet.walkGoal) {
        tasks.push({
          id: 't-walk',
          title: `산책 계획: ${activePet.walkTime || '시간 미지정'} (${activePet.walkGoal || '목표 미지정'})`,
          desc: '실시간 보호자 동반 권장 산책',
          status: '대기중',
          completed: false
        });
      }
    }
    return tasks;
  };

  const tasks = getSchedulerTasks();

  return (
    <>
      <div className="care-layout" style={{ justifyContent: 'center', marginTop: '24px' }}>
        <div 
          id="care-guide-step1" 
          className="panel care-col" 
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '32px', 
            maxWidth: '600px', 
            width: '100%', 
            boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)' 
          }}
        >
          <h2 className="care-title" style={{ color: 'var(--deep-navy)', fontSize: '1.4rem', borderBottom: '2px solid var(--mint-green)', paddingBottom: '16px', marginBottom: '24px' }}>
            연동 실시간 스케줄러
          </h2>
          
          <div className="task-list">
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted-gray)', lineHeight: 1.6 }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🗓️</span>
                <strong>현재 설정된 연동 스케줄이 없습니다.</strong>
                <p style={{ fontSize: '0.85rem', marginTop: '8px', color: 'var(--muted-gray)' }}>
                  상단 프로필 메뉴의 프로필 설정 양식에서 알레르기, 투약 정보, 산책 시간 설정을 변경하시면 이곳에 실시간 스케줄이 자동으로 활성화됩니다.
                </p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-card ${task.completed ? '' : 'pending'}`}
                  style={task.completed ? { borderColor: 'var(--mint-green)' } : { background: 'transparent' }}
                >
                  <div className="task-info">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--deep-navy)', marginBottom: '6px' }}>{task.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-gray)' }}>{task.desc}</p>
                  </div>
                  <div 
                    className={`task-status ${task.completed ? 'completed' : 'pending'}`}
                    style={!task.completed ? { border: '1px solid var(--error-red)', padding: '4px 12px', borderRadius: '20px' } : {}}
                  >
                    {task.status}
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

export default Care;
