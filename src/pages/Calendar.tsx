import React, { useState } from 'react';
import { usePetStore, type CalendarEvent } from '../store/petStore';
import { type EventType } from '../db';

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
  const [newEventType, setNewEventType] = useState<EventType>('diary');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');

  if (!activePet) {
    return (
      <>
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-gray)' }}>
          반려동물을 먼저 등록해주세요.
        </div>
      </>
    );
  }

  // Filter events for the active pet
  const petEvents = events.filter(e => e.petId === activePet.id);

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
    
    // Set default event type (diary for past/today, hospital for future)
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

      {activeTab === 'calendar' ? (
        <div id="view-calendar" className="cal-wrapper" style={{ marginTop: '24px' }}>
          <div className="cal-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="cal-top-badge" style={{ marginBottom: 0 }}>일정 및 일상 기록 캘린더</div>
              <div className="cal-tabs">
                <button className={`cal-tab-btn ${(activeTab as string) === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>달력</button>
                <button className={`cal-tab-btn ${(activeTab as string) === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>목록</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button 
                onClick={handlePrevMonth} 
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--deep-navy)' }}
              >
                ◀
              </button>
              <div className="cal-month-title">
                {year}.{String(month + 1).padStart(2, '0')}
              </div>
              <button 
                onClick={handleNextMonth} 
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--deep-navy)' }}
              >
                ▶
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

            <div className="cal-grid">
              {daysGrid.map((gridItem, idx) => {
                const isSun = gridItem.isSun;
                const isSat = gridItem.isSat;
                const isActive = gridItem.dateStr === selectedDateStr;
                const dayEvents = petEvents.filter(e => e.date === gridItem.dateStr);
                const hasEvents = dayEvents.length > 0;

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
                    style={{ opacity: gridItem.type !== 'curr' ? 0.4 : 1 }}
                  >
                    {gridItem.dayNum}
                    {hasEvents && <div className="cal-day-dot"></div>}
                  </div>
                );
              })}
            </div>

            <div className="cal-ad-zone">
              <span className="ad-badge">AD ZONE</span>
              <div className="cal-ad-text">우리 아이를 위한 안심 가습기전<br/><span style={{ fontSize: '0.85rem', color: '#666' }}>최대 35% 단독 할인 혜택</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div id="view-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="cal-tabs">
              <button className={`cal-tab-btn ${(activeTab as string) === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>달력</button>
              <button className={`cal-tab-btn ${(activeTab as string) === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>목록</button>
            </div>
          </div>
          <div id="list-container">
            {sortedDates.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', color: 'var(--muted-gray)', padding: '40px 0' }}>
                등록된 내역이 없습니다.
              </div>
            ) : (
              sortedDates.map(dateStr => {
                const dObj = new Date(dateStr);
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const titleStr = `${dObj.getMonth() + 1}월 ${dObj.getDate()}일 ${dayNames[dObj.getDay()]}요일`;
                
                return (
                  <div key={dateStr} className="panel" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>{titleStr}</h3>
                    <div className="task-list">
                      {groupedEvents[dateStr].map(ev => {
                        const typeText = ev.type === 'diary' ? '일기' : (ev.type === 'hospital' ? '병원' : '일정');
                        const typeColor = ev.type === 'hospital' ? 'var(--error-red)' : 'var(--mint-green)';
                        
                        return (
                          <div key={ev.id} className="task-card">
                            <div className="task-info">
                              <h3 style={{ marginBottom: '8px' }}>{ev.title}</h3>
                              <p style={{ whiteSpace: 'pre-wrap' }}>{ev.content}</p>
                            </div>
                            <div className="task-status" style={{ color: typeColor, fontWeight: 700 }}>{typeText}</div>
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
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetailsModal(false);
          }}
        >
          <div className="cal-modal-content" style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowDetailsModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <div id="date-details-content" style={{ minHeight: '200px', paddingBottom: '40px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>{formattedSelectedDate} 기록</h3>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(ev => {
                  const typeText = ev.type === 'diary' ? '일기' : (ev.type === 'hospital' ? '병원' : '일정');
                  return (
                    <div key={ev.id} style={{ background: 'var(--ice-white)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-gray)', fontWeight: 700, marginBottom: '4px' }}>[{typeText}]</div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--deep-navy)' }}>{ev.title}</h3>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{ev.content}</p>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--muted-gray)', padding: '40px 0' }}>등록된 내역이 없습니다.</div>
              )}
            </div>
            <button 
              className="cal-fab" 
              onClick={() => {
                setShowDetailsModal(false);
                handleAddEventOpen();
              }}
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
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="cal-modal-content" style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <form onSubmit={handleAddEventSubmit}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>{formattedSelectedDate} 새로운 기록 추가</h3>
              
              <div className="form-group">
                <label className="form-label">기록 유형</label>
                <select 
                  value={newEventType} 
                  onChange={(e) => setNewEventType(e.target.value as EventType)}
                  className="form-input" 
                  style={{ padding: '10px' }}
                >
                  {!isFutureDate && <option value="diary">일상 기록 (일기)</option>}
                  <option value="hospital">병원 예약 / 방문</option>
                  <option value="schedule">기타 일정</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">제목</label>
                <input 
                  type="text" 
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="form-input" 
                  placeholder="예: 심장사상충 예방접종" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">상세 내용</label>
                <textarea 
                  value={newEventContent}
                  onChange={(e) => setNewEventContent(e.target.value)}
                  className="cal-editor-textarea" 
                  style={{ minHeight: '120px' }} 
                  placeholder="상세 내용을 입력해주세요..."
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="editor-submit-btn">기록 저장하기</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
