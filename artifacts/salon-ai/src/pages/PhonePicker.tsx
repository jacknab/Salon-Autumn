import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Search, CheckCircle2, Loader2, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  postalCode: string;
}

interface ProvisionedNumber {
  id: number;
  phoneNumber: string;
  friendlyName: string;
  twilioSid: string;
  webhookUrl: string;
  provisionedAt: string;
}

function formatDisplay(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") {
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return raw;
}

export default function PhonePicker() {
  const [areaCode, setAreaCode] = useState("");
  const [salonId, setSalonId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [numbers, setNumbers] = useState<AvailableNumber[]>([]);
  const [selected, setSelected] = useState<AvailableNumber | null>(null);
  const [searching, setSearching] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisioned, setProvisioned] = useState<ProvisionedNumber | null>(null);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");

  const search = async () => {
    setSearchError("");
    setNumbers([]);
    setSelected(null);
    if (areaCode && !/^\d{3}$/.test(areaCode)) {
      setSearchError("Area code must be 3 digits.");
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (areaCode) params.set("areaCode", areaCode);
      const res = await fetch(`/api/phones/available?${params}`);
      const data = await res.json();
      if (!res.ok) { setSearchError(data.error ?? "Search failed."); return; }
      setNumbers(data);
      if (data.length === 0) setSearchError("No numbers found for that area code. Try a different one.");
    } catch {
      setSearchError("Unable to reach the server. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const provision = async () => {
    if (!selected || !salonId.trim() || !storeId.trim()) return;
    setError("");
    setProvisioning(true);
    try {
      const res = await fetch("/api/phones/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: selected.phoneNumber,
          salonId: salonId.trim(),
          storeId: storeId.trim(),
          friendlyName: `Autumn — ${salonId.trim()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Provisioning failed."); return; }
      setProvisioned(data);
    } catch {
      setError("Unable to reach the server. Try again.");
    } finally {
      setProvisioning(false);
    }
  };

  if (provisioned) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl border border-border max-w-lg w-full p-10 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#2ECC71]/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#2ECC71]" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Autumn is ready.</h1>
          <p className="text-muted-foreground font-medium mb-8">
            Your dedicated number has been purchased and configured. Forward your salon's existing phone number to the number below and Autumn will start answering calls immediately.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Forward your calls to</p>
            <p className="text-4xl font-extrabold text-primary tracking-tight">{formatDisplay(provisioned.phoneNumber)}</p>
          </div>
          <div className="text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Salon ID</span>
              <span className="font-bold text-foreground">{salonId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Twilio SID</span>
              <span className="font-mono text-xs text-foreground">{provisioned.twilioSid}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Webhook</span>
              <span className="font-mono text-xs text-foreground truncate max-w-[220px]">{provisioned.webhookUrl}</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 font-medium text-left">
            <strong>Next step:</strong> Log into your carrier's portal and set up call forwarding to <strong>{formatDisplay(provisioned.phoneNumber)}</strong>. Most carriers support *72 or conditional forwarding.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 shadow-sm px-6 md:px-10 h-14 flex items-center">
        <span className="text-[#5B3FF8] font-bold text-xl tracking-tight" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          Certxa.
        </span>
        <span className="ml-3 text-sm font-semibold text-muted-foreground">/ Assign Autumn Number</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Phone Number Setup
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">Choose Autumn's number.</h1>
          <p className="text-muted-foreground font-medium text-lg mb-10">
            Pick an available US phone number. We'll buy it, configure Autumn's voice AI webhook, and give you the forwarding instructions — all automatically.
          </p>
        </motion.div>

        {/* Step 1 — Salon ID */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-[1.5rem] border border-border shadow-sm p-6 mb-4">
          <h2 className="text-base font-extrabold text-foreground mb-1">Step 1 — Salon Details</h2>
          <p className="text-sm text-muted-foreground font-medium mb-4">Your Certxa salon ID and booking store ID. The store ID is appended to the voice webhook so Autumn loads the right salon's data.</p>
          <div className="space-y-3">
            <input
              type="text"
              value={salonId}
              onChange={(e) => setSalonId(e.target.value)}
              placeholder="Salon ID (e.g. luxe-salon-nyc)"
              className="w-full border border-border rounded-xl px-4 py-3 text-base font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value.replace(/\D/g, ""))}
                placeholder="Booking store ID (e.g. 7)"
                className="w-full border border-border rounded-xl px-4 py-3 text-base font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            {salonId && storeId && (
              <p className="text-xs text-muted-foreground font-medium bg-muted/40 rounded-lg px-3 py-2">
                Webhook will be set to: <span className="font-mono text-foreground">…/api/voice/<strong>{storeId}</strong></span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Step 2 — Search */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[1.5rem] border border-border shadow-sm p-6 mb-4">
          <h2 className="text-base font-extrabold text-foreground mb-1">Step 2 — Search Available Numbers</h2>
          <p className="text-sm text-muted-foreground font-medium mb-4">Optionally filter by area code, or leave blank to see any available numbers.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="Area code (e.g. 212)"
              className="flex-1 border border-border rounded-xl px-4 py-3 text-base font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            <Button
              onClick={search}
              disabled={searching || !salonId.trim()}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-bold disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" />Search</>}
            </Button>
          </div>
          {!salonId.trim() && <p className="text-xs text-amber-600 font-medium mt-2">Enter your Salon ID first.</p>}
          {searchError && <p className="text-red-500 text-sm font-medium mt-3">{searchError}</p>}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {numbers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[1.5rem] border border-border shadow-sm p-6 mb-4"
            >
              <h2 className="text-base font-extrabold text-foreground mb-4">Step 3 — Pick a Number</h2>
              <div className="space-y-2">
                {numbers.map((n) => (
                  <button
                    key={n.phoneNumber}
                    onClick={() => setSelected(n)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left ${
                      selected?.phoneNumber === n.phoneNumber
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected?.phoneNumber === n.phoneNumber ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`}>
                        {selected?.phoneNumber === n.phoneNumber && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-foreground text-lg leading-none">{formatDisplay(n.phoneNumber)}</p>
                        {(n.locality || n.region) && (
                          <p className="text-xs text-muted-foreground font-medium mt-1">
                            {[n.locality, n.region].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Phone className={`w-5 h-5 shrink-0 ${selected?.phoneNumber === n.phoneNumber ? "text-primary" : "text-muted-foreground/40"}`} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4 — Provision */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[1.5rem] border-2 border-primary shadow-lg p-6"
            >
              <h2 className="text-base font-extrabold text-foreground mb-1">Step 4 — Confirm & Activate</h2>
              <p className="text-sm text-muted-foreground font-medium mb-5">
                Clicking below will purchase <strong className="text-foreground">{formatDisplay(selected.phoneNumber)}</strong> from your Twilio account, set the voice webhook to Autumn, and save it to your Certxa account.
              </p>
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
              <Button
                onClick={provision}
                disabled={provisioning}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base font-bold shadow-md disabled:opacity-50 transition-all"
              >
                {provisioning
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Provisioning…</>
                  : <>Activate {formatDisplay(selected.phoneNumber)} <ArrowRight className="ml-2 w-4 h-4" /></>
                }
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
