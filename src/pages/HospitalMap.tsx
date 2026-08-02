import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, ExternalLink, Navigation, Stethoscope, AlertTriangle, Pill, Scissors } from 'lucide-react';
import PostcodeModal from '../components/common/PostcodeModal';

interface PlaceItem {
  id: string;
  place_name: string;
  category_name?: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  distance?: string;
  isOpen24h?: boolean;
}

const DEFAULT_MOCK_HOSPITALS: PlaceItem[] = [
  {
    id: 'h1',
    place_name: '온다 24시 동물의료센터',
    category_name: '의료 > 병원 > 동물병원',
    road_address_name: '서울 강남구 테헤란로 123',
    phone: '02-555-0119',
    place_url: 'https://map.kakao.com',
    distance: '0.4km',
    isOpen24h: true
  },
  {
    id: 'h2',
    place_name: '바른 반려동물병원',
    category_name: '의료 > 병원 > 동물병원',
    road_address_name: '서울 강남구 역삼로 45',
    phone: '02-556-7890',
    place_url: 'https://map.kakao.com',
    distance: '0.8km',
    isOpen24h: false
  },
  {
    id: 'p1',
    place_name: '건강가득 동물약국',
    category_name: '의료 > 약국 > 동물약국',
    road_address_name: '서울 강남구 강남대로 310 1층',
    phone: '02-532-1234',
    place_url: 'https://map.kakao.com',
    distance: '0.6km',
    isOpen24h: false
  },
  {
    id: 's1',
    place_name: '몽몽 애견미용 & 케어샵',
    category_name: '서비스 > 반려동물 > 애견미용',
    road_address_name: '서울 강남구 봉은사로 18',
    phone: '02-544-3322',
    place_url: 'https://map.kakao.com',
    distance: '1.2km',
    isOpen24h: false
  }
];

