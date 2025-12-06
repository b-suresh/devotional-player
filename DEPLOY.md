# Deployment Guide

## Option 1: Vercel (Recommended for Next.js)
Vercel is the creators of Next.js and offers the best "zero-configuration" deployment experience. They have a generous **Hobby** tier which is free for personal projects.

### Steps
1. **Create a Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up (GitHub login is easiest).
2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
3. **Deploy**:
   Run the following command in your project terminal:
   ```bash
   vercel
   ```
   - Follow the prompts (Say 'Y' to set up, accept defaults).
   - It will build and deploy your site.
   - You will get a URL like `https://devotional-player.vercel.app`.

### PWA Note
Vercel handles HTTPS automatically, which is required for PWA installation.

---

## Option 2: Firebase Hosting
Since you are already using Firebase for storage, you can host the app there too.

### Steps
1. **Install Firebase Tools**:
   ```bash
   npm install -g firebase-tools
   ```
2. **Login**:
   ```bash
   firebase login
   ```
3. **Initialize**:
   ```bash
   firebase init hosting
   ```
   - Select your existing project (`thiruppugazh-storage`).
   - Public directory: `out` (if static) or configure for Next.js. *Note: Next.js on Firebase can be complex.*
   - **Easier Alternative**: Use "Web Frameworks" support in Firebase:
     ```bash
     firebase experiments:enable webframeworks
     firebase init hosting
     ```
     (Detects Next.js and sets it up).
4. **Deploy**:
   ```bash
   firebase deploy
   ```

## Recommendation
**Use Vercel.** It is significantly easier for Next.js applications and works out of the box.
