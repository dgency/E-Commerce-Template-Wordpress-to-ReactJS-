import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { functionsFetch, authHeaders } from "@/lib/http/supabaseFunctions";
import ShippingSelector from "@/components/checkout/ShippingSelector";
import type { ShippingMethod } from "@/hooks/useWooCommerceShippingMethods";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);

  // Methods are handled inside ShippingSelector and emitted via onChange

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
    if (selectedZoneId == null) {
      toast.error("Please select a shipping zone.");
      return;
    }
    if (!selectedMethod) {
      toast.error("Shipping option not available for this zone.");
      return;
    }
    setLoading(true);

  const formData = new FormData(e.target as HTMLFormElement);

    // Collect only required fields
  const fullName = formData.get('fullName');
  const phone = formData.get('phone');
  const email = formData.get('email');
  const fullAddress = formData.get('fullAddress');
  const note = formData.get('note');

    // WooCommerce requires at least a non-empty string for email, so fallback to a dummy if blank
    const billing = {
      first_name: fullName,
      address_1: fullAddress,
      email: email && String(email).trim().length > 0 ? email : "guest@noemail.com",
      phone: phone,
      note: note,
    };
    const shipping = {
      first_name: fullName,
      address_1: fullAddress,
      phone: phone,
      note: note,
    };

    const orderData = {
      customer_id: user?.id || 0,
      billing,
      shipping,
      shipping_zone_id: selectedZoneId,
      shipping_lines: [
        {
          method_id: selectedMethod.method_id,
          method_title: selectedMethod.title,
          total: (shippingCost || 0).toFixed(2),
        },
      ],
      line_items: cart.map(item => {
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
      const response = await functionsFetch(`/woocommerce-checkout`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const result = await response.json();
      
  toast.success(`Order #${result.orderNumber} placed successfully!`);
  clearCart();
  navigate(`/thank-you?orderNumber=${result.orderNumber}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      toast.error(message);
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
              {/* Contact & Address Information */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold font-heading mb-4">Contact & Address Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" name="email" type="email" defaultValue={user?.email || ''} />
                  </div>
                  <div>
                    <Label htmlFor="fullAddress">Full Address *</Label>
                    <textarea id="fullAddress" name="fullAddress" required rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <Label htmlFor="note">Note (optional)</Label>
                    <Input id="note" name="note" />
                  </div>
                </div>
              </div>

              {/* Ship to different address removed per request */}

              {/* Shipping Zone Selection */}
              <ShippingSelector
                onChange={({ zoneId, method, cost }) => {
                  setSelectedZoneId(zoneId);
                  setSelectedMethod(method);
                  setShippingCost(cost || 0);
                }}
              />

              {/* Payment Information */}
              <div className="bg-card rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold font-heading mb-4">Payment Method</h2>
                <p className="text-muted-foreground">Cash on Delivery (COD) - Pay when you receive your order</p>
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
                    <span className="font-semibold">{shippingCost > 0 ? formatCurrency(shippingCost) : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-accent">{formatCurrency(cartTotal + (shippingCost || 0))}</span>
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
