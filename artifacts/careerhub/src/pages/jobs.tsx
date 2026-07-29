import { useListJobs } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { JobCard } from "@/components/job-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCardJobType, JobCardWorkMode, JobCardExperienceLevel } from "@workspace/api-client-react";

export default function Jobs() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setSearchLocation] = useState(searchParams.get("location") || "");
  
  // Create state for select filters
  const [jobType, setJobType] = useState<string>(searchParams.get("job_type") || "all");
  const [workMode, setWorkMode] = useState<string>(searchParams.get("work_mode") || "all");
  const [experienceLevel, setExperienceLevel] = useState<string>(searchParams.get("experience_level") || "all");

  const [, setLocation] = useLocation();

  const queryParams = {
    ...(keyword && { keyword }),
    ...(location && { location }),
    ...(jobType && jobType !== "all" && { job_type: jobType as JobCardJobType }),
    ...(workMode && workMode !== "all" && { work_mode: workMode as JobCardWorkMode }),
    ...(experienceLevel && experienceLevel !== "all" && { experience_level: experienceLevel as JobCardExperienceLevel }),
  };

  const { data: jobs, isLoading } = useListJobs(queryParams);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    if (jobType && jobType !== "all") params.append("job_type", jobType);
    if (workMode && workMode !== "all") params.append("work_mode", workMode);
    if (experienceLevel && experienceLevel !== "all") params.append("experience_level", experienceLevel);
    setLocation(`/jobs?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Update URL when dropdowns change
  useEffect(() => {
    applyFilters();
  }, [jobType, workMode, experienceLevel]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Search header */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Job title, keyword, or company"
                className="pl-10 h-12 bg-gray-50"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City, state, or Remote"
                className="pl-10 h-12 bg-gray-50"
                value={location}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 shrink-0 px-8">Search</Button>
          </form>

          <div className="flex items-center gap-4 flex-wrap pt-4 border-t">
            <div className="flex items-center text-sm font-medium text-muted-foreground shrink-0 mr-2">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </div>
            
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-[160px] h-10 bg-white">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Job Type</SelectItem>
                {Object.values(JobCardJobType).map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger className="w-[160px] h-10 bg-white">
                <SelectValue placeholder="Work Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Work Mode</SelectItem>
                {Object.values(JobCardWorkMode).map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="w-[180px] h-10 bg-white">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Experience</SelectItem>
                {Object.values(JobCardExperienceLevel).map(e => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(keyword || location || jobType !== "all" || workMode !== "all" || experienceLevel !== "all") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setKeyword("");
                  setSearchLocation("");
                  setJobType("all");
                  setWorkMode("all");
                  setExperienceLevel("all");
                  setLocation("/jobs");
                }}
                className="text-muted-foreground ml-auto"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-6">
            {isLoading ? "Searching..." : `${jobs?.length || 0} Jobs Found`}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">No jobs match your criteria</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search keywords, location, or filters to find more opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
