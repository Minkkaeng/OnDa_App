import React, { useEffect, useState } from 'react';
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
import { useOnboarding } from './hooks/useOnboarding';
import Profile from './pages/Profile';

const AppContent: React.FC = () => {
  const { loading, loadAllData, isGlobalTourActive, setGlobalTourActive } = usePetStore();
  const [showSplash, setShowSplash] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isGlobalTourSeen, isLoading: onboardingLoading } = useOnboarding();

  // Swipe navigation state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const routes = ['/dashboard', '/care', '/calendar', '/diary', '/settings'];

  const handleDevReset = async () => {
    if (confirm('모든 데이터(LocalStorage, IndexedDB)를 초기화하시겠습니까?')) {
      localStorage.clear();
      const { db } = await import('./db');
      await db.delete();
      window.location.reload();
    }
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

  // Start Global Tour (Wait for splash screen to finish)
  useEffect(() => {
    if (!loading && !onboardingLoading && isGlobalTourSeen === false && !showSplash) {
      // Add a tiny delay so the fade-out completes smoothly before the tour pops up
      const tourTimer = setTimeout(() => {
        setGlobalTourActive(true);
      }, 100);
      return () => clearTimeout(tourTimer);
    }
  }, [loading, onboardingLoading, isGlobalTourSeen, setGlobalTourActive, showSplash]);

  // Splash screen transition
  useEffect(() => {
    const timer1 = setTimeout(() => setSplashFade(true), 1200);
    const timer2 = setTimeout(() => setShowSplash(false), 1700);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const isObPage = location.pathname === '/onboarding';

  const handlePremiumClick = () => {
    alert("현재 프리미엄 멤버십 오픈 준비 중입니다.");
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = routes.indexOf(location.pathname);
      if (currentIndex !== -1) {
        if (isLeftSwipe && currentIndex < routes.length - 1) {
          navigate(routes[currentIndex + 1]);
        }
        if (isRightSwipe && currentIndex > 0) {
          navigate(routes[currentIndex - 1]);
        }
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <>
      <button 
        onClick={handleDevReset}
        style={{
          position: 'fixed',
          bottom: '16px',
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
            transition: 'opacity 0.5s ease',
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

      {isGlobalTourActive && <GlobalTour />}

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
              <button className="premium-btn" onClick={handlePremiumClick} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>PREMIUM</button>
            </div>
            
            <nav className="header-tab-bar" style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 20px', scrollbarWidth: 'none' }}>
              <NavLink to="/dashboard" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>대시보드</NavLink>
              <NavLink to="/care" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>케어</NavLink>
              <NavLink to="/calendar" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>캘린더</NavLink>
              <NavLink to="/diary" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>기록일기</NavLink>
              <NavLink to="/settings" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>설정</NavLink>
            </nav>
          </header>
        )}

        {/* 2. Center Content Area (Router View) */}
        <main 
          className="content-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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

        {/* 3. Global Bottom Footer */}
        {!isObPage && (
          <footer className="web-footer">
            <p>
              프로필 수정 및 관리 | 고객센터 및 1:1 문의 채널 | 공지사항 및 업데이트 정보 | 자주 묻는 질문(FAQ) | 서비스 이용약관 | <b>개인정보처리방침</b><br/>
              © OnDa Pet Care App. All Rights Reserved. Designed for Desktop & Mobile Environments.
            </p>
          </footer>
        )}
      </div>
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
