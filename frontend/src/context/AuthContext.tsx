import React, { useState, useEffect, useCallback } from 'react';
import { authService, type StaffUser, type SystemStatus } from '../services/auth';
import { AuthContext } from './authTypes';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(() => {
    const saved = localStorage.getItem('oonjal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('oonjal_auth_token');
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(localStorage.getItem('oonjal_auth_token')));

  const checkSystemHealth = useCallback(async () => {
    try {
      const status = await authService.getSystemStatus();
      setSystemStatus(status);
    } catch {
      setSystemStatus(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    authService.getSystemStatus().then((status) => {
      if (isMounted) setSystemStatus(status);
    }).catch(() => {
      if (isMounted) setSystemStatus(null);
    });

    const interval = setInterval(() => {
      authService.getSystemStatus().then((status) => {
        if (isMounted) setSystemStatus(status);
      }).catch(() => {
        if (isMounted) setSystemStatus(null);
      });
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    authService.getStaffProfile()
      .then((profile) => {
        if (isMounted) {
          setUser(profile);
          localStorage.setItem('oonjal_user', JSON.stringify(profile));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('oonjal_auth_token');
          localStorage.removeItem('oonjal_user');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const loginWithEmail = async (email: string, password: string) => {
    const res = await authService.loginWithEmail(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('oonjal_auth_token', res.token);
    localStorage.setItem('oonjal_user', JSON.stringify(res.user));
  };

  const loginWithPin = async (pin: string) => {
    const res = await authService.loginWithPin(pin);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('oonjal_auth_token', res.token);
    localStorage.setItem('oonjal_user', JSON.stringify(res.user));
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const isOwner = user?.role === 'owner';
  const isManager = isOwner || user?.role === 'manager';
  const isCashier = isOwner || isManager || user?.role === 'cashier';
  const isKitchen = isOwner || isManager || user?.role === 'kitchen';
  const isStockManager = isOwner || isManager || user?.role === 'stock_manager';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        systemStatus,
        isLoading,
        loginWithEmail,
        loginWithPin,
        logout,
        checkSystemHealth,
        isOwner,
        isManager,
        isCashier,
        isKitchen,
        isStockManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
