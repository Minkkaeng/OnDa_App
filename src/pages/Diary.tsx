import React, { useState } from 'react';
import { usePetStore } from '../store/petStore';
import { useOnboarding } from '../hooks/useOnboarding';
import ImageCropper from '../components/common/ImageCropper';

const Diary: React.FC = () => {
  const { pets, activePetId, events, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, isGlobalTourActive, showAlert, showConfirm } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  const { isDiaryLimitSeen, completeGuide, isLoading } = useOnboarding();

  const [showFormModal, setShowFormModal] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const modalContentRef = React.useRef<HTMLDivElement>(null);

  const handleInputFocus = () => {
    // 안드로이드 키보드가 올라오는 애니메이션 시간을 고려하여 지연 스크롤 처리
    setTimeout(() => {
      if (modalContentRef.current) {
        modalContentRef.current.scrollTo({
          top: modalContentRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [imageUrl, setImageUrl] = useState<string>('');

  // 1:1 Canvas Cropping States
  const [rawImage, setRawImage] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);

  // Filter diary events
  const diaryEvents = events
    .filter(e => e.petId === activePet?.id && (e.type === 'diary' || e.type === 'poop' || e.imageUrl))
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRawImage(event.target.result as string);
          setShowCropModal(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedData: string) => {
    setImageUrl(croppedData);
    setShowCropModal(false);
    setRawImage('');
  };

  const handleRemoveImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      if (editingDiaryId) {
        // Update Action
        await updateCalendarEvent({
          id: editingDiaryId,
          petId: activePet.id,
          date,
          type: 'diary',
          title,
          content,
          imageUrl: imageUrl || undefined
        });
        showAlert('기록일기가 수정 완료되었습니다!');
      } else {
        // Create Action
        await addCalendarEvent({
          petId: activePet.id,
          date,
          type: 'diary',
          title,
          content,
          imageUrl: imageUrl || undefined
        });
        showAlert('기록일기가 새로 저장되었습니다!');
      }
      
      // Reset & close
      handleCloseModal();
    } catch (err) {
      console.error(err);
      showAlert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleStartEdit = (ev: any) => {
    setEditingDiaryId(ev.id);
    setTitle(ev.title);
    setContent(ev.content || '');
    setDate(ev.date);
    setImageUrl(ev.imageUrl || '');
    setFormStep(1); // Start from image select step
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setEditingDiaryId(null);
    setFormStep(1);
    setShowFormModal(false);
  };

  return (
    <>
      <div className="diary-wrapper" style={{ paddingBottom: '16px' }}>

      {/* FAB */}
      <button 
        id="diary-guide-step1"
        onClick={() => {
          setEditingDiaryId(null);
          setFormStep(1);
          setShowFormModal(true);
        }} 
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

      {/* Form Steps Modal */}
      {showFormModal && (
        <div 
          className="modal-overlay" 
          style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div 
            ref={modalContentRef}
            className="cal-modal-content" 
            style={{ 
              width: '90%', 
              maxWidth: '450px', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              background: 'white', 
              padding: '24px', 
              borderRadius: '16px', 
              position: 'relative',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
            }}
          >
            <button 
              onClick={handleCloseModal} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted-gray)' }}
            >
              &times;
            </button>
            <form onSubmit={handleSaveDiary}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.15rem', fontWeight: 800, color: 'var(--deep-navy)' }}>
                {editingDiaryId ? '📝 오늘의 기록일기 수정하기' : '📝 오늘의 사진과 메모 남기기'}
              </h3>

              {/* STEP 1: Image Uploader Screen */}
              {formStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--muted-gray)', fontWeight: 700 }}>
                    [Step 1] 일기에 포함할 사진을 등록하세요.
                  </p>
                  
                  {!imageUrl ? (
                    <div 
                      className="diary-image-upload" 
                      onClick={() => document.getElementById('diary-image-input-file')?.click()}
                      style={{ 
                        cursor: 'pointer',
                        border: '2px dashed var(--steel-gray)',
                        borderRadius: '12px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: 'var(--ice-white)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', color: 'var(--mint-green)', marginBottom: '8px' }}>📷</div>
                      <p style={{ color: 'var(--deep-navy)', fontWeight: 800, margin: '0 0 4px 0', fontSize: '0.9rem' }}>클릭하여 사진 추가하기</p>
                      <p style={{ color: 'var(--muted-gray)', fontSize: '0.75rem', margin: 0 }}>등록 시 1:1 자르기 팝업이 노출됩니다.</p>
                      <input 
                        type="file" 
                        id="diary-image-input-file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        style={{ display: 'none' }} 
                      />
                    </div>
                  ) : (
                    <div 
                      className="diary-preview-container" 
                      onClick={() => document.getElementById('diary-image-input-file')?.click()}
                      style={{ 
                        display: 'block', 
                        position: 'relative', 
                        cursor: 'pointer',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1.5px solid var(--steel-gray)'
                      }}
                    >
                      <img src={imageUrl} alt="Diary Preview" style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }} />
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        background: 'rgba(18, 27, 42, 0.65)',
                        color: 'white',
                        padding: '6px',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        💡 터치하여 다른 사진으로 재등록
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveImage} 
                        style={{ 
                          position: 'absolute', 
                          top: '8px', 
                          right: '8px', 
                          background: 'rgba(18, 27, 42, 0.8)', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '50%', 
                          width: '28px', 
                          height: '28px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '1.2rem',
                          zIndex: 10
                        }}
                      >
                        &times;
                      </button>
                      <input 
                        type="file" 
                        id="diary-image-input-file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        style={{ display: 'none' }} 
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      type="button" 
                      onClick={handleCloseModal} 
                      className="btn-submit" 
                      style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0, padding: '10px' }}
                    >
                      닫기
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)} 
                      className="btn-submit" 
                      style={{ flex: 2, backgroundColor: 'var(--mint-green)', color: 'white', marginTop: 0, padding: '10px' }}
                    >
                      다음 단계로 ➡️
                    </button>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setFormStep(2);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted-gray)',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      사진 없이 일기 쓰기
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Input Title & Content Screen */}
              {formStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--muted-gray)', fontWeight: 700 }}>
                    [Step 2] 세부 텍스트 메모를 채워주세요.
                  </p>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>작성 일자</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="form-input" 
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>제목</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      onFocus={handleInputFocus}
                      className="form-input" 
                      placeholder="오늘 하루 요약 제목" 
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>기록 내용</label>
                    <textarea 
                      value={content} 
                      onChange={(e) => setContent(e.target.value.slice(0, 500))} 
                      onFocus={handleInputFocus}
                      className="form-input" 
                      style={{ minHeight: '100px', resize: 'none', borderColor: content.length >= 500 ? '#FF4D4D' : '#D1D9E1' }} 
                      placeholder="기록하고 싶은 에피소드를 적어주세요."
                      maxLength={500}
                      required
                    ></textarea>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: content.length >= 500 ? '#FF4D4D' : 'var(--muted-gray)', marginTop: '2px' }}>
                      {content.length} / 500 자
                    </div>
                  </div>

                  {!isLoading && !isDiaryLimitSeen && content.length >= 400 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#121B2A', 
                      color: '#F0F3F5', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <span style={{ lineHeight: 1.3 }}>
                        💡 OnDa는 IndexedDB 최적화를 위해 500자 글자수 제한 필터가 적용되어 있습니다.
                      </span>
                      <button 
                        type="button" 
                        onClick={() => completeGuide('isDiaryLimitSeen')}
                        style={{ 
                          backgroundColor: '#14C3A3', 
                          color: '#121B2A', 
                          border: 'none', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontWeight: 700, 
                          cursor: 'pointer',
                          marginLeft: '6px'
                        }}
                      >
                        확인
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(1)} 
                      className="btn-submit" 
                      style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0, padding: '10px' }}
                    >
                      ⬅️ 이전 단계
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit" 
                      style={{ flex: 2, backgroundColor: 'var(--mint-green)', color: 'white', marginTop: 0, padding: '10px' }}
                    >
                      {editingDiaryId ? '수정 완료하기 💾' : '일기 등록하기 💾'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 1:1 Canvas Cropping Modal Dialog */}
      {showCropModal && rawImage && (
        <ImageCropper
          rawImage={rawImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setRawImage('');
          }}
        />
      )}

      {/* Feed List */}
      <div className="diary-feed">
        {diaryEvents.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', color: 'var(--muted-gray)', padding: '56px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '3rem' }}>📖</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--deep-navy)', margin: 0 }}>아직 작성된 일기가 없습니다</h3>
            <p style={{ fontSize: '0.95rem', margin: '0 0 8px 0', color: 'var(--muted-gray)' }}>
              우리 아이와의 소중한 순간이나 특이사항을 사진과 함께 기록해 보세요.
            </p>
            <button
              onClick={() => {
                setEditingDiaryId(null);
                setFormStep(1);
                setShowFormModal(true);
              }}
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
                    <div style={{ fontSize: '0.85rem', color: ev.type === 'poop' ? '#8B5A2B' : 'var(--muted-gray)', fontWeight: 700, backgroundColor: ev.type === 'poop' ? '#F4E4D4' : 'transparent', padding: ev.type === 'poop' ? '4px 8px' : 0, borderRadius: '8px' }}>
                      {ev.type === 'poop' ? '💩 AI 배변 분석' : '일기 기록'}
                    </div>
                    
                    {/* Action buttons during normal non-tour mode */}
                    {!isGlobalTourActive && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEdit(ev)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--mint-green)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="수정하기"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                          </svg>
                        </button>

                        {/* Delete Button */}
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
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>

                      </div>
                    )}
                  </div>
                </div>
                {ev.imageUrl && (
                  <div className="diary-image-container" style={{ width: '100%', maxHeight: '350px', overflow: 'hidden' }}>
                    <img src={ev.imageUrl} className="diary-image" alt="Diary representation" style={{ width: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="diary-content" style={{ padding: '16px' }}>
                  <div className="diary-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--deep-navy)', marginBottom: '10px' }}>{ev.title}</div>
                  <div className="diary-text" style={{ fontSize: '1rem', lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' }}>{ev.content}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
};

export default Diary;
