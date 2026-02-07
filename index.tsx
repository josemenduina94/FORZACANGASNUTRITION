import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // tu componente principal

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root no encontrado");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
