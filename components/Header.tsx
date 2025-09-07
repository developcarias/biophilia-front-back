

import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';
import { useI18n } from '../i18n';
import { GlobalContent, UIText } from '../types';
import FacebookIcon from './icons/FacebookIcon';
import InstagramIcon from './icons/InstagramIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import XIcon from './icons/XIcon';
import UsaFlagIcon from './icons/UsaFlagIcon';
import SpainFlagIcon from './icons/SpainFlagIcon';
import { useAdmin } from './AdminContext';

interface HeaderProps {
  content: GlobalContent;
  uiText: UIText;
}

const Header: React.FC<HeaderProps> = ({ content, uiText }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useI18n();
  const { isLoggedIn } = useAdmin();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const headerBaseStyle = `sticky ${isLoggedIn ? 'top-14' : 'top-0'} left-0 right-0 z-40 transition-all duration-300`;
  const headerScrolledStyle = "bg-brand-accent/60 backdrop-blur-md shadow-lg";
  const headerTopStyle = "bg-transparent";

  const headerClass = `${headerBaseStyle} ${isScrolled || isMobileMenuOpen ? headerScrolledStyle : headerTopStyle}`;
  
  const socialIconsMap = {
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    linkedin: LinkedInIcon,
    twitter: XIcon
  }

  const renderSocialIcons = (iconSize = "h-5 w-5") => (
    <>
      {content.socialLinks.map(social => {
        const Icon = socialIconsMap[social.id];
        return (
          <a key={social.id} href={social.url} aria-label={social.id} className="hover:text-brand-yellow transition-colors">
            {Icon && <Icon className={iconSize} />}
          </a>
        );
      })}
    </>
  );

  const renderMobileMenu = () => (
    <div className="fixed inset-0 z-50 bg-brand-accent text-white lg:hidden overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">
          <ReactRouterDOM.NavLink to="/" onClick={closeMenu} className="flex items-center space-x-3 text-white">
            <img src={content.logoUrl} alt="Biophilia Institute Logo" className="w-auto h-20" />
          </ReactRouterDOM.NavLink>
          <button onClick={closeMenu} className="text-white p-2" aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between pb-24">
          <nav className="flex flex-col space-y-4 pt-10">
            {content.navigation.map(link => (
              <ReactRouterDOM.NavLink key={link.id} to={link.to} onClick={closeMenu} className="text-2xl font-bold py-2 hover:text-brand-yellow transition-colors text-center" end={link.end}>{link.label[language]}</ReactRouterDOM.NavLink>
            ))}
          </nav>
          <div className="space-y-6 mt-12">
            <div className="flex items-center justify-between">
              <span className="text-lg">Language / Idioma</span>
              <button onClick={toggleLanguage} className="border-2 border-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label={`Change language to ${language === 'en' ? 'Español' : 'English'}`}>
                {language === 'en' 
                  ? <UsaFlagIcon className="w-full h-full rounded-full" /> 
                  : <SpainFlagIcon className="w-full h-full rounded-full" />
                }
              </button>
            </div>
            <ReactRouterDOM.NavLink to="/donate" onClick={closeMenu} className="block w-full">
              <button className="w-full bg-brand-yellow text-brand-green-dark px-4 py-3 rounded-md text-lg font-bold hover:opacity-90 transition-opacity">
                {uiText.donateNow[language]}
              </button>
            </ReactRouterDOM.NavLink>
            <div className="flex justify-center space-x-6">
              {renderSocialIcons("h-6 w-6")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className={headerClass}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-28">
            
            <div className="flex-shrink-0">
              <ReactRouterDOM.NavLink to="/" className="flex items-center space-x-3 text-white">
                <img src={content.logoUrl} alt="Biophilia Institute Logo" className="w-auto h-20" />
              </ReactRouterDOM.NavLink>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {content.navigation.map(link => {
                  const navLinkClasses = "text-white text-xl font-medium py-2 border-b-2 transition-colors duration-300";
                  return (
                    <ReactRouterDOM.NavLink
                      key={link.id}
                      to={link.to}
                      className={({isActive}) => `${navLinkClasses} ${isActive ? 'border-white' : 'border-transparent hover:border-white/50'}`}
                      end={link.end}
                    >
                      {link.label[language]}
                    </ReactRouterDOM.NavLink>
                  );
              })}
            </nav>

            <div className="flex items-center">
              <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center space-x-4">
                    <button onClick={toggleLanguage} className="border-2 border-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label={`Change language to ${language === 'en' ? 'Español' : 'English'}`}>
                      {language === 'en' 
                        ? <UsaFlagIcon className="w-full h-full rounded-full" /> 
                        : <SpainFlagIcon className="w-full h-full rounded-full" />
                      }
                    </button>
                    <ReactRouterDOM.NavLink to="/donate">
                        <button className="bg-brand-yellow text-brand-green-dark px-5 py-2 rounded-md text-base font-bold hover:opacity-90 transition-opacity shadow-md">
                            {uiText.donateNow[language]}
                        </button>
                    </ReactRouterDOM.NavLink>
                </div>
                <div className="flex items-center space-x-4 text-white mt-3">
                    {renderSocialIcons("h-5 w-5")}
                </div>
              </div>

              <div className="lg:hidden flex items-center ml-4 space-x-2">
                <button onClick={toggleLanguage} className="border-2 border-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label={`Change language to ${language === 'en' ? 'Español' : 'English'}`}>
                    {language === 'en'
                        ? <UsaFlagIcon className="w-full h-full rounded-full" />
                        : <SpainFlagIcon className="w-full h-full rounded-full" />
                    }
                </button>
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2" aria-label="Open menu">
                  <MenuIcon />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>
      {isMobileMenuOpen && renderMobileMenu()}
    </>
  );
};

export default Header;