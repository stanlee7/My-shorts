import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileVideo, AlertCircle } from 'lucide-react';

export default function Uploader({ onUpload }: { onUpload: (file: File, duration: number, clipCount: number) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [clipCount, setClipCount] = useState<number>(3);

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

        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <UploadCloud className="w-10 h-10 text-primary" />
          </div>
          
          <h3 className="text-2xl font-semibold mb-2">
            {isDragActive ? '여기에 동영상을 놓아주세요' : '동영상 드래그 앤 드롭'}
          </h3>
          <p className="text-muted-foreground mb-8">
            또는 클릭하여 내 컴퓨터에서 파일 찾기
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><FileVideo className="w-4 h-4" /> MP4, MOV, WEBM</span>
            <span>•</span>
            <span>최대 900MB</span>
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
