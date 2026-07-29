import { useGetJobApplicants, useGetJob, useUpdateApplicationStatus, getGetJobApplicantsQueryKey, ApplicationWithSeekerStatus } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ChevronLeft, Users, FileText, Download, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDistanceToNow, format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function JobApplicants() {
  const { jobId } = useParams();
  const id = Number(jobId);
  const { data: job } = useGetJob(id, { query: { enabled: !!id } });
  const { data: applicants, isLoading } = useGetJobApplicants(id, { query: { enabled: !!id } });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useUpdateApplicationStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: getGetJobApplicantsQueryKey(id) });
      }
    }
  });

  const handleStatusChange = (applicationId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      applicationId,
      data: { status: newStatus as ApplicationWithSeekerStatus }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/company/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Manage Jobs
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Applicants</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-medium text-foreground">{job?.title}</span>
              <span>•</span>
              <StatusBadge status={job?.status || 'open'} />
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-3">
            <Users className="text-muted-foreground h-5 w-5" />
            <div>
              <div className="text-2xl font-bold leading-none">{applicants?.length || 0}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-2xl border shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : !applicants || applicants.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm py-24 text-center px-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No applicants yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              When candidates apply to this position, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map(app => (
              <div key={app.id} className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-foreground mb-1">{app.seeker_name}</h3>
                      <p className="text-muted-foreground font-medium">{app.seeker_headline || 'Professional'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5 justify-end mb-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {app.cover_note && (
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-foreground/80 leading-relaxed border border-gray-100">
                      <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Cover Note</p>
                      {app.cover_note}
                    </div>
                  )}
                </div>

                <div className="w-full md:w-64 flex flex-col justify-between gap-4 md:border-l md:pl-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Status</label>
                    <Select 
                      value={app.status} 
                      onValueChange={(val) => handleStatusChange(app.id, val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {app.resume_url && (
                    <a 
                      href={app.resume_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center w-full py-2.5 px-4 rounded-lg border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30 transition-colors font-medium text-sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Resume
                      <Download className="w-3.5 h-3.5 ml-auto opacity-50" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
