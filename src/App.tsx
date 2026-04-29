import { useState } from 'react';
import Landing from './components/Landing';
import Uploader from './components/Uploader';
import Processing from './components/Processing';
import Results from './components/Results';
import { extractHighlights, generateCreativeHooks } from './lib/gemini';

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
          { top1: '복사 붙여넣기 하나로', top2: '3D 웹사이트 10초컷' },
          { top1: '클릭을 부르는 디자인', top2: '마우스 반응의 정체는?' },
          { top1: '구글 AI가 다해주는', top2: '미친 3D 홈페이지 제작' },
          { top1: '이거 모르면 손해', top2: '역대급 꿀팁 공개 ㄷㄷ' },
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
    setIsSimulated(true); // Still simulated because we don't analyze the actual video frames
    
    try {
      // 1. Get video info (title, duration)
      const infoRes = await fetch(`/api/youtube/info?url=${encodeURIComponent(url)}`);
      if (!infoRes.ok) throw new Error("Failed to fetch video info");
      const info = await infoRes.json();

      // 2. Set the stream URL
      const streamUrl = `/api/youtube/stream?url=${encodeURIComponent(url)}`;
      setVideoUrl(streamUrl);
      
      // 3. Generate creative hooks based on the title
      try {
        const rawHighlights = await generateCreativeHooks(info.title, info.duration || duration * 10, clipCount);
        const formatted = rawHighlights.map((h: any, i: number) => ({
          id: String(i + 1),
          title: h.title,
          explanation: h.explanation,
          startTime: h.startTime,
          endTime: h.endTime,
          topCopy1: h.topCopy1 || "AI 추천 하이라이트",
          topCopy2: h.topCopy2 || h.title,
        }));
        setHighlights(formatted);
      } catch (geminiError) {
        console.error("Gemini hook generation failed, falling back to mock data", geminiError);
        // Fallback if Gemini fails
        const copyVariations = [
          { top1: '복사 붙여넣기 하나로', top2: '3D 웹사이트 10초컷' },
          { top1: '클릭을 부르는 디자인', top2: '마우스 반응의 정체는?' },
          { top1: '구글 AI가 다해주는', top2: '미친 3D 홈페이지 제작' },
          { top1: '조회수 폭발각', top2: '이 영상 무조건 뜹니다' },
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
      }
      
      setStep('results');
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
