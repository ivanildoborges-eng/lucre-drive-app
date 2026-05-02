export interface Trip {
  id: string;
  date: string;
  miles: number;
  earnings: number;
  description: string;
  userId: string;
  type: 'income' | 'expense';
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum PlanType {
  TRIAL = 'trial',
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  LIFETIME = 'lifetime',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  monthlyGoal: number;
  currency: string;
  role: UserRole;
  plan: PlanType;
  planExpiry: string | null;
  createdAt: string;
  lastEarnings?: number;
  lastMiles?: number;
  shiftStart?: string | null;
  workHourGoal?: number;
}

export interface DashboardStats {
  totalNet: number;
  averagePerTrip: number;
  activeHours: number;
  fuelExpenses: number;
  tripsCount: number;
  goalProgress: number;
  remainingGoal: number;
  dailyTarget: number;
  hourlyRate: number;
  performanceStatus: 'above' | 'below' | 'neutral';
  todayEarnings: number;
  todayGoalProgress: number;
  dayProjection: number;
  hourlyTargetRemaining: number;
  isUrgent: boolean;
  historicalAverage: number;
  isNoEntryToday: boolean;
  shiftDurationHours: number;
  currentShiftHourlyRate: number;
  shiftStatus: 'active' | 'inactive';
  topEarnings: number[];
  lastEntryTime: number | null;
  showIdleAlert: boolean;
  isParsing: boolean;
}
