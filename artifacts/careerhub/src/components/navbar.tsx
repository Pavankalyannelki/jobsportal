import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase, LogOut, Menu, User, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
    },
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xl">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">CareerHub</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Find Jobs
            </Link>
            {!isAuthenticated && (
              <Link href="/signup" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                For Employers
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && !isAuthenticated && (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden md:block">
                Sign in
              </Link>
              <Link href="/signup">
                <Button data-testid="button-register">Register</Button>
              </Link>
            </>
          )}

          {!isLoading && isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <UserCircle className="h-5 w-5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.role === 'seeker' ? 'Job Seeker' : 'Company'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user.role === 'seeker' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/seeker/dashboard" className="cursor-pointer w-full flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seeker/applications" className="cursor-pointer w-full flex items-center">
                        <Menu className="mr-2 h-4 w-4" />
                        <span>My Applications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seeker/profile" className="cursor-pointer w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/company/dashboard" className="cursor-pointer w-full flex items-center">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/company/jobs/new" className="cursor-pointer w-full flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Post a Job</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/company/jobs" className="cursor-pointer w-full flex items-center">
                        <Menu className="mr-2 h-4 w-4" />
                        <span>Manage Jobs</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/company/profile" className="cursor-pointer w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Company Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer focus:text-red-600"
                  onClick={() => logoutMutation.mutate()}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
