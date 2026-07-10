import React, { useState } from 'react';
import { usePetStore } from '../store/petStore';
import { db } from '../db';

const Settings: React.FC = () => {
  const { pets, events, loadAllData } = usePetStore();
  const [isPushActive, setIsPushActive] = useState(true);

  const handleExport = () => {
    try {
      const backupData = {
        pets,
        calendarEvents: events,
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

      alert('데이터 백업 파일(JSON) 내보내기가 완료되었습니다.');
    } catch (err) {
      console.error(err);
      alert('백업 파일 생성 중 오류가 발생했습니다.');
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
            alert('올바르지 않은 백업 파일 형식입니다.');
            return;
          }

          if (confirm('백업 파일을 복원하면 현재 등록된 모든 데이터가 삭제되고 백업 데이터로 대체됩니다. 계속하시겠습니까?')) {
            // Clear current DB
            await db.pets.clear();
            await db.calendarEvents.clear();

            // Insert backup data
            if (backup.pets.length > 0) {
              await db.pets.bulkAdd(backup.pets);
            }
            if (backup.calendarEvents.length > 0) {
              await db.calendarEvents.bulkAdd(backup.calendarEvents);
            }

            // Reset activePetId if needed
            if (backup.pets.length > 0) {
              localStorage.setItem('activePetId', backup.pets[0].id);
            } else {
              localStorage.removeItem('activePetId');
            }

            // Reload store state
            await loadAllData();
            alert('데이터 복원이 성공적으로 완료되었습니다!');
          }
        } catch (err) {
          console.error(err);
          alert('파일을 읽는 중 오류가 발생했습니다. 올바른 JSON 형식인지 확인해 주세요.');
        }
      };
      reader.readAsText(file);
    };

    fileInput.click();
  };

  const handleDeleteAll = async () => {
    if (confirm('경고: 모든 반려동물 프로필, 케어 기록, 일기가 영구적으로 삭제됩니다. 백업하지 않은 데이터는 복구할 수 없습니다. 정말 모든 데이터를 삭제하시겠습니까?')) {
      // Clear DB
      await db.pets.clear();
      await db.calendarEvents.clear();
      
      // Clear localStorage
      localStorage.clear();
      
      // Reload page to reset state and go to onboarding
      window.location.reload();
    }
  };

  const togglePush = () => {
    setIsPushActive(!isPushActive);
  };

  return (
    <>
      <div 
        id="settings-guide-step1"
        className="set-warning" 
      >
        ⚠ 주의: 브라우저 캐시 청소 및 로컬 저장소 비우기 수행 시 기존 데이터가 완전 소멸될 수 있습니다.
      </div>

      <div className="care-layout">
        <div className="care-col" style={{ flex: 2 }}>
          <h2 className="care-title">시스템 데이터 관리</h2>
          <div className="set-list">
            <div className="set-item">
              <div className="set-info">
                <h4>백업 파일 내보내기</h4>
                <p>현재까지 기록된 모든 데이터를 JSON 파일로 다운로드합니다.</p>
              </div>
              <button id="settings-guide-step2" onClick={handleExport} className="set-btn">Export / 내보내기</button>
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
                <h4 style={{ color: 'var(--error-red)' }}>데이터 완전 삭제</h4>
                <p>기기에 저장된 모든 기록(프로필, 케어, 일기 등)을 영구 삭제합니다.</p>
              </div>
              <button onClick={handleDeleteAll} className="set-btn" style={{ backgroundColor: 'var(--error-red)' }}>Delete All / 삭제</button>
            </div>
            
            <div className="set-item" style={{ border: 'none' }}>
              <div className="set-info">
                <h4>로컬 실시간 푸시 알림</h4>
                <p>예약된 케어 투약 시간 및 스케줄 브라우저 알림 토글</p>
              </div>
              <div 
                id="push-toggle" 
                onClick={togglePush}
                style={{ 
                  width: '48px', 
                  height: '24px', 
                  background: isPushActive ? 'var(--mint-green)' : 'var(--steel-gray)', 
                  borderRadius: '12px', 
                  position: 'relative', 
                  cursor: 'pointer', 
                  transition: 'background 0.3s' 
                }}
              >
                <div 
                  id="push-knob" 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    background: 'white', 
                    borderRadius: '50%', 
                    position: 'absolute', 
                    left: '2px', 
                    top: '2px', 
                    transform: isPushActive ? 'translateX(24px)' : 'translateX(0px)', 
                    transition: 'transform 0.3s' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="care-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
          <span className="ad-badge" style={{ background: 'var(--error-red)', marginBottom: '16px' }}>SPONSOR AD</span>
          <h3 style={{ marginBottom: '8px' }}>OnDa 안심 유기농 샴푸</h3>
          <p style={{ textAlign: 'center', color: 'var(--muted-gray)', fontSize: '0.9rem' }}>화학 성분 0%, 천연 보습 인자로 민감성 피부 케어 전용 스펙 출시!</p>
        </div>
      </div>
    </>
  );
};

export default Settings;
