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
        title: '완벽한 황금 맛동산!',
        status: 'good',
        content: '오늘 건강한 황금똥을 누었네요! 장 건강이 아주 좋은 상태입니다. 지금의 식단과 산책 루틴을 잘 유지해주세요.'
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

  // 3.5. Species Specific Basic Guides (Dog & Cat Only)
  if (activePet.species) {
    const sp = activePet.species.toLowerCase();
    if (sp === 'dog') {
      tips.push({
        id: 'guide-spec-dog',
        title: '반려견 슬개골 및 관절 관리',
        content: '말티즈, 푸들, 포메라니안 등 소형견은 슬개골 탈구에 취약합니다. 실내에 미끄럼 방지 매트를 설치하고 높은 곳에서 뛰어내리지 않게 훈련해주세요.'
      });
    } else if (sp === 'cat') {
      tips.push({
        id: 'guide-spec-cat',
        title: '반려묘 음수량 및 수직 공간 확보',
        content: '고양이는 신장 건강을 위한 충분한 수분 섭취(정수기 설치, 습식 캔 급여)가 매우 중요하며, 스트레스 해소를 위해 캣타워 같은 수직 공간을 확보해주세요.'
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
        title: '자견 맞춤 면역 & 사회성 케어',
        content: `현재 ${ageMonths}개월령인 어린 시기입니다. 외부 외출 시 위생에 주의하고, 긍정적인 사회성 기르기를 위해 낯선 소리와 실내 환경 체험을 자주 접하게 해주세요.`
      });
    } else if (ageMonths >= 84) {
      const years = Math.floor(ageMonths / 12);
      tips.push({
        id: 'guide-age-senior',
        title: '노령견 슬개골 및 영양 관리',
        content: `올해 ${years}살로 노령기에 진입했습니다. 발바닥 털이 길면 관절에 무리가 가므로 정기 미용을 하고, 슬개골 보호를 위해 거실 매트와 계단을 설치해 주세요.`
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
