import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";
import { AuthProvider } from "./store/AuthContext.jsx";
import { DarkModeProvider } from "./store/DarkModeContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <DarkModeProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </DarkModeProvider>
  </AuthProvider>,
);
