import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateBusiness, useListPackages, getListPackagesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

export function CreateBusiness() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    twilioNumber: "",
    packageId: "",
    openaiPrompt: "",
    voicePersonality: "professional",
  });

  const { data: packages, isLoading: pkgsLoading } = useListPackages({
    query: { queryKey: getListPackagesQueryKey() }
  });

  const createBusiness = useCreateBusiness();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.twilioNumber || !formData.packageId) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createBusiness.mutate({
      data: {
        name: formData.name,
        twilioNumber: formData.twilioNumber,
        packageId: Number(formData.packageId),
        status: "active",
        openaiPrompt: formData.openaiPrompt,
        voicePersonality: formData.voicePersonality
      }
    }, {
      onSuccess: (res) => {
        toast({ title: "Business created successfully" });
        setLocation(`/businesses/${res.id}`);
      },
      onError: (err) => {
        toast({ title: "Error creating business", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Business</h1>
          <p className="text-muted-foreground mt-1">Onboard a new client and configure their AI receptionist.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
            <CardDescription>Basic information for billing and identification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                placeholder="e.g. Apex Salon" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Twilio Phone Number <span className="text-destructive">*</span></Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 000-0000" 
                  value={formData.twilioNumber}
                  onChange={e => setFormData({...formData, twilioNumber: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="package">Billing Package <span className="text-destructive">*</span></Label>
                {pkgsLoading ? <Skeleton className="h-10 w-full" /> : (
                  <Select value={formData.packageId} onValueChange={v => setFormData({...formData, packageId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                          {pkg.name} (${pkg.monthlyPrice}/mo)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>Configure how the AI receptionist behaves and speaks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="personality">Voice Personality</Label>
              <Select value={formData.voicePersonality} onValueChange={v => setFormData({...formData, voicePersonality: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select personality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Crisp</SelectItem>
                  <SelectItem value="warm">Warm & Friendly</SelectItem>
                  <SelectItem value="energetic">Energetic & Upbeat</SelectItem>
                  <SelectItem value="calm">Calm & Reassuring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prompt">System Prompt</Label>
              <Textarea 
                id="prompt" 
                className="min-h-[200px]"
                placeholder="You are the receptionist for Apex Salon. Your primary goal is to book appointments. Be polite..." 
                value={formData.openaiPrompt}
                onChange={e => setFormData({...formData, openaiPrompt: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                This prompt forms the core instructions for the AI. Include business hours, services, and handling instructions for specific inquiries.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/businesses">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createBusiness.isPending}>
            {createBusiness.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Business
          </Button>
        </div>
      </form>
    </div>
  );
}
