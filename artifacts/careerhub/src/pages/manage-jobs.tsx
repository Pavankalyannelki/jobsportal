import { useGetCompanyJobs, useUpdateJob, getGetCompanyJobsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Briefcase, Users, PlusCircle, Search, Edit2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ManageJobs() {
  const { data: jobs, isLoading } = useGetCompanyJobs();
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

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">Manage Jobs</h1>
            <p className="text-muted-foreground">View and edit your job postings.</p>
          </div>
          <Link href="/company/jobs/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-6 shadow-sm hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Post a New Job
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-xl border shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm py-24 text-center px-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't created any job postings yet. Create your first listing to start receiving applications.
            </p>
            <Link href="/company/jobs/new" className="inline-flex justify-center items-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-6">
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-muted-foreground font-medium border-b">
                  <tr>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Posted Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Applicants</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/jobs/${job.id}`} className="font-semibold text-base text-foreground hover:text-primary transition-colors block mb-1">
                          {job.title}
                        </Link>
                        <div className="text-xs text-muted-foreground flex gap-2">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.work_mode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(job.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={job.status === 'open'} 
                            onCheckedChange={() => handleStatusToggle(job.id, job.status)}
                            id={`status-${job.id}`}
                          />
                          <StatusBadge status={job.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link href={`/company/jobs/${job.id}/applicants`} className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">
                          <Users className="w-4 h-4 mr-1.5" />
                          {job.applicant_count}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/company/jobs/${job.id}/edit`} className="text-muted-foreground hover:text-primary transition-colors flex items-center text-sm font-medium">
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
