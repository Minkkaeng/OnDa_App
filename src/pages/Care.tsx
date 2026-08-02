import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import DailyRoutineTimeline from '../components/care/DailyRoutineTimeline';
import QuickHealthCheck from '../components/care/QuickHealthCheck';
import MedicationScheduler from '../components/care/MedicationScheduler';
import ScrollTimePickerModal from '../components/common/ScrollTimePickerModal';
import NotificationService from '../services/notificationService';
import { Heart, Activity, TrendingUp, Syringe, CheckCircle2, AlertCircle } from 'lucide-react';

const Care: React.FC = () => {
  const navigate = useNavigate();
  const { pets, activePetId, addCalendarEvent, showAlert, showConfirm } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  // Top Sub-nav chip tabs matching reference mockup
  const [activeSubTab, setActiveSubTab] = useState<'report' | 'routine' | 'weight' | 'vaccine'>('report');

  // Daily Routine checklist state
  const [routineChecked, setRoutineChecked] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`routine_${activePetId}_${today}`);
    return saved ? JSON.parse(saved) : {};
  });

  const toggleRoutine = (key: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...routineChecked, [key]: !routineChecked[key] };
    setRoutineChecked(updated);
    localStorage.setItem(`routine_${activePetId}_${today}`, JSON.stringify(updated));
  };

  // Quick 3-State Health Check Form State
  const [healthStatus, setHealthStatus] = useState<'good' | 'warning' | 'alert'>('good');
  const [healthMemo, setHealthMemo] = useState<string>('');

  const handleSaveHealthLog = async () => {
    const today = new Date().toISOString().split('T')[0];
    const statusLabel = healthStatus === 'good' ? '컨디션 양호' : healthStatus === 'warning' ? '주의 필요' : '병원방문/경고';
    const contentText = `상태: ${statusLabel}${healthMemo.trim() ? `\n메모: ${healthMemo.trim()}` : ''}`;

    try {
      await addCalendarEvent({
        petId: activePetId || (pets[0] && pets[0].id) || 'default',
        date: today,
        title: `일일 케어 점검 (${statusLabel})`,
        content: contentText,
        type: 'diary'
      });
      showAlert('오늘의 건강 상태가 일기장에 저장되었습니다!');
      setHealthMemo('');
    } catch (err) {
      console.error(err);
      showAlert('저장 중 오류가 발생했습니다.');
    }
  };

  // Medication 30-Day Scheduler Modal State
  const [showMedModal, setShowMedModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medFrequency, setMedFrequency] = useState<'daily' | 'interval'>('daily');
  const [medIntervalDays, setMedIntervalDays] = useState(2);
  const [medTime, setMedTime] = useState('오전 10:00');

  // Time Picker Modal State
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [pickerPeriod, setPickerPeriod] = useState<'오전' | '오후'>('오전');
  const [pickerHour, setPickerHour] = useState<number>(10);
  const [pickerMinute, setPickerMinute] = useState<number>(0);

  const handleSaveMedScheduler = async () => {
    if (!medName.trim()) {
      showAlert('약/영양제 이름을 입력해 주세요.');
      return;
    }

    try {
      const today = new Date();
      let notifyHour = pickerHour;
      if (pickerPeriod === '오후' && notifyHour < 12) notifyHour += 12;
      if (pickerPeriod === '오전' && notifyHour === 12) notifyHour = 0;

      for (let i = 0; i < 30; i++) {
        if (medFrequency === 'interval' && i % medIntervalDays !== 0) {
          continue;
        }

        const dateObj = new Date(today);
        dateObj.setDate(today.getDate() + i);
        const dateStr = dateObj.toISOString().split('T')[0];

        await addCalendarEvent({
          petId: activePetId || (pets[0] && pets[0].id) || 'default',
          date: dateStr,
          title: `처방약 복용 (${medName.trim()})`,
          content: `예정시간: ${medTime}\n복용주기: ${medFrequency === 'daily' ? '매일' : `${medIntervalDays}일 간격`}`,
          type: 'hospital'
        });

        await NotificationService.scheduleMedicationReminder(
          activePet?.name || '아이',
          medName.trim(),
          dateObj,
          notifyHour,
          pickerMinute,
          i
        );
      }

      setShowMedModal(false);
      const savedMedName = medName.trim();
      setMedName('');
      
      showConfirm(
        `'${savedMedName}' 30일 복용 스케줄 및 푸시 알림이 등록되었습니다.\n지금 캘린더에서 확인해보시겠습니까?`,
        '복용 일정 등록 완료',
        () => {
          navigate('/calendar');
        }
      );
    } catch (err) {
      console.error(err);
      showAlert('복용 일정 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="onda-page-container">
      
      {/* 1. Header Title */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Heart size={22} color="var(--main-primary)" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {activeSubTab === 'report' ? '건강 리포트' : `${activePet?.name || '우리 아이'} 데일리 케어`}
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {activeSubTab === 'report' 
            ? '반려동물 예방의학 현황 및 건강 지표 그래프 리포트' 
            : '반려동물 케어 루틴 체크리스트 & 복용 일정 관리'}
        </p>
      </div>

      {/* 2. Top Sub-Nav Chips Matching Reference Mockup */}
      <div className="horizontal-scroll-chips" style={{ marginBottom: '8px' }}>
        <button
          type="button"
          className={`onda-chip-tab ${activeSubTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('report')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Heart size={14} />
          <span>건강 리포트</span>
        </button>
        <button
          type="button"
          className={`onda-chip-tab ${activeSubTab === 'routine' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('routine')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Activity size={14} />
          <span>건강 상태 & 루틴</span>
        </button>
        <button
          type="button"
          className={`onda-chip-tab ${activeSubTab === 'weight' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('weight')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <TrendingUp size={14} />
          <span>체중 변화</span>
        </button>
        <button
          type="button"
          className={`onda-chip-tab ${activeSubTab === 'vaccine' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('vaccine')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Syringe size={14} />
          <span>예방접종 관리</span>
        </button>
      </div>

      {/* Sub Tab View 0: 건강 리포트 (체중 변화 + 예방접종 카드 + 신규 데이터 등록 버튼) */}
      {activeSubTab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: 체중 변화 */}
          <div className="onda-card" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  체중 변화
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--main-primary)', fontWeight: 700 }}>
                  현재: {activePet?.weight || 5.2}kg (양호)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>최근 6개월 ›</span>
            </div>

            {/* Simple Sparkline / Bar Chart Visualization in Coral and Mint */}
            <div style={{ height: '140px', backgroundColor: '#FCFAF7', borderRadius: '16px', border: '1px solid var(--onda-border-light)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '16px 12px 10px 12px', boxSizing: 'border-box' }}>
              {[
                { month: '10/12', val: parseFloat(((activePet?.weight || 5.2) * 0.96).toFixed(1)) },
                { month: '10/15', val: parseFloat(((activePet?.weight || 5.2) * 0.98).toFixed(1)) },
                { month: '11/01', val: parseFloat(((activePet?.weight || 5.2) * 0.99).toFixed(1)) },
                { month: '11/15', val: parseFloat(((activePet?.weight || 5.2) * 1.0).toFixed(1)) },
                { month: '12/01', val: parseFloat(((activePet?.weight || 5.2) * 1.01).toFixed(1)) },
                { month: '12/15', val: parseFloat(((activePet?.weight || 5.2)).toFixed(1)) }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: idx === 5 ? 'var(--main-primary)' : 'var(--accent)' }}>{item.val}kg</span>
                  <div style={{
                    width: '18px',
                    height: `${(item.val / ((activePet?.weight || 5.2) * 1.1)) * 80}px`,
                    backgroundColor: idx === 5 ? 'var(--main-primary)' : 'var(--accent)',
                    borderRadius: '6px'
                  }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: 예방접종 현황 */}
          <div className="onda-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              예방접종 현황
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* 광견병 백신 (완료) */}
              <div style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: '#FCFAF7', border: '1px solid var(--onda-border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>광견병 백신</span>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }} title="완료">
                    <CheckCircle2 size={12} color="#FFF" strokeWidth={3} />
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>완료 (2026.04.15)</span>
              </div>
              {/* DHPPL 종합백신 (예정) */}
              <div style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: '#FCFAF7', border: '1px solid var(--onda-border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>DHPPL 종합백신</span>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--main-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }} title="예정">
                    <span style={{ fontSize: '9px', fontWeight: 'bold' }}>!</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--main-primary)', fontWeight: 700 }}>예정 (D-15일)</span>
              </div>
            </div>
          </div>

          {/* 등록 버튼 */}
          <button
            onClick={() => {
              // Open new record or schedule modal
              setShowMedModal(true);
            }}
            className="onda-btn-primary"
            style={{ marginTop: '10px' }}
          >
            신규 일정 및 건강 기록 추가
          </button>
        </div>
      )}

      {/* Sub Tab View 1: Weight Chart */}
      {activeSubTab === 'weight' && (
        <div className="onda-card" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {activePet?.name || '아이'}의 체중 변화
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--main-primary)', fontWeight: 700 }}>
                현재: {activePet?.weight || 5.2}kg (양호)
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>최근 6개월 ›</span>
          </div>

          {/* Simple Sparkline / Bar Chart Visualization */}
          <div style={{ height: '140px', backgroundColor: '#FCFAF7', borderRadius: '16px', border: '1px solid var(--onda-border-light)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '16px 12px 10px 12px', boxSizing: 'border-box' }}>
            {[
              { month: '10/12', val: parseFloat(((activePet?.weight || 5.2) * 0.96).toFixed(1)) },
              { month: '10/15', val: parseFloat(((activePet?.weight || 5.2) * 0.98).toFixed(1)) },
              { month: '11/01', val: parseFloat(((activePet?.weight || 5.2) * 0.99).toFixed(1)) },
              { month: '11/15', val: parseFloat(((activePet?.weight || 5.2) * 1.0).toFixed(1)) },
              { month: '12/01', val: parseFloat(((activePet?.weight || 5.2) * 1.01).toFixed(1)) },
              { month: '12/15', val: parseFloat(((activePet?.weight || 5.2)).toFixed(1)) }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--main-primary)' }}>{item.val}kg</span>
                <div style={{
                  width: '18px',
                  height: `${(item.val / ((activePet?.weight || 5.2) * 1.1)) * 80}px`,
                  backgroundColor: idx === 5 ? 'var(--main-primary)' : 'var(--main-primary-light)',
                  borderRadius: '6px'
                }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab View 2: Vaccine Cards */}
      {activeSubTab === 'vaccine' && (
        <div className="onda-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
            예방접종 일정 현황
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>광견병 백신</span>
                <CheckCircle2 size={16} color="#166534" />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700 }}>완료 (2026.04.15)</span>
            </div>
            <div style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E' }}>DHPPL 종합백신</span>
                <AlertCircle size={16} color="#92400E" />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700 }}>예정 (D-15일)</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab View 3 / Main: Routine Timeline & Quick Health Check */}
      {(activeSubTab === 'routine' || activeSubTab === undefined) && (
        <>
          {/* Daily Routine Timeline Feed */}
          <DailyRoutineTimeline 
            activePet={activePet}
            routineChecked={routineChecked}
            onToggleRoutine={toggleRoutine}
            onOpenMedScheduler={() => setShowMedModal(true)}
          />

          {/* Quick 3-State Health Check Section */}
          <QuickHealthCheck 
            healthStatus={healthStatus}
            setHealthStatus={setHealthStatus}
            healthMemo={healthMemo}
            setHealthMemo={setHealthMemo}
            onSaveHealthLog={handleSaveHealthLog}
          />
        </>
      )}

      {/* Medication 30-Day Scheduler Modal */}
      <MedicationScheduler 
        showMedModal={showMedModal}
        onClose={() => setShowMedModal(false)}
        medName={medName}
        setMedName={setMedName}
        medFrequency={medFrequency}
        setMedFrequency={setMedFrequency}
        medIntervalDays={medIntervalDays}
        setMedIntervalDays={setMedIntervalDays}
        medTime={medTime}
        onOpenTimePicker={() => setShowTimePickerModal(true)}
        onSaveScheduler={handleSaveMedScheduler}
      />

      {/* Scroll Time Picker Modal */}
      {showTimePickerModal && (
        <ScrollTimePickerModal
          title="복용 시간 설정"
          initialPeriod={pickerPeriod}
          initialHour={pickerHour}
          initialMinute={pickerMinute}
          onConfirm={(formattedTime, period, hour, minute) => {
            setPickerPeriod(period);
            setPickerHour(hour);
            setPickerMinute(minute);
            setMedTime(formattedTime);
            setShowTimePickerModal(false);
          }}
          onCancel={() => setShowTimePickerModal(false)}
          primaryColor="var(--main-primary)"
          textColor="var(--text-main)"
          mutedColor="var(--text-muted)"
        />
      )}

    </div>
  );
};

export default Care;
