import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trip } from '../types';

const tripSchema = z.object({
  description: z.string().min(2, 'Description too short'),
  earnings: z.number().min(0.01, 'Must be positive'),
  miles: z.number().min(0, 'Must be positive'),
  date: z.string(),
  type: z.enum(['income', 'expense']),
});

type TripFormData = z.infer<typeof tripSchema>;

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
}

export function AddTripModal({ isOpen, onClose, onAdd }: AddTripModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      miles: 0,
    }
  });

  const onSubmit = (data: TripFormData) => {
    onAdd(data);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#141414] border border-white/10 w-full max-w-md rounded-2xl p-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Adicionar Lançamento</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full outline-none">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Descrição</label>
                <input 
                  {...register('description')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="ex: Corrida Aeroporto, Combustível, Almoço..."
                />
                {errors.description && <p className="text-rose-400 text-[10px] mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Valor (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('earnings', { valueAsNumber: true })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  {errors.earnings && <p className="text-rose-400 text-[10px] mt-1">{errors.earnings.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Distância (km)</label>
                  <input 
                    type="number"
                    {...register('miles', { valueAsNumber: true })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  {errors.miles && <p className="text-rose-400 text-[10px] mt-1">{errors.miles.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Data</label>
                  <input 
                    type="date"
                    {...register('date')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Tipo</label>
                  <select 
                    {...register('type')}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                  >
                    <option value="income">Ganho</option>
                    <option value="expense">Gasto</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-colors mt-4 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
              >
                Confirmar Lançamento
              </button>
            </form>
            
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
