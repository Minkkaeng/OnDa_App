import { db } from '../db';

export interface HospitalOrPharmacy {
  name: string;
  address: string;
  tel: string;
  type: 'hospital' | 'pharmacy' | 'grooming';
}

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Fetch animal hospitals, pharmacies, or grooming shops based on city & district with Dexie 30-day caching.
 */
export const fetchHospitalsOrPharmacies = async (
  city: string,
  district: string,
  type: 'hospital' | 'pharmacy' | 'grooming'
): Promise<HospitalOrPharmacy[]> => {
  const queryKey = `v2:${type}:${city}:${district}`;

  try {
    // 1. Check local Dexie cache first
    const cached = await db.hospital_cache.get(queryKey);
    const now = Date.now();

    if (cached && (now - cached.updatedAt) < CACHE_DURATION_MS) {
      console.log(`[Cache Hit] Returning cached results for ${queryKey}`);
      return cached.data as HospitalOrPharmacy[];
    }

    // 2. Fetch from Public Data Portal API
    const apiKey = import.meta.env.VITE_PUBLIC_DATA_PORTAL_KEY;
    if (!apiKey || apiKey === 'YOUR_PUBLIC_DATA_PORTAL_KEY') {
      console.warn(`[API Key Missing] Cannot fetch data`);
      // Return empty array instead of throwing error to prevent UI breaks
      return [];
    }

    const baseUrl = import.meta.env.DEV ? '/api/data' : 'https://apis.data.go.kr';
    
    let endpoint = '';
    if (type === 'hospital') {
      endpoint = `${baseUrl}/1741000/animal_hospitals`;
    } else if (type === 'pharmacy') {
      endpoint = `${baseUrl}/1741000/animal_pharmacies`;
    } else {
      endpoint = `${baseUrl}/1741000/pet_grooming`;
    }

    // We query a larger page size (150 items) to cover the selected region
    const url = `${endpoint}?serviceKey=${apiKey}&pageNo=1&numOfRows=150&type=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const text = await response.text();
    // Catch XML or non-JSON error responses from public data portal
    if (text.includes("Unexpected errors") || text.trim().startsWith("<")) {
      throw new Error("SERVER_ERROR");
    }

    const json = JSON.parse(text);
    let rootKey = '';
    if (type === 'hospital') {
      rootKey = 'animal_hospitals';
    } else if (type === 'pharmacy') {
      rootKey = 'animal_pharmacies';
    } else {
      rootKey = 'pet_grooming';
    }

    const items = json?.[rootKey]?.row || json?.response?.body?.items?.item;
    
    let list: HospitalOrPharmacy[] = [];

    if (items) {
      const rawList = Array.isArray(items) ? items : [items];
      
      // Filter for active clinics/pharmacies/salons within the specified district (구/군)
      list = rawList
        .filter((item: any) => {
          const isNormal = item.trdstategbn === '01' || 
                           item.sitgstdscnm === '영업/정상' || 
                           item.state === '정상' ||
                           !item.trdstategbn;
          const address = item.rdnwhladdr || item.rdnaddr || item.sitelnaddr || item.roadAddr || item.jibunAddr || '';
          const matchesRegion = address.includes(district);
          return isNormal && matchesRegion;
        })
        .map((item: any) => ({
          name: item.bplcnm || item.yadmNm || item.hospNm || '알 수 없는 시설',
          address: item.rdnwhladdr || item.rdnaddr || item.sitelnaddr || item.roadAddr || item.jibunAddr || '주소 정보 없음',
          tel: item.tel || item.phone || '전화번호 없음',
          type
        }));
    }

    // 3. Store in Dexie Cache
    await db.hospital_cache.put({
      queryKey,
      data: list,
      updatedAt: now
    });

    console.log(`[API Fetch & Cached] Successfully cached ${list.length} results for ${queryKey}`);
    return list;
  } catch (error) {
    console.error(`[Fetch Failed] Error fetching ${queryKey}:`, error);
    
    // Attempt to return stale cache if available in case of network issues
    const cached = await db.hospital_cache.get(queryKey);
    if (cached) {
      console.log(`[Cache Fallback] Returning stale cache for ${queryKey}`);
      return cached.data as HospitalOrPharmacy[];
    }

    // Propagate the error so UI can show a proper server error message
    throw error;
  }
};
