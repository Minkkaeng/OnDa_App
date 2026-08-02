import React from 'react';
import { type Pet } from '../../db';
import { Clock, Utensils, Pill, Footprints, Stethoscope, Check, Award } from 'lucide-react';

export interface DailyRoutineTimelineProps {
  activePet: Pet;
  routineChecked: Record<string, boolean>;
  onToggleRoutine: (key: string) => void;
  onOpenMedScheduler: () => void;
}

const DailyRoutineTimeline: React.FC<DailyRoutineTimelineProps> = ({
  activePet,
  routineChecked,
  onToggleRoutine,
  onOpenMedScheduler
}) => {

  const routines = [
    { key: 'morningMeal', time: '08:00 AM', title: '아침 식사 & 영양제', icon: <Utensils size={18} color="var(--main-primary)" /> },
    { key: 'medication', time: '10:00 AM', title: '처방약 복용 (알림)', icon: <Pill size={18} color="#D97706" /> },
    { key: 'walk', time: activePet?.walkDepartTime || '04:00 PM', title: `목표 산책 (${activePet?.walkGoal || '30분'})`, icon: <Footprints size={18} color="var(--main-primary)" /> },
    { key: 'eveningMeal', time: '07:00 PM', title: '저녁 식사 & 빗질', icon: <Utensils size={18} color="var(--main-primary)" /> },
    { key: 'healthCheck', time: '09:00 PM', title: '일일 건강/배변 점검', icon: <Stethoscope size={18} color="#2563EB" /> }
  ];

  const doneCount = routines.filter(r => routineChecked[r.key]).length;
  const progressPercent = Math.round((doneCount / routines.length) * 100);

  return (
    <div className="onda-card" style={{ padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--main-primary)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              오늘의 케어 루틴
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: progressPercent === 100 ? '#D1FAE5' : 'var(--main-primary-light)',
              color: progressPercent === 100 ? '#059669' : 'var(--main-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {progressPercent === 100 ? <><Award size={12} /> 100% 달성!</> : `${doneCount}/${routines.length} 완료 (${progressPercent}%)`}
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            시간대별 케어를 완료하고 체크해보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenMedScheduler}
          style={{
            padding: '6px 12px',
            backgroundColor: '#F3F6F3',
            color: 'var(--main-primary)',
            border: '1.5px solid var(--main-primary)',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          + 복용 스케줄
        </button>
      </div>

      {/* Vertical Timeline Feed */}
      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        {/* Vertical line indicator */}
        <div style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '7px',
          width: '2px',
          backgroundColor: '#EBEBE6',
          zIndex: 1
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {routines.map((r) => {
            const isDone = routineChecked[r.key] || false;

            return (
              <div 
                key={r.key} 
                onClick={() => onToggleRoutine(r.key)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: isDone ? '#F4F7F4' : '#FCFAF7',
                  border: isDone ? '1.5px solid var(--main-primary)' : '1px solid var(--onda-border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
              >
                {/* Timeline node circle */}
                <div style={{
                  position: 'absolute',
                  left: '-23px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? 'var(--main-primary)' : '#D0D0CA',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}>
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isDone ? 'var(--main-primary)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {r.time}
                    </div>
                  </div>
                </div>

                {/* Checkbox badge */}
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? 'var(--main-primary)' : '#FFFFFF',
                  border: isDone ? 'none' : '1.5px solid #D0D0CA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {isDone ? <Check size={14} color="#FFFFFF" /> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyRoutineTimeline;
