import { useGetAdminStats, useGetRecentActivity, getGetAdminStatsQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, PhoneCall, Clock, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  const { data: recentActivity, isLoading: activityLoading } = useGetRecentActivity({ limit: 10 }, {
    query: { queryKey: getGetRecentActivityQueryKey({ limit: 10 }) }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <>
                <div className="text-2xl font-bold">{stats?.totalBusinesses || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeBusinesses || 0} active
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <div className="text-2xl font-bold">{stats?.totalCallsToday || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutes Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <div className="text-2xl font-bold">{stats?.totalMinutesToday || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {statsLoading ? <Skeleton className="h-7 w-20" /> : (
              <div className="text-2xl font-bold">${(stats?.totalRevenueMtd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Businesses</CardTitle>
            <CardDescription>By call volume this month</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : stats?.topBusinesses && stats.topBusinesses.length > 0 ? (
              <div className="space-y-4">
                {stats.topBusinesses.map(business => (
                  <div key={business.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <Link href={`/businesses/${business.id}`} className="font-medium hover:underline text-primary">
                        {business.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">{business.callsThisMonth} calls</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{business.minutesUsed} min</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live call feed across all clients</CardDescription>
          </CardHeader>
          <CardContent>
             {activityLoading ? (
               <div className="space-y-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
             ) : recentActivity && recentActivity.length > 0 ? (
               <div className="space-y-4">
                 {recentActivity.map(call => (
                   <div key={call.id} className="flex items-start gap-4">
                     <div className="mt-1 bg-primary/10 p-2 rounded-full">
                       <Activity className="h-4 w-4 text-primary" />
                     </div>
                     <div className="flex-1 space-y-1">
                       <p className="text-sm font-medium leading-none">
                         {call.callerNumber} <span className="text-muted-foreground font-normal">called</span> {call.businessName}
                       </p>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <span>{new Date(call.startedAt).toLocaleTimeString()}</span>
                         {call.durationSeconds && (
                           <>
                             <span>•</span>
                             <span>{Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s</span>
                           </>
                         )}
                         {call.outcome && (
                           <>
                             <span>•</span>
                             <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                               {call.outcome}
                             </Badge>
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground">No recent activity</div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
