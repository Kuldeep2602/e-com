import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext.js';

// Custom Google Login Button Component
const GoogleLoginButton = ({ onSuccess, onError }) => {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        try {
          const decoded = jwtDecode(credentialResponse.credential);
          onSuccess({
            credential: credentialResponse.credential,
            userData: {
              name: decoded.name,
              email: decoded.email,
              imageUrl: decoded.picture,
              isAdmin: decoded.email.endsWith('@admin.com') // You can modify this logic
            }
          });
        } catch (error) {
          console.error('Error decoding JWT:', error);
          onError(error);
        }
      }}
      onError={() => {
        console.log('Login Failed');
        onError(new Error('Login failed'));
      }}
      theme="outline"
      size="large"
      text="continue_with"
      shape="rectangular"
      width="280"
    />
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (response) => {
    try {
      const { userData } = response;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setError(null);
    } catch (error) {
      console.error('Login success handling error:', error);
      setError('Failed to process login. Please try again.');
    }
  };

  const handleLoginError = (error) => {
    console.error('Login error:', error);
    setError('Login failed. Please try again.');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    // Clear any Google OAuth state
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login: handleLoginSuccess, 
        logout, 
        loading, 
        error,
        GoogleLoginButton: () => (
          <GoogleLoginButton 
            onSuccess={handleLoginSuccess} 
            onError={handleLoginError} 
          />
        )
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
