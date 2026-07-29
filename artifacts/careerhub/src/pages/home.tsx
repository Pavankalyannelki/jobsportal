import { useGetPlatformStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Building2, Users, Briefcase } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: stats } = useGetPlatformStats();
  const [, setLocation] = useLocation();
  const [keyword, setKeyword] = useState("");
  const [location, setSearchLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    setLocation(`/jobs?${params.toString()}`);
  };

  const categories = [
    { name: "Software Engineering", keyword: "Software" },
    { name: "Product Management", keyword: "Product" },
    { name: "Design", keyword: "Design" },
    { name: "Marketing", keyword: "Marketing" },
    { name: "Sales", keyword: "Sales" },
    { name: "Data Science", keyword: "Data" },
    { name: "Finance", keyword: "Finance" },
    { name: "Remote", work_mode: "Remote" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b bg-primary/5">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6">
              Find your next role,<br />or your next great hire.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              The premier platform for professional opportunities. Trusted by industry leaders to connect talent with purpose.
            </p>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-lg border flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Job title, keyword, or company"
                  className="pl-12 border-0 focus-visible:ring-0 shadow-none text-base h-12 bg-transparent"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-border my-auto" />
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="City, state, or Remote"
                  className="pl-12 border-0 focus-visible:ring-0 shadow-none text-base h-12 bg-transparent"
                  value={location}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 text-base shrink-0 rounded-xl">
                Find Jobs
              </Button>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium">
              <Link href="/jobs" className="text-primary hover:underline underline-offset-4">Browse all jobs</Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/signup" className="text-primary hover:underline underline-offset-4">Post a job</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x">
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-bold text-foreground tracking-tight mb-2">
                {stats?.total_jobs ? stats.total_jobs.toLocaleString() : "..."}
              </h3>
              <p className="text-muted-foreground font-medium">Open Positions</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-bold text-foreground tracking-tight mb-2">
                {stats?.total_companies ? stats.total_companies.toLocaleString() : "..."}
              </h3>
              <p className="text-muted-foreground font-medium">Companies Hiring</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-bold text-foreground tracking-tight mb-2">
                {stats?.total_hires ? stats.total_hires.toLocaleString() : "..."}
              </h3>
              <p className="text-muted-foreground font-medium">Successful Hires</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Category</h2>
            <p className="text-muted-foreground">Find the role that matches your expertise.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                href={`/jobs?${cat.keyword ? `keyword=${cat.keyword}` : `work_mode=${cat.work_mode}`}`}
                className="px-6 py-3 rounded-full bg-white border shadow-sm hover:border-primary/30 hover:shadow-md transition-all font-medium text-foreground hover:text-primary cursor-pointer"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white border-t">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                For Job Seekers
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Land your dream role.</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-accent/20 text-accent-foreground font-bold flex items-center justify-center border border-accent/30">1</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Create Profile</h4>
                    <p className="text-muted-foreground">Highlight your experience, skills, and portfolio. Stand out to top employers.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-accent/20 text-accent-foreground font-bold flex items-center justify-center border border-accent/30">2</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Apply with One Click</h4>
                    <p className="text-muted-foreground">Find roles that match your criteria and apply instantly using your profile.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-accent/20 text-accent-foreground font-bold flex items-center justify-center border border-accent/30">3</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Track Progress</h4>
                    <p className="text-muted-foreground">See when your application is viewed, shortlisted, or scheduled for an interview.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                For Employers
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Build an exceptional team.</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">1</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Register Company</h4>
                    <p className="text-muted-foreground">Set up your employer brand. Showcase your culture and benefits.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">2</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Post Jobs</h4>
                    <p className="text-muted-foreground">Reach thousands of qualified professionals actively looking for their next move.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">3</div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Review & Hire</h4>
                    <p className="text-muted-foreground">Manage applicants seamlessly from our dashboard. Shortlist the best.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
