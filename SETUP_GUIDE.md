# 🚀 Quick Setup Guide - WordPress E-Commerce Template

This guide walks you through setting up the template for your own WordPress/WooCommerce site.

---

## 📋 Prerequisites

- **WordPress site** with WooCommerce installed
- **Supabase account** (free tier is fine)
- **Node.js** 18+ and npm/pnpm installed

---

## ⚙️ Setup Steps

### 1️⃣ **WordPress & WooCommerce Configuration**

#### A. Generate WooCommerce API Keys
1. Log into your WordPress admin dashboard
2. Go to: **WooCommerce → Settings → Advanced → REST API**
3. Click **Add Key**
4. Set permissions: **Read/Write**
5. Copy your **Consumer Key** and **Consumer Secret** (save these securely)

#### B. Enable WordPress Application Passwords
1. Go to: **Users → Your Profile**
2. Scroll down to **Application Passwords**
3. Enter a name (e.g., "React App")
4. Click **Add New Application Password**
5. Copy the generated password (save this securely)

---

### 2️⃣ **Supabase Setup**

#### A. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for provisioning to complete
3. Go to **Project Settings → API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key**

#### B. Deploy Edge Functions
```powershell
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (you'll need your project ref from the URL)
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy
```

#### C. Set Supabase Secrets
```powershell
# Set WordPress site URL (no trailing slash)
supabase secrets set WORDPRESS_SITE_URL=https://yoursite.com

# Set WooCommerce API credentials
supabase secrets set WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxx
supabase secrets set WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
```

---

### 3️⃣ **Frontend Configuration**

#### A. Create `.env` File
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

Edit `.env` with your values:
```env
# Your WordPress site URL
VITE_WP_API_URL=https://yoursite.com

# Your Supabase project details
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Contact phone
VITE_CONTACT_PHONE=+1234567890
```

#### B. Install Dependencies
```powershell
npm install
```

#### C. Start Development Server
```powershell
npm run dev
```

Your site should now be running at `http://localhost:5173`

---

## 🎨 Branding & Customization

### 1️⃣ **Brand Colors**

Edit `src/index.css` (lines 11-14):
```css
:root {
  /* Change these HSL values for your brand colors */
  --brand-primary: 346 77% 50%;        /* Rose #E11D48 */
  --brand-primary-light: 346 77% 60%;
  --brand-primary-dark: 346 77% 40%;
  
  --brand-secondary: 215 20% 25%;      /* Slate gray */
  --brand-secondary-light: 215 20% 35%;
  
  /* All other colors reference these automatically */
  --primary: 346 77% 50%;
  --accent: 346 77% 50%;
  --discount: 346 77% 50%;
  /* ... etc */
}
```

