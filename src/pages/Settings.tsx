import React, { useState } from 'react';
import { usePetStore, type CustomTheme, type CustomReminder, type BackupSnapshot, type Inquiry } from '../store/petStore';
import { db } from '../db';
import { Palette, Bell, Database, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const Settings: React.FC = () => {
  const {
    pets,
    loadAllData,
    showAlert,
    showConfirm,
    activeThemeId,
    customThemes,
    setThemeId,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    customReminders,
    addCustomReminder,
    updateCustomReminder,
    deleteCustomReminder,
    backupSnapshots,
    addBackupSnapshot,
    updateBackupSnapshot,
    deleteBackupSnapshot,
    restoreBackupSnapshot,
    inquiries,
    addInquiry,
    updateInquiry,
    deleteInquiry
  } = usePetStore();

  const [expandedMenu, setExpandedMenu] = useState<'theme' | 'notification' | 'system' | 'support' | null>('theme');
  const [isPushActive, setIsPushActive] = useState(true);
  const [lastBackupDate, setLastBackupDate] = useState(localStorage.getItem('last_backup_date') || '');

  // Forms Visibility States
  const [showThemeForm, setShowThemeForm] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [expandedInquiryId, setExpandedInquiryId] = useState<string | null>(null);

  // Theme Form States
  const [themeName, setThemeName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#14C3A3');
  const [backgroundColor, setBackgroundColor] = useState('#F0F3F5');
  const [paperColor, setPaperColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#121B2A');
  const [mutedColor, setMutedColor] = useState('#a0abbc');

  // Reminder Form States
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderPetId, setReminderPetId] = useState(pets[0]?.id || '');

  // Snapshot Form State
  const [snapshotName, setSnapshotName] = useState('');

  // Inquiry Form States
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('서비스 이용');
  const [inquiryContent, setInquiryContent] = useState('');

  // Preset FAQ
  const faqList = [
    { q: 'OnDa Pet Care는 어떤 서비스인가요?', a: '반려견의 건강, 산책, 투약 일정 등을 캘린더와 대시보드를 통해 손쉽게 관리하고 기록할 수 있는 하이브리드 반려견 전용 다이어리 서비스입니다.' },
    { q: '데이터 백업은 어떻게 하나요?', a: '설정 > 시스템 설정 메뉴에서 "백업 파일 내보내기"를 통해 모든 데이터를 JSON 파일로 다운로드하여 영구 보관할 수 있습니다.' },
    { q: '모바일에서도 실시간으로 사용할 수 있나요?', a: '네! 본 앱은 모바일 환경에 최적화되어 있으며 모바일 브라우저나 설치형 APK를 통해 이용하실 수 있습니다.' }
  ];

  // Theme Actions
  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim()) {
      showAlert('테마 이름을 입력하세요.');
      return;
    }

    const themeColors = {
      primary: primaryColor,
      background: backgroundColor,
      paper: paperColor,
      text: textColor,
      muted: mutedColor
    };

    if (editingThemeId) {
      updateCustomTheme({
        id: editingThemeId,
        name: themeName.trim(),
        colors: themeColors
      });
      showAlert('테마가 성공적으로 수정되었습니다.');
    } else {
      addCustomTheme({
        name: themeName.trim(),
        colors: themeColors
      });
      showAlert('새 테마가 추가되었습니다.');
    }

    // Reset
    setThemeName('');
    setShowThemeForm(false);
    setEditingThemeId(null);
  };

  const handleEditThemeClick = (theme: CustomTheme) => {
    setEditingThemeId(theme.id);
    setThemeName(theme.name);
    setPrimaryColor(theme.colors.primary);
    setBackgroundColor(theme.colors.background);
    setPaperColor(theme.colors.paper);
    setTextColor(theme.colors.text);
    setMutedColor(theme.colors.muted);
    setShowThemeForm(true);
  };

  // Reminder Actions
  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) {
      showAlert('알림 내용을 입력하세요.');
      return;
    }

    if (editingReminderId) {
      const existing = customReminders.find(r => r.id === editingReminderId);
      if (existing) {
        updateCustomReminder({
          ...existing,
          title: reminderTitle.trim(),
          time: reminderTime,
          petId: reminderPetId
        });
      }
      showAlert('알림 정보가 수정되었습니다.');
    } else {
      addCustomReminder({
        title: reminderTitle.trim(),
        time: reminderTime,
        petId: reminderPetId
      });
      showAlert('새로운 예약 알림이 등록되었습니다.');
    }

    setReminderTitle('');
    setShowReminderForm(false);
    setEditingReminderId(null);
  };

  const handleEditReminderClick = (reminder: CustomReminder) => {
    setEditingReminderId(reminder.id);
    setReminderTitle(reminder.title);
    setReminderTime(reminder.time);
    setReminderPetId(reminder.petId);
    setShowReminderForm(true);
  };

  // Snapshot Actions
  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) {
      showAlert('스냅샷 이름을 입력하세요.');
      return;
    }

    if (editingSnapshotId) {
      updateBackupSnapshot(editingSnapshotId, snapshotName.trim());
      showAlert('스냅샷 이름이 수정되었습니다.');
    } else {
      await addBackupSnapshot(snapshotName.trim());
      showAlert('현재 데이터 스냅샷이 생성되었습니다.');
    }

    setSnapshotName('');
    setShowSnapshotForm(false);
    setEditingSnapshotId(null);
  };



  const handleRestoreSnapshotClick = (snap: BackupSnapshot) => {
    showConfirm(
      `"${snap.name}" 백업 시점으로 복원하시겠습니까?\n현재 등록된 실시간 데이터는 소멸하고 백업 시점 데이터로 교체됩니다.`,
      '스냅샷 데이터 복원',
      async () => {
        await restoreBackupSnapshot(snap.id);
        showAlert('선택한 백업 스냅샷으로 복원이 완료되었습니다.');
      }
    );
  };

  // Inquiry Actions
  const handleSaveInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryTitle.trim() || !inquiryContent.trim()) {
      showAlert('제목과 문의 내용을 입력해 주세요.');
      return;
    }

    if (editingInquiryId) {
      const existing = inquiries.find(i => i.id === editingInquiryId);
      if (existing) {
        updateInquiry({
          ...existing,
          title: inquiryTitle.trim(),
          category: inquiryCategory,
          content: inquiryContent.trim()
        });
      }
      showAlert('문의 내역이 수정되었습니다.');
    } else {
      addInquiry(inquiryTitle.trim(), inquiryCategory, inquiryContent.trim());
      showAlert('1:1 문의 접수가 정상 완료되었습니다.');
    }

    setInquiryTitle('');
    setInquiryContent('');
    setShowInquiryForm(false);
    setEditingInquiryId(null);
  };

  const handleEditInquiryClick = (inq: Inquiry) => {
    setEditingInquiryId(inq.id);
    setInquiryTitle(inq.title);
    setInquiryCategory(inq.category);
    setInquiryContent(inq.content);
    setShowInquiryForm(true);
  };

  // Preset Export/Import
  const handleExport = () => {
    try {
      const backupData = {
        pets,
        calendarEvents: usePetStore.getState().events,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      const currentDate = new Date().toISOString();
      downloadAnchor.setAttribute('download', `onda_backup_${currentDate.split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      localStorage.setItem('last_backup_date', currentDate);
      setLastBackupDate(currentDate);

      showAlert('데이터 백업 파일(JSON) 내보내기가 완료되었습니다.');
    } catch (err) {
      console.error(err);
      showAlert('백업 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const handleImport = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const backup = JSON.parse(content);

          if (!backup.pets || !backup.calendarEvents) {
            showAlert('올바르지 않은 백업 파일 형식입니다.');
            return;
          }

          showConfirm(
            '백업 파일을 복원하면 현재 등록된 모든 데이터가 삭제되고 백업 데이터로 대체됩니다. 계속하시겠습니까?',
            '가져오기 데이터 복원',
            async () => {
              await db.pets.clear();
              await db.calendarEvents.clear();

              if (backup.pets.length > 0) {
                await db.pets.bulkAdd(backup.pets);
              }
              if (backup.calendarEvents.length > 0) {
                await db.calendarEvents.bulkAdd(backup.calendarEvents);
              }

              if (backup.pets.length > 0) {
                localStorage.setItem('activePetId', backup.pets[0].id);
              } else {
                localStorage.removeItem('activePetId');
              }

              await loadAllData();
              showAlert('데이터 복원이 성공적으로 완료되었습니다!');
            }
          );
        } catch (err) {
          console.error(err);
          showAlert('파일을 읽는 중 오류가 발생했습니다. 올바른 JSON 형식인지 확인해 주세요.');
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  };

  const handleDeleteAll = () => {
    showConfirm(
      '경고: 모든 반려동물 프로필, 케어 기록, 일기가 영구적으로 삭제됩니다. 백업하지 않은 데이터는 복구할 수 없습니다. 계속하시겠습니까?',
      '전체 데이터 삭제 (1/2)',
      () => {
        setTimeout(() => {
          showConfirm(
            '정말 모든 데이터를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            '마지막 경고 (2/2)',
            async () => {
              await db.pets.clear();
              await db.calendarEvents.clear();
              localStorage.clear();
              window.location.reload();
            }
          );
        }, 100);
      }
    );
  };

  const getMockedReply = (inq: Inquiry) => {
    return `[OnDa 고객센터 답변]\n안녕하세요, 보호자님! 문의하신 "${inq.title}" 건에 대해 담당 부서 확인 후 안내해 드립니다.\n\n요청하신 사항(카테고리: ${inq.category})은 현재 시스템 검토가 진행 중이며 빠른 시일 내에 수정 및 반영을 약속드립니다. 소중한 피드백 대단히 감사드립니다.\n\n- 접수 일시: ${new Date(inq.createdAt).toLocaleString()}\n- 답변 상태: 답변완료 (운영자 검토 마침)`;
  };

  return (
    <div style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* 1. Premium AD Promotional Board Banner */}
      <div 
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #14C3A3 0%, #121B2A 100%)',
          padding: '20px 24px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(20, 195, 163, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, zIndex: 1 }}>
          <span style={{ 
            fontSize: '0.65rem', 
            background: 'rgba(255,255,255,0.2)', 
            padding: '3px 8px', 
            borderRadius: '20px', 
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            PARTNER AD
          </span>
          <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.95rem', fontWeight: 800 }}>🐾 유기농 수제 케어 푸드 [마이도기] 출시!</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
            가입 보호자님 대상 전상품 15% 런칭 감사 쿠폰 지급 중. 우리 아이 건강을 위한 자연식 간식을 만나보세요.
          </p>
        </div>
        <div style={{ fontSize: '2.2rem', opacity: 0.85, zIndex: 1, marginLeft: '12px' }}>🦴</div>
        
        {/* Subtle background glow circle */}
        <div style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(20, 195, 163, 0.3)',
          top: '-40px',
          right: '-40px',
          filter: 'blur(30px)'
        }} />
      </div>

      {/* 2. Unified Accordion Menu List (Mobile Optimized) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* MENU 1: Theme Settings Accordion */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'theme' ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)', 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(18, 27, 42, 0.05)',
          marginBottom: '16px',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedMenu(expandedMenu === 'theme' ? null : 'theme')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedMenu === 'theme' ? 'var(--mint-green-light)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'theme' ? 'var(--white)' : 'var(--mint-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mint-green)',
                flexShrink: 0
              }}>
                <Palette size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>어플리케이션 테마 설정</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--muted-gray)', fontWeight: 'normal' }}>나만의 고유 테마 제작 및 기본 화면 스타일 지정</p>
              </div>
            </div>
            <div style={{ color: 'var(--muted-gray)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'theme' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          {expandedMenu === 'theme' && (
            <div style={{ padding: '16px', borderTop: '1px solid var(--steel-gray)' }}>
              {/* Custom Themes List */}
              <div style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>나의 테마 목록 ({customThemes.length})</p>
                  {!showThemeForm && (
                    <button 
                      onClick={() => {
                        setEditingThemeId(null);
                        setThemeName('');
                        setPrimaryColor('#14C3A3');
                        setBackgroundColor('#F0F3F5');
                        setPaperColor('#FFFFFF');
                        setTextColor('#121B2A');
                        setMutedColor('#a0abbc');
                        setShowThemeForm(true);
                      }}
                      className="premium-btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      + 테마 추가
                    </button>
                  )}
                </div>

                {customThemes.length === 0 && !showThemeForm && (
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>등록된 커스텀 테마가 없습니다.</p>
                )}

                {/* Custom Theme Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customThemes.map(t => (
                    <div 
                      key={t.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        border: activeThemeId === t.id ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)',
                        backgroundColor: 'var(--white)'
                      }}
                    >
                      <div 
                        onClick={() => setThemeId(t.id)} 
                        style={{ cursor: 'pointer', flexGrow: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                      >
                        <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.primary, border: '1px solid #ddd' }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.background, border: '1px solid #ddd' }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.paper, border: '1px solid #ddd' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleEditThemeClick(t)} className="set-btn secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>수정</button>
                        <button onClick={() => deleteCustomTheme(t.id)} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Theme Edit Form */}
                {showThemeForm && (
                  <form onSubmit={handleSaveTheme} style={{ border: '1.5px solid var(--mint-green)', padding: '16px', borderRadius: '10px', marginTop: '16px', backgroundColor: 'var(--ice-white)' }}>
                    <h4 style={{ color: 'var(--mint-green)', marginBottom: '12px', fontSize: '0.9rem' }}>
                      {editingThemeId ? '테마 정보 수정' : '새 커스텀 테마 등록'}
                    </h4>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>테마 이름</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={themeName} 
                        onChange={(e) => setThemeName(e.target.value)} 
                        placeholder="예) 봄날의 민트" 
                        required 
                      />
                    </div>
                    <div className="color-picker-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem' }}>
                      <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label>강조색 (Primary)</label>
                        <input type="color" style={{ width: '100%', height: '30px', cursor: 'pointer' }} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                      </div>
                      <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label>배경색 (Background)</label>
                        <input type="color" style={{ width: '100%', height: '30px', cursor: 'pointer' }} value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                      </div>
                      <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label>카드색 (Paper)</label>
                        <input type="color" style={{ width: '100%', height: '30px', cursor: 'pointer' }} value={paperColor} onChange={(e) => setPaperColor(e.target.value)} />
                      </div>
                      <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label>글자색 (Text)</label>
                        <input type="color" style={{ width: '100%', height: '30px', cursor: 'pointer' }} value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
                      <button type="button" onClick={() => setShowThemeForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0, padding: '8px' }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>저장</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MENU 2: Notification Settings Accordion */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'notification' ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)', 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(18, 27, 42, 0.05)',
          marginBottom: '16px',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedMenu(expandedMenu === 'notification' ? null : 'notification')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedMenu === 'notification' ? 'var(--mint-green-light)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'notification' ? 'var(--white)' : 'var(--mint-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mint-green)',
                flexShrink: 0
              }}>
                <Bell size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>알림 및 알람 리마인더 설정</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--muted-gray)', fontWeight: 'normal' }}>반려견을 위한 투약 일정 및 케어 푸시 리마인더</p>
              </div>
            </div>
            <div style={{ color: 'var(--muted-gray)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'notification' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          {expandedMenu === 'notification' && (
            <div style={{ padding: '16px', borderTop: '1px solid var(--steel-gray)' }}>
              <div className="set-item" style={{ padding: '0 0 12px 0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="set-info" style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--deep-navy)' }}>로컬 실시간 푸시 알림</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-gray)' }}>투약 시간 및 케어 스케줄 알림 브라우저 활성화</p>
                </div>
                <div 
                  onClick={() => setIsPushActive(!isPushActive)}
                  style={{ 
                    width: '44px', height: '22px', 
                    background: isPushActive ? 'var(--mint-green)' : 'var(--steel-gray)', 
                    borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' 
                  }}
                >
                  <div style={{ 
                    width: '18px', height: '18px', background: 'white', borderRadius: '50%', 
                    position: 'absolute', left: '2px', top: '2px', 
                    transform: isPushActive ? 'translateX(22px)' : 'translateX(0px)', transition: 'transform 0.3s' 
                  }} />
                </div>
              </div>

              <div className="google-profile-divider" style={{ margin: '16px 0' }}></div>

              {/* Custom Reminders */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>알람 목록 ({customReminders.length})</p>
                  {!showReminderForm && (
                    <button 
                      onClick={() => {
                        setEditingReminderId(null);
                        setReminderTitle('');
                        setReminderTime('09:00');
                        setReminderPetId(pets[0]?.id || '');
                        setShowReminderForm(true);
                      }}
                      className="premium-btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      + 알람 추가
                    </button>
                  )}
                </div>

                {customReminders.length === 0 && !showReminderForm && (
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>등록된 고유 알람이 없습니다.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customReminders.map(rem => {
                    const pet = pets.find(p => p.id === rem.petId);
                    return (
                      <div 
                        key={rem.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '10px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--steel-gray)',
                          backgroundColor: rem.enabled ? 'var(--white)' : 'var(--ice-white)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ opacity: rem.enabled ? 1 : 0.6 }}>
                          <span style={{ fontSize: '0.75rem', background: 'var(--mint-green-light)', color: 'var(--mint-green)', padding: '2px 4px', borderRadius: '4px', marginRight: '6px', fontWeight: 'bold' }}>
                            {pet?.name || '공통'}
                          </span>
                          <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{rem.time}</span>
                          <span>{rem.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={rem.enabled} 
                            onChange={() => updateCustomReminder({ ...rem, enabled: !rem.enabled })}
                            style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                          />
                          <button onClick={() => handleEditReminderClick(rem)} className="set-btn secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>수정</button>
                          <button onClick={() => deleteCustomReminder(rem.id)} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showReminderForm && (
                  <form onSubmit={handleSaveReminder} style={{ border: '1.5px solid var(--mint-green)', padding: '16px', borderRadius: '10px', marginTop: '16px', backgroundColor: 'var(--ice-white)' }}>
                    <h4 style={{ color: 'var(--mint-green)', marginBottom: '12px', fontSize: '0.9rem' }}>
                      {editingReminderId ? '알람 일정 수정' : '새 알람 예약 등록'}
                    </h4>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>대상 반려견</label>
                      <select 
                        className="form-input" 
                        value={reminderPetId} 
                        onChange={(e) => setReminderPetId(e.target.value)}
                      >
                        {pets.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>알람 내용</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={reminderTitle} 
                        onChange={(e) => setReminderTitle(e.target.value)} 
                        placeholder="예) 기생충 약 급여일" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>알림 시각</label>
                      <input type="time" className="form-input" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={() => setShowReminderForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0, padding: '8px' }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>저장</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MENU 3: System Settings Accordion */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'system' ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)', 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(18, 27, 42, 0.05)',
          marginBottom: '16px',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedMenu(expandedMenu === 'system' ? null : 'system')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedMenu === 'system' ? 'var(--mint-green-light)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'system' ? 'var(--white)' : 'var(--mint-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mint-green)',
                flexShrink: 0
              }}>
                <Database size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>시스템 백업 및 복원</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--muted-gray)', fontWeight: 'normal' }}>데이터 내보내기, 복원 및 데이터 초기화</p>
              </div>
            </div>
            <div style={{ color: 'var(--muted-gray)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'system' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          {expandedMenu === 'system' && (
            <div style={{ padding: '16px', borderTop: '1px solid var(--steel-gray)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--steel-gray)' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--deep-navy)' }}>백업 파일 내보내기</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--muted-gray)' }}>모든 기록 데이터를 JSON 파일로 보관합니다.</p>
                    {lastBackupDate && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--mint-green)', fontWeight: 'bold' }}>
                        최근 백업일: {new Date(lastBackupDate).toLocaleDateString()} {new Date(lastBackupDate).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <button onClick={handleExport} className="set-btn" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>내보내기</button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--steel-gray)' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--deep-navy)' }}>데이터 복원 가져오기</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--muted-gray)' }}>백업 JSON 파일을 업로드하여 복원합니다.</p>
                  </div>
                  <button onClick={handleImport} className="set-btn secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>가져오기</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--error-red)' }}>데이터 완전 초기화</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--muted-gray)' }}>기기의 모든 데이터와 설정을 영구 소멸합니다.</p>
                  </div>
                  <button onClick={handleDeleteAll} className="set-btn" style={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제하기</button>
                </div>

                <div className="google-profile-divider" style={{ margin: '16px 0' }}></div>

                {/* Local Backup Snapshots */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>로컬 스냅샷 백업 ({backupSnapshots.length})</p>
                    {!showSnapshotForm && (
                      <button 
                        onClick={() => {
                          setEditingSnapshotId(null);
                          setSnapshotName(`로컬백업_${new Date().toLocaleDateString()}`);
                          setShowSnapshotForm(true);
                        }}
                        className="premium-btn"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        + 스냅샷 생성
                      </button>
                    )}
                  </div>

                  {backupSnapshots.length === 0 && !showSnapshotForm && (
                    <p style={{ color: 'var(--muted-gray)', fontSize: '0.8rem', textAlign: 'center', padding: '12px 0' }}>저장된 스냅샷이 없습니다.</p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {backupSnapshots.map(snap => (
                      <div 
                        key={snap.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '10px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--steel-gray)',
                          backgroundColor: 'var(--white)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <span style={{ fontWeight: 'bold', display: 'block', fontSize: '0.85rem' }}>{snap.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted-gray)' }}>
                            {new Date(snap.createdAt).toLocaleDateString()} | 프로필 {snap.pets.length}개
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleRestoreSnapshotClick(snap)} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--mint-green)', color: '#FFF' }}>복원</button>
                          <button onClick={() => deleteBackupSnapshot(snap.id)} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showSnapshotForm && (
                    <form onSubmit={handleSaveSnapshot} style={{ border: '1.5px solid var(--mint-green)', padding: '16px', borderRadius: '10px', backgroundColor: 'var(--ice-white)' }}>
                      <h4 style={{ color: 'var(--mint-green)', marginBottom: '12px', fontSize: '0.9rem' }}>
                        {editingSnapshotId ? '스냅샷 수정' : '현재 백업 스냅샷 저장'}
                      </h4>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>스냅샷 이름</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={snapshotName} 
                          onChange={(e) => setSnapshotName(e.target.value)} 
                          placeholder="예) 마일스톤 백업" 
                          required 
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => setShowSnapshotForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0, padding: '8px' }}>취소</button>
                        <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>저장</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MENU 4: Support Accordion */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'support' ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)', 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(18, 27, 42, 0.05)',
          marginBottom: '16px',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedMenu(expandedMenu === 'support' ? null : 'support')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedMenu === 'support' ? 'var(--mint-green-light)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'support' ? 'var(--white)' : 'var(--mint-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mint-green)',
                flexShrink: 0
              }}>
                <HelpCircle size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>자주 묻는 질문 & 고객센터</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--muted-gray)', fontWeight: 'normal' }}>1:1 문의 접수와 자주 하는 질문 모음</p>
              </div>
            </div>
            <div style={{ color: 'var(--muted-gray)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'support' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          {expandedMenu === 'support' && (
            <div style={{ padding: '16px', borderTop: '1px solid var(--steel-gray)' }}>
              
              {/* FAQ Section */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '0.9rem' }}>자주 묻는 질문 (FAQ)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {faqList.map((faq, idx) => (
                    <details 
                      key={idx} 
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--steel-gray)', 
                        background: 'var(--white)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <summary style={{ fontWeight: 'bold', outline: 'none' }}>Q. {faq.q}</summary>
                      <p style={{ marginTop: '8px', fontSize: '0.75rem', color: '#555', lineHeight: 1.4 }}>{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              <div className="google-profile-divider" style={{ margin: '16px 0' }}></div>

              {/* 1:1 Inquiries */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>1:1 문의 내역 ({inquiries.length})</p>
                  {!showInquiryForm && (
                    <button 
                      onClick={() => {
                        setEditingInquiryId(null);
                        setInquiryTitle('');
                        setInquiryCategory('서비스 이용');
                        setInquiryContent('');
                        setShowInquiryForm(true);
                      }}
                      className="premium-btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      + 1:1 문의하기
                    </button>
                  )}
                </div>

                {inquiries.length === 0 && !showInquiryForm && (
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>접수된 문의 건이 없습니다.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                  {inquiries.map(inq => (
                    <div key={inq.id} style={{ borderRadius: '8px', border: '1px solid var(--steel-gray)', backgroundColor: 'var(--white)', overflow: 'hidden', fontSize: '0.85rem' }}>
                      <div 
                        onClick={() => setExpandedInquiryId(expandedInquiryId === inq.id ? null : inq.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', backgroundColor: expandedInquiryId === inq.id ? 'var(--mint-green-light)' : 'transparent' }}
                      >
                        <div>
                          <span style={{ fontSize: '0.7rem', background: '#e0e6ed', padding: '2px 4px', borderRadius: '4px', marginRight: '6px', fontWeight: 'bold' }}>{inq.category}</span>
                          <span style={{ fontWeight: 'bold' }}>{inq.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: inq.status === '답변완료' ? 'var(--mint-green)' : 'var(--muted-gray)' }}>{inq.status}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleEditInquiryClick(inq); }} className="set-btn secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>수정</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteInquiry(inq.id); }} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                        </div>
                      </div>

                      {expandedInquiryId === inq.id && (
                        <div style={{ padding: '12px', borderTop: '1px solid var(--steel-gray)', backgroundColor: '#fcfcfc', fontSize: '0.8rem' }}>
                          <p style={{ whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{inq.content}</p>
                          <p style={{ fontWeight: 'bold', color: 'var(--mint-green)' }}>[답변]</p>
                          <p style={{ whiteSpace: 'pre-wrap', backgroundColor: 'var(--mint-green-light)', padding: '8px', borderRadius: '4px' }}>{getMockedReply(inq)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {showInquiryForm && (
                  <form onSubmit={handleSaveInquiry} style={{ border: '1.5px solid var(--mint-green)', padding: '16px', borderRadius: '10px', backgroundColor: 'var(--ice-white)' }}>
                    <h4 style={{ color: 'var(--mint-green)', marginBottom: '12px', fontSize: '0.9rem' }}>{editingInquiryId ? '1:1 문의사항 수정' : '새로운 문의 등록'}</h4>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>문의 유형</label>
                      <select className="form-input" value={inquiryCategory} onChange={(e) => setInquiryCategory(e.target.value)}>
                        <option value="서비스 이용">서비스 이용</option>
                        <option value="데이터 백업/복원">데이터 백업/복원</option>
                        <option value="오류 제보">오류 제보</option>
                        <option value="제안 및 건의">제안 및 건의</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>문의 제목</label>
                      <input type="text" className="form-input" value={inquiryTitle} onChange={(e) => setInquiryTitle(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>상세 내용</label>
                      <textarea className="form-input" value={inquiryContent} onChange={(e) => setInquiryContent(e.target.value)} style={{ minHeight: '80px', resize: 'none' }} required />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={() => setShowInquiryForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0, padding: '8px' }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>보내기</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;
