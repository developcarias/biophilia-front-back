import React from 'react';

const UsersIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.284.064A3 3 0 109 9.75M14.25 12a3 3 0 10-6 0M12 14.25c-1.35 0-2.5.9-3 2.175M12 14.25c1.35 0 2.5.9 3 2.175" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
    </svg>
);

export default UsersIcon;
