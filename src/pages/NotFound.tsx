import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card className="card-elevated">
          <CardContent className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
              <Search className="text-muted-foreground" size={32} />
            </div>
            
            <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              Please check the URL or navigate back to the main menu.
            </p>
            
            <div className="space-y-3">
              <Button asChild className="w-full btn-primary">
                <Link to="/add-to-cart">
                  <Home size={16} className="mr-2" />
                  Go to Order Menu
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={16} className="mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
