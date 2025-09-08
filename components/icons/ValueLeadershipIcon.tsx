
import React from 'react';

const ValueLeadershipIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22" cy="19" r="6"/>
            <path d="M22 25v16"/>
            <path d="M14 53V41h16v12"/>
            <path d="M22 32l18-12"/>
            <path d="M34 20h6v6"/>
            <path d="M40 53V43"/>
            <path d="M46 53V38"/>
            <path d="M52 53V33"/>
        </g>
    </svg>
);

export default ValueLeadershipIcon;
