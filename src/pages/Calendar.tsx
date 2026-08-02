import React, { useState, useEffect, useRef } from 'react';
import { usePetStore, type CalendarEvent } from '../store/petStore';
import { type EventType } from '../db';
import { Bell, Syringe, Calendar as CalendarIcon, BookOpen, Activity, Heart } from 'lucide-react';

const getEventBadgeInfo = (ev: CalendarEvent) => {
  let text = '일정';
  let color = '#8B5CF6';
  let bg = '#F3E8FF';
  
  if (ev.type === 'diary') {
    text = '일기';
    color = 'var(--main-primary)';
    bg = 'rgba(20, 195, 163, 0.1)';
  } else if (ev.type === 'poop') {
    text = '배변';
    color = '#D97706';
    bg = 'rgba(217, 119, 6, 0.1)';
  } else if (ev.type === 'walk') {
    text = '산책';
    color = '#10B981';
    bg = 'rgba(16, 185, 129, 0.1)';
  } else if (ev.type === 'hospital' || ev.category === '병원') {
    text = '병원';
    color = '#EF4444';
    bg = '#FEE2E2';
  } else if (ev.category === '카페') {
    text = '카페';
    color = '#D97706';
    bg = '#FEF3C7';
  } else if (ev.category === '유치원' || ev.category === '어린이집') {
    text = '유치원';
    color = '#10B981';
    bg = '#ECFDF5';
  }
  
  return { text, color, bg };
};

