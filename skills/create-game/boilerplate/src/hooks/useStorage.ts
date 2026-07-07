export function createStorage<T>(key: string) {
  function save(data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function load(): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  function clear(): void {
    localStorage.removeItem(key);
  }

  return { save, load, clear };
}
