import React from 'react';

const ScienceIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 10.5h-4.5m4.5 2.25h-4.5m4.5 2.25h-4.5m0-10.5v10.5a2.25 2.25 0 002.25 2.25h.75a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25h-.75a2.25 2.25 0 00-2.25 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 17.25h16.5" />
    </svg>
);

export default ScienceIcon;
