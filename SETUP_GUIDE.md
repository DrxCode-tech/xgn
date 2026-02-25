# XGN Setup Guide

Complete step-by-step guide to get XGN running locally and deployed to Vercel.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git account
- Firebase account
- Cloudinary account
- Cohere AI account

---

## Step 1: Local Development Setup

### 1.1 Clone the Repository

```bash
cd xgn
npm install
```

### 1.2 Create `.env.local` File

Copy the template and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials.

---

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Enter project name: `xgn-realestate`
4. Continue through setup steps

### 2.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Enable **Google** provider
   - Add your app's authorized domains

### 2.3 Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Start in **Test Mode** (for development)
4. Choose region closest to you

### 2.4 Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the web app icon
4. Copy the config object
5. Fill in `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Step 3: Cloudinary Setup

### 3.1 Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Verify email

### 3.2 Get Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your **Cloud Name**
3. Create an **Upload Preset**:
   - Click **Settings** → **Upload**
   - Scroll to **Upload presets**
   - Click **Add upload preset**
   - Set **Unsigned** to ON
   - Save and copy the preset name

4. Fill in `.env.local`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

---

## Step 4: Cohere AI Setup

### 4.1 Create Cohere Account

1. Go to [Cohere Dashboard](https://dashboard.cohere.com/)
2. Sign up for free account
3. Verify email

### 4.2 Get API Key

1. Go to **API Keys** section
2. Create new API key
3. Copy the key
4. Fill in `.env.local`:

```env
COHERE_API_KEY=your_cohere_api_key
```

---

## Step 5: Run Locally

### 5.1 Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5.2 Test the App

1. **Sign Up**: Create account with email or Google
2. **Complete Profile**: Add your details and photo
3. **Create Property**: Upload property with images
4. **Generate Posts**: Click on property and generate posts

---

## Step 6: Deploy to Vercel

### 6.1 Push to GitHub

```bash
git add .
git commit -m "Initial XGN commit - Real estate post generator"
git push origin main
```

### 6.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: npm run build
   - **Output Directory**: dist

### 6.3 Add Environment Variables

In Vercel project settings, add all variables from `.env.local`:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
COHERE_API_KEY
```

### 6.4 Deploy

Click **Deploy** and wait for build to complete!

---

## Step 7: Production Checklist

### Security

- [ ] Firebase: Switch from Test Mode to Production Rules
- [ ] Cloudinary: Set upload restrictions
- [ ] Cohere: Monitor API usage
- [ ] Never commit `.env.local` to Git

### Firebase Production Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Properties: users can only read/write their own
    match /properties/{propertyId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Cloudinary Security

1. Go to Settings → Security
2. Enable **Restricted media types**
3. Allow only image formats
4. Set **Max file size** to 10MB

---

## Troubleshooting

### Build Errors

**Error**: `Cannot find module 'firebase'`
```bash
npm install firebase
```

**Error**: `VITE_FIREBASE_API_KEY is undefined`
- Make sure `.env.local` exists
- Restart dev server: `npm run dev`

### Firebase Issues

**Error**: `Permission denied` when uploading property
- Check Firestore rules are in Test Mode
- Or update Production Rules

**Error**: `Auth/invalid-api-key`
- Verify Firebase credentials in `.env.local`
- Check API key is enabled in Firebase Console

### Cloudinary Issues

**Error**: `Upload failed`
- Verify Cloud Name is correct
- Check Upload Preset is set to **Unsigned**
- Verify preset name in `.env.local`

### Cohere AI Issues

**Error**: `Invalid API key`
- Verify Cohere API key in `.env.local`
- Check API key is active in Cohere Dashboard
- Ensure key has sufficient quota

---

## Support

For detailed documentation, see:
- [Firebase Docs](https://firebase.google.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Cohere Docs](https://docs.cohere.com/)
- [Vercel Docs](https://vercel.com/docs)

---

## Next Steps

After deployment:

1. **Test in Production**: Verify all features work
2. **Monitor**: Check Vercel, Firebase, and Cohere dashboards
3. **Optimize**: Monitor performance and optimize as needed
4. **Scale**: Plan for Phase 2 features (chat, CRM, etc.)

---

**Happy building! 🚀**
