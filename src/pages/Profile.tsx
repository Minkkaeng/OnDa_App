import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileCard } from '../components/ProfileCard';
import { usePetStore } from '../store/petStore';
import defaultLogo from '../assets/logo.png';

const Profile: React.FC = () => {
  const location = useLocation();
  const { pets, activePetId, addPet, updatePet } = usePetStore();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(activePetId);

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
  const [walkGoal, setWalkGoal] = useState('');
  const [image, setImage] = useState(defaultLogo);

  // Check query params to force new pet add mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setSelectedPetId(null);
    } else {
      setSelectedPetId(activePetId);
    }
  }, [location.search, activePetId]);

  // Load selected pet details into form
  useEffect(() => {
    if (selectedPetId) {
      const pet = pets.find(p => p.id === selectedPetId);
      if (pet) {
        setName(pet.name);
        setBreed(pet.breed);
        setBirth(pet.birth);
        setWeight(String(pet.weight));
        setHospitalName(pet.hospitalName || '');
        setAllergies(pet.allergies || '');
        setMedications(pet.medications || '');
        setNotes(pet.notes || '');
        setImage(pet.image || defaultLogo);
        setWalkTime(pet.walkTime || '');
        setWalkGoal(pet.walkGoal || '');
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
      setImage(defaultLogo);
      setWalkTime('');
      setWalkGoal('');
    }
  }, [selectedPetId, pets]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      const petData = {
        name,
        breed,
        birth,
        weight: parseFloat(weight) || 0,
        hospitalName,
        allergies,
        medications,
        notes,
        walkTime,
        walkGoal,
        image
      };

      if (selectedPetId) {
        // Update existing pet
        await updatePet({
          ...petData,
          id: selectedPetId
        });
        alert('프로필이 성공적으로 수정되었습니다.');
      } else {
        // Create new pet
        const newPet = await addPet(petData);
        setSelectedPetId(newPet.id);
        alert('새로운 반려동물 프로필이 생성되었습니다!');
      }
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <ProfileCard />
      <div className="profile-cards-wrapper" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <h2 className="section-title" style={{ marginBottom: '24px' }}>프로필 설정</h2>
        
        {/* Pet Tabs List */}
        <div className="pet-list-scroll" id="pet-tabs-container" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
          {pets.map(pet => (
            <img 
              key={pet.id}
              src={pet.image} 
              className={`pet-tab ${pet.id === selectedPetId ? 'active' : ''}`} 
              onClick={() => setSelectedPetId(pet.id)}
              alt={pet.name} 
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: pet.id === selectedPetId ? '3px solid var(--mint-green)' : '3px solid transparent', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
            />
          ))}
          <div 
            className={`pet-tab-add ${selectedPetId === null ? 'active' : ''}`} 
            onClick={() => setSelectedPetId(null)}
            style={{ width: '60px', height: '60px', borderRadius: '50%', border: selectedPetId === null ? '3px solid var(--mint-green)' : '3px dashed var(--steel-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer', color: 'var(--muted-gray)' }}
          >
            +
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Left Card: Basic Info */}
            <div className="panel profile-left">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', alignItems: 'center' }}>
                <input 
                  type="file" 
                  id="profile-upload" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ display: 'none' }} 
                />
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <img 
                    src={image} 
                    id="profile-img-preview" 
                    alt="Profile" 
                    onClick={() => document.getElementById('profile-upload')?.click()}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--mint-green)', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }} 
                    title="클릭하여 프로필 이미지 변경" 
                  />
                  <button 
                    type="button"
                    onClick={() => document.getElementById('profile-upload')?.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--mint-green)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', padding: 0 }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px', marginBottom: '2px' }}>
                      <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">반려동물 이름</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">품종</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={breed} 
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="예: 토이 푸들" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">생일 (입양일)</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={birth} 
                  onChange={(e) => setBirth(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">체중 (kg)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  step="0.1" 
                  placeholder="예: 4.2" 
                  required
                />
              </div>
            </div>
            
            {/* Right Card: Medical Info */}
            <div className="panel profile-right" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--mint-green)', marginTop: 0 }}>의료 및 추가 정보</h3>
              
              <div className="form-group">
                <label className="form-label">자주 가는 병원</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={hospitalName} 
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="예: 튼튼동물병원" 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">알레르기 정보</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={allergies} 
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="예: 닭고기, 먼지" 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">투약 중인 약</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={medications} 
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="예: 심장사상충 예방약" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">산책 설정 (시간 및 목표)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={walkTime} 
                    onChange={(e) => setWalkTime(e.target.value)}
                    placeholder="예: 오후 07:00 지정" 
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    value={walkGoal} 
                    onChange={(e) => setWalkGoal(e.target.value)}
                    placeholder="예: 30분 정기 목표 설정" 
                  />
                </div>
              </div>

              <div className="form-group" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="form-label">기타 특이사항</label>
                <textarea 
                  className="form-input" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ flexGrow: 1, resize: 'none', minHeight: '120px' }} 
                  placeholder="기타 특이사항, 성격 등을 자유롭게 작성해주세요."
                ></textarea>
              </div>
            </div>
          </div>
          
          <button type="submit" className="btn-submit" style={{ marginTop: '32px' }}>프로필 저장</button>
        </form>
      </div>
    </>
  );
};

export default Profile;
