import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    type = "button",
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type={type}
            {...props}
            className={`
                font-medium rounded-xl 
                transform ${!disabled ? 'hover:scale-[103%] transition-all duration-300' : ''}
                font-Poppins text-white 
                text-center flex justify-center items-center

                border border-red-600
                bg-red-600
                hover:bg-red-500
                active:bg-red-700
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2

                ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
