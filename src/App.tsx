import { useState } from 'react';
import Landing from './components/Landing';
import Uploader from './components/Uploader';
import Processing from './components/Processing';
import Results from './components/Results';
import { extractHighlights } from './lib/gemini';

export type Highlight = {
  id: string;
  title: string;
  explanation: string;
  startTime: number;
  endTime: number;
  topCopy1: string;
  topCopy2: string;
};

export default function App() {
  const [step, setStep] = useState<'landing' | 'upload' | 'processing' | 'results'>('landing');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isSimulated, setIsSimulated] = useState(false);

  const handleStart = () => setStep('upload');

  const handleUpload = async (file: File, duration: number) => {
    setVideoUrl(URL.createObjectURL(file));
    setStep('processing');
    setIsSimulated(false);
    
    try {
      // Try Gemini first
      const rawHighlights = await extractHighlights(file, duration);
      const formatted = rawHighlights.map((h, i) => ({
        id: String(i + 1),
        title: h.title,
        explanation: h.explanation,
        startTime: h.startTime,
        endTime: h.endTime,
        topCopy1: h.topCopy1 || "AI 추천 하이라이트",
        topCopy2: h.topCopy2 || h.title,
      }));
      setHighlights(formatted);
      setStep('results');
    } catch (error: any) {
      console.error("Gemini failed or file too large, falling back to mock data", error);
      setIsSimulated(true);
      
      const isLargeFile = error.message === "FILE_TOO_LARGE";
      
      // Fallback to mock data if file is too large or API fails
      setTimeout(() => {
        setHighlights([
          { id: '1', title: '시선 집중 훅', explanation: '시청자의 이목을 끄는 강력한 오프닝입니다.', startTime: 0, endTime: duration, topCopy1: '이 장면 놓치면 후회함', topCopy2: '역대급 레전드 순간 ㄷㄷ' },
          { id: '2', title: '핵심 메시지', explanation: '영상의 주요 내용이 간결하게 전달됩니다.', startTime: 10, endTime: 10 + duration, topCopy1: '핵심만 딱 짚어드림', topCopy2: '이것만 알면 끝납니다' },
          { id: '3', title: '행동 유도', explanation: '참여를 유도하는 매력적인 마무리입니다.', startTime: 20, endTime: 20 + duration, topCopy1: '마지막 반전 주의', topCopy2: '결과가 궁금하다면?' },
        ]);
        setStep('results');
      }, isLargeFile ? 8000 : 5000); // Simulate longer processing for large files
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {step === 'landing' && <Landing onStart={handleStart} />}
      {step === 'upload' && <Uploader onUpload={handleUpload} />}
      {step === 'processing' && <Processing />}
      {step === 'results' && videoUrl && (
        <Results 
          videoUrl={videoUrl} 
          highlights={highlights} 
          onReset={() => setStep('upload')} 
          isSimulated={isSimulated}
        />
      )}
    </div>
  );
}
