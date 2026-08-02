import React from 'react';
import { Check, Plus } from 'lucide-react';
import { type DiseaseItem } from '../../constants/diseaseDataset';

export interface OnboardingStep3HealthProps {
  allergiesList: string[];
  setAllergiesList: React.Dispatch<React.SetStateAction<string[]>>;
  allergyInput: string;
  setAllergyInput: (val: string) => void;
  medicationsList: string[];
  medInput: string;
  setMedInput: (val: string) => void;
  regularDiseasesList: { name: string; cycle: string }[];
  diseaseNameInput: string;
  setDiseaseNameInput: (val: string) => void;
  diseaseCycleInput: string;
  setDiseaseCycleInput: (val: string) => void;
  isCustomCycle: boolean;
  setIsCustomCycle: (val: boolean) => void;
  customCycleInput: string;
  setCustomCycleInput: (val: string) => void;
  diseaseSearchResults: DiseaseItem[];
  setDiseaseSearchResults: React.Dispatch<React.SetStateAction<DiseaseItem[]>>;
  hospitalName: string;
  setHospitalName: (val: string) => void;
  handleAddAllergy: () => void;
  handleRemoveAllergy: (item: string) => void;
  handleAddMedication: () => void;
  handleRemoveMedication: (item: string) => void;
  handleAddDisease: () => void;
  handleRemoveDisease: (name: string) => void;
  colors: {
    textMain: string;
    textMuted: string;
    mainPrimary: string;
    mainPrimaryLight: string;
    borderColor: string;
    activeRed: string;
  };
  commonCardStyle: React.CSSProperties;
  commonInputStyle: React.CSSProperties;
}

