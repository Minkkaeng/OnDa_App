import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePetStore } from '../store/petStore';
import { 
  User, 
  Stethoscope, 
  Footprints, 
  FileText, 
  Camera, 
  Sparkles, 
  Plus, 
  Scale, 
  ShieldAlert,
  Save,
  Trash2
} from 'lucide-react';

const COMMON_BREEDS = [
  '토이 푸들', '말티즈', '포메라니안', '비숑 프리제', 
  '시바견', '골든 리트리버', '치와와', '코리안 숏헤어', '믹스견'
];

const ALLERGY_PRESETS = [
  { id: 'chicken', label: '닭고기' },
  { id: 'beef', label: '소고기' },
  { id: 'pork', label: '돼지고기' },
  { id: 'egg', label: '계란/유제품' },
  { id: 'dust', label: '먼지/꽃가루' },
  { id: 'none', label: '없음' }
];

const PERSONALITY_TAGS = [
  '활발함', '얌전함', '호기심왕', '겁쟁이', 
  '식탐왕', '애교쟁이', '사회성만점', '사람좋아'
];

const WALK_GOAL_OPTIONS = ['15분', '30분', '45분', '60분', '90분'];

const Profile: React.FC = () => {
  const location = useLocation();
  const { pets, activePetId, addPet, updatePet, deletePet, showAlert, showConfirm } = usePetStore();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(activePetId);
  const [activeTab, setActiveTab] = useState<'basic' | 'health' | 'routine' | 'notes'>('basic');

  // Form states
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birth, setBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');
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
        setBreed(pet.breed || '');
        setBirth(pet.birth || '');
        setWeight(pet.weight ? String(pet.weight) : '');
        setHospitalName(pet.hospitalName || '');
        setAllergies(pet.allergies || '');
        setMedications(pet.medications || '');
        setNotes(pet.notes || '');
        setImage(pet.image || '/default_paw.png');
        setWalkTime(pet.walkTime || '');
        setWalkGoal(pet.walkGoal || pet.walkDuration || '30분');
      }
    } else {
      // Clear form for new pet
      setName('');
      setBreed('');
      setBirth('');
      setWeight('');
      setHospitalName('');
      setAllergies('');
      setMedications('');
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
      setAllergies('없음');
      return;
    }
    const currentList = allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (currentList.includes(cleanLabel)) {
      const filtered = currentList.filter(item => item !== cleanLabel);
      setAllergies(filtered.join(', '));
    } else {
      const filtered = currentList.filter(item => item !== '없음');
      filtered.push(cleanLabel);
      setAllergies(filtered.join(', '));
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

    try {
      const petData = {
        name: name.trim(),
        breed: breed.trim(),
        birth: birth,
        weight: parseFloat(weight) || 0,
        hospitalName: hospitalName.trim(),
        allergies: allergies.trim(),
        medications: medications.trim(),
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
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '4px 8px 32px 8px' }}>
      
      {/* 1. Pet Switcher Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            프로필 설정 <Sparkles size={20} color="var(--main-primary)" />
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {selectedPetId ? '아이의 상세 정보 및 건강 케어 카드' : '새 반려동물 등록하기'}
          </p>
        </div>
      </div>

      {/* 2. Interactive Pet Carousel Tabs */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        {pets.map(pet => {
          const isSelected = pet.id === selectedPetId;
          return (
            <div 
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px 6px 8px',
                borderRadius: '30px',
                backgroundColor: isSelected ? 'var(--butter-cream)' : 'var(--card-bg)',
                border: isSelected ? '1px solid var(--main-primary)' : '1px solid var(--border-color)',
                boxShadow: isSelected ? '0 4px 12px rgba(13, 148, 136, 0.15), inset 0 0 0 1px var(--main-primary)' : 'none',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              <img 
                src={pet.image || '/default_paw.png'} 
                alt={pet.name} 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = '/default_paw.png' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? 'var(--main-primary)' : 'var(--text-main)' }}>
                  {pet.name}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {pet.breed || '미설정'}
                </span>
              </div>
            </div>
          );
        })}

        <div 
          onClick={() => setSelectedPetId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '30px',
            backgroundColor: selectedPetId === null ? 'var(--main-primary)' : 'var(--card-bg)',
            color: selectedPetId === null ? 'white' : 'var(--text-muted)',
            border: selectedPetId === null ? '1px solid var(--main-primary)' : '1px dashed var(--border-color)',
            boxShadow: selectedPetId === null ? 'inset 0 0 0 1px var(--main-primary)' : 'none',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}
        >
          <Plus size={16} />
          <span>추가</span>
        </div>
      </div>

      {/* 3. Hero Visual Profile Banner Card */}
      <div 
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--main-primary) 0%, #115E59 100%)',
          color: 'white',
          padding: '24px 20px',
          boxShadow: '0 12px 28px rgba(13, 148, 136, 0.25)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Subtle Background Glow Circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', filter: 'blur(10px)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '140px', height: '140px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', filter: 'blur(15px)' }} />

        {/* Avatar Uploader */}
        <input 
          type="file" 
          id="profile-upload-file" 
          accept="image/*" 
          onChange={handleImageChange}
          style={{ display: 'none' }} 
        />
        <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '14px', zIndex: 2 }}>
          <img 
            src={image} 
            alt="Profile Preview" 
            onClick={() => document.getElementById('profile-upload-file')?.click()}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '3.5px solid white',
              objectFit: 'cover',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}
          />
          <button 
            type="button"
            onClick={() => document.getElementById('profile-upload-file')?.click()}
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              backgroundColor: '#F59E0B',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2.5px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              padding: 0
            }}
          >
            <Camera size={16} />
          </button>
        </div>

        {/* Hero Name & Info Summary */}
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px', zIndex: 2 }}>
          {name || '새 반려동물'}
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', opacity: 0.9, fontWeight: 600, zIndex: 2 }}>
          {breed || '품종 미설정'} • {calculateAgeStr(birth)}
        </p>

        {/* Quick Live Stats Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={14} />
            <span>{weight ? `${weight} kg` : '체중 미설정'}</span>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Footprints size={14} />
            <span>{walkGoal || '30분'} 목표</span>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={14} />
            <span>알레르기: {allergies || '없음'}</span>
          </div>
        </div>
      </div>

      {/* 4. Segmented Section Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'var(--border-color)', padding: '4px', borderRadius: '16px', marginBottom: '20px' }}>
        {[
          { id: 'basic', label: '기본 정보', icon: User },
          { id: 'health', label: '의료 & 건강', icon: Stethoscope },
          { id: 'routine', label: '산책 루틴', icon: Footprints },
          { id: 'notes', label: '특이사항', icon: FileText }
        ].map(t => {
          const IconComp = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 4px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isActive ? 'var(--card-bg)' : 'transparent',
                color: isActive ? 'var(--main-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.8rem',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <IconComp size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Form Body */}
      <form onSubmit={handleSaveProfile}>
        <div className="panel" style={{ padding: '20px', borderRadius: '20px', borderTop: '4px solid var(--main-primary)', boxShadow: 'var(--shadow-card)' }}>

          {/* TAB 1: Basic Information */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={18} color="var(--main-primary)" /> 기본 프로필 입력
              </h4>

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
                    backgroundColor: 'var(--screen-bg)'
                  }}
                />
              </div>

              {/* Breed Input + Preset Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>품종</label>
                <input 
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="직접 입력하거나 아래 칩을 선택하세요"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: 'var(--screen-bg)'
                  }}
                />
                {/* Breed Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {COMMON_BREEDS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBreed(b)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: breed === b ? '1px solid var(--main-primary)' : '1px solid var(--border-color)',
                        boxShadow: breed === b ? 'inset 0 0 0 0.5px var(--main-primary)' : 'none',
                        backgroundColor: breed === b ? 'var(--butter-cream)' : 'var(--card-bg)',
                        color: breed === b ? 'var(--main-primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
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
                    backgroundColor: 'var(--screen-bg)'
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
                      backgroundColor: 'var(--screen-bg)'
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
          )}

          {/* TAB 2: Health & Medical */}
          {activeTab === 'health' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={18} color="var(--main-primary)" /> 의료 및 건강 케어 정보
              </h4>

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
                    backgroundColor: 'var(--screen-bg)'
                  }}
                />
              </div>

              {/* Allergy Information + One-Touch Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>알레르기 식이/환경 요소</label>
                <input 
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="직접 입력하거나 아래 칩을 눌러 조합하세요"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: 'var(--screen-bg)'
                  }}
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ALLERGY_PRESETS.map(ap => {
                    const cleanLabel = ap.label.split(' ')[0];
                    const isSelected = allergies.includes(cleanLabel);
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

              {/* Regular Medication / Supplements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>정기 복용약 및 영양제</label>
                <input 
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="예: 심장사상충 매월 1일, 유산균 매일 아침"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: 'var(--screen-bg)'
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Walk & Care Routine */}
          {activeTab === 'routine' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Footprints size={18} color="var(--main-primary)" /> 산책 & 데일리 케어 루틴
              </h4>

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
                    backgroundColor: 'var(--screen-bg)'
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: Personality & Notes */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={18} color="var(--main-primary)" /> 성격 태그 & 자유 특이사항
              </h4>

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
                    resize: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Button Row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
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

        </div>
      </form>
    </div>
  );
};

export default Profile;
