import React, { useState, useEffect } from 'react';
import { usePetStore, THEME_PRESETS, type CustomTheme, type CustomReminder, type BackupSnapshot, type Inquiry } from '../store/petStore';
import { db } from '../db';
import { Palette, Bell, Database, HelpCircle, ChevronDown, ChevronUp, Bone, Lock, PawPrint, MessageSquare, ShieldCheck } from 'lucide-react';

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

  const [expandedMenu, setExpandedMenu] = useState<'theme' | 'notification' | 'system' | 'support' | 'faq' | null>(null);
  const [isPushActive, setIsPushActive] = useState(true);
  const [lastBackupDate, setLastBackupDate] = useState(localStorage.getItem('last_backup_date') || '');

  useEffect(() => {
    if (expandedMenu) {
      setTimeout(() => {
        const element = document.getElementById(`menu-panel-${expandedMenu}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    }
  }, [expandedMenu]);

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
  const [primaryColor, setPrimaryColor] = useState('#4A3B32');
  const [backgroundColor, setBackgroundColor] = useState('#FAFAFA');
  const [paperColor, setPaperColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#2B2825');
  const [mutedColor, setMutedColor] = useState('#78716C');
  const [iconColor, setIconColor] = useState('#4A3B32');

  // Reminder Form States
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderPetId, setReminderPetId] = useState(pets[0]?.id || '');
  const [reminderRepeat, setReminderRepeat] = useState<'none' | 'daily' | 'weekly'>('none');

  // Snapshot Form State
  const [snapshotName, setSnapshotName] = useState('');

  // Inquiry Form States
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('서비스 이용');
  const [inquiryContent, setInquiryContent] = useState('');

  // Preset FAQ
  const faqList = [
    { q: 'OnDa Pet Care는 어떤 서비스인가요?', a: '반려동물의 건강, 산책, 투약 일정 등을 캘린더와 대시보드를 통해 손쉽게 관리하고 기록할 수 있는 하이브리드 반려동물 전용 다이어리 서비스입니다.' },
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
      muted: mutedColor,
      icon: iconColor
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
    setIconColor(theme.colors.icon || theme.colors.primary);
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
          petId: reminderPetId,
          repeat: reminderRepeat
        });
      }
      showAlert('알림 정보가 수정되었습니다.');
    } else {
      addCustomReminder({
        title: reminderTitle.trim(),
        time: reminderTime,
        petId: reminderPetId,
        repeat: reminderRepeat
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
    setReminderRepeat(reminder.repeat || 'none');
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
    const confirmText = window.prompt(
      '경고: 모든 반려동물 프로필, 케어 기록, 일기가 영구적으로 삭제됩니다. 백업하지 않은 데이터는 복구할 수 없습니다.\n계속하시려면 아래에 "삭제합니다"를 정확히 입력해주세요.'
    );
    
    if (confirmText === '삭제합니다') {
      const executeReset = async () => {
        await db.pets.clear();
        await db.calendarEvents.clear();
        localStorage.clear();
        window.location.reload();
      };
      executeReset();
    } else if (confirmText !== null) {
      showAlert('입력한 텍스트가 일치하지 않습니다. 데이터 삭제가 취소되었습니다.');
    }
  };

  const getMockedReply = (inq: Inquiry) => {
    return `[OnDa 고객센터 답변]\n안녕하세요, 보호자님! 문의하신 "${inq.title}" 건에 대해 담당 부서 확인 후 안내해 드립니다.\n\n요청하신 사항(카테고리: ${inq.category})은 현재 시스템 검토가 진행 중이며 빠른 시일 내에 수정 및 반영을 약속드립니다. 소중한 피드백 대단히 감사드립니다.\n\n- 접수 일시: ${new Date(inq.createdAt).toLocaleString()}\n- 답변 상태: 답변완료 (운영자 검토 마침)`;
  };

  return (
    <div style={{ paddingBottom: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* 1. Premium AD Promotional Board Banner */}
      <div 
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--main-primary) 0%, var(--text-main) 100%)',
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
          <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.95rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><PawPrint size={16} /> 유기농 수제 케어 푸드 [마이도기] 출시!</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
            가입 보호자님 대상 전상품 15% 런칭 감사 쿠폰 지급 중. 우리 아이 건강을 위한 자연식 간식을 만나보세요.
          </p>
        </div>
        <div style={{ opacity: 0.85, zIndex: 1, marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
          <Bone size={36} color="white" />
        </div>
        
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

      {/* 1.5. Data Safety Trust Badge */}
      <div style={{ backgroundColor: 'var(--butter-cream)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(20, 195, 163, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--icon-color)' }}>
          <Lock size={24} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>안전한 로컬 데이터 저장소</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>모든 소중한 데이터는 서버가 아닌 기기에 오프라인으로 안전하게 보관됩니다.</span>
        </div>
      </div>

      {/* 2. Unified Accordion Menu List (Mobile Optimized) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* MENU 1: Theme Settings Accordion */}
          <div id="menu-panel-theme" className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'theme' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedMenu === 'theme' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
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
              backgroundColor: expandedMenu === 'theme' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'theme' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <Palette size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>어플리케이션 테마 설정</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>나만의 고유 테마 제작 및 기본 화면 스타일 지정</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'theme' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateRows: expandedMenu === 'theme' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedMenu === 'theme' ? 1 : 0,
            visibility: expandedMenu === 'theme' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                {/* Preset Themes List */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-main)' }}>기본 테마 프리셋</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Object.entries(THEME_PRESETS).map(([id, colors]) => (
                      <div 
                        key={id}
                        onClick={() => setThemeId(id)}
                        style={{
                          cursor: 'pointer',
                          padding: '12px',
                          borderRadius: '16px',
                          border: activeThemeId === id ? '2px solid var(--main-primary)' : '1px solid var(--border-color)',
                          backgroundColor: activeThemeId === id ? 'var(--butter-cream)' : 'var(--card-bg)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: activeThemeId === id ? 'var(--main-primary)' : 'var(--text-main)' }}>
                            {id === 'light' ? '밝은 테마' : '어두운 테마'}
                          </span>
                          {activeThemeId === id && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--main-primary)', fontWeight: 'bold' }}>사용중</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.primary, border: '1px solid #ddd' }} title="Primary" />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.background, border: '1px solid #ddd' }} title="Background" />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.paper, border: '1px solid #ddd' }} title="Paper" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Themes List */}
                <div style={{ marginBottom: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>나의 커스텀 테마 목록 ({customThemes.length})</p>
                    {!showThemeForm && (
                      <button 
                        onClick={() => {
                          setEditingThemeId(null);
                          setThemeName('');
                          setPrimaryColor('#4A3B32');
                          setBackgroundColor('#FAFAFA');
                          setPaperColor('#FFFFFF');
                          setTextColor('#2B2825');
                          setMutedColor('#78716C');
                          setIconColor('#4A3B32');
                          setShowThemeForm(true);
                        }}
                        className="set-btn secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', marginTop: 0, width: 'auto' }}
                      >
                        + 테마 추가
                      </button>
                    )}
                  </div>

                  {customThemes.length === 0 && !showThemeForm && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>등록된 커스텀 테마가 없습니다.</p>
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
                          borderRadius: '16px', 
                          border: activeThemeId === t.id ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)',
                          backgroundColor: 'var(--card-bg)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div 
                          onClick={() => setThemeId(t.id)} 
                          style={{ cursor: 'pointer', flexGrow: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                        >
                          <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{t.name}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.primary, border: '1px solid #ddd' }} title="Primary" />
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.background, border: '1px solid #ddd' }} title="Background" />
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.paper, border: '1px solid #ddd' }} title="Paper" />
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.colors.icon || t.colors.primary, border: '1px solid #ddd' }} title="Icon" />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEditThemeClick(t)} className="set-btn secondary" style={{ padding: '3px 8px', fontSize: '0.75rem', marginTop: 0, width: 'auto' }}>수정</button>
                          <button onClick={() => deleteCustomTheme(t.id)} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--error-red)', color: '#FFF', marginTop: 0, width: 'auto' }}>삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Theme Edit Form */}
                  {showThemeForm && (
                    <form onSubmit={handleSaveTheme} style={{ border: '1.5px solid var(--main-primary)', padding: '16px', borderRadius: '16px', marginTop: '16px', backgroundColor: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <h4 style={{ color: 'var(--main-primary)', marginBottom: '12px', fontSize: '0.9rem' }}>
                        {editingThemeId ? '테마 정보 수정' : '새 커스텀 테마 등록'}
                      </h4>

                      {/* Live Preview Container */}
                      <div style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>실시간 미리보기</label>
                        <div style={{
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: backgroundColor,
                          border: '1px solid var(--border-color)',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: textColor, fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Bone size={14} color={iconColor} /> {themeName || '새 테마 이름'}
                            </span>
                            <span style={{ color: mutedColor, fontSize: '0.65rem' }}>미리보기 화면</span>
                          </div>
                          
                          <div style={{
                            backgroundColor: paperColor,
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${mutedColor}22`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ color: textColor, fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <PawPrint size={14} color={iconColor} /> 초코의 오늘의 돌봄
                            </div>
                            <div style={{ color: mutedColor, fontSize: '0.6rem' }}>
                              오늘 산책을 완료하고 저녁 사료를 먹였습니다.
                            </div>
                            <div style={{
                              backgroundColor: primaryColor,
                              color: '#FFFFFF',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.6rem',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              marginTop: '4px',
                              cursor: 'default',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}>
                              <ShieldCheck size={12} color="#FFFFFF" /> 케어 완료
                            </div>
                          </div>
                        </div>
                      </div>

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
                        <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label>설명색 (Muted)</label>
                          <input type="color" style={{ width: '100%', height: '30px', cursor: 'pointer' }} value={mutedColor} onChange={(e) => setMutedColor(e.target.value)} />
                        </div>
                        <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label>아이콘색 (Icon)</label>
                          <input type="color" style={{ width: '100%', height: '30px', cursor: 'pointer' }} value={iconColor} onChange={(e) => setIconColor(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setShowThemeForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--butter-cream)', color: 'var(--main-primary)', marginTop: 0, padding: '8px' }}>취소</button>
                        <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>저장</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MENU 2: Notification Settings Accordion */}
          <div id="menu-panel-notification" className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'notification' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedMenu === 'notification' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
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
              backgroundColor: expandedMenu === 'notification' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'notification' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <Bell size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>알림 및 알람 리마인더 설정</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>반려동물을 위한 투약 일정 및 케어 푸시 리마인더</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'notification' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateRows: expandedMenu === 'notification' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedMenu === 'notification' ? 1 : 0,
            visibility: expandedMenu === 'notification' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div className="set-item" style={{ padding: '0 0 12px 0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="set-info" style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>로컬 실시간 푸시 알림</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>투약 시간 및 케어 스케줄 알림 브라우저 활성화</p>
                </div>
                <div 
                  onClick={() => setIsPushActive(!isPushActive)}
                  style={{ 
                    width: '44px', height: '22px', 
                    background: isPushActive ? 'var(--main-primary)' : 'var(--border-color)', 
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
                        setReminderRepeat('none');
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
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>등록된 고유 알람이 없습니다.</p>
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
                          borderRadius: '16px', 
                          border: '1.5px solid var(--border-color)',
                          backgroundColor: rem.enabled ? 'var(--card-bg)' : 'var(--screen-bg)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ opacity: rem.enabled ? 1 : 0.6 }}>
                          <span style={{ fontSize: '0.75rem', background: 'var(--butter-cream)', color: 'var(--main-primary)', padding: '2px 4px', borderRadius: '4px', marginRight: '6px', fontWeight: 'bold' }}>
                            {pet?.name || '공통'}
                          </span>
                          <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{rem.time}</span>
                          <span>{rem.title}</span>
                          {rem.repeat && rem.repeat !== 'none' && (
                            <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: 'var(--main-primary)', border: '1px solid var(--main-primary)', borderRadius: '4px', padding: '1px 4px' }}>
                              {rem.repeat === 'daily' ? '매일' : '매주'}
                            </span>
                          )}
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
                  <form onSubmit={handleSaveReminder} style={{ border: '1.5px solid var(--main-primary)', padding: '16px', borderRadius: '16px', marginTop: '16px', backgroundColor: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <h4 style={{ color: 'var(--main-primary)', marginBottom: '12px', fontSize: '0.9rem' }}>
                      {editingReminderId ? '알람 일정 수정' : '새 알람 예약 등록'}
                    </h4>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>대상 반려동물</label>
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
                    <div className="form-group" style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>알림 시각</label>
                        <input type="time" className="form-input" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>반복 설정</label>
                        <select 
                          className="form-input" 
                          value={reminderRepeat} 
                          onChange={(e) => setReminderRepeat(e.target.value as 'none' | 'daily' | 'weekly')}
                        >
                          <option value="none">반복 안 함</option>
                          <option value="daily">매일</option>
                          <option value="weekly">매주</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={() => setShowReminderForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--butter-cream)', color: 'var(--main-primary)', marginTop: 0, padding: '8px' }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>저장</button>
                    </div>
                  </form>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* MENU 3: System Settings Accordion */}
          <div id="menu-panel-system" className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'system' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedMenu === 'system' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
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
              backgroundColor: expandedMenu === 'system' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'system' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <Database size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>시스템 백업 및 복원</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>데이터 내보내기, 복원 및 데이터 초기화</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'system' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateRows: expandedMenu === 'system' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedMenu === 'system' ? 1 : 0,
            visibility: expandedMenu === 'system' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>백업 파일 내보내기</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>모든 기록 데이터를 JSON 파일로 보관합니다.</p>
                    {lastBackupDate && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--main-primary)', fontWeight: 'bold' }}>
                        최근 백업일: {new Date(lastBackupDate).toLocaleDateString()} {new Date(lastBackupDate).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <button onClick={handleExport} className="set-btn" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>내보내기</button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>데이터 복원 가져오기</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>백업 JSON 파일을 업로드하여 복원합니다.</p>
                  </div>
                  <button onClick={handleImport} className="set-btn secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>가져오기</button>
                </div>

                <div style={{ 
                  marginTop: '16px',
                  padding: '16px', 
                  backgroundColor: '#FEF2F2', 
                  border: '1px solid #FCA5A5', 
                  borderRadius: '12px',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#B91C1C', fontWeight: 800 }}>⚠️ 데이터 완전 초기화 (Danger Zone)</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#991B1B' }}>기기의 모든 데이터와 설정을 영구 소멸합니다. 복구할 수 없습니다.</p>
                  </div>
                  <button onClick={handleDeleteAll} style={{ fontSize: '0.75rem', padding: '8px 14px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)' }}>삭제하기</button>
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
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '12px 0' }}>저장된 스냅샷이 없습니다.</p>
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
                          borderRadius: '16px', 
                          border: '1.5px solid var(--border-color)',
                          backgroundColor: 'var(--card-bg)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '8px' }}>
                          <span style={{ fontWeight: 'bold', display: 'block', fontSize: '0.85rem' }}>{snap.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(snap.createdAt).toLocaleDateString()} | 프로필 {snap.pets.length}개
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleRestoreSnapshotClick(snap)} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--main-primary)', color: '#FFF' }}>복원</button>
                          <button onClick={() => deleteBackupSnapshot(snap.id)} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showSnapshotForm && (
                    <form onSubmit={handleSaveSnapshot} style={{ border: '1.5px solid var(--main-primary)', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <h4 style={{ color: 'var(--main-primary)', marginBottom: '12px', fontSize: '0.9rem' }}>
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
                        <button type="button" onClick={() => setShowSnapshotForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--butter-cream)', color: 'var(--main-primary)', marginTop: 0, padding: '8px' }}>취소</button>
                        <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>저장</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* MENU 4: Customer Center (Support) Accordion */}
        <div id="menu-panel-support" className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'support' ? '2px solid var(--main-primary)' : '1px solid var(--border-color)', 
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
              backgroundColor: expandedMenu === 'support' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'support' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <MessageSquare size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>고객센터</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>1:1 문의 접수 및 이용 약관 / 처리방침</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'support' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateRows: expandedMenu === 'support' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedMenu === 'support' ? 1 : 0,
            visibility: expandedMenu === 'support' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
              
              {/* 1:1 Inquiries */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>1:1 문의 내역 ({inquiries.length})</p>
                  <button 
                    onClick={() => {
                      if (showInquiryForm) {
                        setShowInquiryForm(false);
                        setEditingInquiryId(null);
                      } else {
                        setEditingInquiryId(null);
                        setInquiryTitle('');
                        setInquiryCategory('서비스 이용');
                        setInquiryContent('');
                        setShowInquiryForm(true);
                      }
                    }}
                    className={showInquiryForm ? "set-btn secondary" : "premium-btn"}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', margin: 0, height: 'auto', border: showInquiryForm ? '1.5px solid var(--border-color)' : 'none' }}
                  >
                    {showInquiryForm ? '닫기' : '문의하기'}
                  </button>
                </div>

                {inquiries.length === 0 && !showInquiryForm && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>접수된 문의 건이 없습니다.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                  {inquiries.map(inq => (
                    <div key={inq.id} style={{ borderRadius: '16px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden', fontSize: '0.85rem' }}>
                      <div 
                        onClick={() => setExpandedInquiryId(expandedInquiryId === inq.id ? null : inq.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', backgroundColor: expandedInquiryId === inq.id ? 'var(--butter-cream)' : 'transparent' }}
                      >
                        <div>
                          <span style={{ fontSize: '0.7rem', background: '#e0e6ed', padding: '2px 4px', borderRadius: '4px', marginRight: '6px', fontWeight: 'bold' }}>{inq.category}</span>
                          <span style={{ fontWeight: 'bold' }}>{inq.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: inq.status === '답변완료' ? 'var(--main-primary)' : 'var(--text-muted)' }}>{inq.status}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleEditInquiryClick(inq); }} className="set-btn secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>수정</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteInquiry(inq.id); }} className="set-btn" style={{ padding: '3px 8px', fontSize: '0.75rem', backgroundColor: 'var(--error-red)', color: '#FFF' }}>삭제</button>
                        </div>
                      </div>

                      {expandedInquiryId === inq.id && (
                        <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--screen-bg)', fontSize: '0.8rem' }}>
                          <p style={{ whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{inq.content}</p>
                          <p style={{ fontWeight: 'bold', color: 'var(--main-primary)' }}>[답변]</p>
                          <p style={{ whiteSpace: 'pre-wrap', backgroundColor: 'var(--butter-cream)', padding: '8px', borderRadius: '4px' }}>{getMockedReply(inq)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {showInquiryForm && (
                  <form onSubmit={handleSaveInquiry} style={{ border: '1.5px solid var(--main-primary)', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <h4 style={{ color: 'var(--main-primary)', marginBottom: '12px', fontSize: '0.9rem' }}>{editingInquiryId ? '1:1 문의사항 수정' : '새로운 문의 등록'}</h4>
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
                      <button type="button" onClick={() => setShowInquiryForm(false)} className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--butter-cream)', color: 'var(--main-primary)', marginTop: 0, padding: '8px' }}>취소</button>
                      <button type="submit" className="btn-submit" style={{ flex: 1, marginTop: 0, padding: '8px' }}>보내기</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="google-profile-divider" style={{ margin: '16px 0' }}></div>

              {/* Legal & Policies Section */}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '0.9rem' }}>법적 고지 및 약관</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <details style={{ padding: '10px 12px', borderRadius: '16px', border: '1.5px solid var(--border-color)', background: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <summary style={{ fontWeight: 'bold', outline: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: 'var(--main-primary)' }} />
                      개인정보 처리방침
                    </summary>
                    <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'pre-wrap', paddingLeft: '20px' }}>
                      {`[개인정보 처리방침]
온다(OnDa)는 이용자의 개인정보를 매우 소중히 취급하며, '개인정보 보호법'을 철저히 준수합니다.

1. 수집하는 개인정보 항목: 
   반려동물 프로필 정보(이름, 생일, 몸무게 등) 및 사용자가 캘린더/다이어리에 직접 입력한 케어 로그 데이터.
2. 수집 및 이용 목적: 
   맞춤형 반려동물 스케줄 관리 및 상태 모니터링 서비스 제공.
3. 보유 및 이용 기간: 
   수집된 모든 데이터는 브라우저의 로컬 스토리지(IndexDB)에 저장되며 회원 탈퇴 시 또는 앱 삭제 시 영구 파기됩니다.`}
                    </p>
                  </details>

                  <details style={{ padding: '10px 12px', borderRadius: '16px', border: '1.5px solid var(--border-color)', background: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <summary style={{ fontWeight: 'bold', outline: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: 'var(--main-primary)' }} />
                      서비스 이용약관
                    </summary>
                    <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'pre-wrap', paddingLeft: '20px' }}>
                      {`[서비스 이용약관]
제1조 (목적) 
본 약관은 온다(OnDa) 앱이 무상으로 제공하는 반려동물 다이어리 및 케어 관리 서비스의 사용 조건과 절차를 규정합니다.

제2조 (서비스의 범위)
온다는 이용자에게 반려동물 건강 기록, 스케줄 캘린더 등록, 산책 트래킹, 케어 리포트 요약 등 다양한 편의 기능을 제공합니다.

제3조 (회원의 책임)
이용자는 앱에 타인의 명예를 훼손하거나 유해한 정보, 허위 데이터를 기록해서는 안 되며 그에 따른 책임은 본인에게 귀속됩니다.`}
                    </p>
                  </details>

                  <details style={{ padding: '10px 12px', borderRadius: '16px', border: '1.5px solid var(--border-color)', background: 'var(--card-bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <summary style={{ fontWeight: 'bold', outline: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: 'var(--main-primary)' }} />
                      위치정보 이용약관
                    </summary>
                    <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'pre-wrap', paddingLeft: '20px' }}>
                      {`[위치정보 이용약관]
제1조 (목적)
본 약관은 사용자가 온다(OnDa)의 '산책 트래커' 기능을 활성화하여 산책 동선과 시간을 기록할 때 사용되는 위치정보 서비스 이용 규칙을 정합니다.

제2조 (위치정보의 수집)
이용자가 산책 기능을 시작하는 경우에 한해, 단말기의 GPS 등 위치 수집 방식을 통해 동선 분석 용도로 경로 데이터를 일시 수집합니다.

제3조 (개인위치정보의 보존)
수집된 실시간 경로 데이터는 이용자의 기기 내부 로컬 저장소에 보존되며 본인의 명시적 동의 없이 외부 서버로 유출 및 보존되지 않습니다.`}
                    </p>
                  </details>
                </div>
              </div>

              </div>
            </div>
          </div>
        </div>

        {/* MENU 5: FAQ Accordion (Moved to very bottom) */}
        <div id="menu-panel-faq" className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedMenu === 'faq' ? '2px solid var(--main-primary)' : '1px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(18, 27, 42, 0.05)',
          marginBottom: '16px',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedMenu(expandedMenu === 'faq' ? null : 'faq')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedMenu === 'faq' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedMenu === 'faq' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <HelpCircle size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>자주 묻는 질문</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>온다 앱 이용에 자주 묻는 질문들 모음</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedMenu === 'faq' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateRows: expandedMenu === 'faq' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedMenu === 'faq' ? 1 : 0,
            visibility: expandedMenu === 'faq' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {faqList.map((faq, idx) => (
                  <details 
                    key={idx} 
                    style={{ 
                      padding: '10px 12px', 
                      borderRadius: '16px', 
                      border: '1.5px solid var(--border-color)', 
                      background: 'var(--card-bg)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <summary style={{ fontWeight: 'bold', outline: 'none' }}>Q. {faq.q}</summary>
                    <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{faq.a}</p>
                  </details>
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