**Color Picker Tip:** Use [hslpicker.com](https://hslpicker.com) to convert your brand colors to HSL format.

**Example brands:**
- Blue brand: `--brand-primary: 217 91% 60%;` (Tailwind blue-500)
- Green brand: `--brand-primary: 142 76% 36%;` (Emerald-600)
- Purple brand: `--brand-primary: 262 83% 58%;` (Purple-500)

---

### 2️⃣ **Site Information**

Edit `src/config/theme.config.ts`:
```typescript
export const themeConfig = {
  // Brand Identity
  brandName: "Your Store Name",
  brandTagline: "Your Tagline Here",
  
  // Contact Information
  contactPhone: "+1234567890",
  whatsAppNumber: "1234567890",
  storeEmail: "support@yourstore.com",
  storeAddress: "123 Your Street, City, Country",
  
  // Logo
  logoUrl: "/site-logo.svg",
  logoAlt: "Your Store Logo",
  
  // Notice Bar (optional)
  noticeEnabled: true,
  noticeText: "🎉 Special Sale: 20% off all items!",
  noticeDismissible: true,
  
  // Social Links
  socialLinks: {
    facebook: "https://facebook.com/yourstore",
    instagram: "https://instagram.com/yourstore",
    twitter: "https://twitter.com/yourstore",
    // ... etc
  },
  
  // SEO
  seo: {
    siteName: "Your Store",
    defaultTitle: "Your Store - Your Tagline",
    defaultDescription: "Shop amazing products at great prices.",
    // ... etc
  },
}
```

---

### 3️⃣ **Logo & Favicon**

1. **Logo:** Place your logo SVG/PNG in `public/` folder
2. Update `logoUrl` in `src/config/theme.config.ts`:
   ```typescript
   logoUrl: "/your-logo.svg",
   ```

3. **Favicon:** The app auto-fetches favicon from your WordPress site via the `wordpress-site-assets` edge function. No manual setup needed!

---

### 4️⃣ **Typography (Optional)**

Edit `src/config/theme.config.ts`:
```typescript
fonts: {
  heading: "'Montserrat', sans-serif",  // Your heading font
  body: "'Roboto', sans-serif",         // Your body font
},
```

Then import fonts in `src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:wght@400;500&display=swap');
```

---

## 🔄 Switching to a Different WordPress Site

### Backend (Supabase)
```powershell
# Update WordPress site URL
supabase secrets set WORDPRESS_SITE_URL=https://newsite.com

# Update WooCommerce API keys
supabase secrets set WOOCOMMERCE_CONSUMER_KEY=ck_new_key
supabase secrets set WOOCOMMERCE_CONSUMER_SECRET=cs_new_secret

# Redeploy functions (picks up new secrets)
supabase functions deploy
```

### Frontend
Update `.env`:
```env
VITE_WP_API_URL=https://newsite.com
```

Restart dev server:
```powershell
npm run dev
```

---

## 🔄 Switching to a Different Supabase Project

### Backend
```powershell
# Link to new project
supabase link --project-ref new-project-ref

# Set secrets for new project
supabase secrets set WORDPRESS_SITE_URL=https://yoursite.com
supabase secrets set WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
supabase secrets set WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx

# Deploy functions
supabase functions deploy
```

### Frontend
Update `.env`:
```env
VITE_SUPABASE_URL=https://new-project.supabase.co
VITE_SUPABASE_ANON_KEY=new-anon-key
```

Restart dev server:
```powershell
npm run dev
```

---

## 🚀 Deployment

### Build for Production
```powershell
npm run build
```

### Deploy to Vercel/Netlify
The `dist` folder contains your production build. Deploy it to:
- **Vercel:** Connect your GitHub repo, set environment variables in dashboard
- **Netlify:** Drag & drop `dist` folder or connect GitHub repo

**Important:** Set your environment variables in the hosting platform's dashboard:
- `VITE_WP_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🎯 Quick Checklist

- [ ] WordPress/WooCommerce API keys generated
- [ ] Supabase project created
- [ ] Edge functions deployed
- [ ] Supabase secrets configured
- [ ] `.env` file created and configured
- [ ] Brand colors updated in `src/index.css`
- [ ] Site info updated in `src/config/theme.config.ts`
- [ ] Logo added to `public/` folder
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `.env` | Frontend environment variables (Supabase + WordPress URL) |
| `src/config/theme.config.ts` | Brand name, contact info, social links, SEO |
| `src/index.css` | Brand colors (HSL format), typography, design tokens |
| `src/config/runtime.ts` | Supabase connection config (reads from `.env`) |
| `supabase/functions/_shared/config.ts` | Backend config (reads from Supabase secrets) |

---

## 🆘 Troubleshooting

### "Failed to fetch products/categories"
- ✅ Check Supabase secrets are set correctly
- ✅ Verify WooCommerce REST API is enabled
- ✅ Ensure WordPress permalinks are set (not "Plain")
- ✅ Check CORS is not blocking requests

### "CORS error"
- ✅ All edge functions include CORS headers (already implemented)
- ✅ Redeploy functions: `supabase functions deploy`

### "Images not loading"
- ✅ WordPress images are normalized to HTTPS automatically
- ✅ Check WordPress media library images are accessible

### "Authentication not working"
- ✅ Ensure Application Passwords are enabled in WordPress
- ✅ Verify WordPress site URL has no trailing slash in secrets

---

## 💡 Tips

1. **Test locally first** before deploying to production
2. **Keep secrets secure** - never commit `.env` to git (already in `.gitignore`)
3. **Use semantic versioning** for your site deployments
4. **Monitor Supabase usage** on free tier (generous limits but keep an eye on it)
5. **Optimize images** in WordPress for faster loading

---

## 🎉 You're All Set!

Your WordPress E-Commerce site is now running with a modern React frontend. Customize colors, branding, and content to make it your own!

**Need help?** Open an issue on GitHub or check the documentation.
