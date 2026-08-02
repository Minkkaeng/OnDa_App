import React from 'react';
import { type CalendarEvent, type Pet } from '../../db';
import { Calendar, Thermometer, Pill, Printer } from 'lucide-react';

export interface VetConsultReportModalProps {
  showReportModal: boolean;
  onClose: () => void;
  activePet: Pet;
  recoveryEvents: CalendarEvent[];
}

const VetConsultReportModal: React.FC<VetConsultReportModalProps> = ({
  showReportModal,
  onClose,
  activePet,
  recoveryEvents
}) => {
  if (!showReportModal) return null;

  const handlePrint = () => {
    const printContents = document.getElementById('print-area')?.innerHTML;
    const originalContents = document.body.innerHTML;
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
        width: '95%', maxWidth: '420px', maxHeight: '85vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
        position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          &times;
        </button>
        
        <div id="print-area">
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>🩺 수의사 상담용 회복 리포트</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            반려동물: {activePet?.name || '우리 아이'} ({activePet?.breed || ''}) | 출력일: {new Date().toLocaleDateString()}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '2px solid var(--main-primary)', paddingTop: '12px' }}>
            {recoveryEvents.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>기록된 회복 일지가 없습니다.</p>
            ) : (
              recoveryEvents.map(ev => {
                const tempMatch = ev.content?.match(/체온:\s*([0-9.]+)/);
                const temp = tempMatch ? tempMatch[1] : '38.5';
                const medicated = ev.content?.includes('복용완료');
                const memoMatch = ev.content?.match(/경과 메모:\s*([\s\S]+)/);
                const memo = memoMatch ? memoMatch[1].trim() : '메모 없음';

                return (
                  <div key={ev.id} style={{ paddingBottom: '12px', borderBottom: '1px solid #EFEFEF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-main)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{ev.date}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Thermometer size={14} color="#E11D48" /> {temp}℃
                        </span>
                        <span>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Pill size={14} color="#D97706" /> {medicated ? '투약 완료' : '미투약'}
                        </span>
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {memo}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            type="button" 
            onClick={handlePrint}
            style={{ flex: 1.5, padding: '10px', backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            <span>리포트 인쇄/PDF 저장</span>
          </button>
          <button 
            type="button" 
            onClick={onClose}
            style={{ flex: 1, padding: '10px', backgroundColor: '#F3F2EC', color: 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default VetConsultReportModal;