const Calendar: React.FC = () => {
  const { pets, activePetId, events, addCalendarEvent, showAlert } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [newEventType, setNewEventType] = useState<string>('diary');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventAlarm, setNewEventAlarm] = useState(false);


  // Month & Year Nav Modal State
  const [showMonthNavModal, setShowMonthNavModal] = useState(false);
  const [navYear, setNavYear] = useState(new Date().getFullYear());
  const [navMonth, setNavMonth] = useState(new Date().getMonth());

  // List View Filter State
  const [searchYear, setSearchYear] = useState<string>('');
  const [searchMonth, setSearchMonth] = useState<string>('');
  const lastClickRef = useRef<{ dateStr: string; timestamp: number } | null>(null);

  // Local Page Guide disabled for unified global tour

  // calGuideSteps disabled for unified global tour

  // Sync Year/Month picker value with current calendar month
  useEffect(() => {
    setNavYear(currentMonth.getFullYear());
    setNavMonth(currentMonth.getMonth());
  }, [currentMonth, showMonthNavModal]);

  if (!activePet) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
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
              title: `[완료] ${vac.label}`,
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
              title: `[예정] ${vac.label} 접종일`,
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
    const now = Date.now();
    const isDoubleTap = lastClickRef.current && 
                        lastClickRef.current.dateStr === dateStr && 
                        (now - lastClickRef.current.timestamp) < 300;
    
    setSelectedDateStr(dateStr);
    
    // Auto shift month if clicking adjacent month day
    const clickedDate = new Date(dateStr);
    if (clickedDate.getMonth() !== month || clickedDate.getFullYear() !== year) {
      setCurrentMonth(clickedDate);
    }
    
    if (isDoubleTap) {
      setShowDetailsModal(true);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { dateStr, timestamp: now };
    }
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
    setNewEventTime('10:00');
    setNewEventAlarm(false);
    setShowAddModal(true);
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let type = newEventType;
    let category = '';

    if (newEventType === 'schedule_cafe') {
      type = 'schedule';
      category = '카페';
    } else if (newEventType === 'schedule_kinder') {
      type = 'schedule';
      category = '유치원';
    } else if (newEventType === 'schedule_other') {
      type = 'schedule';
      category = '기타';
    } else if (newEventType === 'hospital') {
      type = 'hospital';
      category = '병원';
    } else if (newEventType === 'diary') {
      type = 'diary';
      category = '일상';
    }

    // Title fallback if empty
    let finalTitle = newEventTitle.trim();
    if (!finalTitle) {
      if (newEventType === 'diary') finalTitle = '일상 기록';
      else if (newEventType === 'hospital') finalTitle = '병원 방문';
      else if (newEventType === 'schedule_cafe') finalTitle = '카페 방문';
      else if (newEventType === 'schedule_kinder') finalTitle = '유치원/어린이집 방문';
      else finalTitle = '기타 일정';
    }

    try {
      await addCalendarEvent({
        petId: activePet.id,
        date: selectedDateStr,
        type: type as EventType,
        title: finalTitle,
        content: newEventContent,
        time: newEventTime,
        hasAlarm: newEventAlarm,
        category: category
      });

      showAlert('기록이 추가되었습니다!');
      setShowAddModal(false);
      setNewEventTitle('');
      setNewEventContent('');
      setNewEventTime('10:00');
      setNewEventAlarm(false);
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

      <div className="onda-page-container">

      {/* Unified Top Control Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 8px 16px', borderBottom: '1px solid var(--border-color)', margin: '8px 0 16px 0' }}>
        {/* Left Side: Month navigation / Page Title */}
        {activeTab === 'calendar' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={handlePrevMonth} 
              style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-main)', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              ◀
            </button>
            <div 
              className="cal-month-title" 
              onClick={() => setShowMonthNavModal(true)} 
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}
            >
              {year}.{String(month + 1).padStart(2, '0')}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
            </div>
            <button 
              onClick={handleNextMonth} 
              style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-main)', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              ▶
            </button>
            <button 
              onClick={handleGoToToday} 
              style={{
                marginLeft: '4px',
                backgroundColor: 'var(--butter-cream)',
                border: '1px solid var(--main-primary)',
                borderRadius: '12px',
                padding: '3px 8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--main-primary)',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              오늘
            </button>
          </div>
        ) : (
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>기록 목록</h2>
        )}

        {/* Right Side: Tab Toggle Segmented Control */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: 'var(--screen-bg)', 
          padding: '3px', 
          borderRadius: '20px', 
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {[
            { id: 'calendar', label: '달력' },
            { id: 'list', label: '목록' }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  backgroundColor: isSelected ? 'var(--card-bg)' : 'transparent',
                  color: isSelected ? 'var(--main-primary)' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <div id="view-calendar" className="cal-wrapper" style={{ marginTop: '8px' }}>
          <div className="cal-panel">

            <div className="cal-header-row" style={{ backgroundColor: 'var(--butter-cream)', borderRadius: '16px', padding: '8px 0', marginBottom: '8px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ color: 'var(--error-red)', fontWeight: 800 }}>일</div>
              <div style={{ fontWeight: 800 }}>월</div>
              <div style={{ fontWeight: 800 }}>화</div>
              <div style={{ fontWeight: 800 }}>수</div>
              <div style={{ fontWeight: 800 }}>목</div>
              <div style={{ fontWeight: 800 }}>금</div>
              <div style={{ color: '#3b82f6', fontWeight: 800 }}>토</div>
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
                      {(() => {
                        const recordEvents = dayEvents.filter(e => e.type === 'diary' || e.type === 'poop' || e.type === 'walk');
                        return recordEvents.length > 0 && (
                          <Heart size={11} fill="var(--blood-coral)" stroke="var(--blood-coral)" />
                        );
                      })()}
                    </div>

                    {/* Schedules List inside Day Cell */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', marginTop: 'auto', alignItems: 'stretch' }}>
                      {(() => {
                        const scheduleEvents = dayEvents.filter(e => e.type === 'hospital' || e.type === 'schedule');
                        return (
                          <>
                            {scheduleEvents.slice(0, 2).map((ev, eIdx) => {
                              const badge = getEventBadgeInfo(ev);
                              return (
                                <div 
                                  key={eIdx} 
                                  style={{ 
                                    fontSize: '0.62rem', 
                                    padding: '1px 3px', 
                                    borderRadius: '4px', 
                                    backgroundColor: badge.bg, 
                                    color: badge.color, 
                                    fontWeight: 800,
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%',
                                    lineHeight: 1.2
                                  }}
                                  title={ev.title}
                                >
                                  {badge.text}
                                </div>
                              );
                            })}
                            {scheduleEvents.length > 2 && (
                              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 700 }}>
                                +{scheduleEvents.length - 2}
                              </div>
                            )}
                          </>
                        );
                      })()}
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
                  backgroundColor: 'var(--butter-cream)',
                  border: '1.5px solid var(--main-primary)',
                  borderRadius: '30px',
                  padding: '10px 24px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: 'var(--main-primary)',
                  boxShadow: 'inset 0 2px 4px rgba(74,59,50,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  marginTop: '4px'
                }}
              >
                <span>{`${selectedDateObj.getMonth() + 1}월 ${selectedDateObj.getDate()}일에 추가`}</span>
                <span style={{ fontSize: '1.15rem', color: 'var(--main-primary)', fontWeight: 800 }}>+</span>
              </button>
            </div>

            <div className="cal-ad-zone" style={{ marginTop: '20px', padding: '12px' }}>
              <span className="ad-badge">AD ZONE</span>
              <div className="cal-ad-text" style={{ fontSize: '0.85rem' }}>우리 아이를 위한 안심 가습기전<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>최대 35% 단독 할인 혜택</span></div>
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
            backgroundColor: 'var(--card-bg)',
            padding: '12px 14px',
            borderRadius: '16px',
            border: '1.5px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>검색 필터</span>
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
              <div className="panel" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontSize: '0.9rem' }}>
                검색된 내역이 없습니다.
              </div>
            ) : (
              <div className="panel" style={{ padding: '0', overflow: 'hidden', background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: 'var(--butter-cream)' }}>
                    <tr>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 800, borderBottom: '1px solid var(--border-color)', width: '20%' }}>날짜</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 800, borderBottom: '1px solid var(--border-color)', width: '20%' }}>시간</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 800, borderBottom: '1px solid var(--border-color)', width: '15%' }}>유형</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 800, borderBottom: '1px solid var(--border-color)', width: '45%' }}>내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDates.map(dateStr => {
                      const dObj = new Date(dateStr);
                      const titleStr = `${dObj.getMonth() + 1}/${dObj.getDate()}`;
                      
                      return groupedEvents[dateStr].map((ev, idx) => {
                        const badge = getEventBadgeInfo(ev);
                        const isLastInDate = idx === groupedEvents[dateStr].length - 1;
                        
                        return (
                          <tr key={ev.id} style={{ borderBottom: isLastInDate ? '1px solid var(--border-color)' : '1px dashed var(--screen-bg)' }}>
                            <td style={{ padding: '12px 10px', verticalAlign: 'top', color: 'var(--text-main)', fontWeight: idx === 0 ? 800 : 400 }}>
                              {idx === 0 ? titleStr : ''}
                            </td>
                            <td style={{ padding: '12px 10px', verticalAlign: 'top', color: 'var(--text-muted)' }}>
                              {ev.time || '-'}
                            </td>
                            <td style={{ padding: '12px 10px', verticalAlign: 'top', color: badge.color, fontWeight: 700 }}>
                              {badge.text}
                              {ev.hasAlarm && <Bell size={12} style={{ marginLeft: '4px', color: 'var(--main-primary)', verticalAlign: 'middle' }} />}
                            </td>
                            <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                {ev.type === 'hospital' && <Syringe size={14} style={{ color: 'var(--error-red)' }} />}
                                {ev.type === 'walk' && <Activity size={14} style={{ color: '#10B981' }} />}
                                {ev.type === 'diary' && <BookOpen size={14} style={{ color: 'var(--main-primary)' }} />}
                                {ev.type === 'poop' && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8B5A2B' }} />}
                                {ev.type === 'schedule' && <CalendarIcon size={14} style={{ color: '#8B5CF6' }} />}
                                {ev.title}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                {ev.content}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
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
          <div className="cal-modal-content" style={{ position: 'relative', padding: '24px', width: '90%', maxWidth: '340px', background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => setShowDetailsModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>
            <div id="date-details-content" style={{ minHeight: '160px', paddingBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>{formattedSelectedDate} 기록</h3>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(ev => {
                  const badge = getEventBadgeInfo(ev);
                  return (
                    <div key={ev.id} style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '16px', marginBottom: '10px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: badge.color, fontWeight: 800, backgroundColor: badge.bg, padding: '2px 6px', borderRadius: '8px' }}>{badge.text}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--main-primary)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {ev.time} {ev.hasAlarm && <Bell size={12} />}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--text-main)', margin: 0, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {ev.type === 'hospital' && <Syringe size={16} style={{ color: 'var(--error-red)' }} />}
                        {ev.type === 'walk' && <Activity size={16} style={{ color: '#10B981' }} />}
                        {ev.type === 'diary' && <BookOpen size={16} style={{ color: 'var(--main-primary)' }} />}
                        {ev.type === 'poop' && <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8B5A2B' }} />}
                        {ev.type === 'schedule' && <CalendarIcon size={16} style={{ color: '#8B5CF6' }} />}
                        {ev.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text-muted)' }}>{ev.content}</p>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontSize: '0.9rem' }}>등록된 내역이 없습니다.</div>
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
          <div className="cal-modal-content" style={{ position: 'relative', padding: '24px', width: '90%', maxWidth: '340px', background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>
            <form onSubmit={handleAddEventSubmit}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>{formattedSelectedDate} 새로운 기록 추가</h3>
              
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>기록 유형</label>
                <select 
                  value={newEventType} 
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="form-input" 
                  style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                >
                  {!isFutureDate && <option value="diary">일상 기록 (일기)</option>}
                  <option value="hospital">병원 예약 / 방문</option>
                  <option value="schedule_cafe">카페 방문</option>
                  <option value="schedule_kinder">유치원 / 어린이집</option>
                  <option value="schedule_other">기타 일정</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>제목</label>
                <input 
                  type="text" 
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="form-input" 
                  placeholder="예: 심장사상충 예방접종 (선택)" 
                  style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>시간 (선택)</label>
                  <input 
                    type="time" 
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="form-input" 
                    style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>알림</label>
                  <label className="switch" style={{ marginTop: '4px' }}>
                    <input type="checkbox" checked={newEventAlarm} onChange={(e) => setNewEventAlarm(e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>상세 내용</label>
                <textarea 
                  value={newEventContent}
                  onChange={(e) => setNewEventContent(e.target.value)}
                  className="cal-editor-textarea" 
                  style={{ minHeight: '80px', fontSize: '0.9rem', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px' }} 
                  placeholder="상세 내용을 입력해주세요... (선택)" 
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
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 800 }}>날짜로 이동</h4>
            
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
                  style={{ flex: 1, backgroundColor: 'var(--text-muted)', borderColor: 'var(--text-muted)', marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
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
