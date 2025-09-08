import React, { createContext, ReactNode, useContext } from 'react';
import { User } from '../types';

interface AdminContextType {
  isLoggedIn: boolean;
  onUpdate: (path: string, value: any) => void;
  currentUser: User | null;
  openMediaLibrary: (path: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
  isLoggedIn: boolean;
  onUpdate: (path: string, value: any) => void;
  currentUser: User | null;
  openMediaLibrary: (path: string) => void;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children, isLoggedIn, onUpdate, currentUser, openMediaLibrary }) => {
  return (
    <AdminContext.Provider value={{ isLoggedIn, onUpdate, currentUser, openMediaLibrary }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};