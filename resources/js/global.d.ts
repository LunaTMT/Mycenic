// global.d.ts
import axios from 'axios';

declare global {
    interface Window {
        axios: typeof axios;
        Stripe: any;
    }
}


// global.d.ts
interface ImportMeta {
    glob: (path: string) => Record<string, any>;
  }
  
