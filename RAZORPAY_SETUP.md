# Razorpay Payment Gateway Setup Guide

## Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account or log in if you already have one
3. Complete the account verification process

## Step 2: Generate API Keys

1. **Login to Razorpay Dashboard**
2. **Go to Settings** → **API Keys**
3. **Generate Keys for Test Mode**:
   - Click on "Generate Test Keys"
   - You'll get two keys:
     - **Key ID** (starts with `rzp_test_`) - This is your public key
     - **Key Secret** (starts with `rzp_test_`) - This is your private key (keep it secure!)

## Step 3: Configure Your Application

### Frontend Configuration:
1. Open your `.env` file
2. Replace `your_razorpay_key_id_here` with your actual Razorpay Key ID:
   ```
   VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
   ```

### Backend Configuration (for production):
For a production app, you'll need to store the Key Secret securely on your backend:
```
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

## Step 4: Test Your Integration

1. Start your development server: `npm run dev`
2. Navigate to a product and click "Buy Now"
3. Complete the login process
4. Click "Pay" on the checkout page
5. Use test payment credentials:

### Test Payment Credentials:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Cardholder Name**: Any name

### Test UPI ID:
- **UPI ID**: success@razorpay

### Test Netbanking:
- Select any bank and use "success" as username/password

## Step 5: Webhook Configuration (Optional)

For production, you should set up webhooks to handle payment confirmations:

1. Go to **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Enter your webhook URL: `https://yourdomain.com/api/webhook/razorpay`
4. Select events: `payment.captured`, `payment.failed`
5. Copy the webhook secret for signature verification

## Step 6: Go Live (Production)

1. **Complete KYC**: Submit required documents
2. **Generate Live Keys**: Switch to Live mode and generate live API keys
3. **Update Environment Variables**: Replace test keys with live keys
4. **Test in Production**: Use real payment methods to test

## Features Implemented:

✅ **Razorpay Checkout Integration**: Modal payment interface
✅ **Multiple Payment Methods**: Cards, UPI, Netbanking, Wallets
✅ **Order Management**: Order creation and tracking
✅ **Error Handling**: Proper error messages and user feedback
✅ **Payment Verification**: Response handling with payment IDs
✅ **User Experience**: Loading states and success messages
✅ **Security**: Client-side integration with secure key management

## Important Security Notes:

1. **Never expose your Key Secret** in frontend code
2. **Always verify payments** on your backend using webhooks
3. **Use HTTPS** in production
4. **Validate payment amounts** on your backend
5. **Store sensitive data** securely

## Payment Flow:

1. User clicks "Pay" button
2. Razorpay checkout modal opens
3. User enters payment details
4. Payment is processed by Razorpay
5. Success/failure callback is triggered
6. Order is created/updated in your system
7. User sees confirmation page

## Troubleshooting:

### Common Issues:

1. **"Key ID is invalid"**:
   - Check if you've set the correct Key ID in `.env`
   - Ensure you're using the test key for development

2. **"Payment failed"**:
   - Check browser console for detailed error messages
   - Verify your Key ID is correct
   - Ensure you're using test payment credentials

3. **"Razorpay is not defined"**:
   - Check if the Razorpay script is loading properly
   - Verify your internet connection
   - Check browser console for script loading errors

4. **"Amount validation failed"**:
   - Ensure amount is in paise (multiply by 100)
   - Amount should be an integer

## Next Steps:

1. Set up your Razorpay account and get your Key ID
2. Update the `.env` file with your actual Key ID
3. Test the payment flow with test credentials
4. Implement backend webhook handling for production
5. Complete KYC for going live

## Support:

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
- [Integration Guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
