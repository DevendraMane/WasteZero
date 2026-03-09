import axios from "axios";
import { showError } from "./alert";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
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
