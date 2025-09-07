
import React from 'react';
import { LocalizedText, UIText } from '../types';
import { useI18n } from '../i18n';
import * as ReactRouterDOM from 'react-router-dom';
import Editable from './Editable';

interface ParallaxSectionProps {
  title: LocalizedText;
  text: LocalizedText;
  imageUrl: string;
  uiText: UIText;
  basePath: string;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({ title, text, imageUrl, uiText, basePath }) => {
    const { language } = useI18n();
    
    return (
        <div 
            className="relative py-24 sm:py-32 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url('${imageUrl}')` }}
            aria-labelledby="parallax-title"
        >
            <div className="absolute inset-0 bg-brand-green-dark bg-opacity-60" aria-hidden="true"></div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <Editable localizedText={title} basePath={`${basePath}.title`}>
                  <h2 id="parallax-title" className="text-4xl font-extrabold tracking-tight drop-shadow-lg">{title[language]}</h2>
                </Editable>
                <Editable localizedText={text} basePath={`${basePath}.text`} multiline>
                  <p className="mt-4 max-w-2xl mx-auto text-lg drop-shadow-md">{text[language]}</p>
                </Editable>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <ReactRouterDOM.NavLink to="/donate" className="bg-brand-yellow text-brand-green-dark px-8 py-3 rounded-md text-lg font-semibold hover:opacity-90 transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto">
                        {uiText.donateNow[language]}
                    </ReactRouterDOM.NavLink>
                    <ReactRouterDOM.NavLink to="/contact" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-white hover:text-brand-green-dark transition-colors transform hover:scale-105 shadow-lg w-full sm:w-auto">
                        {uiText.contact[language]}
                    </ReactRouterDOM.NavLink>
                </div>
            </div>
        </div>
    );
};

export default ParallaxSection;
