const API_BASE_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Something went wrong";
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getSessions: () => request("/sessions"),
  getSession: (sessionId) => request(`/sessions/${sessionId}`),
  createSession: (payload) =>
    request("/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSession: (sessionId, payload) =>
    request(`/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSession: (sessionId) =>
    request(`/sessions/${sessionId}`, {
      method: "DELETE",
    }),
  getReservations: () => request("/reservations"),
  getReservation: (reservationId) => request(`/reservations/${reservationId}`),
  createReservation: (payload) =>
    request("/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteReservation: (reservationId) =>
    request(`/reservations/${reservationId}`, {
      method: "DELETE",
    }),
};
