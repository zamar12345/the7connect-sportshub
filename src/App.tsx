
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthProvider";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="the7connect-theme">
        <QueryProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="bottom-center" />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
