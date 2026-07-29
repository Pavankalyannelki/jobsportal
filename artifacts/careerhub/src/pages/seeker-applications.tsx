import { useGetSeekerApplications } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Building2, Search, Calendar, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetSeekerApplicationsStatus } from "@workspace/api-client-react";

export default function SeekerApplications() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const queryParams = statusFilter !== "all" 
    ? { status: statusFilter as GetSeekerApplicationsStatus }
    : undefined;

  const { data: applications, isLoading } = useGetSeekerApplications(queryParams);

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">My Applications</h1>
            <p className="text-muted-foreground">Manage and track all your job applications.</p>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl border shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : !applications || applications.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm py-24 text-center px-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {statusFilter === "all" 
                ? "You haven't applied to any jobs yet. Start browsing to find your next role."
                : `You don't have any applications with the status "${statusFilter}".`}
            </p>
            {statusFilter !== "all" ? (
              <button 
                onClick={() => setStatusFilter("all")}
                className="text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <Link href="/jobs" className="inline-flex justify-center items-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-6">
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <Link key={app.id} href={`/jobs/${app.job_id}`}>
                <div className="group bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer block">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                      {app.company_logo_url ? (
                        <div className="h-12 w-12 rounded-lg border bg-white flex items-center justify-center overflow-hidden shrink-0 mt-1">
                          <img src={app.company_logo_url} alt={app.company_name} className="h-full w-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg border bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-lg mt-1">
                          {app.company_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {app.job_title}
                        </h3>
                        <div className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1 mb-2">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{app.company_name}</span>
                          {app.job_location && (
                            <>
                              <span className="text-gray-300 mx-1">•</span>
                              <span>{app.job_location}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 rounded-md px-2 py-1 inline-flex">
                          <Calendar className="h-3 w-3" />
                          Applied on {format(new Date(app.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:gap-4 md:border-l md:pl-6">
                      <StatusBadge status={app.status} />
                      <div className="text-sm font-medium text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity md:ml-auto">
                        View Job <ChevronRight className="h-4 w-4 ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
