import React, { useState } from 'react';
import { usePetStore } from '../store/petStore';
import { useOnboarding } from '../hooks/useOnboarding';
import ImageCropper from '../components/common/ImageCropper';
import BottomSheet from '../components/common/BottomSheet';
import { Camera, Edit2, Trash2, Activity, FileText, Hospital } from 'lucide-react';

const Diary: React.FC = () => {
  const { pets, activePetId, events, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, showAlert, showConfirm } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  const { isDiaryLimitSeen, completeGuide, isLoading } = useOnboarding();

  const [showFormModal, setShowFormModal] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const modalContentRef = React.useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<string>('일상');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<any | null>(null);

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
    .filter(e => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === '건강' && e.type === 'poop') return true;
      return e.category === selectedFilter;
    })
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
          imageUrl: imageUrl || undefined,
          category: category
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
          imageUrl: imageUrl || undefined,
          category: category
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
    setCategory(ev.category || '일상');
    setFormStep(1); // Start from image select step
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setCategory('일상');
    setEditingDiaryId(null);
    setFormStep(1);
    setShowFormModal(false);
  };

  return (
    <>
      <div className="diary-wrapper" style={{ paddingBottom: '16px' }}>

      {/* FAB Wrapper */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        pointerEvents: 'none',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: '32px'
      }}>
        <button 
          id="diary-guide-step1"
          onClick={() => {
            setEditingDiaryId(null);
            setFormStep(1);
            setShowFormModal(true);
          }} 
          style={{ 
            pointerEvents: 'auto',
            width: '60px', 
            height: '60px', 
            borderRadius: '30px', 
            backgroundColor: 'var(--main-primary)', 
            color: 'white', 
            border: 'none', 
            boxShadow: '0 4px 12px rgba(20,195,163,0.4)', 
            fontSize: '2rem', 
            cursor: 'pointer', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
      </div>

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
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>
            <form onSubmit={handleSaveDiary}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingDiaryId ? '오늘의 기록일기 수정하기' : '오늘의 사진과 메모 남기기'}
              </h3>

              {/* STEP 1: Image Uploader Screen */}
              {formStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    [Step 1] 일기에 포함할 사진을 등록하세요.
                  </p>
                  
                  {!imageUrl ? (
                    <div 
                      className="diary-image-upload" 
                      onClick={() => document.getElementById('diary-image-input-file')?.click()}
                      style={{ 
                        cursor: 'pointer',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '12px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: 'var(--screen-bg)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <Camera size={40} color="var(--main-primary)" />
                      </div>
                      <p style={{ color: 'var(--text-main)', fontWeight: 800, margin: '0 0 4px 0', fontSize: '0.9rem' }}>클릭하여 사진 추가하기</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>등록 시 1:1 자르기 팝업이 노출됩니다.</p>
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
                        border: '1.5px solid var(--border-color)'
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
                        터치하여 다른 사진으로 재등록
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
                      style={{ flex: 1, backgroundColor: 'var(--text-muted)', marginTop: 0, padding: '10px' }}
                    >
                      닫기
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(2)} 
                      className="btn-submit" 
                      style={{ flex: 2, backgroundColor: 'var(--main-primary)', color: 'white', marginTop: 0, padding: '10px' }}
                    >
                      다음 단계로
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
                        color: 'var(--text-muted)',
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
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    [Step 2] 세부 텍스트 메모를 채워주세요.
                  </p>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>카테고리</label>
                    <div 
                      onClick={() => setIsCategorySheetOpen(true)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D9E1',
                        cursor: 'pointer', backgroundColor: 'var(--card-bg)'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {category}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--main-primary)', fontWeight: 'bold' }}>선택하기</span>
                    </div>
                  </div>

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
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: content.length >= 500 ? '#FF4D4D' : 'var(--text-muted)', marginTop: '2px' }}>
                      {content.length} / 500 자
                    </div>
                  </div>

                  {!isLoading && !isDiaryLimitSeen && content.length >= 400 && (
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: 'var(--text-main)', 
                      color: '#F0F3F5', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <span style={{ lineHeight: 1.3 }}>
                        OnDa는 IndexedDB 최적화를 위해 500자 글자수 제한 필터가 적용되어 있습니다.
                      </span>
                      <button 
                        type="button" 
                        onClick={() => completeGuide('isDiaryLimitSeen')}
                        style={{ 
                          backgroundColor: 'var(--main-primary)', 
                          color: 'white', 
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
                      style={{ flex: 1, backgroundColor: 'var(--text-muted)', marginTop: 0, padding: '10px' }}
                    >
                      이전 단계
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit" 
                      style={{ flex: 2, backgroundColor: 'var(--main-primary)', color: 'white', marginTop: 0, padding: '10px' }}
                    >
                      {editingDiaryId ? '수정 완료하기' : '일기 등록하기'}
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

      {/* Filter Chip Bar */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 4px',
        margin: '0 0 16px 0', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { value: 'all', label: '전체' },
          { value: '일상', label: '일상' },
          { value: '건강', label: '건강' },
          { value: '산책', label: '산책' },
          { value: '훈련', label: '훈련' },
          { value: '기타', label: '기타' }
        ].map(f => {
          const isActive = selectedFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFilter(f.value)}
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: '20px',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                border: isActive ? '1.5px solid var(--main-primary)' : '1px solid var(--border-color)',
                backgroundColor: isActive ? 'var(--butter-cream)' : 'var(--card-bg)',
                color: isActive ? 'var(--main-primary)' : 'var(--text-main)',
                transition: 'all 0.2s',
                marginTop: 0
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Feed List */}
      <div className="diary-feed" style={{ padding: '0 4px' }}>
        {diaryEvents.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '120px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>아직 작성된 일기가 없습니다</h3>
            <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-muted)' }}>
              하단의 + 버튼을 눌러 첫 기록을 남겨보세요.
            </p>
          </div>
        ) : (
          Object.entries(
            diaryEvents.reduce((acc, ev) => {
              const dObj = new Date(ev.date);
              const formattedDate = `${dObj.getFullYear()}년 ${dObj.getMonth() + 1}월 ${dObj.getDate()}일`;
              if (!acc[formattedDate]) acc[formattedDate] = [];
              acc[formattedDate].push(ev);
              return acc;
            }, {} as Record<string, typeof diaryEvents>)
          ).map(([dateLabel, eventsForDate]) => (
            <div key={dateLabel} style={{ marginBottom: '24px' }}>
              <div style={{ padding: '8px 12px', fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                {dateLabel}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {eventsForDate.map(ev => (
                  <div 
                    key={ev.id} 
                    onClick={() => setSelectedDetailEvent(ev)}
                    style={{ 
                      aspectRatio: '1/1', 
                      cursor: 'pointer',
                      backgroundColor: ev.type === 'poop' ? '#F4E4D4' : (ev.imageUrl ? 'var(--screen-bg)' : 'var(--butter-cream)'),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt="Diary thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <div style={{ color: 'var(--text-main)' }}>
                          {ev.type === 'poop' ? <Activity size={28} /> : <FileText size={28} />}
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '8px', color: 'var(--text-main)', padding: '0 6px', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.title}
                        </div>
                      </>
                    )}
                    {/* Category Badge */}
                    {ev.category && ev.imageUrl && (
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', backgroundColor: 'rgba(255,255,255,0.85)', color: 'var(--text-main)', padding: '2px 6px', borderRadius: '12px', fontSize: '0.6rem', fontWeight: 800, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        {ev.category}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* 카테고리 선택을 위한 바텀시트 */}
    <BottomSheet 
      isOpen={isCategorySheetOpen} 
      onClose={() => setIsCategorySheetOpen(false)}
      title="일기 카테고리 선택"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
        {[
          { value: '일상', label: '일상', desc: '오늘 하루 반려견과 함께한 평범하고 행복한 일상' },
          { value: '건강', label: '건강', desc: '병원 내원, 예방 접종 및 건강 관련 특이사항' },
          { value: '산책', label: '산책', desc: '산책 중 있었던 특별한 에피소드나 기록' },
          { value: '훈련', label: '훈련', desc: '새로 배운 명령어, 개인기 및 훈련 과정' },
          { value: '기타', label: '기타', desc: '그 외 기록하고 싶은 다양한 소중한 기록' }
        ].map(opt => {
          const isSelected = category === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setCategory(opt.value);
                setIsCategorySheetOpen(false);
              }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '16px', borderRadius: '12px', 
                border: isSelected ? '2px solid var(--main-primary)' : '1px solid var(--border-color)',
                backgroundColor: isSelected ? 'var(--butter-cream)' : 'var(--card-bg)',
                cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s',
                marginTop: 0
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{opt.label}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </BottomSheet>

    {/* Detail View Modal */}
    {selectedDetailEvent && (
      <div 
        className="modal-overlay" 
        style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedDetailEvent(null);
        }}
      >
        <div 
          style={{ 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            background: 'white', 
            borderRadius: '20px', 
            position: 'relative',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Actions */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
            {!(selectedDetailEvent.title.includes('💧') || selectedDetailEvent.title.includes('🍪') || selectedDetailEvent.type === 'poop') && (
              <button
                onClick={() => {
                  setSelectedDetailEvent(null);
                  handleStartEdit(selectedDetailEvent);
                }}
                style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <Edit2 size={18} />
              </button>
            )}
            <button
              onClick={() => {
                showConfirm('이 일기를 삭제하시겠습니까?', '일기 삭제', () => {
                  deleteCalendarEvent(selectedDetailEvent.id);
                  setSelectedDetailEvent(null);
                });
              }}
              style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setSelectedDetailEvent(null)}
              style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              ✖
            </button>
          </div>

          {/* Image */}
          {selectedDetailEvent.imageUrl ? (
            <img src={selectedDetailEvent.imageUrl} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} alt="Diary" />
          ) : (
            <div style={{ width: '100%', height: '150px', backgroundColor: selectedDetailEvent.type === 'poop' ? '#F4E4D4' : 'var(--butter-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
              {selectedDetailEvent.type === 'poop' ? <Activity size={60} /> : <FileText size={60} />}
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--main-primary)' }}>
                {selectedDetailEvent.date}
              </span>
              {selectedDetailEvent.category && (
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)', backgroundColor: 'var(--screen-bg)', padding: '2px 8px', borderRadius: '12px' }}>
                  {selectedDetailEvent.category}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0' }}>{selectedDetailEvent.title}</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap', margin: 0 }}>
              {selectedDetailEvent.content}
            </p>

            {/* 같은 날짜의 케어/다른 기록들 요약 */}
            {(() => {
              const sameDayEvents = events.filter(e => e.petId === activePet?.id && e.date === selectedDetailEvent.date && e.id !== selectedDetailEvent.id);
              if (sameDayEvents.length === 0) return null;
              
              return (
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>이날의 다른 기록</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sameDayEvents.map(ev => (
                      <div key={ev.id} onClick={() => setSelectedDetailEvent(ev)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: 'var(--screen-bg)', borderRadius: '12px', transition: 'all 0.2s' }}>
                        <div style={{ color: 'var(--text-main)' }}>
                          {ev.type === 'poop' ? <Activity size={24} /> : ev.type === 'hospital' ? <Hospital size={24} /> : <FileText size={24} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </div>
                          {ev.category && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {ev.category}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--main-primary)', fontWeight: 800 }}>
                          보기
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Diary;
