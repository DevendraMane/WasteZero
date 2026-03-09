import { io } from "socket.io-client";

const API = import.meta.env.VITE_BACKEND_URL;

export const socket = io(API, {
  autoConnect: false,
});