const OnboardingStep3Health: React.FC<OnboardingStep3HealthProps> = ({
  allergiesList,
  setAllergiesList,
  allergyInput,
  setAllergyInput,
  medicationsList,
  medInput,
  setMedInput,
  regularDiseasesList,
  diseaseNameInput,
  setDiseaseNameInput,
  diseaseCycleInput,
  setDiseaseCycleInput,
  isCustomCycle,
  setIsCustomCycle,
  customCycleInput,
  setCustomCycleInput,
  diseaseSearchResults,
  setDiseaseSearchResults,
  hospitalName,
  setHospitalName,
  handleAddAllergy,
  handleRemoveAllergy,
  handleAddMedication,
  handleRemoveMedication,
  handleAddDisease,
  handleRemoveDisease,
  colors,
  commonCardStyle,
  commonInputStyle
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Card 3-1: Allergy horizontal scroll chips */}
      <div className="onboarding-card" style={{ ...commonCardStyle, padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem', color: colors.textMain, fontWeight: 700, margin: 0 }}>
            알레르기 / 주의 음식 (선택)
          </label>
          <span style={{ fontSize: '0.65rem', color: colors.textMuted }}>칩을 눌러 삭제/추가</span>
        </div>

        {/* Preset Horizontal Scroll Chips */}
        <div className="horizontal-scroll-chips" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '6px' }}>
          {['초콜릿', '포도', '양파', '마늘', '우유', '계란', '닭고기', '소고기', '밀가루'].map((preset) => {
            const isAdded = allergiesList.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (isAdded) handleRemoveAllergy(preset);
                  else setAllergiesList([...allergiesList, preset]);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: isAdded ? `1.5px solid ${colors.mainPrimary}` : `1px solid ${colors.borderColor}`,
                  backgroundColor: isAdded ? colors.mainPrimary : '#FFFFFF',
                  color: isAdded ? '#FFFFFF' : colors.textMain,
                  fontSize: '0.75rem',
                  fontWeight: isAdded ? 800 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isAdded ? <Check size={12} /> : <Plus size={12} />}
                <span>{preset}</span>
              </button>
            );
          })}
        </div>

        {/* Input & Add Button for custom allergy */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            value={allergyInput} 
            onChange={(e) => setAllergyInput(e.target.value)} 
            placeholder="직접 추가할 알레르기 입력" 
            style={{ ...commonInputStyle, height: '34px', fontSize: '0.75rem', flex: 1 }} 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAllergy();
              }
            }}
          />
          <button 
            type="button" 
            onClick={handleAddAllergy} 
            style={{
              padding: '0 12px',
              height: '34px',
              borderRadius: '17px',
              backgroundColor: colors.mainPrimary,
              color: 'white',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            추가
          </button>
        </div>
      </div>

      {/* Card 3-2: Disease autocomplete & Cycle registration */}
      <div className="onboarding-card" style={{ ...commonCardStyle, padding: '10px 14px' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', color: colors.textMain, fontWeight: 700, display: 'block', marginBottom: '4px' }}>
          기저 질환 / 정기 관리 질환 (선택)
        </label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={diseaseNameInput} 
              onChange={(e) => {
                setDiseaseNameInput(e.target.value);
              }} 
              placeholder="질환명 검색 또는 입력 (예: 슬개골 탈구)" 
              style={{ ...commonInputStyle, height: '34px', fontSize: '0.75rem' }} 
            />
            {diseaseSearchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: `1.5px solid ${colors.borderColor}`,
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(142,134,126,0.12)',
                zIndex: 200,
                maxHeight: '150px',
                overflowY: 'auto',
                marginTop: '4px'
              }}>
                {diseaseSearchResults.map((d: DiseaseItem) => (
                  <div 
                    key={d.id}
                    onMouseDown={() => {
                      setDiseaseNameInput(d.name);
                      setDiseaseSearchResults([]);
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: colors.textMain,
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--screen-bg)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{d.name}</span>
                    <span style={{ fontSize: '0.7rem', color: colors.textMuted, marginLeft: '6px' }}>({d.category})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select
              value={isCustomCycle ? 'custom' : diseaseCycleInput}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomCycle(true);
                } else {
                  setIsCustomCycle(false);
                  setDiseaseCycleInput(e.target.value);
                }
              }}
              style={{ ...commonInputStyle, height: '34px', fontSize: '0.75rem', flex: 1 }}
            >
              <option value="1개월">검진 주기: 1개월마다</option>
              <option value="3개월">검진 주기: 3개월마다</option>
              <option value="6개월">검진 주기: 6개월마다</option>
              <option value="1년">검진 주기: 1년마다</option>
              <option value="custom">직접 입력</option>
            </select>

            {isCustomCycle && (
              <input 
                type="text" 
                value={customCycleInput} 
                onChange={(e) => setCustomCycleInput(e.target.value)} 
                placeholder="예) 2주마다" 
                style={{ ...commonInputStyle, height: '34px', fontSize: '0.75rem', flex: 1 }} 
              />
            )}

            <button
              type="button"
              onClick={handleAddDisease}
              style={{
                padding: '0 12px',
                height: '34px',
                borderRadius: '17px',
                backgroundColor: colors.mainPrimary,
                color: 'white',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              등록
            </button>
          </div>

          {/* Regular disease chips list */}
          {regularDiseasesList.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              {regularDiseasesList.map((d) => (
                <span
                  key={d.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    backgroundColor: colors.mainPrimaryLight,
                    color: colors.mainPrimary,
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}
                >
                  {d.name} ({d.cycle})
                  <button
                    type="button"
                    onClick={() => handleRemoveDisease(d.name)}
                    style={{ border: 'none', background: 'none', color: colors.mainPrimary, cursor: 'pointer', padding: 0, fontWeight: 800 }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card 3-3: Routine Medications & Primary Hospital */}
      <div className="onboarding-card" style={{ ...commonCardStyle, padding: '10px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem', color: colors.textMain, fontWeight: 700, margin: 0 }}>
            복용 중인 약 / 영양제 및 자주 가는 병원 (선택)
          </label>

          <input 
            type="text" 
            value={hospitalName} 
            onChange={(e) => setHospitalName(e.target.value)} 
            placeholder="주 다니는 동물병원 이름 (예: 온다동물병원)" 
            style={{ ...commonInputStyle, height: '34px', fontSize: '0.75rem' }} 
          />

          <div style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              value={medInput} 
              onChange={(e) => setMedInput(e.target.value)} 
              placeholder="복용 약/영양제 이름 입력 (예: 유산균, 심장사상충약)" 
              style={{ ...commonInputStyle, height: '34px', fontSize: '0.75rem', flex: 1 }} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMedication();
                }
              }}
            />
            <button 
              type="button" 
              onClick={handleAddMedication} 
              style={{
                padding: '0 12px',
                height: '34px',
                borderRadius: '17px',
                backgroundColor: colors.mainPrimary,
                color: 'white',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>

          {medicationsList.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '100%' }}>
              {medicationsList.map((item) => (
                <span
                  key={item}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: colors.mainPrimaryLight,
                    color: colors.mainPrimary,
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(item)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: colors.mainPrimary,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.8rem',
                      fontWeight: 800
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3Health;
