import React from 'react';

interface ImageCropperProps {
  rawImage: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ rawImage, onCropComplete, onCancel }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <p>Image Cropper (Placeholder)</p>
      <button onClick={() => onCropComplete(rawImage)}>Use Original</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default ImageCropper;
