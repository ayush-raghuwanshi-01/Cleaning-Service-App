/** Lightweight toast bus — decoupled from React so any module (e.g. the API
 *  client) can raise a notification. `ToastProvider` subscribes to this bus. */

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toast: ToastItem) => void;

let nextId = 1;
const listeners = new Set<Listener>();

export function toast(message: string, type: ToastType = "info"): void {
  const item: ToastItem = { id: nextId++, message, type };
  listeners.forEach((fn) => fn(item));
}

/** Subscribe to the toast bus. Returns an unsubscribe function. */
export function onToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
