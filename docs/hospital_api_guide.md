# OnDa App API 연동 가이드 (Kakao Local & Daum 우편번호)

이 문서는 OnDa 앱 내에서 **주변 동물병원/동물약국/미용실 찾기** 기능 고도화와 **반려동물 주소 설정(다음 우편번호)** 기능을 추가할 때 참고할 수 있는 외부 API 연동 명세서 및 가이드라인입니다.

---

## 1. 카카오맵 장소 검색 API (Kakao Local API)

카카오의 로컬 API를 활용하면 REST API를 통해 특정 위치 근처의 동물병원, 동물약국, 동물미용샵 정보를 실시간으로 검색하여 제공할 수 있습니다.

### A. API 개요 및 요청 정보
* **요청 URL**: `https://dapi.kakao.com/v2/local/search/keyword.json`
* **요청 메서드**: `GET`
* **인증 헤더**: `Authorization: KakaoAK {YOUR_REST_API_KEY}`
* **주요 쿼리 파라미터**:
  | 파라미터 | 타입 | 설명 | 필수 여부 |
  | :--- | :--- | :--- | :--- |
  | `query` | String | 검색 키워드 (예: `강남구 동물병원`, `성동구 동물약국`) | **필수** |
  | `x` | String | 중심점 경도(Longitude, WGS84) | 선택 |
  | `y` | String | 중심점 위도(Latitude, WGS84) | 선택 |
  | `radius` | Integer | 중심점 반경 내 검색 범위 (단위: m, 최대 20000) | 선택 |
  | `sort` | String | 정렬 순서 (`accuracy`: 정확도순, `distance`: 거리순) <br>*거리순 정렬 시 x, y 필수* | 선택 |

### B. React 연동 구현 예제

```typescript
import axios from 'axios';

interface PlaceItem {
  place_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  distance?: string;
}

export const fetchNearbyHospitals = async (
  keyword: string,
  latitude?: number,
  longitude?: number
): Promise<PlaceItem[]> => {
  const REST_API_KEY = 'YOUR_REST_API_KEY'; // 카카오 개발자 센터에서 발급 필요
  
  const params: any = {
    query: keyword,
  };

  // 사용자 위치 정보가 있으면 거리순(distance) 정렬 반영
  if (latitude && longitude) {
    params.x = longitude.toString();
    params.y = latitude.toString();
    params.radius = 5000; // 5km 반경 내
    params.sort = 'distance';
  }

  try {
    const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
      headers: {
        Authorization: `KakaoAK ${REST_API_KEY}`
      },
      params
    });

    return response.data.documents.map((doc: any) => ({
      place_name: doc.place_name,
      road_address_name: doc.road_address_name || doc.address_name,
      phone: doc.phone || '전화번호 없음',
      place_url: doc.place_url,
      distance: doc.distance ? `${(parseInt(doc.distance) / 1000).toFixed(1)}km` : undefined
    }));
  } catch (error) {
    console.error('Kakao Local API Fetch Error:', error);
    throw error;
  }
};
```

---

## 2. Daum 우편번호 서비스 (주소 검색)

별도의 인증키 발급 없이 간단하게 팝업 또는 iframe 형태로 주소를 검색하고 우편번호와 도로명 주소 데이터를 전달받을 수 있습니다.

### A. API 로딩 및 스크립트 등록
HTML index.html 헤더 혹은 React 컴포넌트 마운트 시 다음 스크립트를 로드해야 합니다.
```html
<script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
```

### B. React 모달/iframe 방식 구현 예제

모바일 뷰포트 크기와 visualViewport 상태에 매끄럽게 대응하기 위해 iframe 요소를 레이어 모달로 띄워 주소를 검색하는 컴포넌트 예시입니다.

```tsx
import React, { useEffect, useRef } from 'react';

interface PostcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (address: string, zonecode: string) => void;
}

export const PostcodeModal: React.FC<PostcodeModalProps> = ({ isOpen, onClose, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Daum 우편번호 객체 실행
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        // 주소 검색 완료 시 부모로 주소값 전달
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddress += data.bname;
          if (data.buildingName !== '') {
            extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
          }
          fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        onComplete(fullAddress, data.zonecode);
        onClose();
      },
      width: '100%',
      height: '100%',
      maxSuggestItems: 5
    }).embed(containerRef.current);

  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '480px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* 모달 닫기 헤더 */}
        <div style={{
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid #EFEFEF'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>주소 검색</span>
          <button 
            onClick={onClose} 
            style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* Daum 우편번호 iframe이 삽입될 영역 */}
        <div ref={containerRef} style={{ flex: 1, width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};
```

---

## 3. visualViewport 대응 가이드라인

안드로이드 또는 iOS 모바일 디바이스에서 주소 인풋창에 포커스를 주거나 주소 검색 모달이 켜지며 가상 키보드가 활성화될 때 레이아웃이 찌그러지는 현상이 발생할 수 있습니다.
* 모달의 높이를 `height: 100%` 보다는 고정 픽셀(예: `height: 480px` 또는 `max-height: 80vh`)로 설정하여 뷰포트 축소 시 스크롤바가 자연스럽게 생기도록 유도해야 합니다.
* OnDa의 뷰포트 감지 믹스인 스타일을 활용해 모달 상단 여백을 visualViewport 높이에 맞춰 동적으로 조절할 것을 권장합니다.
