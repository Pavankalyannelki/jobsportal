import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        // Optimistically update the auth cache so useAuth gets it immediately
        queryClient.setQueryData(getGetMeQueryKey(), data.user);
        
        if (data.user.role === 'seeker') {
          setLocation("/seeker/dashboard");
        } else {
          setLocation("/company/dashboard");
        }
      }
    }
  });

  if (isLoading) return null;
  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: formData });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="mt-2 text-muted-foreground">Sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {loginMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {loginMutation.error?.error || "Invalid email or password."}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account? <Link href="/signup" className="text-primary font-medium hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
