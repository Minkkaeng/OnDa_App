import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import defaultLogo from '../assets/logo.png';

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { addPet, showAlert } = usePetStore();
  
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState<string>(defaultLogo);

  // Error states
  const [nameError, setNameError] = useState('');
  const [birthError, setBirthError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // File Compression Engine
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max width/height for compression
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        showAlert(`이미지 크기가 ${MAX_IMAGE_SIZE_MB}MB를 초과합니다. 자동으로 압축을 진행합니다.`);
        try {
          const compressed = await compressImage(file);
          setImage(compressed);
        } catch (error) {
          showAlert('이미지 압축에 실패했습니다. 다른 이미지를 선택해주세요.');
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Real-time Validation
  useEffect(() => {
    let isValid = true;
    
    // Name validation
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

    // Birth validation
    if (birth.length > 0) {
      // Input date format is YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
        setBirthError('유효한 날짜 형식을 선택해주세요.');
        isValid = false;
      } else {
        setBirthError('');
      }
    } else {
      isValid = false;
    }

    // Weight validation
    if (weight.length > 0) {
      // Allow floats up to 1 decimal place
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

    setIsFormValid(isValid);
  }, [name, breed, birth, weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await addPet({
        name: name.trim(),
        breed: breed.trim(),
        birth,
        weight: parseFloat(weight) || 0,
        image
      });

      localStorage.setItem('isFirstRun', 'false');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showAlert('등록 중 오류가 발생했습니다.');
    }
  };

  const getErrorStyle = (errorMsg: string) => ({
    borderColor: errorMsg ? '#FF4D4D' : undefined
  });

  return (
    <div className="onboarding-container panel">
      <div className="onboarding-header">
        <h1>반려견 프로필 등록</h1>
        <p>OnDa Pet Care와 함께할 우리 아이를 소개해주세요.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="avatar-upload" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <label htmlFor="ob-avatar-input" style={{ cursor: 'pointer', position: 'relative', width: '120px', height: '120px' }}>
            <img 
              src={image} 
              alt="Avatar Preview" 
              style={{ 
                width: '120px', 
                height: '120px', 
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
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="form-group">
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
            {nameError && <span style={{ color: '#FF4D4D', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{nameError}</span>}
          </div>
          <div className="form-group">
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
          <div className="form-group">
            <label className="form-label">생년월일</label>
            <input 
              type="date" 
              value={birth} 
              onChange={(e) => setBirth(e.target.value)} 
              className="form-input" 
              style={getErrorStyle(birthError)}
              required 
            />
            {birthError && <span style={{ color: '#FF4D4D', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{birthError}</span>}
          </div>
          <div className="form-group">
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
            {weightError && <span style={{ color: '#FF4D4D', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{weightError}</span>}
          </div>
        </div>

        <div className="onboarding-footer">
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={!isFormValid}
            style={{ 
              backgroundColor: isFormValid ? 'var(--mint-green)' : '#E0E0E0',
              cursor: isFormValid ? 'pointer' : 'not-allowed'
            }}
          >
            등록 완료 및 시작하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
