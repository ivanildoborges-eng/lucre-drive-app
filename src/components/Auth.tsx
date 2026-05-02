/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Car, Mail, Lock, UserPlus, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDriving, setIsDriving] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      // Wait for animation trigger
      setIsDriving(true);
      setTimeout(async () => {
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (e: any) {
          console.error('Login failed', e);
          setError('Falha ao entrar com Google. Verifique se pop-ups estão permitidos.');
          setIsDriving(false);
          setLoading(false);
        }
      }, 1000);
    } catch (error: any) {
      console.error('Login failed', error);
      setError('Falha ao entrar com Google. Tente novamente.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      setIsDriving(true);
      
      setTimeout(async () => {
        try {
          if (isRegistering) {
            await createUserWithEmailAndPassword(auth, email, password);
          } else {
            await signInWithEmailAndPassword(auth, email, password);
          }
        } catch (error: any) {
          console.error('Auth failed', error);
          setIsDriving(false);
          setLoading(false);
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            setError('E-mail ou senha incorretos.');
          } else if (error.code === 'auth/email-already-in-use') {
            setError('Este e-mail já está em uso.');
          } else if (error.code === 'auth/weak-password') {
            setError('A senha deve ter pelo menos 6 caracteres.');
          } else {
            setError('Ocorreu um erro. Verifique sua conexão ou se o e-mail/senha estão corretos.');
          }
        }
      }, 1000);
    } catch (error: any) {
      console.error('Auth preparation failed', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Cinematic Background: Moving Road */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]"></div>
        
        {/* Sky / City Blur */}
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-20 blur-sm brightness-50"></div>
        
        {/* Road Perspective */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] h-[60vh] perspective-[1000px] overflow-hidden">
          <motion.div 
            animate={{ backgroundPosition: '0% 100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [transform:rotateX(60deg)_translateY(-100px)] origin-top"
          ></motion.div>
          
          {/* Dashboard/Grid Lines */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Car Animation */}
      <AnimatePresence>
        <motion.div 
          initial={{ x: 0, y: 100, opacity: 0 }}
          animate={{ 
            x: isDriving ? [0, -10, 10, -5, 500] : 0, 
            y: 0, 
            opacity: 1,
            scale: isDriving ? [1, 1.05, 1.1, 0.8] : 1
          }}
          transition={{ 
            duration: isDriving ? 1.5 : 1,
            times: isDriving ? [0, 0.1, 0.2, 0.3, 1] : []
          }}
          className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          {/* Car Silhouette/Icon Wrapper */}
          <div className="relative">
            <div className={`w-32 h-16 bg-gradient-to-r from-slate-900 to-black rounded-b-xl border-t border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative transition-all duration-300 ${isDriving ? 'brightness-150' : ''}`}>
              <div className="absolute top-0 left-2 right-2 h-8 bg-slate-800/50 rounded-t-lg border border-white/10 [clip-path:polygon(10%_0%,90%_0%,100%_100%,0%_100%)]"></div>
              {/* Headlights */}
              <div className="absolute -left-2 top-8 w-4 h-2 bg-emerald-400 blur-sm rounded-full opacity-50"></div>
              <div className="absolute -right-2 top-8 w-4 h-2 bg-emerald-400 blur-sm rounded-full opacity-50"></div>
              {/* Taillights */}
              <div className="absolute left-1 bottom-1 w-6 h-1 bg-rose-500 blur-[2px] rounded-full"></div>
              <div className="absolute right-1 bottom-1 w-6 h-1 bg-rose-500 blur-[2px] rounded-full"></div>
            </div>
            {/* Ground Shadow/Glow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-emerald-500/10 blur-xl rounded-full"></div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: loading ? 0 : 1, scale: 1 }}
        className="max-w-md w-full bg-[#141414]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-20"
      >
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Lucro Drive Pro</span>
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tighter italic">LUCRO DRIVE</h1>
        <p className="text-slate-400 mb-10 text-sm font-medium">Acelere sua vida financeira com inteligência.</p>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 text-xs text-left"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
          <div className="space-y-2 text-left">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-2">Acesso por E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-emerald-500/30 focus:bg-[#0F0F0F] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-2">Senha de Acesso</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-emerald-500/30 focus:bg-[#0F0F0F] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black py-4.5 rounded-2xl flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                <span className="uppercase tracking-widest text-xs">{isRegistering ? 'Criar Minha Conta' : 'Iniciar Sessão'}</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-6 mb-8">
          <div className="h-[1px] flex-grow bg-white/5"></div>
          <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Conexão Social</span>
          <div className="h-[1px] flex-grow bg-white/5"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-white border border-white/5 font-bold py-4.5 rounded-2xl flex items-center justify-center space-x-4 hover:bg-[#222] transition-all disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" alt="Google" />
          <span className="text-xs uppercase tracking-widest">Entrar com Google</span>
        </button>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-10 text-xs text-slate-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-3 mx-auto group"
        >
          <span className="font-bold uppercase tracking-widest text-[10px]">
            {isRegistering ? 'Já possui acesso?' : 'Novos motoristas'}
          </span>
          <span className="text-emerald-500 font-bold group-hover:underline">
            {isRegistering ? 'Faça Login' : 'Cadastre-se Agora'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-30 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-700">
          <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Verified Secure</div>
          <div className="flex gap-4">
            <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
            <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

