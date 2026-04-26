import '@testing-library/jest-dom';

// jsdom does not implement HTMLDialogElement modal methods
HTMLDialogElement.prototype.showModal = vi.fn(function (
  this: HTMLDialogElement
) {
  this.setAttribute('open', '');
});

HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
});

// jsdom v29 may not fully initialize localStorage without a proper origin.
// Provide a complete in-memory implementation to keep tests isolated.
class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  key(n: number): string | null {
    return [...this.store.keys()][n] ?? null;
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
});
