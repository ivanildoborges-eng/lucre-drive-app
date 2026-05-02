/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface QuickActionFABProps {
  onQuickAdd: (type: 'income' | 'expense', earnings: number, miles: number) => void;
  lastEarnings?: number;
  lastMiles?: number;
}

export function QuickActionFAB({ onQuickAdd, lastEarnings, lastMiles }: QuickActionFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<'income' | 'expense' | null>(null);

  const handleQuickClick = (type: 'income' | 'expense') => {
    if (lastEarnings && lastMiles) {
      onQuickAdd(type, lastEarnings, lastMiles);
      setPendingType(type);
      setShowConfirm(true);
      setIsOpen(false);
      setTimeout(() => setShowConfirm(false), 2000);
    } else {
      // If no last values, we could open the full modal or show a message
      // For now, let's assume UI handles opening the full modal elsewhere
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Success Notification */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-emerald-500 text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl font-black text-[10px] uppercase tracking-widest italic"
          >
            <Check className="w-4 h-4" />
            <span>{pendingType === 'income' ? 'Ganho' : 'Gasto'} Registrado!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-4"
          >
            {/* Quick Income Button */}
            <button
              onClick={() => handleQuickClick('income')}
              className="flex items-center gap-3 bg-[#1A1A1A] border border-emerald-500/30 text-white pl-4 pr-6 py-4 rounded-[2rem] hover:bg-[#252525] transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-black">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Repetir Último Ganho</p>
                <p className="text-sm font-black italic">{formatCurrency(lastEarnings || 0)} • {lastMiles || 0} KM</p>
              </div>
            </button>

            {/* Quick Expense Button */}
            <button
              onClick={() => handleQuickClick('expense')}
              className="flex items-center gap-3 bg-[#1A1A1A] border border-rose-500/30 text-white pl-4 pr-6 py-4 rounded-[2rem] hover:bg-[#252525] transition-all group"
            >
              <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Repetir Último Gasto</p>
                <p className="text-sm font-black italic">{formatCurrency(lastEarnings || 0)} • {lastMiles || 0} KM</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen ? 'bg-white text-black rotate-45' : 'bg-emerald-500 text-black'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
      </button>
    </div>
  );
}
