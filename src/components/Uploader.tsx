import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileVideo, AlertCircle, Youtube, Link as LinkIcon } from 'lucide-react';

export default function Uploader({ onUpload, onYoutubeUpload }: { onUpload: (file: File, duration: number, clipCount: number) => void, onYoutubeUpload?: (url: string, duration: number, clipCount: number) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [clipCount, setClipCount] = useState<number>(3);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 900 * 1024 * 1024) { // 900MB limit for prototype
        setError('프로토타입 버전에서는 900MB 이하의 파일만 업로드 가능합니다.');
        return;
      }
      if (!file.type.startsWith('video/')) {
        setError('유효한 동영상 파일을 업로드해주세요.');
        return;
      }
      setError(null);
      onUpload(file, duration, clipCount);
    }
  }, [onUpload, duration, clipCount]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    maxFiles: 1
  } as any);

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setError('유튜브 링크를 입력해주세요.');
      return;
    }
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setError('올바른 유튜브 링크를 입력해주세요.');
      return;
    }
    setError(null);
    if (onYoutubeUpload) {
      onYoutubeUpload(youtubeUrl, duration, clipCount);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">동영상 업로드</h2>
          <p className="text-muted-foreground text-lg">
            영상을 분석하여 최고의 하이라이트를 추출해 드립니다.
          </p>
        </div>

        <div className="mb-8 text-center flex flex-col sm:flex-row justify-center items-center gap-8">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">원하는 쇼츠 길이를 선택하세요</h3>
            <div className="flex justify-center gap-3">
              {[15, 30, 60].map(time => (
                <button
                  key={time}
                  onClick={() => setDuration(time)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    duration === time 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  약 {time}초
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">추출할 클립 개수</h3>
            <div className="flex justify-center gap-3">
              {[3, 5, 10].map(count => (
                <button
                  key={count}
                  onClick={() => setClipCount(count)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    clipCount === count 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {count}개
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 h-full flex flex-col justify-center
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? '여기에 놓아주세요' : '동영상 파일 업로드'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              클릭하거나 드래그 앤 드롭
            </p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><FileVideo className="w-3 h-3" /> MP4, MOV, WEBM</span>
              <span>•</span>
              <span>최대 900MB</span>
            </div>
          </div>

          <div className="border-2 border-border rounded-3xl p-10 bg-muted/10 flex flex-col justify-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Youtube className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              유튜브 링크로 시작하기
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              유튜브 영상 URL을 붙여넣기 하세요
            </p>
            
            <form onSubmit={handleYoutubeSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/25"
              >
                링크로 영상 불러오기
              </button>
            </form>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
