import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';

import ImageCropper from '../components/common/ImageCropper';

export const SPECIES_PRESETS: Record<string, { label: string; breeds: string[] }> = {
  dog: {
    label: '개',
    breeds: [
      '말티즈', '포메라니안', '치와와', '토이 푸들', '시츄', 
      '비글', '코카 스파니엘', '진도견', '웰시 코기', 
      '골든 리트리버', '래브라도 리트리버', '허스키', '저먼 셰퍼드', 
      '비숑 프리제', '보더 콜리', '시바견', '요크셔 테리어', 
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
  small_mammal: {
    label: '설치류 및 소형 포유류',
    breeds: [
      '골든 햄스터', '로보로브스키', '정글리안(시베리안)', 
      '아비시니안 기니피그', '페루비안 기니피그', '아메리칸 기니피그', 
      '드워프 핫롯 토끼', '롭어드 토끼', '라이언헤드 토끼', 
      '아프리칸 피그미 고슴도치', '슈가글라이더', 
      '친칠라', '페럿', '데구', '몽골리안 저빌', '팬더마우스'
    ]
  },
  bird: {
    label: '조류',
    breeds: [
      '모란앵무', '사랑앵무(버저가리)', '잉꼬', 
      '왕관앵무', '코뉴어', 
      '회색앵무', '아마존 앵무', '마카우(금강앵무)', 
      '퀘이커 앵무', '카이큐', '유황앵무(코카투)', 
      '금화조', '문조', '십자매', '카나리아'
    ]
  },
  reptile: {
    label: '파충류',
    breeds: [
      '크레스트 게코', '가고일 게코', 
      '레오파드 게코', '비어디 드래곤', 
      '레이저백 머스크터틀', '커먼 머스크터틀', '쿠터 종류', 
      '호스로필드 육지거북', '별거북', '설카타 육지거북', 
      '레오파드 육지거북', '레드풋 육지거북', 
      '콘스네이크', '볼 파이톤', '킹스네이크', '서부돼지코뱀 (호그노즈)', 
      '블루텅 스킨크', '펫테일 게코', '납테일 게코'
    ]
  },
  amphibian: {
    label: '양서류',
    breeds: [
      '팩맨 프로그(뿔개구리)', '화이트 트리프로그(청개구리류)', 
      '우파루파(멕시코도롱뇽)', '파이어 살라맨더', 
      '픽시프로그', '토마토프로그', '다트프로그', 
      '크로커다일 뉴트', '타이거 살라맨더'
    ]
  },
  fish: {
    label: '어류',
    breeds: [
      '구피', '플래티', '몰리', '베타', 
      '네온 테트라', '제브라 다리오', '카디널 테트라', 
      '난주', '오란다', '진주린', '비단잉어', 
      '아프리칸 시클리드', '아메리칸 시클리드', 
      '디스커스', '엔젤피쉬', '코리도라스', '안시 (플레코)'
    ]
  },
  custom: {
    label: '직접 입력',
    breeds: []
  }
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { addPet, showAlert, isGlobalTourActive } = usePetStore();

  
  const [step, setStep] = useState(1);
  
  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [customSpecies, setCustomSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState<string>('/default_paw.png');

  // Cropper states
  const [rawImage, setRawImage] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);

  // Step 2: Special Care Info
  const [medicationName, setMedicationName] = useState('');
  const [medicationTime, setMedicationTime] = useState('');
  const [allergies, setAllergies] = useState('');
  const [walkDepartTime, setWalkDepartTime] = useState('');
  const [walkDuration, setWalkDuration] = useState('');

  // Time Picker Modal states
  const [activePicker, setActivePicker] = useState<'medication' | 'depart' | 'duration' | null>(null);
  const [pickerHour, setPickerHour] = useState('09');
  const [pickerMinute, setPickerMinute] = useState('00');
  const [pickerDurationHour, setPickerDurationHour] = useState('0');
  const [pickerDurationMinute, setPickerDurationMinute] = useState('30');

  // Error states for Step 1
  const [nameError, setNameError] = useState('');
  const [birthError, setBirthError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  // Guide Overlay state auto-trigger removed to prevent race conditions.
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRawImage(event.target.result as string);
          setShowCropModal(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedData: string) => {
    setImage(croppedData);
    setShowCropModal(false);
    setRawImage('');
  };

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

  // Real-time Validation for Step 1
  useEffect(() => {
    let isValid = true;
    
    const trimmedName = name.trim();
    if (name.length > 0) {
      if (!/^[가-힣a-zA-Z\s]+$/.test(trimmedName) || trimmedName.length > 10) {
        setNameError('한글/영문 10자 이내로 입력해주세요.');
        isValid = false;
      } else {
        setNameError('');
      }
    } else {
      isValid = false;
    }

    if (birth.length > 0) {
      setBirthError('');
    } else {
      isValid = false;
    }

    if (weight.length > 0) {
      const w = parseFloat(weight);
      if (isNaN(w) || w <= 0) {
        setWeightError('올바른 숫자를 입력해주세요.');
        isValid = false;
      } else {
        setWeightError('');
      }
    } else {
      isValid = false;
    }

    if (species === 'custom' && !customSpecies.trim()) {
      isValid = false;
    }

    if (!breed.trim()) isValid = false;

    setIsStep1Valid(isValid);
  }, [name, breed, birth, weight, species, customSpecies]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid) return;

    try {
      const formattedMedications = medicationName && medicationTime ? `${medicationName} (${medicationTime})` : (medicationName || medicationTime || '');
      const formattedWalkGoal = walkDuration ? `${walkDuration}` : '';
      const petSpecies = species === 'custom' ? customSpecies.trim() : species;

      await addPet({
        name: name.trim(),
        species: petSpecies,
        breed: breed.trim(),
        birth,
        weight: parseFloat(weight) || 0,
        image,
        medicationName: medicationName.trim() || undefined,
        medicationTime: medicationTime.trim() || undefined,
        medications: formattedMedications.trim() || undefined,
        allergies: allergies.trim() || undefined,
        walkDepartTime: walkDepartTime.trim() || undefined,
        walkDuration: formattedWalkGoal.trim() || undefined,
        walkTime: walkDepartTime ? `나가는 시간: ${walkDepartTime}` : undefined,
        walkGoal: formattedWalkGoal ? `목표: ${formattedWalkGoal}` : undefined
      });

      localStorage.setItem('isFirstRun', 'false');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showAlert('등록 중 오류가 발생했습니다.');
    }
  };

  const getErrorStyle = (errorMsg: string) => ({
    borderColor: errorMsg ? 'var(--blood-coral)' : undefined
  });

  return (
    <div className="onboarding-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-bg)' }}>
      {/* Unified Global Tour takes care of guides */}

      {/* Step Header Indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '20px 0 10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: step === 1 ? 'var(--main-primary)' : 'var(--border-color)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>1</span>
          <span style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>기본 정보</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: step === 2 ? 'var(--main-primary)' : 'var(--border-color)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>2</span>
          <span style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>케어 정보</span>
        </div>
      </div>

      <div className="onboarding-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem' }}>{step === 1 ? '반려동물 프로필 등록' : '특별 케어 정보 등록'}</h1>
        <p>{step === 1 ? '우리 아이를 소개하는 기본 정보를 입력해주세요.' : '아이의 맞춤 케어를 위한 세부 정보를 등록해 주세요.'}</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep}>
          <div className="avatar-upload" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <label htmlFor="ob-avatar-input" style={{ cursor: 'pointer', position: 'relative', width: '110px', height: '110px' }}>
              <img 
                src={image} 
                alt="Avatar Preview" 
                style={{ 
                  width: '110px', 
                  height: '110px', 
                  borderRadius: '50%', 
                  border: '4px solid var(--main-primary)', 
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--main-primary)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--card-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

          <div className="onboarding-form">
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">이름</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="form-input" 
                style={getErrorStyle(nameError)}
                placeholder="예) 초코" 
                required 
              />
              {nameError && <span style={{ color: 'var(--blood-coral)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{nameError}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">종류 *</label>
              <select 
                value={species} 
                onChange={(e) => {
                  setSpecies(e.target.value);
                  setBreed(''); // 종류가 바뀌면 품종 초기화
                  setCustomSpecies('');
                }} 
                className="form-input"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.95rem',
                  backgroundColor: 'var(--card-bg)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="dog">개</option>
                <option value="cat">고양이</option>
                <option value="small_mammal">설치류 및 소형 포유류</option>
                <option value="bird">조류</option>
                <option value="reptile">파충류</option>
                <option value="amphibian">양서류</option>
                <option value="fish">어류</option>
                <option value="custom">직접 입력</option>
              </select>
            </div>
            {species === 'custom' && (
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">동물 종류 직접 입력 *</label>
                <input 
                  type="text" 
                  value={customSpecies} 
                  onChange={(e) => setCustomSpecies(e.target.value)} 
                  className="form-input" 
                  placeholder="예: 앵무새, 고슴도치 등" 
                  required 
                />
              </div>
            )}
            <div className="form-group" style={{ marginBottom: '14px', position: 'relative' }}>
              <label className="form-label">품종 *</label>
              <input 
                type="text" 
                value={breed} 
                onChange={(e) => setBreed(e.target.value)} 
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => {
                  // 클릭 이벤트를 캡처하기 위해 약간의 딜레이 후 닫음
                  setTimeout(() => setShowAutocomplete(false), 200);
                }}
                className="form-input" 
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
                💡 목록에 없는 희귀 품종은 드롭다운을 무시하고 직접 입력하여 등록하실 수 있습니다.
              </span>
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">생년월일</label>
              <input 
                type="date" 
                value={birth} 
                onChange={(e) => setBirth(e.target.value)} 
                className="form-input" 
                style={getErrorStyle(birthError)}
                required 
              />
              {birthError && <span style={{ color: 'var(--blood-coral)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{birthError}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">몸무게 (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                className="form-input" 
                style={getErrorStyle(weightError)}
                placeholder="예) 4.2" 
                step="0.1" 
                required 
              />
              {weightError && <span style={{ color: 'var(--blood-coral)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{weightError}</span>}
            </div>
          </div>

          {!isGlobalTourActive && (
            <div className="onboarding-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={!isStep1Valid}
                style={{ 
                  backgroundColor: isStep1Valid ? 'var(--main-primary)' : '#E0E0E0',
                  cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  width: 'auto',
                  minWidth: '120px'
                }}
              >
                다음
              </button>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="onboarding-form">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">투약 약물 이름</label>
              <input 
                type="text" 
                value={medicationName} 
                onChange={(e) => setMedicationName(e.target.value)} 
                className="form-input" 
                placeholder="예) 안약, 유산균, 심장사상충약" 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">투약 시간 설정</label>
              <button 
                type="button" 
                className="form-input" 
                style={{ 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  background: 'var(--card-bg)',
                  color: medicationTime ? 'var(--text-main)' : 'var(--text-muted)'
                }}
                onClick={() => {
                  if (medicationTime) {
                    const [h, m] = medicationTime.split(':');
                    setPickerHour(h);
                    setPickerMinute(m);
                  } else {
                    setPickerHour('09');
                    setPickerMinute('00');
                  }
                  setActivePicker('medication');
                }}
              >
                {medicationTime || '예) 10:00'}
              </button>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">알레르기 및 특이사항</label>
              <input 
                type="text" 
                value={allergies} 
                onChange={(e) => setAllergies(e.target.value)} 
                className="form-input" 
                placeholder="예) 닭고기 알레르기, 진드기 주의" 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">산책 나가는 시간</label>
              <button 
                type="button" 
                className="form-input" 
                style={{ 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  background: 'var(--card-bg)',
                  color: walkDepartTime ? 'var(--text-main)' : 'var(--text-muted)'
                }}
                onClick={() => {
                  if (walkDepartTime) {
                    const [h, m] = walkDepartTime.split(':');
                    setPickerHour(h);
                    setPickerMinute(m);
                  } else {
                    setPickerHour('18');
                    setPickerMinute('00');
                  }
                  setActivePicker('depart');
                }}
              >
                {walkDepartTime || '예) 18:00'}
              </button>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">산책 목표 시간</label>
              <button 
                type="button" 
                className="form-input" 
                style={{ 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  background: 'var(--card-bg)',
                  color: walkDuration ? 'var(--text-main)' : 'var(--text-muted)'
                }}
                onClick={() => {
                  if (walkDuration) {
                    if (walkDuration.includes('시간')) {
                      const parts = walkDuration.split('시간');
                      setPickerDurationHour(parts[0].trim());
                      const minPart = parts[1].replace('분', '').trim();
                      setPickerDurationMinute(minPart || '0');
                    } else {
                      setPickerDurationHour('0');
                      setPickerDurationMinute(walkDuration.replace('분', '').trim() || '30');
                    }
                  } else {
                    setPickerDurationHour('0');
                    setPickerDurationMinute('30');
                  }
                  setActivePicker('duration');
                }}
              >
                {walkDuration || '예) 30분'}
              </button>
            </div>
          </div>

          {!isGlobalTourActive && (
            <div className="onboarding-footer" style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-submit" 
                onClick={() => setStep(1)}
                style={{ 
                  backgroundColor: 'var(--text-muted)', 
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  width: 'auto',
                  minWidth: '100px',
                  marginTop: 0
                }}
              >
                이전
              </button>
              <button 
                type="submit" 
                className="btn-submit" 
                style={{ 
                  backgroundColor: 'var(--main-primary)', 
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  width: 'auto',
                  minWidth: '120px',
                  marginTop: 0
                }}
              >
                완료하기
              </button>
            </div>
          )}
        </form>
      )}

      {/* Time & Duration Picker Modal */}
      {activePicker && (
        <div 
          className="modal-overlay" 
          style={{ 
            display: 'flex', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.5)', 
            zIndex: 150000, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivePicker(null);
          }}
        >
          <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', gap: '16px' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 800 }}>
              {activePicker === 'medication' ? '투약 시간 설정' : activePicker === 'depart' ? '산책 출발 시간 설정' : '산책 목표 시간 설정'}
            </h4>
            
            {activePicker === 'duration' ? (
              // Duration Picker (Hours & Minutes)
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                <select 
                  value={pickerDurationHour} 
                  onChange={(e) => setPickerDurationHour(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <option key={i} value={i}>{i}시간</option>
                  ))}
                </select>
                <select 
                  value={pickerDurationMinute} 
                  onChange={(e) => setPickerDurationMinute(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {['00', '10', '20', '30', '40', '50'].map(m => (
                    <option key={m} value={m}>{parseInt(m)}분</option>
                  ))}
                </select>
              </div>
            ) : (
              // Standard Time Picker (Hour : Minute)
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                <select 
                  value={pickerHour} 
                  onChange={(e) => setPickerHour(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hStr = String(i).padStart(2, '0');
                    return <option key={hStr} value={hStr}>{hStr}시</option>;
                  })}
                </select>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>:</span>
                <select 
                  value={pickerMinute} 
                  onChange={(e) => setPickerMinute(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', padding: '8px', fontSize: '1rem', fontWeight: 'bold', textAlign: 'center' }}
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const mStr = String(i).padStart(2, '0');
                    return <option key={mStr} value={mStr}>{mStr}분</option>;
                  })}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                type="button" 
                className="btn-submit"
                onClick={() => setActivePicker(null)}
                style={{ backgroundColor: 'var(--text-muted)', flex: 1, marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
              >
                취소
              </button>
              <button 
                type="button" 
                className="btn-submit"
                onClick={() => {
                  if (activePicker === 'duration') {
                    let formatted = '';
                    const hrs = parseInt(pickerDurationHour);
                    const mins = parseInt(pickerDurationMinute);
                    if (hrs > 0) {
                      formatted = `${hrs}시간 ${mins > 0 ? `${mins}분` : ''}`.trim();
                    } else {
                      formatted = `${mins}분`;
                    }
                    setWalkDuration(formatted);
                  } else {
                    const timeStr = `${pickerHour}:${pickerMinute}`;
                    if (activePicker === 'medication') {
                      setMedicationTime(timeStr);
                    } else if (activePicker === 'depart') {
                      setWalkDepartTime(timeStr);
                    }
                  }
                  setActivePicker(null);
                }}
                style={{ flex: 1, marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
              >
                설정
              </button>
            </div>
          </div>
        </div>
      )}

      {showCropModal && (
        <ImageCropper 
          rawImage={rawImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setRawImage('');
          }}
        />
      )}
    </div>
  );
};

export default Onboarding;
