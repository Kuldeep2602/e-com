// Backend Implementation for E-Commerce with Razorpay + Admin Email Notifications
// Run this with: node backend-example.js

require('dotenv').config(); // Load environment variables
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for frontend communication

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Key Secret
});

// Configure email transporter for admin notifications
let emailTransporter;

try {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL !== 'admin@yourstore.com' && 
      process.env.ADMIN_EMAIL_PASSWORD && process.env.ADMIN_EMAIL_PASSWORD !== 'your_gmail_app_password') {
    
    emailTransporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD
      }
    });
    
    console.log('✅ Email transporter configured with Gmail');
  } else {
    // Test mode transporter
    console.log('⚠️  Using test email configuration');
    emailTransporter = {
      sendMail: async (options) => {
        console.log('📧 [TEST MODE] Admin email would be sent:');
        console.log('  To:', options.to);
        console.log('  Subject:', options.subject);
        return { messageId: 'test-' + Date.now() };
      }
    };
  }
} catch (error) {
  console.error('❌ Email configuration error:', error.message);
  emailTransporter = {
    sendMail: async (options) => {
      console.log('📧 [TEST MODE] Email notification:', options.subject);
      return { messageId: 'test-' + Date.now() };
    }
  };
}

// Function to send admin notification
const sendAdminNotification = async (purchaseData) => {
  try {
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .amount { font-size: 24px; font-weight: bold; color: #2e7d32; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Payment Received!</h1>
          </div>
          <div class="content">
            <p>A new payment has been successfully processed on your e-commerce store.</p>
            <div class="details">
              <h3>Payment Details:</h3>
              <p><strong>Product:</strong> ${purchaseData.productName}</p>
              <p><strong>Customer:</strong> ${purchaseData.customerEmail}</p>
              <p><strong>Amount:</strong> <span class="amount">₹${purchaseData.amount.toLocaleString('en-IN')}</span></p>
              <p><strong>Payment ID:</strong> ${purchaseData.razorpayPaymentId}</p>
              <p><strong>Date:</strong> ${new Date(purchaseData.date).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.STORE_EMAIL || 'noreply@yourstore.com',
      to: process.env.ADMIN_EMAIL,
      subject: `New Payment: ₹${purchaseData.amount} from ${purchaseData.customerEmail}`,
      html: emailTemplate
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
  }
};

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
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, purchaseData } = req.body;
    
    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    const isAuthentic = expectedSignature === razorpay_signature;
    
    if (isAuthentic) {
      // Payment is verified, save to database
      console.log('✅ Payment verified:', razorpay_payment_id);
      
      // Send admin notification if purchase data is provided
      if (purchaseData) {
        await sendAdminNotification(purchaseData);
      }
      
      res.json({ verified: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ verified: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Admin notification endpoint (called directly from frontend)
app.post('/api/admin/send-notification', async (req, res) => {
  try {
    const { purchaseData } = req.body;
    
    if (!purchaseData) {
      return res.status(400).json({ error: 'Purchase data is required' });
    }
    
    await sendAdminNotification(purchaseData);
    res.json({ success: true, message: 'Admin notification sent' });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    res.status(500).json({ success: false, error: error.message });
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
  console.log(`🚀 E-Commerce Backend Server running on port ${PORT}`);
  console.log(`📧 Email notifications: ${emailTransporter.sendMail ? 'Configured' : 'Test mode'}`);
  console.log(`💳 Razorpay integration: Ready`);
});

// Package.json dependencies you'll need:
// {
//   "dependencies": {
//     "express": "^4.18.2",
//     "razorpay": "^2.8.6",
//     "crypto": "^1.0.1",
//     "nodemailer": "^6.9.7",
//     "cors": "^2.8.5",
//     "dotenv": "^16.3.1"
//   }
// }

// Environment variables needed in .env file:
// RAZORPAY_KEY_ID=your_razorpay_key_id
// RAZORPAY_KEY_SECRET=your_razorpay_key_secret
// RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
// ADMIN_EMAIL=admin@yourstore.com
// ADMIN_EMAIL_PASSWORD=your_gmail_app_password
// STORE_EMAIL=noreply@yourstore.com
// PORT=3001

// To run this backend:
// 1. npm install express razorpay crypto nodemailer cors dotenv
// 2. Configure your .env file with the above variables
// 3. node backend-example.js
