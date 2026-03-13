import axios from "axios";
import { showError } from "./alert";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    showError(message);

    return Promise.reject(error);
  },
);

export default API;
