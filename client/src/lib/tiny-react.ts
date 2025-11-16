export type Child = VNode | string | number | boolean | null | undefined;
export type Component<P = any> = (props: P) => VNode;

interface VNode {
  type: string | Component<any> | typeof Fragment;
  props: Record<string, any> & { children?: Child[] };
}

interface TinyInstance {
  hooks: any[];
  effects: EffectRecord[];
  pendingEffects: number[];
  component: () => VNode;
  container: HTMLElement;
}

interface EffectRecord {
  deps?: any[];
  cleanup?: (() => void) | void;
  effect?: () => void | (() => void);
}

export const Fragment = 'fragment';

let currentInstance: TinyInstance | null = null;
let hookIndex = 0;
let rootInstance: TinyInstance | null = null;

function isListener(key: string, value: unknown): value is EventListener {
  return key.startsWith('on') && typeof value === 'function';
}

export function createElement(type: VNode['type'], props: Record<string, any> | null, ...children: Child[]): VNode {
  const normalizedChildren = children.flat().filter((child) => child !== null && child !== undefined && child !== false);
  return {
    type,
    props: {
      ...(props || {}),
      children: normalizedChildren as Child[],
    },
  };
}

function createDom(node: Child): Node {
  if (node === null || node === undefined || node === false) {
    return document.createComment('empty');
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(String(node));
  }
  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment();
    node.forEach((child) => fragment.appendChild(createDom(child)));
    return fragment;
  }
  const vnode = node as VNode;
  if (typeof vnode.type === 'function') {
    return createDom(vnode.type({ ...(vnode.props || {}), children: vnode.props?.children }));
  }
  if (vnode.type === Fragment) {
    const fragment = document.createDocumentFragment();
    (vnode.props?.children || []).forEach((child) => fragment.appendChild(createDom(child)));
    return fragment;
  }
  const element = document.createElement(vnode.type);
  const { children = [], ...rest } = vnode.props || {};
  Object.entries(rest).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    if (isListener(key, value)) {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
      return;
    }
    if (key === 'className') {
      element.setAttribute('class', value);
      return;
    }
    if (key === 'style' && typeof value === 'object') {
      const styleString = Object.entries(value)
        .map(([prop, styleValue]) => `${prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${styleValue}`)
        .join(';');
      element.setAttribute('style', styleString);
      return;
    }
    if (key in element) {
      // @ts-ignore
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  children.forEach((child) => element.appendChild(createDom(child)));
  return element;
}

function rerender() {
  if (!rootInstance) {
    return;
  }
  renderInstance(rootInstance);
}

function renderInstance(instance: TinyInstance) {
  hookIndex = 0;
  currentInstance = instance;
  instance.pendingEffects = [];
  const tree = instance.component();
  const dom = createDom(tree);
  instance.container.innerHTML = '';
  instance.container.appendChild(dom);
  const effectsToRun = instance.pendingEffects.slice();
  effectsToRun.forEach((effectIndex) => {
    const record = instance.effects[effectIndex];
    if (!record) {
      return;
    }
    if (record.cleanup) {
      record.cleanup();
    }
    const cleanup = record.effect?.();
    record.cleanup = cleanup || undefined;
  });
  instance.pendingEffects = [];
  currentInstance = null;
}

export function render(component: VNode, container: HTMLElement) {
  rootInstance = rootInstance || {
    component: () => component,
    container,
    hooks: [],
    effects: [],
    pendingEffects: [],
  };
  rootInstance.component = () => component;
  renderInstance(rootInstance);
}

export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
  if (!currentInstance) {
    throw new Error('useState must be called within a component');
  }
  const instance = currentInstance;
  const index = hookIndex;
  if (instance.hooks.length <= index) {
    instance.hooks.push(typeof initial === 'function' ? (initial as () => T)() : initial);
  }
  const setState = (value: T | ((prev: T) => T)) => {
    const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(instance.hooks[index]) : value;
    instance.hooks[index] = nextValue;
    rerender();
  };
  const state = instance.hooks[index] as T;
  hookIndex += 1;
  return [state, setState];
}

export function useEffect(effect: () => void | (() => void), deps?: any[]) {
  if (!currentInstance) {
    throw new Error('useEffect must be called within a component');
  }
  const instance = currentInstance;
  const index = hookIndex;
  const prev = instance.effects[index];
  const hasChanged =
    !prev ||
    !deps ||
    !prev.deps ||
    deps.length !== prev.deps.length ||
    deps.some((dep, depIndex) => dep !== prev.deps![depIndex]);
  if (hasChanged) {
    instance.effects[index] = { effect, deps };
    instance.pendingEffects.push(index);
  }
  hookIndex += 1;
}

export type VNodeType = VNode;
