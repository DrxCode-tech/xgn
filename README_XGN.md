# XGN - Real Estate Post Generator

A professional, Gen-Z styled real estate post generation app that leverages AI to create platform-specific content for Facebook, Twitter/X, and Instagram.

## Features

✨ **Authentication & Profiles**
- Email/Password and Google OAuth authentication via Firebase
- Professional profile setup with photo, bio, experience, and contact info
- Secure user data management

📸 **Property Management**
- Upload multiple property images to Cloudinary
- Add descriptive names and details for each image
- Store comprehensive property information (price, location, bedrooms, bathrooms, description)

🤖 **AI-Powered Post Generation**
- **Facebook**: Long-form content (200-300 words) with image recommendations
- **Twitter/X**: Concise posts (~190 characters) with hashtags
- **Instagram**: Engaging captions with music recommendations and best image selection
- Powered by Cohere AI's latest models

✏️ **Content Editing**
- Edit generated posts directly in the app
- Regenerate posts for any platform
- Copy posts to clipboard for easy sharing

🎨 **Professional UI/UX**
- Gen-Z inspired design with Electric Indigo & Slate color palette
- Smooth animations with Framer Motion
- Skeleton loaders for better UX
- Responsive design for all devices
- Glass-morphism effects and gradient accents

## Tech Stack

**Frontend:**
- React 19 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Lucide React for icons
- React Toastify for notifications

**Backend:**
- Vercel Functions (serverless)
- Cohere AI for content generation

**Services:**
- Firebase (Auth + Firestore)
- Cloudinary (Image hosting)

## Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd xgn
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# Cohere AI Configuration
COHERE_API_KEY=your_cohere_api_key
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google OAuth)
4. Create a Firestore database
5. Copy your credentials to `.env.local`

### 4. Cloudinary Setup

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Get your Cloud Name
3. Create an unsigned upload preset
4. Add to `.env.local`

### 5. Cohere AI Setup

1. Go to [Cohere Dashboard](https://dashboard.cohere.com/)
2. Create an API key
3. Add to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial XGN commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Add environment variables in Vercel settings
5. Deploy!

## Project Structure

```
xgn/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ProfileSetup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PropertyForm.jsx
│   │   └── GeneratedPosts.jsx
│   ├── firebase.js         # Firebase configuration
│   ├── App.jsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.jsx            # Entry point
├── api/
│   └── generate-posts.js   # Vercel serverless function
├── public/                 # Static assets
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## Firebase Firestore Schema

### Users Collection
```javascript
{
  fullName: string,
  email: string,
  phone: string,
  bio: string,
  experience: number,
  profilePhoto: string (Cloudinary URL),
  profileComplete: boolean,
  createdAt: timestamp,
}
```

### Properties Collection
```javascript
{
  userId: string,
  name: string,
  location: string,
  price: number,
  bedrooms: number,
  bathrooms: number,
  description: string,
  images: [
    {
      url: string (Cloudinary URL),
      name: string,
      description: string,
    }
  ],
  posts: {
    facebook: string | null,
    twitter: string | null,
    instagram: string | null,
  },
  postsGenerated: number,
  createdAt: timestamp,
}
```

## Usage Flow

1. **Sign Up** → Create account with email or Google
2. **Profile Setup** → Add professional details and photo
3. **Create Property** → Upload property details and images
4. **Generate Posts** → Click on property to view posts
5. **Edit & Share** → Edit generated posts and copy to clipboard

## Color Palette

- **Primary**: Indigo (#6366f1)
- **Accent**: Pink (#ec4899)
- **Background**: Slate-950 (#0f172a)
- **Text**: Slate-100 (#f1f5f9)

## Future Enhancements

- [ ] Web chat widget for property inquiries
- [ ] Lead qualification system
- [ ] CRM dashboard
- [ ] WhatsApp integration
- [ ] Email automation
- [ ] SMS reminders
- [ ] Video property tours
- [ ] Multi-language support
- [ ] Advanced analytics

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License - feel free to use this project!

---

**Built with ❤️ for Real Estate Agents**
