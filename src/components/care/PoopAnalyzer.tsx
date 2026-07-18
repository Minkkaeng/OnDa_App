import React, { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '../../db/schema';
import ImageCropper from '../common/ImageCropper';
import { analyzePoopImage } from '../../services/aiService';

interface PoopAnalyzerProps {
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>) => void;
}

const PoopAnalyzer: React.FC<PoopAnalyzerProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [rawImage, setRawImage] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [userMemo, setUserMemo] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{ status: 'good' | 'loose' | 'hard' | 'bloody', text: string } | null>(null);

  // Rewarded Ad Simulation States
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);

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
    setImageUrl(croppedData);
    setShowCropModal(false);
    setRawImage('');
  };

  const runActualAnalysis = useCallback(async () => {
    setStep('analyzing');
    try {
      const result = await analyzePoopImage(imageUrl, userMemo);
      setAnalysisResult(result);
    } catch {
      setAnalysisResult({
        status: 'good',
        text: 'AI 분석 중 예기치 못한 에러가 발생했습니다. 강아지가 평소와 달리 잘 먹지 않거나 기운이 없다면 수의사와 직접 상담해보시기를 권장합니다.'
      });
    } finally {
      setStep('result');
    }
  }, [imageUrl, userMemo]);

  useEffect(() => {
    if (!isPlayingAd) return;
    if (adCountdown === 0) {
      setIsPlayingAd(false);
      runActualAnalysis();
      return;
    }
    const timer = setTimeout(() => {
      setAdCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isPlayingAd, adCountdown, runActualAnalysis]);

  const handleStartAnalysis = () => {
    if (!imageUrl) return;
    setIsPlayingAd(true);
    setAdCountdown(3);
  };

  const handleSaveToRecord = () => {
    if (!analysisResult) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let title = '💩 배변 분석 기록';
    if (analysisResult.status === 'good') title = '🟢 건강한 황금똥 발견!';
    if (analysisResult.status === 'loose') title = '🟡 다소 무른 변 관찰됨';
    if (analysisResult.status === 'hard') title = '🟤 수분 부족 딱딱한 변';
    if (analysisResult.status === 'bloody') title = '🔴 혈변 의심 (병원 요망)';

    onSave({
      type: 'poop',
      date: dateStr,
      title: title,
      content: analysisResult.text,
      imageUrl: imageUrl,
      poopStatus: analysisResult.status,
      aiAnalysisText: analysisResult.text
    });
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(18,27,42,0.85)', zIndex: 2000, alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: 'var(--white)', padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', position: 'relative', overflow: 'hidden' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted-gray)', zIndex: 10 }}>&times;</button>
        
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--deep-navy)', textAlign: 'center' }}>
          🤖 AI 배변 상태 스캐너
        </h3>

        {step === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--muted-gray)', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
              배변 사진을 업로드하시면 AI가 건강 상태를<br/>즉시 분석해 드립니다.
            </p>
            
            {!imageUrl ? (
              <div 
                onClick={() => document.getElementById('poop-image-upload')?.click()}
                style={{
                  border: '2px dashed var(--steel-gray)',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--ice-white)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>📸</span>
                <span style={{ fontWeight: 700, color: 'var(--deep-navy)' }}>사진 첨부하기</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-gray)' }}>어두운 곳에서는 플래시를 켜주세요</span>
                <input 
                  type="file" 
                  id="poop-image-upload" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                />
              </div>
            ) : (
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--ice-white)', position: 'relative' }}>
                <img src={imageUrl} alt="Uploaded Poop" style={{ width: '100%', display: 'block' }} />
                <button 
                  onClick={() => setImageUrl('')}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >&times;</button>
              </div>
            )}

            {imageUrl && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>추가 증상/특이사항 적기 (선택)</label>
                <textarea
                  value={userMemo}
                  onChange={(e) => setUserMemo(e.target.value)}
                  placeholder="예: 아침 간식으로 과일을 먹었습니다. 대변 색이 평소보다 밝습니다."
                  className="form-input"
                  style={{
                    minHeight: '60px',
                    fontSize: '0.85rem',
                    padding: '8px',
                    borderRadius: '8px',
                    borderColor: 'var(--steel-gray)',
                    resize: 'none',
                    margin: 0
                  }}
                />
              </div>
            )}

            <button 
              onClick={handleStartAnalysis}
              disabled={!imageUrl}
              className="btn-submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: imageUrl ? 'var(--mint-green)' : 'var(--steel-gray)',
                color: imageUrl ? 'white' : 'var(--muted-gray)',
                fontSize: '1rem',
                fontWeight: 800,
                border: 'none',
                marginTop: '10px'
              }}
            >
              분석 시작하기
            </button>
          </div>
        )}

        {step === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--mint-green)' }}>
              <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '4px',
                backgroundColor: '#14C3A3',
                boxShadow: '0 0 10px 4px rgba(20, 195, 163, 0.5)',
                animation: 'scan 1.5s infinite linear'
              }} />
            </div>
            <style>
              {`@keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }`}
            </style>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--deep-navy)', fontSize: '1.1rem' }}>AI 모델 분석 중...</h4>
              <p style={{ margin: 0, color: 'var(--muted-gray)', fontSize: '0.85rem' }}>색상, 형태, 질감을 확인하고 있습니다.</p>
            </div>
          </div>
        )}

        {step === 'result' && analysisResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px 0 8px 0' }}>
              <span style={{ fontSize: '3rem' }}>
                {analysisResult.status === 'good' ? '🟢' : analysisResult.status === 'loose' ? '🟡' : analysisResult.status === 'hard' ? '🟤' : '🔴'}
              </span>
              <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.2rem', color: 'var(--deep-navy)' }}>
                {analysisResult.status === 'good' ? '완벽한 황금 맛동산!' : 
                 analysisResult.status === 'loose' ? '주의: 다소 무른 변' : 
                 analysisResult.status === 'hard' ? '주의: 수분 부족 딱딱한 변' : 
                 '위험: 혈변 의심'}
              </h4>
            </div>
            
            <div style={{ background: 'var(--ice-white)', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>
              {analysisResult.text}
            </div>

            <button 
              onClick={handleSaveToRecord}
              className="btn-submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'var(--mint-green)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 800,
                border: 'none',
                marginTop: '10px'
              }}
            >
              케어 일지에 영구 기록하기 💾
            </button>
          </div>
        )}

        {isPlayingAd && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(18, 27, 42, 0.95)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ fontSize: '3rem', animation: 'spin 2s infinite linear', marginBottom: '16px' }}>🎬</span>
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0' }}>무료 AI 정밀 배변 분석</h4>
            <p style={{ fontSize: '0.85rem', color: '#a0abbc', margin: '0 0 24px 0', lineHeight: 1.4 }}>
              보상형 광고 시청 완료 후 즉시 분석 결과가 오픈됩니다.
            </p>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '3px solid var(--mint-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800
            }}>
              {adCountdown}
            </div>
          </div>
        )}

      </div>

      {showCropModal && rawImage && (
        <ImageCropper
          rawImage={rawImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setRawImage('');
          }}
        />
      )}
    </div>
  );
};

export default PoopAnalyzer;
