import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster position="top-center" toastOptions={{ style: { background: "#fffefa", color: "#193c2d", border: "1px solid #dfe4d8", fontFamily: "inherit" } }} />
  </StrictMode>,
);
