import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Badge,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext.js';

// Mock data for demonstration - Updated with INR pricing
const mockSalesData = [
  {
    id: 'rzp_001',
    productId: 1,
    productName: 'Premium Headphones',
    customerEmail: 'john.doe@gmail.com',
    amount: 16599,
    date: '2025-01-15T10:30:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HA'
  },
  {
    id: 'rzp_002',
    productId: 2,
    productName: 'Smart Watch',
    customerEmail: 'sarah.smith@gmail.com',
    amount: 20749,
    date: '2025-01-14T15:45:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HB'
  },
  {
    id: 'rzp_003',
    productId: 3,
    productName: 'Wireless Earbuds',
    customerEmail: 'mike.wilson@gmail.com',
    amount: 10799,
    date: '2025-01-13T09:15:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HC'
  },
  {
    id: 'rzp_004',
    productId: 1,
    productName: 'Premium Headphones',
    customerEmail: 'priya.patel@gmail.com',
    amount: 16599,
    date: '2025-01-12T14:20:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HD'
  },
  {
    id: 'rzp_005',
    productId: 3,
    productName: 'Wireless Earbuds',
    customerEmail: 'alex.brown@gmail.com',
    amount: 10799,
    date: '2025-01-11T11:30:00Z',
    status: 'completed',
    paymentId: 'pay_Nf5t2YZNqKQ7HE'
  }
];

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    // In a real app, fetch sales data from your API
    const fetchSalesData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get real purchases from localStorage
        const realPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        
        // Get admin notifications
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        setNotifications(adminNotifications);
        
        // Combine mock data with real purchases
        const allSales = [...mockSalesData, ...realPurchases];
        
        // Sort by date (newest first)
        allSales.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setSales(allSales);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load sales data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [user, navigate]);

  const handleSendEmail = () => {
    // In a real app, you would send this email through your backend
    console.log('Sending email with content:', emailContent);
    
    // Simulate API call
    setTimeout(() => {
      setEmailDialogOpen(false);
      setEmailContent('');
      setSnackbar({
        open: true,
        message: 'Email sent successfully!',
        severity: 'success'
      });
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const calculateTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.amount, 0).toLocaleString('en-IN');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };

  const unreadNotifications = notifications.filter(notif => !notif.read).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Badge badgeContent={unreadNotifications} color="error">
            <Button 
              variant="outlined" 
              color="info"
            >
              Notifications
            </Button>
          </Badge>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setEmailDialogOpen(true)}
          >
            Send Notification
          </Button>
        </Box>
      </Box>

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Recent Notifications ({unreadNotifications} unread)
          </Typography>
          <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
            {notifications.slice(0, 5).map((notification) => (
              <Card 
                key={notification.id} 
                sx={{ 
                  mb: 1, 
                  backgroundColor: notification.read ? '#f5f5f5' : '#e3f2fd',
                  cursor: 'pointer'
                }}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <CardContent sx={{ py: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {!notification.read && (
                        <Chip label="New" color="primary" size="small" />
                      )}
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(notification.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      <Box display="flex" gap={3} mb={4}>
        <Paper elevation={3} sx={{ p: 3, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Sales
          </Typography>
          <Typography variant="h4" color="primary">
            ₹{calculateTotalSales()}
          </Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 3, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Orders
          </Typography>
          <Typography variant="h4" color="primary">
            {sales.length}
          </Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 3, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Average Order Value
          </Typography>
          <Typography variant="h4" color="primary">
            ₹{sales.length > 0 ? Math.round(sales.reduce((total, sale) => total + sale.amount, 0) / sales.length).toLocaleString('en-IN') : '0'}
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Recent Orders
      </Typography>
      
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Order ID</strong></TableCell>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>Customer Email</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Payment ID</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} hover>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{sale.productName}</TableCell>
                <TableCell>{sale.customerEmail}</TableCell>
                <TableCell>₹{sale.amount.toLocaleString('en-IN')}</TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {sale.paymentId}
                </TableCell>
                <TableCell>{formatDate(sale.date)}</TableCell>
                <TableCell>
                  <Box 
                    component="span" 
                    sx={{
                      p: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: sale.status === 'completed' ? '#e8f5e9' : '#fff8e1',
                      color: sale.status === 'completed' ? '#2e7d32' : '#ff8f00',
                      textTransform: 'capitalize',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {sale.status}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Email Dialog */}
      <Dialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Notification Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email-content"
            label="Email Content"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={6}
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Enter your notification message here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendEmail} 
            variant="contained" 
            color="primary"
            disabled={!emailContent.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admin;
