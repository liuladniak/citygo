import axios from "axios";
import { supabase } from "./supabaseClient";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

let isSigningOut = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isSigningOut) {
      isSigningOut = true;
      supabase.auth.signOut().finally(() => {
        window.location.href = "/";
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
