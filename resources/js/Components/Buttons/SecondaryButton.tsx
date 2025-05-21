import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type="button",
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`
                font-medium py-3 px-8 rounded-full 
                transform ${!disabled ? 'hover:scale-[103%] transition-all duration-300' : ''}
                font-Poppins text-black 
                text-center flex justify-center items-center

                
                border border-gray-400
                hover:border-black
                dark:text-white
                dark:bg-gray-300/30
                dark:border-white/50
                dark:hover:border-white

                ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
