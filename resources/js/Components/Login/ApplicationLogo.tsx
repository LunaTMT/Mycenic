

import { HTMLAttributes } from 'react';

export default function ApplicationLogo(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={'/assets/images/logo2.svg'}
            alt="Application Logo"
            
        />
    );
}
