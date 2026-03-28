import { motion } from 'framer-motion';
import { Play, Scissors, Sparkles, Zap } from 'lucide-react';
import { ReactNode } from 'react';

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full text-center z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
          <Sparkles className="w-4 h-4" />
          <span>AI 기반 동영상 하이라이트</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          긴 영상을 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">
            바이럴 쇼츠로
          </span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          긴 동영상을 업로드하면 AI가 자동으로 가장 매력적인 순간을 찾아 틱톡, 릴스, 쇼츠에 맞게 편집해 드립니다.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 mx-auto shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] transition-shadow"
        >
          <Play className="w-5 h-5 fill-current" />
          무료로 시작하기
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
          <FeatureCard 
            icon={<Scissors className="w-6 h-6 text-primary" />}
            title="자동 크롭"
            description="AI가 화자를 감지하고 자동으로 9:16 세로 포맷으로 영상을 자릅니다."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-primary" />}
            title="스마트 하이라이트"
            description="문맥과 오디오를 분석하여 가장 몰입도 높은 15~60초 클립을 찾습니다."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-primary" />}
            title="즉시 업로드 가능"
            description="고품질 클립을 즉시 내보내어 원하는 플랫폼에 바로 업로드하세요."
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-muted/30 border border-border backdrop-blur-sm">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
