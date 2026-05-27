import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Webhook, Server, Key, ArrowRight } from "lucide-react";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative">
      {label && <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{label}</div>}
      <div className="flex items-start gap-2 bg-muted rounded-md p-3 pr-10">
        <code className="text-sm font-mono break-all flex-1">{code}</code>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 absolute top-2 right-2 flex-shrink-0"
          onClick={copy}
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {num}
      </div>
      <div className="flex-1 pb-8">
        <h3 className="font-semibold text-base mb-3">{title}</h3>
        <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integration Guide</h1>
        <p className="text-muted-foreground mt-1">
          Configure Twilio and your OpenAI WebSocket server to connect with this platform.
        </p>
      </div>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Architecture Overview
          </CardTitle>
          <CardDescription>How the components connect end-to-end</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap text-sm">
            {["Twilio Phone Number", "This Platform (Webhook Handler)", "Your WebSocket Server", "OpenAI Realtime API"].map(
              (step, i, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="bg-muted rounded-md px-3 py-2 font-medium text-foreground">{step}</div>
                  {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </div>
              )
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Every call flows through this platform first. It checks the business status and minute limits, logs the
            call, then hands off to your WebSocket server which manages the OpenAI Realtime session. This platform is
            the billing gatekeeper — no minutes are consumed without its approval.
          </p>
        </CardContent>
      </Card>

      {/* Webhook URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Twilio Webhook URLs
          </CardTitle>
          <CardDescription>Configure these in your Twilio phone number settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeBlock
            label="Incoming Call Webhook (A call comes in)"
            code={`${BASE_URL}/api/webhook/twilio/incoming`}
          />
          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            Set this as the <strong>A Call Comes In</strong> webhook on each Twilio number. Method: <Badge variant="outline">HTTP POST</Badge>
          </div>
          <Separator />
          <CodeBlock
            label="Call Status Callback (Call ends)"
            code={`${BASE_URL}/api/webhook/twilio/status?callId={CALL_ID}`}
          />
          <p className="text-sm text-muted-foreground">
            This is set automatically by the platform in the TwiML response — you do not need to configure it manually.
            It fires when the call ends and finalizes usage tracking.
          </p>
          <Separator />
          <CodeBlock
            label="Enforcement Check (Call your WebSocket server before connecting AI)"
            code={`${BASE_URL}/api/businesses/{id}/enforcement`}
          />
          <p className="text-sm text-muted-foreground">
            Your WebSocket server can call this endpoint at session start to verify a business is allowed to receive
            AI calls. Returns <code className="bg-muted px-1 rounded">allowed: true/false</code> with a reason.
          </p>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Required Environment Variables
          </CardTitle>
          <CardDescription>Set these on your API server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <CodeBlock label="Your OpenAI Realtime WebSocket URL" code="TWILIO_STREAM_URL=wss://your-server.com/stream" />
            <p className="text-sm text-muted-foreground">
              This is the WebSocket URL of your existing Twilio + OpenAI Realtime server. The platform sends all
              approved calls here via Twilio Media Streams. Must be a <code className="bg-muted px-1 rounded">wss://</code> URL.
              Business ID and call ID are passed as stream parameters.
            </p>
            <CodeBlock label="Public hostname (used in status callback URLs)" code="PUBLIC_HOST=your-domain.replit.app" />
            <p className="text-sm text-muted-foreground">
              If not set, falls back to the request hostname. Set this explicitly in production.
            </p>
            <CodeBlock label="Database (auto-provisioned)" code="DATABASE_URL=postgresql://..." />
            <p className="text-sm text-muted-foreground">
              Provisioned automatically by Replit. Required for all API operations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Setup</CardTitle>
          <CardDescription>One-time configuration to go live</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <Step num={1} title="Deploy this platform">
              <p>
                Click the Deploy button in Replit to publish this platform to a public URL. Note your{" "}
                <code className="bg-muted px-1 rounded">.replit.app</code> domain — you will use it for the webhook URLs.
              </p>
            </Step>
            <Step num={2} title="Set the TWILIO_STREAM_URL environment variable">
              <p>
                In your Replit deployment settings, add the <code className="bg-muted px-1 rounded">TWILIO_STREAM_URL</code>{" "}
                variable pointing to your existing OpenAI Realtime WebSocket server.
              </p>
              <p>
                Your WebSocket server receives two parameters with each stream:{" "}
                <code className="bg-muted px-1 rounded">businessId</code> and{" "}
                <code className="bg-muted px-1 rounded">callId</code>. Use these to load the business AI config and
                update call records.
              </p>
            </Step>
            <Step num={3} title="Create packages in the Packages tab">
              <p>
                Set up your Starter, Growth, and Pro packages with minute limits and pricing. These are assigned to
                businesses on creation.
              </p>
            </Step>
            <Step num={4} title="Onboard each client business">
              <p>
                Go to Businesses → Add Business. Fill in the business name, their Twilio number, select a package, and
                configure the AI system prompt and voice personality.
              </p>
              <p>
                The system prompt should tell the AI who it is, what services the business offers, and how to handle
                bookings.
              </p>
            </Step>
            <Step num={5} title="Configure Twilio phone numbers">
              <p>
                In the Twilio console, for each client phone number:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  Set <strong>A Call Comes In</strong> → Webhook → HTTP POST →{" "}
                  <code className="bg-muted px-1 rounded">{BASE_URL}/api/webhook/twilio/incoming</code>
                </li>
                <li>Enable <strong>Status Callback Events</strong>: completed, failed</li>
              </ul>
            </Step>
            <Step num={6} title="Test an incoming call">
              <p>
                Call one of the configured Twilio numbers. Watch the call appear in real-time in the Dashboard activity
                feed and Business detail call log. The minute counter will update after the call ends.
              </p>
            </Step>
          </div>
        </CardContent>
      </Card>

      {/* WebSocket Server Integration */}
      <Card>
        <CardHeader>
          <CardTitle>WebSocket Server Integration</CardTitle>
          <CardDescription>How your existing server should interact with this platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>When Twilio connects to your WebSocket server, it passes stream parameters. Read them from the connection URL:</p>
          <CodeBlock
            label="Reading parameters in your WebSocket server (Node.js example)"
            code={`const url = new URL(req.url, 'wss://localhost');\nconst businessId = url.searchParams.get('businessId');\nconst callId = url.searchParams.get('callId');`}
          />
          <p>Use <code className="bg-muted px-1 rounded">businessId</code> to fetch the business config from this platform:</p>
          <CodeBlock
            label="Fetch business AI config"
            code={`GET ${BASE_URL}/api/businesses/{businessId}`}
          />
          <p>
            The response includes <code className="bg-muted px-1 rounded">openaiPrompt</code> and{" "}
            <code className="bg-muted px-1 rounded">voicePersonality</code> — use these to initialize the OpenAI
            Realtime session with the right system prompt and voice.
          </p>
          <p>
            Optionally, update the call outcome when the session ends by calling{" "}
            <code className="bg-muted px-1 rounded">PATCH /api/calls/{"{callId}"}</code> with the outcome
            (booked/transferred/voicemail/ai_handled) and transcript.
          </p>
          <CodeBlock
            label="Finalize call outcome + transcript"
            code={`PATCH ${BASE_URL}/api/calls/{callId}\nContent-Type: application/json\n\n{\n  "outcome": "booked",\n  "transcript": "Caller: Hi...\nAI: Hello! ..."\n}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
