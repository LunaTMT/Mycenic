// global.d.ts (or index.d.ts)

import { Page } from '@inertiajs/react';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './'; // Ensure this is correct path

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/react' {
    interface Page {
        props: {
            flash: {
                loggedIn?: boolean;
            };
        } & AppPageProps;
    }
}
