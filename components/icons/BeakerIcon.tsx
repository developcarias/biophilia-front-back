import React from 'react';

const BeakerIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.15-.02.3-.034.45-.034h3.6c.15 0 .299.014.45.034M9.75 3.104C9.255 3.034 8.75 3 8.25 3s-1.005.034-1.5.104M5.625 14.5h12.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 9.75l-4.5 4.75M5.625 14.5L9.75 21" />
    </svg>
);

export default BeakerIcon;
