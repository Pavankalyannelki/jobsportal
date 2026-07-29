import { useGetSeekerProfile, useUpdateSeekerProfile, getGetSeekerProfileQueryKey } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SeekerProfile() {
  const { data: profile, isLoading } = useGetSeekerProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useUpdateSeekerProfile({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Profile updated successfully" });
        queryClient.setQueryData(getGetSeekerProfileQueryKey(), data);
      }
    }
  });

  const [formData, setFormData] = useState({
    full_name: "",
    headline: "",
    location: "",
    phone: "",
    bio: "",
    skills: [] as string[],
    education: [] as any[],
    experience: [] as any[],
    resume_url: "",
    linkedin_url: "",
    portfolio_url: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (profile && initializedForId.current !== profile.user_id) {
      initializedForId.current = profile.user_id;
      setFormData({
        full_name: profile.full_name || "",
        headline: profile.headline || "",
        location: profile.location || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
        education: profile.education || [],
        experience: profile.experience || [],
        resume_url: profile.resume_url || "",
        linkedin_url: profile.linkedin_url || "",
        portfolio_url: profile.portfolio_url || "",
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      data: {
        ...formData,
        headline: formData.headline || null,
        location: formData.location || null,
        phone: formData.phone || null,
        bio: formData.bio || null,
        resume_url: formData.resume_url || null,
        linkedin_url: formData.linkedin_url || null,
        portfolio_url: formData.portfolio_url || null,
      }
    });
  };

  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !formData.skills.includes(val)) {
        setFormData({ ...formData, skills: [...formData.skills, val] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and resume.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-foreground">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name" required 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input 
                  id="headline" 
                  placeholder="e.g. Senior Product Designer"
                  value={formData.headline} 
                  onChange={e => setFormData({...formData, headline: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">About Me (Bio)</Label>
                <Textarea 
                  id="bio" 
                  className="min-h-[120px]"
                  placeholder="Tell employers about yourself..."
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-foreground">Links & Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="resume_url">Resume URL</Label>
                <Input 
                  id="resume_url" type="url" 
                  placeholder="Link to Drive/Dropbox"
                  value={formData.resume_url} 
                  onChange={e => setFormData({...formData, resume_url: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input 
                  id="linkedin_url" type="url" 
                  value={formData.linkedin_url} 
                  onChange={e => setFormData({...formData, linkedin_url: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input 
                  id="portfolio_url" type="url" 
                  value={formData.portfolio_url} 
                  onChange={e => setFormData({...formData, portfolio_url: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-foreground">Skills</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Add Skills (Press Enter or Comma)</Label>
                <Input 
                  id="skills" 
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillAdd}
                  placeholder="e.g. React, TypeScript, Figma"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary font-medium text-sm">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary/70 text-primary focus:outline-none">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {formData.skills.length === 0 && <span className="text-sm text-muted-foreground">No skills added yet.</span>}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Education</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, education: [...formData.education, { school: "", degree: "", field: "", start_year: new Date().getFullYear(), end_year: null }]})}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-6">
              {formData.education.map((edu, index) => (
                <div key={index} className="p-5 border rounded-xl bg-gray-50 relative group">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, education: formData.education.filter((_, i) => i !== index)})}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>School / University</Label>
                      <Input value={edu.school} onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[index].school = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input value={edu.degree} placeholder="e.g. BS, MS" onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[index].degree = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input value={edu.field} placeholder="e.g. Computer Science" onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[index].field = e.target.value;
                        setFormData({...formData, education: newEdu});
                      }} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Year</Label>
                      <Input type="number" value={edu.start_year || ""} onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[index].start_year = parseInt(e.target.value) || new Date().getFullYear();
                        setFormData({...formData, education: newEdu});
                      }} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Year (Leave blank if current)</Label>
                      <Input type="number" value={edu.end_year || ""} onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[index].end_year = e.target.value ? parseInt(e.target.value) : null;
                        setFormData({...formData, education: newEdu});
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              {formData.education.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No education history added.
                </div>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Experience</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, experience: [...formData.experience, { company_name: "", title: "", start_date: "", end_date: null, description: "" }]})}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-6">
              {formData.experience.map((exp, index) => (
                <div key={index} className="p-5 border rounded-xl bg-gray-50 relative group">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, experience: formData.experience.filter((_, i) => i !== index)})}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={exp.company_name} onChange={e => {
                        const newExp = [...formData.experience];
                        newExp[index].company_name = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input value={exp.title} onChange={e => {
                        const newExp = [...formData.experience];
                        newExp[index].title = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date (YYYY-MM)</Label>
                      <Input type="month" value={exp.start_date?.substring(0, 7) || ""} onChange={e => {
                        const newExp = [...formData.experience];
                        newExp[index].start_date = e.target.value ? `${e.target.value}-01` : "";
                        setFormData({...formData, experience: newExp});
                      }} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (Leave blank if current)</Label>
                      <Input type="month" value={exp.end_date?.substring(0, 7) || ""} onChange={e => {
                        const newExp = [...formData.experience];
                        newExp[index].end_date = e.target.value ? `${e.target.value}-01` : null;
                        setFormData({...formData, experience: newExp});
                      }} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea value={exp.description || ""} onChange={e => {
                        const newExp = [...formData.experience];
                        newExp[index].description = e.target.value;
                        setFormData({...formData, experience: newExp});
                      }} className="h-24" />
                    </div>
                  </div>
                </div>
              ))}
              {formData.experience.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No work experience added.
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-6 flex justify-end">
            <Button type="submit" size="lg" className="h-12 px-8 shadow-lg" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
