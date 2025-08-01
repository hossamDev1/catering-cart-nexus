import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { ShoppingCart, LogOut, User, Building2 } from 'lucide-react';
// Logo is in public folder, so we reference it directly
const logo = '/Catering-plus.png';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isAuthenticated, clearAuth, userName } = useAuthStore();

  console.log(userName);

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-gradient-header shadow-lg border-b border-border/50 sticky top-0 z-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-white/20">
                    <img
                      src={logo}
                      alt="CateringPlus Logo"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <h1 className="text-xl font-bold text-primary-foreground">
                    CateringPlus
                  </h1>
                </div>
                <div className="hidden md:flex space-x-1">
                  <Link
                    to="/add-to-cart"
                    className={`nav-link ${
                      location.pathname === '/add-to-cart'
                        ? 'nav-link-active'
                        : 'text-primary-foreground/90 '
                    }`}
                  >
                    Order Food
                  </Link>
                  <Link
                    to="/cart"
                    className={`nav-link flex items-center gap-2 ${
                      location.pathname === '/cart'
                        ? 'nav-link-active'
                        : 'text-primary-foreground/90 '
                    }`}
                  >
                    <ShoppingCart size={16} />
                    Cart
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-primary-foreground/80">
                  <User size={16} />
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground transition-all duration-200"
                >
                  <LogOut
                    size={16}
                    className="mr-2"
                  />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};
