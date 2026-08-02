export const SPECIES_PRESETS: Record<string, { label: string; breeds: string[] }> = {
  dog: {
    label: '개',
    breeds: [
      '말티즈', '포메라니안', '치와와', '토이 푸들', '시츄', 
      '비글', '코카 스파니엘', '진도견', '웰시 코기', 
      '골든 리트리버', '래브라도 리트리버', '허스키', '저먼 셰퍼드', 
      '비숑 프리제', '보더 Collie', '시바견', '요크셔 테리어', 
      '닥스훈트', '슈나우저', '스피츠', '사모예드', '믹스견'
    ]
  },
  cat: {
    label: '고양이',
    breeds: [
      '코리안 쇼트헤어', '브리티시 쇼트헤어', '러시안 블루', '샴', 
      '페르시안', '메인쿤', '노르웨이 숲', '스코티시 폴드', 
      '아비시니안', '렉돌', '아메리칸 쇼트헤어', '먼치킨', 
      '스핑크스', '뱅갈', '터키시 앙고라', '믹스묘'
    ]
  },
  custom: {
    label: '직접 입력',
    breeds: []
  }
};

export const ALLERGY_PRESETS = [
  { id: 'chicken', label: '닭고기' },
  { id: 'beef', label: '소고기' },
  { id: 'pork', label: '돼지고기' },
  { id: 'egg', label: '계란/유제품' },
  { id: 'dust', label: '먼지/꽃가루' },
  { id: 'none', label: '없음' }
];

export const PERSONALITY_TAGS = [
  '활발함', '얌전함', '호기심왕', '겁쟁이', 
  '식탐왕', '애교쟁이', '사회성만점', '사람좋아'
];

export const WALK_GOAL_OPTIONS = ['15분', '30분', '45분', '60분', '90분'];
