import { createContext } from 'react';
import type { StaffUser, SystemStatus } from '../services/auth';

export interface AuthContextType {
  user: StaffUser | null;
  token: string | null;
  systemStatus: SystemStatus | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSystemHealth: () => Promise<void>;
  isOwner: boolean;
  isManager: boolean;
  isCashier: boolean;
  isKitchen: boolean;
  isStockManager: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
