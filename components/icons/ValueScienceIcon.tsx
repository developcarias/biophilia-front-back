
import React from 'react';

const ValueScienceIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 20v-6c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v6"/>
            <path d="M18 20L14 38h22l-4-18"/>
            <path d="M14 38v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V38"/>
            <path d="M44 23v-9c0-1.1-.9-2-2-2h-1"/>
            <path d="M41 23l-2 10h10l-2-10"/>
            <path d="M39 33v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-8"/>
            <circle cx="23" cy="25" r="1"/>
            <circle cx="23" cy="30" r="1"/>
            <circle cx="43" cy="26" r="1"/>
        </g>
    </svg>
);

export default ValueScienceIcon;
