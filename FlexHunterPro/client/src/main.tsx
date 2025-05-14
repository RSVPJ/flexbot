import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { BotProvider } from "./contexts/BotContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BotProvider>
      <App />
    </BotProvider>
  </AuthProvider>
);
