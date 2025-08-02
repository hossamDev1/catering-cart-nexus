import { ReactNode, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShoppingCart, LogOut, User, Building2, Menu, X } from 'lucide-react';
// Logo is in public folder, so we reference it directly
const logo = '/Catering-plus.png';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isAuthenticated, clearAuth, userName } = useAuthStore();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log(userName);

  const handleLogout = () => {
    clearAuth();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-gradient-header shadow-lg border-b border-border/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-4 sm:space-x-8">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-white/20">
                    <img
                      src={logo}
                      alt="CateringPlus Logo"
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                    />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-primary-foreground">
                    CateringPlus
                  </h1>
                </div>
                
                {/* Desktop Navigation */}
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

              {/* Desktop User Info and Actions */}
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-primary-foreground/80">
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
                  <span>Sign Out</span>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className="sm:hidden flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-primary-foreground/80">
                  <User size={16} />
                  <span className="text-sm font-medium truncate max-w-20">
                    {userName}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground transition-all duration-200 p-2"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="sm:hidden border-t border-white/20 bg-gradient-header">
                <div className="px-4 py-3 space-y-3">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      to="/add-to-cart"
                      onClick={closeMobileMenu}
                      className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === '/add-to-cart'
                          ? 'bg-white/20 text-primary-foreground'
                          : 'text-primary-foreground/90 hover:bg-white/10'
                      }`}
                    >
                      Order Food
                    </Link>
                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === '/cart'
                          ? 'bg-white/20 text-primary-foreground'
                          : 'text-primary-foreground/90 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart size={16} />
                        Cart
                      </div>
                    </Link>
                  </div>
                  
                  {/* Mobile Sign Out */}
                  <div className="pt-2 border-t border-white/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start text-primary-foreground hover:bg-white/10 hover:text-primary-foreground transition-all duration-200"
                    >
                      <LogOut
                        size={16}
                        className="mr-2"
                      />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};
