import { motion } from 'framer-motion';
import { Play, Pause, Download, RefreshCw, Scissors, Sparkles, Loader2, Info } from 'lucide-react';
import { Highlight } from '../App';
import { useEffect, useRef, useState } from 'react';

export default function Results({ videoUrl, highlights, onReset, isSimulated }: { videoUrl: string, highlights: Highlight[], onReset: () => void, isSimulated?: boolean }) {
  const [activeHighlight, setActiveHighlight] = useState<Highlight>(highlights[0]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const isExportingRef = useRef(false);

  // Web Audio API refs for reliable audio capture
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Editor State
  const [texts, setTexts] = useState({
    top1: "디자인 퀄리티 폭발",
    top2: "무조건 써야할 사이트",
    bottom1: "👤 스탠리스튜디오 Stanleestudio",
    bottom2: "구글AI스튜디오로 3D홈페이지 만들기\n구글AI스튜디오로 3D홈페이지 만들기"
  });
  const [videoPos, setVideoPos] = useState({ x: 0, y: 218 });
  const [videoSize, setVideoSize] = useState({ width: 360, height: 202 });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(activeHighlight.startTime);
  const [selectedFont, setSelectedFont] = useState('Black Han Sans');
  const [topFontSize1, setTopFontSize1] = useState(50);
  const [topFontSize2, setTopFontSize2] = useState(64);
  const [topMargin, setTopMargin] = useState(80);
  const [bottomMargin, setBottomMargin] = useState(64);
  const [topGap, setTopGap] = useState(-10);
  const [bottomGap, setBottomGap] = useState(0);

  // Reset editor state when highlight changes
  useEffect(() => {
    setVideoPos({ x: 0, y: 218 });
    setVideoSize({ width: 360, height: 202 });
    setTexts(prev => ({
      ...prev,
      top1: activeHighlight.topCopy1 || "AI 추천 하이라이트",
      top2: activeHighlight.topCopy2 || activeHighlight.title,
      bottom2: activeHighlight.explanation
    }));
  }, [activeHighlight]);

  // Video Player Logic
  useEffect(() => {
    if (videoRef.current && !isExporting) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        const vidDuration = video.duration;
        let start = activeHighlight.startTime;
        
        if (!isNaN(vidDuration) && vidDuration > 0) {
          if (start >= vidDuration - 0.5) start = 0;
        }
        
        video.currentTime = start;
        video.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      };

      if (video.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    }
  }, [activeHighlight, videoUrl, isExporting]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    setCurrentTime(video.currentTime);
    
    if (isExporting) return;

    const vidDuration = video.duration;
    
    // If metadata not loaded, wait
    if (isNaN(vidDuration) || vidDuration === 0) return;

    let start = activeHighlight.startTime;
    let end = activeHighlight.endTime;

    // If the highlight starts after or very close to the end of the video,
    // fallback to playing the whole video to prevent infinite loops.
    if (start >= vidDuration - 0.5) {
      start = 0;
      end = vidDuration;
    } else {
      end = Math.min(end, vidDuration);
    }

    if (video.currentTime >= end || video.ended) {
      // Prevent rapid looping if the segment is extremely short
      if (Math.abs(video.currentTime - start) > 0.5) {
        video.currentTime = start;
        video.play().catch(() => setIsPlaying(false));
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || isExporting) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    const video = videoRef.current;
    const vidDuration = video.duration || 0;
    if (vidDuration === 0) return;

    let start = activeHighlight.startTime;
    let end = activeHighlight.endTime;

    if (start >= vidDuration - 0.5) {
      start = 0;
      end = vidDuration;
    } else {
      end = Math.min(end, vidDuration);
    }
    
    const duration = end - start;
    const newTime = start + (duration * percentage);
    
    video.currentTime = newTime;
  };

  // Drag Logic
  const handleVideoPointerDown = (e: React.PointerEvent) => {
    if (isExporting) return;
    e.preventDefault();
    const startX = e.clientX - videoPos.x;
    const startY = e.clientY - videoPos.y;
    let dragged = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      dragged = true;
      setVideoPos({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      if (!dragged) {
        if (videoRef.current) {
          if (isPlaying) videoRef.current.pause();
          else videoRef.current.play();
          setIsPlaying(!isPlaying);
        }
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Resize Logic
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (isExporting) return;
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = videoSize.width;
    const startHeight = videoSize.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(100, startWidth + deltaX);
      const newHeight = newWidth * (startHeight / startWidth);
      setVideoSize({ width: newWidth, height: newHeight });
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Export Logic
  const handleExport = async () => {
    if (!videoRef.current || isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    isExportingRef.current = true;

    const video = videoRef.current;
    const originalTime = video.currentTime;
    const originalMuted = video.muted;

    let handleVisibilityChange: () => void;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');

      let start = activeHighlight.startTime;
      let end = activeHighlight.endTime;
      const vidDuration = video.duration;
      
      if (!isNaN(vidDuration) && start >= vidDuration - 0.5) {
        start = 0;
        end = vidDuration;
      } else if (!isNaN(vidDuration)) {
        end = Math.min(end, vidDuration);
      }

      // 1. Unmute and seek FIRST
      video.muted = false;
      video.volume = 1.0;
      
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
        video.currentTime = start;
        
        setTimeout(() => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        }, 500);
      });

      // 2. Play the video so the stream is active
      await video.play();

      // 3. NOW capture the streams (audio will be present because it's unmuted and playing)
      const canvasStream = (canvas as any).captureStream(30);
      let audioStream: MediaStream | null = null;
      
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
          audioSourceRef.current = audioCtxRef.current.createMediaElementSource(video);
          audioDestRef.current = audioCtxRef.current.createMediaStreamDestination();
          audioSourceRef.current.connect(audioDestRef.current);
          audioSourceRef.current.connect(audioCtxRef.current.destination);
        }
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        audioStream = audioDestRef.current.stream;
      } catch (e) {
        console.warn("Web Audio API capture failed, falling back to captureStream", e);
        try {
          const anyVideo = video as any;
          const vidStream = anyVideo.captureStream ? anyVideo.captureStream() : anyVideo.mozCaptureStream ? anyVideo.mozCaptureStream() : null;
          if (vidStream && vidStream.getAudioTracks().length > 0) {
            audioStream = new MediaStream([vidStream.getAudioTracks()[0]]);
          }
        } catch (fallbackErr) {
          console.warn("Fallback audio capture failed", fallbackErr);
        }
      }

      const tracks = [...canvasStream.getVideoTracks()];
      if (audioStream) tracks.push(...audioStream.getAudioTracks());
      const combinedStream = new MediaStream(tracks);

      // Determine supported mime type
      let mimeType = 'video/webm';
      let extension = 'webm';
      
      // We explicitly avoid video/mp4 because Chrome's MediaRecorder encodes MP4 
      // with Opus audio, which causes playback errors in native Windows players.
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

      // 4. Start recording and drawing
      recorder.start(100); 
      const duration = end - start;

      handleVisibilityChange = () => {
        if (!isExportingRef.current) return;
        if (document.hidden) {
          video.pause();
          if (recorder.state === 'recording') recorder.pause();
        } else {
          video.play().catch(e => console.error("Resume play failed", e));
          if (recorder.state === 'paused') recorder.resume();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const drawFrame = () => {
        if (!ctx || !isExportingRef.current) return;

        // Draw Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Video
        const scale = 720 / 360;
        const drawWidth = videoSize.width * scale;
        const drawHeight = videoSize.height * scale;
        const drawX = videoPos.x * scale;
        const drawY = videoPos.y * scale;

        const videoAspect = video.videoWidth / video.videoHeight;
        const boxAspect = drawWidth / drawHeight;

        let srcX = 0, srcY = 0, srcW = video.videoWidth, srcH = video.videoHeight;

        if (videoAspect > boxAspect) {
          srcW = video.videoHeight * boxAspect;
          srcX = (video.videoWidth - srcW) / 2;
        } else {
          srcH = video.videoWidth / boxAspect;
          srcY = (video.videoHeight - srcH) / 2;
        }

        ctx.drawImage(video, srcX, srcY, srcW, srcH, drawX, drawY, drawWidth, drawHeight);

        // Draw Texts
        ctx.textAlign = 'center';
        
        // Top Texts
        ctx.textBaseline = 'top';
        let topY = topMargin * 2;
        
        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.font = `bold ${topFontSize1}px "${selectedFont}", sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(texts.top1, canvas.width / 2, topY);

        topY += topFontSize1 + (topGap * 2);

        ctx.font = `bold ${topFontSize2}px "${selectedFont}", sans-serif`;
        ctx.fillStyle = '#00ff00';
        ctx.fillText(texts.top2, canvas.width / 2, topY);

        // Bottom Texts
        ctx.textBaseline = 'bottom';
        let bottomY = canvas.height - (bottomMargin * 2);

        const bottom2Lines = texts.bottom2.split('\n');
        const bottom2LineHeight = 36;

        ctx.font = `bold 28px "Noto Sans KR", sans-serif`;
        ctx.fillStyle = '#cccccc';
        for (let i = bottom2Lines.length - 1; i >= 0; i--) {
          ctx.fillText(bottom2Lines[i], canvas.width / 2, bottomY);
          if (i > 0) bottomY -= bottom2LineHeight;
        }

        bottomY -= (28 + bottomGap * 2);

        ctx.font = `bold 32px "Noto Sans KR", sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(texts.bottom1, canvas.width / 2, bottomY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        const progress = Math.min(100, ((video.currentTime - start) / duration) * 100);
        setExportProgress(progress);

        // Stop if we reached the end time or the video actually ended
        if (video.currentTime < end && !video.ended) {
          requestAnimationFrame(drawFrame);
        } else {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
          video.pause();
        }
      };

      drawFrame();

      await new Promise<void>((resolve, reject) => {
        recorder.onstop = () => {
          try {
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activeHighlight.title.replace(/[^a-z0-9가-힣]/gi, '_').toLowerCase()}.${extension}`;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        recorder.onerror = (e) => reject(e);
      });

    } catch (err) {
      console.error(err);
      alert("내보내기에 실패했습니다. 브라우저가 이 기능을 지원하지 않을 수 있습니다.");
    } finally {
      if (handleVisibilityChange) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      setIsExporting(false);
      isExportingRef.current = false;
      video.currentTime = originalTime;
      video.muted = originalMuted;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 lg:p-12">
      <div className="flex items-center justify-between mb-12 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">My Shorts</h1>
          {isSimulated && (
            <div className="ml-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
              <Info className="w-3.5 h-3.5" />
              <span>AI 시뮬레이션 (15MB 초과)</span>
            </div>
          )}
        </div>
        <button 
          onClick={onReset}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          새 동영상 처리
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto w-full flex-1">
        {/* Sidebar: List of Highlights */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            AI 추출 클립
          </h2>
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isExporting && setActiveHighlight(highlight)}
              className={`
                p-5 rounded-2xl cursor-pointer border transition-all duration-300
                ${activeHighlight.id === highlight.id 
                  ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                  : 'bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50'}
                ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                  {formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 leading-tight">{highlight.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{highlight.explanation}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content: Video Editor */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-muted/10 rounded-3xl border border-border p-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          {/* 9:16 Editor Canvas */}
          <div className="relative w-[360px] h-[640px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-border/50 z-10 shrink-0 select-none">
            
            {/* Top Texts */}
            <div className="absolute left-0 right-0 flex flex-col items-center z-20 px-4" style={{ top: `${topMargin}px` }}>
              <input 
                value={texts.top1} 
                onChange={e => setTexts({...texts, top1: e.target.value})}
                style={{ fontFamily: selectedFont, fontSize: `${topFontSize1 / 2}px`, lineHeight: 1, textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}
                className="bg-transparent text-white font-bold text-center w-full outline-none border border-transparent hover:border-white/20 focus:border-white/50 transition-colors rounded px-2 py-0"
              />
              <input 
                value={texts.top2} 
                onChange={e => setTexts({...texts, top2: e.target.value})}
                style={{ fontFamily: selectedFont, fontSize: `${topFontSize2 / 2}px`, lineHeight: 1, marginTop: `${topGap}px`, textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}
                className="bg-transparent text-[#00ff00] font-bold text-center w-full outline-none border border-transparent hover:border-white/20 focus:border-white/50 transition-colors rounded px-2 py-0"
              />
            </div>

            {/* Draggable Video */}
            <div 
              className="absolute z-10 group/video"
              style={{ 
                transform: `translate(${videoPos.x}px, ${videoPos.y}px)`, 
                width: videoSize.width, 
                height: videoSize.height,
                cursor: isExporting ? 'default' : 'move'
              }}
              onPointerDown={!isExporting ? handleVideoPointerDown : undefined}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover pointer-events-none"
                onTimeUpdate={handleTimeUpdate}
                onError={(e) => {
                  console.error("Video load error:", e);
                  alert("영상을 불러오는데 실패했습니다. 유튜브 링크가 올바른지, 또는 영상이 재생 가능한 상태인지 확인해주세요.");
                  onReset();
                }}
                playsInline
                muted={false}
                loop={false}
                crossOrigin="anonymous"
              />
              
              {/* Play/Pause Overlay */}
              {!isExporting && (
                <div className={`
                  absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 pointer-events-none
                  ${isPlaying ? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100'}
                `}>
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </div>
                </div>
              )}

              {/* Resize Handle */}
              {!isExporting && (
                <div 
                  className="absolute -bottom-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-black cursor-se-resize opacity-0 group-hover/video:opacity-100 transition-opacity flex items-center justify-center z-30"
                  onPointerDown={handleResizePointerDown}
                >
                  <div className="w-3 h-3 bg-black rounded-full pointer-events-none" />
                </div>
              )}
            </div>

            {/* Bottom Texts */}
            <div className="absolute left-0 right-0 flex flex-col items-center z-20 px-4" style={{ bottom: `${bottomMargin}px`, gap: `${bottomGap}px` }}>
              <input 
                value={texts.bottom1} 
                onChange={e => setTexts({...texts, bottom1: e.target.value})}
                style={{ fontFamily: 'Noto Sans KR', textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}
                className="bg-transparent text-white font-bold text-[16px] text-center w-full outline-none border border-transparent hover:border-white/20 focus:border-white/50 transition-colors rounded px-2 py-1"
              />
              <textarea 
                value={texts.bottom2} 
                onChange={e => setTexts({...texts, bottom2: e.target.value})}
                style={{ fontFamily: 'Noto Sans KR', textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}
                className="bg-transparent text-gray-300 font-bold text-[14px] text-center w-full outline-none border border-transparent hover:border-white/20 focus:border-white/50 transition-colors resize-none overflow-hidden rounded px-2 py-1"
                rows={2}
              />
            </div>

            {/* Exporting Overlay */}
            {isExporting && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-50">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-white font-medium">영상 렌더링 중...</p>
              </div>
            )}

            {/* Progress Bar */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-2 bg-white/20 z-40 cursor-pointer hover:h-3 transition-all"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-primary transition-all duration-75"
                style={{ 
                  width: `${(() => {
                    const vidDuration = videoRef.current?.duration || 0;
                    let start = activeHighlight.startTime;
                    let end = activeHighlight.endTime;
                    if (vidDuration > 0) {
                      if (start >= vidDuration - 0.5) {
                        start = 0;
                        end = vidDuration;
                      } else {
                        end = Math.min(end, vidDuration);
                      }
                    }
                    const duration = Math.max(0.1, end - start);
                    return Math.max(0, Math.min(100, ((currentTime - start) / duration) * 100));
                  })()}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Editor Controls */}
        <div className="lg:col-span-4 flex flex-col bg-muted/10 rounded-3xl border border-border p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold mb-2">에디터 설정</h2>
          <p className="text-muted-foreground mb-6 text-sm">영상을 드래그하여 위치를 조정하고, 우측 하단을 잡아 크기를 조절하세요. 텍스트를 클릭하여 수정할 수 있습니다.</p>
          
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2 text-left">폰트 선택</label>
              <select 
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              >
                <option value="Noto Sans KR">본고딕 (기본)</option>
                <option value="Black Han Sans">검은고딕 (강조)</option>
                <option value="Jua">배민 주아체</option>
                <option value="Do Hyeon">배민 도현체</option>
                <option value="Yeon Sung">배민 연성체</option>
                <option value="Kirang Haerang">배민 기랑해랑체</option>
              </select>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">텍스트 크기</h3>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 text-left flex justify-between">
                  <span>상단 텍스트 1 크기</span>
                  <span>{topFontSize1}px</span>
                </label>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={topFontSize1} 
                  onChange={(e) => setTopFontSize1(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 text-left flex justify-between">
                  <span>상단 텍스트 2 크기</span>
                  <span>{topFontSize2}px</span>
                </label>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={topFontSize2} 
                  onChange={(e) => setTopFontSize2(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">여백 및 간격</h3>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 text-left flex justify-between">
                  <span>상단 여백 (위치)</span>
                  <span>{topMargin}px</span>
                </label>
                <input type="range" min="0" max="200" value={topMargin} onChange={(e) => setTopMargin(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 text-left flex justify-between">
                  <span>상단 줄간격</span>
                  <span>{topGap}px</span>
                </label>
                <input type="range" min="-50" max="50" value={topGap} onChange={(e) => setTopGap(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 text-left flex justify-between">
                  <span>하단 여백 (위치)</span>
                  <span>{bottomMargin}px</span>
                </label>
                <input type="range" min="0" max="200" value={bottomMargin} onChange={(e) => setBottomMargin(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 text-left flex justify-between">
                  <span>하단 줄간격</span>
                  <span>{bottomGap}px</span>
                </label>
                <input type="range" min="-50" max="50" value={bottomGap} onChange={(e) => setBottomGap(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 w-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  내보내는 중 {Math.round(exportProgress)}%
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  쇼츠 내보내기
                </>
              )}
            </button>
            {isExporting && (
              <p className="text-xs text-red-400 mt-3 text-center font-medium leading-relaxed">
                ⚠️ 내보내기 중에는 다른 탭으로 이동하지 마세요.<br/>이동 시 녹화가 일시정지됩니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
