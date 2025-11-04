import { useEffect } from "react";
import { Package, Lock, Heart, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useWooCommerceOrders } from "@/hooks/useWooCommerceOrders";
import { useWooCommerceWishlist } from "@/hooks/useWooCommerceWishlist";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { gravatarUrl } from "@/lib/avatar";
 

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useWooCommerceOrders();
  const { formatCurrency } = useCurrency();
  const { data: wishlist, isLoading: wishlistLoading } = useWooCommerceWishlist();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "default";
      case "shipped": return "secondary";
      case "processing": return "outline";
      default: return "outline";
    }
  };

  // Optional extra fields that might come from WordPress
  type WPUserExtra = { avatarUrl?: string; phone?: string; role?: string };
  const extra = (user as unknown as WPUserExtra) || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">My Account</h1>
              <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

          {/* Profile Overview Card */}
          <Card className="mb-8 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={extra.avatarUrl || gravatarUrl(user.email)} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                  <CardDescription className="text-base">{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">#{order.orderNumber}</p>
                          <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet</p>
                    <p className="text-sm mt-2">Start shopping to see your orders here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : wishlist && wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <Card key={item.id} className="border shadow-sm">
                        <CardContent className="flex flex-col items-center p-4">
                          <img src={item.image} alt={item.name} className="h-24 w-24 object-cover rounded mb-2" />
                          <div className="font-semibold mb-1">{item.name}</div>
                          <div className="text-primary font-bold mb-1">${item.price}</div>
                          <Button size="sm" variant="outline">View</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your wishlist is empty</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={extra.avatarUrl || gravatarUrl(user.email)} alt={user.displayName} />
                    <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-lg">{user.displayName}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                    {extra.phone && <div className="text-muted-foreground">Phone: {extra.phone}</div>}
                    {extra.role && <div className="text-muted-foreground">Role: {extra.role}</div>}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue={user.displayName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} disabled />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
