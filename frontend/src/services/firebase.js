const FIREBASE_URL = 'https://null-pointer-a3178-default-rtdb.firebaseio.com/.json';
const POLL_INTERVAL_MS = 2000;

/**
 * Polls the Firebase Realtime Database REST endpoint and invokes the callback
 * whenever fresh data arrives. Returns an unsubscribe function.
 */
export function subscribeToDbStream(callback) {
  let cancelled = false;
  let timeoutId = null;

  const poll = async () => {
    if (cancelled) return;

    try {
      const response = await fetch(FIREBASE_URL);
      if (response.ok) {
        const data = await response.json();
        if (data?.rooms) {
          callback(data);
        }
      } else {
        console.error('Database fetch failed:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Database fetch error:', err);
    }

    if (!cancelled) {
      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    }
  };

  poll();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}
