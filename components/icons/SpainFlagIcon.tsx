import React from 'react';

const SpainFlagIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" className={className} role="img" aria-label="Spain Flag">
        <rect fill="#c60b1e" width="600" height="400"/>
        <rect fill="#ffc400" y="100" width="600" height="200"/>
    </svg>
);

export default SpainFlagIcon;
