import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { ShoppingCart, LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isAuthenticated, clearAuth } = useAuthStore();
  
  const handleLogout = () => {
    clearAuth();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-gradient-primary shadow-soft sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-primary-foreground">
                  CateringPlus
                </h1>
                <div className="flex space-x-4">
                  <Link
                    to="/add-to-cart"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === '/add-to-cart'
                        ? 'bg-white/20 text-primary-foreground'
                        : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                    }`}
                  >
                    Add to Cart
                  </Link>
                  <Link
                    to="/cart"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      location.pathname === '/cart'
                        ? 'bg-white/20 text-primary-foreground'
                        : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    Cart
                  </Link>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-white/10"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};