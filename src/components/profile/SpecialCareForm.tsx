import React, { useState } from 'react';
import { PERSONALITY_TAGS } from '../../constants/petProfile';

interface DiseaseItem {
  name: string;
  cycle: string;
}

interface SpecialCareFormProps {
  hospitalName: string;
  setHospitalName: (val: string) => void;
  regularDiseasesList: DiseaseItem[];
  setRegularDiseasesList: (list: DiseaseItem[]) => void;
  medicationsList: string[];
  setMedicationsList: (list: string[]) => void;
  notes: string;
  setNotes: (val: string) => void;
  togglePersonalityTag: (tag: string) => void;
}

export const SpecialCareForm: React.FC<SpecialCareFormProps> = ({
  hospitalName,
  setHospitalName,
  regularDiseasesList,
  setRegularDiseasesList,
  medicationsList,
  setMedicationsList,
  notes,
  setNotes,
  togglePersonalityTag
}) => {
  const [medInput, setMedInput] = useState('');
  const [diseaseNameInput, setDiseaseNameInput] = useState('');
  const [diseaseCycleInput, setDiseaseCycleInput] = useState('1개월');
  const [isCustomCycle, setIsCustomCycle] = useState(false);
  const [customCycleInput, setCustomCycleInput] = useState('');

  const handleAddMedication = () => {
    const trimmed = medInput.trim();
    if (trimmed) {
      const currentList = medicationsList.filter(item => item.trim() !== '');
      if (!currentList.includes(trimmed)) {
        setMedicationsList([...currentList, trimmed]);
      }
      setMedInput('');
    }
  };

  const handleKeyPressMed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMedication();
    }
  };

  const handleRemoveMedication = (itemToRemove: string) => {
    const next = medicationsList.filter(item => item !== itemToRemove);
    setMedicationsList(next.length === 0 ? [''] : next);
  };

  const handleAddDisease = () => {
    const nameTrimmed = diseaseNameInput.trim();
    const cycleVal = isCustomCycle ? customCycleInput.trim() : diseaseCycleInput;
    if (nameTrimmed && cycleVal) {
      const currentList = regularDiseasesList.filter(d => d.name.trim() !== '');
      const duplicate = currentList.some(d => d.name === nameTrimmed);
      if (!duplicate) {
        setRegularDiseasesList([...currentList, { name: nameTrimmed, cycle: cycleVal }]);
      }
      setDiseaseNameInput('');
      setIsCustomCycle(false);
      setDiseaseCycleInput('1개월');
      setCustomCycleInput('');
    }
  };

  const handleKeyPressDisease = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDisease();
    }
  };

  const handleRemoveDisease = (nameToRemove: string) => {
    const next = regularDiseasesList.filter(d => d.name !== nameToRemove);
    setRegularDiseasesList(next.length === 0 ? [{ name: '', cycle: '1개월' }] : next);
  };

  const activeMedications = medicationsList.filter(item => item.trim() !== '');
  const activeDiseases = regularDiseasesList.filter(d => d.name.trim() !== '');

  return (
    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Hospital Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>자주 가는 동물병원</label>
        <input 
          type="text"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          placeholder="예: 강남 24시 동물메디컬센터"
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

      {/* Regular Disease / Regular Visits (Chips based UI) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>주기적 방문 질병 및 정기 검진</label>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
          만성 신부전, 관절 정기검진 등 주기적인 진료나 관리가 필요한 질병을 기입하고 추가하세요.
        </span>
        
        {/* Disease Input & Cycle Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--screen-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input 
              type="text"
              value={diseaseNameInput}
              onChange={(e) => setDiseaseNameInput(e.target.value)}
              onKeyDown={handleKeyPressDisease}
              placeholder="질병명 또는 검진명 (예: 신부전, 예방접종)"
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.85rem',
                outline: 'none',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-main)'
              }}
            />
            <button
              type="button"
              onClick={handleAddDisease}
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--main-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              추가
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select
              value={isCustomCycle ? 'custom' : diseaseCycleInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'custom') {
                  setIsCustomCycle(true);
                } else {
                  setIsCustomCycle(false);
                  setDiseaseCycleInput(val);
                }
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                fontSize: '0.8rem',
                outline: 'none',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-main)'
              }}
            >
              <option value="1주일">1주일 주기</option>
              <option value="2주일">2주일 주기</option>
              <option value="1개월">1개월 주기</option>
              <option value="2개월">2개월 주기</option>
              <option value="3개월">3개월 주기</option>
              <option value="6개월">6개월 주기</option>
              <option value="custom">직접 주기 입력</option>
            </select>
            
            {isCustomCycle && (
              <input 
                type="text"
                value={customCycleInput}
                onChange={(e) => setCustomCycleInput(e.target.value)}
                placeholder="예: 10일, 1년"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-main)'
                }}
              />
            )}
          </div>
        </div>

        {/* Current Active Disease Chips */}
        {activeDiseases.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {activeDiseases.map((item) => (
              <span
                key={item.name}
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
                {item.name} ({item.cycle})
                <button
                  type="button"
                  onClick={() => handleRemoveDisease(item.name)}
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
      </div>

      {/* Regular Medication / Supplements (Chips based UI) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>정기 복용약 및 영양제</label>
        
        {/* Input box + Add Button */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text"
            value={medInput}
            onChange={(e) => setMedInput(e.target.value)}
            onKeyDown={handleKeyPressMed}
            placeholder="복용 정보 입력 후 추가 (예: 유산균 매일 아침)"
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
            onClick={handleAddMedication}
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

        {/* Current Active Medication Chips */}
        {activeMedications.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {activeMedications.map((item) => (
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
                  onClick={() => handleRemoveMedication(item)}
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
      </div>

      {/* Personality Tag Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>우리 아이 성격 키워드</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PERSONALITY_TAGS.map(pt => {
            const isSelected = notes.includes(pt);
            return (
              <button
                key={pt}
                type="button"
                onClick={() => togglePersonalityTag(pt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: isSelected ? '1px solid var(--main-primary)' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? 'inset 0 0 0 0.5px var(--main-primary)' : 'none',
                  backgroundColor: isSelected ? 'var(--butter-cream)' : 'var(--card-bg)',
                  color: isSelected ? 'var(--main-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free Notes Textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>기타 케어 주의사항 및 메모</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="좋아하는 간식, 싫어하는 행동, 빗질 팁 등 자유롭게 메모하세요."
          rows={4}
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-color)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            outline: 'none',
            backgroundColor: 'var(--screen-bg)',
            color: 'var(--text-main)',
            resize: 'none'
          }}
        />
      </div>

    </div>
  );
};
