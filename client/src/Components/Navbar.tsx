import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';

// ✅ Custom Button component using Tailwind CSS
function Button({ children, onClick, variant = 'default', className = '' }:any) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition';
  const variants:any = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  );
}

// ✅ Navbar component
function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and brand name */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          >
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">HelpOnRoute</span>
          </div>

          {/* Navigation buttons */}
          <div className="flex space-x-4">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/help-dashboard')}>
                  Dashboard
                </Button>
                 <Button  variant="ghost" onClick={() => navigate('/my-profile')}>
                  MyProfile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/");
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
               
                <Button variant="ghost" onClick={() => navigate("/signin")}>
                  Sign in
                </Button>
                <Button onClick={() => navigate("/signup")}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
