// All HTTP calls to the backend go through this module.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(message, status = 0, errors = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json', ...headers } : headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network error. Check your connection and try again, or call the clinic.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong. Please try again.', response.status, data.errors);
  }
  return data;
}

// Resolves only when the server has saved the booking and returned a reference number.
export async function createAppointment(payload) {
  const data = await request('/appointments', { method: 'POST', body: payload });
  if (!data?.appointment?.reference) {
    throw new ApiError('Unexpected response from the server. Please call the clinic to confirm.');
  }
  return data.appointment;
}

export async function sendEnquiry(payload) {
  return request('/contact', { method: 'POST', body: payload });
}
