import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { AddToCart } from "@/pages/AddToCart";
import { Cart } from "@/pages/Cart";
import { useAuthStore } from "@/store/authStore";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  // Mobile-specific setup
  useEffect(() => {
    // Prevent zoom on input focus for iOS
    const preventZoom = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        target.style.fontSize = '16px';
      }
    };

    document.addEventListener('focusin', preventZoom);
    return () => document.removeEventListener('focusin', preventZoom);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/add-to-cart" replace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-to-cart" 
                element={
                  <ProtectedRoute>
                    <AddToCart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
