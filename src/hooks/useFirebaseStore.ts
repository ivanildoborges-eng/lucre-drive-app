/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Trip, DashboardStats, UserProfile, UserRole, PlanType } from '../types';
import { User } from 'firebase/auth';

export function useFirebaseStore(user: User | null) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for trips
    const tripsRef = collection(db, 'entries');
    const q = query(
      tripsRef, 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribeTrips = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trip[];
      setTrips(tripsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'entries');
    });

    // Listen for user settings
    const profileRef = doc(db, 'users', user.uid, 'settings', 'current');
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // Initialize if not exists
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Motorista',
          monthlyGoal: 5000,
          currency: 'R$',
          photoURL: user.photoURL || undefined,
          role: user.email === 'ivanildo_borges@hotmail.com' ? UserRole.ADMIN : UserRole.USER,
          plan: PlanType.TRIAL,
          planExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        };
        // Save to user settings
        setDoc(profileRef, initialProfile as any);
        // Save to global profiles collection for admin
        setDoc(doc(db, 'profiles', user.uid), initialProfile as any);
        setUserProfile(initialProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/settings/current`);
    });

    return () => {
      unsubscribeTrips();
      unsubscribeProfile();
    };
  }, [user]);

  const addTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const entryDataWithMeta = {
        ...tripData,
        userId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await addDoc(collection(db, 'entries'), entryDataWithMeta);
      
      // Update last used values for suggestions
      const profileRef = doc(db, 'users', user.uid, 'settings', 'current');
      const updateData = {
        lastEarnings: tripData.earnings,
        lastMiles: tripData.miles
      };
      await setDoc(profileRef, updateData, { merge: true });
      await setDoc(doc(db, 'profiles', user.uid), updateData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'entries');
    }
  };

  const quickAdd = async (type: 'income' | 'expense', earnings: number, miles: number) => {
    if (!user) return;
    try {
      const entryData = {
        userId: user.uid,
        type,
        earnings,
        miles,
        date: new Date().toISOString(),
        description: type === 'income' ? 'Ganho Rápido' : 'Gasto Rápido',
        category: type === 'income' ? 'Corrida' : 'Geral',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await addDoc(collection(db, 'entries'), entryData);
      
      // Update last values
      const profileRef = doc(db, 'users', user.uid, 'settings', 'current');
      const updateData = { lastEarnings: earnings, lastMiles: miles };
      await setDoc(profileRef, updateData, { merge: true });
      await setDoc(doc(db, 'profiles', user.uid), updateData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'entries');
    }
  };

  const finishDay = async (totalDayEarnings: number, totalDayMiles: number) => {
    if (!user) return;
    // Clear today's partial entries and add a single "Day Summary" entry
    // For simplicity, we just add a "Resumo do Dia" entry
    try {
      await quickAdd('income', totalDayEarnings, totalDayMiles);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'entries');
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'entries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `entries/${id}`);
    }
  };

  const updateGoal = async (newGoal: number) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'current'), {
        monthlyGoal: newGoal
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/settings/current`);
    }
  };

  const startShift = async () => {
    if (!user) return;
    try {
      const shiftStart = new Date().toISOString();
      await setDoc(doc(db, 'users', user.uid, 'settings', 'current'), { shiftStart }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/settings/current`);
    }
  };

  const endShift = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'current'), { shiftStart: null }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/settings/current`);
    }
  };

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay + 1);

  const totalNet = trips.reduce((acc, t) => acc + (t.type === 'income' ? t.earnings : -t.earnings), 0);
  const monthlyGoal = userProfile?.monthlyGoal || 5000;
  const remainingGoal = Math.max(0, monthlyGoal - totalNet);
  const dailyTarget = remainingGoal / remainingDays;
  
  // Calcula ganhos de hoje para o status de performance
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
  const todayEarnings = trips
    .filter(t => new Date(t.date).getTime() >= todayStart && t.type === 'income')
    .reduce((acc, t) => acc + t.earnings, 0);

  // Projeção e Meta por hora
  const workStartHour = 8;
  const workEndHour = 22;
  const currentHour = now.getHours();
  
  const shiftStart = userProfile?.shiftStart ? new Date(userProfile.shiftStart) : null;
  const shiftDurationHours = shiftStart ? Math.max(0.1, (now.getTime() - shiftStart.getTime()) / (1000 * 3600)) : 0;
  const workHourGoal = userProfile?.workHourGoal || 8;
  const hoursRemainingInShift = Math.max(0.1, workHourGoal - shiftDurationHours);

  const hoursWorkedSoFar = shiftStart ? shiftDurationHours : Math.max(0.5, currentHour - workStartHour);
  const hoursRemaining = shiftStart ? hoursRemainingInShift : Math.max(0.5, workEndHour - currentHour);
  
  const dayProjection = hoursWorkedSoFar > 0 ? (todayEarnings / hoursWorkedSoFar) * (shiftStart ? workHourGoal : (workEndHour - workStartHour)) : 0;
  const hourlyTargetRemaining = hoursRemaining > 0 ? Math.max(0, (dailyTarget - todayEarnings) / hoursRemaining) : 0;
  const isUrgent = hoursRemaining < 4 && todayEarnings < dailyTarget;

  // Historical Average (Last 7 days)
  const last7Days = trips.filter(t => t.type === 'income' && new Date(t.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
  const distinctDays = new Set(last7Days.map(t => new Date(t.date).toLocaleDateString())).size || 1;
  const historicalAverage = last7Days.reduce((acc, t) => acc + t.earnings, 0) / distinctDays;
  const isNoEntryToday = todayEarnings === 0;

  // Calculate Top 3 most frequent earnings for quick buttons
  const earningsFreq: Record<number, number> = {};
  trips.filter(t => t.type === 'income').forEach(t => {
    earningsFreq[t.earnings] = (earningsFreq[t.earnings] || 0) + 1;
  });
  const topEarnings = Object.entries(earningsFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => Number(entry[0]));
    
  // Default values if no history
  if (topEarnings.length < 3) {
    [15, 25, 35].forEach(v => {
      if (!topEarnings.includes(v) && topEarnings.length < 3) topEarnings.push(v);
    });
  }

  const lastEntry = trips.length > 0 ? Math.max(...trips.map(t => t.createdAt)) : null;
  const isIdle = userProfile?.shiftStart && lastEntry && (Date.now() - lastEntry > 2 * 3600 * 1000); // 2 hours without entry

  const stats: DashboardStats = {
    totalNet,
    remainingGoal,
    dailyTarget,
    averagePerTrip: trips.length > 0 
      ? trips.filter(t => t.type === 'income').reduce((acc, t) => acc + t.earnings, 0) / trips.filter(t => t.type === 'income').length || 0
      : 0,
    activeHours: trips.reduce((acc, t) => acc + (t.miles / 20), 0),
    fuelExpenses: trips.filter(t => t.category?.toLowerCase() === 'combustível' || t.description?.toLowerCase().includes('combustível'))
      .reduce((acc, t) => acc + t.earnings, 0),
    tripsCount: trips.filter(t => t.type === 'income').length,
    goalProgress: monthlyGoal > 0 ? (totalNet / monthlyGoal) * 100 : 0,
    hourlyRate: totalNet / (trips.reduce((acc, t) => acc + (t.miles / 20), 0) || 1),
    performanceStatus: todayEarnings >= dailyTarget ? 'above' : (todayEarnings > (dailyTarget * 0.7) ? 'neutral' : 'below'),
    todayEarnings,
    todayGoalProgress: dailyTarget > 0 ? (todayEarnings / dailyTarget) * 100 : 0,
    dayProjection,
    hourlyTargetRemaining,
    isUrgent,
    historicalAverage,
    isNoEntryToday,
    shiftDurationHours,
    currentShiftHourlyRate: shiftDurationHours > 0 ? todayEarnings / shiftDurationHours : 0,
    shiftStatus: userProfile?.shiftStart ? 'active' : 'inactive',
    topEarnings: topEarnings.sort((a, b) => a - b),
    lastEntryTime: lastEntry,
    showIdleAlert: !!isIdle,
    isParsing: false,
  };

  const parseRideText = async (text: string) => {
    // Regex avançado para capturar valores em BRL e distâncias em KM
    // Captura R$ 25,50 ou apenas 25,50 associado a palavras-chave
    const moneyMatch = text.match(/(?:R\$|Total|Ganho|Preço|Valor)[\s:]*([\d]{1,3}(?:\.[\d]{3})*(?:,[\d]{2}))/i) || 
                       text.match(/(?:R\$|Total|Ganho|Preço|Valor)[\s:]*([\d,.]+)/i);
    
    const kmMatch = text.match(/([\d,.]+)\s*(?:km|quilômetros|quilômetro|distância)/i);

    let earnings = 0;
    let miles = 0;

    if (moneyMatch) {
      // Limpa pontos de milhar e substitui vírgula decimal por ponto
      const cleanValue = moneyMatch[1].replace(/\./g, '').replace(',', '.');
      const val = parseFloat(cleanValue);
      if (!isNaN(val)) earnings = val;
    }
    
    if (kmMatch) {
      const cleanKm = kmMatch[1].replace(',', '.');
      const val = parseFloat(cleanKm);
      if (!isNaN(val)) miles = val;
    }

    if (earnings > 0) {
      await quickAdd('income', earnings, miles || 5);
      return true;
    }
    return false;
  };

  return {
    trips,
    stats,
    userProfile,
    loading,
    addTrip,
    deleteTrip,
    quickAdd,
    finishDay,
    updateGoal,
    startShift,
    endShift,
    parseRideText
  };
}
