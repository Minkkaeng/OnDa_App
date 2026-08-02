import React from 'react';
import { Stethoscope, Smile, Meh, AlertTriangle } from 'lucide-react';

export interface QuickHealthCheckProps {
  healthStatus: 'good' | 'warning' | 'alert';
  setHealthStatus: (status: 'good' | 'warning' | 'alert') => void;
  healthMemo: string;
  setHealthMemo: (memo: string) => void;
  onSaveHealthLog: () => void;
}

const QuickHealthCheck: React.FC<QuickHealthCheckProps> = ({
  healthStatus,
  setHealthStatus,
  healthMemo,
  setHealthMemo,
  onSaveHealthLog
}) => {
  return (
    <div className="onda-card" style={{ padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <Stethoscope size={18} color="var(--main-primary)" />
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
          한 줄 건강 & 배변 체크
        </h2>
      </div>
      <p style={{ margin: '0 0 14px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        오늘 아이의 컨디션 상태를 간편하게 칩으로 선택하세요.
      </p>

      {/* 3-State Status Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[
          { key: 'good', label: '양호함', icon: <Smile size={16} />, color: '#059669', bg: '#D1FAE5', border: '#10B981' },
          { key: 'warning', label: '주의필요', icon: <Meh size={16} />, color: '#D97706', bg: '#FEF3C7', border: '#F59E0B' },
          { key: 'alert', label: '병원방문/경고', icon: <AlertTriangle size={16} />, color: '#DC2626', bg: '#FEE2E2', border: '#EF4444' }
        ].map((item) => {
          const isSelected = healthStatus === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setHealthStatus(item.key as any)}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: '14px',
                border: isSelected ? `2px solid ${item.border}` : '1px solid #E2E2DC',
                backgroundColor: isSelected ? item.bg : '#FFFFFF',
                color: isSelected ? item.color : 'var(--text-main)',
                fontWeight: isSelected ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Single-line Quick Note Input */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={healthMemo}
          onChange={(e) => setHealthMemo(e.target.value)}
          placeholder="특이사항 메모 (예: 활력 좋음, 묽은 변 1회)"
          style={{
            flex: 1,
            height: '40px',
            padding: '0 14px',
            borderRadius: '12px',
            border: '1px solid #E2E2DC',
            fontSize: '0.8rem',
            fontWeight: 600,
            outline: 'none',
            backgroundColor: '#FCFAF7'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSaveHealthLog();
            }
          }}
        />
        <button
          type="button"
          onClick={onSaveHealthLog}
          style={{
            padding: '0 16px',
            height: '40px',
            backgroundColor: 'var(--main-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          기록
        </button>
      </div>
    </div>
  );
};

export default QuickHealthCheck;
