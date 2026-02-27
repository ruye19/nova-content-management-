const rawBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
export const API_URL = `${rawBase}/api`;

export async function httpRequest(path, { method = "GET", data, token } = {}) {
  const headers = {};
  let body;

  if (data instanceof FormData) {
    body = data;
  } else if (data !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body,
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      console.warn("Failed to parse response", error);
    }
  }

  if (!response.ok) {
    const err = new Error(payload?.error || payload?.message || "Request failed");
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
