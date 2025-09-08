
import React from 'react';

const ValueCollaborationIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M43 27H21"/>
            <path d="M26 32l-5-5 5-5"/>
            <path d="M21 41h22"/>
            <path d="M38 36l5 5-5 5"/>
            <path d="M44.44 21.56l-6.18 6.18c-.78.78-.78 2.05 0 2.83l4.24 4.24c.78.78 2.05.78 2.83 0l6.18-6.18c.78-.78.78-2.05 0-2.83l-4.24-4.24c-.78-.78-2.05-.78-2.83 0z"/>
            <path d="M19.56 21.56l6.18 6.18c.78.78.78 2.05 0 2.83l-4.24 4.24c-.78.78-2.05.78-2.83 0l-6.18-6.18c-.78-.78-.78-2.05 0-2.83l4.24-4.24c.79-.78 2.05-.78 2.83 0z"/>
        </g>
    </svg>
);

export default ValueCollaborationIcon;
