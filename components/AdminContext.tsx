import React, { createContext, ReactNode, useContext } from 'react';

interface AdminContextType {
  isLoggedIn: boolean;
  onUpdate: (path: string, value: any) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
  isLoggedIn: boolean;
  onUpdate: (path: string, value: any) => void;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children, isLoggedIn, onUpdate }) => {
  return (
    <AdminContext.Provider value={{ isLoggedIn, onUpdate }}>
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
