import React, { useState, useRef } from 'react';
import { usePetStore } from '../store/petStore';
import ImageCropper from '../components/common/ImageCropper';
import DiaryHeaderTabs from '../components/diary/DiaryHeaderTabs';
import DiaryDailyList from '../components/diary/DiaryDailyList';
import DiaryRecoveryTimeline from '../components/diary/DiaryRecoveryTimeline';
import VetConsultReportModal from '../components/diary/VetConsultReportModal';
import DiaryFormModal from '../components/diary/DiaryFormModal';
import { Search, Plus, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { type CalendarEvent } from '../db';

const Diary: React.FC = () => {
  const { pets, activePetId, events, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, showAlert, showConfirm } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  const [showFormModal, setShowFormModal] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<CalendarEvent | null>(null);

  // Sub tab state: 'general' vs 'recovery'
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'recovery'>('general');
  const [entryType, setEntryType] = useState<'general' | 'recovery'>('general');

  // General Diary form state
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImage, setRawImage] = useState<string>('');

  // Recovery Diary form state
  const [recTemp, setRecTemp] = useState<string>('38.5');
  const [recMedicationDone, setRecMedicationDone] = useState<boolean>(true);
  const [recMemo, setRecMemo] = useState<string>('');
  const [recPhoto, setRecPhoto] = useState<string>('');
  const [showRecCropModal, setShowRecCropModal] = useState(false);
  const [rawRecImage, setRawRecImage] = useState<string>('');

  // Vet report modal state
  const [showReportModal, setShowReportModal] = useState(false);

  const handleInputFocus = () => {
    setTimeout(() => {
      const activeEl = document.activeElement;
      if (activeEl && modalContentRef.current) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Filter events by petId and type
  const petEvents = events.filter(e => e.petId === (activePetId || (pets[0] && pets[0].id)));

  const generalEvents = petEvents
    .filter(e => e.type !== 'recovery')
    .filter(e => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title?.toLowerCase().includes(q);
      const matchContent = e.content?.toLowerCase().includes(q);
      const matchDate = e.date?.includes(q);
      return matchTitle || matchContent || matchDate;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const recoveryEvents = petEvents
    .filter(e => e.type === 'recovery')
    .filter(e => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title?.toLowerCase().includes(q);
      const matchContent = e.content?.toLowerCase().includes(q);
      const matchDate = e.date?.includes(q);
      return matchTitle || matchContent || matchDate;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleCropComplete = (croppedData: string) => {
    setImageUrl(croppedData);
    setShowCropModal(false);
    setRawImage('');
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
        let finalContent = content.trim();
        if (entryType === 'recovery') {
          finalContent = `체온: ${recTemp || '38.5'}℃ | 투약: ${recMedicationDone ? '복용완료' : '미투약'}\n경과 메모: ${recMemo.trim()}`;
        }
        await updateCalendarEvent({
          id: editingDiaryId,
          petId: activePetId || pets[0]?.id || 'default',
          date,
          title: title.trim(),
          content: finalContent,
          imageUrl: entryType === 'recovery' ? (recPhoto || undefined) : (imageUrl || undefined),
          type: entryType === 'recovery' ? 'recovery' : 'diary'
        });
        showAlert('일기가 수정되었습니다.');
      } else {
        let finalContent = content.trim();
        if (entryType === 'recovery') {
          finalContent = `체온: ${recTemp || '38.5'}℃ | 투약: ${recMedicationDone ? '복용완료' : '미투약'}\n경과 메모: ${recMemo.trim()}`;
        }
        await addCalendarEvent({
          petId: activePetId || pets[0]?.id || 'default',
          date,
          title: title.trim(),
          content: finalContent,
          imageUrl: entryType === 'recovery' ? (recPhoto || undefined) : (imageUrl || undefined),
          type: entryType === 'recovery' ? 'recovery' : 'diary'
        });
        showAlert('새 일기가 저장되었습니다!');
      }

      handleResetForm();
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
      showAlert('일기 저장 중 오류가 발생했습니다.');
    }
  };

  const handleResetForm = () => {
    setEditingDiaryId(null);
    setFormStep(1);
    setDate(new Date().toISOString().split('T')[0]);
    setTitle('');
    setContent('');
    setImageUrl('');
    setRawImage('');
    setRecTemp('38.5');
    setRecMedicationDone(true);
    setRecMemo('');
    setRecPhoto('');
    setRawRecImage('');
  };

  const handleEdit = (ev: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDiaryId(ev.id);
    setDate(ev.date);
    setTitle(ev.title);

    if (ev.type === 'recovery') {
      setEntryType('recovery');
      const tempMatch = ev.content?.match(/체온:\s*([0-9.]+)/);
      if (tempMatch) setRecTemp(tempMatch[1]);
      setRecMedicationDone(ev.content?.includes('복용완료') ?? true);
      const memoMatch = ev.content?.match(/경과 메모:\s*([\s\S]+)/);
      if (memoMatch) setRecMemo(memoMatch[1]);
      else setRecMemo(ev.content || '');
      setRecPhoto(ev.imageUrl || '');
    } else {
      setEntryType('general');
      setContent(ev.content || '');
      setImageUrl(ev.imageUrl || '');
    }

    setFormStep(1);
    setShowFormModal(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm('정말 이 일기를 삭제하시겠습니까?', '일기 삭제', async () => {
      await deleteCalendarEvent(id);
      if (selectedDetailEvent?.id === id) {
        setSelectedDetailEvent(null);
      }
      showAlert('일기가 삭제되었습니다.');
    });
  };

  return (
    <div className="onda-page-container">
      
      {/* 1. Header & Search Bar */}
      <div style={{ marginBottom: '16px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <BookOpen size={22} color="var(--main-primary)" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {activePet?.name || '우리 아이'}의 기록 일기장
          </h1>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="일기 제목, 내용, 날짜 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '40px',
              paddingRight: '16px',
              borderRadius: '24px',
              border: '1.5px solid #E8E2D9',
              backgroundColor: '#FCFAF7',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* 2. Sub Tabs: General vs Recovery */}
      <DiaryHeaderTabs
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        generalCount={generalEvents.length}
        recoveryCount={recoveryEvents.length}
      />

      {/* 3. Main Content List by Sub Tab */}
      {activeSubTab === 'general' ? (
        <DiaryDailyList
          events={generalEvents}
          onSelectEvent={(ev) => setSelectedDetailEvent(ev)}
          onEditEvent={handleEdit}
          onDeleteEvent={handleDelete}
        />
      ) : (
        <DiaryRecoveryTimeline
          recoveryEvents={recoveryEvents}
          onOpenReportModal={() => setShowReportModal(true)}
          onEditEvent={handleEdit}
          onDeleteEvent={handleDelete}
        />
      )}

      {/* 4. Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => {
          handleResetForm();
          setEntryType(activeSubTab);
          setShowFormModal(true);
        }}
        style={{
          position: 'fixed',
          bottom: '84px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--main-primary)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 6px 20px rgba(92, 113, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999
        }}
      >
        <Plus size={28} />
      </button>

      {/* 5. Detail View Modal */}
      {selectedDetailEvent && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
            width: '95%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
            position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <button
              onClick={() => setSelectedDetailEvent(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--main-primary)', backgroundColor: 'var(--main-primary-light)', padding: '4px 10px', borderRadius: '12px', width: 'fit-content', fontWeight: 800 }}>
              <CalendarIcon size={14} />
              <span>{selectedDetailEvent.date}</span>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {selectedDetailEvent.title}
            </h2>

            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {selectedDetailEvent.content}
            </p>

            {selectedDetailEvent.imageUrl && (
              <img
                src={selectedDetailEvent.imageUrl}
                alt="Detail Attachment"
                style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '12px' }}
              />
            )}
          </div>
        </div>
      )}

      {/* 6. Write/Edit Form Modal */}
      <DiaryFormModal
        showFormModal={showFormModal}
        onClose={() => setShowFormModal(false)}
        formStep={formStep}
        setFormStep={setFormStep}
        editingDiaryId={editingDiaryId}
        entryType={entryType}
        setEntryType={setEntryType}
        date={date}
        setDate={setDate}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        recTemp={recTemp}
        setRecTemp={setRecTemp}
        recMedicationDone={recMedicationDone}
        setRecMedicationDone={setRecMedicationDone}
        recMemo={recMemo}
        setRecMemo={setRecMemo}
        recPhoto={recPhoto}
        setRecPhoto={setRecPhoto}
        onOpenCropModal={(raw) => {
          if (entryType === 'recovery') {
            setRawRecImage(raw);
            setShowRecCropModal(true);
          } else {
            setRawImage(raw);
            setShowCropModal(true);
          }
        }}
        onSaveDiary={handleSaveDiary}
        handleInputFocus={handleInputFocus}
        modalContentRef={modalContentRef}
      />

      {/* 7. Vet Consult Report Modal */}
      <VetConsultReportModal
        showReportModal={showReportModal}
        onClose={() => setShowReportModal(false)}
        activePet={activePet}
        recoveryEvents={recoveryEvents}
      />

      {/* 8. Image Crop Modals */}
      {showCropModal && (
        <ImageCropper 
          rawImage={rawImage} 
          onCropComplete={handleCropComplete} 
          onCancel={() => {
            setShowCropModal(false);
            setRawImage('');
          }} 
        />
      )}

      {showRecCropModal && rawRecImage && (
        <ImageCropper
          rawImage={rawRecImage}
          onCropComplete={(cropped) => {
            setRecPhoto(cropped);
            setShowRecCropModal(false);
            setRawRecImage('');
          }}
          onCancel={() => {
            setShowRecCropModal(false);
            setRawRecImage('');
          }}
        />
      )}

    </div>
  );
};

export default Diary;
