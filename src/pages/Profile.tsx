import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import { 
  User, 
  Stethoscope, 
  Footprints, 
  Camera, 
  Plus, 
  Save, 
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { BasicCareForm } from '../components/profile/BasicCareForm';
import { DailyCareForm } from '../components/profile/DailyCareForm';
import { SpecialCareForm } from '../components/profile/SpecialCareForm';

const Profile: React.FC = () => {
  const location = useLocation();
  const { pets, activePetId, addPet, updatePet, deletePet, showAlert, showConfirm } = usePetStore();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(activePetId);
  const [expandedPanel, setExpandedPanel] = useState<string | null>('basic');

  // Form states
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [customSpecies, setCustomSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [allergiesList, setAllergiesList] = useState<string[]>(['']);
  const [medicationsList, setMedicationsList] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');


  const [regularDiseasesList, setRegularDiseasesList] = useState<{ name: string; cycle: string; }[]>([{ name: '', cycle: '1개월' }]);


  const [walkTime, setWalkTime] = useState('');
  const [walkGoal, setWalkGoal] = useState('30분');
  const [image, setImage] = useState('/default_paw.png');

  // Check query params to force new pet add mode or select specific pet
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setSelectedPetId(null);
    } else {
      const idParam = params.get('id');
      if (idParam) {
        setSelectedPetId(idParam);
      } else {
        setSelectedPetId(activePetId);
      }
    }
  }, [location.search, activePetId]);

  // Load selected pet details into form
  useEffect(() => {
    if (selectedPetId) {
      const pet = pets.find(p => p.id === selectedPetId);
      if (pet) {
        setName(pet.name || '');
        const isPreset = ['dog', 'cat'].includes(pet.species || '');
        if (pet.species) {
          if (isPreset) {
            setSpecies(pet.species);
            setCustomSpecies('');
          } else {
            setSpecies('custom');
            setCustomSpecies(pet.species);
          }
        } else {
          setSpecies('dog');
          setCustomSpecies('');
        }
        setBreed(pet.breed || '');
        setBirth(pet.birth || '');
        setWeight(pet.weight ? String(pet.weight) : '');
        setHospitalName(pet.hospitalName || '');
        setAllergiesList(pet.allergies ? pet.allergies.split(',').map(s => s.trim()) : ['']);
        setMedicationsList(pet.medications ? pet.medications.split(',').map(s => s.trim()) : ['']);
        if (pet.regularDiseases) {
          try {
            setRegularDiseasesList(JSON.parse(pet.regularDiseases));
          } catch {
            setRegularDiseasesList([{ name: '', cycle: '1개월' }]);
          }
        } else {
          setRegularDiseasesList([{ name: '', cycle: '1개월' }]);
        }
        setNotes(pet.notes || '');
        setImage(pet.image || '/default_paw.png');
        setWalkTime(pet.walkTime || '');
        setWalkGoal(pet.walkGoal || pet.walkDuration || '30분');
      }
    } else {
      // Clear form for new pet
      setName('');
      setSpecies('dog');
      setCustomSpecies('');
      setBreed('');
      setBirth('');
      setWeight('');
      setHospitalName('');
      setAllergiesList(['']);
      setMedicationsList(['']);
      setRegularDiseasesList([{ name: '', cycle: '1개월' }]);
      setNotes('');
      setImage('/default_paw.png');
      setWalkTime('');
      setWalkGoal('30분');
    }
  }, [selectedPetId, pets]);


  // Calculate age string from birth date
  const calculateAgeStr = (birthDateStr: string) => {
    if (!birthDateStr) return '생일 미설정';
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return '생일 미설정';

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years <= 0 && months <= 0) return '0개월 (아가)';
    if (years <= 0) return `${months}개월`;
    if (months === 0) return `${years}살`;
    return `${years}살 ${months}개월`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWeightAdjust = (delta: number) => {
    const currentNum = parseFloat(weight) || 0;
    const updated = Math.max(0, parseFloat((currentNum + delta).toFixed(1)));
    setWeight(String(updated));
  };

  const toggleAllergyPreset = (label: string) => {
    const cleanLabel = label.split(' ')[0]; // Extract text part
    if (cleanLabel === '없음') {
      setAllergiesList(['없음']);
      return;
    }

    const currentList = allergiesList.filter(Boolean);
    if (currentList.includes(cleanLabel)) {
      const filtered = currentList.filter(item => item !== cleanLabel);
      setAllergiesList(filtered.length === 0 ? [''] : filtered);
    } else {
      const filtered = currentList.filter(item => item !== '없음');
      // 첫 번째 빈 필드가 있다면 거기에 넣고, 없다면 새로 푸시
      const emptyIdx = allergiesList.findIndex(x => !x.trim());
      if (emptyIdx > -1) {
        const next = [...allergiesList];
        next[emptyIdx] = cleanLabel;
        setAllergiesList(next.filter(item => item !== '없음'));
      } else {
        setAllergiesList([...filtered, cleanLabel]);
      }
    }
  };

  const togglePersonalityTag = (tag: string) => {
    const currentList = notes ? notes.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (currentList.includes(tag)) {
      const filtered = currentList.filter(item => item !== tag);
      setNotes(filtered.join(', '));
    } else {
      currentList.push(tag);
      setNotes(currentList.join(', '));
    }
  };

  const handleDeletePet = () => {
    if (!selectedPetId) return;
    const targetPet = pets.find(p => p.id === selectedPetId);
    const petName = targetPet ? targetPet.name : '반려동물';
    showConfirm(
      `'${petName}' 프로필을 완전히 삭제하시겠습니까?\n관련 데이터가 삭제됩니다.`,
      '프로필 삭제 확인',
      async () => {
        await deletePet(selectedPetId);
        showAlert(`'${petName}' 프로필이 삭제되었습니다.`);
      }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('반려동물 이름을 입력해 주세요.');
      return;
    }
    if (species === 'custom' && !customSpecies.trim()) {
      showAlert('동물 종류를 입력해 주세요.');
      return;
    }
    if (!breed.trim()) {
      showAlert('품종을 입력해 주세요.');
      return;
    }

    try {
      const petSpecies = species === 'custom' ? customSpecies.trim() : species;
      const petData = {
        name: name.trim(),
        species: petSpecies,
        breed: breed.trim(),
        birth: birth,
        weight: parseFloat(weight) || 0,
        hospitalName: hospitalName.trim(),
        allergies: allergiesList.map(s => s.trim()).filter(Boolean).join(','),
        medications: medicationsList.map(s => s.trim()).filter(Boolean).join(','),
        regularDiseases: JSON.stringify(regularDiseasesList.filter(d => d.name.trim() !== '')),
        notes: notes.trim(),
        walkTime: walkTime.trim(),
        walkGoal: walkGoal,
        walkDuration: walkGoal,
        image
      };

      if (selectedPetId) {
        // Update existing pet
        await updatePet({
          ...petData,
          id: selectedPetId
        });
        showAlert('프로필 정보가 성공적으로 업데이트되었습니다!');
      } else {
        // Create new pet
        const newPet = await addPet(petData);
        setSelectedPetId(newPet.id);
        showAlert('새로운 반려동물 프로필이 생성되었습니다!');
      }
    } catch (err) {
      console.error(err);
      showAlert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="onda-page-container">
      
      {/* 1. Header Title & Sub-Chips */}
      <div style={{ textAlign: 'left', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
          마이펫 관리
        </h1>
        <div className="horizontal-scroll-chips">
          <button type="button" className="onda-chip-tab active">
            <span>체중</span>
          </button>
          <button type="button" className="onda-chip-tab">
            <span>예방접종</span>
          </button>
          <button type="button" className="onda-chip-tab">
            <span>건강 상태</span>
          </button>
        </div>
      </div>

      {/* 2. Pet Cards List Matching Reference Mockup */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            반려동물 목록 ({pets.length})
          </span>
        </div>

        {pets.map((pet, idx) => {
          const isSelected = pet.id === selectedPetId;
          const isMain = pet.id === activePetId || idx === 0;

          return (
            <div 
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className="onda-card onda-card-interactive"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: isSelected ? '2px solid var(--main-primary)' : '1px solid var(--onda-border-light)',
                backgroundColor: isSelected ? '#FCFAF7' : '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src={pet.image || '/default_paw.png'} 
                  alt={pet.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--main-primary-light)' }}
                  onError={(e) => { e.currentTarget.src = '/default_paw.png' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {pet.name}
                    </span>
                    {isMain && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--main-primary)', backgroundColor: 'var(--main-primary-light)', padding: '2px 8px', borderRadius: '10px' }}>
                        Main
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {pet.breed || '품종 미설정'} {pet.weight ? `(${pet.weight}kg)` : ''}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: 'var(--main-primary)', fontWeight: 800 }}>›</span>
            </div>
          );
        })}

        <button 
          type="button"
          onClick={() => setSelectedPetId(null)}
          style={{
            width: '100%',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#FCFAF7',
            border: '1.5px dashed var(--main-primary)',
            color: 'var(--main-primary)',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} />
          <span>새로운 펫 추가</span>
        </button>
      </div>

      {/* 3. Simple Visual Profile Avatar Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', position: 'relative' }}>
        <input 
          type="file" 
          id="profile-upload-file" 
          accept="image/*" 
          onChange={handleImageChange}
          style={{ display: 'none' }} 
        />
        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
          <img 
            src={image} 
            alt="Profile Preview" 
            onClick={() => document.getElementById('profile-upload-file')?.click()}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2.5px solid var(--border-color)',
              objectFit: 'cover',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          />
          <button 
            type="button"
            onClick={() => document.getElementById('profile-upload-file')?.click()}
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              backgroundColor: 'var(--main-primary)',
              color: 'white',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '2px solid var(--card-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <Camera size={13} />
          </button>
        </div>
        {selectedPetId && (
          <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {name} • {breed || '품종 미설정'} • {calculateAgeStr(birth)}
          </p>
        )}
      </div>

      {/* 4. Accordion Form Container */}
      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* PANEL 1: Basic Care Accordion (기본) */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedPanel === 'basic' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedPanel === 'basic' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedPanel(expandedPanel === 'basic' ? null : 'basic')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedPanel === 'basic' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedPanel === 'basic' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <User size={20} style={{ color: 'var(--icon-color)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>일반 케어 설정 (기본)</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>이름, 종류, 품종, 생일, 몸무게 등 기본 프로필 설정</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedPanel === 'basic' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateRows: expandedPanel === 'basic' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedPanel === 'basic' ? 1 : 0,
            visibility: expandedPanel === 'basic' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <BasicCareForm
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
                calculateAgeStr={calculateAgeStr}
                handleWeightAdjust={handleWeightAdjust}
              />
            </div>
          </div>
        </div>

        {/* PANEL 2: Daily Care Accordion (케어 1) */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedPanel === 'care1' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedPanel === 'care1' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedPanel(expandedPanel === 'care1' ? null : 'care1')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedPanel === 'care1' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedPanel === 'care1' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <Footprints size={20} style={{ color: 'var(--icon-color)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>일상 케어 설정 (케어 1)</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>산책 루틴 설정 및 식이/알레르기 유발 요소 관리</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedPanel === 'care1' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateRows: expandedPanel === 'care1' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedPanel === 'care1' ? 1 : 0,
            visibility: expandedPanel === 'care1' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <DailyCareForm
                walkGoal={walkGoal}
                setWalkGoal={setWalkGoal}
                walkTime={walkTime}
                setWalkTime={setWalkTime}
                allergiesList={allergiesList}
                setAllergiesList={setAllergiesList}
                toggleAllergyPreset={toggleAllergyPreset}
              />
            </div>
          </div>
        </div>

        {/* PANEL 3: Special Care Accordion (케어 2) */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedPanel === 'care2' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedPanel === 'care2' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedPanel(expandedPanel === 'care2' ? null : 'care2')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedPanel === 'care2' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedPanel === 'care2' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <Stethoscope size={20} style={{ color: 'var(--icon-color)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>특별 케어 설정 (케어 2)</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>주기적 질병 치료/정기검진, 상시 복용약, 성격 및 특이사항</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedPanel === 'care2' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateRows: expandedPanel === 'care2' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedPanel === 'care2' ? 1 : 0,
            visibility: expandedPanel === 'care2' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <SpecialCareForm
                hospitalName={hospitalName}
                setHospitalName={setHospitalName}
                regularDiseasesList={regularDiseasesList}
                setRegularDiseasesList={setRegularDiseasesList}
                medicationsList={medicationsList}
                setMedicationsList={setMedicationsList}
                notes={notes}
                setNotes={setNotes}
                togglePersonalityTag={togglePersonalityTag}
              />
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          {selectedPetId && (
            <button
              type="button"
              onClick={handleDeletePet}
              style={{
                padding: '14px 18px',
                borderRadius: '16px',
                backgroundColor: '#FEF2F2',
                color: '#EF4444',
                border: '1.5px solid #FCA5A5',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 size={18} />
              <span>삭제</span>
            </button>
          )}

          <button
            type="submit"
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--main-primary)',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <Save size={18} />
            <span>{selectedPetId ? '프로필 변경사항 저장' : '새 프로필 등록하기'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;
