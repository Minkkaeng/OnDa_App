import React, { useState } from 'react';
import { ALLERGY_PRESETS, WALK_GOAL_OPTIONS } from '../../constants/petProfile';

interface DailyCareFormProps {
  walkGoal: string;
  setWalkGoal: (val: string) => void;
  walkTime: string;
  setWalkTime: (val: string) => void;
  allergiesList: string[];
  setAllergiesList: (list: string[]) => void;
  toggleAllergyPreset: (label: string) => void;
}

export const DailyCareForm: React.FC<DailyCareFormProps> = ({
  walkGoal,
  setWalkGoal,
  walkTime,
  setWalkTime,
  allergiesList,
  setAllergiesList,
  toggleAllergyPreset
}) => {
  const [allergyInput, setAllergyInput] = useState('');

  const handleAddAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed) {
      if (trimmed === '없음') {
        setAllergiesList(['없음']);
        setAllergyInput('');
        return;
      }
      // 중복 방지 및 '없음' 제거
      const currentList = allergiesList.filter(item => item !== '없음' && item.trim() !== '');
      if (!currentList.includes(trimmed)) {
        setAllergiesList([...currentList, trimmed]);
      }
      setAllergyInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAllergy();
    }
  };

  const handleRemoveAllergy = (itemToRemove: string) => {
    const next = allergiesList.filter(item => item !== itemToRemove);
    setAllergiesList(next.length === 0 ? [''] : next);
  };

  // 렌더링에 적합한 리스트로 정제 (빈 문자열 제외)
  const activeAllergies = allergiesList.filter(item => item.trim() !== '');

  return (
    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Walk Goal Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>일일 산책 목표 시간</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {WALK_GOAL_OPTIONS.map(opt => {
            const isSelected = walkGoal === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setWalkGoal(opt)}
                style={{
                  padding: '10px 0',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  border: isSelected ? '1px solid var(--main-primary)' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? 'inset 0 0 0 1px var(--main-primary)' : 'none',
                  backgroundColor: isSelected ? 'var(--butter-cream)' : 'var(--card-bg)',
                  color: isSelected ? 'var(--main-primary)' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Walk Schedule Time */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>주요 산책 선호 시간대</label>
        <input 
          type="text"
          value={walkTime}
          onChange={(e) => setWalkTime(e.target.value)}
          placeholder="예: 매일 오후 7:30, 아침 출근 전"
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-color)',
            fontSize: '0.9rem',
            outline: 'none',
            backgroundColor: 'var(--screen-bg)',
            color: 'var(--text-main)'
          }}
        />
      </div>

      {/* Allergy Information (Chips based UI) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>알레르기 식이/환경 요소</label>
        
        {/* Input box + Add Button */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="알레르기 요인 입력 후 추가 (예: 닭고기, 꽃가루)"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--border-color)',
              fontSize: '0.85rem',
              outline: 'none',
              backgroundColor: 'var(--screen-bg)',
              color: 'var(--text-main)'
            }}
          />
          <button
            type="button"
            onClick={handleAddAllergy}
            style={{
              padding: '0 16px',
              backgroundColor: 'var(--main-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            추가
          </button>
        </div>

        {/* Current Active Allergy Chips */}
        {activeAllergies.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {activeAllergies.map((item) => (
              <span
                key={item}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--butter-cream)',
                  color: 'var(--main-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid var(--main-primary)'
                }}
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(item)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--main-primary)',
                    cursor: 'pointer',
                    padding: '0 0 0 2px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    lineHeight: 1
                  }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Preset Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '100%', marginBottom: '2px' }}>추천 항목 빠른 선택:</span>
          {ALLERGY_PRESETS.map(ap => {
            const cleanLabel = ap.label.split(' ')[0];
            const isSelected = activeAllergies.includes(cleanLabel);
            return (
              <button
                key={ap.id}
                type="button"
                onClick={() => toggleAllergyPreset(ap.label)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: isSelected ? '1px solid #EF4444' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? 'inset 0 0 0 0.5px #EF4444' : 'none',
                  backgroundColor: isSelected ? '#FEF2F2' : 'var(--card-bg)',
                  color: isSelected ? '#EF4444' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {ap.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
