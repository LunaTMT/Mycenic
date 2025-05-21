import { InertiaLinkProps, Link } from '@inertiajs/react';

interface NavLinkProps extends InertiaLinkProps {
    active: boolean;
    name?: string;
}

export default function NavLink({
    active = false,
    className = '',
    name,
    ...props
}: NavLinkProps) {
    return (
        <Link
            {...props}
            className={`
                relative inline-flex items-center text-lg font-medium leading-5
                transition-all duration-300 ease-in-out focus:outline-none text-left
                ${className}
            `}
        >
            {name && (
                <span
                    className={`
                        relative text-slate-700 text-left transition-all duration-300 ease-in-out
                        ${active 
                            ? 'underline-offset-2- font-semibold'
                            : 'group-hover:text-white'
                        }
                    `}
                >
                    {/* Adding background color change on hover */}
                    <span
                        className={`
                            absolute inset-0 w-full h-full  opacity-0 transition-all duration-300 ease-in-out 
                            group-hover:opacity-10
                        `}
                    />
                    {name}
                </span>
            )}
        </Link>
    );
}
