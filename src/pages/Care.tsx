import React, { useState, useEffect } from 'react';
import { usePetStore } from '../store/petStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchHospitalsOrPharmacies, type HospitalOrPharmacy } from '../services/hospitalService';
import { Utensils, Droplet, Cookie, Activity, CheckCircle2, ChevronDown } from 'lucide-react';
import BottomSheet from '../components/common/BottomSheet';

const REGION_MAP: Record<string, string[]> = {
  '서울특별시': ['강남구', '송파구', '서초구', '마포구', '종로구', '성동구', '영등포구'],
  '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안양시', '의정부시'],
  '인천광역시': ['연수구', '남동구', '부평구', '서구', '미추홀구'],
  '부산광역시': ['해운대구', '부산진구', '수영구', '동래구', '사하구'],
  '대구광역시': ['수성구', '중구', '북구', '달서구', '동구']
};

const Care: React.FC = () => {
  const { pets, activePetId, showAlert, updatePet, addCalendarEvent, events } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily' | 'health' | 'hospital'>('dashboard');

  // Dashboard Checklist
  const [careTips, setCareTips] = useState<{ id: string; title: string; content: string }[]>([]);
  const [isTipsLoading, setIsTipsLoading] = useState(false);

  // Daily Routine States
  const [activeCategory, setActiveCategory] = useState<'stool' | 'meal' | 'water' | 'snack' | null>(null);
  const [meals, setMeals] = useState<{time: string, amount: string}[]>([]);
  const [waters, setWaters] = useState<{time: string, amount: number}[]>([]);
  const [snacks, setSnacks] = useState<{time: string, name: string}[]>([]);
  const [stools, setStools] = useState<{time: string, status: string}[]>([]);

  // Health Check States
  const [newWeight, setNewWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]);
  const [vaccines, setVaccines] = useState<{ dhppi?: string; corona?: string; rabies?: string; parasite?: string; }>({});
  
  // Hospital/Pharmacy States
  const [selectedCity, setSelectedCity] = useState('서울특별시');
  const [selectedDistrict, setSelectedDistrict] = useState('강남구');
  const [locatorSearchType, setLocatorSearchType] = useState<'hospital' | 'pharmacy' | 'grooming'>('hospital');
  const [locatorResults, setLocatorResults] = useState<HospitalOrPharmacy[]>([]);
  const [isLocatorLoading, setIsLocatorLoading] = useState(false);
  const [locatorError, setLocatorError] = useState(false);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getTodayStr();

  // Load Data
  useEffect(() => {
    if (activePetId) {
      // Daily Routine
      const loadArr = (key: string) => {
        const saved = localStorage.getItem(`onda_${key}_${activePetId}_${todayStr}`);
        return saved ? JSON.parse(saved) : [];
      };
      setMeals(loadArr('meals'));
      setWaters(loadArr('waters'));
      setSnacks(loadArr('snacks'));
      setStools(loadArr('stools'));

      // Health
      const savedWeight = localStorage.getItem(`onda_weight_history_${activePetId}`);
      if (savedWeight) {
        try { setWeightHistory(JSON.parse(savedWeight)); } catch { setWeightHistory([]); }
      } else setWeightHistory([]);

      const savedVac = localStorage.getItem(`onda_vaccines_${activePetId}`);
      if (savedVac) {
        try { setVaccines(JSON.parse(savedVac)); } catch { setVaccines({}); }
      } else setVaccines({});
    }
  }, [activePetId, todayStr]);

  // Care Tips
  useEffect(() => {
    let active = true;
    const loadTips = async () => {
      if (!activePet) return;
      setIsTipsLoading(true);
      try {
        const { generateDailyGuides } = await import('../services/careGuideService');
        const generatedTips = generateDailyGuides(activePet, events);
        if (active) setCareTips(generatedTips);
      } catch (error) {
        console.error('Error generating tips:', error);
      } finally {
        if (active) setIsTipsLoading(false);
      }
    };
    loadTips();
    return () => { active = false; };
  }, [activePet, events]);

  // Hospital Locator
  useEffect(() => {
    const districts = REGION_MAP[selectedCity] || [];
    if (districts.length > 0 && !districts.includes(selectedDistrict)) {
      setSelectedDistrict(districts[0]);
    }
  }, [selectedCity, selectedDistrict]);

  useEffect(() => {
    let active = true;
    const runSearch = async () => {
      if (!selectedCity || !selectedDistrict) return;
      setIsLocatorLoading(true);
      setLocatorError(false);
      try {
        const results = await fetchHospitalsOrPharmacies(selectedCity, selectedDistrict, locatorSearchType);
        if (active) setLocatorResults(results);
      } catch (error) {
        if (active) {
          setLocatorError(true);
          setLocatorResults([]);
        }
      } finally {
        if (active) setIsLocatorLoading(false);
      }
    };
    runSearch();
    return () => { active = false; };
  }, [selectedCity, selectedDistrict, locatorSearchType, showAlert]);

  // Actions
  const saveArr = (key: string, arr: any[]) => {
    if (!activePetId) return;
    localStorage.setItem(`onda_${key}_${activePetId}_${todayStr}`, JSON.stringify(arr));
  };
  const getCurrentTimeStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleAddMeal = (amount: string) => {
    const newRecord = { time: getCurrentTimeStr(), amount };
    const updated = [...meals, newRecord];
    setMeals(updated); saveArr('meals', updated);
  };
  const handleAddWater = (amount: number) => {
    const newRecord = { time: getCurrentTimeStr(), amount };
    const updated = [...waters, newRecord];
    setWaters(updated); saveArr('waters', updated);
  };
  const handleAddSnack = (name: string) => {
    const newRecord = { time: getCurrentTimeStr(), name };
    const updated = [...snacks, newRecord];
    setSnacks(updated); saveArr('snacks', updated);
  };
  const handleAddStool = (status: string) => {
    const newRecord = { time: getCurrentTimeStr(), status };
    const updated = [...stools, newRecord];
    setStools(updated); saveArr('stools', updated);
  };

  const handleSaveHealthCheck = async () => {
    if (!activePet) return;
    const totalWater = waters.reduce((acc, curr) => acc + curr.amount, 0);
    const mealTexts = meals.map(m => `[${m.time}] ${m.amount}`).join(', ');
    const stoolTexts = stools.map(s => `[${s.time}] ${s.status}`).join(', ');
    const snackTexts = snacks.map(s => `[${s.time}] ${s.name}`).join(', ');

    await addCalendarEvent({
      petId: activePet.id,
      date: todayStr,
      type: 'diary',
      category: '건강',
      title: '오늘의 종합 건강 리포트',
      content: `• 식사 기록: ${meals.length > 0 ? mealTexts : '기록 없음'}\n• 음수량: 총 ${totalWater}ml (${waters.length}회)\n• 간식 기록: ${snacks.length > 0 ? snackTexts : '기록 없음'}\n• 배변 기록: ${stools.length > 0 ? stoolTexts : '기록 없음'}`
    });
    showAlert('오늘의 건강 체크 기록이 일기장(기록) 탭에 성공적으로 저장되었습니다!');
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePet || !newWeight) return;
    const parsedWeight = parseFloat(newWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      showAlert('올바른 체중을 입력해주세요.');
      return;
    }
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
    const newEntry = { date: dateStr, weight: parsedWeight };
    const updatedHistory = weightHistory.filter(w => w.date !== dateStr);
    updatedHistory.unshift(newEntry);
    const finalHistory = updatedHistory.slice(0, 30);
    setWeightHistory(finalHistory);
    localStorage.setItem(`onda_weight_history_${activePet.id}`, JSON.stringify(finalHistory));
    await updatePet({ ...activePet, weight: parsedWeight });
    setNewWeight('');
    showAlert('체중이 기록되었습니다.');
  };

  const handleUpdateVaccine = (key: 'dhppi' | 'corona' | 'rabies' | 'parasite', val: string) => {
    if (!activePet) return;
    const updated = { ...vaccines, [key]: val };
    setVaccines(updated);
    localStorage.setItem(`onda_vaccines_${activePet.id}`, JSON.stringify(updated));
  };
  const handleCompleteVaccineToday = async (key: 'dhppi' | 'corona' | 'rabies' | 'parasite', label: string) => {
    if (!activePet) return;
    handleUpdateVaccine(key, todayStr);
    await addCalendarEvent({ petId: activePet.id, date: todayStr, type: 'hospital', title: `💉 [접종완료] ${label}`, content: `케어 탭에서 ${label} 접종 완료가 기록되었습니다.` });
    showAlert(`'${label}' 오늘 접종 완료가 기록되었으며 캘린더에 연동 완료되었습니다!`);
  };

  const getDDay = (lastDateStr?: string, type: 'annual' | 'monthly' = 'annual') => {
    if (!lastDateStr) return '기록 없음';
    const lastDate = new Date(lastDateStr);
    const nextDate = new Date(lastDate);
    if (type === 'annual') nextDate.setFullYear(nextDate.getFullYear() + 1);
    else nextDate.setMonth(nextDate.getMonth() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `D+${Math.abs(diffDays)} (지남)`;
    if (diffDays === 0) return `D-Day`;
    return `D-${diffDays}`;
  };

  if (!activePet) return <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>반려동물을 먼저 등록해주세요.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Navigation Tabs */}
      <div style={{ display: 'flex', padding: '12px 16px', gap: '8px', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', borderBottom: '1px solid var(--border-color)' }}>
        {[
          { id: 'dashboard', label: '대시보드' },
          { id: 'daily', label: '데일리루틴' },
          { id: 'health', label: '건강체크' },
          { id: 'hospital', label: '병원·약국' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 18px',
              borderRadius: '16px',
              backgroundColor: 'var(--card-bg)',
              color: activeTab === tab.id ? 'var(--main-primary)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: activeTab === tab.id ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)',
              boxShadow: activeTab === tab.id ? 'inset 0 2px 4px rgba(74, 59, 50, 0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            <div className="panel" style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', padding: '16px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--main-primary)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
                맞춤형 건강 케어 가이드
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isTipsLoading ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '8px 0', textAlign: 'center', fontWeight: 600 }}>가이드를 분석 중입니다...</div>
                ) : careTips.length > 0 ? (
                  careTips.map((tip, idx) => (
                    <details key={idx} style={{ background: 'var(--butter-cream)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid var(--main-primary)', cursor: 'pointer' }}>
                      <summary style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                        {tip.title} <span style={{fontSize:'0.8rem', opacity: 0.6}}>▼</span>
                      </summary>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>{tip.content}</p>
                    </details>
                  ))
                ) : (
                  <div style={{ background: 'var(--butter-cream)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid var(--main-primary)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.5, textAlign: 'center' }}>데이터를 기반으로 가이드를 준비중입니다.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="panel" style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', padding: '16px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--main-primary)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
                오늘의 체크리스트
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--screen-bg)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>식사/사료</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--main-primary)', fontWeight: 800 }}>{meals.length > 0 ? `${meals.length}회 완료` : '미완료'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--screen-bg)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>음수량</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--main-primary)', fontWeight: 800 }}>{waters.length > 0 ? `${waters.reduce((a,c)=>a+c.amount,0)}ml` : '미완료'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--screen-bg)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>간식</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--main-primary)', fontWeight: 800 }}>{snacks.length > 0 ? `${snacks.length}회 완료` : '미완료'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--screen-bg)', padding: '12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>배변</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--main-primary)', fontWeight: 800 }}>{stools.length > 0 ? `${stools.length}회 완료` : '미완료'}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* DAILY ROUTINE TAB */}
        {activeTab === 'daily' && (
          <div className="panel" style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', padding: '16px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--main-primary)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              데일리 루틴 기록
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div onClick={() => setActiveCategory('meal')} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', cursor: 'pointer', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ backgroundColor: 'var(--butter-cream)', padding: '6px 8px', borderRadius: '10px' }}><Utensils size={20} color="#B45309" strokeWidth={2.5} /></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>식사/사료</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>{meals.length > 0 ? `총 ${meals.length}회` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}</span>
              </div>
              <div onClick={() => setActiveCategory('water')} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', cursor: 'pointer', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ backgroundColor: 'var(--butter-cream)', padding: '6px 8px', borderRadius: '10px' }}><Droplet size={20} color="#0284C7" strokeWidth={2.5} /></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>음수량</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>{waters.length > 0 ? `총 ${waters.reduce((a,c)=>a+c.amount,0)}ml` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}</span>
              </div>
              <div onClick={() => setActiveCategory('snack')} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', cursor: 'pointer', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ backgroundColor: 'var(--butter-cream)', padding: '6px 8px', borderRadius: '10px' }}><Cookie size={20} color="#92400E" strokeWidth={2.5} /></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>간식</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>{snacks.length > 0 ? `총 ${snacks.length}회` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}</span>
              </div>
              <div onClick={() => setActiveCategory('stool')} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', cursor: 'pointer', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ backgroundColor: 'var(--butter-cream)', padding: '6px 8px', borderRadius: '10px' }}><Activity size={20} color="#9D174D" strokeWidth={2.5} /></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>배변 상태</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-primary)' }}>{stools.length > 0 ? `총 ${stools.length}회` : <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>미기록</span>}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSaveHealthCheck} style={{ backgroundColor: 'var(--main-primary)', color: 'white', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                기록 일기장에 저장
              </button>
            </div>
          </div>
        )}

        {/* HEALTH CHECK TAB */}
        {activeTab === 'health' && (
          <>
            <div className="panel" style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', padding: '20px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--main-primary)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
                체중 변화 기록
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '12px 16px', background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>현재 체중</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--main-primary)', fontWeight: 800 }}>{activePet.weight ? `${activePet.weight} kg` : '기록 없음'}</span>
              </div>
              <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input type="number" step="0.01" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="예) 5.4" className="form-input" style={{ flex: 1, height: '40px', fontSize: '0.9rem', margin: 0 }} />
                <button type="submit" className="btn-submit" style={{ width: 'auto', minWidth: '80px', marginTop: 0, padding: '10px 16px', fontSize: '0.85rem' }}>기록하기</button>
              </form>
              {weightHistory.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>체중 변화 차트</label>
                  <div style={{ height: '140px', width: '100%', background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: '12px 12px 0 0' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...weightHistory].reverse()} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} minTickGap={10} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }} itemStyle={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--main-primary)' }} />
                        <Line type="monotone" dataKey="weight" stroke="var(--main-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--main-primary)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            <div className="panel" style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', padding: '20px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--main-primary)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
                예방의학 D-Day 스케줄
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { id: 'dhppi', label: '종합백신 (DHPPi)', type: 'annual' },
                  { id: 'corona', label: '코로나 장염 백신', type: 'annual' },
                  { id: 'rabies', label: '광견병 예방 백신', type: 'annual' },
                  { id: 'parasite', label: '내/외부 기생충 케어', type: 'monthly' }
                ].map(vac => {
                  const lastDate = vaccines[vac.id as 'dhppi' | 'corona' | 'rabies' | 'parasite'];
                  const ddayStatus = getDDay(lastDate, vac.type as 'annual' | 'monthly');
                  const isOverdue = ddayStatus.includes('지남') || ddayStatus === 'D-Day' || !lastDate;
                  const statusColor = isOverdue ? 'var(--text-main)' : 'var(--main-primary)';
                  const statusBg = isOverdue ? 'var(--butter-yellow)' : 'var(--butter-cream)';
                  
                  const maxDays = vac.type === 'annual' ? 365 : 30;
                  let daysLeft = 0;
                  if (!isOverdue && lastDate) {
                    const match = ddayStatus.match(/\d+/);
                    if (match) daysLeft = parseInt(match[0], 10);
                  }
                  const progressPct = isOverdue ? 100 : Math.max(0, 100 - (daysLeft / maxDays) * 100);
                  const barColor = isOverdue ? 'var(--butter-yellow)' : 'var(--main-primary)';

                  return (
                    <div key={vac.id} style={{ borderBottom: '1px solid var(--screen-bg)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{vac.label}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: statusColor, backgroundColor: statusBg, padding: '2px 8px', borderRadius: '12px' }}>
                          {ddayStatus}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--screen-bg)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: barColor, transition: 'width 0.3s ease' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="date" value={lastDate || ''} onChange={(e) => handleUpdateVaccine(vac.id as 'dhppi' | 'corona' | 'rabies' | 'parasite', e.target.value)} className="form-input" style={{ height: '34px', fontSize: '0.8rem', padding: '0 8px', flex: 1, margin: 0 }} />
                        <button type="button" onClick={() => handleCompleteVaccineToday(vac.id as 'dhppi' | 'corona' | 'rabies' | 'parasite', vac.label)} style={{ backgroundColor: 'var(--main-primary)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          오늘 접종 완료
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* HOSPITAL LOCATOR TAB */}
        {activeTab === 'hospital' && (
          <div className="panel" style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', padding: '20px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--main-primary)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              주변 동물병원 & 약국 검색
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="form-input" style={{ flex: 1, height: '40px', fontSize: '0.85rem', margin: 0, padding: '0 8px' }}>
                  {Object.keys(REGION_MAP).map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="form-input" style={{ flex: 1, height: '40px', fontSize: '0.85rem', margin: 0, padding: '0 8px' }}>
                  {(REGION_MAP[selectedCity] || []).map(dist => <option key={dist} value={dist}>{dist}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', background: 'var(--screen-bg)', padding: '4px', borderRadius: '12px' }}>
                {['hospital', 'pharmacy', 'grooming'].map(type => (
                  <button key={type} type="button" onClick={() => setLocatorSearchType(type as any)} style={{ flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: locatorSearchType === type ? 800 : 600, cursor: 'pointer', backgroundColor: locatorSearchType === type ? 'var(--card-bg)' : 'transparent', color: locatorSearchType === type ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: locatorSearchType === type ? '0 2px 6px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                    {type === 'hospital' ? '동물병원' : type === 'pharmacy' ? '동물약국' : '동물미용'}
                  </button>
                ))}
              </div>
            </div>

            {isLocatorLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>조회 중입니다...</div>
            ) : locatorError ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: '0 0 6px 0', fontWeight: 800 }}>서버 점검 중</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 16px 0', lineHeight: 1.4 }}>데이터를 불러올 수 없습니다.</p>
                <button onClick={() => { setLocatorError(false); const prev = locatorSearchType; setLocatorSearchType('grooming'); setTimeout(() => setLocatorSearchType(prev), 10); }} style={{ backgroundColor: 'var(--main-primary)', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>다시 시도 🔄</button>
              </div>
            ) : locatorResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>검색 결과가 없습니다.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                {locatorResults.map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'var(--card-bg)', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.3 }}>{item.address}</span>
                    </div>
                    {item.tel && item.tel !== '전화번호 없음' && (
                      <a href={`tel:${item.tel}`} style={{ backgroundColor: 'var(--card-bg)', border: '1.5px solid var(--border-color)', color: 'var(--text-main)', textDecoration: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>📞 전화</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sheet for Daily Routine */}
      <BottomSheet 
        isOpen={activeCategory !== null} 
        onClose={() => setActiveCategory(null)}
        title={
          activeCategory === 'stool' ? '배변 상태 기록' :
          activeCategory === 'meal' ? '식사 및 사료 기록' :
          activeCategory === 'water' ? '음수량 체크 & 기록' :
          activeCategory === 'snack' ? '간식 복용 체크' : ''
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
          {activeCategory === 'stool' && (
            <>
              {stools.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>오늘의 배변 기록</h4>
                  {stools.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.time}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--main-primary)', fontWeight: 800 }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                {['정상', '무른변', '변비'].map(status => (
                  <button key={status} type="button" onClick={() => handleAddStool(status)} style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--butter-cream)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>+ {status}</button>
                ))}
              </div>
            </>
          )}

          {activeCategory === 'water' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0284C7' }}>{waters.reduce((a,c) => a + c.amount, 0)} ml</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#075985', backgroundColor: '#E0F2FE', padding: '4px 10px', borderRadius: '12px' }}>총 {waters.length}회 섭취</span>
              </div>
              {waters.length > 0 && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                  {waters.map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.time}</span>
                      <span style={{ fontSize: '0.85rem', color: '#0284C7', fontWeight: 800 }}>+{w.amount}ml</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
                {[50, 100, 150, 200].map(val => (
                  <button key={val} type="button" onClick={() => handleAddWater(val)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>+{val}ml</button>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'snack' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {snacks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>오늘 급여한 간식</h4>
                  {snacks.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.time}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--main-primary)', fontWeight: 800 }}>{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {['육포', '개껌', '동결건조', '츄르'].map(snack => (
                  <button key={snack} type="button" onClick={() => handleAddSnack(snack)} style={{ padding: '12px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--butter-cream)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>+ {snack}</button>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'meal' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {meals.length > 0 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>오늘의 식사 기록</h4>
                 {meals.map((m, idx) => (
                   <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                     <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.time}</span>
                     <span style={{ fontSize: '0.85rem', color: 'var(--main-primary)', fontWeight: 800 }}>{m.amount}</span>
                   </div>
                 ))}
               </div>
             )}
             <div style={{ display: 'flex', gap: '8px' }}>
               {['완식', '보통', '남김'].map(amount => (
                 <button key={amount} type="button" onClick={() => handleAddMeal(amount)} style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--butter-cream)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>+ {amount}</button>
               ))}
             </div>
           </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default Care;
