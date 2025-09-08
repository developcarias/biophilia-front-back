
import React from 'react';

const ValueConnectionIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 44l10-10 10 10-6-16 6-16-10 10-10-10 6 16-6 16z"/>
            <path d="M32 28v22"/>
            <path d="M20 50h24"/>
        </g>
    </svg>
);

export default ValueConnectionIcon;
