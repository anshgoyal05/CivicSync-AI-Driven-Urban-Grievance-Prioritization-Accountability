import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL,
});

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

