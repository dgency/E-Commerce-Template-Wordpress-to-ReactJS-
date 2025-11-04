import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, signup, forgotPassword } = useAuth();
  
  const [isLogin, setIsLogin] = useState(location.pathname === '/auth/login');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Password reset link sent to your email!");
      setIsForgotPassword(false);
      setEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(emailOrUsername, password);
        toast.success("Logged in successfully!");
        navigate('/account');
      } else {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        await signup(email, password, username);
        toast.success("Account created successfully!");
        navigate('/account');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `${isLogin ? 'Login' : 'Signup'} failed`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl p-8 border border-border/50">
        {/* Back Button for Forgot Password */}
        {isForgotPassword && (
          <button
            onClick={() => setIsForgotPassword(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        )}

        <h1 className="text-3xl font-bold font-heading text-center mb-2">
          {isForgotPassword 
            ? "Reset Password" 
            : isLogin 
            ? "Welcome Back" 
            : "Create Account"}
        </h1>
        
        <p className="text-center text-muted-foreground text-sm mb-6">
          {isForgotPassword 
            ? "Enter your email to receive a password reset link" 
            : isLogin 
            ? "Sign in to your account to continue" 
            : "Join us and start shopping today"}
        </p>

        {/* Forgot Password Form */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email Address</Label>
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="mt-1.5"
              />
            </div>

            <Button type="submit" className="w-full btn-gradient h-11">
              Send Reset Link
            </Button>
          </form>
        ) : (
          /* Login/Signup Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  className="mt-1.5"
                />
              </div>
            )}
            
            {isLogin ? (
              <div>
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input 
                  id="emailOrUsername" 
                  type="text" 
                  placeholder="your@email.com or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required 
                  className="mt-1.5"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="mt-1.5"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  className="mt-1.5"
                />
              </div>
            )}

            <Button type="submit" className="w-full btn-gradient h-11" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        )}

        {/* Toggle Login/Signup */}
        {!isForgotPassword && (
          <p className="text-center mt-6 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        )}

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
