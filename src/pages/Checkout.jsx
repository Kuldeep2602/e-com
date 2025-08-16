
import { useAuth } from '../context/AuthContext.js';

// Mock product data (in a real app, fetch from API)
const mockProducts = {
  1: { id: 1, name: 'Premium Headphones', price: 16599 },
  2: { id: 2, name: 'Smart Watch', price: 20749 },
  3: { id: 3, name: 'Wireless Earbuds', price: 10799 },
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function sendAdminNotification(purchaseData) {
  try {
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
    localStorage.setItem('adminNotifications', JSON.stringify(notifications.slice(0, 50)));
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}



// RazorpayCheckout component
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RazorpayCheckout = ({ product, user, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load');
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId || razorpayKeyId === 'your_razorpay_key_id_here') throw new Error('Razorpay Key ID is not configured properly');
      const options = {
        key: razorpayKeyId,
        amount: Math.round(product.price * 100),
        currency: 'INR',
        name: 'E-Commerce Store',
        description: `Payment for ${product.name}`,
        handler: function (response) {
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
          contact: '9999999999',
        },
        notes: {
          address: 'E-Commerce Store',
          productId: product.id,
          userId: user.email,
        },
        theme: { color: '#1976d2' },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
          },
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      paymentObject.on('payment.failed', function (response) {
        onError(response.error);
        setError(response.error.description || 'Payment failed');
      });
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
      <div className="border-b mb-4"></div>
      <div className="mb-4">
        <div className="text-gray-600 mb-1">Secure payment powered by Razorpay</div>
        <div className="text-xs text-gray-400">You will be redirected to Razorpay's secure payment gateway</div>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 rounded px-3 py-2 mb-2 text-sm">{error}</div>
      )}
      <button
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold text-lg hover:bg-blue-700 transition flex items-center justify-center mt-2 disabled:opacity-60"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          `Pay ₹${product.price.toLocaleString('en-IN')}`
        )}
      </button>
    </div>
  );
};

// Checkout component
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
    const fetchProduct = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const selectedProduct = mockProducts[productId];
        if (!selectedProduct) {
          navigate('/');
          return;
        }
        setProduct(selectedProduct);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, user, navigate]);

  const handlePaymentSuccess = (paymentResponse) => {
    setPaymentSuccess(true);
    setPaymentData(paymentResponse);
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
    const existingPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    existingPurchases.unshift(purchaseData);
    localStorage.setItem('purchases', JSON.stringify(existingPurchases));
    sendAdminNotification(purchaseData);
  };

  const handlePaymentError = () => {
    // Optionally show error to user
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h1>
        <p className="mb-2">Thank you for your purchase of <strong>{product.name}</strong>.</p>
        <p className="mb-2">A confirmation has been sent to your email: <strong>{user.email}</strong></p>
        <p className="text-gray-500 mb-4">Payment ID: {paymentData?.razorpay_payment_id}</p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition mt-2"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        <div className="border-b mb-4"></div>
        <div className="flex justify-between mb-2">
          <span>Product:</span>
          <span>{product.name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Price (INR):</span>
          <span>₹{product.price.toLocaleString('en-IN')}</span>
        </div>
        <div className="border-b my-4"></div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>₹{product.price.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <RazorpayCheckout 
        product={product} 
        user={user}
        onSuccess={handlePaymentSuccess} 
        onError={handlePaymentError} 
      />
    </div>
  );
};

export default Checkout;
