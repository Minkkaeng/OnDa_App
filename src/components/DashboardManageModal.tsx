import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';

interface DashboardManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTile: 'diary' | 'walk' | 'hospital' | 'schedule' | 'ai' | 'medication';
  activePetId: string;
}

export const DashboardManageModal: React.FC<DashboardManageModalProps> = ({ isOpen, onClose, selectedTile, activePetId }) => {
  const navigate = useNavigate();
  const { addCalendarEvent, showAlert } = usePetStore();
  
  const [diaryContent, setDiaryContent] = useState('');
  const [walkTime, setWalkTime] = useState(30);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospitalTitle, setHospitalTitle] = useState('');
  const [hospitalDate, setHospitalDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicationTitle, setMedicationTitle] = useState('');
  const [medicationDate, setMedicationDate] = useState(new Date().toISOString().split('T')[0]);
  
  if (!isOpen) return null;

  const handleQuickAdd = () => {
    if (selectedTile === 'diary') {
      if (!diaryContent.trim()) {
        showAlert('일기 내용을 입력해주세요.');
        return;
      }
      addCalendarEvent({
        petId: activePetId,
        date: new Date().toISOString().split('T')[0],
        type: 'diary',
        title: '오늘의 일기',
        content: diaryContent
      });
      setDiaryContent('');
      onClose();
      showAlert('일기가 추가되었습니다.');
    } else if (selectedTile === 'walk') {
      addCalendarEvent({
        petId: activePetId,
        date: new Date().toISOString().split('T')[0],
        type: 'walk',
        title: '산책 완료',
        content: `${walkTime}분 산책 기록`
      });
      onClose();
      showAlert('산책 시간이 기록되었습니다.');
    } else if (selectedTile === 'schedule') {
      if (!scheduleTitle.trim() || !scheduleDate) {
        showAlert('일정 제목과 날짜를 확인해주세요.');
        return;
      }
      addCalendarEvent({
        petId: activePetId,
        date: scheduleDate,
        type: 'diary',
        title: scheduleTitle,
        content: '빠른 일정 추가'
      });
      setScheduleTitle('');
      onClose();
      showAlert('일정이 추가되었습니다.');
    } else if (selectedTile === 'hospital') {
      if (!hospitalTitle.trim() || !hospitalDate) {
        showAlert('병원/진료 기록 내용을 입력해주세요.');
        return;
      }
      addCalendarEvent({
        petId: activePetId,
        date: hospitalDate,
        type: 'hospital',
        title: hospitalTitle,
        content: '병원 진료/백신 기록'
      });
      setHospitalTitle('');
      onClose();
      showAlert('의료 기록이 추가되었습니다.');
    } else if (selectedTile === 'medication') {
      if (!medicationTitle.trim() || !medicationDate) {
        showAlert('약/영양제 이름을 입력해주세요.');
        return;
      }
      addCalendarEvent({
        petId: activePetId,
        date: medicationDate,
        type: 'diary', // or medication if specifically tracking
        title: `${medicationTitle} 복용/급여`,
        content: '약/영양제 빠른 추가'
      });
      setMedicationTitle('');
      onClose();
      showAlert('약/영양제 기록이 추가되었습니다.');
    }
  };

  const renderContent = () => {
    switch (selectedTile) {
      case 'diary':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
              placeholder="오늘 우리 아이와 어떤 일이 있었나요?"
              style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', minHeight: '100px', fontSize: '0.9rem', resize: 'vertical', outline: 'none', backgroundColor: 'var(--screen-bg)' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => { onClose(); navigate('/diary'); }} style={{ flex: 1, backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1.5px solid var(--border-color)', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>일기장 가기</button>
              <button type="button" onClick={handleQuickAdd} style={{ flex: 1, backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>저장하기</button>
            </div>
          </div>
        );
      case 'walk':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="number" value={walkTime} onChange={(e) => setWalkTime(Number(e.target.value))} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '1rem', outline: 'none', backgroundColor: 'var(--screen-bg)' }} />
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>분</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>누락된 과거나 오늘의 산책 시간을 수동으로 추가합니다.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1.5px solid var(--border-color)', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>취소</button>
              <button type="button" onClick={handleQuickAdd} style={{ flex: 1, backgroundColor: '#10B981', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>수동 기록 추가</button>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} placeholder="일정 제목 (예: 미용, 약 먹이기)" style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--screen-bg)' }} />
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--screen-bg)' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => { onClose(); navigate('/calendar'); }} style={{ flex: 1, backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1.5px solid var(--border-color)', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>캘린더 보기</button>
              <button type="button" onClick={handleQuickAdd} style={{ flex: 1, backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>일정 추가</button>
            </div>
          </div>
        );
      case 'hospital':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={hospitalTitle} onChange={(e) => setHospitalTitle(e.target.value)} placeholder="진료 내용 또는 백신명" style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--screen-bg)' }} />
            <input type="date" value={hospitalDate} onChange={(e) => setHospitalDate(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--screen-bg)' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => { onClose(); navigate('/care'); }} style={{ flex: 1, backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1.5px solid var(--border-color)', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>상세 가기</button>
              <button type="button" onClick={handleQuickAdd} style={{ flex: 1, backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>기록 추가</button>
            </div>
          </div>
        );
      case 'medication':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={medicationTitle} onChange={(e) => setMedicationTitle(e.target.value)} placeholder="약 또는 영양제 이름" style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--screen-bg)' }} />
            <input type="date" value={medicationDate} onChange={(e) => setMedicationDate(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'var(--screen-bg)' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => { onClose(); navigate('/profile'); }} style={{ flex: 1, backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1.5px solid var(--border-color)', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>상세 가기</button>
              <button type="button" onClick={handleQuickAdd} style={{ flex: 1, backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>급여 기록</button>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
              새로운 건강 리포트를 분석하거나 과거 내역을 초기화 할 수 있습니다.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => { showAlert('AI 리포트가 초기화되었습니다.'); onClose(); }} style={{ flex: 1, backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>기록 초기화</button>
              <button type="button" onClick={() => { onClose(); navigate('/care'); }} style={{ flex: 1, backgroundColor: '#8B5CF6', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>새 분석 받기</button>
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (selectedTile) {
      case 'diary': return '오늘의 일기 퀵 추가';
      case 'walk': return '산책 기록 수동 추가';
      case 'schedule': return '빠른 케어 일정 추가';
      case 'hospital': return '의료 진료 기록 퀵 추가';
      case 'medication': return '약/영양제 급여 퀵 추가';
      case 'ai': return 'AI 가이드 관리';
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cal-modal-content" style={{ width: '100%', maxWidth: '400px', background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', position: 'relative', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', animation: 'scaleUp 0.2s ease-out' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{getTitle()}</h3>
        {renderContent()}
      </div>
    </div>
  );
};
