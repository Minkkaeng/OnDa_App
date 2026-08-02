import React, { useState } from 'react';

export interface ScrollTimePickerModalProps {
  title?: string;
  initialPeriod?: '오전' | '오후';
  initialHour?: number;
  initialMinute?: number;
  onConfirm: (formattedTime: string, period: '오전' | '오후', hour: number, minute: number) => void;
  onCancel: () => void;
  primaryColor?: string;
  textColor?: string;
  mutedColor?: string;
}

const ScrollTimePickerModal: React.FC<ScrollTimePickerModalProps> = ({
  title = '시간 설정',
  initialPeriod = new Date().getHours() >= 12 ? '오후' : '오전',
  initialHour = new Date().getHours() % 12 === 0 ? 12 : new Date().getHours() % 12,
  initialMinute = Math.floor(new Date().getMinutes() / 5) * 5,
  onConfirm,
  onCancel,
  primaryColor = '#5C715E',
  textColor = '#2E2B2A',
  mutedColor = '#8E867E'
}) => {
  const [pickerPeriod, setPickerPeriod] = useState<'오전' | '오후'>(initialPeriod);
  const [pickerHour, setPickerHour] = useState<number>(initialHour);
  const [pickerMinute, setPickerMinute] = useState<number>(initialMinute);

  const handleConfirm = () => {
    const formattedTime = `${pickerPeriod} ${String(pickerHour).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`;
    onConfirm(formattedTime, pickerPeriod, pickerHour, pickerMinute);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px',
        width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textColor }}>{title}</h3>
        
        {/* 3-Column Scroll Picker */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', height: '120px', overflow: 'hidden', position: 'relative', border: '1px solid #EFEFEF', borderRadius: '8px' }}>
          {/* Highlight selection bar */}
          <div style={{ position: 'absolute', top: '45px', left: 0, right: 0, height: '30px', backgroundColor: '#F4F7F4', zIndex: 1, pointerEvents: 'none', borderTop: '1px solid #E5EBE5', borderBottom: '1px solid #E5EBE5' }} />
          
          {/* Column 1: AM/PM */}
          <div 
            className="picker-col" 
            style={{ flex: 1, overflowY: 'auto', height: '100%', zIndex: 2, scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollTop / 30);
              const val = idx === 0 ? '오전' : '오후';
              if (pickerPeriod !== val) setPickerPeriod(val);
            }}
          >
            <div style={{ height: '45px' }} />
            {['오전', '오후'].map(p => (
              <div key={p} style={{ height: '30px', lineHeight: '30px', fontSize: '0.85rem', fontWeight: pickerPeriod === p ? 800 : 500, color: pickerPeriod === p ? primaryColor : mutedColor, scrollSnapAlign: 'center' }}>{p}</div>
            ))}
            <div style={{ height: '45px' }} />
          </div>

          {/* Column 2: Hour (1-12) */}
          <div 
            className="picker-col" 
            style={{ flex: 1, overflowY: 'auto', height: '100%', zIndex: 2, scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const val = Math.round(el.scrollTop / 30) + 1;
              if (val >= 1 && val <= 12 && pickerHour !== val) setPickerHour(val);
            }}
          >
            <div style={{ height: '45px' }} />
            {Array.from({ length: 12 }).map((_, i) => {
              const h = i + 1;
              return <div key={h} style={{ height: '30px', lineHeight: '30px', fontSize: '0.85rem', fontWeight: pickerHour === h ? 800 : 500, color: pickerHour === h ? primaryColor : mutedColor, scrollSnapAlign: 'center' }}>{h}시</div>;
            })}
            <div style={{ height: '45px' }} />
          </div>

          {/* Column 3: Minute (00-55, 5m steps) */}
          <div 
            className="picker-col" 
            style={{ flex: 1, overflowY: 'auto', height: '100%', zIndex: 2, scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const val = Math.round(el.scrollTop / 30) * 5;
              if (val >= 0 && val <= 55 && pickerMinute !== val) setPickerMinute(val);
            }}
          >
            <div style={{ height: '45px' }} />
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i * 5;
              const mStr = String(m).padStart(2, '0');
              return <div key={m} style={{ height: '30px', lineHeight: '30px', fontSize: '0.85rem', fontWeight: pickerMinute === m ? 800 : 500, color: pickerMinute === m ? primaryColor : mutedColor, scrollSnapAlign: 'center' }}>{mStr}분</div>;
            })}
            <div style={{ height: '45px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ flex: 1, padding: '10px', backgroundColor: '#F3F2EC', color: mutedColor, border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{ flex: 1.5, padding: '10px', backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScrollTimePickerModal;
