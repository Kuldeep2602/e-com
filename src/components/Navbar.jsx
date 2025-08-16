
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, loading, GoogleLoginButton, error } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAdminClick = () => {
    setMenuOpen(false);
    navigate('/admin');
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  if (loading) {
    return (
      <nav className="backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-1.25 0V3.75m0 5.599l-2.86-2.86a.75.75 0 00-1.06 0l-2.86 2.86m0 0l-2.86-2.86a.75.75 0 00-1.06 0L3.25 8.483m11.5 0l-2.86-2.86a.75.75 0 00-1.06 0L10.54 7.78" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">E-Commerce Store</h1>
              <p className="text-xs text-gray-500 font-medium">Premium Collection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full border-2 border-blue-500 border-t-transparent w-6 h-6"></div>
            <span className="text-gray-600 text-sm">Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-1.25 0V3.75m0 5.599l-2.86-2.86a.75.75 0 00-1.06 0l-2.86 2.86m0 0l-2.86-2.86a.75.75 0 00-1.06 0L3.25 8.483m11.5 0l-2.86-2.86a.75.75 0 00-1.06 0L10.54 7.78" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              E-Commerce Store
            </h1>
            <p className="text-xs text-gray-500 font-medium">Premium Collection</p>
          </div>
        </div>

        {/* Navigation and Auth */}
        <div className="flex items-center gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-1 rounded-lg text-sm">
              {error}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              {/* Admin Dashboard Button */}
              {user.isAdmin && (
                <button
                  className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={handleAdminClick}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Admin Dashboard
                </button>
              )}

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-full px-4 py-2 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <img
                    alt={user.name}
                    src={user.imageUrl || user.picture}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  />
                  <span className="text-gray-800 font-semibold">{user.name?.split(' ')[0]}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-14 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl py-3 z-50 min-w-[180px] border border-white/30">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Google Sign In Section */
            <div className="flex items-center gap-3">
              {showLogin ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/30">
                  <GoogleLoginButton />
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
