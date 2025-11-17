import { useState } from "react";
import { functionsFetch } from "@/lib/http/supabaseFunctions";
// import { useWooCommerceOrders } from "@/hooks/useWooCommerceOrders";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, XCircle } from "lucide-react";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTracking(null);
    // Normalize input: strip leading #, non-digits, and whitespace
    const cleanId = orderId.replace(/^#/, "").replace(/\D+/g, "").trim();
    if (!cleanId) {
      setLoading(false);
      setError("Please enter your Order Number.");
      return;
    }
    try {
      const response = await functionsFetch(`woocommerce-orders?order_id=${cleanId}`);
      if (!response.ok) {
        throw new Error('Order not found or API error.');
      }
      const order = await response.json();
      setTracking(order);
      setLoading(false);
    } catch {
      setLoading(false);
      setError("Order not found. Please check your Order Number.");
    }
  };

  type OrderItem = {
    id: string | number;
    name: string;
    image?: string;
    quantity?: number;
    price?: number;
  };

  return (
  <div className="min-h-[60vh] bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-start pt-12 pb-10">
    {/* Hero Section */}
    <div className="flex flex-col items-center mb-4">
      <Package className="h-14 w-14 text-primary mb-2 animate-bounce" />
      <h1 className="text-4xl font-bold font-heading mb-2 text-center">Track Your Order</h1>
      <p className="text-muted-foreground text-lg text-center max-w-xl">Enter your Order ID below to see the latest status, expected delivery, and more. Stay updated in real time!</p>
    </div>
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-primary/20 mt-2">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left: Form */}
        <div className="w-full md:w-1/2 p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Order Tracking</CardTitle>
            <CardDescription>Get real-time updates for your order</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4 w-full">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col w-full">
                  <label htmlFor="orderId" className="text-sm font-medium mb-1">Order Number</label>
                  <input
                    id="orderId"
                    type="text"
                    placeholder="e.g. 123456 or #123456"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  />
                </div>
                {/* Phone/email removed by request - only order number field remains */}
                <Button type="submit" className="w-full py-3 text-lg font-semibold" disabled={loading}>
                  <Search className="h-5 w-5 mr-2" />
                  {loading ? "Tracking..." : "Track Order"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Enter your order number to track your order.</div>
            </form>
            <div className="mt-4 text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
              <span className="font-semibold">Tip:</span> You can include or omit the leading # (e.g., 123456 or #123456).
            </div>
            {error && (
              <div className="mt-6 flex items-center gap-2 text-red-500 bg-red-50 rounded-md p-3">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </div>
        {/* Right: Results */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
          {tracking ? (
            <div className="mt-0 md:mt-8">
              <div className="flex items-center gap-3 mb-4">
                {tracking.status && tracking.status.toLowerCase() === "delivered" ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : tracking.status && tracking.status.toLowerCase() === "shipped" ? (
                  <Truck className="h-6 w-6 text-blue-500" />
                ) : (
                  <Package className="h-6 w-6 text-primary" />
                )}
                <span className="text-lg font-bold">Status:</span>
                <Badge variant={tracking.status && tracking.status.toLowerCase() === "delivered" ? "default" : tracking.status && tracking.status.toLowerCase() === "shipped" ? "secondary" : "outline"}>
                  {tracking.status}
                </Badge>
              </div>
              <table className="w-full text-sm border rounded-md overflow-hidden mb-4">
                <tbody>
                  <tr className="bg-muted/30">
                    <td className="font-semibold p-2 w-1/3">Order Date</td>
                    <td className="p-2">{tracking.date ? new Date(tracking.date).toLocaleDateString() : "-"}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold p-2">Items</td>
                    <td className="p-2">{tracking.items ? tracking.items.length : 0}</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="font-semibold p-2">Total</td>
                    <td className="p-2">{tracking.total ? tracking.total : "-"} {tracking.currency ? tracking.currency : ""}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold p-2">Payment Method</td>
                    <td className="p-2">{tracking.paymentMethod ? tracking.paymentMethod : "-"}</td>
                  </tr>
                </tbody>
              </table>
              {/* Product details */}
              {tracking.items && tracking.items.length > 0 && (
                <div className="mt-4">
                  <span className="block text-sm font-semibold mb-2">Products Ordered:</span>
                  <table className="w-full text-sm border rounded-md overflow-hidden">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="p-2">Image</th>
                        <th className="p-2">Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(tracking.items as OrderItem[]).map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded" />
                            ) : (
                              <span className="text-muted-foreground">No image</span>
                            )}
                          </td>
                          <td className="p-2 font-semibold">{item.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-2 text-sm text-muted-foreground">For more details, check your <a href="/account" className="text-primary underline">Order History</a>.</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px]">
              <Truck className="h-16 w-16 text-muted-foreground animate-bounce mb-4" />
              <p className="text-lg text-muted-foreground font-semibold mb-2">Ready to track your order?</p>
              <p className="text-sm text-muted-foreground">Enter your order number and click <span className="font-bold text-primary">Track Order</span> to see your order status and details.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
    {/* Decorative Section for Empty Page */}
    <div className="mt-6 flex flex-col items-center">
      <Truck className="h-10 w-10 text-muted-foreground mb-2 animate-pulse" />
      <p className="text-muted-foreground text-sm">Fast, secure, and reliable delivery for every order.</p>
    </div>
  </div>
  )
}
export default TrackOrder;
