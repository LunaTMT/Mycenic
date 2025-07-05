import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            
            className={`
                 font-medium py-3 px-8 rounded-xl 
                transform 
                font-Poppins text-white 
                text-center flex justify-center items-center
                
                bg-yellow-500
                dark:bg-[#7289da]
                
                
                ${!disabled ? 'hover:scale-[103%] transition-all duration-300 hover:shadow-[0_0_3px_#FFD700,0_0_8px_#FFD700,0_0_15px_#FFD700] dark:hover:shadow-[0_0_5px_#93c5fd,0_0_12px_#60a5fa,0_0_20px_#2563eb]' : ''}
           
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
