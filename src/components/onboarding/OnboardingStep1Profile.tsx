import React from 'react';
import { Check } from 'lucide-react';

export interface OnboardingStep1ProfileProps {
  targetPetCount: number;
  savedPets: { name: string }[];
  currentPetIndex: number;
  name: string;
  setName: (val: string) => void;
  species: string;
  setSpecies: (val: string) => void;
  customSpecies: string;
  setCustomSpecies: (val: string) => void;
  breed: string;
  setBreed: (val: string) => void;
  birth: string;
  setBirth: (val: string) => void;
  weight: string;
  setWeight: (val: string) => void;
  image: string;
  showPetDropdown: boolean;
  setShowPetDropdown: (val: boolean) => void;
  showAutocomplete: boolean;
  setShowAutocomplete: (val: boolean) => void;
  filteredBreeds: string[];
  nameError: string;
  birthError: string;
  weightError: string;
  getErrorStyle: (msg: string) => React.CSSProperties;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetAll: () => void;
  setStep: (step: number) => void;
  setTargetPetCount: React.Dispatch<React.SetStateAction<number>>;
  setCurrentPetIndex: React.Dispatch<React.SetStateAction<number>>;
  colors: {
    cardBg: string;
    textMain: string;
    textMuted: string;
    mainPrimary: string;
    borderColor: string;
  };
  commonCardStyle: React.CSSProperties;
  commonInputStyle: React.CSSProperties;
}

