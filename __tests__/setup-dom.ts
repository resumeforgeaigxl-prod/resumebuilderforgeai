import { JSDOM } from 'jsdom';

if (typeof document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });

  const win = dom.window;

  // Copy window properties to global and globalThis
  Object.getOwnPropertyNames(win).forEach((prop) => {
    if (!(prop in globalThis)) {
      try {
        (globalThis as any)[prop] = (win as any)[prop];
        (global as any)[prop] = (win as any)[prop];
      } catch {}
    }
  });

  (globalThis as any).window = win;
  (globalThis as any).document = win.document;
  (globalThis as any).navigator = win.navigator;
  (global as any).window = win;
  (global as any).document = win.document;
  (global as any).navigator = win.navigator;
}
