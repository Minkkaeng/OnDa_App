import React, { useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { usePetStore } from './store/petStore';
import { Home, Heart, Calendar as CalendarIcon, BookOpen, Settings as SettingsIcon } from 'lucide-react';

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
import { ProfileCard } from './components/ProfileCard';

const THEME_PRESETS: Record<string, { primary: string; background: string; paper: string; text: string; muted: string }> = {
  light: {
    primary: '#0D9488',
    background: '#F8FAFC',
    paper: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B'
  },
  dark: {
    primary: '#0D9488',
    background: '#0F172A',
    paper: '#1E293B',
    text: '#F8FAFC',
    muted: '#94A3B8'
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
    showConfirm,
    activeThemeId,
    customThemes,
    showSplash,
    setShowSplash
  } = usePetStore();
  const [splashFade, setSplashFade] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading: onboardingLoading, isGlobalTourSeen } = useOnboarding();



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
    const handleBackButton = async () => {
      // 메인 탭(홈, 케어, 캘린더, 기록, 설정)이거나 온보딩/스플래시 화면일 때 앱 종료 확인 얼럿 띄우기
      const mainPaths = ['/', '/dashboard', '/care', '/calendar', '/diary', '/settings'];
      const isMainTab = mainPaths.includes(location.pathname) || location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/splash');
      
      if (isMainTab) {
        if (isExitPromptShowingRef.current) {
          // 얼럿이 띄워진 상태에서 뒤로가기를 한 번 더 누르면 즉시 종료
          CapacitorApp.exitApp();
        } else {
          isExitPromptShowingRef.current = true;
          showConfirm('앱을 종료하시겠습니까?', '앱 종료', 
            () => {
              // 확인 버튼 클릭 시
              CapacitorApp.exitApp();
            },
            () => {
              // 취소 버튼 클릭 시
              isExitPromptShowingRef.current = false;
            }
          );
        }
      } else {
        // 그 외의 하위 페이지에서는 이전 화면으로 돌아가기
        navigate(-1);
      }
    };
    
    CapacitorApp.addListener('backButton', handleBackButton).then(l => {
      listener = l;
    });

    return () => {
      if (listener) listener.remove();
    };
  }, [location.pathname, navigate, showConfirm]);

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

  const isObPage = location.pathname === '/onboarding';





  const renderAppLayout = () => {
    return (
      <div className="web-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
        {/* 1. App Top Profile Bar (Image 1 디자인 접목 & 고정 배치) */}
        {!isObPage && (
          <div style={{ padding: '16px 16px 8px 16px', backgroundColor: 'var(--ice-white)', flexShrink: 0 }}>
            <ProfileCard />
          </div>
        )}

        {/* 2. Center Content Area (Router View) */}
        <main ref={mainRef} className={isObPage ? "content-onboarding" : "content-center"}>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 130" style={{ height: '80px', marginBottom: '12px' }}>
              <path d="M 98 45 A 15 15 0 0 0 68 45 C 68 70, 98 85, 98 85 C 98 85, 128 70, 128 45 A 15 15 0 0 0 98 45" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 168 25 V 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 168 25 C 223 25, 223 85, 168 85" fill="none" stroke="#14C3A3" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 128 85 V 45" fill="none" stroke="#0E9B82" strokeWidth="16" strokeLinecap="round"/>
              <path d="M 128 55 C 128 35, 168 35, 168 55 V 85" fill="none" stroke="#0E9B82" strokeWidth="16" strokeLinecap="round"/>
              <circle cx="240" cy="65" r="20" fill="none" stroke="#0E9B82" strokeWidth="16"/>
              <path d="M 260 45 V 85" fill="none" stroke="#0E9B82" strokeWidth="16" strokeLinecap="round"/>
            </svg>
            <h2 style={{ color: 'var(--deep-navy)', margin: '0 0 6px 0', fontSize: '1.6rem', letterSpacing: '-0.5px', fontWeight: 800 }}>OnDa Pet Care</h2>
            <p style={{ color: 'var(--muted-gray)', margin: 0, fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.2px' }}>우리아이 맞춤 케어</p>
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
