import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bars3Icon, 
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-100/50 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center justify-between px-4 h-full">
        
        {/* ✅ Left section - Fixed width same as sidebar (w-64) */}
        <div className="flex items-center w-64 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-emerald-50 transition-colors lg:hidden mr-2"
          >
            <Bars3Icon className="w-6 h-6 text-emerald-600" />
          </button>
          <Link to="/dashboard" className="flex items-center">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="ml-2.5 text-xl font-bold text-gradient">EduBatch</span>
          </Link>
        </div>

        {/* ✅ Right section - User profile */}
        <div className="flex items-center space-x-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 border border-transparent hover:border-emerald-200"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-100/50 py-1.5 z-50">
                <div className="px-4 py-3 border-b border-emerald-50">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 capitalize">
                    {user?.role}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <UserIcon className="w-4 h-4 mr-2.5" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;