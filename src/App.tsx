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

  const handleUpload = async (file: File, duration: number, clipCount: number = 3) => {
    setVideoUrl(URL.createObjectURL(file));
    setStep('processing');
    setIsSimulated(false);
    
    try {
      // Try Gemini first
      const rawHighlights = await extractHighlights(file, duration, clipCount);
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
        const mockHighlights = Array.from({ length: clipCount }).map((_, i) => {
          const start = i * (duration + 5);
          return {
            id: String(i + 1),
            title: `추천 하이라이트 ${i + 1}`,
            explanation: `시청자의 이목을 끄는 강력한 구간입니다. (${i + 1})`,
            startTime: start,
            endTime: start + duration,
            topCopy1: '이 장면 놓치면 후회함',
            topCopy2: '역대급 레전드 순간 ㄷㄷ'
          };
        });
        setHighlights(mockHighlights);
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
