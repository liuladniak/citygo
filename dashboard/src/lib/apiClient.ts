import axios from "axios";
import { supabase } from "./supabaseClient";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
});

apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
