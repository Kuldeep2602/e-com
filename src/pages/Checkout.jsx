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
      if (!razorpayKeyId) {
        throw new Error('Razorpay Key ID is not configured');
      }

      // Create order on backend (in a real app, this would be your backend API)
      const orderData = {
        amount: Math.round(product.price * 100), // Amount in paise (1 INR = 100 paise)
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          productId: product.id,
          userId: user.email,
        },
      };

      // For demo purposes, we'll simulate the order creation
      // In a real app, you would call your backend API here
      const order = {
        id: `order_${Date.now()}`,
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
      };

      // Razorpay checkout options
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'E-Commerce Store',
        description: `Payment for ${product.name}`,
        order_id: order.id,
        handler: function (response) {
          // Payment successful
          console.log('Payment successful:', response);
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            product: product,
            user: user,
          });
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: '9999999999', // You can ask user for phone number
        },
        notes: {
          address: 'E-Commerce Store',
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
          `Pay ₹${(product.price * 83).toFixed(2)}`  // Assuming 1 USD = 83 INR
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
      amount: product.price,
      currency: 'INR',
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      razorpayOrderId: paymentResponse.razorpay_order_id,
      razorpaySignature: paymentResponse.razorpay_signature,
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
