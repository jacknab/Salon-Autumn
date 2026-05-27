import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetBusiness, getGetBusinessQueryKey,
  useGetBusinessUsage, getGetBusinessUsageQueryKey,
  useGetBusinessAnalytics, getGetBusinessAnalyticsQueryKey,
  useListCalls, getListCallsQueryKey,
  useUpdateBusiness,
  useResetBillingCycle,
  useGetSubscription, getGetSubscriptionQueryKey,
  useCreateSubscription,
  useCancelSubscription,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, AlertTriangle, RotateCcw, Power, Save, ChevronDown, ChevronUp, ExternalLink, CreditCard } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const OUTCOME_COLORS = {
  booked: "hsl(var(--primary))",
  transferred: "hsl(199 89% 48%)",
  voicemail: "hsl(39 100% 50%)",
  ai_handled: "hsl(160 84% 39%)",
};

const OUTCOME_LABELS: Record<string, string> = {
  booked: "Booked",
  transferred: "Transferred",
  voicemail: "Voicemail",
  ai_handled: "Resolved by AI",
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function SubStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <Badge variant="outline">No Subscription</Badge>;
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    active: { variant: "default", label: "Active" },
    trialing: { variant: "secondary", label: "Trialing" },
    past_due: { variant: "destructive", label: "Past Due" },
    canceled: { variant: "outline", label: "Canceled" },
    incomplete: { variant: "outline", label: "Incomplete" },
    unpaid: { variant: "destructive", label: "Unpaid" },
  };
  const info = map[status] ?? { variant: "outline" as const, label: status.replace(/_/g, " ") };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function BillingPanel({ businessId }: { businessId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [priceIdInput, setPriceIdInput] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: sub, isLoading } = useGetSubscription(businessId, {
    query: { enabled: !!businessId, queryKey: getGetSubscriptionQueryKey(businessId) },
  });

  const createSub = useCreateSubscription();
  const cancelSub = useCancelSubscription();

  const handleCreate = () => {
    createSub.mutate(
      { id: businessId, data: { stripePriceId: priceIdInput } },
      {
        onSuccess: () => {
          toast({ title: "Stripe subscription created" });
          setPriceIdInput("");
          queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey(businessId) });
          queryClient.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
        },
        onError: (e) =>
          toast({ title: "Failed to create subscription", description: String(e), variant: "destructive" }),
      }
    );
  };

  const handleCancel = () => {
    cancelSub.mutate(
      { id: businessId },
      {
        onSuccess: () => {
          toast({ title: "Subscription will cancel at period end" });
          queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey(businessId) });
        },
        onError: (e) =>
          toast({ title: "Failed to cancel subscription", description: String(e), variant: "destructive" }),
      }
    );
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/billing-portal`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? res.statusText);
      }
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (e) {
      toast({ title: "Could not open billing portal", description: String(e), variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  const hasSubscription = !!sub?.stripeSubscriptionId;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Subscription
            </CardTitle>
            <SubStatusBadge status={sub?.subscriptionStatus} />
          </div>
          {sub?.subscriptionPeriodEnd && (
            <CardDescription>
              {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} on{" "}
              {new Date(sub.subscriptionPeriodEnd).toLocaleDateString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasSubscription ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No active Stripe subscription. Enter a Stripe Price ID to create one.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="price_xxxxxxxxxxxxx"
                  value={priceIdInput}
                  onChange={(e) => setPriceIdInput(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCreate}
                  disabled={!priceIdInput.trim() || createSub.isPending}
                >
                  {createSub.isPending ? "Creating…" : "Create"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Find Price IDs in your Stripe Dashboard → Products → Pricing. You can also set a default Price ID per package on the Packages page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Subscription ID</div>
                  <code className="font-mono text-xs break-all">{sub.stripeSubscriptionId}</code>
                </div>
                {sub.stripeCustomerId && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Customer ID</div>
                    <code className="font-mono text-xs break-all">{sub.stripeCustomerId}</code>
                  </div>
                )}
              </div>

              {sub.cancelAtPeriodEnd && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Subscription will cancel on{" "}
                  {sub.subscriptionPeriodEnd
                    ? new Date(sub.subscriptionPeriodEnd).toLocaleDateString()
                    : "the current period end"}
                </div>
              )}

              <div className="flex gap-2 pt-1 flex-wrap">
                {sub.stripeCustomerId && (
                  <Button variant="outline" size="sm" onClick={handlePortal} disabled={portalLoading}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {portalLoading ? "Opening…" : "Billing Portal"}
                  </Button>
                )}
                {!sub.cancelAtPeriodEnd && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={cancelSub.isPending}>
                        Cancel at Period End
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The subscription will remain active until{" "}
                          {sub.subscriptionPeriodEnd
                            ? new Date(sub.subscriptionPeriodEnd).toLocaleDateString()
                            : "the end of the current period"}
                          , then automatically cancel. No charges will be made after that date.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BusinessDetail() {
  const { id } = useParams();
  const businessId = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);
  const [editingConfig, setEditingConfig] = useState(false);
  const [configForm, setConfigForm] = useState({ openaiPrompt: "", voicePersonality: "" });

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

  const updateBusiness = useUpdateBusiness();
  const resetBilling = useResetBillingCycle();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetBusinessQueryKey(businessId) });
    queryClient.invalidateQueries({ queryKey: getGetBusinessUsageQueryKey(businessId) });
  };

  const handleToggleStatus = () => {
    const nextStatus = business?.status === "active" ? "suspended" : "active";
    updateBusiness.mutate(
      { id: businessId, data: { status: nextStatus } },
      {
        onSuccess: () => {
          toast({ title: `Business ${nextStatus === "active" ? "activated" : "suspended"}` });
          invalidateAll();
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
      }
    );
  };

  const handleBillingReset = () => {
    resetBilling.mutate(
      { id: businessId },
      {
        onSuccess: () => {
          toast({ title: "Billing cycle reset — usage counter restarted from today" });
          invalidateAll();
          queryClient.invalidateQueries({ queryKey: getListCallsQueryKey({ businessId, limit: 20 }) });
        },
        onError: () => toast({ title: "Failed to reset billing cycle", variant: "destructive" }),
      }
    );
  };

  const handleSaveConfig = () => {
    updateBusiness.mutate(
      { id: businessId, data: { openaiPrompt: configForm.openaiPrompt, voicePersonality: configForm.voicePersonality } },
      {
        onSuccess: () => {
          toast({ title: "AI configuration saved" });
          setEditingConfig(false);
          invalidateAll();
        },
        onError: () => toast({ title: "Failed to save configuration", variant: "destructive" }),
      }
    );
  };

  const startEditing = () => {
    setConfigForm({
      openaiPrompt: business?.openaiPrompt ?? "",
      voicePersonality: business?.voicePersonality ?? "",
    });
    setEditingConfig(true);
  };

  if (bLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!business) {
    return <div className="text-muted-foreground py-12 text-center">Business not found</div>;
  }

  const isLimitExceeded = usage ? usage.percentUsed >= 100 : false;
  const isNearLimit = usage ? usage.percentUsed >= 80 && usage.percentUsed < 100 : false;
  const isSuspended = business.status === "suspended";

  const pieData = analytics
    ? [
        { name: "Booked", value: analytics.bookedCalls, key: "booked" },
        { name: "Transferred", value: analytics.transferredCalls, key: "transferred" },
        { name: "Voicemail", value: analytics.voicemailCalls, key: "voicemail" },
        { name: "Resolved by AI", value: analytics.answeredCalls - analytics.bookedCalls - analytics.transferredCalls, key: "ai_handled" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{business.name}</h1>
              <Badge variant={business.status === "active" ? "default" : business.status === "trial" ? "secondary" : "destructive"}>
                {business.status}
              </Badge>
              {isLimitExceeded && <Badge variant="destructive">AI Disabled</Badge>}
            </div>
            <p className="text-muted-foreground mt-1">
              {business.twilioNumber} &bull; {business.packageName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const base = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "");
                const url = `${base}/client/${businessId}`;
                navigator.clipboard.writeText(url);
                toast({ title: "Client portal link copied!", description: url });
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Client Portal
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={updateBusiness.isPending}>
                  <Power className="h-4 w-4 mr-2" />
                  {isSuspended ? "Activate" : "Suspend"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isSuspended ? "Activate business?" : "Suspend business?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isSuspended
                      ? "The AI receptionist will resume accepting calls immediately."
                      : "All incoming calls will be rejected until you reactivate this business."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleToggleStatus}>
                    {isSuspended ? "Activate" : "Suspend"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={resetBilling.isPending}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Billing
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset billing cycle?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This sets today as the new billing cycle start date. The minute counter will restart from 0. Use this when you manually invoice a client or extend their plan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBillingReset}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {isLimitExceeded && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Minute limit reached — AI calls disabled</AlertTitle>
          <AlertDescription>
            This business has used {usage?.minutesUsed} of {usage?.minutesLimit} minutes.
            {usage?.overageMinutes ? ` Overage: ${usage.overageMinutes} min ($${usage.overageCost?.toFixed(2)}).` : ""}
            {" "}Reset the billing cycle or upgrade the package to restore service.
          </AlertDescription>
        </Alert>
      )}
      {isNearLimit && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Approaching minute limit</AlertTitle>
          <AlertDescription>
            {usage?.minutesUsed} of {usage?.minutesLimit} minutes used ({usage?.percentUsed.toFixed(0)}%).
            {" "}{usage?.minutesRemaining} minutes remaining this billing cycle.
          </AlertDescription>
        </Alert>
      )}
      {isSuspended && (
        <Alert>
          <Power className="h-4 w-4" />
          <AlertTitle>Business suspended</AlertTitle>
          <AlertDescription>
            All incoming calls are being rejected. Activate the business to restore service.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage + Chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Usage This Cycle</CardTitle>
            <CardDescription>
              Cycle started {new Date(business.billingCycleStart).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {uLoading ? (
              <Skeleton className="h-40 w-40 rounded-full" />
            ) : usage ? (
              <>
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-muted stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent" />
                    <circle
                      className={`stroke-current ${isLimitExceeded ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-primary"}`}
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={`${Math.min(usage.percentUsed, 100) * 2.51} 251.2`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold">{usage.minutesUsed}</span>
                    <span className="text-xs text-muted-foreground">/ {usage.minutesLimit} min</span>
                    <span className="text-xs text-muted-foreground mt-1">{usage.percentUsed.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="mt-4 text-center space-y-1">
                  {usage.overageMinutes ? (
                    <>
                      <Badge variant="destructive">{usage.overageMinutes} min overage</Badge>
                      <div className="text-sm font-medium">${usage.overageCost?.toFixed(2)} extra</div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">{usage.minutesRemaining} mins remaining</div>
                  )}
                  <div className="text-xs text-muted-foreground">{usage.totalCalls} calls this cycle</div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Call Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            {aLoading ? (
              <Skeleton className="w-full h-full" />
            ) : analytics?.callsByDay && analytics.callsByDay.length > 0 ? (
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
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  />
                  <Bar dataKey="count" name="Calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No call data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="log" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="log">Call Log</TabsTrigger>
          <TabsTrigger value="insights">Outcome Analysis</TabsTrigger>
          <TabsTrigger value="config">AI Configuration</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cLoading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-20 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : calls && calls.length > 0 ? (
                    calls.map((call) => (
                      <React.Fragment key={call.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedCallId(expandedCallId === call.id ? null : call.id)}
                        >
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(call.startedAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium font-mono text-sm">{call.callerNumber}</TableCell>
                          <TableCell className="text-sm">
                            {call.durationSeconds ? formatDuration(call.durationSeconds) : "—"}
                          </TableCell>
                          <TableCell>
                            {call.outcome ? (
                              <Badge
                                variant="outline"
                                className="capitalize text-xs"
                                style={{ borderColor: OUTCOME_COLORS[call.outcome as keyof typeof OUTCOME_COLORS] }}
                              >
                                {OUTCOME_LABELS[call.outcome] ?? call.outcome}
                              </Badge>
                            ) : (
                              "—"
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
                          <TableRow key={`${call.id}-transcript`}>
                            <TableCell colSpan={5} className="bg-muted/30">
                              <div className="py-3 px-2">
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Transcript</div>
                                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-foreground/80">
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
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No calls yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="p-4 border-t text-center">
                <Button variant="outline" asChild>
                  <Link href={`/calls?businessId=${businessId}`}>View full call log</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardContent className="p-6">
              {aLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : analytics && analytics.totalCalls > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={OUTCOME_COLORS[entry.key as keyof typeof OUTCOME_COLORS]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    {pieData.map((d) => (
                      <div key={d.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: OUTCOME_COLORS[d.key as keyof typeof OUTCOME_COLORS] }}
                          />
                          <span className="font-medium">{d.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{d.value}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            ({analytics.totalCalls > 0 ? ((d.value / analytics.totalCalls) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Avg Duration</div>
                        <div className="text-xl font-bold mt-1">
                          {analytics.avgCallDuration ? formatDuration(Math.round(analytics.avgCallDuration)) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">After Hours</div>
                        <div className="text-xl font-bold mt-1">{analytics.afterHoursCalls}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Calls</div>
                        <div className="text-xl font-bold mt-1">{analytics.totalCalls}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Recoveries</div>
                        <div className="text-xl font-bold mt-1">{analytics.missedCallRecoveries}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No call data to analyze yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>System prompt and voice personality for this business</CardDescription>
              </div>
              {!editingConfig && (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  Edit Config
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {editingConfig ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voice Personality</Label>
                    <Input
                      id="voice"
                      value={configForm.voicePersonality}
                      onChange={(e) => setConfigForm((f) => ({ ...f, voicePersonality: e.target.value }))}
                      placeholder="e.g. Warm and professional female voice"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prompt">System Prompt</Label>
                    <Textarea
                      id="prompt"
                      value={configForm.openaiPrompt}
                      onChange={(e) => setConfigForm((f) => ({ ...f, openaiPrompt: e.target.value }))}
                      rows={12}
                      className="font-mono text-sm"
                      placeholder="You are an AI receptionist for..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleSaveConfig} disabled={updateBusiness.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingConfig(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Voice Personality
                    </div>
                    <p className="font-medium">{business.voicePersonality || "Default"}</p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      System Prompt
                    </div>
                    <div className="bg-muted rounded-md p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                      {business.openaiPrompt || "No prompt configured. Click Edit Config to add one."}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <BillingPanel businessId={businessId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
