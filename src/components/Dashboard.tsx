/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Plus, Settings, Wallet, Fuel, Clock, LogOut, ShieldCheck, CreditCard, AlertCircle, ArrowUpDown, Zap, TrendingUp, CheckCircle2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useFirebaseStore } from '../hooks/useFirebaseStore';
import { MetricCard } from './MetricCard';
import { TripList } from './TripList';
import { AddTripModal } from './AddTripModal';
import { EarningsChart } from './EarningsChart';
import { GoalProgress } from './GoalProgress';
import { formatCurrency } from '../lib/utils';
import { UserRole, PlanType } from '../types';
import { AdminPanel } from './AdminPanel';
import { QuickActionFAB } from './QuickActionFAB';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const { trips, stats, userProfile, loading, addTrip, deleteTrip, updateGoal, quickAdd, finishDay, startShift, endShift, parseRideText } = useFirebaseStore(user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStreetMode, setIsStreetMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handlePaste = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text) {
      const success = await parseRideText(text);
      if (success) {
        setPasteText('');
        // Poderia adicionar um som de sucesso aqui
      }
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
          <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest animate-pulse">Sincronizando Dados...</span>
        </div>
      </div>
    );
  }

  const isPlanExpired = userProfile?.planExpiry && new Date(userProfile.planExpiry) < new Date();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans p-4 md:p-8 flex flex-col max-w-7xl mx-auto relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <AnimatePresence>
        {isStreetMode && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-black p-8 flex flex-col"
          >
            {/* Header: Projeção and Progress */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Projeção Final</h2>
                <div className="text-6xl font-black italic tracking-tighter tabular-nums">{formatCurrency(stats.dayProjection)}</div>
              </div>
              <button 
                onClick={() => setIsStreetMode(false)}
                className="w-16 h-16 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>

            {/* Central Metrics - Ultra High Contrast */}
            <div className="flex-grow flex flex-col justify-center gap-12 text-center md:text-left">
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-[#101010] p-10 rounded-[3rem] border-2 border-emerald-500/20">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500 block mb-4">Ganho Hoje</span>
                  <div className="text-8xl font-black italic tabular-nums leading-none tracking-tighter text-white">{formatCurrency(stats.todayEarnings)}</div>
                </div>

                <div className={`p-10 rounded-[3rem] border-2 flex items-center justify-between ${
                  stats.performanceStatus === 'above' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Meta/H Restante</span>
                    <div className={`text-5xl font-black italic tabular-nums ${
                      stats.performanceStatus === 'above' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatCurrency(stats.hourlyTargetRemaining)}
                    </div>
                  </div>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                    stats.performanceStatus === 'above' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                  }`}>
                     {stats.performanceStatus === 'above' ? <ShieldCheck className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                  </div>
                </div>

                {/* Smart Paste Input */}
                <div className="relative group">
                  <textarea
                    placeholder="Cole aqui o texto da corrida do Uber/99..."
                    value={pasteText}
                    onChange={handlePaste}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 text-white text-sm font-medium focus:border-emerald-500/50 outline-none transition-all resize-none h-24"
                  />
                  <div className="absolute right-6 top-6 text-emerald-500 opacity-50 group-hover:opacity-100">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Instant Action Buttons - Extra Large for Car Use */}
              <div className="grid grid-cols-3 gap-6">
                {stats.topEarnings.map((val) => (
                  <button
                    key={`street-${val}`}
                    onClick={() => quickAdd('income', val, userProfile?.lastMiles || 5)}
                    className="h-32 bg-white text-black rounded-[2.5rem] flex flex-col items-center justify-center active:scale-95 transition-transform"
                  >
                    <span className="text-xs font-black opacity-50 uppercase tracking-widest">R$</span>
                    <span className="text-4xl font-extrabold italic">{val}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-slate-600 animate-pulse">
               <Zap className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Tracking System</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shift Control Overlay (Mobile Friendly) */}
      <div className="fixed top-24 right-4 z-40 flex flex-col gap-2 scale-90 origin-right sm:scale-100">
        {stats.shiftStatus === 'active' ? (
          <div className="flex flex-col gap-2 items-end">
            <motion.button
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => setIsStreetMode(true)}
              className="bg-blue-600 text-white px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center gap-2"
            >
              <Zap className="w-3 h-3" />
              Modo Rua
            </motion.button>
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 pl-4 pr-2 py-2 rounded-2xl"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Turno Ativo</span>
                <span className="text-xs font-black italic tabular-nums">{stats.shiftDurationHours.toFixed(1)}h em curso</span>
              </div>
              <button 
                onClick={endShift}
                className="bg-rose-500 text-white p-2 rounded-xl hover:bg-rose-600 transition-colors shadow-lg"
                title="Encerrar Turno"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        ) : (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={startShift}
            className="bg-emerald-500 text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Iniciar Turno
          </motion.button>
        )}
      </div>

      {/* Intelligent Alerts Panel */}
      <AnimatePresence>
        {stats.showIdleAlert && stats.shiftStatus === 'active' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-32 left-8 right-8 z-[60] md:left-auto md:right-8 md:w-96"
          >
            <div className="bg-[#1A1A1A] border-2 border-amber-500/50 p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black flex-shrink-0 animate-bounce">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-1">Detecção de Inatividade</h4>
                <p className="text-sm font-bold text-white leading-tight">Você ainda está em turno? Deseja registrar um ganho médio agora?</p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => quickAdd('income', Math.round(stats.historicalAverage / 10), 5)}
                    className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                  >
                    Sim, Registrar
                  </button>
                  <button 
                    onClick={() => endShift()}
                    className="bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                  >
                    Encerrar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <LayoutDashboard className="w-7 h-7 text-black" />
            </motion.div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter block leading-none italic uppercase">LUCRO DRIVE</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Painel Operacional</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-8">
          {/* Plan Badge */}
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                isPlanExpired ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {userProfile?.plan || PlanType.TRIAL}
              </span>
              <CreditCard className={`w-3 h-3 ${isPlanExpired ? 'text-rose-500' : 'text-slate-500'}`} />
            </div>
            {userProfile?.planExpiry && (
              <span className="text-[10px] text-slate-500 italic">
                {isPlanExpired ? 'Expirado em ' : 'Expira em '} 
                {new Date(userProfile.planExpiry).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl border border-white/10 p-1 bg-white/5 backdrop-blur-md">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=10b981&color=fff`} 
                alt="Avatar" 
                className="w-full h-full rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              onClick={handleLogout}
              className="w-11 h-11 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative z-10">
        
        {/* Left Section: Key Metrics */}
        <div className="col-span-1 lg:col-span-8 flex flex-col space-y-8">
          
          {/* Smart Estimation Card (If no entry today) */}
          {stats.isNoEntryToday && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-24 h-24 text-blue-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-black">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 italic">Estimativa Inteligente</h3>
                    <p className="text-sm font-medium text-slate-400">Você ainda não registrou ganhos hoje.</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black italic">{formatCurrency(stats.historicalAverage)}</span>
                  <span className="text-xs text-slate-500 uppercase font-black tracking-widest">Média Histórica Diária</span>
                </div>
                <p className="mt-4 text-xs text-slate-500 max-w-md">
                  Baseado no seu padrão dos últimos 7 dias, sua projeção de fechamento é de {formatCurrency(stats.historicalAverage)}. 
                  Registre sua primeira corrida para atualizar o status real.
                </p>
              </div>
            </motion.div>
          )}

          {/* Pressure & decision Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-1 rounded-[2.5rem] bg-gradient-to-r ${
              stats.performanceStatus === 'above' 
                ? 'from-emerald-500/40 to-blue-500/40' 
                : stats.performanceStatus === 'below'
                ? 'from-rose-500/40 to-orange-500/40'
                : 'from-amber-500/40 to-yellow-500/40'
            }`}
          >
            <div className="bg-[#0A0A0A] rounded-[2.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
               {/* Background Glow */}
               <div className={`absolute inset-0 opacity-10 blur-3xl pointer-events-none ${
                 stats.performanceStatus === 'above' ? 'bg-emerald-500' : stats.performanceStatus === 'below' ? 'bg-rose-500' : 'bg-amber-500'
               }`}></div>

               <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                 <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${
                   stats.performanceStatus === 'above' ? 'bg-emerald-500 text-black' : stats.performanceStatus === 'below' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                 }`}>
                   {stats.performanceStatus === 'above' ? <ShieldCheck className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                 </div>
                 <div>
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Status Operacional</h3>
                   <p className="text-xl md:text-2xl font-black italic uppercase italic leading-tight">
                     {stats.performanceStatus === 'above' 
                       ? "🔥 Voando! Acima da meta" 
                       : stats.performanceStatus === 'below'
                       ? "⚠️ Alerta: Abaixo da meta"
                       : "⚡ Estável: Proporcional"}
                   </p>
                   <p className="text-sm text-slate-400 mt-1 font-medium">
                     {stats.performanceStatus === 'above' 
                       ? `Ritmo ideal! Ganho médio de ${formatCurrency(stats.currentShiftHourlyRate)}/h no turno.` 
                       : `Abaixo do ritmo. Necessário ${formatCurrency(stats.hourlyTargetRemaining)}/h no tempo restante.`}
                   </p>
                 </div>
               </div>

               <div className="flex flex-col items-end gap-3 relative z-10 w-full md:w-auto">
                 <div className="flex gap-2">
                   {stats.isUrgent && (
                      <div className="flex items-center gap-2 bg-rose-500/20 text-rose-500 px-4 py-2 rounded-full border border-rose-500/30 animate-pulse">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ritmo Crítico</span>
                      </div>
                   )}
                   {stats.shiftStatus === 'active' && (
                      <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/30">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Turno Live</span>
                      </div>
                   )}
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Projeção de Turno</span>
                    <span className="text-3xl font-black italic tabular-nums text-white">{formatCurrency(stats.dayProjection)}</span>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Daily Goal Progression Bar */}
          <div className="bg-[#101010] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Progresso Diário</span>
              <span className="text-sm font-black italic">{Math.round(stats.todayGoalProgress)}%</span>
            </div>
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, stats.todayGoalProgress)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  stats.todayGoalProgress >= 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                    : stats.todayGoalProgress >= 70
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
              />
            </div>
            <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
               <span>Início do Turno</span>
               <div className="flex items-center gap-2 text-emerald-500/50">
                 <ArrowUpDown className="w-3 h-3" />
                 <span>Necessário/H: {formatCurrency(stats.hourlyTargetRemaining)}</span>
               </div>
               <span>Meta Batida</span>
            </div>
          </div>

          {/* Quick Tap Gain Panel */}
          <div className="bg-[#101010] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Registro Express</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                <Zap className="w-3 h-3" />
                Live: 1-Toque
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {stats.topEarnings.map((val) => (
                <motion.button
                  key={val}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => quickAdd('income', val, userProfile?.lastMiles || 5)}
                  className="group relative h-24 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 overflow-hidden"
                >
                  <div className="text-[10px] text-slate-600 font-black mb-1 group-hover:text-emerald-500 tracking-widest">R$</div>
                  <div className="text-2xl font-black italic group-hover:scale-110 transition-transform">{val}</div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </motion.button>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">Sugestões baseadas no seu histórico real</p>
          </div>

          {/* Main Hero Metric - High Realistic Styling */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                <h2 className="text-xs text-slate-500 uppercase font-black tracking-[0.3em]">Lucro Líquido Real</h2>
              </div>
              
              <div className="flex items-baseline space-x-6 flex-wrap">
                <span className="text-6xl md:text-8xl font-black tracking-tighter text-white tabular-nums">
                  {formatCurrency(stats.totalNet)}
                </span>
                <div className="flex flex-col">
                  <span className="text-emerald-400 font-black text-xl italic">+12%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Semanal</span>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Restante Mês</div>
                  <div className="text-xl font-black italic">{formatCurrency(stats.remainingGoal)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Meta Diária</div>
                  <div className="text-xl font-black italic text-emerald-400">{formatCurrency(stats.dailyTarget)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Eficácia/H</div>
                  <div className="text-xl font-black italic">{formatCurrency(stats.hourlyRate)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Meta Mês</div>
                  <div className="text-xl font-black italic text-slate-500">{formatCurrency(userProfile?.monthlyGoal || 0)}</div>
                </div>
              </div>
            </div>
            {/* Abstract Decorative Graphics */}
            <div className="absolute -right-20 bottom-0 top-0 w-1/2 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none rotate-12" />
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <MetricCard 
              label="Média / Corrida" 
              value={formatCurrency(stats.averagePerTrip)} 
              progress={75} 
              color="emerald" 
              icon={<Wallet className="w-4 h-4 text-emerald-400" />}
            />
            <MetricCard 
              label="Eficácia (Horas)" 
              value={`${stats.activeHours.toFixed(1)}h`} 
              progress={60} 
              color="blue" 
              icon={<Clock className="w-4 h-4 text-blue-400" />}
            />
            <MetricCard 
              label="Operacional (Comb)" 
              value={formatCurrency(Math.abs(stats.fuelExpenses))} 
              progress={Math.min(100, (Math.abs(stats.fuelExpenses) / 1000) * 100)} 
              color="rose" 
              icon={<Fuel className="w-4 h-4 text-rose-400" />}
            />
          </div>

          {/* Performance Graph */}
          <div className="bg-[#101010]/50 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 flex-grow flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest italic">Desempenho Temporal</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gráfico de Ganhos Dinâmicos</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex-grow">
              <EarningsChart trips={trips} />
            </div>
          </div>
        </div>

        {/* Right Section: Activity & Actions */}
        <div className="col-span-1 lg:col-span-4 flex flex-col space-y-8">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-xl group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>Lançar Ganho</span>
            </button>
            
            <div className="flex gap-4">
              <button className="flex-grow bg-[#1A1A1A] text-white border border-white/5 font-bold py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#252525] transition-all flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Ajustes</span>
              </button>
              
              <button 
                onClick={() => {
                  const val = prompt('Confirme o faturamento total bruto de hoje:', stats.todayEarnings.toString());
                  const km = prompt('Confirme o KM total rodado hoje:', '0');
                  if (val && km) finishDay(parseFloat(val), parseFloat(km));
                }}
                className="flex-grow bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Fechar Dia</span>
              </button>

              {userProfile?.role === UserRole.ADMIN && (
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="flex-grow bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>

          {/* Recent Trip List */}
          <div className="bg-[#101010]/80 border border-white/5 rounded-[2rem] p-8 flex-grow overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Logs Recentes</h3>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{trips.length} Ativos</span>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-grow pr-2">
              <TripList trips={trips} onDelete={deleteTrip} />
              {trips.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600 grayscale opacity-50">
                  <LayoutDashboard className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase font-black tracking-widest">Nenhum registro encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress To Goal */}
          <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-transparent">
            <div className="bg-[#141414] rounded-[2.3rem] p-8">
              <GoalProgress current={stats.totalNet} goal={userProfile?.monthlyGoal || 5000} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest font-black gap-6 relative z-10">
        <div className="flex space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
            <span>SERVIDOR ONLINE [SP-01]</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
            <span>SYNC DATA: VERIFICADO</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="italic">MOTORISTA ID • {user.uid.slice(0, 10).toUpperCase()}</span>
          <div className="w-[1px] h-3 bg-white/10" />
          <span>V1.2.0 STABLE</span>
        </div>
      </footer>

      {/* Modals */}
      <AddTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addTrip} 
      />

      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>

      <QuickActionFAB 
        onQuickAdd={quickAdd} 
        lastEarnings={userProfile?.lastEarnings} 
        lastMiles={userProfile?.lastMiles} 
      />
    </div>
  );
}
