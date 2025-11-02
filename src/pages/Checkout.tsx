import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/cart";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Add some products before checkout
          </p>
          <Link to="/shop">
            <Button size="lg" className="btn-gradient">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    const orderData = {
      customer_id: user?.id || 0,
      billing: {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address_1: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        postcode: formData.get('zip'),
        country: formData.get('country'),
      },
      shipping: {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        address_1: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        postcode: formData.get('zip'),
        country: formData.get('country'),
      },
      line_items: cart.map(item => {
        // Remove 'p' prefix if exists (from old static data)
        const cleanId = item.id.toString().replace(/^p/, '');
        const productId = parseInt(cleanId, 10);
        
        if (isNaN(productId) || productId <= 0) {
          console.error('Invalid product ID:', item.id, 'cleaned:', cleanId);
          throw new Error(`Invalid product. Please clear your cart and add products again.`);
        }
        
        return {
          product_id: productId,
          quantity: item.quantity,
          price: item.price.toString(),
          subtotal: (item.price * item.quantity).toString(),
          total: (item.price * item.quantity).toString(),
        };
      }),
    };

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/woocommerce-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const result = await response.json();
      
      toast.success(`Order #${result.orderNumber} placed successfully!`);
      clearCart();
      navigate("/thank-you");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold font-heading mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold font-heading mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      defaultValue={user?.email || ''}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold font-heading mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input id="address" name="address" required />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province *</Label>
                      <Input id="state" name="state" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip">ZIP/Postal Code *</Label>
                      <Input id="zip" name="zip" required />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input id="country" name="country" required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold font-heading mb-4">
                  Payment Method
                </h2>
                <p className="text-muted-foreground">
                  Cash on Delivery (COD) - Pay when you receive your order
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-2xl font-bold font-heading mb-4">
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-accent">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full btn-gradient" disabled={loading}>
                  {loading ? "Processing..." : "Place Order (COD)"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
