import React from 'react';

const LeafIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.243 0 .487-.01.728-.028M12 3c.243 0 .487.01.728.028m-1.456 18.002c-.16.013-.321.023-.485.023l-.004-.001-.004-.001c-.164 0-.325-.01-.485-.023M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747m-17.432 0h17.432" />
    </svg>
);

export default LeafIcon;
