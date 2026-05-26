import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Calendar, Clock, Sparkles, Volume2, ArrowRight, ShieldCheck, CheckCircle2, Star, MessageSquare, X, TrendingUp, Zap, Users } from "lucide-react";
import autumnPortrait from "@/assets/images/autumn-portrait.png";
import luxurySalon from "@/assets/images/luxury-salon.png";
import clientPhone from "@/assets/images/client-phone.png";
import { Button } from "@/components/ui/button";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FEED_ITEMS = [
  { id: 1, type: "booked", text: "Booked — Sarah M. → Fri 2:00 PM (balayage)", time: "just now", color: "bg-[#2ECC71]" },
  { id: 2, type: "answered", text: "Answered — pricing question re: highlights", time: "2m ago", color: "bg-[#3498DB]" },
  { id: 3, type: "rescheduled", text: "Rescheduled — Emma L. → Thu 10:00 AM", time: "5m ago", color: "bg-[#F1C40F]" },
  { id: 4, type: "booked", text: "Booked — James T. → Sat 11:00 AM (haircut)", time: "12m ago", color: "bg-[#2ECC71]" },
  { id: 5, type: "answered", text: "Answered — hours of operation inquiry", time: "18m ago", color: "bg-[#3498DB]" },
];

function ActivityFeed() {
  const [items, setItems] = useState(FEED_ITEMS.slice(0, 4));

  useEffect(() => {
    let index = 4;
    const interval = setInterval(() => {
      setItems((prev) => {
        const nextItem = FEED_ITEMS[index % FEED_ITEMS.length];
        const newItems = [nextItem, ...prev].slice(0, 4);
        return newItems.map((item, i) => ({ ...item, id: Date.now() + i }));
      });
      index++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3 mt-6">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-sm py-2"
        >
          <div className={`w-2 h-2 rounded-full ${item.color}`} />
          <div className="flex-1 font-medium text-foreground">{item.text}</div>
          <div className="text-muted-foreground text-xs">{item.time}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* 1. Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 md:px-12 flex justify-between items-center backdrop-blur-md bg-background/80 border-b border-border shadow-sm">
        <div className="font-sans text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          Autumn
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <span className="hover:text-primary cursor-pointer transition-colors">Features</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Pricing</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Demo</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:flex font-medium rounded-full text-foreground hover:bg-muted" data-testid="nav-demo-btn">
            Watch Demo
          </Button>
          <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-medium shadow-sm transition-all" data-testid="nav-cta">
            Get Started
          </Button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 bg-[#FAFAFA] min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col items-start text-left">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full mb-6 bg-white shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                <span className="text-xs font-semibold text-foreground">Live — Autumn is answering calls now</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-6xl md:text-[80px] font-extrabold leading-[1.05] tracking-tight mb-6 text-foreground">
                Your salon's AI receptionist.<br />Always on.
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground font-medium mb-10 max-w-lg leading-relaxed">
                Never miss another booking call. Autumn answers instantly, books appointments directly in your system, and sounds exactly like a real human.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-bold shadow-md hover:shadow-lg transition-all" data-testid="hero-cta">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="ghost" className="rounded-full px-8 py-6 text-base font-medium text-foreground hover:bg-muted transition-all group" data-testid="hero-demo">
                  Watch Demo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </FadeIn>
          </div>
          
          <FadeIn delay={0.4} className="relative w-full max-w-lg mx-auto lg:ml-auto">
            <div className="bg-white rounded-[32px] shadow-2xl p-8 border border-border relative z-10 overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -z-10" />
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    A
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight">Autumn</h3>
                    <p className="text-sm text-muted-foreground font-medium">AI Receptionist</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-[#2ECC71]/10 text-[#2ECC71] px-3 py-1 rounded-full text-xs font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" /> Active
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-muted/50 rounded-2xl">
                  <div className="text-xl font-bold text-foreground">47</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Calls Today</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-2xl">
                  <div className="text-xl font-bold text-foreground">{'<'}2s</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Response</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-2xl">
                  <div className="text-xl font-bold text-foreground">100%</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Answer Rate</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Live Activity Feed</h4>
                <ActivityFeed />
              </div>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full blur-[40px] -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100 rounded-full blur-[40px] -z-10" />
          </FadeIn>
        </div>
      </section>

      {/* 3. Live Stats Bar */}
      <section className="bg-white border-y border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="px-6 py-4 md:py-0 text-center md:text-left flex-1">
            <div className="text-sm font-semibold text-muted-foreground mb-1 flex items-center justify-center md:justify-start gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
              Calls Answered
            </div>
            <div className="text-3xl font-extrabold text-foreground">2,847 <span className="text-lg font-medium text-muted-foreground">this week</span></div>
          </div>
          <div className="px-6 py-4 md:py-0 text-center md:text-left flex-1">
            <div className="text-sm font-semibold text-muted-foreground mb-1 flex items-center justify-center md:justify-start gap-2">
              <Calendar className="w-4 h-4" /> Appointments Booked
            </div>
            <div className="text-3xl font-extrabold text-foreground">1,203</div>
          </div>
          <div className="px-6 py-4 md:py-0 text-center md:text-left flex-1">
            <div className="text-sm font-semibold text-muted-foreground mb-1 flex items-center justify-center md:justify-start gap-2">
              <Clock className="w-4 h-4" /> Avg Response Time
            </div>
            <div className="text-3xl font-extrabold text-foreground">{'<'} 2 sec</div>
          </div>
          <div className="px-6 py-4 md:py-0 text-center md:text-left flex-1">
            <div className="text-sm font-semibold text-muted-foreground mb-1 flex items-center justify-center md:justify-start gap-2">
              <Star className="w-4 h-4 text-yellow-400" /> Client Satisfaction
            </div>
            <div className="text-3xl font-extrabold text-foreground">98.4%</div>
          </div>
        </div>
      </section>

      {/* 4. "Meet Autumn" — Agent Card Feature Section */}
      <section className="py-24 px-6 md:px-12 bg-card">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <FadeIn>
            <div className="relative rounded-[2rem] overflow-hidden shadow-xl border border-border aspect-[4/5] bg-white group">
              <img src={autumnPortrait} alt="Autumn AI" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-md border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-foreground">Autumn</h3>
                    <p className="text-sm font-medium text-muted-foreground">AI Receptionist</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-foreground">
                    <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" /> Online now
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          <div className="flex flex-col">
            <FadeIn delay={0.1}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-foreground">Meet your new<br/>front desk star.</h2>
              <p className="text-xl text-muted-foreground font-medium mb-12">
                Warm, composed, and always available. Autumn handles your callers with the same care and professionalism as your best staff.
              </p>
            </FadeIn>
            
            <div className="space-y-8">
              <FadeIn delay={0.2} className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Answers every call</h3>
                  <p className="text-muted-foreground font-medium">Never busy, never on another line. Always picks up by the second ring.</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.3} className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Books & reschedules</h3>
                  <p className="text-muted-foreground font-medium">Handles the full appointment lifecycle seamlessly within your existing software.</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.4} className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Answers questions</h3>
                  <p className="text-muted-foreground font-medium">Pricing, availability, services, parking — she knows it all and explains it clearly.</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">Up and running in minutes.</h2>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                No complex setup, no new software to learn. It just works.
              </p>
            </div>
          </FadeIn>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 border-t-2 border-dashed border-border" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Connect", desc: "Link your salon's phone number and existing booking system." },
                { step: "02", title: "Customize", desc: "Set Autumn's voice, teach her your services, and add your policies." },
                { step: "03", title: "Go Live", desc: "Autumn starts answering calls immediately, 24/7." }
              ].map((step, i) => (
                <FadeIn key={i} delay={0.1 * i} className="relative">
                  <div className="bg-white border border-border shadow-sm rounded-2xl p-8 pt-12 relative z-10 h-full hover:shadow-md transition-shadow">
                    <div className="absolute -top-5 left-8 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-full shadow-md">
                      Step {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                    <p className="text-muted-foreground font-medium">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. "The Math" — ROI Comparison Table */}
      <section className="py-24 px-6 md:px-12 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">The math is obvious.</h2>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                One human receptionist costs more per month than Autumn does per year.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="bg-white rounded-[2rem] shadow-xl border border-border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/30 border-b border-border">
                <div className="p-6"></div>
                <div className="p-6 text-center font-bold text-muted-foreground">Human Receptionist</div>
                <div className="p-6 text-center font-extrabold text-primary bg-primary/5">Autumn AI</div>
              </div>
              
              {[
                { label: "Monthly Cost", human: "$3,500–$4,200", ai: "Starting at $49/mo", aiClass: "text-primary font-bold" },
                { label: "Hours Available", human: "Mon–Fri, 9–5", ai: "24 hours, 7 days", aiClass: "text-foreground font-bold" },
                { label: "Calls Missed", human: "Yes", ai: "Never", aiClass: "text-[#2ECC71] font-bold" },
                { label: "Response Time", human: "30s–2 min", ai: "< 2 seconds", aiClass: "text-foreground font-bold" },
                { label: "Sick Days", human: "Yes", ai: "No", aiClass: "text-foreground font-bold" },
                { label: "Training Required", human: "Weeks", ai: "Minutes", aiClass: "text-foreground font-bold" },
                { label: "Consistency", human: "Variable", ai: "Always perfect", aiClass: "text-primary font-bold" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                  <div className="p-5 font-bold text-foreground">{row.label}</div>
                  <div className="p-5 text-center text-muted-foreground font-medium flex items-center justify-center gap-2">
                    {row.human === "Yes" ? <X className="w-4 h-4 text-red-400" /> : null}
                    {row.human}
                  </div>
                  <div className={`p-5 text-center bg-primary/5 flex items-center justify-center gap-2 ${row.aiClass}`}>
                    {row.ai === "Never" || row.ai === "No" || row.ai === "Always perfect" ? <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" /> : null}
                    {row.ai}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 7. Features Grid */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: "Intelligent Scheduling", desc: "Autumn finds the perfect slots across multiple stylists, handling complex timing rules seamlessly." },
              { icon: Phone, title: "Always Answers", desc: "Never miss a booking because the salon was too busy or closed. Autumn is available 24/7." },
              { icon: ShieldCheck, title: "Policy Enforcement", desc: "She politely but firmly communicates cancellation policies and secures deposits without the awkwardness." },
              { icon: Clock, title: "Reschedules & Cancellations", desc: "When life happens, Autumn frees up your calendar instantly and fills the gap from the waitlist." },
              { icon: Volume2, title: "Natural Conversationalist", desc: "She pauses, listens, and responds with the natural cadence and warmth of a real human being." },
              { icon: Sparkles, title: "Service Inquiries", desc: "She knows your pricing, your products, and your processes inside and out." }
            ].map((feature, i) => (
              <FadeIn key={i} delay={0.05 * i}>
                <div className="bg-white border border-border shadow-sm rounded-[2rem] p-8 h-full hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Integrations */}
      <section className="py-24 px-6 md:px-12 bg-[#FAFAFA] border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-10 tracking-tight text-foreground">Works with your booking system.</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3">
              {["Phorest", "Zenoti", "Vagaro", "Mindbody", "Boulevard", "Square"].map((software, i) => (
                <div key={i} className="px-6 py-3 bg-white border border-border rounded-full shadow-sm text-foreground font-bold text-sm">
                  {software}
                </div>
              ))}
              <div className="px-6 py-3 bg-muted border border-border rounded-full shadow-sm text-muted-foreground font-bold text-sm">
                + 20 more
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 9. Pricing Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">Simple, transparent pricing.</h2>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                No long-term contracts. Cancel anytime.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {/* Starter */}
            <FadeIn delay={0.1}>
              <div className="bg-white border border-border shadow-sm rounded-[2rem] p-8 h-full" data-testid="pricing-starter">
                <h3 className="text-xl font-bold text-foreground mb-2">Starter</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-5xl font-extrabold text-foreground">$49</span>
                  <span className="text-muted-foreground font-medium mb-1">/mo</span>
                </div>
                <p className="text-sm font-bold text-primary mb-6 bg-primary/10 inline-block px-3 py-1 rounded-full">300 minutes included</p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Autumn answers every call",
                    "Appointment scheduling",
                    "Appointment cancellations",
                    "Pricing & service inquiries",
                    "Text confirmations to clients",
                    "1 salon phone number"
                  ].map((item, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                       <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                       {item}
                     </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-full font-bold py-6 text-base" data-testid="btn-starter">
                  Get Started
                </Button>
              </div>
            </FadeIn>

            {/* Classic */}
            <FadeIn delay={0.2} className="relative z-10">
              <div className="bg-primary/5 border-2 border-primary shadow-xl rounded-[2rem] p-8 h-full relative transform md:-translate-y-4" data-testid="pricing-classic">
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Classic</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-5xl font-extrabold text-foreground">$89</span>
                  <span className="text-muted-foreground font-medium mb-1">/mo</span>
                </div>
                <p className="text-sm font-bold text-primary mb-6 bg-primary/10 inline-block px-3 py-1 rounded-full">600 minutes included</p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Everything in Starter",
                    "Multi-stylist scheduling",
                    "Waitlist management",
                    "Cancellation policy enforcement",
                    "Deposit collection prompts",
                    "2 salon phone numbers",
                    "Priority support"
                  ].map((item, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm font-medium text-foreground">
                       <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                       {item}
                     </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full font-bold py-6 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" data-testid="btn-classic">
                  Get Started
                </Button>
              </div>
            </FadeIn>

            {/* Deluxe */}
            <FadeIn delay={0.3}>
              <div className="bg-white border border-border shadow-sm rounded-[2rem] p-8 h-full" data-testid="pricing-deluxe">
                <h3 className="text-xl font-bold text-foreground mb-2">Deluxe</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-5xl font-extrabold text-foreground">$179</span>
                  <span className="text-muted-foreground font-medium mb-1">/mo</span>
                </div>
                <p className="text-sm font-bold text-primary mb-6 bg-primary/10 inline-block px-3 py-1 rounded-full">1,200 minutes included</p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Everything in Classic",
                    "Unlimited phone numbers",
                    "VIP client recognition",
                    "Custom Autumn voice persona",
                    "Analytics dashboard",
                    "Dedicated account manager",
                    "White-glove onboarding"
                  ].map((item, i) => (
                     <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                       <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                       {item}
                     </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-full font-bold py-6 text-base" data-testid="btn-deluxe">
                  Get Started
                </Button>
              </div>
            </FadeIn>
          </div>

          <div className="mt-12 text-center text-sm font-medium text-muted-foreground max-w-2xl mx-auto">
            Pricing is based on OpenAI Realtime voice AI at approximately $0.08/min and Twilio telephony at $0.0085/min, with a 60% margin applied to cover infrastructure, support, and ongoing model improvements.
          </div>
        </div>
      </section>

      {/* 10. Testimonial / Social Proof */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="bg-[#FAFAFA] rounded-[2rem] p-10 md:p-16 border border-border text-center">
              <div className="flex justify-center mb-8">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
                </div>
              </div>
              <blockquote className="text-2xl md:text-3xl font-bold text-foreground leading-snug mb-8">
                "Autumn paid for herself in the first week. We stopped missing calls, our booking rate went up 34%, and my staff finally stopped running to the phone mid-haircut."
              </blockquote>
              <div className="font-bold text-foreground">Jessica R.</div>
              <div className="text-muted-foreground font-medium text-sm">Owner, Luxe Hair Studio</div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
                <div>
                  <div className="text-3xl font-extrabold text-primary mb-1">34%</div>
                  <div className="font-bold text-sm text-muted-foreground">More bookings</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-primary mb-1">Zero</div>
                  <div className="font-bold text-sm text-muted-foreground">Missed calls</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-primary mb-1">10m</div>
                  <div className="font-bold text-sm text-muted-foreground">Setup time</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 11. CTA Section */}
      <section className="py-32 px-6 md:px-12 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">Your phone is ringing.<br/>Is Autumn there?</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xl text-muted-foreground font-medium mb-10">Start your free trial today. No credit card required.</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-lg font-bold shadow-md hover:shadow-lg transition-all" data-testid="footer-cta-primary">
                Start Free Trial
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full px-10 py-7 text-lg font-bold text-foreground hover:bg-muted transition-all" data-testid="footer-cta-secondary">
                Schedule a Demo
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className="py-12 px-6 md:px-12 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-sans text-xl font-bold tracking-tight text-primary">Autumn</div>
          <div className="flex gap-8 text-sm font-bold text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Contact</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            © {new Date().getFullYear()} Autumn AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
