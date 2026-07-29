import { useGetCompanyDashboard, useGetCompanyJobs, useUpdateJob, getGetCompanyJobsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, Briefcase, Eye, ChevronRight, PlusCircle, Switch } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { useQueryClient } from "@tanstack/react-query";
import { Switch as SwitchUI } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CompanyDashboard() {
  const { data: dashboard, isLoading: dashLoading } = useGetCompanyDashboard();
  const { data: jobs, isLoading: jobsLoading } = useGetCompanyJobs();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateJobMutation = useUpdateJob({
    mutation: {
      onSuccess: () => {
        toast({ title: "Job status updated" });
        queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
      }
    }
  });

  const handleStatusToggle = (jobId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    updateJobMutation.mutate({
      jobId,
      data: { status: newStatus as "open" | "closed" }
    });
  };

  if (dashLoading || jobsLoading || !dashboard) {
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

  const recentJobs = jobs?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">Employer Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings and applicants.</p>
          </div>
          <Link href="/company/jobs/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-6 shadow-sm hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Post a New Job
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Postings</p>
              <h3 className="text-3xl font-bold text-foreground">{dashboard.active_postings}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Applicants</p>
              <h3 className="text-3xl font-bold text-foreground">{dashboard.total_applicants}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Awaiting Review</p>
              <h3 className="text-3xl font-bold text-foreground">{dashboard.awaiting_review}</h3>
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-foreground">Recent Postings</h2>
            <Link href="/company/jobs" className="text-sm font-medium text-primary hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
          
          <div className="divide-y">
            {recentJobs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Briefcase className="h-10 w-10 mb-4 opacity-20 mx-auto" />
                <p>No jobs posted yet.</p>
                <Link href="/company/jobs/new" className="text-primary mt-2 font-medium hover:underline inline-block">Post your first job</Link>
              </div>
            ) : (
              recentJobs.map(job => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/jobs/${job.id}`} className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
                        {job.title}
                      </Link>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-3">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.work_mode}</span>
                      <span>•</span>
                      <span>{job.job_type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <Link href={`/company/jobs/${job.id}/applicants`} className="flex flex-col items-center justify-center p-2 px-4 rounded-lg hover:bg-gray-100 transition-colors group">
                      <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-none mb-1">
                        {job.applicant_count}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Applicants
                      </span>
                    </Link>
                    
                    <div className="h-10 w-px bg-border hidden sm:block"></div>
                    
                    <div className="flex items-center gap-2">
                      <SwitchUI 
                        checked={job.status === 'open'} 
                        onCheckedChange={() => handleStatusToggle(job.id, job.status)}
                        id={`status-${job.id}`}
                      />
                      <Label htmlFor={`status-${job.id}`} className="text-sm font-medium w-12 cursor-pointer">
                        {job.status === 'open' ? 'Open' : 'Closed'}
                      </Label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
