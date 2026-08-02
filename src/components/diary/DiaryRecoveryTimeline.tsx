import React from 'react';
import { Edit2, Trash2, Calendar, Thermometer, Pill } from 'lucide-react';
import { type CalendarEvent } from '../../db';

export interface DiaryRecoveryTimelineProps {
  recoveryEvents: CalendarEvent[];
  onOpenReportModal: () => void;
  onEditEvent: (event: CalendarEvent, e: React.MouseEvent) => void;
  onDeleteEvent: (id: string, e: React.MouseEvent) => void;
}

const DiaryRecoveryTimeline: React.FC<DiaryRecoveryTimelineProps> = ({
  recoveryEvents,
  onOpenReportModal,
  onEditEvent,
  onDeleteEvent
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Vet Consult Report Callout Banner */}
      <div style={{
        backgroundColor: '#F3F6F3',
        borderRadius: '16px',
        padding: '14px 16px',
        border: '1.5px solid var(--main-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--main-primary)' }}>
            🩺 수의사 상담용 리포트
          </h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            기록된 체온 및 투약 경과를 한눈에 출력합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenReportModal}
          style={{
            padding: '8px 14px',
            backgroundColor: 'var(--main-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.78rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(92,113,94,0.2)'
          }}
        >
          리포트 출력
        </button>
      </div>

      {/* Recovery Timeline Feed List */}
      {recoveryEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🩺</p>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>등록된 질병 회복일지가 없습니다.</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>우측 하단 (+) 버튼을 눌러 수술/치료 후 경과를 기록해보세요!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recoveryEvents.map((ev) => {
            const tempMatch = ev.content?.match(/체온:\s*([0-9.]+)/);
            const temp = tempMatch ? tempMatch[1] : null;
            const medicated = ev.content?.includes('복용완료');
            const memoMatch = ev.content?.match(/경과 메모:\s*([\s\S]+)/);
            const memo = memoMatch ? memoMatch[1].trim() : ev.content;

            return (
              <div
                key={ev.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid #EFEFEF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--main-primary)', backgroundColor: 'var(--main-primary-light)', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>{ev.date}</span>
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => onEditEvent(ev, e)}
                      style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => onDeleteEvent(ev.id, e)}
                      style={{ border: 'none', background: 'none', color: 'var(--blood-coral)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {ev.title}
                </h3>

                {/* Status Chips Row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  {temp && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', backgroundColor: '#FEF3C7', padding: '3px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Thermometer size={12} />
                      <span>{temp} ℃</span>
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: medicated ? '#059669' : '#DC2626', backgroundColor: medicated ? '#D1FAE5' : '#FEE2E2', padding: '3px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Pill size={12} />
                    <span>{medicated ? '투약 완료' : '미투약'}</span>
                  </span>
                </div>

                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {memo}
                </p>

                {ev.imageUrl && (
                  <img
                    src={ev.imageUrl}
                    alt="Affected Area Attachment"
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginTop: '4px' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiaryRecoveryTimeline;
