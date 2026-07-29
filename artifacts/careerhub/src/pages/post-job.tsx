import { useState, useEffect } from "react";
import { useCreateJob, useGetJob, useUpdateJob, getGetCompanyJobsQueryKey, JobInputJobType, JobInputWorkMode, JobInputExperienceLevel } from "@workspace/api-client-react";
import { useParams, useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PostJob() {
  const { jobId } = useParams();
  const isEdit = !!jobId;
  const id = Number(jobId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useGetJob(id, { query: { enabled: isEdit } });
  
  const createMutation = useCreateJob({
    mutation: {
      onSuccess: () => {
        toast({ title: "Job posted successfully" });
        queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
        setLocation("/company/jobs");
      }
    }
  });

  const updateMutation = useUpdateJob({
    mutation: {
      onSuccess: () => {
        toast({ title: "Job updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
        setLocation("/company/jobs");
      }
    }
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    responsibilities: "",
    requirements: "",
    location: "",
    work_mode: "On-site" as JobInputWorkMode,
    job_type: "Full-time" as JobInputJobType,
    experience_level: "Mid" as JobInputExperienceLevel,
    salary_min: "",
    salary_max: "",
  });

  useEffect(() => {
    if (isEdit && job) {
      setFormData({
        title: job.title,
        description: job.description,
        responsibilities: job.responsibilities || "",
        requirements: job.requirements || "",
        location: job.location,
        work_mode: job.work_mode as JobInputWorkMode,
        job_type: job.job_type as JobInputJobType,
        experience_level: job.experience_level as JobInputExperienceLevel,
        salary_min: job.salary_min?.toString() || "",
        salary_max: job.salary_max?.toString() || "",
      });
    }
  }, [isEdit, job]);

  if (isEdit && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      responsibilities: formData.responsibilities || null,
      requirements: formData.requirements || null,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
    };

    if (isEdit) {
      updateMutation.mutate({ jobId: id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/company/jobs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Manage Jobs
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
            {isEdit ? "Edit Job Posting" : "Post a New Job"}
          </h1>
          <p className="text-muted-foreground">Reach thousands of active professionals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-foreground">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Job Title</Label>
                <Input 
                  id="title" required 
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" required 
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_mode">Work Mode</Label>
                <Select 
                  value={formData.work_mode} 
                  onValueChange={(v) => setFormData({...formData, work_mode: v as JobInputWorkMode})}
                >
                  <SelectTrigger id="work_mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type</Label>
                <Select 
                  value={formData.job_type} 
                  onValueChange={(v) => setFormData({...formData, job_type: v as JobInputJobType})}
                >
                  <SelectTrigger id="job_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select 
                  value={formData.experience_level} 
                  onValueChange={(v) => setFormData({...formData, experience_level: v as JobInputExperienceLevel})}
                >
                  <SelectTrigger id="experience_level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry / Student">Entry / Student</SelectItem>
                    <SelectItem value="Mid">Mid Level</SelectItem>
                    <SelectItem value="Senior">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    id="salary_min" type="number" 
                    placeholder="80000"
                    className="pl-8"
                    value={formData.salary_min} 
                    onChange={e => setFormData({...formData, salary_min: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    id="salary_max" type="number" 
                    placeholder="120000"
                    className="pl-8"
                    value={formData.salary_max} 
                    onChange={e => setFormData({...formData, salary_max: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-foreground">Job Description</h2>
            
            <div className="space-y-2">
              <Label htmlFor="description">About the role</Label>
              <Textarea 
                id="description" required
                className="min-h-[160px]"
                placeholder="Overview of the position, team, and impact..."
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities (Optional)</Label>
              <Textarea 
                id="responsibilities" 
                className="min-h-[120px]"
                placeholder="Key day-to-day duties..."
                value={formData.responsibilities} 
                onChange={e => setFormData({...formData, responsibilities: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (Optional)</Label>
              <Textarea 
                id="requirements" 
                className="min-h-[120px]"
                placeholder="Required skills, qualifications, experience..."
                value={formData.requirements} 
                onChange={e => setFormData({...formData, requirements: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" size="lg" className="h-12 px-8" onClick={() => setLocation("/company/jobs")}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="h-12 px-8 shadow-sm" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update Job" : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
