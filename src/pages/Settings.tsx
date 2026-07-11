import React, { useState } from 'react';
import { usePetStore, type CustomTheme, type CustomReminder, type BackupSnapshot, type Inquiry } from '../store/petStore';
import { db } from '../db';

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

  const [activeTab, setActiveTab] = useState<'theme' | 'notification' | 'system' | 'support'>('theme');
  const [isPushActive, setIsPushActive] = useState(true);

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
    { q: '모바일에서도 실시간으로 사용할 수 있나요?', a: '네! 본 앱은 모바일 환경에 최적화되어 있으며 모바일 브라우저나 설치형 APK를 통해 이용하실 수 있습니다.' },
    { q: '다크 모드와 커스텀 테마 적용은 어떻게 하나요?', a: '설정 > 테마 설정 메뉴에서 다크 모드 선택 또는 직접 원하시는 디자인 컬러를 조합하여 커스텀 테마를 생성 및 등록하실 수 있습니다.' }
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

  const handleEditSnapshotClick = (snap: BackupSnapshot) => {
    setEditingSnapshotId(snap.id);
    setSnapshotName(snap.name);
    setShowSnapshotForm(true);
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
      downloadAnchor.setAttribute('download', `onda_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

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
      '경고: 모든 반려동물 프로필, 케어 기록, 일기가 영구적으로 삭제됩니다. 백업하지 않은 데이터는 복구할 수 없습니다. 정말 모든 데이터를 삭제하시겠습니까?',
      '전체 데이터 삭제',
      async () => {
        await db.pets.clear();
        await db.calendarEvents.clear();
        localStorage.clear();
        window.location.reload();
      }
    );
  };

  const getMockedReply = (inq: Inquiry) => {
    return `[OnDa 고객센터 답변]\n안녕하세요, 보호자님! 문의하신 "${inq.title}" 건에 대해 담당 부서 확인 후 안내해 드립니다.\n\n요청하신 사항(카테고리: ${inq.category})은 현재 시스템 검토가 진행 중이며 빠른 시일 내에 수정 및 반영을 약속드립니다. 소중한 피드백 대단히 감사드립니다.\n\n- 접수 일시: ${new Date(inq.createdAt).toLocaleString()}\n- 답변 상태: 답변완료 (운영자 검토 마침)`;
  };

  return (
    <>
      <div id="settings-guide-step1" className="set-warning">
        ⚠ 주의: 브라우저 캐시 청소 및 로컬 저장소 비우기 수행 시 기존 데이터가 완전 소멸될 수 있습니다.
      </div>

      <div className="settings-layout">
        {/* Left Submenu Navigation */}
        <div className="settings-tabs-col">
          <button 
            className={`settings-tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            🎨 테마 설정
          </button>
          <button 
            className={`settings-tab-btn ${activeTab === 'notification' ? 'active' : ''}`}
            onClick={() => setActiveTab('notification')}
          >
            🔔 알림 설정
          </button>
          <button 
            className={`settings-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            ⚙️ 시스템 설정
          </button>
          <button 
            className={`settings-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            💬 고객지원 문의
          </button>
        </div>

        {/* Right Submenu Details */}
        <div className="settings-content-col">
          
          {/* TAB 1: Theme Settings */}
          {activeTab === 'theme' && (
            <div className="settings-sub-panel">
              <h3>🎨 어플리케이션 테마 설정</h3>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>기본 시스템 테마</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setThemeId('light')}
                    className="set-btn" 
                    style={{ flex: 1, backgroundColor: activeThemeId === 'light' ? 'var(--mint-green)' : '#FFF', color: activeThemeId === 'light' ? '#FFF' : 'var(--deep-navy)', border: '1px solid var(--steel-gray)' }}
                  >
                    라이트 모드 (Default Light)
                  </button>
                  <button 
                    onClick={() => setThemeId('dark')}
                    className="set-btn"
                    style={{ flex: 1, backgroundColor: activeThemeId === 'dark' ? 'var(--mint-green)' : '#FFF', color: activeThemeId === 'dark' ? '#FFF' : 'var(--deep-navy)', border: '1px solid var(--steel-gray)' }}
                  >
                    다크 모드 (Default Dark)
                  </button>
                </div>
              </div>

              <div className="google-profile-divider" style={{ margin: '24px 0' }}></div>

              {/* Custom Themes List */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>커스텀 테마 목록 ({customThemes.length})</p>
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
                      style={{ padding: '6px 12px' }}
                    >
                      + 테마 추가
                    </button>
                  )}
                </div>

                {customThemes.length === 0 && !showThemeForm && (
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>등록된 커스텀 테마가 없습니다.</p>
                )}

                {/* Custom Theme Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {customThemes.map(t => (
                    <div 
                      key={t.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px 16px', 
                        borderRadius: '8px', 
                        border: activeThemeId === t.id ? '2px solid var(--mint-green)' : '1px solid var(--steel-gray)',
                        backgroundColor: 'var(--white)'
                      }}
                    >
                      <div 
                        onClick={() => setThemeId(t.id)} 
                        style={{ cursor: 'pointer', flexGrow: 1, display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: t.colors.primary, border: '1px solid #ddd' }} />
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: t.colors.background, border: '1px solid #ddd' }} />
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: t.colors.paper, border: '1px solid #ddd' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditThemeClick(t)} className="set-btn secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>수정</button>
                        <button onClick={() => deleteCustomTheme(t.id)} className="set-btn" style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Theme Edit Form Modal-like inline panel */}
                {showThemeForm && (
                  <form onSubmit={handleSaveTheme} className="panel" style={{ border: '2px solid var(--mint-green)', padding: '20px', marginTop: '16px' }}>
                    <h4 style={{ color: 'var(--mint-green)', marginBottom: '16px' }}>
                      {editingThemeId ? '테마 정보 수정' : '새 커스텀 테마 정보 입력'}
                    </h4>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">테마 이름</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={themeName} 
                        onChange={(e) => setThemeName(e.target.value)} 
                        placeholder="예) 봄날의 민트" 
                        required 
                      />
                    </div>
                    <div className="color-picker-row">
                      <div className="color-input-wrapper">
                        <label>대표 강조색 (Primary)</label>
                        <input type="color" className="color-picker-input" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                      </div>
                      <div className="color-input-wrapper">
                        <label>배경 색상 (Background)</label>
                        <input type="color" className="color-picker-input" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                      </div>
                      <div className="color-input-wrapper">
                        <label>박스/카드 색상 (Paper)</label>
                        <input type="color" className="color-picker-input" value={paperColor} onChange={(e) => setPaperColor(e.target.value)} />
                      </div>
                      <div className="color-input-wrapper">
                        <label>기본 텍스트 색상</label>
                        <input type="color" className="color-picker-input" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                      </div>
                      <div className="color-input-wrapper">
                        <label>설명/보조 텍스트</label>
                        <input type="color" className="color-picker-input" value={mutedColor} onChange={(e) => setMutedColor(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                      <button type="button" onClick={() => setShowThemeForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0 }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0 }}>저장 및 적용</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Notification Settings */}
          {activeTab === 'notification' && (
            <div className="settings-sub-panel">
              <h3>🔔 알림 및 알람 리마인더 설정</h3>
              <div className="set-item" style={{ padding: '0 0 16px 0', marginBottom: '24px' }}>
                <div className="set-info">
                  <h4>로컬 실시간 푸시 알림</h4>
                  <p>예약된 케어 투약 시간 및 스케줄 알림 브라우저 토글</p>
                </div>
                <div 
                  onClick={() => setIsPushActive(!isPushActive)}
                  style={{ 
                    width: '48px', height: '24px', 
                    background: isPushActive ? 'var(--mint-green)' : 'var(--steel-gray)', 
                    borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' 
                  }}
                >
                  <div style={{ 
                    width: '20px', height: '20px', background: 'white', borderRadius: '50%', 
                    position: 'absolute', left: '2px', top: '2px', 
                    transform: isPushActive ? 'translateX(24px)' : 'translateX(0px)', transition: 'transform 0.3s' 
                  }} />
                </div>
              </div>

              <div className="google-profile-divider" style={{ margin: '24px 0' }}></div>

              {/* Custom Reminders List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>투약/케어 알람 목록 ({customReminders.length})</p>
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
                      style={{ padding: '6px 12px' }}
                    >
                      + 알람 추가
                    </button>
                  )}
                </div>

                {customReminders.length === 0 && !showReminderForm && (
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>등록된 고유 리마인더 알림이 없습니다.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customReminders.map(rem => {
                    const pet = pets.find(p => p.id === rem.petId);
                    return (
                      <div 
                        key={rem.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '12px 16px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--steel-gray)',
                          backgroundColor: rem.enabled ? 'var(--white)' : 'var(--ice-white)'
                        }}
                      >
                        <div style={{ opacity: rem.enabled ? 1 : 0.6 }}>
                          <span style={{ fontSize: '0.8rem', background: 'var(--mint-green-light)', color: 'var(--mint-green)', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: 'bold' }}>
                            {pet?.name || '공통'}
                          </span>
                          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{rem.time}</span>
                          <span>{rem.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={rem.enabled} 
                            onChange={() => updateCustomReminder({ ...rem, enabled: !rem.enabled })}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <button onClick={() => handleEditReminderClick(rem)} className="set-btn secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>수정</button>
                          <button onClick={() => deleteCustomReminder(rem.id)} className="set-btn" style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add/Edit Reminder Inline Form */}
                {showReminderForm && (
                  <form onSubmit={handleSaveReminder} className="panel" style={{ border: '2px solid var(--mint-green)', padding: '20px', marginTop: '16px' }}>
                    <h4 style={{ color: 'var(--mint-green)', marginBottom: '16px' }}>
                      {editingReminderId ? '알람 일정 수정' : '새 알람 예약 등록'}
                    </h4>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">대상 반려견</label>
                      <select 
                        className="form-input" 
                        value={reminderPetId} 
                        onChange={(e) => setReminderPetId(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        {pets.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">알람 내용</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={reminderTitle} 
                        onChange={(e) => setReminderTitle(e.target.value)} 
                        placeholder="예) 종합 비타민 복용일" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">알림 시각</label>
                      <input 
                        type="time" 
                        className="form-input" 
                        value={reminderTime} 
                        onChange={(e) => setReminderTime(e.target.value)} 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setShowReminderForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0 }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0 }}>예약 알람 저장</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: System Settings */}
          {activeTab === 'system' && (
            <div className="settings-sub-panel">
              <h3>⚙️ 시스템 데이터 백업 및 관리</h3>
              <div className="set-list" style={{ marginBottom: '24px' }}>
                <div className="set-item">
                  <div className="set-info">
                    <h4>백업 파일 내보내기</h4>
                    <p>현재까지 기록된 모든 데이터를 JSON 파일로 다운로드합니다.</p>
                  </div>
                  <button onClick={handleExport} className="set-btn">Export / 내보내기</button>
                </div>
                
                <div className="set-item">
                  <div className="set-info">
                    <h4>데이터 복원 가져오기</h4>
                    <p>이전에 백업 완료한 JSON 파일을 로드하여 동기화합니다.</p>
                  </div>
                  <button onClick={handleImport} className="set-btn secondary">Import / 가져오기</button>
                </div>

                <div className="set-item">
                  <div className="set-info">
                    <h4 style={{ color: 'var(--error-red)' }}>데이터 완전 초기화</h4>
                    <p>기기에 로컬로 저장된 모든 기록 및 프로필 설정을 영구 삭제합니다.</p>
                  </div>
                  <button onClick={handleDeleteAll} className="set-btn" style={{ backgroundColor: 'var(--error-red)', color: '#FFF' }}>Delete All / 삭제</button>
                </div>
              </div>

              <div className="google-profile-divider" style={{ margin: '24px 0' }}></div>

              {/* Local Backup Snapshots */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>로컬 저장소 백업 스냅샷 ({backupSnapshots.length})</p>
                  {!showSnapshotForm && (
                    <button 
                      onClick={() => {
                        setEditingSnapshotId(null);
                        setSnapshotName(`로컬백업_${new Date().toLocaleDateString()}`);
                        setShowSnapshotForm(true);
                      }}
                      className="premium-btn"
                      style={{ padding: '6px 12px' }}
                    >
                      + 스냅샷 만들기
                    </button>
                  )}
                </div>

                {backupSnapshots.length === 0 && !showSnapshotForm && (
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>저장된 로컬 스냅샷이 없습니다.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {backupSnapshots.map(snap => (
                    <div 
                      key={snap.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px 16px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--steel-gray)',
                        backgroundColor: 'var(--white)'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 'bold', display: 'block' }}>{snap.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>
                          생성일: {new Date(snap.createdAt).toLocaleString()} | 반려견: {snap.pets.length}마리 | 기록: {snap.calendarEvents.length}개
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRestoreSnapshotClick(snap)} className="set-btn" style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: 'var(--mint-green)', color: '#FFF' }}>복원</button>
                        <button onClick={() => handleEditSnapshotClick(snap)} className="set-btn secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>수정</button>
                        <button onClick={() => deleteBackupSnapshot(snap.id)} className="set-btn" style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                      </div>
                    </div>
                  ))}
                </div>

                {showSnapshotForm && (
                  <form onSubmit={handleSaveSnapshot} className="panel" style={{ border: '2px solid var(--mint-green)', padding: '20px', marginTop: '16px' }}>
                    <h4 style={{ color: 'var(--mint-green)', marginBottom: '16px' }}>
                      {editingSnapshotId ? '스냅샷 타이틀 수정' : '현재 시스템 상태 백업 저장'}
                    </h4>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">스냅샷 이름</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={snapshotName} 
                        onChange={(e) => setSnapshotName(e.target.value)} 
                        placeholder="예) 산책 패치 완료 스냅샷" 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setShowSnapshotForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0 }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0 }}>백업 상태 저장</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Customer Support Inquiries */}
          {activeTab === 'support' && (
            <div className="settings-sub-panel">
              <h3>💬 자주 묻는 질문 및 1:1 고객센터 문의</h3>
              
              {/* FAQ Section */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>자주 묻는 질문 (FAQ)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {faqList.map((faq, idx) => (
                    <details 
                      key={idx} 
                      style={{ 
                        padding: '12px 16px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--steel-gray)', 
                        background: 'var(--white)',
                        cursor: 'pointer'
                      }}
                    >
                      <summary style={{ fontWeight: 'bold', outline: 'none' }}>Q. {faq.q}</summary>
                      <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              <div className="google-profile-divider" style={{ margin: '24px 0' }}></div>

              {/* 1:1 Inquiries Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>보호자님 1:1 문의 내역 ({inquiries.length})</p>
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
                      style={{ padding: '6px 12px' }}
                    >
                      + 1:1 문의하기
                    </button>
                  )}
                </div>

                {inquiries.length === 0 && !showInquiryForm && (
                  <p style={{ color: 'var(--muted-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>접수된 문의 건이 없습니다.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {inquiries.map(inq => (
                    <div 
                      key={inq.id} 
                      style={{ 
                        borderRadius: '8px', 
                        border: '1px solid var(--steel-gray)',
                        backgroundColor: 'var(--white)',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        onClick={() => setExpandedInquiryId(expandedInquiryId === inq.id ? null : inq.id)}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '14px 16px', 
                          cursor: 'pointer',
                          backgroundColor: expandedInquiryId === inq.id ? 'var(--mint-green-light)' : 'transparent'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.75rem', background: '#e0e6ed', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: 'bold' }}>
                            {inq.category}
                          </span>
                          <span style={{ fontWeight: 'bold' }}>{inq.title}</span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted-gray)', marginTop: '4px' }}>
                            접수일: {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold', 
                            color: inq.status === '답변완료' ? 'var(--mint-green)' : 'var(--muted-gray)',
                            marginRight: '8px'
                          }}>
                            {inq.status}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); handleEditInquiryClick(inq); }} className="set-btn secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>수정</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteInquiry(inq.id); }} className="set-btn" style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                        </div>
                      </div>

                      {expandedInquiryId === inq.id && (
                        <div style={{ padding: '16px', borderTop: '1px solid var(--steel-gray)', backgroundColor: '#fcfcfc' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '0.85rem' }}>[문의 본문]</p>
                          <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', marginBottom: '16px' }}>{inq.content}</p>
                          
                          <div className="google-profile-divider" style={{ margin: '12px 0' }}></div>
                          
                          <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--mint-green)' }}>[고객센터 답변]</p>
                          <p style={{ 
                            whiteSpace: 'pre-wrap', 
                            fontSize: '0.85rem', 
                            color: '#444', 
                            backgroundColor: 'var(--mint-green-light)', 
                            padding: '12px', 
                            borderRadius: '6px',
                            borderLeft: '4px solid var(--mint-green)'
                          }}>
                            {getMockedReply(inq)}
                          </p>
                          
                          <button 
                            onClick={() => {
                              const updatedInq = { ...inq, status: '답변완료' as const };
                              updateInquiry(updatedInq);
                              showAlert('답변 처리가 완료 상태로 활성화되었습니다.');
                            }}
                            className="set-btn"
                            style={{ marginTop: '12px', width: '100%', fontSize: '0.8rem', padding: '8px' }}
                          >
                            답변 확인 및 해결 완료 처리
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {showInquiryForm && (
                  <form onSubmit={handleSaveInquiry} className="panel" style={{ border: '2px solid var(--mint-green)', padding: '20px', marginTop: '16px' }}>
                    <h4 style={{ color: 'var(--mint-green)', marginBottom: '16px' }}>
                      {editingInquiryId ? '1:1 문의사항 수정' : '새로운 고객센터 문의 등록'}
                    </h4>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">문의 유형</label>
                      <select 
                        className="form-input" 
                        value={inquiryCategory} 
                        onChange={(e) => setInquiryCategory(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="서비스 이용">서비스 이용</option>
                        <option value="데이터 백업/복원">데이터 백업/복원</option>
                        <option value="오류 제보">오류 제보</option>
                        <option value="제안 및 건의">제안 및 건의</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">문의 제목</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={inquiryTitle} 
                        onChange={(e) => setInquiryTitle(e.target.value)} 
                        placeholder="예) 데이터 스냅샷이 복원되지 않습니다." 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">상세 내용</label>
                      <textarea 
                        className="form-input" 
                        value={inquiryContent} 
                        onChange={(e) => setInquiryContent(e.target.value)} 
                        style={{ minHeight: '120px', resize: 'none' }}
                        placeholder="겪으신 불편이나 제안 사항을 상세히 기재해 주세요." 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setShowInquiryForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--muted-gray)', marginTop: 0 }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0 }}>문의 전송</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
