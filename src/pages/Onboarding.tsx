import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import ImageCropper from '../components/common/ImageCropper';
import ScrollTimePickerModal from '../components/common/ScrollTimePickerModal';
import OnboardingStep0Terms from '../components/onboarding/OnboardingStep0Terms';
import OnboardingStep1Profile from '../components/onboarding/OnboardingStep1Profile';
import OnboardingStep2Routine from '../components/onboarding/OnboardingStep2Routine';
import OnboardingStep3Health from '../components/onboarding/OnboardingStep3Health';
import OnboardingTermsModal from '../components/onboarding/OnboardingTermsModal';
import { SPECIES_PRESETS } from '../constants/petProfile';
import { searchDiseases, type DiseaseItem } from '../constants/diseaseDataset';
import { Settings, Heart, PawPrint } from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { addPet, showAlert, isGlobalTourActive } = usePetStore();

  const [step, setStep] = useState(0); // Start from terms & notifications step
  
  // Hybrid Multi-Pet State
  const [targetPetCount, setTargetPetCount] = useState<number>(1);
  const [currentPetIndex, setCurrentPetIndex] = useState<number>(0);
  const [savedPets, setSavedPets] = useState<{ id?: string; name: string; species: string; breed: string; birth: string; weight: number; image: string; }[]>([]);
  const [showPetDropdown, setShowPetDropdown] = useState<boolean>(false);

  // Active Tab Auto Scroll Ref
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentPetIndex, targetPetCount]);

  // Android Keyboard Viewport Lift Handler
  useEffect(() => {
    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isKeyboardOpen = window.visualViewport.height < window.innerHeight - 150;
        if (isKeyboardOpen) {
          document.body.classList.add('keyboard-active');
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            setTimeout(() => {
              activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        } else {
          document.body.classList.remove('keyboard-active');
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
      document.body.classList.remove('keyboard-active');
    };
  }, []);

  // Time Picker Drag/Wheel Scroll Modal State
  const [showWalkTimePickerModal, setShowWalkTimePickerModal] = useState(false);

  // Disease Autocomplete Dataset Search State
  const [diseaseSearchResults, setDiseaseSearchResults] = useState<DiseaseItem[]>([]);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [customSpecies, setCustomSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState('/default_paw.png');

  // Terms and Conditions States
  const [agreeLocation, setAgreeLocation] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeNotification, setAgreeNotification] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<'location' | 'privacy' | null>(null);

  // Cropper states
  const [rawImage, setRawImage] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);

  // Step 2 & 3: Care & Special Info (Chip system based)
  const [walkDuration, setWalkDuration] = useState('30분');
  const [walkDepartTime, setWalkDepartTime] = useState('오전 10:00');
  const [allergiesList, setAllergiesList] = useState<string[]>(['초콜릿', '포도', '양파', '마늘']);
  const [medicationsList, setMedicationsList] = useState<string[]>([]);
  const [regularDiseasesList, setRegularDiseasesList] = useState<{ name: string; cycle: string; }[]>([]);
  const [hospitalName, setHospitalName] = useState('');

  // Local inputs for chip registration
  const [allergyInput, setAllergyInput] = useState('');
  const [medInput, setMedInput] = useState('');
  const [diseaseNameInput, setDiseaseNameInput] = useState('');
  const [diseaseCycleInput, setDiseaseCycleInput] = useState('1개월');
  const [isCustomCycle, setIsCustomCycle] = useState(false);
  const [customCycleInput, setCustomCycleInput] = useState('');

  // Error states for Step 1
  const [nameError, setNameError] = useState('');
  const [birthError, setBirthError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  // Cozy C-Option Colors
  const colors = {
    screenBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    mainPrimary: '#5C715E',
    mainPrimaryLight: '#D4E2D2',
    butterCream: '#E9E6DF',
    sandBg: '#F8F7F3',
    inputBg: '#FCFAF7',
    textMain: '#2E2B2A',
    textMuted: '#8E867E',
    borderColor: '#E8E2D9',
    activeRed: '#E07A5F',
    grayButton: '#9E9E9E'
  };

  const commonInputStyle: React.CSSProperties = {
    width: '100%',
    height: '42px',
    padding: '0 16px',
    borderRadius: '24px',
    border: `1.5px solid ${colors.borderColor}`,
    fontSize: '0.9rem',
    fontWeight: 600,
    backgroundColor: '#F9F8F3',
    color: colors.textMain,
    outline: 'none',
    boxSizing: 'border-box'
  };

  const commonCardStyle: React.CSSProperties = {
    backgroundColor: colors.cardBg,
    borderRadius: '16px',
    padding: '12px 16px',
    boxShadow: '0 4px 16px rgba(142, 134, 126, 0.04)',
    marginBottom: '8px',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto 8px auto',
    boxSizing: 'border-box',
    overflow: 'visible',
    border: 'none'
  };

  const getErrorStyle = (errorMsg: string) => ({
    borderColor: errorMsg ? 'var(--blood-coral)' : undefined
  });

  // Filter breed list based on species & input
  useEffect(() => {
    if (species === 'custom') {
      setFilteredBreeds([]);
      return;
    }
    const currentList = SPECIES_PRESETS[species as keyof typeof SPECIES_PRESETS]?.breeds || [];
    if (!breed.trim()) {
      setFilteredBreeds(currentList);
    } else {
      const q = breed.toLowerCase();
      setFilteredBreeds(currentList.filter(b => b.toLowerCase().includes(q)));
    }
  }, [species, breed]);

  // Real-time Disease Autocomplete Search
  useEffect(() => {
    if (!diseaseNameInput.trim()) {
      setDiseaseSearchResults([]);
    } else {
      const results = searchDiseases(diseaseNameInput);
      setDiseaseSearchResults(results);
    }
  }, [diseaseNameInput]);

  // Real-time Step 1 validation
  useEffect(() => {
    let valid = true;

    if (!name.trim()) {
      setNameError('');
      valid = false;
    } else {
      setNameError('');
    }

    if (species === 'custom' && !customSpecies.trim()) {
      valid = false;
    }

    if (!breed.trim()) {
      valid = false;
    }

    if (!birth) {
      setBirthError('');
      valid = false;
    } else {
      const selectedDate = new Date(birth);
      const today = new Date();
      if (selectedDate > today) {
        setBirthError('미래 날짜는 선택할 수 없습니다');
        valid = false;
      } else {
        setBirthError('');
      }
    }

    if (!weight) {
      setWeightError('');
      valid = false;
    } else {
      const numWeight = parseFloat(weight);
      if (isNaN(numWeight) || numWeight <= 0) {
        setWeightError('올바른 몸무게를 입력해주세요');
        valid = false;
      } else {
        setWeightError('');
      }
    }

    setIsStep1Valid(valid);
  }, [name, species, customSpecies, breed, birth, weight]);

  // Chip handlers for Step 3
  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      const trimmed = allergyInput.trim();
      if (!allergiesList.includes(trimmed)) {
        setAllergiesList([...allergiesList, trimmed]);
      }
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (itemToRemove: string) => {
    setAllergiesList(allergiesList.filter(item => item !== itemToRemove));
  };

  const handleAddMedication = () => {
    if (medInput.trim()) {
      const trimmed = medInput.trim();
      if (!medicationsList.includes(trimmed)) {
        setMedicationsList([...medicationsList, trimmed]);
      }
      setMedInput('');
    }
  };

  const handleRemoveMedication = (itemToRemove: string) => {
    setMedicationsList(medicationsList.filter(item => item !== itemToRemove));
  };

  const handleAddDisease = () => {
    const nameTrimmed = diseaseNameInput.trim();
    const cycleVal = isCustomCycle ? customCycleInput.trim() : diseaseCycleInput;
    if (nameTrimmed && cycleVal) {
      const duplicate = regularDiseasesList.some(d => d.name === nameTrimmed);
      if (!duplicate) {
        setRegularDiseasesList([...regularDiseasesList, { name: nameTrimmed, cycle: cycleVal }]);
      }
      setDiseaseNameInput('');
      setIsCustomCycle(false);
      setDiseaseCycleInput('1개월');
      setCustomCycleInput('');
    }
  };

  const handleRemoveDisease = (nameToRemove: string) => {
    setRegularDiseasesList(regularDiseasesList.filter(d => d.name !== nameToRemove));
  };

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

  const handleResetAll = () => {
    setName('');
    setBreed('');
    setBirth('');
    setWeight('');
    setSpecies('dog');
    setCustomSpecies('');
    setWalkDuration('30분');
    setAllergiesList([]);
    setHospitalName('');
    setRegularDiseasesList([]);
    setMedicationsList([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      if (agreeLocation && agreePrivacy) {
        setStep(1);
      } else {
        showAlert('필수 약관에 모두 동의해주세요.');
      }
      return;
    }
    if (step === 1) {
      if (isStep1Valid) setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }

    try {
      const petSpecies = species === 'custom' ? customSpecies.trim() : species;
      const petData = {
        name: name.trim(),
        species: petSpecies,
        breed: breed.trim(),
        birth,
        weight: parseFloat(weight) || 0,
        image,
        hospitalName: hospitalName.trim() || undefined,
        allergies: allergiesList.map(s => s.trim()).filter(Boolean).join(','),
        medications: medicationsList.map(s => s.trim()).filter(Boolean).join(','),
        regularDiseases: JSON.stringify(regularDiseasesList.filter(d => d.name.trim() !== '')),
        walkDepartTime: walkDepartTime.trim() || undefined,
        walkTime: walkDepartTime ? `나가는 시간: ${walkDepartTime}` : undefined,
        walkGoal: walkDuration ? `${walkDuration}` : '30분',
        walkDuration: walkDuration ? `${walkDuration}` : '30분'
      };

      await addPet(petData);
      setSavedPets(prev => [...prev, { name: petData.name, species: petData.species, breed: petData.breed, birth: petData.birth, weight: petData.weight, image: petData.image }]);

      // Check if there are remaining pets to fill
      if (currentPetIndex + 1 < targetPetCount) {
        setCurrentPetIndex(prev => prev + 1);
        handleResetAll();
        setStep(1);
      } else {
        localStorage.setItem('isFirstRun', 'false');
        localStorage.setItem('isNotificationAgreed', agreeNotification ? 'true' : 'false');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      showAlert('등록 중 오류가 발생했습니다.');
    }
  };

  const getArchCoordinates = (index: number, total: number) => {
    const radius = 140;
    const startAngle = -60 * (Math.PI / 180);
    const endAngle = 60 * (Math.PI / 180);
    const angleStep = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + index * angleStep;

    const x = 160 + radius * Math.sin(angle);
    const y = 160 - radius * Math.cos(angle);
    const rotateDeg = angle * (180 / Math.PI);

    return { x, y, rotateDeg };
  };

  return (
    <div style={{ backgroundColor: colors.screenBg, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: window.innerWidth > 500 ? '10px 0' : '0', boxSizing: 'border-box', color: colors.textMain, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="onboarding-container" style={{ 
        height: window.innerWidth > 500 ? 'min(760px, 95vh)' : '100vh', 
        width: '100%',
        maxWidth: '500px', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: colors.screenBg, 
        overflow: 'hidden',
        position: 'relative',
        boxShadow: window.innerWidth > 500 ? '0 16px 48px rgba(0,0,0,0.04)' : 'none',
        borderRadius: window.innerWidth > 500 ? '24px' : '0px'
      }}>
      
      {/* 1. Header Indicators */}
      {step > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', margin: '10px 0 8px 0', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '20%', right: '20%', height: '2px', backgroundColor: colors.borderColor, zIndex: 1 }} />
          
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: step === 1 ? '46px' : '32px',
            height: step === 1 ? '46px' : '32px',
            borderRadius: '50%',
            backgroundColor: step === 1 ? colors.mainPrimary : '#EBEBE6',
            color: step === 1 ? 'white' : '#A2A29B',
            zIndex: 2,
            boxShadow: step === 1 ? '0 4px 10px rgba(92,113,94,0.2)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <Settings size={step === 1 ? 20 : 16} />
          </span>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: step === 2 ? '46px' : '32px',
            height: step === 2 ? '46px' : '32px',
            borderRadius: '50%',
            backgroundColor: step === 2 ? colors.mainPrimary : '#EBEBE6',
            color: step === 2 ? 'white' : '#A2A29B',
            zIndex: 2,
            boxShadow: step === 2 ? '0 4px 10px rgba(92,113,94,0.2)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <PawPrint size={step === 2 ? 20 : 16} />
          </span>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: step === 3 ? '46px' : '32px',
            height: step === 3 ? '46px' : '32px',
            borderRadius: '50%',
            backgroundColor: step === 3 ? colors.mainPrimary : '#EBEBE6',
            color: step === 3 ? 'white' : '#A2A29B',
            zIndex: 2,
            boxShadow: step === 3 ? '0 4px 10px rgba(92,113,94,0.2)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <Heart size={step === 3 ? 20 : 16} />
          </span>
        </div>
      )}

      <div className="onboarding-header" style={{ marginBottom: '8px', padding: '0 28px', flexShrink: 0, textAlign: 'left' }}>
        <h1 style={{ fontSize: '1.35rem', margin: '0', color: colors.textMain, fontWeight: 800, lineHeight: 1.3 }}>
          {step === 0 ? '서비스 이용을 위해\n약관에 동의해주세요.' : step === 1 ? '우리 아이의 프로필을\n설정해볼까요?' : step === 2 ? '우리 아이의 하루 일상은\n어떤가요?' : '우리 아이를 위해 더 챙겨야 할\n정보가 있나요?'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="onboarding-form" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 20px 10px 20px', 
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* STEP 0: Terms & Notifications Center Modal Overlay */}
          {step === 0 && (
            <OnboardingStep0Terms 
              agreeLocation={agreeLocation}
              setAgreeLocation={setAgreeLocation}
              agreePrivacy={agreePrivacy}
              setAgreePrivacy={setAgreePrivacy}
              agreeNotification={agreeNotification}
              setAgreeNotification={setAgreeNotification}
              onShowTermsModal={(type) => setShowTermsModal(type)}
              onConfirmTerms={() => setStep(1)}
              colors={colors}
              commonCardStyle={commonCardStyle}
            />
          )}

          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <OnboardingStep1Profile 
              targetPetCount={targetPetCount}
              savedPets={savedPets}
              currentPetIndex={currentPetIndex}
              name={name}
              setName={setName}
              species={species}
              setSpecies={setSpecies}
              customSpecies={customSpecies}
              setCustomSpecies={setCustomSpecies}
              breed={breed}
              setBreed={setBreed}
              birth={birth}
              setBirth={setBirth}
              weight={weight}
              setWeight={setWeight}
              image={image}
              showPetDropdown={showPetDropdown}
              setShowPetDropdown={setShowPetDropdown}
              showAutocomplete={showAutocomplete}
              setShowAutocomplete={setShowAutocomplete}
              filteredBreeds={filteredBreeds}
              nameError={nameError}
              birthError={birthError}
              weightError={weightError}
              getErrorStyle={getErrorStyle}
              handleImageChange={handleImageChange}
              handleResetAll={handleResetAll}
              setStep={setStep}
              setTargetPetCount={setTargetPetCount}
              setCurrentPetIndex={setCurrentPetIndex}
              colors={colors}
              commonCardStyle={commonCardStyle}
              commonInputStyle={commonInputStyle}
            />
          )}

          {/* STEP 2: Routine */}
          {step === 2 && (
            <OnboardingStep2Routine 
              walkDuration={walkDuration}
              setWalkDuration={setWalkDuration}
              walkDepartTime={walkDepartTime}
              onOpenTimePicker={() => setShowWalkTimePickerModal(true)}
              getArchCoordinates={getArchCoordinates}
              colors={colors}
              commonCardStyle={commonCardStyle}
            />
          )}

          {/* STEP 3: Health & Special Info */}
          {step === 3 && (
            <OnboardingStep3Health 
              allergiesList={allergiesList}
              setAllergiesList={setAllergiesList}
              allergyInput={allergyInput}
              setAllergyInput={setAllergyInput}
              medicationsList={medicationsList}
              medInput={medInput}
              setMedInput={setMedInput}
              regularDiseasesList={regularDiseasesList}
              diseaseNameInput={diseaseNameInput}
              setDiseaseNameInput={setDiseaseNameInput}
              diseaseCycleInput={diseaseCycleInput}
              setDiseaseCycleInput={setDiseaseCycleInput}
              isCustomCycle={isCustomCycle}
              setIsCustomCycle={setIsCustomCycle}
              customCycleInput={customCycleInput}
              setCustomCycleInput={setCustomCycleInput}
              diseaseSearchResults={diseaseSearchResults}
              setDiseaseSearchResults={setDiseaseSearchResults}
              hospitalName={hospitalName}
              setHospitalName={setHospitalName}
              handleAddAllergy={handleAddAllergy}
              handleRemoveAllergy={handleRemoveAllergy}
              handleAddMedication={handleAddMedication}
              handleRemoveMedication={handleRemoveMedication}
              handleAddDisease={handleAddDisease}
              handleRemoveDisease={handleRemoveDisease}
              colors={colors}
              commonCardStyle={commonCardStyle}
              commonInputStyle={commonInputStyle}
            />
          )}
        </div>

        {/* 5. Cozy Option Actions bottom controls */}
        {!isGlobalTourActive && (
          <div className="onboarding-footer" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto 8px auto',
            padding: '0 20px',
            boxSizing: 'border-box',
            zIndex: 10,
            flexShrink: 0
          }}>
            
            {step > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleResetAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                  </svg>
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              {step > 0 && (
                <button 
                  type="button" 
                  className="btn-submit" 
                  onClick={() => {
                    if (step === 1) {
                      setStep(0);
                    } else if (step > 1) {
                      setStep(step - 1);
                    }
                  }}
                  style={{ 
                    flex: 1,
                    height: '48px',
                    backgroundColor: colors.grayButton, 
                    color: 'white',
                    borderRadius: '14px',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    margin: 0
                  }}
                >
                  이전
                </button>
              )}
              
              {step === 0 ? (
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={!agreeLocation || !agreePrivacy}
                  style={{ 
                    flex: 1,
                    height: '48px',
                    backgroundColor: (!agreeLocation || !agreePrivacy) ? '#D0D0D0' : colors.mainPrimary, 
                    color: 'white',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: (!agreeLocation || !agreePrivacy) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1px',
                    boxShadow: (!agreeLocation || !agreePrivacy) ? 'none' : '0 4px 12px rgba(92,113,94,0.25)',
                    margin: 0,
                    width: '100%'
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>동의하고 계속하기</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.85 }}>프로필 작성 단계로 이동</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={step === 1 && !isStep1Valid}
                  style={{ 
                    flex: 1.2,
                    height: '48px',
                    backgroundColor: (step === 1 && !isStep1Valid) ? '#D0D0D0' : colors.mainPrimary, 
                    color: 'white',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: (step === 1 && !isStep1Valid) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1px',
                    boxShadow: (step === 1 && !isStep1Valid) ? 'none' : '0 4px 12px rgba(92,113,94,0.25)',
                    margin: 0
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    {step === 3 
                      ? (currentPetIndex + 1 < targetPetCount ? '다음 아이 작성' : '등록 완료') 
                      : '다음'}
                  </span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.85 }}>
                    {step === 3 
                      ? (currentPetIndex + 1 < targetPetCount 
                          ? `${currentPetIndex + 1}/${targetPetCount}번째 아이 완료 > 다음 작성` 
                          : `총 ${savedPets.length + 1}마리 등록 > 온다 시작`) 
                      : '다음 단계로 이동'}
                  </span>
                </button>
              )}
            </div>

          </div>
        )}
      </form>

      {/* Image Crop Modal */}
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

      {/* Terms Modal */}
      <OnboardingTermsModal 
        showTermsModal={showTermsModal}
        onClose={() => setShowTermsModal(null)}
        colors={colors}
      />

      {/* Walk Time Picker Scroll Wheel Modal */}
      {showWalkTimePickerModal && (
        <ScrollTimePickerModal
          title="산책 출발 시각 설정"
          onConfirm={(formattedTime) => {
            setWalkDepartTime(formattedTime);
            setShowWalkTimePickerModal(false);
          }}
          onCancel={() => setShowWalkTimePickerModal(false)}
          primaryColor={colors.mainPrimary}
          textColor={colors.textMain}
          mutedColor={colors.textMuted}
        />
      )}

      </div>
    </div>
  );
};

export default Onboarding;
