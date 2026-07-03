/**
 * Modern Firebase Realtime Database Client Adapter.
 * 
 * This file mimics the modular Firebase JS SDK (v9/v10) for the Realtime Database.
 * Under the hood, it communicates with the local Express mock database backend using SSE and REST APIs.
 * 
 * To switch to a real Firebase Realtime Database in the future:
 * 1. Install the official firebase package: npm install firebase
 * 2. Update imports in App.jsx (or other components) to point to 'firebase/app' and 'firebase/database'.
 * 3. Replace the mock exports here with the standard firebase configuration and exports.
 */

const API_BASE = 'http://localhost:3000';

// Global Singleton for connection tracking and local caching
class DatabaseService {
  constructor() {
    this.listeners = new Map(); // Map of path -> Set of callbacks
    this.eventSource = null;
    this.currentState = null;
    this.connectionCount = 0;
  }

  // Establishes a shared Server-Sent Events (SSE) connection to stream data in real-time
  connect() {
    if (this.eventSource) return;

    this.eventSource = new EventSource(`${API_BASE}/db/stream`);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.currentState = data;

        // Notify all registered path-based callbacks
        this.listeners.forEach((callbacks, path) => {
          const val = this.getValueAtPath(data, path);
          const snapshot = new DataSnapshot(val);
          callbacks.forEach(cb => {
            try {
              cb(snapshot);
            } catch (err) {
              console.error(`Error in Firebase subscriber callback at path "${path}":`, err);
            }
          });
        });
      } catch (err) {
        console.error('Failed to parse SSE database message:', err);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error('SSE Database connection error:', err);
    };
  }

  // Closes the SSE connection if no subscribers remain active
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Traverses the database tree to extract the value at a specific path
  getValueAtPath(data, path) {
    if (!data) return null;
    if (!path || path === '/' || path === '') return data;

    const parts = path.split('/').filter(Boolean);
    let current = data;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  }
}

// DataSnapshot class matching the official Firebase SDK
class DataSnapshot {
  constructor(value) {
    this._val = value;
  }

  val() {
    return this._val;
  }

  exists() {
    return this._val !== null && this._val !== undefined;
  }
}

// Reference class matching the official Firebase SDK
class DatabaseReference {
  constructor(dbInstance, path) {
    this.db = dbInstance;
    this.path = path;
  }
}

// Singleton database instance
export const db = new DatabaseService();

/**
 * Initializes a Firebase App instance.
 * @param {Object} config Firebase configuration object.
 * @returns {Object} Mock Firebase App.
 */
export function initializeApp(_config) {
  console.log('Initializing Firebase App (Mock Mode)...');
  return { name: '[Mock Firebase App]' };
}

/**
 * Gets a Database instance.
 * @param {Object} app Firebase App instance.
 * @returns {Object} Database singleton.
 */
export function getDatabase(_app) {
  return db;
}

/**
 * Creates a reference to a path in the database.
 * @param {Object} databaseInstance The database instance.
 * @param {string} path The database subpath.
 * @returns {DatabaseReference} The reference object.
 */
export function ref(databaseInstance, path = '') {
  // Normalize path format
  const normalizedPath = path
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .join('/');
  return new DatabaseReference(databaseInstance, normalizedPath);
}

/**
 * Listens for data changes at a particular reference.
 * @param {DatabaseReference} reference The database reference.
 * @param {Function} callback The function triggered on changes.
 * @returns {Function} Unsubscribe function.
 */
export function onValue(reference, callback) {
  const { db: dbInstance, path } = reference;

  dbInstance.connect();
  dbInstance.connectionCount++;

  if (!dbInstance.listeners.has(path)) {
    dbInstance.listeners.set(path, new Set());
  }

  dbInstance.listeners.get(path).add(callback);

  // If we already have a cached state, call callback immediately with current snapshot
  if (dbInstance.currentState !== null) {
    const val = dbInstance.getValueAtPath(dbInstance.currentState, path);
    callback(new DataSnapshot(val));
  }

  // Return unsubscribe cleanup function
  return () => {
    const pathListeners = dbInstance.listeners.get(path);
    if (pathListeners) {
      pathListeners.delete(callback);
      if (pathListeners.size === 0) {
        dbInstance.listeners.delete(path);
      }
    }
    dbInstance.connectionCount--;
    if (dbInstance.connectionCount <= 0) {
      dbInstance.disconnect();
    }
  };
}

/**
 * Updates properties at a specific path with new values.
 * @param {DatabaseReference} reference The database reference.
 * @param {Object} values Object containing the new keys and values.
 * @returns {Promise<any>}
 */
export async function update(reference, values) {
  const { path } = reference;

  let url;
  const body = JSON.stringify(values);

  // Map database ref paths to our Express routes
  if (path.startsWith('devices/')) {
    const deviceKey = path.substring('devices/'.length);
    url = `${API_BASE}/devices/${deviceKey}.json`;
  } else if (path === 'simulation') {
    url = `${API_BASE}/simulation.json`;
  } else {
    url = `${API_BASE}/${path || 'db'}.json`;
  }

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });

    if (!response.ok) {
      throw new Error(`HTTP Error updating path "${path}": ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Firebase update failed for path "${path}":`, err);
    throw err;
  }
}

/**
 * Writes or deletes data at a specific path.
 * In this mock adapter, writing null to the root is mapped to resetting the DB.
 * @param {DatabaseReference} reference The database reference.
 * @param {any} value The value to set (use null to clear).
 * @returns {Promise<any>}
 */
export async function set(reference, value) {
  const { path } = reference;

  // Handle Root Reset (setting root or empty ref to null)
  if ((path === '' || path === 'db') && value === null) {
    try {
      const response = await fetch(`${API_BASE}/db/reset`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP Error resetting DB: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Firebase DB reset failed:', err);
      throw err;
    }
  }

  // Standard PUT request for normal sets
  try {
    const response = await fetch(`${API_BASE}/${path || 'db'}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error setting path "${path}": ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Firebase set failed for path "${path}":`, err);
    throw err;
  }
}
