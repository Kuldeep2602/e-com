# E-Commerce Payment Notification System

A modern e-commerce application with payment processing and admin notifications built with React, Vite, and Stripe.

## Features

- User authentication with Google OAuth
- Product catalog with responsive design
- Secure checkout with Stripe payment processing
- Admin dashboard to view sales and customer data
- Email notifications for successful payments
- Responsive design that works on all devices

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Google OAuth credentials
- Stripe account

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-com
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key_here
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── pages/         # Page components
│   ├── Home.jsx   # Product listing
│   ├── Admin.jsx  # Admin dashboard
│   └── Checkout.jsx # Checkout process
├── App.jsx        # Main application component
└── main.jsx       # Application entry point
```

## Dependencies

- React 18
- React Router DOM
- Material-UI (MUI)
- @stripe/stripe-js
- @react-oauth/google
- Vite

## Configuration

### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID for a web application
5. Add `http://localhost:5173` to Authorized JavaScript origins
6. Add `http://localhost:5173` to Authorized redirect URIs

### Stripe Setup
1. Sign up at [Stripe](https://stripe.com/)
2. Get your publishable key from the Dashboard
3. Add the key to your `.env` file

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
