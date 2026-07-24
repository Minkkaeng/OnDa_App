import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageCropperProps {
  rawImage: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { width: number; height: number; x: number; y: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

const ImageCropper: React.FC<ImageCropperProps> = ({ rawImage, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropCompleteCallback = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(rawImage, croppedAreaPixels);
        onCropComplete(croppedImage);
      } else {
        onCropComplete(rawImage);
      }
    } catch (e) {
      console.error(e);
      onCropComplete(rawImage);
    }
  };

  return (
    <div className="modal-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(18, 27, 42, 0.75)', 
      zIndex: 999999, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px'
    }}>
      <div className="modal-content" style={{ 
        background: 'var(--card-bg)', 
        borderRadius: '24px', 
        padding: '24px', 
        width: '100%', 
        maxWidth: '360px', 
        textAlign: 'center', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        animation: 'scaleUp 0.3s ease-out'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>이미지 자르기</h3>
        <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>이미지를 드래그하거나 확대하여<br/>원하는 영역을 선택해 주세요.</p>
        
        <div style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          backgroundColor: '#333',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <Cropper
            image={rawImage}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropCompleteCallback}
          />
        </div>
        
        <div style={{ padding: '0 16px 24px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>-</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value));
            }}
            style={{ width: '100%', accentColor: 'var(--main-primary)' }}
          />
          <span style={{ fontSize: '1.2rem' }}>+</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onCancel}
            className="btn-submit"
            style={{ 
              flex: 1, 
              backgroundColor: 'var(--text-muted)', 
              margin: 0, 
              padding: '12px',
              fontSize: '1rem',
              borderRadius: '12px'
            }}
          >
            취소
          </button>
          <button 
            onClick={handleApply}
            className="btn-submit"
            style={{ 
              flex: 1, 
              backgroundColor: 'var(--main-primary)', 
              margin: 0, 
              padding: '12px',
              fontSize: '1rem',
              borderRadius: '12px'
            }}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
