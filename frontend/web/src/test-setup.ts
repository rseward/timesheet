// Patch Node.js 22+ built-in localStorage before any modules initialize.
// Node.js 22+ exposes a `localStorage` global without working methods unless
// `--localstorage-file` is provided. This conflicts with @vue/devtools-kit
// which calls localStorage.getItem at module initialization time.
// The jsdom environment replaces localStorage with a proper implementation,
// but only after module-level code has already run, so we pre-patch it here.

if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
  const store: Record<string, string> = {}
  const localStorageMock = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })
}
