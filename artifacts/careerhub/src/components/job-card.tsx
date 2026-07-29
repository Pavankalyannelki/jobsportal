import { Link } from "wouter";
import { MapPin, Briefcase, Clock, Building, CheckCircle2 } from "lucide-react";
import { JobCard as JobCardType } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  job: JobCardType;
  showApplyButton?: boolean;
}

export function JobCard({ job, showApplyButton = true }: Props) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Competitive";
    if (min && !max) return `$${min.toLocaleString()}+/yr`;
    if (!min && max) return `Up to $${max.toLocaleString()}/yr`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}/yr`;
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group block h-full bg-card rounded-xl border p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-4">
            {job.company_logo_url ? (
              <div className="h-12 w-12 rounded-lg border bg-white flex items-center justify-center overflow-hidden shrink-0">
                <img src={job.company_logo_url} alt={job.company_name} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg border bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-lg">
                {job.company_name.substring(0, 2).toUpperCase()}
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                <Building className="h-3.5 w-3.5" />
                <span>{job.company_name}</span>
                <span className="text-gray-300 mx-1">•</span>
                <MapPin className="h-3.5 w-3.5" />
                <span>{job.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-normal bg-secondary text-secondary-foreground shadow-none">
            {job.job_type}
          </Badge>
          <Badge variant="secondary" className="font-normal bg-secondary text-secondary-foreground shadow-none">
            {job.work_mode}
          </Badge>
          <Badge variant="secondary" className="font-normal bg-secondary text-secondary-foreground shadow-none">
            {job.experience_level}
          </Badge>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm font-medium text-foreground">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
            
            {showApplyButton && (
              job.has_applied ? (
                <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Applied
                </div>
              ) : (
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View Job
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
