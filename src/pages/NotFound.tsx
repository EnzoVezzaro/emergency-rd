
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
        
        <div className="space-y-4">
          {isDashboardRoute ? (
            <Button 
              variant="default"
              className="flex items-center gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} />
              Return to Dashboard
            </Button>
          ) : (
            <Button 
              variant="default"
              className="flex items-center gap-2" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={16} />
              Return to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
