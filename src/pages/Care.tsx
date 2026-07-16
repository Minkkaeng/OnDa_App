import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePetStore } from '../store/petStore';
import PoopAnalyzer from '../components/care/PoopAnalyzer';

const Care: React.FC = () => {
  const { pets, activePetId, updatePet, showAlert, addCalendarEvent } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [showPoopAnalyzer, setShowPoopAnalyzer] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [medicationTime, setMedicationTime] = useState('');
  const [allergies, setAllergies] = useState('');
  const [walkDepartTime, setWalkDepartTime] = useState('');
  const [walkDuration, setWalkDuration] = useState('');

  // Time Picker Modal states
  const [activePicker, setActivePicker] = useState<'medication' | 'depart' | 'duration' | null>(null);
  const [pickerHour, setPickerHour] = useState('09');
  const [pickerMinute, setPickerMinute] = useState('00');
  const [pickerDurationHour, setPickerDurationHour] = useState('0');
  const [pickerDurationMinute, setPickerDurationMinute] = useState('30');

  // Today's Date Str Helper
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // 1. Daily Health Tracker State & Effects
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [dailyHealth, setDailyHealth] = useState<{ stool?: string; meal?: string; energy?: string }>({});

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const nextStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (nextStr <= getTodayStr()) {
      setSelectedDate(nextStr);
    }
  };

  useEffect(() => {
    if (activePetId) {
      const saved = localStorage.getItem(`onda_daily_health_${activePetId}_${selectedDate}`);
      if (saved) {
        try {
          setDailyHealth(JSON.parse(saved));
        } catch {
          setDailyHealth({});
        }
      } else {
        setDailyHealth({});
      }
    }
  }, [activePetId, selectedDate]);

  const handleToggleHealth = (category: 'stool' | 'meal' | 'energy', value: string) => {
    if (!activePetId) return;
    const updated = { ...dailyHealth, [category]: dailyHealth[category] === value ? undefined : value };
    setDailyHealth(updated);
    localStorage.setItem(`onda_daily_health_${activePetId}_${selectedDate}`, JSON.stringify(updated));
  };

  const handleSaveHealthLogs = () => {
    showAlert('기초 건강 기록이 안전하게 저장되었습니다! 🐾');
  };

  // 2. Weight History State & Form Submit
  const [newWeight, setNewWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]);

  useEffect(() => {
    if (activePetId) {
      const saved = localStorage.getItem(`onda_pet_weight_history_${activePetId}`);
      if (saved) {
        try {
          setWeightHistory(JSON.parse(saved));
        } catch {
          setWeightHistory([]);
        }
      } else {
        setWeightHistory([]);
      }
    }
  }, [activePetId]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePet || !newWeight.trim()) return;
    const wtNum = parseFloat(newWeight);
    if (isNaN(wtNum) || wtNum <= 0) {
      showAlert('올바른 몸무게를 입력해주세요.');
      return;
    }

    try {
      await updatePet({
        ...activePet,
        weight: wtNum
      });

      const todayStr = getTodayStr();
      const updatedHistory = [{ date: todayStr, weight: wtNum }, ...weightHistory.filter(h => h.date !== todayStr)].slice(0, 5);
      setWeightHistory(updatedHistory);
      localStorage.setItem(`onda_pet_weight_history_${activePet.id}`, JSON.stringify(updatedHistory));
      setNewWeight('');
      showAlert('몸무게가 성공적으로 기록되었습니다!');
    } catch (err) {
      console.error(err);
      showAlert('몸무게 저장 중 오류가 발생했습니다.');
    }
  };

  // 3. Vaccination Scheduler State & Calculation
  const [vaccines, setVaccines] = useState<{ dhppi?: string; corona?: string; rabies?: string; parasite?: string }>({});

  useEffect(() => {
    if (activePetId) {
      const saved = localStorage.getItem(`onda_pet_vaccines_${activePetId}`);
      if (saved) {
        try {
          setVaccines(JSON.parse(saved));
        } catch {
          setVaccines({});
        }
      } else {
        setVaccines({});
      }
    }
  }, [activePetId]);

  const handleUpdateVaccine = (category: 'dhppi' | 'corona' | 'rabies' | 'parasite', dateStr: string) => {
    if (!activePetId) return;
    const updated = { ...vaccines, [category]: dateStr };
    setVaccines(updated);
    localStorage.setItem(`onda_pet_vaccines_${activePetId}`, JSON.stringify(updated));
    showAlert('접종(투약) 일정이 기록되었습니다.');
  };

  const getDDay = (lastDateStr?: string, type: 'annual' | 'monthly' = 'annual') => {
    if (!lastDateStr) return '기록 없음';
    const last = new Date(lastDateStr);
    const next = new Date(last);
    if (type === 'annual') {
      next.setFullYear(last.getFullYear() + 1);
    } else {
      next.setDate(last.getDate() + 30);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);

    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays < 0) return `기한 지남 (D+${Math.abs(diffDays)})`;
    return `D-${diffDays}`;
  };

  // Sync state with active pet
  useEffect(() => {
    if (activePet) {
      // Profile.tsx에서 입력된 데이터를 기본값으로 폴백하여 연결
      setMedicationName(activePet.medicationName || activePet.medications || '');
      setMedicationTime(activePet.medicationTime || '');
      setAllergies(activePet.allergies || '');
      
      const defaultWalkTime = activePet.walkDepartTime || activePet.walkTime || '';
      // "오후 07:00 지정" -> "19:00" 등 시간 추출 로직이 없어도 일단 텍스트 그대로 들어감
      setWalkDepartTime(defaultWalkTime.replace('나가는 시간: ', ''));
      
      const defaultWalkGoal = activePet.walkDuration || activePet.walkGoal || '';
      setWalkDuration(defaultWalkGoal.replace('목표: ', ''));
    }
  }, [activePet, isEditing]);

  // Local Page Guide disabled for unified global tour

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePet) return;

    try {
      const formattedMedications = medicationName && medicationTime ? `${medicationName} (${medicationTime})` : (medicationName || medicationTime || '');
      const formattedWalkGoal = walkDuration ? `${walkDuration}` : '';

      await updatePet({
        ...activePet,
        medicationName: medicationName.trim() || undefined,
        medicationTime: medicationTime.trim() || undefined,
        medications: formattedMedications.trim() || undefined,
        allergies: allergies.trim() || undefined,
        walkDepartTime: walkDepartTime.trim() || undefined,
        walkDuration: formattedWalkGoal.trim() || undefined,
        walkTime: walkDepartTime ? `나가는 시간: ${walkDepartTime}` : undefined,
        walkGoal: formattedWalkGoal ? `목표: ${formattedWalkGoal}` : undefined
      });
      showAlert('케어 특별 정보가 성공적으로 저장되었습니다!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showAlert('저장 중 오류가 발생했습니다.');
    }
  };

  const getSchedulerTasks = () => {
    const tasks = [];
    if (activePet) {
      if (activePet.allergies) {
        tasks.push({
          id: 't-allergies',
          title: `⚠️ 알레르기 주의: ${activePet.allergies}`,
          desc: '반려견 알레르기 유발 물질 급여 제한 및 밀착 케어',
          status: '주의 요망',
          completed: false
        });
      }
      if (activePet.medications) {
        tasks.push({
          id: 't-meds',
          title: `💊 약 복용: ${activePet.medications}`,
          desc: '정기 투약 스케줄 준수 및 상태 모니터링',
          status: '대기중',
          completed: false
        });
      }
      if (activePet.walkTime || activePet.walkGoal) {
        tasks.push({
          id: 't-walk',
          title: `🏃 산책 계획: ${activePet.walkTime || '시간 미정'} (${activePet.walkGoal || '목표 미정'})`,
          desc: '오늘의 목표 산책 활동 완료하기',
          status: '대기중',
          completed: false
        });
      }
    }
    return tasks;
  };

  const tasks = getSchedulerTasks();
  const hasCareInfo = activePet && (activePet.medications || activePet.allergies || activePet.walkTime || activePet.walkGoal);

  if (!activePet) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-gray)' }}>
        반려동물을 먼저 등록해주세요.
      </div>
    );
  }

  return (
    <>
      {/* Care Guide overlay disabled for global tour */}

      <div style={{ paddingBottom: '16px' }}>
        <div className="care-layout" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 0 }}>
        
        {/* 1. Scheduler Timeline */}
        <div 
          id="care-guide-step1" 
          className="panel care-col" 
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '16px', 
            width: '100%', 
            boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)',
            marginBottom: '0'
          }}
        >
          <h2 className="care-title" style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
            연동 실시간 스케줄러
          </h2>
          
          <div className="task-list">
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--muted-gray)', lineHeight: 1.6 }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🗓️</span>
                <strong>현재 활성화된 연동 스케줄이 없습니다.</strong>
                <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--muted-gray)', margin: 0 }}>
                  아래의 케어 특별 정보 카드에서 알레르기, 투약 정보, 산책 시간 등을 입력해 주세요. 스케줄이 여기에 자동으로 나타납니다.
                </p>
              </div>
            ) : (
              tasks.map(task => {
                const isWarning = task.status === '주의 요망';
                const statusClass = isWarning ? 'warning' : 'pending';
                const statusColor = isWarning ? 'var(--blood-coral)' : 'var(--waiting-yellow)';
                
                return (
                  <div 
                    key={task.id} 
                    className={`task-card ${statusClass}`}
                    style={{ background: 'var(--white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}
                  >
                    <div className="task-info">
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--deep-navy)', marginBottom: '4px', margin: 0 }}>{task.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted-gray)', margin: 0 }}>{task.desc}</p>
                    </div>
                    <div 
                      className={`task-status ${statusClass}`}
                      style={{ border: `1px solid ${statusColor}`, color: statusColor, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem' }}
                    >
                      {task.status}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 기초 건강 기록 */}
        <div 
          className="panel" 
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '16px', 
            width: '100%', 
            boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)',
            marginBottom: '0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              💩 기초 건강 기록
            </h2>
            
            {/* 날짜 토글 선택기 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--ice-white)', padding: '4px 8px', borderRadius: '20px' }}>
              <button 
                onClick={handlePrevDay}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: 'var(--deep-navy)', fontWeight: 'bold' }}
              >
                &lt;
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep-navy)' }}>
                {selectedDate === getTodayStr() ? '오늘' : selectedDate.split('-').slice(1).join('.')}
              </span>
              <button 
                onClick={handleNextDay}
                disabled={selectedDate === getTodayStr()}
                style={{ background: 'none', border: 'none', cursor: selectedDate === getTodayStr() ? 'default' : 'pointer', padding: '0 4px', color: selectedDate === getTodayStr() ? 'var(--steel-gray)' : 'var(--deep-navy)', fontWeight: 'bold' }}
              >
                &gt;
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* [추후 릴리즈 예정] AI 배변 분석 기능
            <button
              onClick={() => setShowPoopAnalyzer(true)}
              style={{
                background: 'linear-gradient(135deg, #14C3A3, #0E9B82)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(20, 195, 163, 0.3)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📸</span> AI 배변 사진 분석하기
            </button>
            */}
            
            {/* 세그먼트 컨트롤 렌더링 헬퍼 컴포넌트 */}
            {(() => {
              const SegmentControl = ({ label, category, options }: { label: string, category: 'stool'|'meal'|'energy', options: {value:string, label:string}[] }) => (
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', display: 'block' }}>{label}</label>
                  <div style={{ 
                    display: 'flex', 
                    background: 'var(--ice-white)', 
                    padding: '4px', 
                    borderRadius: '12px',
                    position: 'relative'
                  }}>
                    {options.map(opt => {
                      const isActive = dailyHealth[category] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleToggleHealth(category, opt.value)}
                          style={{
                            flex: 1,
                            padding: '10px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: isActive ? 800 : 600,
                            cursor: 'pointer',
                            backgroundColor: isActive ? 'var(--white)' : 'transparent',
                            color: isActive ? 'var(--deep-navy)' : 'var(--muted-gray)',
                            boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 1
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );

              return (
                <>
                  <SegmentControl 
                    label="배변 상태" 
                    category="stool" 
                    options={[{ value: 'good', label: '정상 💩' }, { value: 'loose', label: '설사 💧' }, { value: 'hard', label: '변비 🪵' }]} 
                  />
                  <SegmentControl 
                    label="식사 및 음수량" 
                    category="meal" 
                    options={[{ value: 'full', label: '완식 🍚' }, { value: 'half', label: '보통 🥣' }, { value: 'none', label: '남김 ❌' }]} 
                  />
                  <SegmentControl 
                    label="활력 컨디션" 
                    category="energy" 
                    options={[{ value: 'active', label: '좋음 ⚡' }, { value: 'normal', label: '보통 🙂' }, { value: 'low', label: '기운없음 😴' }]} 
                  />
                </>
              );
            })()}

            {/* Save Button */}
            <div style={{ marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleSaveHealthLogs}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--mint-green)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(20, 195, 163, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                건강 기록 저장하기 💾
              </button>
            </div>
          </div>
        </div>

        {/* 체중 기록 및 히스토리 */}
        <div 
          className="panel" 
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '16px', 
            width: '100%', 
            boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)',
            marginBottom: '0'
          }}
        >
          <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
            ⚖️ 체중 기록 및 히스토리
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '12px 16px', background: 'var(--ice-white)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--deep-navy)', fontWeight: 700 }}>현재 체중</span>
            <span style={{ fontSize: '1.2rem', color: 'var(--mint-green)', fontWeight: 800 }}>{activePet.weight ? `${activePet.weight} kg` : '기록 없음'}</span>
          </div>

          <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="number" 
              step="0.01"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="예) 5.4"
              className="form-input" 
              style={{ flex: 1, height: '40px', fontSize: '0.9rem', margin: 0 }}
            />
            <button 
              type="submit" 
              className="btn-submit" 
              style={{ width: 'auto', minWidth: '80px', marginTop: 0, padding: '10px 16px', fontSize: '0.85rem' }}
            >
              기록하기
            </button>
          </form>

          {weightHistory.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--deep-navy)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>체중 변화 차트</label>
              <div style={{ height: '140px', width: '100%', background: 'var(--ice-white)', borderRadius: '12px', padding: '12px 12px 0 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...weightHistory].reverse()} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-gray)' }} axisLine={false} tickLine={false} minTickGap={10} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--muted-gray)' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                      labelStyle={{ fontSize: '0.75rem', color: 'var(--muted-gray)', marginBottom: '4px' }}
                      itemStyle={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--mint-green)' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="var(--mint-green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--mint-green)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* 정기 예방의학 D-Day 스케줄 */}
        <div 
          className="panel" 
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '16px', 
            width: '100%', 
            boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)',
            marginBottom: '0'
          }}
        >
          <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
            💉 정기 예방의학 D-Day 스케줄
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { id: 'dhppi', label: '🧪 종합백신 (DHPPi)', type: 'annual' },
              { id: 'corona', label: '🦠 코로나 장염 백신', type: 'annual' },
              { id: 'rabies', label: '🐕 광견병 예방 백신', type: 'annual' },
              { id: 'parasite', label: '🪱 내/외부 기생충 케어', type: 'monthly' }
            ].map(vac => {
              const lastDate = vaccines[vac.id as 'dhppi' | 'corona' | 'rabies' | 'parasite'];
              const ddayStatus = getDDay(lastDate, vac.type as 'annual' | 'monthly');
              
              const isOverdue = ddayStatus.includes('지남') || ddayStatus === 'D-Day' || !lastDate;
              
              const statusColor = isOverdue ? 'var(--blood-coral)' : 'var(--completed-green)';
              const statusBg = isOverdue ? 'var(--blood-coral-light)' : 'var(--completed-green-light)';
              
              return (
                <div key={vac.id} style={{ borderBottom: '1px solid var(--ice-white)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep-navy)' }}>{vac.label}</span>
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 800, 
                        color: statusColor,
                        backgroundColor: statusBg,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      {ddayStatus}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="date"
                      value={lastDate || ''}
                      onChange={(e) => handleUpdateVaccine(vac.id as 'dhppi' | 'corona' | 'rabies' | 'parasite', e.target.value)}
                      className="form-input"
                      style={{ height: '34px', fontSize: '0.8rem', padding: '0 8px', flex: 1, margin: 0 }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>마지막 접종일</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Special Care Info Form/Viewer Card */}
        <div 
          id="care-guide-step2" 
          className="panel"
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '16px', 
            width: '100%', 
            boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)'
          }}
        >
          <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
            반려견 케어 특별 정보
          </h2>

          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>투약 약물 이름</label>
                <input 
                  type="text" 
                  value={medicationName} 
                  onChange={(e) => setMedicationName(e.target.value)} 
                  className="form-input" 
                  placeholder="예) 안약, 유산균, 관절약"
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>투약 시간 설정</label>
                <button 
                  type="button" 
                  className="form-input" 
                  style={{ 
                    textAlign: 'left', 
                    cursor: 'pointer', 
                    background: 'var(--white)',
                    color: medicationTime ? 'var(--deep-navy)' : 'var(--muted-gray)'
                  }}
                  onClick={() => {
                    if (medicationTime) {
                      const [h, m] = medicationTime.split(':');
                      setPickerHour(h);
                      setPickerMinute(m);
                    } else {
                      setPickerHour('09');
                      setPickerMinute('00');
                    }
                    setActivePicker('medication');
                  }}
                >
                  {medicationTime || '예) 10:00'}
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>알레르기 및 주의사항</label>
                <input 
                  type="text" 
                  value={allergies} 
                  onChange={(e) => setAllergies(e.target.value)} 
                  className="form-input" 
                  placeholder="예) 닭고기 알레르기"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>산책 나가는 시간</label>
                <button 
                  type="button" 
                  className="form-input" 
                  style={{ 
                    textAlign: 'left', 
                    cursor: 'pointer', 
                    background: 'var(--white)',
                    color: walkDepartTime ? 'var(--deep-navy)' : 'var(--muted-gray)'
                  }}
                  onClick={() => {
                    if (walkDepartTime) {
                      const [h, m] = walkDepartTime.split(':');
                      setPickerHour(h);
                      setPickerMinute(m);
                    } else {
                      setPickerHour('18');
                      setPickerMinute('00');
                    }
                    setActivePicker('depart');
                  }}
                >
                  {walkDepartTime || '예) 18:00'}
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>산책 목표 시간</label>
                <button 
                  type="button" 
                  className="form-input" 
                  style={{ 
                    textAlign: 'left', 
                    cursor: 'pointer', 
                    background: 'var(--white)',
                    color: walkDuration ? 'var(--deep-navy)' : 'var(--muted-gray)'
                  }}
                  onClick={() => {
                    if (walkDuration) {
                      if (walkDuration.includes('시간')) {
                        const parts = walkDuration.split('시간');
                        setPickerDurationHour(parts[0].trim());
                        const minPart = parts[1].replace('분', '').trim();
                        setPickerDurationMinute(minPart || '0');
                      } else {
                        setPickerDurationHour('0');
                        setPickerDurationMinute(walkDuration.replace('분', '').trim() || '30');
                      }
                    } else {
                      setPickerDurationHour('0');
                      setPickerDurationMinute('30');
                    }
                    setActivePicker('duration');
                  }}
                >
                  {walkDuration || '예) 30분'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                <button 
                  type="button" 
                  className="btn-submit"
                  onClick={() => setIsEditing(false)}
                  style={{ 
                    backgroundColor: 'var(--muted-gray)', 
                    padding: '10px 24px', 
                    fontSize: '0.9rem',
                    width: 'auto',
                    minWidth: '100px',
                    marginTop: 0
                  }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  style={{ 
                    backgroundColor: 'var(--mint-green)',
                    padding: '10px 24px', 
                    fontSize: '0.9rem',
                    width: 'auto',
                    minWidth: '120px',
                    marginTop: 0
                  }}
                >
                  저장하기
                </button>
              </div>
            </form>
          ) : (
            <div>
              {hasCareInfo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--ice-white)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 700, width: '120px', fontSize: '0.9rem', color: 'var(--deep-navy)' }}>💊 투약 정보</span>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>
                      {activePet.medicationName ? `${activePet.medicationName} (${activePet.medicationTime || '시간 미지정'})` : activePet.medications || '등록된 투약 정보 없음'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--ice-white)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 700, width: '120px', fontSize: '0.9rem', color: 'var(--deep-navy)' }}>⚠️ 알레르기</span>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>{activePet.allergies || '등록된 알레르기 없음'}</span>
                  </div>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--ice-white)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 700, width: '120px', fontSize: '0.9rem', color: 'var(--deep-navy)' }}>⏰ 선호 산책 시간</span>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>{activePet.walkDepartTime || activePet.walkTime || '등록된 선호 시간 없음'}</span>
                  </div>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--ice-white)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 700, width: '120px', fontSize: '0.9rem', color: 'var(--deep-navy)' }}>🎯 산책 목표</span>
                    <span style={{ fontSize: '0.9rem', color: '#555' }}>{activePet.walkDuration || activePet.walkGoal || '등록된 산책 목표 없음'}</span>
                  </div>

                  <button 
                    type="button"
                    className="btn-submit"
                    onClick={() => setIsEditing(true)}
                    style={{ marginTop: '16px', padding: '10px', fontSize: '0.9rem' }}
                  >
                    정보 수정하기
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.85rem', marginBottom: '14px', margin: '0 0 14px 0' }}>
                    등록된 케어 특별 정보가 없습니다.<br />아래 버튼을 터치하여 케어 필수 정보를 채워보세요!
                  </p>
                  <button 
                    type="button"
                    className="btn-submit"
                    onClick={() => setIsEditing(true)}
                    style={{ padding: '10px', fontSize: '0.9rem', marginTop: 0 }}
                  >
                    특별 정보 입력하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Time & Duration Picker Modal */}
      {activePicker && (
        <div 
          className="modal-overlay" 
          style={{ 
            display: 'flex', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.5)', 
            zIndex: 150000, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivePicker(null);
          }}
        >
          <div className="modal-content" style={{ background: 'white', padding: '16px', borderRadius: '12px', width: '90%', maxWidth: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', gap: '16px' }}>
            <h4 style={{ margin: 0, color: 'var(--deep-navy)', fontSize: '1rem', fontWeight: 800 }}>
              {activePicker === 'medication' ? '투약 시간 설정' : activePicker === 'depart' ? '산책 출발 시간 설정' : '산책 목표 시간 설정'}
            </h4>
            
            {activePicker === 'duration' ? (
              // Duration Picker (Hours & Minutes)
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                <select 
                  value={pickerDurationHour} 
                  onChange={(e) => setPickerDurationHour(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <option key={i} value={i}>{i}시간</option>
                  ))}
                </select>
                <select 
                  value={pickerDurationMinute} 
                  onChange={(e) => setPickerDurationMinute(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {['00', '10', '20', '30', '40', '50'].map(m => (
                    <option key={m} value={m}>{parseInt(m)}분</option>
                  ))}
                </select>
              </div>
            ) : (
              // Standard Time Picker (Hour : Minute)
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                <select 
                  value={pickerHour} 
                  onChange={(e) => setPickerHour(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hStr = String(i).padStart(2, '0');
                    return <option key={hStr} value={hStr}>{hStr}시</option>;
                  })}
                </select>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>:</span>
                <select 
                  value={pickerMinute} 
                  onChange={(e) => setPickerMinute(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const mStr = String(i).padStart(2, '0');
                    return <option key={mStr} value={mStr}>{mStr}분</option>;
                  })}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                type="button" 
                className="btn-submit"
                onClick={() => setActivePicker(null)}
                style={{ backgroundColor: 'var(--muted-gray)', flex: 1, marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
              >
                취소
              </button>
              <button 
                type="button" 
                className="btn-submit"
                onClick={() => {
                  if (activePicker === 'duration') {
                    let formatted = '';
                    const hrs = parseInt(pickerDurationHour);
                    const mins = parseInt(pickerDurationMinute);
                    if (hrs > 0) {
                      formatted = `${hrs}시간 ${mins > 0 ? `${mins}분` : ''}`.trim();
                    } else {
                      formatted = `${mins}분`;
                    }
                    setWalkDuration(formatted);
                  } else {
                    const timeStr = `${pickerHour}:${pickerMinute}`;
                    if (activePicker === 'medication') {
                      setMedicationTime(timeStr);
                    } else if (activePicker === 'depart') {
                      setWalkDepartTime(timeStr);
                    }
                  }
                  setActivePicker(null);
                }}
                style={{ flex: 1, marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
              >
                설정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poop Analyzer Modal */}
      {showPoopAnalyzer && (
        <PoopAnalyzer
          onClose={() => setShowPoopAnalyzer(false)}
          onSave={async (eventData) => {
            try {
              if (activePet) {
                await addCalendarEvent({
                  petId: activePet.id,
                  date: eventData.date!,
                  type: eventData.type!,
                  title: eventData.title!,
                  content: eventData.content!,
                  imageUrl: eventData.imageUrl,
                  poopStatus: eventData.poopStatus,
                  aiAnalysisText: eventData.aiAnalysisText
                });
                showAlert('배변 기록이 다이어리 히스토리에 저장되었습니다!');
                setShowPoopAnalyzer(false);
              }
            } catch (err) {
              console.error(err);
              showAlert('기록 저장에 실패했습니다.');
            }
          }}
        />
      )}
      </div>
    </>
  );
};

export default Care;
