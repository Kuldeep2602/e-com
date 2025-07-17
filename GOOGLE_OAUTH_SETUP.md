# Google OAuth Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled (required for OAuth)

## Step 2: Enable Required APIs

1. Go to "APIs & Services" > "Library"
2. Search for and enable:
   - Google+ API
   - Google Identity API
   - Google People API (optional, for additional profile info)

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type
   - Fill in required fields (App name, User support email, Developer contact email)
   - Add your domain to authorized domains if deploying to production
4. Choose "Web application" as the application type
5. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Add Authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
7. Click "Create"
8. Copy the Client ID

## Step 4: Configure Your Application

1. Open your `.env` file
2. Replace `your_google_client_id_here` with your actual Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Open your browser to `http://localhost:5173`
3. Click "Sign In" in the navbar
4. Click "Continue with Google"
5. You should see the Google OAuth popup

## Troubleshooting

### Common Issues:

1. **"This app isn't verified" message**: 
   - This is normal during development
   - Click "Advanced" and "Go to [your app name] (unsafe)"

2. **"redirect_uri_mismatch" error**:
   - Make sure your redirect URI in Google Cloud Console matches exactly
   - Check that you're using the correct protocol (http vs https)

3. **"idpiframe_initialization_failed" error**:
   - Check that your domain is added to authorized JavaScript origins
   - Make sure you're not blocking third-party cookies

4. **Button doesn't appear or work**:
   - Check browser console for errors
   - Ensure Google Client ID is correctly set in .env file
   - Try clearing browser cache and cookies

### Testing Admin Features:

To test admin functionality, use an email that ends with `@admin.com` or modify the admin check logic in `src/context/AuthContext.jsx`.

## Security Notes

- Never commit your actual Google Client ID to version control
- Use environment variables for all sensitive configuration
- For production, make sure to use HTTPS
- Consider implementing proper user roles and permissions instead of email-based admin check
