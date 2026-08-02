import React, { useState, useEffect } from 'react';
import { SPECIES_PRESETS } from '../../constants/petProfile';

interface BasicCareFormProps {
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
  calculateAgeStr: (birthStr: string) => string;
  handleWeightAdjust: (delta: number) => void;
}

export const BasicCareForm: React.FC<BasicCareFormProps> = ({
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
  calculateAgeStr,
  handleWeightAdjust
}) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);

  // 품종 자동완성 필터링
  useEffect(() => {
    if (species && species !== 'custom') {
      const presets = SPECIES_PRESETS[species]?.breeds || [];
      if (breed.trim() === '') {
        setFilteredBreeds(presets);
      } else {
        const matches = presets.filter(b => b.toLowerCase().includes(breed.trim().toLowerCase()));
        setFilteredBreeds(matches);
      }
    } else {
      setFilteredBreeds([]);
    }
  }, [breed, species]);

  return (
    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Name Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>반려동물 이름 *</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 뽀삐, 초코, 몽이"
          required
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-color)',
            fontSize: '0.95rem',
            fontWeight: 700,
            outline: 'none',
            backgroundColor: 'var(--screen-bg)',
            color: 'var(--text-main)'
          }}
        />
      </div>

      {/* Species Select */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>종류 *</label>
        <select 
          value={species} 
          onChange={(e) => {
            setSpecies(e.target.value);
            setBreed(''); // 종류가 바뀌면 품종 초기화
            setCustomSpecies('');
          }} 
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-color)',
            fontSize: '0.95rem',
            outline: 'none',
            backgroundColor: 'var(--screen-bg)',
            color: 'var(--text-main)'
          }}
          required
        >
          <option value="dog">개</option>
          <option value="cat">고양이</option>
          <option value="custom">직접 입력</option>
        </select>
      </div>

      {/* Custom Species Input */}
      {species === 'custom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>동물 종류 직접 입력 *</label>
          <input 
            type="text" 
            value={customSpecies} 
            onChange={(e) => setCustomSpecies(e.target.value)} 
            placeholder="예: 앵무새, 고슴도치 등" 
            required 
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-color)',
              fontSize: '0.95rem',
              outline: 'none',
              backgroundColor: 'var(--screen-bg)',
              color: 'var(--text-main)'
            }}
          />
        </div>
      )}

      {/* Breed Autocomplete Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>품종 *</label>
        <input 
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          onFocus={() => setShowAutocomplete(true)}
          onBlur={() => {
            setTimeout(() => setShowAutocomplete(false), 200);
          }}
          placeholder={species === 'custom' ? "직접 품종을 입력해주세요" : "품종을 입력하거나 선택해주세요"}
          required
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
        {showAutocomplete && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1.5px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 200,
            maxHeight: '180px',
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
                  padding: '10px 14px',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
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
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
          목록에 없는 희귀 품종은 드롭다운을 무시하고 직접 입력하여 등록하실 수 있습니다.
        </span>
      </div>

      {/* Birth Date Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>생년월일 (입양일)</label>
          <span style={{ fontSize: '0.75rem', color: 'var(--main-primary)', fontWeight: 800 }}>
            {calculateAgeStr(birth)}
          </span>
        </div>
        <input 
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
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

      {/* Weight Input with +/- Adjust Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>현재 체중 (kg)</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.0"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-color)',
              fontSize: '1rem',
              fontWeight: 800,
              outline: 'none',
              backgroundColor: 'var(--screen-bg)',
              color: 'var(--text-main)'
            }}
          />
          {[-0.5, -0.1, +0.1, +0.5].map(delta => (
            <button
              key={delta}
              type="button"
              onClick={() => handleWeightAdjust(delta)}
              style={{
                padding: '10px 8px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: delta > 0 ? 'var(--main-primary)' : '#EF4444',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
