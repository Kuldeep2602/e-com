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
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext.js';

// Mock data for demonstration
const mockSalesData = [
  {
    id: 'sale_001',
    productId: 1,
    productName: 'Premium Headphones',
    customerEmail: 'user1@example.com',
    amount: 199.99,
    date: '2023-06-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: 'sale_002',
    productId: 2,
    productName: 'Smart Watch',
    customerEmail: 'user2@example.com',
    amount: 249.99,
    date: '2023-06-14T15:45:00Z',
    status: 'completed'
  },
  {
    id: 'sale_003',
    productId: 3,
    productName: 'Wireless Earbuds',
    customerEmail: 'user3@example.com',
    amount: 129.99,
    date: '2023-06-13T09:15:00Z',
    status: 'completed'
  }
];

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
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
        setSales(mockSalesData);
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
    return sales.reduce((total, sale) => total + sale.amount, 0).toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

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
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setEmailDialogOpen(true)}
        >
          Send Notification
        </Button>
      </Box>

      <Box display="flex" gap={3} mb={4}>
        <Paper elevation={3} sx={{ p: 3, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Sales
          </Typography>
          <Typography variant="h4" color="primary">
            ${calculateTotalSales()}
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
                <TableCell>${sale.amount.toFixed(2)}</TableCell>
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