const OnboardingStep1Profile: React.FC<OnboardingStep1ProfileProps> = ({
  targetPetCount,
  savedPets,
  currentPetIndex,
  name,
  setName,
  species,
  setSpecies,
  customSpecies,
  setCustomSpecies,
  breed,
  setBreed,
  birth,
  setBirth,
  weight,
  setWeight,
  image,
  showPetDropdown,
  setShowPetDropdown,
  showAutocomplete,
  setShowAutocomplete,
  filteredBreeds,
  nameError,
  birthError,
  weightError,
  getErrorStyle,
  handleImageChange,
  handleResetAll,
  setStep,
  setTargetPetCount,
  setCurrentPetIndex,
  colors,
  commonCardStyle,
  commonInputStyle
}) => {
  return (
    <div className="onboarding-card" style={commonCardStyle}>
      {/* Pet Dropdown Selector */}
      <div style={{ position: 'relative', marginBottom: '10px', textAlign: 'center', zIndex: 30 }}>
        <button
          type="button"
          onClick={() => setShowPetDropdown(!showPetDropdown)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '20px',
            backgroundColor: '#F4F7F4',
            border: `1.5px solid ${colors.mainPrimary}`,
            color: colors.mainPrimary,
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(92,113,94,0.12)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>
            {savedPets[currentPetIndex] 
              ? `${savedPets[currentPetIndex].name} (완료)` 
              : (name.trim() ? `${name.trim()} (작성중)` : `${currentPetIndex + 1}번째 아이 작성중`)}
          </span>
          <span style={{ fontSize: '0.65rem', transform: showPetDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▼</span>
        </button>

        {showPetDropdown && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '210px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
            border: '1px solid #E2E2DC',
            padding: '6px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {Array.from({ length: Math.max(targetPetCount, savedPets.length + 1) }).map((_, idx) => {
              const isSaved = idx < savedPets.length;
              const isCurrent = idx === currentPetIndex;
              const petName = isSaved ? savedPets[idx].name : isCurrent ? (name.trim() || `${idx + 1}번째 아이`) : `${idx + 1}번째 아이`;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (isSaved || isCurrent) {
                      setCurrentPetIndex(idx);
                      setShowPetDropdown(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: isCurrent ? 800 : 600,
                    backgroundColor: isCurrent ? '#E8EFE9' : 'transparent',
                    color: isCurrent ? colors.mainPrimary : colors.textMain,
                    border: 'none',
                    cursor: (isSaved || isCurrent) ? 'pointer' : 'default',
                    textAlign: 'left'
                  }}
                >
                  <span>{petName}</span>
                  {isSaved && <Check size={12} color={colors.mainPrimary} strokeWidth={3} />}
                  {isCurrent && !isSaved && <span style={{ fontSize: '0.65rem', color: colors.textMuted }}>(작성중)</span>}
                </button>
              );
            })}

            {/* Add Pet Item */}
            <button
              type="button"
              onClick={() => {
                setTargetPetCount(prev => prev + 1);
                setCurrentPetIndex(targetPetCount);
                handleResetAll();
                setStep(1);
                setShowPetDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: colors.mainPrimary,
                backgroundColor: '#F8F9F8',
                border: `1px dashed ${colors.mainPrimary}`,
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              <span>+ 새 아이 추가</span>
            </button>
          </div>
        )}
      </div>

      {/* Pet Count Selector (Step 1 Top) */}
      <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#F8F7F3', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.textMuted, marginBottom: '6px' }}>
          함께하는 아이는 몇 마리인가요?
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {[1, 2, 3].map((count) => {
            const isSelected = targetPetCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => {
                  setTargetPetCount(count);
                }}
                style={{
                  flex: 1,
                  height: '30px',
                  borderRadius: '8px',
                  border: isSelected ? `1.5px solid ${colors.mainPrimary}` : '1px solid #E2E2DC',
                  backgroundColor: isSelected ? colors.mainPrimary : '#FFFFFF',
                  color: isSelected ? 'white' : colors.textMain,
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 6px rgba(92, 113, 94, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {count === 3 ? '3마리 이상' : `${count}마리`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="avatar-upload" style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
        <label htmlFor="ob-avatar-input" style={{ cursor: 'pointer', position: 'relative', width: '74px', height: '74px' }}>
          <img 
            src={image} 
            alt="Avatar Preview" 
            style={{ 
              width: '74px', 
              height: '74px', 
              borderRadius: '50%', 
              border: `3px solid ${colors.mainPrimary}`, 
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }} 
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: colors.mainPrimary,
            color: 'white',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: `2px solid ${colors.cardBg}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <input 
            type="file" 
            id="ob-avatar-input" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '3px', color: colors.textMain, fontWeight: 700 }}>이름 *</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="form-input" 
            style={{ ...commonInputStyle, ...getErrorStyle(nameError) }}
            placeholder="예) 초코" 
            required 
          />
          {nameError && <span style={{ color: 'var(--blood-coral)', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{nameError}</span>}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '3px', color: colors.textMain, fontWeight: 700 }}>종류 *</label>
          <select 
            value={species} 
            onChange={(e) => {
              setSpecies(e.target.value);
              setBreed('');
              setCustomSpecies('');
            }} 
            className="form-input" 
            style={commonInputStyle}
            required
          >
            <option value="dog">개</option>
            <option value="cat">고양이</option>
            <option value="custom">직접 입력</option>
          </select>
        </div>
        {species === 'custom' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '3px', color: colors.textMain, fontWeight: 700 }}>종류 직접 입력 *</label>
            <input 
              type="text" 
              value={customSpecies} 
              onChange={(e) => setCustomSpecies(e.target.value)} 
              className="form-input" 
              style={commonInputStyle}
              placeholder="예: 앵무새, 고슴도치 등" 
              required 
            />
          </div>
        )}
        <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '3px', color: colors.textMain, fontWeight: 700 }}>품종 *</label>
          <input 
            type="text" 
            value={breed} 
            onChange={(e) => setBreed(e.target.value)} 
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => {
              setTimeout(() => setShowAutocomplete(false), 200);
            }}
            className="form-input" 
            style={commonInputStyle}
            placeholder={species === 'custom' ? "직접 품종을 입력해주세요" : "품종을 입력하거나 선택해주세요"} 
            required 
          />
          {showAutocomplete && filteredBreeds.length > 0 && (
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
              maxHeight: '130px',
              overflowY: 'auto',
              marginTop: '4px'
            }}>
              {filteredBreeds.map((b) => (
                <div 
                  key={b}
                  onMouseDown={() => {
                    setBreed(b);
                    setShowAutocomplete(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    color: colors.textMain,
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--screen-bg)',
                    textAlign: 'left'
                  }}
                >
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '3px', color: colors.textMain, fontWeight: 700 }}>생년월일 *</label>
          <input 
            type="date" 
            value={birth} 
            onChange={(e) => setBirth(e.target.value)} 
            className="form-input" 
            style={{ ...commonInputStyle, padding: '8px 14px', ...getErrorStyle(birthError) }}
            required 
          />
          {birthError && <span style={{ color: 'var(--blood-coral)', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{birthError}</span>}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '3px', color: colors.textMain, fontWeight: 700 }}>몸무게 (kg) *</label>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            className="form-input" 
            style={{ ...commonInputStyle, ...getErrorStyle(weightError) }}
            placeholder="예) 4.2" 
            step="0.1" 
            required 
          />
          {weightError && <span style={{ color: 'var(--blood-coral)', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{weightError}</span>}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep1Profile;
