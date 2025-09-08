

import React from 'react';
// FIX: Changed to namespace import to resolve module resolution issues with react-router-dom.
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Corrected type import from 'ActionLineItem' to 'ValueItem' as suggested by the error.
import { ValueItem } from '../types';
import { useI18n, useTranslate } from '../i18n';

import SustainabilityIcon from './icons/SustainabilityIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import LeafIcon from './icons/LeafIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';


interface ActionRibbonProps {
  items: ValueItem[];
  isVisible: boolean;
}

const iconComponents: { [key: string]: React.FC<{ className?: string }> } = {
    BookOpenIcon,
    LeafIcon,
    SustainabilityIcon,
    MegaphoneIcon,
};

const ActionRibbon: React.FC<ActionRibbonProps> = ({ items, isVisible }) => {
    const { language } = useI18n();
    const t = useTranslate();

    return (
        <div className={`relative -mt-24 z-20 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div 
                className="bg-[#0077c8] text-white"
                style={{boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'}}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {items.map(item => {
                            // FIX: Safely access iconComponents by checking if item.icon exists first.
                            const IconComponent = item.icon ? iconComponents[item.icon] : null;
                            return (
                                <div key={item.id} className="text-center px-4 flex flex-col items-center">
                                    <div className="mx-auto w-24 h-24 mb-4 rounded-full border-4 border-white flex items-center justify-center bg-white/10 flex-shrink-0">
                                        {IconComponent && <IconComponent className="h-12 w-12 text-white" />}
                                    </div>
                                    <h3 className="font-bold uppercase tracking-wider text-lg">{item.title[language]}</h3>
                                    <p className="mt-2 text-sm text-gray-200 flex-grow">{item.text[language]}</p>
                                    <ReactRouterDOM.NavLink to="/about" className="mt-6 inline-block bg-white/20 hover:bg-white/40 text-white font-semibold py-2 px-5 rounded-md text-sm transition-colors">
                                        {t('readMore')}
                                    </ReactRouterDOM.NavLink>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionRibbon;