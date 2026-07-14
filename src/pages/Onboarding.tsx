import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import { useOnboarding } from '../hooks/useOnboarding';
import defaultLogo from '../assets/logo.png';
import ImageCropper from '../components/common/ImageCropper';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { addPet, showAlert, showSplash, setGlobalTourActive, isGlobalTourActive } = usePetStore();
  const { isGlobalTourSeen, isLoading: onboardingLoading } = useOnboarding();
  
  const [step, setStep] = useState(1);
  
  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState<string>(defaultLogo);

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
      if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
        setBirthError('유효한 날짜 형식을 선택해주세요.');
        isValid = false;
      } else {
        setBirthError('');
      }
    } else {
      isValid = false;
    }

    if (weight.length > 0) {
      if (!/^\d+(\.\d{1})?$/.test(weight)) {
        setWeightError('소수점 첫째 자리까지의 숫자만 입력 가능합니다.');
        isValid = false;
      } else {
        setWeightError('');
      }
    } else {
      isValid = false;
    }

    if (!breed.trim()) isValid = false;

    setIsStep1Valid(isValid);
  }, [name, breed, birth, weight]);

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

      await addPet({
        name: name.trim(),
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
    <div className="onboarding-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--white)' }}>
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
            backgroundColor: step === 1 ? 'var(--mint-green)' : 'var(--steel-gray)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>1</span>
          <span style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? 'var(--deep-navy)' : 'var(--muted-gray)' }}>기본 정보</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: step === 2 ? 'var(--mint-green)' : 'var(--steel-gray)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}>2</span>
          <span style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? 'var(--deep-navy)' : 'var(--muted-gray)' }}>케어 정보</span>
        </div>
      </div>

      <div className="onboarding-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem' }}>{step === 1 ? '반려견 프로필 등록' : '특별 케어 정보 등록'}</h1>
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
                  border: '4px solid var(--mint-green)', 
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--mint-green)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '3px solid var(--white)',
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
              <label className="form-label">견종</label>
              <input 
                type="text" 
                value={breed} 
                onChange={(e) => setBreed(e.target.value)} 
                className="form-input" 
                placeholder="예) 토이 푸들" 
                required 
              />
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
                  backgroundColor: isStep1Valid ? 'var(--mint-green)' : '#E0E0E0',
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
                  background: 'var(--white)',
                  color: medicationTime ? 'var(--deep-navy)' : 'var(--muted-gray)'
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
                  background: 'var(--white)',
                  color: walkDepartTime ? 'var(--deep-navy)' : 'var(--muted-gray)'
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
                  background: 'var(--white)',
                  color: walkDuration ? 'var(--deep-navy)' : 'var(--muted-gray)'
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
                  backgroundColor: 'var(--muted-gray)', 
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
                  backgroundColor: 'var(--mint-green)', 
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
            <h4 style={{ margin: 0, color: 'var(--deep-navy)', fontSize: '1rem', fontWeight: 800 }}>
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
                style={{ backgroundColor: 'var(--muted-gray)', flex: 1, marginTop: 0, padding: '10px', fontSize: '0.9rem' }}
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
