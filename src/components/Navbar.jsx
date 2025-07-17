import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, loading, GoogleLoginButton, error } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAdminClick = () => {
    handleMenuClose();
    navigate('/admin');
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  if (loading) {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            E-Commerce Store
          </Typography>
          <CircularProgress color="inherit" size={24} />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }} 
          onClick={() => navigate('/')}
        >
          E-Commerce Store
        </Typography>
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mr: 2 }}>
            {error}
          </Typography>
        )}
        
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user.isAdmin && (
              <Button 
                color="inherit" 
                onClick={handleAdminClick} 
                sx={{ mr: 2, textTransform: 'none', fontWeight: 500 }}
              >
                Admin Dashboard
              </Button>
            )}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              onClick={handleMenuOpen}
            >
              <Avatar 
                alt={user.name} 
                src={user.imageUrl} 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1.5,
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }} 
              />
              <Typography variant="body1" sx={{ mr: 1, fontWeight: 500 }}>
                {user.name.split(' ')[0]}
              </Typography>
            </Box>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleLogout}>
                <Typography variant="body2" color="text.primary">
                  Sign out
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            {showLogin ? (
              <GoogleLoginButton />
            ) : (
              <Button 
                color="inherit" 
                onClick={handleLoginClick}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
