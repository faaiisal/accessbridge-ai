const PREFIX = "accessbridge:";

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getPreference(key: string): string | null {
  try {
    return storage()?.getItem(PREFIX + key) ?? null;
  } catch {
    return null;
  }
}

export function setPreference(key: string, value: string): boolean {
  try {
    storage()?.setItem(PREFIX + key, value);
    return true;
  } catch {
    return false;
  }
}

export function removePreference(key: string): void {
  try {
    storage()?.removeItem(PREFIX + key);
  } catch {
    // Local-only preference; ignore persistence failures.
  }
}
