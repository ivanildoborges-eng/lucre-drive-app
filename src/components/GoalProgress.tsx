import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

interface GoalProgressProps {
  current: number;
  goal: number;
}

export function GoalProgress({ current, goal }: GoalProgressProps) {
  const percentage = Math.min(Math.max((current / goal) * 100, 0), 100);
  const isOnTrack = percentage >= (new Date().getDate() / 31) * 100;

  return (
    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest text-[10px]">META MENSAL</span>
        <span className="text-xs text-white">{formatCurrency(current)} / {formatCurrency(goal)}</span>
      </div>
      <div className="w-full bg-emerald-900/40 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] rounded-full"
        ></motion.div>
      </div>
      <div className="mt-3 text-[10px] text-emerald-500/80">
        {isOnTrack 
          ? `Você está no caminho certo para atingir sua meta este mês.`
          : `Você está um pouco atrás do planejado para atingir sua meta.`}
      </div>
    </div>
  );
}
