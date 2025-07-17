import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Configuration Error</h2>
        <p>Google Client ID is not configured. Please check your .env file.</p>
      </div>
    );
  }

  console.log('Google Client ID configured:', googleClientId.substring(0, 20) + '...');

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <EmotionThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Navbar />
              <div style={{ padding: '20px' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/checkout/:productId" element={<Checkout />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </EmotionThemeProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
