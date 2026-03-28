import { motion } from 'framer-motion';
import { Loader2, Sparkles, BrainCircuit, Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  { icon: <BrainCircuit className="w-5 h-5 text-primary" />, text: "동영상 콘텐츠 분석 중..." },
  { icon: <Sparkles className="w-5 h-5 text-primary" />, text: "가장 매력적인 순간 찾는 중..." },
  { icon: <Scissors className="w-5 h-5 text-primary" />, text: "쇼츠 영상 준비 중..." },
];

export default function Processing() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000); // Change step every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="relative w-32 h-32 mx-auto mb-12">
          {/* Outer spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
          />
          {/* Inner pulsing core */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </motion.div>
        </div>

        <h2 className="text-3xl font-bold mb-8">AI가 마법을 부리는 중입니다</h2>

        <div className="space-y-4 text-left bg-muted/20 p-6 rounded-2xl border border-border">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= currentStep ? 1 : 0.3, 
                x: index <= currentStep ? 0 : -10 
              }}
              className="flex items-center gap-4"
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${index === currentStep ? 'bg-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-muted'}
              `}>
                {step.icon}
              </div>
              <span className={`text-lg ${index === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
