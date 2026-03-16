import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const detail = err?.response?.data?.detail;
    const fallback = err?.message ?? 'Request failed';

    // FastAPI validation errors are often an array of objects with loc/msg/type.
    let message: string;
    if (Array.isArray(detail)) {
      const parts = detail.map((item: any) => {
        if (item && typeof item === 'object') {
          const loc = Array.isArray(item.loc) ? item.loc.join('.') : '';
          const msg = item.msg ? String(item.msg) : JSON.stringify(item);
          return loc ? `${loc}: ${msg}` : msg;
        }
        return String(item);
      });
      message = parts.join('\n');
    } else if (detail && typeof detail === 'object') {
      message = JSON.stringify(detail);
    } else if (detail != null) {
      message = String(detail);
    } else {
      message = fallback;
    }

    return Promise.reject(new Error(message));
  }
);

