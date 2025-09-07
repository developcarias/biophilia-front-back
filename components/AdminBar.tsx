import React from 'react';
import { useTranslate } from '../i18n';
// FIX: Changed to namespace import to resolve module resolution issues with react-router-dom.
import * as ReactRouterDOM from 'react-router-dom';

interface AdminBarProps {
  onLogout: () => void;
}

const AdminBar: React.FC<AdminBarProps> = ({ onLogout }) => {
  const t = useTranslate();
  return (
    <div className="sticky top-0 bg-yellow-400 text-black h-14 z-50 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="font-bold">
          <span className="mr-4">⚠️ {t('adminBarNotice')}</span>
          <ReactRouterDOM.NavLink to="/admin" className="text-sm underline hover:text-gray-700">Go to Panel</ReactRouterDOM.NavLink>
        </div>
        <button
          onClick={onLogout}
          className="bg-gray-800 text-white text-sm font-bold py-2 px-4 rounded hover:bg-gray-700 transition-colors"
        >
          {t('exitAdminMode')}
        </button>
      </div>
    </div>
  );
};

export default AdminBar;