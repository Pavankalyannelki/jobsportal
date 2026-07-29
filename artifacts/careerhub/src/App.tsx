import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

// Pages
import Home from '@/pages/home';
import Jobs from '@/pages/jobs';
import JobDetail from '@/pages/job-detail';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import SeekerDashboard from '@/pages/seeker-dashboard';
import SeekerProfile from '@/pages/seeker-profile';
import SeekerApplications from '@/pages/seeker-applications';
import CompanyDashboard from '@/pages/company-dashboard';
import CompanyProfile from '@/pages/company-profile';
import ManageJobs from '@/pages/manage-jobs';
import PostJob from '@/pages/post-job';
import JobApplicants from '@/pages/job-applicants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function PrivateRoute({ component: Component, role }: { component: any, role: 'seeker' | 'company' }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated || user?.role !== role) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/jobs/:jobId" component={JobDetail} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          
          {/* Seeker Routes */}
          <Route path="/seeker/dashboard">
            {() => <PrivateRoute component={SeekerDashboard} role="seeker" />}
          </Route>
          <Route path="/seeker/profile">
            {() => <PrivateRoute component={SeekerProfile} role="seeker" />}
          </Route>
          <Route path="/seeker/applications">
            {() => <PrivateRoute component={SeekerApplications} role="seeker" />}
          </Route>

          {/* Company Routes */}
          <Route path="/company/dashboard">
            {() => <PrivateRoute component={CompanyDashboard} role="company" />}
          </Route>
          <Route path="/company/profile">
            {() => <PrivateRoute component={CompanyProfile} role="company" />}
          </Route>
          <Route path="/company/jobs">
            {() => <PrivateRoute component={ManageJobs} role="company" />}
          </Route>
          <Route path="/company/jobs/new">
            {() => <PrivateRoute component={PostJob} role="company" />}
          </Route>
          <Route path="/company/jobs/:jobId/edit">
            {() => <PrivateRoute component={PostJob} role="company" />}
          </Route>
          <Route path="/company/jobs/:jobId/applicants">
            {() => <PrivateRoute component={JobApplicants} role="company" />}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
