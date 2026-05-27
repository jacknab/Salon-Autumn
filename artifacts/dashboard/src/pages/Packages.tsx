import { useState } from "react";
import { useListPackages, getListPackagesQueryKey, useCreatePackage, useUpdatePackage, useDeletePackage } from "@workspace/api-client-react";
import type { Package } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Check, Edit2, Trash2, Package as PackageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type FormData = {
  name: string;
  includedMinutes: number;
  monthlyPrice: number;
  overageRate: number;
  features: string;
  stripePriceId: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  includedMinutes: 0,
  monthlyPrice: 0,
  overageRate: 0.10,
  features: "",
  stripePriceId: "",
};

export function Packages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<FormData>(EMPTY_FORM);

  const { data: packages, isLoading } = useListPackages({
    query: { queryKey: getListPackagesQueryKey() }
  });

  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();

  const handleCreate = () => {
    createPackage.mutate({
      data: {
        name: formData.name,
        includedMinutes: Number(formData.includedMinutes),
        monthlyPrice: Number(formData.monthlyPrice),
        overageRate: Number(formData.overageRate),
        features: formData.features.split(',').map(s => s.trim()).filter(Boolean),
        ...(formData.stripePriceId && { stripePriceId: formData.stripePriceId }),
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData(EMPTY_FORM);
        queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() });
        toast({ title: "Package created successfully" });
      },
      onError: (err) => {
        toast({ title: "Error creating package", description: String(err), variant: "destructive" });
      }
    });
  };

  const openEdit = (pkg: Package) => {
    setEditingPkg(pkg);
    setEditForm({
      name: pkg.name,
      includedMinutes: pkg.includedMinutes,
      monthlyPrice: pkg.monthlyPrice,
      overageRate: pkg.overageRate,
      features: (pkg.features ?? []).join(", "),
      stripePriceId: pkg.stripePriceId ?? "",
    });
    setIsEditOpen(true);
  };

  const handleEdit = () => {
    if (!editingPkg) return;
    updatePackage.mutate({
      id: editingPkg.id,
      data: {
        name: editForm.name,
        includedMinutes: Number(editForm.includedMinutes),
        monthlyPrice: Number(editForm.monthlyPrice),
        overageRate: Number(editForm.overageRate),
        features: editForm.features.split(',').map(s => s.trim()).filter(Boolean),
        stripePriceId: editForm.stripePriceId || undefined,
      }
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        setEditingPkg(null);
        queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() });
        toast({ title: "Package updated successfully" });
      },
      onError: (err) => {
        toast({ title: "Error updating package", description: String(err), variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    deletePackage.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() });
        toast({ title: "Package deleted" });
      }
    });
  };

  function PackageFormFields({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
    return (
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Package Name</Label>
          <Input id="name" value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} placeholder="e.g. Starter Tier" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Monthly Price ($)</Label>
            <Input id="price" type="number" value={data.monthlyPrice} onChange={e => onChange({ ...data, monthlyPrice: Number(e.target.value) })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minutes">Included Minutes</Label>
            <Input id="minutes" type="number" value={data.includedMinutes} onChange={e => onChange({ ...data, includedMinutes: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="overage">Overage Rate ($/min)</Label>
          <Input id="overage" type="number" step="0.01" value={data.overageRate} onChange={e => onChange({ ...data, overageRate: Number(e.target.value) })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="features">Features (comma separated)</Label>
          <Input id="features" value={data.features} onChange={e => onChange({ ...data, features: e.target.value })} placeholder="24/7 Support, Custom Voice, API Access" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priceId">Stripe Price ID <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="priceId" value={data.stripePriceId} onChange={e => onChange({ ...data, stripePriceId: e.target.value })} placeholder="price_xxxxxxxxxxxxx" className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground">Find this in your Stripe Dashboard → Products → Pricing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
          <p className="text-muted-foreground mt-1">Manage billing tiers and feature access.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>
            <PackageFormFields data={formData} onChange={setFormData} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={createPackage.isPending || !formData.name}>
                Save Package
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
            </DialogHeader>
            <PackageFormFields data={editForm} onChange={setEditForm} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEdit} disabled={updatePackage.isPending || !editForm.name}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages?.map(pkg => (
            <Card key={pkg.id} className="flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <PackageIcon className="h-6 w-6 text-primary/20" />
              </div>
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${pkg.monthlyPrice}</span> /mo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Limits</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Included</span>
                      <span className="font-medium">{pkg.includedMinutes} mins</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Overage</span>
                      <span className="font-medium">${pkg.overageRate.toFixed(2)}/min</span>
                    </div>
                  </div>

                  {pkg.stripePriceId && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Stripe</div>
                      <code className="text-xs text-muted-foreground font-mono break-all">{pkg.stripePriceId}</code>
                    </div>
                  )}

                  {pkg.features && pkg.features.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Features</div>
                      <ul className="space-y-2 text-sm">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-4 w-4 text-primary mr-2 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(pkg)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(pkg.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
