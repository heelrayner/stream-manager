import { createElement, Fragment, render } from './lib/tiny-react';
import { App } from './App';

const root = document.getElementById('root');
if (root) {
  render(<App />, root);
}
