// Type definitions for ALTCHA widget web component
// https://altcha.org/docs/website-integration/

declare namespace JSX {
  interface IntrinsicElements {
    'altcha-widget': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        challengeurl?: string;
        challengejson?: string;
        hidefooter?: boolean;
        hidelogo?: boolean;
        auto?: 'off' | 'onfocus' | 'onload' | 'onsubmit';
        delay?: number;
        expire?: number;
        floating?: 'auto' | 'top' | 'bottom';
        floatinganchor?: string;
        floatingoffset?: number;
        maxnumber?: number;
        name?: string;
        strings?: string;
        workers?: number;
        debug?: boolean;
        test?: boolean;
        'data-state'?: string;
      },
      HTMLElement
    >;
  }
}

// Extend HTMLElement for ALTCHA widget
interface AltchaWidgetElement extends HTMLElement {
  value: string;
}
