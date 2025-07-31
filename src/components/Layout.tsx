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
        <nav className="bg-gradient-primary shadow-elevated sticky top-0 z-50 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">CP</span>
                  </div>
                  <h1 className="text-2xl font-bold text-primary-foreground">
                    CateringPlus
                  </h1>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to="/add-to-cart"
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      location.pathname === '/add-to-cart'
                        ? 'bg-white/20 text-primary-foreground shadow-glow'
                        : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                    }`}
                  >
                    Order Menu
                  </Link>
                  <Link
                    to="/cart"
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      location.pathname === '/cart'
                        ? 'bg-white/20 text-primary-foreground shadow-glow'
                        : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    My Order
                  </Link>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-white/10 rounded-xl"
              >
                <LogOut size={18} />
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