# Fix Google OAuth Error 401: invalid_client

## Problem
You're getting "Access blocked: Authorization Error" with "Error 401: invalid_client" because you're using a Desktop Client ID instead of a Web Application Client ID.

## Solution

### Step 1: Create a Web Application OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth client ID"
4. **Important**: Choose "Web application" (NOT Desktop)
5. Name it something like "E-commerce Web App"

### Step 2: Configure the Web Application Client

**Authorized JavaScript origins** - Add these exact URLs:
```
http://localhost:5173
http://127.0.0.1:5173
```

**Authorized redirect URIs** - Add these exact URLs:
```
http://localhost:5173
http://127.0.0.1:5173
```

### Step 3: Update Your Environment Variables

1. Copy the **Web Application** Client ID (not the Desktop one)
2. Update your `.env` file:
```
VITE_GOOGLE_CLIENT_ID=your_new_web_client_id_here
```

### Step 4: Delete or Disable the Desktop Client

The Desktop Client ID you currently have (`859137395239-2lnlha1n9j6mdc0j5o7pl9n1del0okn1.apps.googleusercontent.com`) won't work for web applications. You can either:
- Delete it if you don't need it
- Keep it but don't use it for your web app

### Step 5: Test Your Setup

1. Restart your development server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Click "Sign In" and then "Continue with Google"
4. You should now see the Google sign-in popup without errors

## Why This Happens

- **Desktop Client IDs** are for desktop applications (like Electron apps)
- **Web Application Client IDs** are for web browsers and React apps
- Google's OAuth system requires the correct client type for security

## Additional Tips

- Make sure your Google Cloud project has the Google Identity API enabled
- The OAuth consent screen should be configured
- It may take a few minutes for changes to take effect
- Try both `localhost:5173` and `127.0.0.1:5173` if one doesn't work
