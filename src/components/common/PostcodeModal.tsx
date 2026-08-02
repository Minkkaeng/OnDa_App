import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PostcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (address: string, zonecode: string) => void;
}

export const PostcodeModal: React.FC<PostcodeModalProps> = ({ isOpen, onClose, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadDaumScript = () => {
      if ((window as any).daum && (window as any).daum.Postcode) {
        initPostcode();
        return;
      }

      const existingScript = document.getElementById('daum-postcode-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'daum-postcode-script';
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = () => initPostcode();
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', initPostcode);
      }
    };

    const initPostcode = () => {
      if (!containerRef.current || !(window as any).daum?.Postcode) return;
      containerRef.current.innerHTML = '';

      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          let fullAddress = data.address;
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') {
              extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
          }

          onComplete(fullAddress, data.zonecode);
          onClose();
        },
        width: '100%',
        height: '100%',
        maxSuggestItems: 5
      }).embed(containerRef.current);
    };

    loadDaumScript();
  }, [isOpen, onClose, onComplete]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(18, 27, 42, 0.6)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        height: '500px',
        maxHeight: '85vh',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)'
      }}>
        {/* Header */}
        <div style={{
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          borderBottom: '1px solid var(--onda-border-light, #EFECE6)',
          backgroundColor: '#FCFAF7'
        }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main, #2E2B2A)' }}>주소 검색</span>
          <button 
            type="button"
            onClick={onClose} 
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted, #8E867E)', display: 'flex', alignItems: 'center' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Daum iframe container */}
        <div ref={containerRef} style={{ flex: 1, width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default PostcodeModal;
