import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Package, Mail, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const ThankYou = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div
          className={`text-center mb-8 transition-all duration-700 ${
            showContent
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
        >
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <CheckCircle2
              className="w-24 h-24 text-primary mx-auto relative animate-scale-in"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Content Card */}
        <div
          className={`bg-card rounded-2xl shadow-xl p-8 md:p-12 border border-border/50 transition-all duration-700 delay-300 ${
            showContent
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-center mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-center text-muted-foreground mb-8">
            Your order has been successfully placed
          </p>

          {/* Order Info */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Order Confirmed</h3>
                <p className="text-sm text-muted-foreground">
                  We've received your order and will begin processing it shortly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Confirmation Email Sent</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email for order details and tracking information.
                </p>
              </div>
            </div>
          </div>

          {/* Order Number */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-bold font-mono text-primary">
              #{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/account" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full group"
              >
                View Orders
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/shop" className="flex-1">
              <Button size="lg" className="w-full btn-gradient group">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Need help? Contact our{" "}
          <Link to="/contact" className="text-primary hover:underline">
            support team
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
