// frontend/src/api/adminConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/admin",
});

// ---------- Destinations ----------
export const getDestinations = async () => {
  const { data } = await api.get("/destinations");
  return data;
};

export const createDestination = async (payload) => {
  const { data } = await api.post("/destinations", payload);
  return data;
};

export const updateDestination = async (id, payload) => {
  const { data } = await api.put(`/destinations/${id}`, payload);
  return data;
};

export const deleteDestination = async (id) => {
  await api.delete(`/destinations/${id}`);
};

// ---------- Coffee lines ----------
export const getCoffeeLines = async () => {
  const { data } = await api.get("/coffee-lines");
  return data;
};

export const createCoffeeLine = async (payload) => {
  const { data } = await api.post("/coffee-lines", payload);
  return data;
};

export const updateCoffeeLine = async (id, payload) => {
  const { data } = await api.put(`/coffee-lines/${id}`, payload);
  return data;
};

export const deleteCoffeeLine = async (id) => {
  await api.delete(`/coffee-lines/${id}`);
};

// ---------- Services ----------
export const getServices = async () => {
  const { data } = await api.get("/services");
  return data;
};

export const createService = async (payload) => {
  const { data } = await api.post("/services", payload);
  return data;
};

export const updateService = async (id, payload) => {
  const { data } = await api.put(`/services/${id}`, payload);
  return data;
};

export const deleteService = async (id) => {
  await api.delete(`/services/${id}`);
};
