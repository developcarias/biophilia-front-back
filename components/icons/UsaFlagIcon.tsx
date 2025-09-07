import React from 'react';

const UsaFlagIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" className={className} role="img" aria-label="USA Flag">
        <path fill="#bd3d44" d="M0 0h640v480H0z"/>
        <path fill="#fff" d="M0 36.9h640v36.9H0zm0 73.8h640v36.9H0zm0 73.9h640v36.9H0zm0 73.8h640v36.9H0zm0 73.9h640v36.9H0zm0 73.8h640v36.9H0z"/>
        <path fill="#192f5d" d="M0 0h320v258.5H0z"/>
    </svg>
);
export default UsaFlagIcon;
