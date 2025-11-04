import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SiteBrandProvider } from "@/contexts/SiteBrandContext";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <SiteBrandProvider>
        <AuthProvider>

        <App />
        </AuthProvider>
      </SiteBrandProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);