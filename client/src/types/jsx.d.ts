import { createElement, Fragment } from '../lib/tiny-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export { createElement, Fragment };
