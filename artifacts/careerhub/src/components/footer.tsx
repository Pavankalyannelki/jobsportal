export function Footer() {
  return (
    <footer className="bg-white border-t py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-sm">
              C
            </div>
            <span className="font-bold text-lg text-primary">CareerHub</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-sm">
            The platform trusted by leading professionals and top-tier companies to connect, grow, and build the future of work.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-foreground">For Job Seekers</h3>
          <ul className="space-y-3">
            <li><a href="/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Jobs</a></li>
            <li><a href="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Create Profile</a></li>
            <li><a href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign in</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-foreground">For Employers</h3>
          <ul className="space-y-3">
            <li><a href="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Post a Job</a></li>
            <li><a href="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Register Company</a></li>
            <li><a href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign in</a></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>CareerHub Platform. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary">Privacy Policy</a>
          <a href="#" className="hover:text-primary">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
