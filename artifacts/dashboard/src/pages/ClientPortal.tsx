import React, { useState } from "react";
import { useParams } from "wouter";
import {
  useGetBusiness, getGetBusinessQueryKey,
  useGetBusinessUsage, getGetBusinessUsageQueryKey,
  useGetBusinessAnalytics, getGetBusinessAnalyticsQueryKey,
  useListCalls, getListCallsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Phone, Clock, TrendingUp, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const OUTCOME_COLORS: Record<string, string> = {
  booked: "#7c3aed",
  transferred: "#0ea5e9",
  voicemail: "#f59e0b",
  ai_handled: "#10b981",
};
const OUTCOME_LABELS: Record<string, string> = {
  booked: "Appointment Booked",
  transferred: "Transferred to Staff",
  voicemail: "Left Voicemail",
  ai_handled: "Handled by AI",
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400", label: "Active" },
    trialing: { cls: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400", label: "Trialing" },
    past_due: { cls: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400", label: "Past Due" },
    canceled: { cls: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400", label: "Canceled" },
  };
  const info = map[status] ?? { cls: "bg-gray-100 text-gray-600 border-gray-200", label: status.replace(/_/g, " ") };
  return (
    <Badge className={`border ${info.cls}`}>
      {info.label}
    </Badge>
  );
}

export function ClientPortal() {
  const { id } = useParams();
  const businessId = Number(id);
  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: business, isLoading: bLoading } = useGetBusiness(businessId, {
    query: { enabled: !!businessId, queryKey: getGetBusinessQueryKey(businessId) },
  });
  const { data: usage, isLoading: uLoading } = useGetBusinessUsage(businessId, {
    query: { enabled: !!businessId, queryKey: getGetBusinessUsageQueryKey(businessId) },
  });
  const { data: analytics, isLoading: aLoading } = useGetBusinessAnalytics(businessId, {
    query: { enabled: !!businessId, queryKey: getGetBusinessAnalyticsQueryKey(businessId) },
  });
  const { data: calls, isLoading: cLoading } = useListCalls(
    { businessId, limit: 20 },
    { query: { enabled: !!businessId, queryKey: getListCallsQueryKey({ businessId, limit: 20 }) } }
  );

  const isLimitExceeded = usage ? usage.percentUsed >= 100 : false;
  const isNearLimit = usage ? usage.percentUsed >= 80 && usage.percentUsed < 100 : false;
  const isSuspended = business?.status === "suspended";
  const aiOnline = !isLimitExceeded && !isSuspended;
  const isPastDue = business?.subscriptionStatus === "past_due";

  const pieData = analytics
    ? [
        { name: "Booked", value: analytics.bookedCalls, key: "booked" },
        { name: "Transferred", value: analytics.transferredCalls, key: "transferred" },
        { name: "Voicemail", value: analytics.voicemailCalls, key: "voicemail" },
        { name: "Resolved by AI", value: Math.max(0, analytics.answeredCalls - analytics.bookedCalls - analytics.transferredCalls), key: "ai_handled" },
      ].filter((d) => d.value > 0)
    : [];

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/billing-portal`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? res.statusText);
      }
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch {
      // Portal not configured — silently ignore (Stripe not set up)
    } finally {
      setPortalLoading(false);
    }
  };

  if (bLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl px-6">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
        <XCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Business Not Found</h1>
        <p className="text-muted-foreground">The link you followed may be incorrect or expired.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">{business.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{business.twilioNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {business.subscriptionStatus && (
              <SubStatusBadge status={business.subscriptionStatus} />
            )}
            {aiOnline ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                AI Active
              </Badge>
            ) : (
              <Badge variant="destructive">
                <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
                {isSuspended ? "Paused" : "Limit Reached"}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full space-y-8">
        {/* Alert banners */}
        {isPastDue && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Payment required</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your subscription payment is past due. Please update your billing information to keep your AI receptionist running.
              </p>
            </div>
            {business.stripeCustomerId && (
              <Button variant="destructive" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                {portalLoading ? "Opening…" : "Pay Now"}
              </Button>
            )}
          </div>
        )}
        {isLimitExceeded && !isPastDue && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">AI calls temporarily paused</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your plan's monthly minutes have been used. Contact your account manager to restore service or wait for your next billing cycle.
              </p>
            </div>
          </div>
        )}
        {isNearLimit && !isLimitExceeded && !isPastDue && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-900/10 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-400">Approaching your monthly limit</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                You've used {usage?.percentUsed.toFixed(0)}% of your {usage?.minutesLimit} included minutes this month.
              </p>
            </div>
          </div>
        )}
        {isSuspended && !isPastDue && (
          <div className="flex items-start gap-3 bg-muted border rounded-lg p-4">
            <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI receptionist paused</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Service is temporarily paused. Please contact your account manager.
              </p>
            </div>
          </div>
        )}

        {/* Usage + Plan */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Usage ring */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">This Month's Usage</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cycle started {new Date(business.billingCycleStart).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-8">
              {uLoading ? (
                <Skeleton className="w-48 h-48 rounded-full" />
              ) : usage ? (
                <>
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                      />
                      <circle
                        className={`stroke-current ${isLimitExceeded ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-primary"}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        strokeDasharray={`${Math.min(usage.percentUsed, 100) * 2.639} 263.9`}
                        transform="rotate(-90 50 50)"
                        style={{ transition: "stroke-dasharray 0.8s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-extrabold">{usage.minutesUsed}</span>
                      <span className="text-sm text-muted-foreground">of {usage.minutesLimit} min</span>
                      <span className={`text-sm font-semibold mt-1 ${isLimitExceeded ? "text-destructive" : isNearLimit ? "text-amber-600" : "text-green-600"}`}>
                        {usage.percentUsed.toFixed(0)}% used
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    {usage.overageMinutes ? (
                      <div className="space-y-1">
                        <Badge variant="destructive">{usage.overageMinutes} min over limit</Badge>
                        <p className="text-xs text-muted-foreground">Overage charges may apply</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{usage.minutesRemaining} minutes</span> remaining this cycle
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{usage.totalCalls} total calls this cycle</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Plan info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-2xl font-bold mt-1">{business.packageName ?? "—"}</p>
                    {business.subscriptionStatus && (
                      <div className="mt-2">
                        <SubStatusBadge status={business.subscriptionStatus} />
                      </div>
                    )}
                    {business.subscriptionPeriodEnd && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Renews {new Date(business.subscriptionPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                    {business.stripeCustomerId && (
                      <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        {portalLoading ? "Opening…" : "Manage Billing"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {!aLoading && analytics && (
              <>
                <StatCard
                  icon={<Phone className="h-5 w-5" />}
                  label="Total Calls (30 days)"
                  value={analytics.totalCalls}
                  sub={`${analytics.bookedCalls} appointments booked`}
                />
                <StatCard
                  icon={<Clock className="h-5 w-5" />}
                  label="Avg Call Duration"
                  value={analytics.avgCallDuration ? formatDuration(Math.round(analytics.avgCallDuration)) : "—"}
                  sub="per conversation"
                />
                <StatCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="After-Hours Calls Handled"
                  value={analytics.afterHoursCalls}
                  sub="calls outside business hours"
                />
              </>
            )}
          </div>
        </div>

        {/* Call activity chart */}
        {!aLoading && analytics && analytics.callsByDay.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Call Activity — Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.callsByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    formatter={(val: number) => [val, "Calls"]}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Outcome breakdown */}
        {!aLoading && analytics && analytics.totalCalls > 0 && pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How Your AI Handled Calls</CardTitle>
              <p className="text-sm text-muted-foreground">Breakdown of call outcomes in the last 30 days</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                        {pieData.map((entry) => (
                          <Cell key={entry.key} fill={OUTCOME_COLORS[entry.key]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {pieData.map((d) => (
                    <div key={d.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: OUTCOME_COLORS[d.key] }} />
                        <span className="text-sm font-medium">{OUTCOME_LABELS[d.key] ?? d.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{d.value}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          ({analytics.totalCalls > 0 ? ((d.value / analytics.totalCalls) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Calls</CardTitle>
            <p className="text-sm text-muted-foreground">Click a call to view the transcript</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-24 w-full" />
                    </TableCell>
                  </TableRow>
                ) : calls && calls.length > 0 ? (
                  calls.map((call) => (
                    <React.Fragment key={call.id}>
                      <TableRow
                        className={`${call.transcript ? "cursor-pointer hover:bg-muted/50" : ""}`}
                        onClick={() => call.transcript && setExpandedCallId(expandedCallId === call.id ? null : call.id)}
                      >
                        <TableCell className="text-sm">
                          {new Date(call.startedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {call.durationSeconds ? formatDuration(call.durationSeconds) : "—"}
                        </TableCell>
                        <TableCell>
                          {call.outcome ? (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: OUTCOME_COLORS[call.outcome], color: OUTCOME_COLORS[call.outcome] }}
                            >
                              {OUTCOME_LABELS[call.outcome] ?? call.outcome}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">In progress</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {call.transcript ? (
                            expandedCallId === call.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )
                          ) : null}
                        </TableCell>
                      </TableRow>
                      {expandedCallId === call.id && call.transcript && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/30 p-0">
                            <div className="px-6 py-4">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Conversation Transcript</p>
                              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-foreground/80 bg-background rounded-md p-4 border">
                                {call.transcript}
                              </pre>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No calls yet — your AI receptionist is ready and waiting
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>AI Receptionist — {business.name}</span>
          <span>Powered by AI Receptionist SaaS</span>
        </div>
      </footer>
    </div>
  );
}
