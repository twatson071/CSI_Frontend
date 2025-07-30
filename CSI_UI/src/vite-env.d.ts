/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'rux-segmented-button-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      selected?: boolean;
    }, HTMLElement>;
  }
}
