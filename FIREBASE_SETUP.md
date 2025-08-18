# 🔥 Firebase Setup for LinkStore Authentication

## Prerequisites
- A Firebase account (free tier is sufficient)
- Your LinkStore React Native project

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `linkstore-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Email/Password"
5. Enable "Email/Password" provider
6. Click "Save"

## Step 3: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Enter app nickname: `LinkStore Web`
6. Click "Register app"
7. Copy the configuration object

## Step 4: Update Firebase Config

1. Open `config/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Test Authentication

1. Run your app: `npx expo start`
2. Try creating a new account
3. Try logging in with the created account
4. Test logout functionality

## 🔒 Security Rules (Optional)

For production apps, consider setting up Firebase Security Rules:

1. Go to Firestore Database (if using)
2. Click "Rules" tab
3. Set appropriate read/write rules

## 🚨 Important Notes

- **Never commit your Firebase config to public repositories**
- **Use environment variables for production apps**
- **Firebase free tier includes 10,000 authentications/month**
- **Test thoroughly before deploying**

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're not importing Firebase multiple times

2. **"Permission denied"**
   - Check if Authentication is enabled in Firebase Console

3. **"Network error"**
   - Ensure your device has internet connection
   - Check if Firebase project is in the correct region

### Need Help?

- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review [React Native Firebase Guide](https://rnfirebase.io/)
- Check console logs for detailed error messages

## ✅ Success Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Config file updated
- [ ] App runs without errors
- [ ] Can create new account
- [ ] Can login with account
- [ ] Can logout
- [ ] Authentication state persists

Once all items are checked, your LinkStore app will have a fully functional vendor authentication system! 🎉
