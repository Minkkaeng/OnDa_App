import React from 'react';
import { Edit2, Trash2, BookOpen, Calendar } from 'lucide-react';
import { type CalendarEvent } from '../../db';

export interface DiaryDailyListProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent, e: React.MouseEvent) => void;
  onDeleteEvent: (id: string, e: React.MouseEvent) => void;
}

const DiaryDailyList: React.FC<DiaryDailyListProps> = ({
  events,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <BookOpen size={40} color="var(--main-primary)" style={{ marginBottom: '12px' }} />
        <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', margin: '0 0 4px 0' }}>작성된 일기가 없습니다.</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>우측 하단 (+) 버튼을 눌러 첫 번째 일기를 남겨보세요!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {events.map((ev) => (
        <div
          key={ev.id}
          onClick={() => onSelectEvent(ev)}
          className="onda-card onda-card-interactive"
          style={{
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
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

          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {ev.content}
          </p>

          {ev.imageUrl && (
            <img
              src={ev.imageUrl}
              alt="Diary Attachment"
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginTop: '4px' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default DiaryDailyList;
