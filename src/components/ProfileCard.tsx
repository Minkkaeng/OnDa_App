import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/petStore';

export const ProfileCard: React.FC = () => {
  const navigate = useNavigate();
  const { pets, activePetId, setActivePetId } = usePetStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (!activePet) {
    return (
      <div className="global-profile-card">
        <div className="global-profile-info">
          <h3>등록된 반려동물이 없습니다.</h3>
        </div>
        <button 
          className="global-profile-switch-btn"
          onClick={() => navigate('/onboarding')}
        >
          등록하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="global-profile-card" ref={dropdownRef}>
      <div className="global-profile-content">
        <img src={activePet.image} alt="프로필 사진" className="global-profile-avatar" />
        <div className="global-profile-info">
          <h3>{activePet.name}</h3>
          <div className="global-profile-meta">
            <span>🐾 {activePet.breed}</span>
            <span>🎂 {activePet.birth}</span>
            <span>⚖️ {activePet.weight}kg</span>
          </div>
        </div>
      </div>
      
      <button 
        className="global-profile-switch-btn" 
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen(!dropdownOpen);
        }}
      >
        프로필 변경 ▾
      </button>
      
      <div className={`global-profile-dropdown ${dropdownOpen ? 'open' : ''}`}>
        {pets.map(pet => (
          <div 
            key={pet.id} 
            className="dropdown-item pet-select-item" 
            onClick={() => {
              setActivePetId(pet.id);
              setDropdownOpen(false);
            }}
          >
            <img src={pet.image} alt={pet.name} className="dropdown-avatar" />
            <span className="dropdown-name">{pet.name}</span>
          </div>
        ))}
        <div 
          className="dropdown-item dropdown-edit-btn" 
          onClick={() => {
            setDropdownOpen(false);
            navigate(`/profile?id=${activePet.id}`);
          }}
          style={{ justifyContent: 'center', color: 'var(--deep-navy)', fontWeight: 'bold', borderTop: '1px solid var(--steel-gray)' }}
        >
          ⚙️ 프로필 수정
        </div>
        <div 
          className="dropdown-item dropdown-add-btn" 
          onClick={() => {
            setDropdownOpen(false);
            navigate('/profile?add=true');
          }}
        >
          + 새 프로필 추가
        </div>
      </div>
    </div>
  );
};
