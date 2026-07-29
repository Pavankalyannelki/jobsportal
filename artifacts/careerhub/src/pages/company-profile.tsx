import { useState, useEffect, useRef } from "react";
import { useGetCompanyProfile, useUpdateCompanyProfile, getGetCompanyProfileQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyProfileCompanySize } from "@workspace/api-client-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompanyProfile() {
  const { data: profile, isLoading } = useGetCompanyProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useUpdateCompanyProfile({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Company profile updated" });
        queryClient.setQueryData(getGetCompanyProfileQueryKey(), data);
      }
    }
  });

  const [formData, setFormData] = useState({
    company_name: "",
    logo_url: "",
    industry: "",
    company_size: "1-10" as CompanyProfileCompanySize,
    website_url: "",
    about: "",
    location: "",
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (profile && initializedForId.current !== profile.user_id) {
      initializedForId.current = profile.user_id;
      setFormData({
        company_name: profile.company_name || "",
        logo_url: profile.logo_url || "",
        industry: profile.industry || "",
        company_size: profile.company_size || "1-10",
        website_url: profile.website_url || "",
        about: profile.about || "",
        location: profile.location || "",
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
        logo_url: formData.logo_url || null,
        website_url: formData.website_url || null,
        about: formData.about || null,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">Company Profile</h1>
          <p className="text-muted-foreground">Manage your employer brand and details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm space-y-6">
            
            <div className="flex items-center gap-6 pb-6 border-b">
              {formData.logo_url ? (
                <div className="h-24 w-24 rounded-xl border bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <img src={formData.logo_url} alt="Company Logo" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-xl border bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-3xl">
                  {formData.company_name.substring(0, 2).toUpperCase() || "CO"}
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Label htmlFor="logo_url">Company Logo URL</Label>
                <Input 
                  id="logo_url" type="url" 
                  placeholder="https://..."
                  value={formData.logo_url} 
                  onChange={e => setFormData({...formData, logo_url: e.target.value})} 
                />
                <p className="text-xs text-muted-foreground">Link to an image file (PNG, JPG) for best results.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input 
                  id="company_name" required 
                  value={formData.company_name} 
                  onChange={e => setFormData({...formData, company_name: e.target.value})} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input 
                  id="website_url" type="url" 
                  value={formData.website_url} 
                  onChange={e => setFormData({...formData, website_url: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input 
                  id="industry" required 
                  value={formData.industry} 
                  onChange={e => setFormData({...formData, industry: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Company Size</Label>
                <Select 
                  value={formData.company_size} 
                  onValueChange={(v) => setFormData({...formData, company_size: v as CompanyProfileCompanySize})}
                >
                  <SelectTrigger id="company_size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Headquarters Location</Label>
                <Input 
                  id="location" required 
                  placeholder="e.g. New York, NY"
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="about">About the Company</Label>
                <Textarea 
                  id="about" 
                  className="min-h-[160px]"
                  placeholder="Describe your company culture, mission, and what you do..."
                  value={formData.about} 
                  onChange={e => setFormData({...formData, about: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="h-12 px-8 shadow-sm" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Company Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
