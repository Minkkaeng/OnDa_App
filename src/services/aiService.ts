export interface PoopAnalysisResult {
  status: 'good' | 'loose' | 'hard' | 'bloody';
  text: string;
}

/**
 * Helper to split Base64 header and extract MIME type & data.
 */
const parseBase64Image = (base64Str: string): { mimeType: string; data: string } => {
  const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length < 3) {
    // Default fallback
    return { mimeType: 'image/jpeg', data: base64Str };
  }
  return { mimeType: matches[1], data: matches[2] };
};

/**
 * Call Gemini 1.5 Flash to analyze dog poop image and text notes.
 */
export const analyzePoopImage = async (
  base64Image: string,
  userMemo: string
): Promise<PoopAnalysisResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Fallback simulator if no Gemini API Key is present
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.warn('[Gemini API Key Missing] Using simulated poop analyzer...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    
    // Deterministic simulation based on userMemo text to feel somewhat "real"
    let status: 'good' | 'loose' | 'hard' | 'bloody' = 'good';
    let text = '';

    const memoLower = userMemo.toLowerCase();
    if (memoLower.includes('피') || memoLower.includes('빨간') || memoLower.includes('혈변')) {
      status = 'bloody';
      text = '⚠️ [시뮬레이션 분석] 혈변 또는 출혈 징후가 의심되는 붉은 반점이 감지되었습니다. 장 점막 손상이나 급성 장염일 가능성이 높으므로 즉시 사진을 보관하여 가까운 동물병원에 내원하십시오.';
    } else if (memoLower.includes('물') || memoLower.includes('묽') || memoLower.includes('설사')) {
      status = 'loose';
      text = '⚠️ [시뮬레이션 분석] 묽거나 점액질이 과도한 변 상태가 의심됩니다. 최근 급여한 간식이나 음식 변화가 원인일 수 있습니다. 하루 정도 절식하거나 따뜻한 물과 함께 유산균을 급여하며 관찰하십시오.';
    } else if (memoLower.includes('딱딱') || memoLower.includes('건조') || memoLower.includes('토끼')) {
      status = 'hard';
      text = '⚠️ [시뮬레이션 분석] 수분이 극도로 부족하여 끊겨 있는 단단한 변 상태로 보입니다. 만성 변비 방지를 위해 사료에 물을 말아 급여하거나 신선한 수분 섭취를 늘려 주시기를 권장합니다.';
    } else {
      // Default random
      const rand = Math.random();
      if (rand < 0.6) {
        status = 'good';
        text = '✨ [시뮬레이션 분석] 황금빛의 적당한 굳기를 가진 매우 건강한 배변입니다. 소화 및 장내 미생물 밸런스가 아주 훌륭한 상태이므로 현재의 식단과 일정한 산책 루틴을 그대로 유지해 주세요.';
      } else if (rand < 0.8) {
        status = 'loose';
        text = '✨ [시뮬레이션 분석] 다소 묽은 감이 있는 상태입니다. 과도한 스트레스나 과식이 일시적인 소화불량을 유발할 수 있으니 자극적인 간식을 줄이고 상태를 살펴보세요.';
      } else {
        status = 'hard';
        text = '✨ [시뮬레이션 분석] 변이 다소 딱딱하고 마른 형태입니다. 충분한 음수를 유도하고 섬유질이 많은 처방 사료나 야채 퓨레 소량 급여가 도움이 될 수 있습니다.';
      }
    }

    return { status, text };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const { mimeType, data } = parseBase64Image(base64Image);

    const promptText = `
      You are an expert veterinary AI assistant specializing in canine digestional health.
      Analyze the attached picture of dog feces along with the owner's additional description: "${userMemo}".
      
      Classify the poop status into exactly one of these categories:
      - "good": Normal, healthy, moist brown stool.
      - "loose": Soft, watery, or mucous stool (diarrhea).
      - "hard": Dry, pebble-like, hard stool (constipation).
      - "bloody": Black tarry stool or bright red blood in stool.
      
      Respond in Korean. You MUST output a valid JSON object matching this schema:
      {
        "status": "good" | "loose" | "hard" | "bloody",
        "text": "Detailed medical analysis and friendly veterinary suggestions in Korean (2-4 sentences)."
      }
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: data
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resJson = await response.json();
    const responseText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedResult = JSON.parse(responseText.trim()) as PoopAnalysisResult;
    return parsedResult;
  } catch (error) {
    console.error('[Gemini Poop Scanner Failed] Falling back to simulation...', error);
    // Double fallback
    return {
      status: 'good',
      text: '⚠️ [분석 오류] AI 분석 중 일시적인 연결 지연이 발생했습니다. 겉보기 상태가 양호하며 강아지 활력에 문제(구토, 설사 등)가 없다면 평상시 식단과 물 급여를 신경 써서 유지해 주세요.'
    };
  }
};

/**
 * Call Gemini 1.5 Flash to generate custom daily care advice based on pet profile information.
 */
export const fetchAIPersonalizedTip = async (petInfo: {
  name: string;
  breed: string;
  birth: string;
  weight: number;
  allergies?: string;
  medications?: string;
  notes?: string;
}): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Local fallback calculations for offline or keyless previews
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    const ageMonths = petInfo.birth 
      ? Math.max(1, Math.floor((Date.now() - new Date(petInfo.birth).getTime()) / (30 * 24 * 60 * 60 * 1000)))
      : 12;

    const notesInfo = petInfo.notes ? `(${petInfo.notes})` : '';
    
    if (ageMonths < 12) {
      return `💡 [AI 조언] 아직 ${ageMonths}개월령인 성장기 자견이므로 고단백 균형 사료 급여와 예방 접종 주기를 정확히 챙겨주시는 것이 가장 중요합니다. 뼈 연골 형성을 위한 관절 영양 공급도 신경 써주세요.`;
    }
    if (ageMonths >= 84) {
      return `💡 [AI 조언] 7세 이상 시니어 노령견 그룹에 들어선 만큼, 슬개골 및 척추 관절 보호를 위한 실내 논슬립 매트를 설치하고 정기 건강검진(안구, 혈액검사) 주기를 6개월 단위로 단축하는 것이 노화 방지에 도움됩니다.`;
    }
    if (petInfo.allergies) {
      return `💡 [AI 조언] 감지된 알레르기 유발원(${petInfo.allergies}) 접촉을 철저히 차단하고 피부 가려움이나 눈물 자국이 늘어나지 않는지 간식 라벨 표기 성분을 반드시 대조해 급여하십시오.`;
    }
    return `💡 [AI 조언] ${petInfo.name}의 건강을 위해 정기적인 양치질(하루 1회)과 치석 관리에 집중하고, 체중에 최적화된 ${petInfo.weight}kg 맞춤형 음수량(하루 약 250ml 내외)을 유도하는 관리가 이상적입니다. ${notesInfo}`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
      You are an expert veterinarian advisor. 
      Generate 1 very practical and friendly daily health tip (2-3 sentences max) for this specific pet:
      - Name: ${petInfo.name}
      - Breed: ${petInfo.breed}
      - Age (Birthday): ${petInfo.birth}
      - Weight: ${petInfo.weight} kg
      - Allergies: ${petInfo.allergies || 'None'}
      - Medications: ${petInfo.medications || 'None'}
      - Special Notes: ${petInfo.notes || 'None'}
      
      Respond directly in Korean in a warm, professional veterinary advisor tone. Do not add introductions or explanations. Just return the tip starting with "💡 [AI 맞춤 케어 가이드] ".
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const resJson = await response.json();
    const advice = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!advice) {
      throw new Error('Empty tip returned from Gemini API');
    }

    return advice.trim();
  } catch (error) {
    console.error('[Gemini AI Tip Fetch Failed]', error);
    return `💡 [AI 맞춤 케어 가이드] 반려견 ${petInfo.name}의 건강한 삶을 위해 일정한 양치질 습관을 유지해 주시고, 섭취 칼로리를 초과하지 않도록 산책 목표 운동량을 꾸준히 채워주세요.`;
  }
};
