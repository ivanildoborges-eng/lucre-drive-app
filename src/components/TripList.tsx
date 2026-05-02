import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip } from '../types';

interface TripListProps {
  trips: Trip[];
  onDelete: (id: string) => void;
}

export function TripList({ trips, onDelete }: TripListProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {trips.map((trip) => (
          <motion.div 
            key={trip.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${trip.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {trip.type === 'income' ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <div className="text-xs uppercase font-black tracking-widest text-slate-300">{trip.description}</div>
                <div className="text-[10px] text-slate-500 font-bold">
                  {new Date(trip.date).toLocaleDateString('pt-BR')} • {trip.miles} KM
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-sm font-black italic tracking-tighter ${trip.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trip.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trip.earnings)}
                </div>
                <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Verificado</div>
              </div>
              <button 
                onClick={() => onDelete(trip.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-500/10 rounded-lg text-slate-600 hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
