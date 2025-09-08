



import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslate } from '../i18n';
import PageBanner from '../components/PageBanner';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

// IMPORTANT: Replace this URL with your actual deployed backend URL.
const API_URL = 'https://biophilia-front-back.onrender.com';

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslate();
  const navigate = ReactRouterDOM.useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        onLoginSuccess(user);
      } else {
        const data = await response.json();
        setError(data.message || t('loginError'));
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageBanner
        title={t('loginPageTitle')}
        imageUrl="https://images.unsplash.com/photo-1502514262629-82392e673426?q=80&w=1920&h=1080&fit=crop"
      />
      <div className="bg-brand-green-light py-12 md:py-20 flex-grow flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-brand-gray text-sm font-bold mb-2" htmlFor="username">
                    {t('loginUser')}
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
                    placeholder="admin"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-brand-gray text-sm font-bold mb-2" htmlFor="password">
                    {t('loginPass')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-brand-gray mb-3 leading-tight focus:outline-none focus:shadow-outline bg-white"
                    placeholder="password123"
                  />
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-brand-green-dark hover:bg-brand-green-dark/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                  >
                    {isLoading ? 'Signing In...' : t('signIn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="inline-block align-baseline font-bold text-sm text-brand-green-dark hover:text-brand-accent"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;