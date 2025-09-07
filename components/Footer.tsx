

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Imported useTranslate hook to resolve "Cannot find name" error.
import { useI18n, useTranslate } from '../i18n';
import { GlobalContent } from '../types';
import FacebookIcon from './icons/FacebookIcon';
import InstagramIcon from './icons/InstagramIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import XIcon from './icons/XIcon';

interface FooterProps {
  content: GlobalContent;
}

const Footer: React.FC<FooterProps> = ({ content }) => {
  const t = useTranslate();
  const { language } = useI18n();
  
  const socialIconsMap = {
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    linkedin: LinkedInIcon,
    twitter: XIcon
  }

  return (
    <footer className="bg-brand-accent/60 backdrop-blur-md text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <ReactRouterDOM.NavLink to="/" className="inline-block mb-4">
              <img src={content.logoUrl} alt="Biophilia Institute Logo" className="w-auto h-16" />
            </ReactRouterDOM.NavLink>
            <p className="text-sm text-gray-200 max-w-xs">{content.footer.slogan[language]}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">{t('quickLinks')}</h3>
            <ul className="mt-4 space-y-2 columns-2">
              {content.navigation.filter(link => link.to !== '/').map(link => (
                  <li key={link.id} className="break-inside-avoid"><ReactRouterDOM.NavLink to={link.to} className="text-base text-gray-200 hover:text-white">{link.label[language]}</ReactRouterDOM.NavLink></li>
              ))}
              <li className="break-inside-avoid"><ReactRouterDOM.NavLink to="/donate" className="text-base text-gray-200 hover:text-white">{t('navDonate')}</ReactRouterDOM.NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">{t('contact')}</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-base text-gray-200">{content.footer.contact.address}</li>
              <li className="text-base text-gray-200">{content.footer.contact.email}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">{t('followUs')}</h3>
            <div className="flex justify-center md:justify-start mt-4 space-x-4">
              {content.socialLinks.map(social => {
                const Icon = socialIconsMap[social.id];
                return (
                  <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white">
                    <span className="sr-only">{social.id}</span>
                    {Icon && <Icon className="h-6 w-6" />}
                  </a>
                );
              })}
            </div>
          </div>

        </div>
        <div className="mt-8 border-t border-white/20 pt-6 text-center text-sm text-white">
          <p>&copy; {new Date().getFullYear()} {content.footer.copyright[language]}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;