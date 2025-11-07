// A simple server-side event emitter for consistency, though it won't be shared across requests.
// In a real server environment, you might use a more robust logging/eventing system.

import { FirestorePermissionError } from '@/firebase/errors';

export interface AppServerEvents {
  'permission-error': FirestorePermissionError;
}

type Callback<T> = (data: T) => void;

function createServerEventEmitter<T extends Record<string, any>>() {
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    emit<K extends keyof T>(eventName: K, data: T[K]) {
      // In a server action, we will simply throw the error.
      // This is a placeholder to keep the `emit` call consistent.
      // A more advanced implementation could log to a service like Sentry or Google Cloud Logging.
      if (data instanceof Error) {
        throw data;
      }
    },
  };
}

export const errorEmitter = createServerEventEmitter<AppServerEvents>();
