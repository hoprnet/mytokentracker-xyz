const BASE = 'https://api.jsonbin.io/v3';
const MASTER_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
// console.log('JSONBin master key loaded?', !!MASTER_KEY);

// Internal request helper
async function jsonbinRequest(path, { method = 'GET', body }) {
  if (!MASTER_KEY) throw new Error('Missing JSONBin MASTER_KEY');
  const headers = { 'X-Master-Key': MASTER_KEY };
  if (body) headers['Content-Type'] = 'application/json';
  if (method === "POST") headers['X-Collection-Id'] = '68bc335ed0ea881f4073e328';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSONBin error ${res.status}: ${text}`);
  }
  return res.json();
}

// Create a new bin with 3 strings bound to a recordId
export async function createEntry({ recordId, s1, s2, s3 }) {
  const payload = { recordId, s1, s2, s3 };
  const json = await jsonbinRequest('/b', { method: 'POST', body: payload });
  return { binId: json?.metadata?.id || json?.id, payload: json?.record };
}

// Update an existing bin completely (PUT replaces whole document)
export async function updateEntry({ binId, recordId, s1, s2, s3 }) {
  const payload = { recordId, s1, s2, s3 };
  const json = await jsonbinRequest(`/b/${binId}`, { method: 'PUT', body: payload });
  return { binId: json?.metadata?.id || binId, payload: json?.record };
}

// Fetch latest version of a bin
export async function fetchEntry({ binId }) {
  const json = await jsonbinRequest(`/b/${binId}/latest`, { method: 'GET' });
  return { binId: json?.metadata?.id || binId, payload: json?.record };
}

// Get bins inside a specific collection
export async function listBinsInCollection() {
  const json = await jsonbinRequest(`/c/68bc335ed0ea881f4073e328/bins`, { method: 'GET' });
  return json || [];
}

// Convenience: gather all bins across all collections (sequential)
export async function getEntry(recordId) {
  const collections = await listBinsInCollection();
  console.log('Collections:', collections);
  for (const c of collections) {
    try {
      const binId = c.record;
      const bin = await fetchEntry({ binId });
      if (bin.payload?.recordId === recordId) return bin;
    } catch (e) {
      console.warn('Failed listing bins for collection');
    }
  }
  return null;
}

