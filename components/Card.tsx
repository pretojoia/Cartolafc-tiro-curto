
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    icon?: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, icon, className = '' }) => {
    return (
        <div className={`bg-white/95 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 ${className}`}>
            {title && (
                <h2 className="text-xl font-bold text-[#FF8C42] mb-5 pb-3 border-b-2 border-[#FFA85C] flex items-center">
                    {icon && <span className="mr-3 text-lg">{icon}</span>}
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
};

export default Card;
