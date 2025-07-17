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
  1: { id: 1, name: 'Premium Headphones', price: 199.99 },
  2: { id: 2, name: 'Smart Watch', price: 249.99 },
  3: { id: 3, name: 'Wireless Earbuds', price: 129.99 },
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
        amount: Math.round(product.price * 83 * 100), // Amount in paise (INR)
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
            amount: product.price * 83,
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
          `Pay ₹${(product.price * 83).toFixed(2)}`
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
          <Typography>Price (USD):</Typography>
          <Typography>${product.price.toFixed(2)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>Price (INR):</Typography>
          <Typography>₹{(product.price * 83).toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" fontWeight="bold">
          <Typography>Total:</Typography>
          <Typography>₹{(product.price * 83).toFixed(2)}</Typography>
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
