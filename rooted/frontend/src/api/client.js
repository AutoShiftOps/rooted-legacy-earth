import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("rooted_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  register: (data) => client.post("/api/auth/register", data),
  login: (data) => client.post("/api/auth/login", data),
  getPublicPins: () => client.get("/api/globe/pins"),
  createPerson: (data) => client.post("/api/persons", data),
  getPerson: (id) => client.get(`/api/persons/${id}`),
  updatePerson: (id, data) => client.patch(`/api/persons/${id}`, data),
  addRelationship: (id, data) => client.post(`/api/persons/${id}/relationships`, data),
  getTree: (rootId) => client.get(`/api/tree/${rootId}`),
  setConsent: (id, data) => client.post(`/api/persons/${id}/consent`, data),
};

export default client;
