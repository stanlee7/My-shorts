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
        const copyVariations = [
          { top1: '이거 모르면 손해', top2: '역대급 꿀팁 공개 ㄷㄷ' },
          { top1: '마지막 반전 주의', top2: '이게 진짜 된다고?' },
          { top1: '아 내 얘기네 ㅋㅋ', top2: '무조건 공감하는 영상' },
          { top1: '1분 만에 배우는', top2: '클릭을 부르는 마법' },
          { top1: '전문가도 놀란', top2: '숨겨진 비밀 대공개' }
        ];

        const mockHighlights = Array.from({ length: clipCount }).map((_, i) => {
          const start = i * (duration + 5);
          const copy = copyVariations[i % copyVariations.length];
          return {
            id: String(i + 1),
            title: `추천 하이라이트 ${i + 1}`,
            explanation: `시청자의 이목을 끄는 강력한 구간입니다. (${i + 1})`,
            startTime: start,
            endTime: start + duration,
            topCopy1: copy.top1,
            topCopy2: copy.top2
          };
        });
        setHighlights(mockHighlights);
        setStep('results');
      }, isLargeFile ? 8000 : 5000); // Simulate longer processing for large files
    }
  };

  const handleYoutubeUpload = async (url: string, duration: number, clipCount: number = 3) => {
    setStep('processing');
    setIsSimulated(true);
    
    try {
      // Use our new backend proxy to stream the video
      const streamUrl = `/api/youtube/stream?url=${encodeURIComponent(url)}`;
      setVideoUrl(streamUrl);
      
      // Simulate processing time
      setTimeout(() => {
        const copyVariations = [
          { top1: '유튜브에서 찾은', top2: '역대급 하이라이트' },
          { top1: '조회수 폭발각', top2: '이 영상 무조건 뜹니다' },
          { top1: '유튜브 알고리즘', top2: '선택받은 레전드 영상' },
          { top1: '1분 만에 보는', top2: '유튜브 핵심 요약' },
          { top1: '구독자 떡상', top2: '비밀은 바로 이것' }
        ];

        const mockHighlights = Array.from({ length: clipCount }).map((_, i) => {
          const start = i * (duration + 5);
          const copy = copyVariations[i % copyVariations.length];
          return {
            id: String(i + 1),
            title: `유튜브 하이라이트 ${i + 1}`,
            explanation: `유튜브 영상에서 추출된 핵심 구간입니다. (${i + 1})`,
            startTime: start,
            endTime: start + duration,
            topCopy1: copy.top1,
            topCopy2: copy.top2
          };
        });
        setHighlights(mockHighlights);
        setStep('results');
      }, 4000);
    } catch (error) {
      console.error("YouTube processing failed:", error);
      alert("유튜브 영상을 불러오는데 실패했습니다. 올바른 링크인지 확인해주세요.");
      setStep('upload');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {step === 'landing' && <Landing onStart={handleStart} />}
      {step === 'upload' && <Uploader onUpload={handleUpload} onYoutubeUpload={handleYoutubeUpload} />}
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
