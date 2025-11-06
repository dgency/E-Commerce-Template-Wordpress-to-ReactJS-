/**
 * Theme Configuration
 * Edit these values to rebrand the entire store in minutes
 */

export const themeConfig = {
  // Brand Identity
  brandName: "Dgency Store",
  brandTagline: "Quality Products, Exceptional Service",
  
  // Contact Information
  contactPhone: "+15551234567",
  whatsAppNumber: "15551234567",
  storeEmail: "support@dgencystore.com",
  storeAddress: "123 Market St, Springfield, USA",
  
  // Visual Identity
  // Global logo: points to public/logo.svg by default
  logoUrl: "/site-logo.svg",
  logoAlt: "Dgency Store Logo",
  
  // Notice Bar
  noticeEnabled: true,
  noticeText: "🎉 Autumn Sale: Extra 10% off on all orders!",
  noticeDismissible: true,
  
  // Social Links
  socialLinks: {
    facebook: "https://facebook.com/dgencystore",
    instagram: "https://instagram.com/dgencystore",
    twitter: "https://twitter.com/dgencystore",
    pinterest: "https://pinterest.com/dgencystore",
    youtube: "https://youtube.com/@dgencystore",
  },
  
  // Theme Colors (can be overridden in CSS)
  colors: {
    primary: "#E11D48",
    secondary: "#374151",
  },
  
  // Typography
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  
  // Hero Slider Settings
  hero: {
    autoplaySpeed: 5000, // milliseconds
    showArrows: true,
    showDots: true,
  },
  
  // Product Grid Settings
  products: {
    perPage: 12,
    showQuickView: true,
    showWishlist: true,
  },
  
  // Currency
  currency: {
    code: "USD",
    symbol: "$",
    position: "before", // 'before' or 'after'
  },
  
  // Newsletter
  newsletter: {
    enabled: true,
    title: "Subscribe to Our Newsletter",
    subtitle: "Get the latest deals and updates",
  },
  
  // Footer
  footer: {
    showNewsletter: true,
    showSocialLinks: true,
    copyrightText: `© ${new Date().getFullYear()} Dgency Store. All rights reserved.`,
  },
  
  // SEO
  seo: {
    siteName: "Dgency Store",
    defaultTitle: "Dgency Store - Quality Products, Exceptional Service",
    defaultDescription: "Shop the latest products at unbeatable prices. Fast shipping, easy returns, and excellent customer service.",
    defaultKeywords: "online shopping, quality products, fast shipping, best deals",
  },
} as const;

export type ThemeConfig = typeof themeConfig;
