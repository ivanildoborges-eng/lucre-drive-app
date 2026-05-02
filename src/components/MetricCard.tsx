import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  progress: number;
  color: 'emerald' | 'blue' | 'rose';
  icon: ReactNode;
}

export function MetricCard({ label, value, progress, color, icon }: MetricCardProps) {
  const colorMap = {
    emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    blue: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    rose: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#101010] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{label}</div>
        <div className="p-2 rounded-xl bg-[#0A0A0A] border border-white/5 group-hover:bg-[#141414] transition-colors">
          {icon}
        </div>
      </div>
      
      <div className="text-3xl font-black tracking-tighter tabular-nums italic text-white">{value}</div>
      
      <div className="w-full bg-white/5 h-1.5 mt-6 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className={cn(colorMap[color], "h-full rounded-full")}
        ></motion.div>
      </div>
    </motion.div>
  );
}
