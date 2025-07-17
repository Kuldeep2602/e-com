// Backend Example for Razorpay Integration (Node.js/Express)
// This is a reference implementation for your backend

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Key Secret
});

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    
    const options = {
      amount: amount, // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment endpoint
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (isAuthentic) {
      // Payment is verified, save to database
      res.json({ verified: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ verified: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Webhook endpoint for payment events
app.post('/api/webhook/razorpay', (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (signature === expectedSignature) {
      const event = req.body;
      
      // Handle different event types
      switch (event.event) {
        case 'payment.captured':
          console.log('Payment captured:', event.payload.payment.entity);
          // Update order status in database
          break;
        case 'payment.failed':
          console.log('Payment failed:', event.payload.payment.entity);
          // Handle failed payment
          break;
        default:
          console.log('Unhandled event:', event.event);
      }
      
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Package.json dependencies you'll need:
// {
//   "dependencies": {
//     "express": "^4.18.2",
//     "razorpay": "^2.8.6",
//     "crypto": "^1.0.1"
//   }
// }

// Environment variables needed:
// RAZORPAY_KEY_ID=your_razorpay_key_id
// RAZORPAY_KEY_SECRET=your_razorpay_key_secret
// RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
