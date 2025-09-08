
import React from 'react';

const ValueEducationIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M54 44H10V20c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v24"/>
            <path d="M10 44l-4 4h42"/>
            <path d="M18 18v-4l14-4 14 4v4"/>
            <path d="M46 18H18"/>
            <path d="M48 24h4v4h-4z"/>
        </g>
    </svg>
);

export default ValueEducationIcon;
