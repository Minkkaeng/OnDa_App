import React from 'react';
import { BookOpen, Camera, Pill, Stethoscope } from 'lucide-react';

export interface DiaryFormModalProps {
  showFormModal: boolean;
  onClose: () => void;
  formStep: 1 | 2;
  setFormStep: (step: 1 | 2) => void;
  editingDiaryId: string | null;
  entryType: 'general' | 'recovery';
  setEntryType: (type: 'general' | 'recovery') => void;
  date: string;
  setDate: (date: string) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  recTemp: string;
  setRecTemp: (temp: string) => void;
  recMedicationDone: boolean;
  setRecMedicationDone: (done: boolean) => void;
  recMemo: string;
  setRecMemo: (memo: string) => void;
  recPhoto: string;
  setRecPhoto: (photo: string) => void;
  onOpenCropModal: (raw: string) => void;
  onSaveDiary: (e: React.FormEvent) => void;
  handleInputFocus: () => void;
  modalContentRef: React.RefObject<HTMLDivElement | null>;
}

const DiaryFormModal: React.FC<DiaryFormModalProps> = ({
  showFormModal,
  onClose,
  formStep,
  setFormStep,
  editingDiaryId,
  entryType,
  setEntryType,
  date,
  setDate,
  title,
  setTitle,
  content,
  setContent,
  imageUrl,
  setImageUrl,
  recTemp,
  setRecTemp,
  recMedicationDone,
  setRecMedicationDone,
  recMemo,
  setRecMemo,
  recPhoto,
  setRecPhoto,
  onOpenCropModal,
  onSaveDiary,
  handleInputFocus,
  modalContentRef
}) => {
  if (!showFormModal) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div 
        ref={modalContentRef}
        style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
          width: '95%', maxWidth: '400px', maxHeight: '85vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
          position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}
      >
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          &times;
        </button>

        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {editingDiaryId ? '일기 수정' : '새 일기 작성'}
        </h2>

        {/* 탭 구분 선택 */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F1', borderRadius: '10px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setEntryType('general')}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
              backgroundColor: entryType === 'general' ? '#FFFFFF' : 'transparent',
              color: entryType === 'general' ? 'var(--main-primary)' : 'var(--text-muted)',
              fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <BookOpen size={14} />
            <span>일상 기록</span>
          </button>
          <button
            type="button"
            onClick={() => setEntryType('recovery')}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
              backgroundColor: entryType === 'recovery' ? '#FFFFFF' : 'transparent',
              color: entryType === 'recovery' ? 'var(--main-primary)' : 'var(--text-muted)',
              fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <Stethoscope size={14} />
            <span>질병 회복일지</span>
          </button>
        </div>

        <form onSubmit={onSaveDiary} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {entryType === 'general' ? (
            <>
              {/* Step 1: 날짜 & 제목 */}
              {formStep === 1 && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>날짜 *</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      required
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #E2E2DC', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>일기 제목 *</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      onFocus={handleInputFocus}
                      placeholder="오늘 아이와의 핵심 순간을 적어보세요"
                      required
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #E2E2DC', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!title.trim()) {
                        alert('제목을 입력해주세요.');
                        return;
                      }
                      setFormStep(2);
                    }}
                    style={{ padding: '12px', backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '8px' }}
                  >
                    다음 (내용 및 사진 입력)
                  </button>
                </>
              )}

              {/* Step 2: 내용 & 사진 첨부 */}
              {formStep === 2 && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>상세 스토리</label>
                    <textarea 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      onFocus={handleInputFocus}
                      placeholder="아이의 기분, 기억하고 싶은 일들을 기록해보세요"
                      rows={5}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E2DC', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>추억 사진 첨부</label>
                    {imageUrl ? (
                      <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                        <img src={imageUrl} alt="Attached" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', border: '2px dashed #E2E2DC', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: '6px' }}>
                        <Camera size={16} />
                        <span>사진 선택 (크롭 지원)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) onOpenCropModal(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display: 'none' }} 
                        />
                      </label>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setFormStep(1)}
                      style={{ flex: 1, padding: '12px', backgroundColor: '#F3F2EC', color: 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      이전
                    </button>
                    <button 
                      type="submit" 
                      style={{ flex: 1.5, padding: '12px', backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      저장하기
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* 질병 회복일지 입력 폼 */
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>날짜 *</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #E2E2DC', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>진료/수술 항목 (제목) *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  onFocus={handleInputFocus}
                  placeholder="예) 슬개골 수술 3일차 / 피부염 치료"
                  required
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #E2E2DC', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>체온 (℃)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={recTemp} 
                    onChange={(e) => setRecTemp(e.target.value)} 
                    placeholder="38.5"
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #E2E2DC', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1, paddingTop: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={recMedicationDone} 
                      onChange={(e) => setRecMedicationDone(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--main-primary)', cursor: 'pointer' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Pill size={14} color="#D97706" />
                      <span>처방약 복용 완료</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>회복 경과 메모</label>
                <textarea 
                  value={recMemo} 
                  onChange={(e) => setRecMemo(e.target.value)} 
                  onFocus={handleInputFocus}
                  placeholder="식사량, 기력, 환부 상태 등을 작성해주세요"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E2DC', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>환부 사진 첨부</label>
                {recPhoto ? (
                  <div style={{ position: 'relative', width: '100%', height: '130px' }}>
                    <img src={recPhoto} alt="Recovery Area" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                    <button
                      type="button"
                      onClick={() => setRecPhoto('')}
                      style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70px', border: '2px dashed #E2E2DC', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span>🩹 환부 사진 등록 (1:1 크롭)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) onOpenCropModal(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
              </div>

              <button 
                type="submit" 
                style={{ padding: '12px', backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}
              >
                회복일지 저장
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default DiaryFormModal;
