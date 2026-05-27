import { useListBusinesses, getListBusinessesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Businesses() {
  const [search, setSearch] = useState("");
  
  const { data: businesses, isLoading } = useListBusinesses(undefined, {
    query: { queryKey: getListBusinessesQueryKey() }
  });

  const filtered = businesses?.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.twilioNumber.includes(search)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
          <p className="text-muted-foreground mt-1">Manage your client AI receptionists.</p>
        </div>
        <Link href="/businesses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Business
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? filtered.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-medium">
                      <Link href={`/businesses/${business.id}`} className="hover:underline hover:text-primary">
                        {business.name}
                      </Link>
                    </TableCell>
                    <TableCell>{business.twilioNumber}</TableCell>
                    <TableCell>
                      <Badge variant={business.status === 'active' ? 'default' : business.status === 'trial' ? 'secondary' : 'destructive'}>
                        {business.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{business.packageName || "Unknown"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/businesses/${business.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No businesses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
