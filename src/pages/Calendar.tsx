import React, { useState, useEffect } from 'react';
import { usePetStore, type CalendarEvent } from '../store/petStore';
import { type EventType } from '../db';

const Calendar: React.FC = () => {
  const { pets, activePetId, events, addCalendarEvent, showAlert, updatePet } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Routine Form State
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);
  const [routineMeds, setRoutineMeds] = useState('');
  const [routineWalk, setRoutineWalk] = useState('');
  const [routineWalkGoal, setRoutineWalkGoal] = useState('');

  useEffect(() => {
    if (activePet) {
      setRoutineMeds(activePet.medications || '');
      setRoutineWalk(activePet.walkTime || '');
      setRoutineWalkGoal(activePet.walkGoal || '');
    }
  }, [activePet]);

  const handleSaveRoutine = async () => {
    if (activePet) {
      try {
        await updatePet({
          ...activePet,
          medications: routineMeds,
          walkTime: routineWalk,
          walkGoal: routineWalkGoal
        });
        showAlert('루틴 정보가 성공적으로 저장되었습니다.');
        setIsEditingRoutine(false);
      } catch {
        showAlert('루틴 저장 중 오류가 발생했습니다.');
      }
    }
  };

  // New Event Form State
  const [newEventType, setNewEventType] = useState<EventType>('diary');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');

  // Month & Year Nav Modal State
  const [showMonthNavModal, setShowMonthNavModal] = useState(false);
  const [navYear, setNavYear] = useState(new Date().getFullYear());
  const [navMonth, setNavMonth] = useState(new Date().getMonth());

  // List View Filter State
  const [searchYear, setSearchYear] = useState<string>('');
  const [searchMonth, setSearchMonth] = useState<string>('');

  // Local Page Guide disabled for unified global tour

  // calGuideSteps disabled for unified global tour

  // Sync Year/Month picker value with current calendar month
  useEffect(() => {
    setNavYear(currentMonth.getFullYear());
    setNavMonth(currentMonth.getMonth());
  }, [currentMonth, showMonthNavModal]);

  if (!activePet) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-gray)' }}>
        반려동물을 먼저 등록해주세요.
      </div>
    );
  }

  // Filter events for the active pet (Real Events)
  const realPetEvents = events.filter(e => e.petId === activePet.id);

  // Generate virtual events from Care tab vaccination & parasite logs
  const getVirtualEvents = (): CalendarEvent[] => {
    const vEvents: CalendarEvent[] = [];
    if (!activePet) return [];

    const savedVac = localStorage.getItem(`onda_vaccines_${activePet.id}`);
    if (savedVac) {
      try {
        const vaccines = JSON.parse(savedVac);
        const categories = [
          { id: 'dhppi', label: '종합백신 (DHPPi)', type: 'annual' },
          { id: 'corona', label: '코로나 장염 백신', type: 'annual' },
          { id: 'rabies', label: '광견병 예방 백신', type: 'annual' },
          { id: 'parasite', label: '내/외부 기생충 케어', type: 'monthly' }
        ];

        categories.forEach(vac => {
          const dateStr = vaccines[vac.id];
          if (dateStr) {
            // 1. Completed Vaccination Event
            vEvents.push({
              id: `v-vac-done-${vac.id}-${dateStr}`,
              petId: activePet.id,
              date: dateStr,
              type: 'schedule',
              title: `💉 [완료] ${vac.label}`,
              content: `케어 탭에서 기록된 예방의학 접종 완료 기록입니다. (${dateStr} 접종)`
            });

            // 2. Calculated Next Recommendation Date Event
            const last = new Date(dateStr);
            const next = new Date(last);
            if (vac.type === 'annual') {
              next.setFullYear(last.getFullYear() + 1);
            } else {
              next.setDate(last.getDate() + 30);
            }
            const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
            
            vEvents.push({
              id: `v-vac-next-${vac.id}-${nextStr}`,
              petId: activePet.id,
              date: nextStr,
              type: 'hospital',
              title: `📅 [예정] ${vac.label} 접종일`,
              content: `이전 접종일(${dateStr}) 기준 다음 권장 예방의학 스케줄 일자입니다.`
            });
          }
        });
      } catch (e) {
        console.error('Failed to parse vaccine records:', e);
      }
    }

    return vEvents;
  };

  const virtualEvents = getVirtualEvents();
  const petEvents = [...realPetEvents, ...virtualEvents];

  // Format Helper
  const formatDateStr = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Date Logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-based

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDateStr(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  const handleMonthNavSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentMonth(new Date(navYear, navMonth, 1));
    setShowMonthNavModal(false);
  };


  const daysGrid: Array<{
    dayNum: number;
    dateStr: string;
    type: 'prev' | 'curr' | 'next';
    isSun: boolean;
    isSat: boolean;
  }> = [];

  // 1. Prev Month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateStr = formatDateStr(month === 0 ? year - 1 : year, month === 0 ? 12 : month, d);
    const dayOfWeek = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, d).getDay();
    daysGrid.push({
      dayNum: d,
      dateStr,
      type: 'prev',
      isSun: dayOfWeek === 0,
      isSat: dayOfWeek === 6
    });
  }

  // 2. Current Month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(year, month + 1, d);
    const dayOfWeek = new Date(year, month, d).getDay();
    daysGrid.push({
      dayNum: d,
      dateStr,
      type: 'curr',
      isSun: dayOfWeek === 0,
      isSat: dayOfWeek === 6
    });
  }

  // 3. Next Month padding (fill up to 42 items)
  let nextDays = 1;
  while (daysGrid.length < 42) {
    const dateStr = formatDateStr(month === 11 ? year + 1 : year, month === 11 ? 1 : month + 2, nextDays);
    const dayOfWeek = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, nextDays).getDay();
    daysGrid.push({
      dayNum: nextDays,
      dateStr,
      type: 'next',
      isSun: dayOfWeek === 0,
      isSat: dayOfWeek === 6
    });
    nextDays++;
  }

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    
    // Auto shift month if clicking adjacent month day
    const clickedDate = new Date(dateStr);
    if (clickedDate.getMonth() !== month || clickedDate.getFullYear() !== year) {
      setCurrentMonth(clickedDate);
    }
    setShowDetailsModal(true);
  };

  const handleAddEventOpen = () => {
    const selectedDateObj = new Date(selectedDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDateObj > today) {
      setNewEventType('hospital');
    } else {
      setNewEventType('diary');
    }
    
    setNewEventTitle('');
    setNewEventContent('');
    setShowAddModal(true);
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showAlert('제목을 입력해주세요.');
      return;
    }

    try {
      await addCalendarEvent({
        petId: activePet.id,
        date: selectedDateStr,
        type: newEventType,
        title: newEventTitle,
        content: newEventContent
      });

      showAlert('기록이 추가되었습니다!');
      setShowAddModal(false);
      setNewEventTitle('');
      setNewEventContent('');
    } catch (err) {
      console.error(err);
      showAlert('저장 중 오류가 발생했습니다.');
    }
  };

  // Group events by date for List View
  const groupedEvents = petEvents.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));
  
  // Filter dates based on Search Year and Month
  const filteredDates = sortedDates.filter(dateStr => {
    const [yr, mo] = dateStr.split('-');
    if (searchYear && yr !== searchYear) return false;
    if (searchMonth && mo !== searchMonth) return false;
    return true;
  });

  const selectedDateEvents = petEvents.filter(e => e.date === selectedDateStr);
  const selectedDateObj = new Date(selectedDateStr);
  const formattedSelectedDate = `${selectedDateObj.getMonth() + 1}월 ${selectedDateObj.getDate()}일`;

  const isFutureDate = selectedDateObj > (() => {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t;
  })();

  return (
    <>
      {/* Calendar Guide overlay disabled for global tour */}

      <div style={{ paddingBottom: '16px' }}>
        {/* Routine Scheduler Panel */}
        <div className="panel" style={{ background: 'var(--white)', borderRadius: '16px', padding: '16px', boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              기본 루틴 설정
            </h2>
            <button 
              onClick={() => {
                if (isEditingRoutine) handleSaveRoutine();
                else setIsEditingRoutine(true);
              }} 
              style={{ fontSize: '0.85rem', color: isEditingRoutine ? 'white' : 'var(--mint-green)', background: isEditingRoutine ? 'var(--mint-green)' : 'var(--mint-green-light)', border: 'none', borderRadius: '12px', padding: '6px 12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {isEditingRoutine ? '저장하기' : '루틴 수정'}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ice-white)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted-gray)', fontWeight: 600 }}>정기 투약</span>
              {isEditingRoutine ? (
                <input 
                  type="text" value={routineMeds} onChange={(e) => setRoutineMeds(e.target.value)} 
                  placeholder="예: 심장사상충 매월 1일" className="form-input" style={{ width: '160px', padding: '6px 8px', margin: 0, fontSize: '0.85rem', height: 'auto' }} 
                />
              ) : (
                <span style={{ fontSize: '0.95rem', color: 'var(--deep-navy)', fontWeight: 800 }}>{activePet.medications || '미설정'}</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ice-white)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted-gray)', fontWeight: 600 }}>산책 목표량</span>
              {isEditingRoutine ? (
                <input 
                  type="text" value={routineWalkGoal} onChange={(e) => setRoutineWalkGoal(e.target.value)} 
                  placeholder="예: 30분 달성" className="form-input" style={{ width: '160px', padding: '6px 8px', margin: 0, fontSize: '0.85rem', height: 'auto' }} 
                />
              ) : (
                <span style={{ fontSize: '0.95rem', color: 'var(--deep-navy)', fontWeight: 800 }}>{activePet.walkGoal || '미설정'}</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted-gray)', fontWeight: 600 }}>산책 예정 시간</span>
              {isEditingRoutine ? (
                <input 
                  type="text" value={routineWalk} onChange={(e) => setRoutineWalk(e.target.value)} 
                  placeholder="예: 오후 7:00" className="form-input" style={{ width: '160px', padding: '6px 8px', margin: 0, fontSize: '0.85rem', height: 'auto' }} 
                />
              ) : (
                <span style={{ fontSize: '0.95rem', color: 'var(--deep-navy)', fontWeight: 800 }}>{activePet.walkTime || '미설정'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Header with fixed top right tabs */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '8px 0 16px 0' }}>
        <div className="cal-tabs">
          <button className={`cal-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>달력</button>
          <button className={`cal-tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>목록</button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <div id="view-calendar" className="cal-wrapper" style={{ marginTop: '8px' }}>
          <div className="cal-panel">
            
            {/* Header row with navigation & Today button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={handlePrevMonth} 
                  style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--deep-navy)', padding: '4px' }}
                >
                  ◀
                </button>
                <div 
                  className="cal-month-title" 
                  onClick={() => setShowMonthNavModal(true)} 
                  style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}
                >
                  {year}.{String(month + 1).padStart(2, '0')}
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>▼</span>
                </div>
                <button 
                  onClick={handleNextMonth} 
                  style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--deep-navy)', padding: '4px' }}
                >
                  ▶
                </button>
              </div>
              <button 
                onClick={handleGoToToday} 
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--steel-gray)',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  color: 'var(--deep-navy)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                오늘
              </button>
            </div>

            <div className="cal-header-row">
              <div style={{ color: 'var(--error-red)' }}>일</div>
              <div>월</div>
              <div>화</div>
              <div>수</div>
              <div>목</div>
              <div>금</div>
              <div style={{ color: '#3b82f6' }}>토</div>
            </div>

            <div className="cal-grid" style={{ touchAction: 'pan-y', position: 'relative' }}>
              {daysGrid.map((gridItem, idx) => {
                const isSun = gridItem.isSun;
                const isSat = gridItem.isSat;
                const isActive = gridItem.dateStr === selectedDateStr;
                const dayEvents = petEvents.filter(e => e.date === gridItem.dateStr);

                let dayClass = 'cal-day';
                if (gridItem.type === 'prev') dayClass += ' prev-month';
                if (gridItem.type === 'next') dayClass += ' next-month';
                if (isSun) dayClass += ' sun';
                if (isSat) dayClass += ' sat';
                if (isActive) dayClass += ' active';

                return (
                  <div 
                    key={idx}
                    className={dayClass}
                    onClick={() => handleDayClick(gridItem.dateStr)}
                  >
                    {/* Date Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
                      <span style={{ fontWeight: isActive ? '800' : '600', fontSize: '0.85rem' }}>{gridItem.dayNum}</span>
                      {isActive && activePet && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--muted-gray)', fontWeight: 700 }}>
                          {activePet.weight}kg
                        </span>
                      )}
                    </div>

                    {/* Events List inside Day Cell */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', overflow: 'hidden', flex: 1 }}>
                      {dayEvents.slice(0, 2).map((ev, eIdx) => {
                        const cleanTitle = ev.title.replace(/^[^\w\s\dㄱ-ㅎㅏ-ㅣ가-힣]/, '').trim() || ev.title;
                        const isHospital = ev.type === 'hospital';
                        
                        if (isHospital) {
                          return (
                            <div 
                              key={eIdx} 
                              style={{
                                backgroundColor: 'var(--error-red-light)',
                                color: 'var(--error-red)',
                                borderRadius: '4px',
                                fontSize: '0.55rem',
                                padding: '1px 3px',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                fontWeight: 800,
                                display: 'block',
                                lineHeight: '1.2'
                              }}
                              title={ev.title}
                            >
                              {cleanTitle}
                            </div>
                          );
                        } else {
                          const accentColor = ev.type === 'diary' ? 'var(--mint-green)' : (ev.type === 'poop' ? '#D97706' : '#8B5CF6');
                          return (
                            <div 
                              key={eIdx} 
                              style={{
                                borderLeft: `2.5px solid ${accentColor}`,
                                paddingLeft: '3px',
                                fontSize: '0.55rem',
                                color: 'var(--deep-navy)',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                fontWeight: 700,
                                display: 'block',
                                lineHeight: '1.2'
                              }}
                              title={ev.title}
                            >
                              {cleanTitle}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Event Pill Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={handleAddEventOpen}
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1.5px solid var(--steel-gray)',
                  borderRadius: '30px',
                  padding: '10px 24px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: 'var(--deep-navy)',
                  boxShadow: '0 4px 12px rgba(18, 27, 42, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  marginTop: '4px'
                }}
              >
                <span>{`${selectedDateObj.getMonth() + 1}월 ${selectedDateObj.getDate()}일에 추가`}</span>
                <span style={{ fontSize: '1.15rem', color: 'var(--mint-green)', fontWeight: 800 }}>+</span>
              </button>
            </div>

            <div className="cal-ad-zone" style={{ marginTop: '20px', padding: '12px' }}>
              <span className="ad-badge">AD ZONE</span>
              <div className="cal-ad-text" style={{ fontSize: '0.85rem' }}>우리 아이를 위한 안심 가습기전<br/><span style={{ fontSize: '0.75rem', color: '#666' }}>최대 35% 단독 할인 혜택</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div id="view-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          
          {/* List Search Filter Row */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            backgroundColor: 'var(--white)',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid var(--steel-gray)',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 800, color: 'var(--deep-navy)', fontSize: '0.85rem' }}>검색 필터</span>
            <div style={{ display: 'flex', gap: '6px', flexGrow: 1 }}>
              <select 
                value={searchYear} 
                onChange={(e) => setSearchYear(e.target.value)} 
                className="form-input" 
                style={{ padding: '6px 10px', borderRadius: '8px', flex: 1, minWidth: '90px', fontSize: '0.85rem' }}
              >
                <option value="">년도 전체</option>
                {Array.from({ length: 2028 - 2000 + 1 }, (_, i) => {
                  const yVal = 2000 + i;
                  return <option key={yVal} value={String(yVal)}>{yVal}년</option>;
                })}
              </select>
              <select 
                value={searchMonth} 
                onChange={(e) => setSearchMonth(e.target.value)} 
                className="form-input" 
                style={{ padding: '6px 10px', borderRadius: '8px', flex: 1, minWidth: '90px', fontSize: '0.85rem' }}
              >
                <option value="">월 전체</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const mVal = String(i + 1).padStart(2, '0');
                  return <option key={mVal} value={mVal}>{i + 1}월</option>;
                })}
              </select>
            </div>
            {(searchYear || searchMonth) && (
              <button 
                onClick={() => { setSearchYear(''); setSearchMonth(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--error-red)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: '4px'
                }}
              >
                초기화
              </button>
            )}
          </div>

          <div id="list-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDates.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', color: 'var(--muted-gray)', padding: '30px 0', fontSize: '0.9rem' }}>
                검색된 내역이 없습니다.
              </div>
            ) : (
              filteredDates.map(dateStr => {
                const dObj = new Date(dateStr);
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const titleStr = `${dObj.getMonth() + 1}월 ${dObj.getDate()}일 ${dayNames[dObj.getDay()]}요일`;
                
                return (
                  <div key={dateStr} className="panel" style={{ padding: '16px', marginBottom: 0 }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '1.05rem', fontWeight: 800 }}>{titleStr}</h3>
                    <div className="task-list">
                      {groupedEvents[dateStr].map(ev => {
                        const typeText = ev.type === 'poop' ? '배변' : (ev.type === 'diary' ? '일기' : (ev.type === 'hospital' ? '병원' : '일정'));
                        const typeColor = ev.type === 'hospital' ? 'var(--error-red)' : (ev.type === 'poop' ? '#8B5A2B' : 'var(--mint-green)');
                        
                        return (
                          <div key={ev.id} className="task-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="task-info">
                              <h3 style={{ marginBottom: '4px', fontSize: '0.95rem', fontWeight: 700 }}>{ev.title}</h3>
                              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{ev.content}</p>
                            </div>
                            <div className="task-status" style={{ color: typeColor, fontWeight: 700, fontSize: '0.85rem' }}>{typeText}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Date Details Modal */}
      {showDetailsModal && (
        <div 
          id="date-details-modal" 
          className="modal-overlay" 
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetailsModal(false);
          }}
        >
          <div className="cal-modal-content" style={{ position: 'relative', padding: '24px', width: '90%', maxWidth: '340px' }}>
            <button 
              onClick={() => setShowDetailsModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted-gray)' }}
            >
              &times;
            </button>
            <div id="date-details-content" style={{ minHeight: '160px', paddingBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>{formattedSelectedDate} 기록</h3>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(ev => {
                  const typeText = ev.type === 'poop' ? '배변' : (ev.type === 'diary' ? '일기' : (ev.type === 'hospital' ? '병원' : '일정'));
                  return (
                    <div key={ev.id} style={{ background: 'var(--ice-white)', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-gray)', fontWeight: 700, marginBottom: '2px' }}>[{typeText}]</div>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--deep-navy)', margin: 0, fontWeight: 700 }}>{ev.title}</h3>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', margin: 0, color: '#444' }}>{ev.content}</p>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--muted-gray)', padding: '30px 0', fontSize: '0.9rem' }}>등록된 내역이 없습니다.</div>
              )}
            </div>
            <button 
              className="cal-fab" 
              onClick={() => {
                setShowDetailsModal(false);
                handleAddEventOpen();
              }}
              style={{ width: '48px', height: '48px', fontSize: '1.5rem', right: '16px', bottom: '16px' }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div 
          id="add-event-modal" 
          className="modal-overlay" 
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110000, alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="cal-modal-content" style={{ position: 'relative', padding: '24px', width: '90%', maxWidth: '340px' }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted-gray)' }}
            >
              &times;
            </button>
            <form onSubmit={handleAddEventSubmit}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>{formattedSelectedDate} 새로운 기록 추가</h3>
              
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>기록 유형</label>
                <select 
                  value={newEventType} 
                  onChange={(e) => setNewEventType(e.target.value as EventType)}
                  className="form-input" 
                  style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                >
                  {!isFutureDate && <option value="diary">일상 기록 (일기)</option>}
                  <option value="hospital">병원 예약 / 방문</option>
                  <option value="schedule">기타 일정</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>제목</label>
                <input 
                  type="text" 
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="form-input" 
                  placeholder="예: 심장사상충 예방접종" 
                  style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>상세 내용</label>
                <textarea 
                  value={newEventContent}
                  onChange={(e) => setNewEventContent(e.target.value)}
                  className="cal-editor-textarea" 
                  style={{ minHeight: '80px', fontSize: '0.9rem', border: '1px solid var(--steel-gray)', padding: '8px', borderRadius: '8px' }} 
                  placeholder="상세 내용을 입력해주세요..."
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="editor-submit-btn" style={{ padding: '12px', fontSize: '0.95rem', marginTop: '10px', borderRadius: '8px' }}>기록 저장하기</button>
            </form>
          </div>
        </div>
      )}

      {/* Year & Month Selection Navigation Modal */}
      {showMonthNavModal && (
        <div 
          className="modal-overlay" 
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 120000, alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMonthNavModal(false);
          }}
        >
          <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', gap: '16px' }}>
            <h4 style={{ margin: 0, color: 'var(--deep-navy)', fontSize: '1rem', fontWeight: 800 }}>날짜로 이동</h4>
            
            <form onSubmit={handleMonthNavSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {/* Year Selection */}
                <select 
                  value={navYear} 
                  onChange={(e) => setNavYear(parseInt(e.target.value))}
                  className="form-input" 
                  style={{ padding: '8px', flex: 1, fontSize: '0.95rem', fontWeight: 'bold' }}
                >
                  {Array.from({ length: 2028 - 2000 + 1 }, (_, i) => {
                    const yVal = 2000 + i;
                    return <option key={yVal} value={yVal}>{yVal}년</option>;
                  })}
                </select>

                {/* Month Selection */}
                <select 
                  value={navMonth} 
                  onChange={(e) => setNavMonth(parseInt(e.target.value))}
                  className="form-input" 
                  style={{ padding: '8px', flex: 1, fontSize: '0.95rem', fontWeight: 'bold' }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    return <option key={i} value={i}>{i + 1}월</option>;
                  })}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowMonthNavModal(false)} 
                  className="btn-submit" 
                  style={{ flex: 1, backgroundColor: 'var(--muted-gray)', borderColor: 'var(--muted-gray)', marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  style={{ flex: 1, marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
                >
                  이동
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Calendar;
