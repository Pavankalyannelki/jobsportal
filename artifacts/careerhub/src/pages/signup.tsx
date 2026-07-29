import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSignup } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Building2, User, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [role, setRole] = useState<'seeker' | 'company' | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    headline: "",
    company_name: "",
    industry: "",
  });

  const signupMutation = useSignup({
    mutation: {
      onSuccess: () => {
        if (role === 'seeker') {
          setLocation("/jobs");
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
    if (!role) return;

    signupMutation.mutate({
      data: {
        email: formData.email,
        password: formData.password,
        role: role,
        ...(role === 'seeker' ? {
          full_name: formData.full_name,
          headline: formData.headline || null,
        } : {
          company_name: formData.company_name,
          industry: formData.industry || null,
        })
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
          <p className="mt-2 text-muted-foreground">Join the professional network today.</p>
        </div>

        {!role ? (
          <div className="grid gap-4 mt-8">
            <button
              onClick={() => setRole('seeker')}
              className="flex items-start gap-4 p-6 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-primary">I'm looking for a job</h3>
                <p className="text-sm text-muted-foreground mt-1">Create a profile, browse jobs, and apply easily.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => setRole('company')}
              className="flex items-start gap-4 p-6 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-primary">I'm hiring</h3>
                <p className="text-sm text-muted-foreground mt-1">Post jobs, review candidates, and build your team.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="flex items-center gap-2 mb-6 cursor-pointer text-sm text-muted-foreground hover:text-foreground" onClick={() => setRole(null)}>
              <ArrowRight className="h-4 w-4 rotate-180" /> Back to role selection
            </div>

            {signupMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {signupMutation.error?.error || "An error occurred during signup."}
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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="At least 6 characters"
                />
              </div>

              {role === 'seeker' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="headline">Professional Headline (Optional)</Label>
                    <Input
                      id="headline"
                      value={formData.headline}
                      onChange={(e) => setFormData({...formData, headline: e.target.value})}
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                </>
              )}

              {role === 'company' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="e.g. Technology, Finance, Healthcare"
                    />
                  </div>
                </>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
