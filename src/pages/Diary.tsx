import React, { useState, useEffect } from 'react';
import { usePetStore } from '../store/petStore';
import { useOnboarding } from '../hooks/useOnboarding';

const Diary: React.FC = () => {
  const { pets, activePetId, events, addCalendarEvent, deleteCalendarEvent, isGlobalTourActive, globalTourStep, showAlert, showConfirm } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  const { isDiaryLimitSeen, completeGuide, isLoading } = useOnboarding();

  const [showFormModal, setShowFormModal] = useState(false);

  // Sync modal visibility with global onboarding tour step 6
  useEffect(() => {
    if (isGlobalTourActive && globalTourStep === 6) {
      setShowFormModal(true);
    } else if (isGlobalTourActive && globalTourStep !== 6) {
      setShowFormModal(false);
    }
  }, [isGlobalTourActive, globalTourStep]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [imageUrl, setImageUrl] = useState<string>('');

  // Filter diary events
  const diaryEvents = events
    .filter(e => e.petId === activePet?.id && (e.type === 'diary' || e.imageUrl))
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const handleSaveDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showAlert('제목을 입력해주세요.');
      return;
    }
    if (!date) {
      showAlert('날짜를 지정해주세요.');
      return;
    }

    try {
      await addCalendarEvent({
        petId: activePet.id,
        date,
        type: 'diary',
        title,
        content,
        imageUrl: imageUrl || undefined
      });

      showAlert('기록일기가 저장되었습니다!');
      
      // Reset
      setTitle('');
      setContent('');
      setImageUrl('');
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
      showAlert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="diary-wrapper" style={{ paddingBottom: '80px' }}>
      
      <div className="diary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--deep-navy)', margin: 0 }}>기록일기</h2>
      </div>

      {/* FAB */}
      <button 
        id="diary-guide-step1"
        onClick={() => setShowFormModal(true)} 
        style={{ 
          position: 'fixed', 
          bottom: '80px', 
          right: '24px', 
          width: '60px', 
          height: '60px', 
          borderRadius: '30px', 
          backgroundColor: 'var(--mint-green)', 
          color: 'white', 
          border: 'none', 
          boxShadow: '0 4px 12px rgba(20,195,163,0.4)', 
          fontSize: '2rem', 
          cursor: 'pointer', 
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        +
      </button>

      {/* Upload Modal */}
      {showFormModal && (
        <div 
          className="modal-overlay" 
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFormModal(false);
          }}
        >
          <div className="cal-modal-content" style={{ width: '90%', maxWidth: '500px', background: 'white', padding: '32px', borderRadius: '12px', position: 'relative' }}>
            <button 
              onClick={() => setShowFormModal(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <form onSubmit={handleSaveDiary}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>오늘의 사진과 메모 남기기</h3>
              
              {!imageUrl ? (
                <div 
                  className="diary-image-upload" 
                  onClick={() => document.getElementById('diary-image-input-file')?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '2rem', color: 'var(--mint-green)', marginBottom: '8px' }}>📷</div>
                  <p style={{ color: 'var(--muted-gray)', fontWeight: 700, margin: 0 }}>클릭하여 사진 추가하기</p>
                  <input 
                    type="file" 
                    id="diary-image-input-file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                  />
                </div>
              ) : (
                <div className="diary-preview-container" style={{ display: 'block', position: 'relative', marginBottom: '16px' }}>
                  <img src={imageUrl} alt="Diary Preview" className="diary-preview-image" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="diary-remove-image" 
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                  >
                    &times;
                  </button>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">날짜</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">제목</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="form-input" 
                  placeholder="일기 제목을 입력해주세요" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">내용</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value.slice(0, 500))} 
                  className="form-input" 
                  style={{ minHeight: '120px', resize: 'none', borderColor: content.length >= 500 ? '#FF4D4D' : '#D1D9E1' }} 
                  placeholder="오늘 어떤 일이 있었나요?"
                  maxLength={500}
                  required
                ></textarea>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: content.length >= 500 ? '#FF4D4D' : 'var(--muted-gray)', marginTop: '4px' }}>
                  {content.length} / 500 자
                </div>
                {!isLoading && !isDiaryLimitSeen && content.length >= 400 && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '12px', 
                    backgroundColor: '#121B2A', 
                    color: '#F0F3F5', 
                    borderRadius: '8px', 
                    fontSize: '0.85rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }}>
                    <span style={{ lineHeight: 1.4, flex: 1, marginRight: '12px' }}>
                      💡 OnDa는 로컬 스토리지 한도 및 IndexedDB 최적화를 위해 500자 제한 필터가 적용되어 있습니다.
                    </span>
                    <button 
                      type="button" 
                      onClick={() => completeGuide('isDiaryLimitSeen')}
                      style={{ 
                        backgroundColor: '#14C3A3', 
                        color: '#121B2A', 
                        border: 'none', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      확인
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)} 
                  className="btn-submit" 
                  style={{ flex: 1, background: 'var(--ice-white)', color: 'var(--muted-gray)', borderColor: 'var(--steel-gray)' }}
                >
                  취소
                </button>
                <button type="submit" className="btn-submit" style={{ flex: 2 }}>기록 저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="diary-feed">
        {diaryEvents.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', color: 'var(--muted-gray)', padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '3rem' }}>📖</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--deep-navy)', margin: 0 }}>아직 작성된 일기가 없습니다</h3>
            <p style={{ fontSize: '0.95rem', margin: '0 0 8px 0', color: 'var(--muted-gray)' }}>
              우리 아이와의 소중한 순간이나 특이사항을 사진과 함께 기록해 보세요.
            </p>
            <button
              onClick={() => setShowFormModal(true)}
              style={{
                backgroundColor: 'var(--mint-green)',
                color: 'var(--deep-navy)',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(20, 195, 163, 0.2)'
              }}
            >
              첫 기록 작성하기
            </button>
          </div>
        ) : (
          diaryEvents.map(ev => {
            const dObj = new Date(ev.date);
            const formattedDate = `${dObj.getFullYear()}년 ${dObj.getMonth() + 1}월 ${dObj.getDate()}일`;

            return (
              <div key={ev.id} className="diary-card" style={{ marginBottom: '24px' }}>
                <div className="diary-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--steel-gray)' }}>
                  <div className="diary-date" style={{ fontWeight: 700, color: 'var(--deep-navy)' }}>{formattedDate}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-gray)', fontWeight: 700 }}>일기 기록</div>
                    {!isGlobalTourActive && (
                      <button
                        onClick={() => {
                          showConfirm('이 일기를 삭제하시겠습니까?', '일기 삭제', () => {
                            deleteCalendarEvent(ev.id);
                          });
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#FF4D4D',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="삭제하기"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {ev.imageUrl && (
                  <div className="diary-image-container" style={{ width: '100%', maxHeight: '350px', overflow: 'hidden' }}>
                    <img src={ev.imageUrl} className="diary-image" alt="Diary representation" style={{ width: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="diary-content" style={{ padding: '20px' }}>
                  <div className="diary-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--deep-navy)', marginBottom: '10px' }}>{ev.title}</div>
                  <div className="diary-text" style={{ fontSize: '1rem', lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' }}>{ev.content}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Diary;
