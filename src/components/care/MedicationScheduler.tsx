import React from 'react';
import { Pill, Clock, X } from 'lucide-react';

export interface MedicationSchedulerProps {
  showMedModal: boolean;
  onClose: () => void;
  medName: string;
  setMedName: (name: string) => void;
  medFrequency: 'daily' | 'interval';
  setMedFrequency: (freq: 'daily' | 'interval') => void;
  medIntervalDays: number;
  setMedIntervalDays: (days: number) => void;
  medTime: string;
  onOpenTimePicker: () => void;
  onSaveScheduler: () => void;
}

const MedicationScheduler: React.FC<MedicationSchedulerProps> = ({
  showMedModal,
  onClose,
  medName,
  setMedName,
  medFrequency,
  setMedFrequency,
  medIntervalDays,
  setMedIntervalDays,
  medTime,
  onOpenTimePicker,
  onSaveScheduler
}) => {
  if (!showMedModal) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '24px',
        width: '95%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
        position: 'relative', boxShadow: '0 12px 36px rgba(0,0,0,0.15)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Pill size={20} color="var(--main-primary)" />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              약/영양제 복용 스케줄 등록
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            등록 시 향후 30일분의 복용 일정이 캘린더에 자동으로 추가됩니다.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>약/영양제 이름 *</label>
            <input 
              type="text" 
              value={medName} 
              onChange={(e) => setMedName(e.target.value)} 
              placeholder="예) 피부약, 관절영양제, 심장사상충약" 
              style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '14px', border: '1px solid #E2E2DC', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>복용 주기 *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setMedFrequency('daily')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '12px',
                  border: medFrequency === 'daily' ? '2px solid var(--main-primary)' : '1px solid #E2E2DC',
                  backgroundColor: medFrequency === 'daily' ? '#F4F7F4' : '#FFFFFF',
                  color: medFrequency === 'daily' ? 'var(--main-primary)' : 'var(--text-main)',
                  fontWeight: medFrequency === 'daily' ? 800 : 600, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                매일 복용
              </button>
              <button
                type="button"
                onClick={() => setMedFrequency('interval')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '12px',
                  border: medFrequency === 'interval' ? '2px solid var(--main-primary)' : '1px solid #E2E2DC',
                  backgroundColor: medFrequency === 'interval' ? '#F4F7F4' : '#FFFFFF',
                  color: medFrequency === 'interval' ? 'var(--main-primary)' : 'var(--text-main)',
                  fontWeight: medFrequency === 'interval' ? 800 : 600, fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                N일 간격 복용
              </button>
            </div>
          </div>

          {medFrequency === 'interval' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>간격 일수 (일마다)</label>
              <input 
                type="number" 
                min="2" 
                max="30"
                value={medIntervalDays} 
                onChange={(e) => setMedIntervalDays(parseInt(e.target.value) || 2)} 
                placeholder="2" 
                style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '14px', border: '1px solid #E2E2DC', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>복용 예정 시간</label>
            <button
              type="button"
              onClick={onOpenTimePicker}
              style={{
                width: '100%', height: '42px', padding: '0 14px', borderRadius: '14px',
                border: '1.5px solid var(--main-primary)', backgroundColor: '#F4F7F4',
                color: 'var(--main-primary)', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Clock size={16} />
              <span>{medTime || '시간 선택'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onSaveScheduler}
            style={{
              padding: '12px', backgroundColor: 'var(--main-primary)', color: 'white',
              border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', marginTop: '8px', fontSize: '0.9rem'
            }}
          >
            30일 일정 생성 및 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationScheduler;
