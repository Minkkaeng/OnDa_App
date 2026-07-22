import React, { useState, useEffect } from 'react';
import { usePetStore } from '../store/petStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PoopAnalyzer from '../components/care/PoopAnalyzer';
import { fetchHospitalsOrPharmacies, type HospitalOrPharmacy } from '../services/hospitalService';

const REGION_MAP: Record<string, string[]> = {
  '서울특별시': ['강남구', '송파구', '서초구', '마포구', '종로구', '성동구', '영등포구'],
  '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안양시', '의정부시'],
  '인천광역시': ['연수구', '남동구', '부평구', '서구', '미추홀구'],
  '부산광역시': ['해운대구', '부산진구', '수영구', '동래구', '사하구'],
  '대구광역시': ['수성구', '중구', '북구', '달서구', '동구']
};

const Care: React.FC = () => {
  const { pets, activePetId, showAlert, updatePet, addCalendarEvent } = usePetStore();
  const activePet = pets.find(p => p.id === activePetId);

  // Weight History
  const [newWeight, setNewWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]);

  // Vaccines
  const [vaccines, setVaccines] = useState<{
    dhppi?: string;
    corona?: string;
    rabies?: string;
    parasite?: string;
  }>({});

  // Poop Analyzer
  const [showPoopAnalyzer, setShowPoopAnalyzer] = useState(false);

  // Hospital/Pharmacy Locator State
  const [selectedCity, setSelectedCity] = useState('서울특별시');
  const [selectedDistrict, setSelectedDistrict] = useState('강남구');
  const [locatorSearchType, setLocatorSearchType] = useState<'hospital' | 'pharmacy' | 'grooming'>('hospital');
  const [locatorResults, setLocatorResults] = useState<HospitalOrPharmacy[]>([]);
  const [isLocatorLoading, setIsLocatorLoading] = useState(false);
  const [locatorError, setLocatorError] = useState(false);

  // AI Care Guide State
  const [aiTip, setAiTip] = useState<{ title: string; content: string } | null>(null);
  const [isAiTipLoading, setIsAiTipLoading] = useState(false);

  useEffect(() => {
    if (activePetId) {
      // Load weight
      const savedWeight = localStorage.getItem(`onda_weight_history_${activePetId}`);
      if (savedWeight) {
        try {
          setWeightHistory(JSON.parse(savedWeight));
        } catch {
          setWeightHistory([]);
        }
      } else {
        setWeightHistory([]);
      }

      // Load vaccines
      const savedVac = localStorage.getItem(`onda_vaccines_${activePetId}`);
      if (savedVac) {
        try {
          setVaccines(JSON.parse(savedVac));
        } catch {
          setVaccines({});
        }
      } else {
        setVaccines({});
      }
    }
  }, [activePetId]);

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

    // Prevent duplicate date, just update if same day
    const updatedHistory = weightHistory.filter(w => w.date !== dateStr);
    updatedHistory.unshift(newEntry);
    const finalHistory = updatedHistory.slice(0, 30); // Keep last 30

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
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    handleUpdateVaccine(key, todayStr);
    
    await addCalendarEvent({
      petId: activePet.id,
      date: todayStr,
      type: 'hospital',
      title: `💉 [접종완료] ${label}`,
      content: `케어 탭에서 ${label} 접종 완료가 기록되었습니다.`
    });
    
    showAlert(`'${label}' 오늘 접종 완료가 기록되었으며 캘린더에 연동 완료되었습니다!`);
  };

  const getDDay = (lastDateStr?: string, type: 'annual' | 'monthly' = 'annual') => {
    if (!lastDateStr) return '기록 없음';
    const lastDate = new Date(lastDateStr);
    const nextDate = new Date(lastDate);
    if (type === 'annual') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `D+${Math.abs(diffDays)} (지남)`;
    if (diffDays === 0) return `D-Day`;
    return `D-${diffDays}`;
  };

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
        title: '자견 맞춤 면역 & 사회성 케어',
        content: `현재 ${ageMonths}개월령인 어린 시기입니다. 5차 접종 전까지는 외부 외출 시 위생에 주의하고, 긍정적인 사회성 기르기를 위해 낯선 소리와 실내 환경 체험을 자주 접하게 해주세요.`
      });
    }

    if (ageMonths >= 84) {
      const years = Math.floor(ageMonths / 12);
      tips.push({
        id: 'tip-senior',
        title: '노령견 슬개골 및 영양 관리',
        content: `올해 ${years}살로 노령기에 진입했습니다. 발바닥 털이 길면 관절에 무리가 가므로 정기 미용을 하고, 슬개골 보호를 위해 거실 매트와 안전 계단을 설치해 주세요.`
      });
    }

    if (wt > 15) {
      tips.push({
        id: 'tip-weight-heavy',
        title: '관절 무리 방지 분산 산책 추천',
        content: `${wt}kg의 든든한 체격이므로, 한 번에 길게 걷기보다는 15~20분씩 하루 2번 나누어 걷는 것이 심폐와 슬개골 건강에 더욱 이상적입니다.`
      });
    } else if (wt > 0 && wt < 3) {
      tips.push({
        id: 'tip-weight-light',
        title: '소형견 저혈당 및 연골 관리',
        content: `${wt}kg의 아담한 소형견은 공복 시간이 너무 길어지면 저혈당이 올 수 있으니 급여 시간을 잘 지켜주시고 슬개골 연골 관리를 위한 영양제 보충을 추천합니다.`
      });
    }

    if (tips.length === 0) {
      tips.push({
        id: 'tip-default',
        title: '온다 맞춤 데일리 건강 관리',
        content: `${activePet.name}의 활력을 위해 매일 투약 복용과 선호 시간대에 맞춰 산책하는 습관을 들여보세요. 꾸준한 루틴이 아이의 면역 체계를 강하게 유지해 줍니다.`
      });
    }

    return tips;
  };

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
        if (active) {
          setLocatorResults(results);
        }
      } catch (error) {
        if (active) {
          setLocatorError(true);
          setLocatorResults([]);
        }
      } finally {
        if (active) {
          setIsLocatorLoading(false);
        }
      }
    };
    runSearch();
    return () => {
      active = false;
    };
  }, [selectedCity, selectedDistrict, locatorSearchType, showAlert]);

  useEffect(() => {
    let active = true;
    const loadAiTip = async () => {
      if (!activePet) return;
      setIsAiTipLoading(true);
      try {
        const { fetchAIPersonalizedTip } = await import('../services/aiService');
        const tipText = await fetchAIPersonalizedTip({
          name: activePet.name,
          breed: activePet.breed,
          birth: activePet.birth,
          weight: activePet.weight,
          allergies: activePet.allergies,
          medications: activePet.medications,
          notes: activePet.notes
        });
        if (active) {
          setAiTip({
            title: `${activePet.name} 맞춤 AI 데일리 케어 가이드`,
            content: tipText
          });
        }
      } catch (error) {
        console.error('Error fetching AI tip:', error);
      } finally {
        if (active) {
          setIsAiTipLoading(false);
        }
      }
    };
    loadAiTip();
    return () => {
      active = false;
    };
  }, [activePet]);

  if (!activePet) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-gray)' }}>
        반려동물을 먼저 등록해주세요.
      </div>
    );
  }

  return (
    <>
      <div style={{ paddingBottom: '0' }}>
        <div className="care-layout" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 0 }}>
        
          {/* 1. 맞춤형 건강 케어 가이드 (From Dashboard) */}
          <div className="panel" style={{ background: 'var(--white)', borderRadius: '16px', padding: '16px', width: '100%', boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)', marginBottom: '0' }}>
            <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              맞춤형 건강 케어 가이드
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isAiTipLoading ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-gray)', padding: '8px 0', textAlign: 'center', fontWeight: 600 }}>
                  실시간 AI 맞춤 가이드를 작성 중입니다...
                </div>
              ) : aiTip ? (
                <div style={{ background: 'var(--mint-green-light)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid var(--mint-green)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{aiTip.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>{aiTip.content}</p>
                </div>
              ) : (
                getPersonalizedTips().map((tip, idx) => (
                  <div key={idx} style={{ background: 'var(--mint-green-light)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid var(--mint-green)' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{tip.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>{tip.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. AD Zone */}
          <div className="ad-zone-top" style={{ marginBottom: '0' }}>
            <div style={{ flexGrow: 1 }}>
              <span className="ad-badge">AD ZONE</span>
              <div style={{ marginTop: '8px' }}>
                <p className="ad-text" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--deep-navy)' }}>내 손안의 반려동물 주치의, 프리미엄 온다 케어 멤버십 오픈!</p>
                <p className="ad-subtext" style={{ color: '#555', fontSize: '0.85rem' }}>실시간 전문가 비대면 상담 및 맞춤형 케어 솔루션 정식 런칭</p>
              </div>
            </div>
          </div>

          {/* 3. AI 배변 분석기 (Banner/Button) */}
          <button
            onClick={() => setShowPoopAnalyzer(true)}
            style={{
              background: 'linear-gradient(135deg, #14C3A3, #0E9B82)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(20, 195, 163, 0.3)'
            }}
          >
            AI 배변 사진 분석하기
          </button>

          {/* 4. 체중 기록 및 히스토리 */}
          <div className="panel" style={{ background: 'var(--white)', borderRadius: '16px', padding: '20px', width: '100%', boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)', marginBottom: '0' }}>
            <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              체중 변화 기록
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '12px 16px', background: 'var(--ice-white)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--deep-navy)', fontWeight: 700 }}>현재 체중</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--mint-green)', fontWeight: 800 }}>{activePet.weight ? `${activePet.weight} kg` : '기록 없음'}</span>
            </div>

            <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="number" step="0.01" value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
                placeholder="예) 5.4" className="form-input" style={{ flex: 1, height: '40px', fontSize: '0.9rem', margin: 0 }}
              />
              <button type="submit" className="btn-submit" style={{ width: 'auto', minWidth: '80px', marginTop: 0, padding: '10px 16px', fontSize: '0.85rem' }}>
                기록하기
              </button>
            </form>

            {weightHistory.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--deep-navy)', fontWeight: 800, display: 'block', marginBottom: '12px' }}>체중 변화 차트</label>
                <div style={{ height: '140px', width: '100%', background: 'var(--ice-white)', borderRadius: '12px', padding: '12px 12px 0 0' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...weightHistory].reverse()} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-gray)' }} axisLine={false} tickLine={false} minTickGap={10} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--muted-gray)' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ fontSize: '0.75rem', color: 'var(--muted-gray)', marginBottom: '4px' }} itemStyle={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--mint-green)' }} />
                      <Line type="monotone" dataKey="weight" stroke="var(--mint-green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--mint-green)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* 5. 정기 예방의학 D-Day 스케줄 */}
          <div className="panel" style={{ background: 'var(--white)', borderRadius: '16px', padding: '20px', width: '100%', boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)', marginBottom: '0' }}>
            <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
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
                const statusColor = isOverdue ? 'var(--blood-coral)' : 'var(--completed-green)';
                const statusBg = isOverdue ? 'var(--blood-coral-light)' : 'var(--completed-green-light)';
                
                return (
                  <div key={vac.id} style={{ borderBottom: '1px solid var(--ice-white)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep-navy)' }}>{vac.label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: statusColor, backgroundColor: statusBg, padding: '2px 8px', borderRadius: '12px' }}>
                        {ddayStatus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="date" value={lastDate || ''}
                        onChange={(e) => handleUpdateVaccine(vac.id as 'dhppi' | 'corona' | 'rabies' | 'parasite', e.target.value)}
                        className="form-input" style={{ height: '34px', fontSize: '0.8rem', padding: '0 8px', flex: 1, margin: 0 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleCompleteVaccineToday(vac.id as 'dhppi' | 'corona' | 'rabies' | 'parasite', vac.label)}
                        style={{
                          backgroundColor: 'var(--mint-green)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        오늘 접종 완료
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. 내 주변 동물병원 & 약국 찾기 */}
          <div className="panel" style={{ background: 'var(--white)', borderRadius: '16px', padding: '20px', width: '100%', boxShadow: '0 8px 24px rgba(18, 27, 42, 0.04)', marginBottom: '0' }}>
            <h2 style={{ color: 'var(--deep-navy)', fontSize: '1.2rem', fontWeight: 800, borderBottom: '2px solid var(--mint-green)', paddingBottom: '12px', marginBottom: '16px', marginTop: 0 }}>
              주변 동물병원 & 약국 검색
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)} 
                  className="form-input" 
                  style={{ flex: 1, height: '40px', fontSize: '0.85rem', margin: 0, padding: '0 8px' }}
                >
                  {Object.keys(REGION_MAP).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)} 
                  className="form-input" 
                  style={{ flex: 1, height: '40px', fontSize: '0.85rem', margin: 0, padding: '0 8px' }}
                >
                  {(REGION_MAP[selectedCity] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', background: 'var(--ice-white)', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => setLocatorSearchType('hospital')}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                    fontSize: '0.8rem', fontWeight: locatorSearchType === 'hospital' ? 800 : 600, cursor: 'pointer',
                    backgroundColor: locatorSearchType === 'hospital' ? 'var(--white)' : 'transparent',
                    color: locatorSearchType === 'hospital' ? 'var(--deep-navy)' : 'var(--muted-gray)',
                    boxShadow: locatorSearchType === 'hospital' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  동물병원 🏥
                </button>
                <button
                  type="button"
                  onClick={() => setLocatorSearchType('pharmacy')}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                    fontSize: '0.8rem', fontWeight: locatorSearchType === 'pharmacy' ? 800 : 600, cursor: 'pointer',
                    backgroundColor: locatorSearchType === 'pharmacy' ? 'var(--white)' : 'transparent',
                    color: locatorSearchType === 'pharmacy' ? 'var(--deep-navy)' : 'var(--muted-gray)',
                    boxShadow: locatorSearchType === 'pharmacy' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  동물약국 💊
                </button>
                <button
                  type="button"
                  onClick={() => setLocatorSearchType('grooming')}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                    fontSize: '0.8rem', fontWeight: locatorSearchType === 'grooming' ? 800 : 600, cursor: 'pointer',
                    backgroundColor: locatorSearchType === 'grooming' ? 'var(--white)' : 'transparent',
                    color: locatorSearchType === 'grooming' ? 'var(--deep-navy)' : 'var(--muted-gray)',
                    boxShadow: locatorSearchType === 'grooming' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  동물미용 ✂️
                </button>
              </div>
            </div>

            {isLocatorLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted-gray)', fontSize: '0.85rem', fontWeight: 600 }}>
                가까운 {locatorSearchType === 'hospital' ? '병원' : locatorSearchType === 'pharmacy' ? '약국' : '미용숍'} 정보를 조회 중입니다...
              </div>
            ) : locatorError ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--ice-white)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛠️</div>
                <h4 style={{ color: 'var(--deep-navy)', fontSize: '0.95rem', margin: '0 0 6px 0', fontWeight: 800 }}>공공데이터 서버 점검 중</h4>
                <p style={{ color: 'var(--muted-gray)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
                  현재 국가 공공데이터포털 서버 지연 또는 점검으로 인해<br/>데이터를 불러올 수 없습니다.<br/>잠시 후 다시 시도해 주세요.
                </p>
              </div>
            ) : locatorResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted-gray)', fontSize: '0.85rem' }}>
                검색 결과가 없습니다.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                {locatorResults.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '12px', 
                      background: 'var(--ice-white)', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--deep-navy)' }}>{item.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.3 }}>{item.address}</span>
                    </div>
                    {item.tel && item.tel !== '전화번호 없음' && (
                      <a 
                        href={`tel:${item.tel}`} 
                        style={{ 
                          backgroundColor: 'var(--white)',
                          border: '1.5px solid var(--steel-gray)',
                          color: 'var(--deep-navy)',
                          textDecoration: 'none',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📞 전화
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showPoopAnalyzer && (
        <PoopAnalyzer 
          onClose={() => setShowPoopAnalyzer(false)} 
          onSave={async (eventData) => {
            if (activePet) {
              await addCalendarEvent({
                petId: activePet.id,
                date: eventData.date!,
                type: eventData.type as any,
                title: eventData.title!,
                content: eventData.content || '',
                imageUrl: eventData.imageUrl,
                poopStatus: eventData.poopStatus as any,
                aiAnalysisText: eventData.aiAnalysisText
              });
              showAlert('배변 분석 결과가 캘린더 기록에 성공적으로 연동되었습니다! 💾');
            }
            setShowPoopAnalyzer(false);
          }} 
        />
      )}
    </>
  );
};

export default Care;
