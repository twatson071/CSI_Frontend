import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./components/styles/index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
