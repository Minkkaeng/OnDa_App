import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePetStore } from '../store/petStore';

const SPECIES_PRESETS: Record<string, { label: string; breeds: string[] }> = {
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
import { 
  User, 
  Stethoscope, 
  Footprints, 
  FileText, 
  Camera, 
  Plus, 
  Save, 
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

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
  const [expandedPanel, setExpandedPanel] = useState<string | null>('basic');

  // Form states
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [customSpecies, setCustomSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
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
        const isPreset = ['dog', 'cat', 'hamster', 'rabbit', 'reptile'].includes(pet.species || '');
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
      setSpecies('dog');
      setCustomSpecies('');
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
        
        {/* PANEL 1: Basic Info Accordion */}
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
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>기본 정보 설정</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>반려동물 이름, 품종, 생년월일, 몸무게 입력</p>
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
                    <option value="small_mammal">설치류 및 소형 포유류</option>
                    <option value="bird">조류</option>
                    <option value="reptile">파충류</option>
                    <option value="amphibian">양서류</option>
                    <option value="fish">어류</option>
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
            </div>
          </div>
        </div>

        {/* PANEL 2: Health & Medical Accordion */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedPanel === 'health' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedPanel === 'health' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedPanel(expandedPanel === 'health' ? null : 'health')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedPanel === 'health' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedPanel === 'health' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <Stethoscope size={20} style={{ color: 'var(--icon-color)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>의료 및 건강 케어</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>다니는 병원, 식이 알레르기, 정기 복용약</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedPanel === 'health' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateRows: expandedPanel === 'health' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedPanel === 'health' ? 1 : 0,
            visibility: expandedPanel === 'health' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
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
                      backgroundColor: 'var(--screen-bg)',
                      color: 'var(--text-main)'
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
                      backgroundColor: 'var(--screen-bg)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: Walk & Care Routine Accordion */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedPanel === 'routine' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedPanel === 'routine' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedPanel(expandedPanel === 'routine' ? null : 'routine')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedPanel === 'routine' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedPanel === 'routine' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <Footprints size={20} style={{ color: 'var(--icon-color)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>산책 & 케어 루틴</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>일일 산책 목표, 주로 선호하는 산책 시간</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedPanel === 'routine' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateRows: expandedPanel === 'routine' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedPanel === 'routine' ? 1 : 0,
            visibility: expandedPanel === 'routine' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
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
                      backgroundColor: 'var(--screen-bg)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* PANEL 4: Personality & Notes Accordion */}
        <div className="panel" style={{ 
          padding: '0', 
          overflow: 'hidden', 
          border: expandedPanel === 'notes' ? '1.5px solid var(--main-primary)' : '1.5px solid var(--border-color)', 
          borderRadius: '16px',
          boxShadow: expandedPanel === 'notes' ? 'inset 0 2px 4px rgba(74,59,50,0.05)' : '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all 0.25s ease'
        }}>
          <div 
            onClick={() => setExpandedPanel(expandedPanel === 'notes' ? null : 'notes')}
            style={{ 
              padding: '18px 20px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between', 
              cursor: 'pointer',
              backgroundColor: expandedPanel === 'notes' ? 'var(--butter-cream)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: expandedPanel === 'notes' ? 'var(--card-bg)' : 'var(--butter-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--icon-color)',
                flexShrink: 0
              }}>
                <FileText size={20} style={{ color: 'var(--icon-color)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>성격 및 자유 특이사항</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>아이의 성격 키워드 칩 지정 및 주의사항 메모</p>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {expandedPanel === 'notes' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateRows: expandedPanel === 'notes' ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out, visibility 0.35s',
            opacity: expandedPanel === 'notes' ? 1 : 0,
            visibility: expandedPanel === 'notes' ? 'visible' : 'hidden'
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
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
