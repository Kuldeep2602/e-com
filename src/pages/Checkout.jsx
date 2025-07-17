import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext.js';

// Mock product data (in a real app, fetch from API)
const mockProducts = {
  1: { id: 1, name: 'Premium Headphones', price: 16599 }, // Price in INR
  2: { id: 2, name: 'Smart Watch', price: 20749 }, // Price in INR
  3: { id: 3, name: 'Wireless Earbuds', price: 10799 }, // Price in INR
};

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Send email notification to super admin
const sendAdminNotification = async (purchaseData) => {
  try {
    console.log('📧 ADMIN EMAIL NOTIFICATION:');
    console.log('=================================');
    console.log(`New Payment Received!`);
    console.log(`Product: ${purchaseData.productName}`);
    console.log(`Customer: ${purchaseData.customerEmail}`);
    console.log(`Amount: ₹${purchaseData.amount.toLocaleString('en-IN')}`);
    console.log(`Payment ID: ${purchaseData.razorpayPaymentId}`);
    console.log(`Date: ${new Date(purchaseData.date).toLocaleString()}`);
    console.log('=================================');
    
    // Call backend API to send email notification
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/admin/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseData: purchaseData
        })
      });
      
      if (response.ok) {
        console.log('✅ Admin notification sent to backend');
      } else {
        console.log('⚠️  Backend not running, using fallback notification');
      }
    } catch (error) {
      console.log('⚠️  Backend not available, using local notification only');
    }
    
    // Browser notification fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Payment Received!', {
        body: `₹${purchaseData.amount.toLocaleString('en-IN')} from ${purchaseData.customerEmail}`,
        icon: '/vite.svg'
      });
    }
    
    // Save notification to localStorage for admin dashboard
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'payment_success',
      message: `New payment of ₹${purchaseData.amount.toLocaleString('en-IN')} received from ${purchaseData.customerEmail} for ${purchaseData.productName}`,
      purchaseData: purchaseData,
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('adminNotifications', JSON.stringify(notifications.slice(0, 50))); // Keep last 50 notifications
    
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

const RazorpayCheckout = ({ product, user, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Check if Razorpay key is configured
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      console.log('Razorpay Key ID from env:', razorpayKeyId);
      
      if (!razorpayKeyId || razorpayKeyId === 'your_razorpay_key_id_here') {
        throw new Error('Razorpay Key ID is not configured properly');
      }

      // For demo purposes, we'll use a simplified approach without backend order creation
      // In production, you should create order on your backend first
      const options = {
        key: razorpayKeyId,
        amount: Math.round(product.price * 100), // Amount in paise (INR price * 100)
        currency: 'INR',
        name: 'E-Commerce Store',
        description: `Payment for ${product.name}`,
        // Remove order_id for now - this requires backend integration
        handler: function (response) {
          // Payment successful
          console.log('Payment successful:', response);
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            product: product,
            user: user,
            amount: product.price,
            currency: 'INR'
          });
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: '9999999999', // You can ask user for phone number
        },
        notes: {
          address: 'E-Commerce Store',
          productId: product.id,
          userId: user.email,
        },
        theme: {
          color: '#1976d2',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
          },
        },
      };

      // Open Razorpay checkout
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      // Error handler
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        onError(response.error);
        setError(response.error.description || 'Payment failed');
      });

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Secure payment powered by Razorpay
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You will be redirected to Razorpay's secure payment gateway
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={handlePayment}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Pay ₹${product.price.toLocaleString('en-IN')}`
        )}
      </Button>
    </Paper>
  );
};

const Checkout = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // In a real app, fetch product details from API
    const fetchProduct = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const selectedProduct = mockProducts[productId];
        
        if (!selectedProduct) {
          navigate('/');
          return;
        }
        
        setProduct(selectedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user, navigate]);

  const handlePaymentSuccess = (paymentResponse) => {
    console.log('Payment successful:', paymentResponse);
    setPaymentSuccess(true);
    setPaymentData(paymentResponse);
    
    // Save the purchase to localStorage for admin dashboard
    const purchaseData = {
      id: `rzp_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      customerEmail: user.email,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      date: new Date().toISOString(),
      status: 'completed',
      paymentId: paymentResponse.razorpay_payment_id
    };
    
    // Get existing purchases from localStorage
    const existingPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    
    // Add new purchase
    existingPurchases.unshift(purchaseData); // Add to beginning of array
    
    // Save back to localStorage
    localStorage.setItem('purchases', JSON.stringify(existingPurchases));
    
    console.log('Purchase saved to localStorage:', purchaseData);
    
    // Send email notification to super admin
    sendAdminNotification(purchaseData);
    
    // In a real app, you would verify the payment on your backend
    const orderData = {
      userId: user.email,
      productId: product.id,
      productName: product.name,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Order data:', orderData);
    // Here you would typically send orderData to your backend for verification
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (paymentSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment Successful! 🎉
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for your purchase of <strong>{product.name}</strong>.
        </Typography>
        <Typography variant="body1" paragraph>
          A confirmation has been sent to your email: <strong>{user.email}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Payment ID: {paymentData?.razorpay_payment_id}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Complete Your Purchase
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>Product:</Typography>
          <Typography>{product.name}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>Price (INR):</Typography>
          <Typography>₹{product.price.toLocaleString('en-IN')}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" fontWeight="bold">
          <Typography>Total:</Typography>
          <Typography>₹{product.price.toLocaleString('en-IN')}</Typography>
        </Box>
      </Paper>
      
      <RazorpayCheckout 
        product={product} 
        user={user}
        onSuccess={handlePaymentSuccess} 
        onError={handlePaymentError} 
      />
    </Container>
  );
};

export default Checkout;
