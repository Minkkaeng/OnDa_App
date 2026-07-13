import React, { useState } from 'react';
import { ProfileCard } from '../components/ProfileCard';
import { usePetStore } from '../store/petStore';

const Dashboard: React.FC = () => {
  const [dashboardTab, setDashboardTab] = useState<'activity' | 'report'>('activity');
  const { 
    addCalendarEvent, pets, activePetId, showAlert, isGlobalTourActive,
    walkState, walkElapsedSec, walkTargetMin, setWalkState, setWalkElapsedSec, setWalkTargetMin
  } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  // Local Page Guides disabled for unified global tour

  // Local Page Guides disabled for unified global tour

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartWalk = () => {
    if (walkState === 'idle') {
      setWalkElapsedSec(0);
      setWalkState('running');
    } else if (walkState === 'running') {
      setWalkState('paused');
    } else if (walkState === 'paused') {
      setWalkState('running');
    }
  };

  const handleFinishWalk = async () => {
    if (!activePet) return;

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const formattedWalkTime = formatTime(walkElapsedSec);

    await addCalendarEvent({
      petId: activePet.id,
      date: dateStr,
      type: 'diary',
      title: '🐶 산책 완료!',
      content: `총 산책 시간: ${formattedWalkTime} / 목표 시간: ${walkTargetMin}분`
    });

    showAlert('산책 기록이 캘린더에 성공적으로 저장되었습니다!');
    
    setWalkState('idle');
    setWalkElapsedSec(0);
  };

  const getChecklist = () => {
    if (isGlobalTourActive) {
      return [
        { title: '영양제 및 사료 급여', desc: '오전 루틴 정상 급여 완료', status: '완료 09:30', completed: true },
        { title: '위생 케어 및 브러싱', desc: '기본 털망 정돈 및 위생 케어 완료', status: '완료 14:00', completed: true },
        { title: '저녁 정기 산책 예정', desc: '보호자 동반 야외 활동 예정', status: '대기중 18:00', completed: false }
      ];
    }

    const list = [];
    if (activePet) {
      if (activePet.allergies) {
        list.push({
          title: '질병 및 주의사항',
          desc: activePet.allergies,
          status: '확인 완료',
          completed: true
        });
      }
      if (activePet.medications) {
        list.push({
          title: '정기 투약',
          desc: activePet.medications,
          status: '대기중',
          completed: false
        });
      }
      if (activePet.notes) {
        list.push({
          title: '산책 일정 정보',
          desc: activePet.notes,
          status: '확인',
          completed: true
        });
      }
    }
    return list;
  };
  const checklist = getChecklist();

  // 5. Personalized Care Guide Generator
  const getPersonalizedTips = () => {
    const tips = [];
    if (!activePet) return [];

    let ageMonths = 0;
    if (activePet.birth) {
      const birth = new Date(activePet.birth);
      const today = new Date();
      ageMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    }

    const wt = typeof activePet.weight === 'string' ? parseFloat(activePet.weight) : (activePet.weight || 0);

    if (ageMonths < 12 && ageMonths > 0) {
      tips.push({
        id: 'tip-puppy',
        title: '🌱 자견 맞춤 면역 & 사회성 케어',
        content: `현재 ${ageMonths}개월령인 어린 시기입니다. 5차 접종 전까지는 외부 외출 시 위생에 주의하고, 긍정적인 사회성 기르기를 위해 낯선 소리와 실내 환경 체험을 자주 접하게 해주세요.`
      });
    }

    if (ageMonths >= 84) {
      const years = Math.floor(ageMonths / 12);
      tips.push({
        id: 'tip-senior',
        title: '🍂 노령견 슬개골 및 영양 관리',
        content: `올해 ${years}살로 노령기에 진입했습니다. 발바닥 털이 길면 관절에 무리가 가므로 정기 미용을 하고, 슬개골 보호를 위해 거실 매트와 안전 계단을 설치해 주세요.`
      });
    }

    if (wt > 15) {
      tips.push({
        id: 'tip-weight-heavy',
        title: '🏃 관절 무리 방지 분산 산책 추천',
        content: `${wt}kg의 든든한 체격이므로, 한 번에 길게 걷기보다는 15~20분씩 하루 2번 나누어 걷는 것이 심폐와 슬개골 건강에 더욱 이상적입니다.`
      });
    } else if (wt > 0 && wt < 3) {
      tips.push({
        id: 'tip-weight-light',
        title: '🦴 소형견 저혈당 및 연골 관리',
        content: `${wt}kg의 아담한 소형견은 공복 시간이 너무 길어지면 저혈당이 올 수 있으니 급여 시간을 잘 지켜주시고 슬개골 연골 관리를 위한 영양제 보충을 추천합니다.`
      });
    }

    if (tips.length === 0) {
      tips.push({
        id: 'tip-default',
        title: '✨ 온다 맞춤 데일리 건강 관리',
        content: `${activePet.name}의 활력을 위해 매일 투약 복용과 선호 시간대에 맞춰 산책하는 습관을 들여보세요. 꾸준한 루틴이 아이의 면역 체계를 강하게 유지해 줍니다.`
      });
    }

    return tips;
  };

  return (
    <>
      {/* Swipe Screen navigation guide overlay disabled for global tour */}

      {/* Dashboard Guide overlay disabled for global tour */}

      {/* 1. Profile Area */}
      <div>
        <ProfileCard />
      </div>

      {/* Segmented Control Tabs */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--white)', 
        borderRadius: '12px', 
        padding: '4px', 
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <button
          onClick={() => setDashboardTab('activity')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: dashboardTab === 'activity' ? 'var(--mint-green-light)' : 'transparent',
            color: dashboardTab === 'activity' ? 'var(--deep-navy)' : 'var(--muted-gray)',
            fontWeight: dashboardTab === 'activity' ? 800 : 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          투두 & 활동
        </button>
        <button
          onClick={() => setDashboardTab('report')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: dashboardTab === 'report' ? 'var(--mint-green-light)' : 'transparent',
            color: dashboardTab === 'report' ? 'var(--deep-navy)' : 'var(--muted-gray)',
            fontWeight: dashboardTab === 'report' ? 800 : 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          케어 리포트
        </button>
      </div>

      {dashboardTab === 'report' && (
        <div className="tab-content-fade">
          {/* 5. 맞춤형 건강 케어 가이드 */}
          <div 
            className="panel" 
            style={{ 
              background: 'var(--white)', 
              borderRadius: '16px', 
              padding: '20px', 
              width: '100%', 
              boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)',
              marginBottom: '16px'
            }}
          >
            <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              💡 맞춤형 건강 케어 가이드
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getPersonalizedTips().map((tip, idx) => (
                <div key={idx} style={{ background: 'var(--mint-green-light)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid var(--mint-green)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{tip.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>{tip.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. AD Zone */}
          <div className="ad-zone-top" style={{ marginBottom: '16px' }}>
            <div style={{ flexGrow: 1 }}>
              <span className="ad-badge">AD ZONE</span>
              <div style={{ marginTop: '8px' }}>
                <p className="ad-text" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--deep-navy)' }}>내 손안의 반려동물 주치의, 프리미엄 온다 케어 멤버십 오픈!</p>
                <p className="ad-subtext" style={{ color: '#555', fontSize: '0.85rem' }}>실시간 전문가 비대면 상담 및 맞춤형 케어 솔루션 정식 런칭</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardTab === 'activity' && (
        <div className="tab-content-fade">
          {/* 3. Quick Walk Form */}
          <div id="home-guide-step3" className="panel" style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.15rem', fontWeight: 800 }}>오늘의 산책 기록</h3>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">산책 목표 시간</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.2rem', 
                  fontWeight: 800, 
                  color: 'var(--mint-green)',
                  background: 'var(--ice-white)',
                  borderRadius: '12px',
                  border: '1.5px solid var(--steel-gray)'
                }}>
                  {walkTargetMin}분
                </div>
                <div style={{ display: 'flex', gap: '8px', flex: 2 }}>
                  <button
                    type="button"
                    onClick={() => setWalkTargetMin(Math.max(10, walkTargetMin - 10))}
                    className="btn-submit"
                    style={{ flex: 1, margin: 0, padding: '10px 0', backgroundColor: 'var(--steel-gray)', color: 'var(--deep-navy)' }}
                  >
                    -10분
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkTargetMin(walkTargetMin + 10)}
                    className="btn-submit"
                    style={{ flex: 1, margin: 0, padding: '10px 0', backgroundColor: 'var(--ice-white)', color: 'var(--deep-navy)', border: '1px solid var(--mint-green)' }}
                  >
                    +10분
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkTargetMin(walkTargetMin + 30)}
                    className="btn-submit"
                    style={{ flex: 1, margin: 0, padding: '10px 0', backgroundColor: 'var(--mint-green)', color: 'white' }}
                  >
                    +30분
                  </button>
                </div>
              </div>
              <label className="form-label">현재 산책 시간</label>
              <div 
                id="walk-timer-display" 
                className="form-input" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontVariantNumeric: 'tabular-nums', 
                  fontWeight: 800, 
                  background: walkState === 'running' ? '#E6FAF6' : 'var(--ice-white)', 
                  color: walkState === 'running' ? 'var(--mint-green)' : 'var(--muted-gray)', 
                  fontSize: '1.8rem',
                  height: '60px',
                  padding: '0',
                  transition: 'all 0.3s'
                }}
              >
                {formatTime(walkElapsedSec)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleStartWalk} 
                className="btn-submit" 
                style={{ 
                  flex: 1, 
                  backgroundColor: walkState === 'running' ? '#4CE0C4' : 'var(--mint-green)',
                  borderColor: walkState === 'running' ? '#4CE0C4' : 'var(--mint-green)',
                  marginTop: 0,
                  padding: '10px'
                }}
              >
                {walkState === 'idle' ? '시작하기' : walkState === 'running' ? '중단하기' : '재시작'}
              </button>
              {walkState !== 'idle' && (
                <button 
                  type="button" 
                  onClick={handleFinishWalk} 
                  className="btn-submit" 
                  style={{ flex: 1, backgroundColor: 'var(--muted-gray)', borderColor: 'var(--muted-gray)', marginTop: 0, padding: '10px' }}
                >
                  완료하기
                </button>
              )}
            </div>
          </div>

          {/* 4. Care Task List */}
          <div id="home-guide-step2" className="panel" style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.15rem', fontWeight: 800 }}>오늘의 케어 체크리스트</h3>
            <div className="task-list">
              {checklist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted-gray)' }}>
                  오늘 예정된 케어 일정이 없습니다.<br />
                  <span style={{ fontSize: '0.85rem' }}>케어 탭에서 주의사항 및 투약 주기를 설정해 보세요!</span>
                </div>
              ) : (
                checklist.map((item, idx) => (
                  <div key={idx} className={`task-card ${item.completed ? '' : 'pending'}`}>
                    <div className="task-info">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                    <div className={`task-status ${item.completed ? 'completed' : 'pending'}`}>
                      {item.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default Dashboard;
