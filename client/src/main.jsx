import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";
import { AuthProvider } from "./store/AuthContext.jsx";
import { DarkModeProvider } from "./store/DarkModeContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <DarkModeProvider>
      <StrictMode>
        <Toaster
          position="top-center"
          gutter={10}
          containerStyle={{ top: 20 }}
        />
        <App />
      </StrictMode>
    </DarkModeProvider>
  </AuthProvider>,
);
