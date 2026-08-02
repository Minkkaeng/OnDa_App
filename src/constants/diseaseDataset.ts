// 반려동물(강아지/고양이) 자주 발생하는 주요 질병 50종 사전 데이터셋

export interface DiseaseItem {
  id: string;
  name: string;
  category: '관절/골격' | '피부/귀' | '소화기/내과' | '비뇨기/신장' | '안과/치과' | '심장/호흡기' | '감염성/기타';
  speciesTarget: 'dog' | 'cat' | 'both';
  description?: string;
}

export const COMMON_DISEASES: DiseaseItem[] = [
  // 관절 / 골격계
  { id: 'd1', name: '슬개골 탈구', category: '관절/골격', speciesTarget: 'both', description: '무릎 관절 연골 탈구' },
  { id: 'd2', name: '십자인대 파열', category: '관절/골격', speciesTarget: 'dog' },
  { id: 'd3', name: '고관절 이형성증', category: '관절/골격', speciesTarget: 'both' },
  { id: 'd4', name: '퇴행성 관절염', category: '관절/골격', speciesTarget: 'both' },
  { id: 'd5', name: '추간판 탈출증 (디스크)', category: '관절/골격', speciesTarget: 'dog' },

  // 피부 / 귀
  { id: 'd6', name: '아토피성 피부염', category: '피부/귀', speciesTarget: 'both' },
  { id: 'd7', name: '외이도염 (귀염증)', category: '피부/귀', speciesTarget: 'both' },
  { id: 'd8', name: '음식 알레르기 피부염', category: '피부/귀', speciesTarget: 'both' },
  { id: 'd9', name: '모낭염', category: '피부/귀', speciesTarget: 'dog' },
  { id: 'd10', name: '곰팡이성 피부염 (링웜)', category: '피부/귀', speciesTarget: 'both' },
  { id: 'd11', name: '지루성 피부염', category: '피부/귀', speciesTarget: 'both' },

  // 소화기 / 내과
  { id: 'd12', name: '급성/만성 췌장염', category: '소화기/내과', speciesTarget: 'both' },
  { id: 'd13', name: '급성 위장염', category: '소화기/내과', speciesTarget: 'both' },
  { id: 'd14', name: '위확장 위염전 (위비틀림)', category: '소화기/내과', speciesTarget: 'dog' },
  { id: 'd15', name: '염증성 장질환 (IBD)', category: '소화기/내과', speciesTarget: 'both' },
  { id: 'd16', name: '장폐색', category: '소화기/내과', speciesTarget: 'both' },
  { id: 'd17', name: '지방간 (간리피도시스)', category: '소화기/내과', speciesTarget: 'cat' },
  { id: 'd18', name: '당뇨병', category: '소화기/내과', speciesTarget: 'both' },
  { id: 'd19', name: '쿠싱 증후군 (부신피질기능항진증)', category: '소화기/내과', speciesTarget: 'dog' },
  { id: 'd20', name: '갑상선 기능 항진증', category: '소화기/내과', speciesTarget: 'cat' },
  { id: 'd21', name: '갑상선 기능 저하증', category: '소화기/내과', speciesTarget: 'dog' },

  // 비뇨기 / 신장
  { id: 'd22', name: '만성 신부전 (CKD)', category: '비뇨기/신장', speciesTarget: 'both' },
  { id: 'd23', name: '방광염', category: '비뇨기/신장', speciesTarget: 'both' },
  { id: 'd24', name: '방광 결석 / 요로 결석', category: '비뇨기/신장', speciesTarget: 'both' },
  { id: 'd25', name: '고양이 하부요로기 질환 (FLUTD)', category: '비뇨기/신장', speciesTarget: 'cat' },
  { id: 'd26', name: '자궁축농증', category: '비뇨기/신장', speciesTarget: 'both' },
  { id: 'd27', name: '전립선 비대증', category: '비뇨기/신장', speciesTarget: 'dog' },

  // 안과 / 치과
  { id: 'd28', name: '백내장', category: '안과/치과', speciesTarget: 'both' },
  { id: 'd29', name: '녹내장', category: '안과/치과', speciesTarget: 'both' },
  { id: 'd30', name: '건성각결막염 (안구건조증)', category: '안과/치과', speciesTarget: 'both' },
  { id: 'd31', name: '체리아이 (제3눈꺼풀 돌출)', category: '안과/치과', speciesTarget: 'dog' },
  { id: 'd32', name: '치주염 / 치석', category: '안과/치과', speciesTarget: 'both' },
  { id: 'd33', name: '고양이 구내염 (FCGS)', category: '안과/치과', speciesTarget: 'cat' },
  { id: 'd34', name: '치아 흡수성 병변 (FORL)', category: '안과/치과', speciesTarget: 'cat' },

  // 심장 / 호흡기
  { id: 'd35', name: '이첨판 폐쇄부전증 (MMVD)', category: '심장/호흡기', speciesTarget: 'dog' },
  { id: 'd36', name: '비대성 심근증 (HCM)', category: '심장/호흡기', speciesTarget: 'cat' },
  { id: 'd37', name: '기관지 협착증 (기관허탈)', category: '심장/호흡기', speciesTarget: 'dog' },
  { id: 'd38', name: '심장사상충 감염증', category: '심장/호흡기', speciesTarget: 'both' },
  { id: 'd39', name: '고양이 천식', category: '심장/호흡기', speciesTarget: 'cat' },
  { id: 'd40', name: '폐부종', category: '심장/호흡기', speciesTarget: 'both' },

  // 감염성 / 기타 / 종양
  { id: 'd41', name: '파보 바이러스 장염', category: '감염성/기타', speciesTarget: 'dog' },
  { id: 'd42', name: '홍역 (디스템퍼)', category: '감염성/기타', speciesTarget: 'dog' },
  { id: 'd43', name: '고양이 범백혈구 감소증 (FPLV)', category: '감염성/기타', speciesTarget: 'cat' },
  { id: 'd44', name: '고양이 복막염 (FIP)', category: '감염성/기타', speciesTarget: 'cat' },
  { id: 'd45', name: '고양이 칼리시 / 허피스 바이러스', category: '감염성/기타', speciesTarget: 'cat' },
  { id: 'd46', name: '유선 종양', category: '감염성/기타', speciesTarget: 'both' },
  { id: 'd47', name: '림프종 (혈액암)', category: '감염성/기타', speciesTarget: 'both' },
  { id: 'd48', name: '비만세포종 (MCT)', category: '감염성/기타', speciesTarget: 'both' },
  { id: 'd49', name: '빈혈 (IMHA)', category: '감염성/기타', speciesTarget: 'both' },
  { id: 'd50', name: '뇌수두증', category: '감염성/기타', speciesTarget: 'dog' }
];

export const searchDiseases = (query: string): DiseaseItem[] => {
  if (!query || query.trim() === '') return [];
  const clean = query.trim().toLowerCase();
  return COMMON_DISEASES.filter(item => 
    item.name.toLowerCase().includes(clean) || 
    item.category.toLowerCase().includes(clean)
  ).slice(0, 8);
};
