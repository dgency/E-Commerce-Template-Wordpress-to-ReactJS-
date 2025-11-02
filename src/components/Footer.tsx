import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { themeConfig } from "@/config/theme.config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import categories from "@/data/categories.json";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      {/* Newsletter Section */}
      {themeConfig.footer.showNewsletter && (
        <div className="border-b border-border/20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold font-heading mb-2">
                {themeConfig.newsletter.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {themeConfig.newsletter.subtitle}
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button className="btn-gradient">
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="text-xl font-bold font-heading mb-4">
              {themeConfig.brandName}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {themeConfig.brandTagline}
            </p>
            <div className="space-y-2 text-sm">
              <p>{themeConfig.storeAddress}</p>
              <p>Email: {themeConfig.storeEmail}</p>
              <p>Phone: {themeConfig.contactPhone}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-accent transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">Legal</h4>
            <ul className="space-y-2 text-sm mb-6">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-accent transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="hover:text-accent transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            {/* Social Links */}
            {themeConfig.footer.showSocialLinks && (
              <div>
                <h4 className="text-lg font-bold font-heading mb-4">
                  Follow Us
                </h4>
                <div className="flex gap-3">
                  <a
                    href={themeConfig.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={themeConfig.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={themeConfig.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href={themeConfig.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-center text-muted-foreground">
            {themeConfig.footer.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
