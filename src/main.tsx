import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles.css";
import { ChangeTrackingProvider } from "./context/ChangeTrackingContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChangeTrackingProvider>
      <App />
    </ChangeTrackingProvider>
  </React.StrictMode>
);
