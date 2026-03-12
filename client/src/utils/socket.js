import { io } from "socket.io-client";

const API = import.meta.env.VITE_BACKEND_URL;

export const socket = io(API, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
});

// Socket event listeners for messaging
export const setupMessageListener = (conversationHandler) => {
  socket.on("new_message", (message) => {
    conversationHandler(message);
  });

  socket.on("typing_indicator", (data) => {
    if (conversationHandler) {
      conversationHandler({ type: "typing", data });
    }
  });

  socket.on("user_status_update", (status) => {
    console.log("[Socket Utils] user_status_update listener received:", status);
    if (conversationHandler) {
      conversationHandler({ type: "status_update", data: status });
    }
  });
};

export const removeMessageListener = () => {
  socket.off("new_message");
  socket.off("typing_indicator");
  socket.off("user_status_update");
};

// Helper to ensure socket is connected and emit user is online
export const emitUserOnline = (userId) => {
  if (socket.connected) {
    console.log(
      "[Socket Utils] Socket already connected, emitting user_online",
    );
    socket.emit("user_online", userId);
  } else {
    console.log(
      "[Socket Utils] Socket not connected yet, waiting for connection before emitting user_online",
    );
    // Listen for connection event and emit when ready
    socket.once("connect", () => {
      console.log("[Socket Utils] Socket connected, now emitting user_online");
      socket.emit("user_online", userId);
    });
  }
};

// Helper to emit typing start
export const emitTypingStart = (userId, conversationWith) => {
  socket.emit("typing_start", { userId, conversationWith });
};

// Helper to emit typing stop
export const emitTypingStop = (userId, conversationWith) => {
  socket.emit("typing_stop", { userId, conversationWith });
};
