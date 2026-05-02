/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Clock,
  ArrowUpDown,
  Settings,
  X
} from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole, PlanType } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users', 'all_profiles', 'profiles'));
    // Wait, the current store uses users/{userId}/settings/current.
    // To list all users, we might need a separate collection for profiles that admin can read.
    // For now, I'll assume we have a collection of profiles.
    // If not, I'll have to adjust the data model.
    // Actually, in Phase 1, I defined users/{userId}/settings/current.
    // That's hard to list. I should have a top-level 'profiles' collection too.
    
    // I'll adjust useFirebaseStore to also write to a 'profiles' collection if possible,
    // or just list from 'users' if the admin has permission (needs recursive list which isn't great).
    // Let's use a 'profiles' collection.
    
    const unsubscribe = onSnapshot(collection(db, 'profiles'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdatePlan = async (userId: string, plan: PlanType) => {
    let planExpiry = null;
    const now = new Date();
    
    if (plan === PlanType.MONTHLY) {
      planExpiry = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
    } else if (plan === PlanType.ANNUAL) {
      planExpiry = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
    } else if (plan === PlanType.TRIAL) {
      planExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    try {
      // Update in both places
      await updateDoc(doc(db, 'profiles', userId), { plan, planExpiry });
      await updateDoc(doc(db, 'users', userId, 'settings', 'current'), { plan, planExpiry });
    } catch (error) {
      console.error('Failed to update plan', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-[#141414] border border-white/5 w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Painel do Administrador</h2>
              <p className="text-xs text-slate-500">Gestão de Usuários e Planos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-grow overflow-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm">Carregando usuários...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-white/5">
                  <th className="pb-4">Usuário</th>
                  <th className="pb-4">Plano Atual</th>
                  <th className="pb-4">Expiração</th>
                  <th className="pb-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="text-sm">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs">{user.displayName[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.displayName}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.plan === PlanType.LIFETIME ? 'bg-amber-500/10 text-amber-500' :
                        user.plan === PlanType.ANNUAL ? 'bg-emerald-500/10 text-emerald-500' :
                        user.plan === PlanType.MONTHLY ? 'bg-blue-500/10 text-blue-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">
                      {user.plan === PlanType.LIFETIME ? 'Vitalício' : 
                        user.planExpiry ? new Date(user.planExpiry).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4">
                      <select 
                        className="bg-[#0A0A0A] border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-emerald-500"
                        value={user.plan}
                        onChange={(e) => handleUpdatePlan(user.uid, e.target.value as PlanType)}
                      >
                        {Object.values(PlanType).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
