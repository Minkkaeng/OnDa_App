import React, { useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { usePetStore } from './store/petStore';

// Import Pages
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Care from './pages/Care';
import Calendar from './pages/Calendar';
import Diary from './pages/Diary';
import Settings from './pages/Settings';
import GlobalTour from './components/GlobalTour';
import GlobalWalkBar from './components/common/GlobalWalkBar';
import { useOnboarding } from './hooks/useOnboarding';
import Profile from './pages/Profile';

const THEME_PRESETS: Record<string, { primary: string; background: string; paper: string; text: string; muted: string }> = {
  light: {
    primary: '#14C3A3',
    background: '#F0F3F5',
    paper: '#FFFFFF',
    text: '#121B2A',
    muted: '#a0abbc'
  },
  dark: {
    primary: '#14C3A3',
    background: '#121B2A',
    paper: '#1e293b',
    text: '#F0F3F5',
    muted: '#94a3b8'
  }
};

const CustomDialog: React.FC = () => {
  const { customDialog, closeDialog } = usePetStore();
  if (!customDialog.isOpen) return null;

  const handleConfirm = () => {
    closeDialog();
    if (customDialog.onConfirm) customDialog.onConfirm();
  };

  const handleCancel = () => {
    closeDialog();
    if (customDialog.onCancel) customDialog.onCancel();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(18, 27, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '360px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        textAlign: 'center',
        border: '1px solid var(--steel-gray)',
        animation: 'scaleUp 0.2s ease-out'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          color: 'var(--deep-navy)',
          fontSize: '1.2rem',
          fontWeight: 700
        }}>{customDialog.title}</h3>
        <p style={{
          margin: '0 0 24px 0',
          color: 'var(--deep-navy)',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap'
        }}>{customDialog.message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {customDialog.type === 'confirm' && (
            <button
              onClick={handleCancel}
              className="btn-submit"
              style={{
                flex: 1,
                backgroundColor: 'var(--muted-gray)',
                borderColor: 'var(--muted-gray)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '30px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: 0
              }}
            >
              취소
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="btn-submit"
            style={{
              flex: 1,
              backgroundColor: 'var(--mint-green)',
              borderColor: 'var(--mint-green)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: 0
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { 
    loading, 
    loadAllData, 
    isGlobalTourActive, 
    setGlobalTourActive,
    pets,
    activePetId,
    setActivePetId,
    showAlert,
    showConfirm,
    activeThemeId,
    customThemes,
    showSplash,
    setShowSplash
  } = usePetStore();
  const [splashFade, setSplashFade] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const headerDropdownRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading: onboardingLoading, isGlobalTourSeen } = useOnboarding();

  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  // Apply Theme Colors
  useEffect(() => {
    let colors = THEME_PRESETS[activeThemeId];
    if (!colors) {
      const custom = customThemes.find(t => t.id === activeThemeId);
      if (custom) {
        colors = custom.colors;
      }
    }

    if (colors) {
      const root = document.documentElement;
      root.style.setProperty('--mint-green', colors.primary);
      root.style.setProperty('--ice-white', colors.background);
      root.style.setProperty('--white', colors.paper);
      root.style.setProperty('--deep-navy', colors.text);
      root.style.setProperty('--muted-gray', colors.muted);
      root.style.setProperty('--mint-green-light', colors.primary + '1a');
    }
  }, [activeThemeId, customThemes]);

  // Click outside for header dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(e.target as Node)) {
        setHeaderDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDevReset = async () => {
    showConfirm('모든 데이터(LocalStorage, IndexedDB)를 초기화하시겠습니까?', '개발용 데이터 초기화', async () => {
      localStorage.clear();
      const { db } = await import('./db');
      await db.delete();
      window.location.reload();
    });
  };

  // Load local database data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Check first run or no pets
  useEffect(() => {
    if (!loading && !isGlobalTourActive) {
      const { pets } = usePetStore.getState();
      const isFirstRun = localStorage.getItem('isFirstRun');
      if ((!isFirstRun || pets.length === 0) && location.pathname !== '/onboarding') {
        navigate('/onboarding');
      }
    }
  }, [loading, location.pathname, navigate, isGlobalTourActive]);

  // Start Global Tour (Disabled automatic sequence start - replaced by local page guides)
  useEffect(() => {
    // Global Tour auto-start disabled to allow page-specific guides instead.
  }, []);

  // Splash screen transition
  useEffect(() => {
    if (!loading && !onboardingLoading) {
      // 최소 3.5초(3500ms) 동안 스플래시 화면을 유지한 후 페이드아웃 시작
      const minDurationTimer = setTimeout(() => {
        // 페이드아웃 시작할 때(3.5초 직후) 가이드 투어 활성화를 미리 수행하여 레이아웃 렌더링을 마침
        if (!isGlobalTourSeen && !isGlobalTourActive) {
          setGlobalTourActive(true);
        }
        setSplashFade(true);
        const fadeTimer = setTimeout(() => {
          setShowSplash(false);
        }, 300);
        return () => clearTimeout(fadeTimer);
      }, 3500); // 스플래시 대기 시간을 3.5초로 설정

      return () => clearTimeout(minDurationTimer);
    }
  }, [loading, onboardingLoading, isGlobalTourSeen, isGlobalTourActive, setGlobalTourActive]);

  const isObPage = location.pathname === '/onboarding';

  const handlePremiumClick = () => {
    showAlert("현재 프리미엄 멤버십 오픈 준비 중입니다.");
  };



  const renderAppLayout = () => {
    return (
      <div className="web-layout">
        {/* 1. Global Web Header */}
        {!isObPage && (
          <header className="web-header" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '12px 0 0 0', height: 'auto' }}>
            <div className="header-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', marginBottom: '12px' }}>
              <Link to="/" className="brand-logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" style={{ height: '40px', marginRight: '8px' }}>
                  <circle cx="60" cy="55" r="30" fill="none" stroke="#14C3A3" strokeWidth="16"/>
                  <path d="M 115 85 V 45" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
                  <path d="M 115 55 C 115 35, 155 35, 155 55 V 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
                  <path d="M 185 25 V 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
                  <path d="M 185 25 C 235 25, 235 85, 185 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
                  <path d="M 255 85 L 275 25 L 295 85" fill="none" stroke="#121B2A" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 275 68 C 275 68, 263 56, 263 48 A 8 8 0 0 1 275 44 A 8 8 0 0 1 287 48 C 287 56, 275 68, 275 68 Z" fill="#14C3A3"/>
                </svg>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="premium-btn" onClick={handlePremiumClick} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>PREMIUM</button>
                
                {/* Google Style Profile Dropdown Button */}
                {location.pathname !== '/dashboard' && activePet && (
                  <div className="header-profile-menu-container" ref={headerDropdownRef}>
                    <img 
                      src={activePet.image} 
                      alt="Profile Menu" 
                      onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)} 
                      className="header-profile-avatar-btn"
                    />
                    {headerDropdownOpen && (
                      <div className="header-profile-dropdown-menu">
                        <div className="google-profile-header">
                          <img src={activePet.image} className="google-profile-large-avatar" alt="Avatar" />
                          <h4 className="google-profile-name">{activePet.name}</h4>
                          <p className="google-profile-email">🐾 {activePet.breed} | ⚖️ {activePet.weight}kg</p>
                          <button 
                            className="google-profile-edit-btn"
                            onClick={() => {
                              setHeaderDropdownOpen(false);
                              navigate(`/profile?id=${activePet.id}`);
                            }}
                          >
                            프로필 수정
                          </button>
                        </div>
                        
                        <div className="google-profile-divider"></div>
                        
                        <div className="google-profile-pet-list">
                          <p className="google-profile-list-title">다른 반려동물 프로필</p>
                          {pets.filter(p => p.id !== activePet.id).map(pet => (
                            <div 
                              key={pet.id} 
                              className="google-pet-item" 
                              onClick={() => {
                                setActivePetId(pet.id);
                                setHeaderDropdownOpen(false);
                              }}
                            >
                              <img src={pet.image} className="google-pet-item-avatar" alt={pet.name} />
                              <span className="google-pet-item-name">{pet.name}</span>
                            </div>
                          ))}
                          <div 
                            className="google-pet-add-btn" 
                            onClick={() => {
                              setHeaderDropdownOpen(false);
                              navigate('/profile?add=true');
                            }}
                          >
                            + 새 프로필 추가
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Nav Links (상단 메뉴 부활) */}
            <nav className="web-header-nav" style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
              <NavLink to="/dashboard" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                대시보드
              </NavLink>
              <NavLink to="/care" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                케어
              </NavLink>
              <NavLink to="/calendar" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                캘린더
              </NavLink>
              <NavLink to="/diary" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                기록일기
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}>
                설정
              </NavLink>
            </nav>
          </header>
        )}

        {/* 2. Center Content Area (Router View) */}
        <main className={isObPage ? "content-onboarding" : "content-center"}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <p style={{ color: 'var(--deep-navy)', fontWeight: 'bold' }}>로컬 데이터를 불러오는 중...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/care" element={<Care />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          )}
        </main>

        <GlobalWalkBar />

        {/* 3. Global Bottom Footer */}
        {!isObPage && (
          <>
            <footer className="web-footer" style={{ paddingBottom: '80px' }}>
              <p>
                프로필 수정 및 관리 | 고객센터 및 1:1 문의 채널 | 공지사항 및 업데이트 정보 | 자주 묻는 질문(FAQ) | 서비스 이용약관 | <b>개인정보처리방침</b><br/>
                © OnDa Pet Care App. All Rights Reserved. Designed for Desktop & Mobile Environments.
              </p>
            </footer>

          </>
        )}
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={handleDevReset}
        style={{
          position: 'fixed',
          bottom: '85px',
          left: '16px',
          zIndex: 99999,
          background: '#FF4444',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          opacity: 0.8
        }}
      >
        Dev Reset
      </button>

      {/* 0. Intro Splash Screen */}
      {showSplash && (
        <div 
          id="intro-splash" 
          className="intro-splash" 
          style={{ 
            backgroundColor: '#F0F3F5',
            opacity: splashFade ? 0 : 1, 
            transition: 'opacity 0.3s ease',
            pointerEvents: splashFade ? 'none' : 'auto'
          }}
        >
          <div className="splash-content">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" style={{ height: '80px', marginBottom: '24px' }}>
              <circle cx="60" cy="55" r="30" fill="none" stroke="#14C3A3" strokeWidth="16"/>
              <path d="M 115 85 V 45" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 115 55 C 115 35, 155 35, 155 55 V 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 185 25 V 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 185 25 C 235 25, 235 85, 185 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 255 85 L 275 25 L 295 85" fill="none" stroke="#121B2A" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 275 68 C 275 68, 263 56, 263 48 A 8 8 0 0 1 275 44 A 8 8 0 0 1 287 48 C 287 56, 275 68, 275 68 Z" fill="#14C3A3"/>
            </svg>
            <h2 style={{ color: 'var(--deep-navy)', margin: 0, fontSize: '1.5rem' }}>OnDa Pet Care</h2>
          </div>
        </div>
      )}



      <CustomDialog />

      {isGlobalTourActive ? (
        <div className="tour-phone-wrapper">
          <div className="phone-device-frame">
            <div className="phone-screen-content">
              {renderAppLayout()}
              <GlobalTour />
            </div>
            <div className="phone-notch"></div>
            <div className="phone-home-indicator"></div>
          </div>
        </div>
      ) : (
        renderAppLayout()
      )}
    </>
  );
};

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
