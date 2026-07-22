import React, { useState } from 'react';
import type { CalendarEvent } from '../../db/schema';

interface PoopAnalyzerProps {
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>) => void;
}

const POOP_STATUS_OPTIONS = [
  { id: 'good', label: '🟢 완벽한 황금 맛동산', emoji: '🟢', desc: '건강하고 형태가 뚜렷해요' },
  { id: 'loose', label: '🟡 다소 무른 변', emoji: '🟡', desc: '형태가 퍼지거나 무름' },
  { id: 'hard', label: '🟤 수분 부족 딱딱한 변', emoji: '🟤', desc: '토끼똥처럼 뚝뚝 끊어져요' },
  { id: 'bloody', label: '🔴 혈변 의심', emoji: '🔴', desc: '피가 섞여 나오거나 붉어요' },
] as const;

const PoopAnalyzer: React.FC<PoopAnalyzerProps> = ({ onClose, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState<'good' | 'loose' | 'hard' | 'bloody' | null>(null);
  const [userMemo, setUserMemo] = useState('');

  const handleSaveToRecord = () => {
    if (!selectedStatus) return;
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let title = '💩 배변 상태 기록';
    if (selectedStatus === 'good') title = '🟢 건강한 황금똥 기록';
    if (selectedStatus === 'loose') title = '🟡 다소 무른 변 관찰됨';
    if (selectedStatus === 'hard') title = '🟤 수분 부족 딱딱한 변';
    if (selectedStatus === 'bloody') title = '🔴 혈변 의심 (병원 요망)';

    onSave({
      type: 'poop',
      date: dateStr,
      title: title,
      content: userMemo ? userMemo : '배변 상태가 기록되었습니다.',
      poopStatus: selectedStatus
    });
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(18,27,42,0.85)', zIndex: 2000, alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: 'var(--white)', padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', position: 'relative', overflow: 'hidden' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted-gray)', zIndex: 10 }}>&times;</button>
        
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--deep-navy)', textAlign: 'center' }}>
          💩 배변 상태 기록
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep-navy)' }}>오늘의 변 상태를 선택해주세요</label>
          {POOP_STATUS_OPTIONS.map(opt => (
            <div 
              key={opt.id}
              onClick={() => setSelectedStatus(opt.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: selectedStatus === opt.id ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)',
                backgroundColor: selectedStatus === opt.id ? 'var(--mint-green-light)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{opt.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--deep-navy)', fontSize: '0.95rem' }}>{opt.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-gray)', marginTop: '2px' }}>{opt.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', color: 'var(--deep-navy)' }}>추가 증상/특이사항 적기 (선택)</label>
          <textarea
            value={userMemo}
            onChange={(e) => setUserMemo(e.target.value)}
            placeholder="예: 아침 간식으로 과일을 먹었습니다. 대변 색이 평소보다 밝습니다."
            className="form-input"
            style={{
              minHeight: '80px',
              fontSize: '0.9rem',
              padding: '12px',
              borderRadius: '12px',
              borderColor: 'var(--steel-gray)',
              resize: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button 
          onClick={handleSaveToRecord}
          disabled={!selectedStatus}
          className="btn-submit"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: selectedStatus ? 'var(--mint-green)' : 'var(--steel-gray)',
            color: selectedStatus ? 'white' : 'var(--muted-gray)',
            fontSize: '1rem',
            fontWeight: 800,
            border: 'none'
          }}
        >
          기록 저장하기 💾
        </button>
      </div>
    </div>
  );
};

export default PoopAnalyzer;
