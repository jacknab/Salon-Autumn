import { useState } from "react";
import { useListCalls, getListCallsQueryKey, useListBusinesses, getListBusinessesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, PhoneMissed, PhoneForwarded, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export function Calls() {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  
  const { data: businesses } = useListBusinesses(undefined, {
    query: { queryKey: getListBusinessesQueryKey() }
  });

  const businessId = selectedBusiness !== "all" ? Number(selectedBusiness) : undefined;
  
  const { data: calls, isLoading } = useListCalls(
    businessId ? { businessId } : undefined,
    {
      query: { queryKey: getListCallsQueryKey(businessId ? { businessId } : undefined) }
    }
  );

  const getOutcomeIcon = (outcome: string | null | undefined) => {
    switch (outcome) {
      case "booked": return <PlayCircle className="h-4 w-4 text-green-500" />;
      case "transferred": return <PhoneForwarded className="h-4 w-4 text-blue-500" />;
      case "voicemail": return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case "ai_handled": return <PlayCircle className="h-4 w-4 text-primary" />;
      default: return <PhoneMissed className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Call Log</h1>
          <p className="text-muted-foreground mt-1">Monitor all inbound calls across all clients.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b mb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by Business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Businesses</SelectItem>
                {businesses?.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Caller ID</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls && calls.length > 0 ? calls.map(call => (
                  <TableRow key={call.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(call.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/businesses/${call.businessId}`} className="hover:underline hover:text-primary">
                        {call.businessName}
                      </Link>
                    </TableCell>
                    <TableCell>{call.callerNumber}</TableCell>
                    <TableCell>
                      {call.durationSeconds !== null && call.durationSeconds !== undefined 
                        ? `${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s` 
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOutcomeIcon(call.outcome)}
                        {call.outcome ? (
                          <Badge variant="outline" className="capitalize">{call.outcome.replace('_', ' ')}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unknown</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                       {call.cost !== null && call.cost !== undefined ? `$${call.cost.toFixed(2)}` : "—"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No calls found matching the current filters.
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
