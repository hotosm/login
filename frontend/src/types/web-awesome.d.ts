// Type declarations for Web Components (Hanko Auth)

import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // HOTOSM Hanko Auth component
      'hotosm-auth': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'hanko-url'?: string;
          'base-path'?: string;
          'osm-enabled'?: boolean;
          'osm-required'?: boolean;
          'osm-scopes'?: string;
          'show-profile'?: boolean;
          'redirect-after-login'?: string;
          debug?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export {};
