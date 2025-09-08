
import React from 'react';

const ValueEquityIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M52 26L32 14 12 26"/>
            <path d="M32 14v40"/>
            <path d="M58 29l-26 12L6 29"/>
            <path d="M46 41H18c-1.1 0-2-.9-2-2V27c0-1.1.9-2 2-2h28c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2z"/>
        </g>
    </svg>
);

export default ValueEquityIcon;
