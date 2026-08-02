import React from 'react';
import { Activity, FileText } from 'lucide-react';

export interface DiaryHeaderTabsProps {
  activeSubTab: 'general' | 'recovery';
  setActiveSubTab: (tab: 'general' | 'recovery') => void;
  recoveryCount: number;
  generalCount: number;
}

const DiaryHeaderTabs: React.FC<DiaryHeaderTabsProps> = ({
  activeSubTab,
  setActiveSubTab,
  recoveryCount,
  generalCount
}) => {
  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#EAEBE7',
      borderRadius: '16px',
      padding: '4px',
      marginBottom: '16px'
    }}>
      <button
        type="button"
        onClick={() => setActiveSubTab('general')}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px 0',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: activeSubTab === 'general' ? '#FFFFFF' : 'transparent',
          color: activeSubTab === 'general' ? 'var(--main-primary)' : 'var(--text-muted)',
          fontWeight: activeSubTab === 'general' ? 800 : 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: activeSubTab === 'general' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <FileText size={16} />
        <span>일상 기록 ({generalCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveSubTab('recovery')}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px 0',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: activeSubTab === 'recovery' ? '#FFFFFF' : 'transparent',
          color: activeSubTab === 'recovery' ? 'var(--main-primary)' : 'var(--text-muted)',
          fontWeight: activeSubTab === 'recovery' ? 800 : 600,
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: activeSubTab === 'recovery' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <Activity size={16} />
        <span>질병 회복일지 ({recoveryCount})</span>
      </button>
    </div>
  );
};

export default DiaryHeaderTabs;
