import React, { useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { usePetStore } from './store/petStore';
import { ChevronLeft, Home, Heart, Calendar as CalendarIcon, BookOpen, Settings as SettingsIcon } from 'lucide-react';

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
    primary: '#4A3B32',
    background: '#FAFAFA',
    paper: '#FFFFFF',
    text: '#2B2825',
    muted: '#78716C'
  },
  dark: {
    primary: '#4A3B32',
    background: '#1F1A17',
    paper: '#2B2825',
    text: '#FAFAFA',
    muted: '#A8A29E'
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
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '360px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        animation: 'scaleUp 0.2s ease-out'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          color: 'var(--text-main)',
          fontSize: '1.2rem',
          fontWeight: 700
        }}>{customDialog.title}</h3>
        <p style={{
          margin: '0 0 24px 0',
          color: 'var(--text-main)',
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
                backgroundColor: 'var(--text-muted)',
                borderColor: 'var(--text-muted)',
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
              backgroundColor: 'var(--main-primary)',
              borderColor: 'var(--main-primary)',
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
    showConfirm,
    showAlert,
    activeThemeId,
    customThemes,
    showSplash,
    setShowSplash
  } = usePetStore();
  const [splashFade, setSplashFade] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const headerDropdownRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading: onboardingLoading, isGlobalTourSeen } = useOnboarding();

  const activePet = pets.find(p => p.id === activePetId) || pets[0];



  const isExitPromptShowingRef = useRef(false);

  // Scroll to top when navigation changes (tab switching)
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle Android Hardware Back Button
  useEffect(() => {
    let listener: any;
    let backPressCount = 0;
    let backPressTimer: any = null;

    const handleBackButton = async () => {
      // 확인할 수 있는 history index가 0보다 크면 뒤로 갈 곳이 있음
      const canGoBack = window.history.state && window.history.state.idx > 0;

      if (canGoBack && !isExitPromptShowingRef.current) {
        navigate(-1);
      } else {
        // 더 이상 뒤로 갈 곳이 없는 경우 (앱의 최상단 루트)
        if (isExitPromptShowingRef.current) {
          // 이미 종료 확인창이 떠있는 상태에서 뒤로가기 누르면 즉시 종료
          CapacitorApp.exitApp();
          return;
        }

        if (backPressCount === 0) {
          backPressCount++;
          // 첫 번째 누름: 토스트 안내문구 표시
          // showAlert 대신 직접 가벼운 Toast를 띄우거나 showAlert 사용
          // 기존에 쓰던 showAlert가 커스텀 다이얼로그라 화면을 덮을 수 있으므로 
          // 상태가 허락한다면 간단한 UI로 처리하거나 그냥 showAlert 호출
          showAlert('뒤로 가기 버튼을 한 번 더 누르시면 종료 확인 창이 뜹니다.');
          
          backPressTimer = setTimeout(() => {
            backPressCount = 0;
          }, 2000);
        } else {
          // 두 번 누름: 종료 다이얼로그 띄우기
          clearTimeout(backPressTimer);
          backPressCount = 0;
          
          isExitPromptShowingRef.current = true;
          showConfirm('앱을 종료하시겠습니까?', '앱 종료', 
            () => {
              CapacitorApp.exitApp();
            },
            () => {
              isExitPromptShowingRef.current = false;
            }
          );
        }
      }
    };
    
    CapacitorApp.addListener('backButton', handleBackButton).then(l => {
      listener = l;
    });

    return () => {
      if (listener) listener.remove();
    };
  }, [location.pathname, navigate, showConfirm, showAlert]);

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
      root.style.setProperty('--main-primary', colors.primary);
      root.style.setProperty('--screen-bg', colors.background);
      root.style.setProperty('--card-bg', colors.paper);
      root.style.setProperty('--text-main', colors.text);
      root.style.setProperty('--text-muted', colors.muted);
      root.style.setProperty('--butter-cream', colors.primary + '1a');
    }
  }, [activeThemeId, customThemes]);





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

  // Splash screen transition
  useEffect(() => {
    if (!showSplash) return;
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
  }, [loading, onboardingLoading, isGlobalTourSeen, isGlobalTourActive, setGlobalTourActive, showSplash, setShowSplash]);

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

  const isObPage = location.pathname === '/onboarding';
  const mainTabs = ['/', '/dashboard', '/care', '/calendar', '/diary', '/settings'];
  const isSubPage = !mainTabs.includes(location.pathname) && !isObPage;

  const renderAppLayout = () => {
    return (
      <div className="web-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
        {/* 1. App Top Bar */}
        {!isObPage && (
          <header className="app-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSubPage ? (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    background: 'var(--butter-cream)',
                    border: '1px solid var(--main-primary)',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--main-primary)',
                    padding: 0
                  }}
                  title="뒤로 가기"
                >
                  <ChevronLeft size={22} color="var(--main-primary)" />
                </button>
              ) : (
                <Link to="/" className="brand-logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" style={{ height: '30px' }}>
                    <path d="M 98 45 A 15 15 0 0 0 68 45 C 68 70, 98 85, 98 85 C 98 85, 128 70, 128 45 A 15 15 0 0 0 98 45" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M 168 25 V 85" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round"/>
                    <path d="M 168 25 C 223 25, 223 85, 168 85" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round"/>
                    <path d="M 128 85 V 45" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round"/>
                    <path d="M 128 55 C 128 35, 168 35, 168 55 V 85" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round"/>
                    <circle cx="240" cy="65" r="20" fill="none" stroke="var(--main-primary)" strokeWidth="16"/>
                    <path d="M 260 45 V 85" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round"/>
                  </svg>
                </Link>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              
              {/* Profile Menu Mini Banner Chip */}
              {activePet && (
                <div className="header-profile-menu-container" style={{ position: 'relative' }} ref={headerDropdownRef}>
                  <div 
                    onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--butter-cream)',
                      border: '1px solid var(--main-primary)',
                      padding: '3px 8px 3px 4px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      color: 'var(--main-primary)'
                    }}
                  >
                    <img 
                      src={activePet.image || '/default_paw.png'} 
                      alt="Profile Menu" 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--main-primary)' }}
                      onError={(e) => { e.currentTarget.src = '/default_paw.png' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--main-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px', display: 'inline-block' }}>
                      {activePet.name} ▾
                    </span>
                  </div>
                  {headerDropdownOpen && (
                    <div className="header-profile-dropdown-menu" style={{ position: 'absolute', top: '40px', right: 0, zIndex: 1000 }}>
                      <div className="google-profile-header">
                        <img src={activePet.image || '/default_paw.png'} className="google-profile-large-avatar" alt="Avatar" onError={(e) => { e.currentTarget.src = '/default_paw.png' }} />
                        <h4 className="google-profile-name">{activePet.name}</h4>
                        <p className="google-profile-email">{activePet.breed} | {activePet.weight}kg</p>
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
                            <img src={pet.image || '/default_paw.png'} className="google-pet-item-avatar" alt={pet.name} onError={(e) => { e.currentTarget.src = '/default_paw.png' }} />
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
          </header>
        )}

        {/* 2. Center Content Area (Router View) */}
        <main ref={mainRef} className={isObPage ? "content-onboarding" : "content-center"}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <p style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>로컬 데이터를 불러오는 중...</p>
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

        {/* 3. App Bottom Navigation */}
        {!isObPage && (
          <nav className="app-bottom-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Home size={24} />
              <span>홈</span>
            </NavLink>
            <NavLink to="/care" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Heart size={24} />
              <span>케어</span>
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <CalendarIcon size={24} />
              <span>캘린더</span>
            </NavLink>
            <NavLink to="/diary" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <BookOpen size={24} />
              <span>기록</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <SettingsIcon size={24} />
              <span>설정</span>
            </NavLink>
          </nav>
        )}
      </div>
    );
  };

  return (
    <>

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" style={{ height: '80px', marginBottom: '12px' }}>
              <path d="M 98 45 A 15 15 0 0 0 68 45 C 68 70, 98 85, 98 85 C 98 85, 128 70, 128 45 A 15 15 0 0 0 98 45" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 168 25 V 85" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 168 25 C 223 25, 223 85, 168 85" fill="none" stroke="var(--main-primary)" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 128 85 V 45" fill="none" stroke="var(--warm-amber)" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 128 55 C 128 35, 168 35, 168 55 V 85" fill="none" stroke="var(--warm-amber)" strokeWidth="16" strokeLinecap="round"/>
              <circle cx="240" cy="65" r="20" fill="none" stroke="var(--warm-amber)" strokeWidth="16"/>
              <path d="M 260 45 V 85" fill="none" stroke="var(--warm-amber)" strokeWidth="16" strokeLinecap="round"/>
            </svg>
            <h2 style={{ color: 'var(--text-main)', margin: '0 0 6px 0', fontSize: '1.6rem', letterSpacing: '-0.5px', fontWeight: 800 }}>OnDa Pet Care</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.2px' }}>우리아이 맞춤 케어</p>
          </div>
        </div>
      )}



      <CustomDialog />

      {renderAppLayout()}
      {isGlobalTourActive && <GlobalTour />}
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
