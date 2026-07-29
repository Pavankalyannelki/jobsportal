import { useGetJob, useApplyToJob, getGetJobQueryKey, useGetSeekerProfile } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Building2, MapPin, DollarSign, Clock, Briefcase, ChevronLeft, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function JobDetail() {
  const { id } = useParams();
  const jobId = Number(id);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useGetJob(jobId, { query: { enabled: !!jobId } });
  
  // Only fetch profile if seeker, to optionally prefill resume
  const { data: profile } = useGetSeekerProfile({ query: { enabled: isAuthenticated && user?.role === 'seeker' } });

  const applyMutation = useApplyToJob({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Application Submitted",
          description: "Your application has been sent successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
        setIsOpen(false);
      }
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [useProfileResume, setUseProfileResume] = useState(false);

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="animate-pulse flex flex-col gap-8">
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Competitive salary";
    if (min && !max) return `$${min.toLocaleString()}+ per year`;
    if (!min && max) return `Up to $${max.toLocaleString()} per year`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()} per year`;
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const finalResumeUrl = useProfileResume ? profile?.resume_url : resumeUrl;
    
    applyMutation.mutate({
      jobId,
      data: {
        cover_note: coverNote || null,
        resume_url: finalResumeUrl || null,
      }
    });
  };

  const isCompanyOwner = user?.role === 'company' && job.posted_by === user.id;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to search
        </Link>

        {isCompanyOwner && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Briefcase className="h-5 w-5" />
              This is your job posting
            </div>
            <Link href={`/company/jobs/${jobId}/applicants`}>
              <Button size="sm" variant="outline" className="bg-white">View Applicants <ArrowUpRight className="h-4 w-4 ml-1"/></Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-3">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {job.company.company_name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 py-6 border-y mb-8">
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-gray-100 text-gray-800">{job.job_type}</Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-gray-100 text-gray-800">{job.work_mode}</Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-gray-100 text-gray-800">{job.experience_level}</Badge>
                <div className="flex items-center gap-1.5 ml-auto text-sm font-semibold text-primary">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-bold text-foreground mb-3">About the role</h3>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-8">
                  {job.description}
                </div>

                {job.responsibilities && (
                  <>
                    <h3 className="text-lg font-bold text-foreground mb-3 mt-8">Responsibilities</h3>
                    <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-8">
                      {job.responsibilities}
                    </div>
                  </>
                )}

                {job.requirements && (
                  <>
                    <h3 className="text-lg font-bold text-foreground mb-3 mt-8">Requirements</h3>
                    <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {job.requirements}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border sticky top-24">
              {/* Apply Action */}
              {!isAuthenticated ? (
                <Button className="w-full h-12 text-base mb-6" onClick={() => setLocation("/login")}>
                  Sign in to apply
                </Button>
              ) : user?.role === 'seeker' ? (
                job.has_applied ? (
                  <div className="w-full h-12 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center justify-center font-medium gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Application Submitted
                  </div>
                ) : (
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-12 text-base mb-6">Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                          at {job.company.company_name}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleApply} className="space-y-6 mt-4">
                        <div className="space-y-2">
                          <Label>Cover Note (Optional)</Label>
                          <Textarea 
                            placeholder="Why are you a good fit for this role?"
                            className="min-h-[120px]"
                            value={coverNote}
                            onChange={(e) => setCoverNote(e.target.value)}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label>Resume</Label>
                          {profile?.resume_url && (
                            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-gray-50">
                              <Checkbox 
                                id="use-profile-resume" 
                                checked={useProfileResume}
                                onCheckedChange={(checked) => setUseProfileResume(checked as boolean)}
                              />
                              <label
                                htmlFor="use-profile-resume"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Use resume from my profile
                              </label>
                            </div>
                          )}
                          {!useProfileResume && (
                            <div className="space-y-2">
                              <Input 
                                placeholder="Paste link to your resume (Drive, Dropbox, etc.)"
                                value={resumeUrl}
                                onChange={(e) => setResumeUrl(e.target.value)}
                                type="url"
                                required={!useProfileResume && !profile?.resume_url}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button type="submit" disabled={applyMutation.isPending} className="w-full sm:w-auto">
                            {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )
              ) : null}

              {/* Company Info */}
              <div>
                <h3 className="font-semibold text-lg mb-4">About the company</h3>
                <div className="flex items-center gap-4 mb-4">
                  {job.company.logo_url ? (
                    <div className="h-14 w-14 rounded-lg border bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <img src={job.company.logo_url} alt={job.company.company_name} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-lg border bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-xl">
                      {job.company.company_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-foreground">{job.company.company_name}</div>
                    <a href={job.company.website_url || "#"} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                      Visit website
                    </a>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{job.company.industry}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Company size</span>
                    <span className="font-medium">{job.company.company_size}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{job.company.location}</span>
                  </div>
                </div>

                {job.company.about && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-4">
                    {job.company.about}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
