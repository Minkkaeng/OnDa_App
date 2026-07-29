import type { Pet, CalendarEvent } from '../db/schema';

export interface GuideTip {
  id: string;
  title: string;
  content: string;
  status?: 'hard' | 'loose' | 'bloody' | 'good' | 'water-good';
}

export const generateDailyGuides = (activePet: Pet, events: CalendarEvent[]): GuideTip[] => {
  const tips: GuideTip[] = [];
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Filter events for today and for the active pet
  const todayEvents = events.filter(e => e.date === todayStr && (e.petId === activePet.id || !e.petId));

  // Count/Extract specific events
  const waterEvents = todayEvents.filter(e => e.type === 'diary' && e.title.includes('음수량 기록'));
  const snackEvents = todayEvents.filter(e => e.type === 'diary' && e.title.includes('간식/영양제 기록'));
  const poopEvents = todayEvents.filter(e => e.type === 'poop');

  let totalWater = 0;
  waterEvents.forEach(e => {
    const match = e.content.match(/(\d+)ml/);
    if (match) {
      totalWater += parseInt(match[1], 10);
    }
  });

  const snackCount = snackEvents.length;

  // 1. Poop Rules
  if (poopEvents.length > 0) {
    const latestPoop = poopEvents[0];
    if (latestPoop.poopStatus === 'hard') {
      tips.push({
        id: 'guide-poop-hard',
        title: '변이 딱딱해요!',
        status: 'hard',
        content: '오늘 딱딱한 변을 보았네요. 충분한 수분 섭취와 유산균 급여를 권장합니다. 습식 사료를 섞어주시는 것도 도움이 됩니다.'
      });
    } else if (latestPoop.poopStatus === 'loose') {
      tips.push({
        id: 'guide-poop-loose',
        title: '변이 묽어요!',
        status: 'loose',
        content: '무른 변을 보았습니다. 최근 간식을 많이 먹었거나 사료가 바뀌었는지 체크해주세요. 상태가 지속되면 병원 진료가 필요할 수 있습니다.'
      });
    } else if (latestPoop.poopStatus === 'bloody') {
      tips.push({
        id: 'guide-poop-bloody',
        title: '혈변이 의심됩니다!',
        status: 'bloody',
        content: '혈변이 관찰되었습니다! 스트레스, 장염 혹은 이물질 섭취가 원인일 수 있으므로 기력이 없다면 즉시 동물병원에 방문하세요.'
      });
    } else if (latestPoop.poopStatus === 'good') {
      tips.push({
        id: 'guide-poop-good',
        title: '완벽한 건강변!',
        status: 'good',
        content: '오늘 건강하고 이쁜 대변을 보았네요! 장 건강이 아주 좋은 상태입니다. 지금의 식단과 일상 루틴을 잘 유지해주세요.'
      });
    }
  }

  // 2. Snack Rules
  if (snackCount >= 3) {
    tips.push({
      id: 'guide-snack-high',
      title: '간식 급여량이 많아요',
      content: `오늘 벌써 간식을 ${snackCount}번이나 먹었어요! 간식은 하루 필요 칼로리의 10% 이내로 제한하는 것이 비만 예방에 좋습니다.`
    });
  }

  // 3. Water Rules (Basic rule of thumb based on weight)
  const petWeight = typeof activePet.weight === 'string' ? parseFloat(activePet.weight) : (activePet.weight || 0);
  const recommendedWater = petWeight * 60; // 60ml per kg
  
  if (totalWater > 0 && petWeight > 0) {
    if (totalWater < recommendedWater * 0.5) {
      tips.push({
        id: 'guide-water-low',
        title: '수분 섭취가 더 필요해요',
        content: `현재 ${totalWater}ml를 마셨어요. ${activePet.name}의 권장 음수량(${recommendedWater}ml)에 비해 아직 부족하니, 물그릇을 갈아주거나 펫밀크를 활용해 보세요.`
      });
    } else if (totalWater >= recommendedWater) {
      tips.push({
        id: 'guide-water-good',
        title: '충분한 수분 섭취 달성!',
        status: 'water-good',
        content: `오늘 권장 음수량을 모두 채웠습니다! 신장결석 예방과 원활한 노폐물 배출에 아주 긍정적입니다.`
      });
    }
  }

  // 3.5. Species Specific Basic Guides
  if (activePet.species) {
    const sp = activePet.species.toLowerCase();
    if (sp === 'dog') {
      tips.push({
        id: 'guide-spec-dog',
        title: '반려견 관절 및 스트레스 케어',
        content: '말티즈, 푸들, 포메라니안 등 소형견은 슬개골 탈구에 취약합니다. 미끄럼 방지 매트를 깔아주고, 산책 시 냄새를 충분히 맡게 해 스트레스를 완화해주세요.'
      });
    } else if (sp === 'cat') {
      tips.push({
        id: 'guide-spec-cat',
        title: '반려묘 음수량 및 수직 공간 확보',
        content: '고양이는 신장 건강을 위해 음수량을 늘리는 정수기나 습식 캔 급여가 필수적이며, 스트레스 해소를 위해 수직 공간(캣타워)을 충분히 배치해주세요.'
      });
    } else if (sp === 'small_mammal' || sp === 'hamster' || sp === 'rabbit') {
      tips.push({
        id: 'guide-spec-small-mammal',
        title: '소형 포유류 건초 급여 및 사육 환경 케어',
        content: '토끼는 부정교합 방지를 위해 무제한 건초(티모시) 급여가 필수이며, 햄스터는 단독 사육이 원칙이고 겨울철 저체온 동면을 방지하기 위해 실내 온도를 20도 이상으로 유지해주세요.'
      });
    } else if (sp === 'bird') {
      tips.push({
        id: 'guide-spec-bird',
        title: '반려조 영양 펠렛 및 호흡기 케어',
        content: '앵무새는 호흡기가 매우 예민하므로 공기청정과 환기에 신경 쓰고, 영양 불균형 방지를 위해 알곡 위주보다 조류 전용 균형 영양 펠렛을 주식으로 급여해주세요.'
      });
    } else if (sp === 'reptile') {
      tips.push({
        id: 'guide-spec-reptile',
        title: '파충류 칼슘(MBD 예방) 및 온습도 관리',
        content: '파충류는 칼슘 결핍 시 대사성 골질환(MBD)에 걸리기 쉬우므로 먹이에 칼슘제를 묻히는 더스팅이 필수이며, 사육장 내 핫존/쿨존 온도를 다르게 유지해주세요.'
      });
    } else if (sp === 'amphibian') {
      tips.push({
        id: 'guide-spec-amphibian',
        title: '양서류 습도 및 수질 온도 조절',
        content: '양서류는 피부로도 호흡하는 연약한 동물입니다. 항상 적정 습도를 유지하여 피부가 마르지 않게 하고, 급격한 온도 변화 및 수질 오염(수돗물 염소 제거 필수)을 방지해주세요.'
      });
    } else if (sp === 'fish') {
      tips.push({
        id: 'guide-spec-fish',
        title: '어류 물잡이 수온 유지 및 환수 일정 관리',
        content: '물고기를 키울 때는 급격한 수질 변화가 치명적입니다. 여과 장치를 점검하고 정기적으로 부분 환수(전체 물의 20~30% 교체)를 진행하며 적정 수온을 일정하게 유지해주세요.'
      });
    }
  }

  // 4. Fallback Static Rules (Age / Weight)
  if (tips.length === 0) {
    let ageMonths = 0;
    if (activePet.birth) {
      const birth = new Date(activePet.birth);
      ageMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    }

    if (ageMonths < 12 && ageMonths > 0) {
      tips.push({
        id: 'guide-age-puppy',
        title: '성장기 반려동물 면역 & 사회성 케어',
        content: `현재 ${ageMonths}개월령인 어린 시기입니다. 외부 활동 시 위생에 주의하고, 긍정적인 사회성 기르기를 위해 다양한 소리와 실내외 환경 체험을 자주 접하게 해주세요.`
      });
    } else if (ageMonths >= 84) {
      const years = Math.floor(ageMonths / 12);
      tips.push({
        id: 'guide-age-senior',
        title: '노령기 반려동물 관절 및 영양 관리',
        content: `올해 ${years}살로 노령기에 진입했습니다. 발바닥 털이 길거나 발톱이 길면 관절에 무리가 가므로 정기적으로 케어하고, 관절 보호를 위해 전용 매트나 경사로를 설치해 주세요.`
      });
    } else if (petWeight > 15) {
      tips.push({
        id: 'guide-weight-heavy',
        title: '관절 무리 방지 분산 산책 추천',
        content: `${petWeight}kg의 든든한 체격이므로, 한 번에 길게 걷기보다는 15~20분씩 하루 2번 나누어 걷는 것이 심폐와 슬개골 건강에 더욱 이상적입니다.`
      });
    } else {
      tips.push({
        id: 'guide-default',
        title: '온다 맞춤 데일리 건강 관리',
        content: `${activePet.name}의 상태를 매일 기록해주시면, 기록된 데이터를 바탕으로 더욱 정확하고 세밀한 맞춤형 건강 가이드를 제공해 드릴 수 있습니다!`
      });
    }
  }

  return tips;
};