export const HospitalMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | '24h' | 'pharmacy' | 'grooming'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [locationName, setLocationName] = useState('현재 위치 (강남구 테헤란로)');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius] = useState<number>(3000); // 3km
  const [places, setPlaces] = useState<PlaceItem[]>(DEFAULT_MOCK_HOSPITALS);
  const [loading, setLoading] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  // Fetch current GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName('현재 내 위치 기준');
        },
        () => {
          // GPS fallback
          console.warn('Geolocation unavailable, using default fallback');
        }
      );
    }
  }, []);

  const handleSearch = async (overrideKeyword?: string) => {
    const kw = overrideKeyword !== undefined ? overrideKeyword : searchKeyword;
    setLoading(true);
    try {
      // Attempt Kakao REST API fetch if key configured, otherwise use smart filtering mock
      const categoryTerm = 
        activeTab === '24h' ? '24시동물병원' :
        activeTab === 'pharmacy' ? '동물약국' :
        activeTab === 'grooming' ? '애견미용' : '동물병원';

      const finalQuery = kw.trim() ? `${kw} ${categoryTerm}` : `${locationName} ${categoryTerm}`;
      
      // Kakao API Call standard wrapper
      const KAKAO_KEY = (import.meta as any).env?.VITE_KAKAO_REST_KEY;
      if (KAKAO_KEY) {
        const params = new URLSearchParams({
          query: finalQuery,
          radius: radius.toString(),
          sort: 'distance'
        });
        if (userCoords) {
          params.append('x', userCoords.lng.toString());
          params.append('y', userCoords.lat.toString());
        }
        const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`, {
          headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: PlaceItem[] = data.documents.map((d: any) => ({
            id: d.id,
            place_name: d.place_name,
            category_name: d.category_name,
            road_address_name: d.road_address_name || d.address_name,
            phone: d.phone || '전화번호 정보 없음',
            place_url: d.place_url,
            distance: d.distance ? `${(parseInt(d.distance) / 1000).toFixed(1)}km` : undefined,
            isOpen24h: d.place_name.includes('24') || d.place_name.includes('응급')
          }));
          setPlaces(mapped);
          setLoading(false);
          return;
        }
      }

      // Filter local fallback list
      let filtered = [...DEFAULT_MOCK_HOSPITALS];
      if (activeTab === '24h') {
        filtered = filtered.filter(p => p.isOpen24h);
      } else if (activeTab === 'pharmacy') {
        filtered = filtered.filter(p => p.category_name?.includes('약국'));
      } else if (activeTab === 'grooming') {
        filtered = filtered.filter(p => p.category_name?.includes('미용'));
      }

      if (kw.trim()) {
        filtered = filtered.filter(p => p.place_name.includes(kw) || p.road_address_name.includes(kw));
      }
      setPlaces(filtered);
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [activeTab, radius]);

  const handlePostcodeComplete = (address: string) => {
    setLocationName(address);
    handleSearch(address);
  };

  return (
    <div className="onda-page-container">
      {/* Top Header Card */}
      <div className="onda-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 className="onda-section-title">
              <Stethoscope size={24} style={{ color: 'var(--main-primary)' }} />
              주변 동물병원 & 약국
            </h2>
            <p className="onda-sub-title">내 위치 3km 이내의 믿을 수 있는 펫 케어 시설</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPostcodeOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: '#F0EEE9',
              border: '1px solid var(--onda-border)',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <MapPin size={14} style={{ color: 'var(--main-primary)' }} />
            <span>위치 변경</span>
          </button>
        </div>

        {/* Current Location Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: '#FCFAF7',
          borderRadius: '12px',
          border: '1px solid var(--onda-border-light)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '14px'
        }}>
          <Navigation size={14} style={{ color: 'var(--main-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{locationName}</span>
        </div>

        {/* Search Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="onda-input"
              placeholder="병원명, 지역명, 동물약국 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--main-primary)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(92, 113, 94, 0.25)',
              flexShrink: 0
            }}
          >
            <Search size={18} />
          </button>
        </form>

        {/* Sub-tab Chips */}
        <div className="horizontal-scroll-chips">
          <button
            type="button"
            className={`onda-chip-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Stethoscope size={14} />
            <span>전체</span>
          </button>
          <button
            type="button"
            className={`onda-chip-tab ${activeTab === '24h' ? 'active' : ''}`}
            onClick={() => setActiveTab('24h')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <AlertTriangle size={14} />
            <span>24시 응급실</span>
          </button>
          <button
            type="button"
            className={`onda-chip-tab ${activeTab === 'pharmacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('pharmacy')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Pill size={14} />
            <span>동물약국</span>
          </button>
          <button
            type="button"
            className={`onda-chip-tab ${activeTab === 'grooming' ? 'active' : ''}`}
            onClick={() => setActiveTab('grooming')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Scissors size={14} />
            <span>미용/호텔</span>
          </button>
        </div>
      </div>

      {/* Hospital List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div className="onda-card" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>주변 장소를 찾는 중입니다...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="onda-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <MapPin size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
            <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>검색 결과가 없습니다</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>다른 지역명이나 키워드로 검색해보세요.</p>
          </div>
        ) : (
          places.map((place) => (
            <div key={place.id} className="onda-card onda-card-interactive">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {place.place_name}
                  </h3>
                  {place.isOpen24h && (
                    <span style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.25)'
                    }}>
                      24시
                    </span>
                  )}
                </div>
                {place.distance && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--main-primary)', backgroundColor: 'var(--main-primary-light)', padding: '2px 8px', borderRadius: '10px' }}>
                    {place.distance}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                {place.road_address_name}
              </p>

              {/* Quick Actions Bar */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--onda-border-light)' }}>
                {place.phone && place.phone !== '전화번호 정보 없음' && (
                  <a
                    href={`tel:${place.phone}`}
                    style={{
                      flex: 1,
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#F0EEE9',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Phone size={14} style={{ color: 'var(--main-primary)' }} />
                    <span>{place.phone}</span>
                  </a>
                )}
                <a
                  href={place.place_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--main-primary)',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(92, 113, 94, 0.2)'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>카카오 지도 보기</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <PostcodeModal
        isOpen={isPostcodeOpen}
        onClose={() => setIsPostcodeOpen(false)}
        onComplete={handlePostcodeComplete}
      />
    </div>
  );
};

export default HospitalMap;
