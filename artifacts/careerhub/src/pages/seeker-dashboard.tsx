import { useGetSeekerDashboard } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Briefcase, Activity, Clock, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

export default function SeekerDashboard() {
  const { data: dashboard, isLoading } = useGetSeekerDashboard();

  if (isLoading || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-8">
        <div className="container mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Track your applications and career progress.</p>
          </div>
          <Link href="/jobs" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2">
            Find New Jobs
          </Link>
        </div>

        {/* Profile Completeness Alert */}
        {dashboard.profile_completeness < 100 && (
          <div className="mb-8 p-5 bg-white border rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-amber-500" />
                  Complete your profile
                </h3>
                <span className="text-sm font-medium text-amber-600">{dashboard.profile_completeness}%</span>
              </div>
              <Progress value={dashboard.profile_completeness} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                A complete profile increases your chances of getting shortlisted by 3x.
              </p>
            </div>
            <Link href="/seeker/profile" className="shrink-0 w-full sm:w-auto inline-flex justify-center items-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Update Profile
            </Link>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Applications</p>
              <h3 className="text-3xl font-bold text-foreground">{dashboard.applications_submitted}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Under Review</p>
              <h3 className="text-3xl font-bold text-foreground">{dashboard.under_review}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Shortlisted</p>
              <h3 className="text-3xl font-bold text-foreground">{dashboard.shortlisted}</h3>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </h2>
            <Link href="/seeker/applications" className="text-sm font-medium text-primary hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
          
          <div className="divide-y">
            {dashboard.recent_activity.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Briefcase className="h-10 w-10 mb-4 opacity-20" />
                <p>No applications yet.</p>
                <Link href="/jobs" className="text-primary mt-2 font-medium hover:underline">Start browsing jobs</Link>
              </div>
            ) : (
              dashboard.recent_activity.map(activity => (
                <Link key={activity.application_id} href={`/jobs`} className="block hover:bg-gray-50 transition-colors p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{activity.job_title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.company_name}</p>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                      <StatusBadge status={activity.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple icon missing from lucide imports
function UserCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}
