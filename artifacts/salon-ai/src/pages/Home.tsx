import { motion, useScroll, useTransform } from "framer-motion";
import { Phone, Calendar, Clock, Sparkles, Volume2, ArrowRight, ShieldCheck, CheckCircle2, Star } from "lucide-react";
import autumnPortrait from "@/assets/images/autumn-portrait.png";
import luxurySalon from "@/assets/images/luxury-salon.png";
import clientPhone from "@/assets/images/client-phone.png";
import { Button } from "@/components/ui/button";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center backdrop-blur-md bg-background/50 border-b border-border/50">
        <div className="font-serif text-2xl font-medium tracking-wide">Autumn</div>
        <Button variant="outline" className="rounded-none border-primary/30 hover:border-primary text-primary-foreground bg-primary hover:bg-primary/90 px-8 py-5 transition-all duration-300" data-testid="nav-cta">
          Request Access
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div style={{ y: yParallax }} className="h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background z-10" />
            <img src={luxurySalon} alt="Luxury Salon" className="w-full h-[120%] object-cover object-center opacity-60" />
          </motion.div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-full mb-8 bg-background/50 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-widest text-primary font-medium">The Salon AI Receptionist</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight mb-6">
              The invisible <br className="hidden md:block" />
              <span className="text-primary italic">luxury upgrade.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Meet Autumn. She answers calls in a real, human-sounding voice, manages your calendar, and handles every client interaction as if she's been at the front desk for years.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Button size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-lg group transition-all duration-300" data-testid="hero-cta">
              Hear Her Voice
              <Volume2 className="ml-3 w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Meet Autumn Section */}
      <section className="py-32 px-6 md:px-12 bg-card relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative aspect-[4/5] overflow-hidden group">
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/0 transition-colors duration-700 z-10 mix-blend-overlay"></div>
              <img src={autumnPortrait} alt="Portrait of Autumn" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            </div>
          </FadeIn>
          <div className="flex flex-col justify-center">
            <FadeIn delay={0.1}>
              <h2 className="text-4xl md:text-6xl font-serif mb-8">Warm, composed, <br/>and <span className="text-primary italic">always available.</span></h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed font-light">
                Autumn doesn't sound like a robot. She doesn't act like a machine. She's been designed from the ground up to embody the warmth, patience, and impeccable service of a high-end salon coordinator.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-light">
                While your stylists are focused on delivering exceptional artistry to the client in the chair, Autumn ensures the client on the phone feels completely taken care of.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="border-l border-primary pl-6 py-2">
                <p className="font-serif text-xl md:text-2xl text-foreground italic mb-2">"Hi, thank you for calling. How can I help you today?"</p>
                <p className="text-sm text-primary uppercase tracking-widest font-semibold">Play Audio Sample</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-serif mb-6">Flawless execution.</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
                She handles the logistics, you handle the artistry. Autumn manages the complete lifecycle of front-desk operations with quiet confidence.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Intelligent Scheduling", desc: "Autumn finds the perfect slots across multiple stylists, handling complex timing rules seamlessly." },
              { icon: Phone, title: "Always Answers", desc: "Never miss a booking because the salon was too busy or closed. Autumn is available 24/7." },
              { icon: ShieldCheck, title: "Policy Enforcement", desc: "She politely but firmly communicates cancellation policies and secures deposits without the awkwardness." },
              { icon: Clock, title: "Rescheduling & Cancellations", desc: "When life happens, Autumn frees up your calendar instantly and fills the gap from the waitlist." },
              { icon: Volume2, title: "Natural Conversationalist", desc: "She pauses, listens, and responds with the natural cadence and warmth of a real human being." },
              { icon: Sparkles, title: "Service Inquiries", desc: "She knows your pricing, your products, and your processes inside and out." }
            ].map((feature, i) => (
              <FadeIn key={i} delay={0.1 * i} className="bg-card p-10 border border-border/50 hover:border-primary/50 transition-colors duration-500 group">
                <feature.icon className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                <h3 className="text-xl font-serif mb-4">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{feature.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* The Experience (How it works) */}
      <section className="py-32 px-6 md:px-12 bg-background border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">An impeccable <span className="text-primary italic">client journey.</span></h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "The Greeting", desc: "Autumn answers by the second ring, every time, with a warm, personalized greeting that sets the standard for luxury." },
              { step: "02", title: "The Consultation", desc: "She asks the right questions. Need a balayage or just a root touch-up? She knows the difference and books accordingly." },
              { step: "03", title: "The Confirmation", desc: "Appointments are secured in your existing booking system instantly, and clients receive an immediate text confirmation." }
            ].map((step, i) => (
              <FadeIn key={i} delay={0.2 * i} className="flex flex-col items-center text-center">
                <div className="text-5xl font-serif text-primary/20 mb-6">{step.step}</div>
                <h3 className="text-2xl font-serif mb-4">{step.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="py-32 px-6 md:px-12 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">Works with what you have.</h2>
            <p className="text-muted-foreground text-lg mb-12 font-light">
              Autumn integrates silently into your existing workflow. No new software to learn.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-left">
              {[
                "Phorest",
                "Zenoti",
                "Vagaro",
                "Mindbody",
                "Boulevard",
                "Square"
              ].map((software, i) => (
                <div key={i} className="flex items-center gap-3 bg-background border border-border/50 px-6 py-4 rounded-none">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-medium">{software}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground font-light">+ 20 more booking platforms supported</p>
          </FadeIn>
        </div>
      </section>

      {/* Lifestyle / Editorial Section */}
      <section className="py-32 px-6 md:px-12 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-row-reverse">
          <div className="order-2 lg:order-1 flex flex-col justify-center">
            <FadeIn>
              <h2 className="text-4xl md:text-6xl font-serif mb-8">Clients will <br/><span className="text-primary italic">love her.</span></h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed font-light">
                A premium brand is built on every touchpoint. Putting clients on hold, missing their calls, or rushing them off the phone damages that carefully curated experience.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed font-light">
                Autumn gives every caller the time, respect, and attention they deserve, ensuring their luxury experience begins the moment they dial your number.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.2} className="order-1 lg:order-2">
            <div className="relative aspect-square overflow-hidden group">
              <img src={clientPhone} alt="Client smiling on phone" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale hover:grayscale-0" />
              <div className="absolute inset-0 border border-primary/20 m-6 z-10 pointer-events-none"></div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 md:px-12 bg-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-full mb-8 bg-background/50 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-widest text-primary font-medium">Introductory Pricing</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif mb-6">Simple, transparent <span className="text-primary italic">pricing.</span></h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
                Powered by OpenAI Realtime voice AI and Twilio. No hidden fees, no long-term contracts. Cancel anytime.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">

            {/* Starter */}
            <FadeIn delay={0.1}>
              <div className="relative border border-border/60 bg-card p-10 flex flex-col h-full group hover:border-primary/40 transition-colors duration-500" data-testid="pricing-starter">
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Starter</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-5xl font-serif font-medium">$49</span>
                    <span className="text-muted-foreground mb-2 font-light">/month</span>
                  </div>
                  <p className="text-sm text-primary font-medium">300 minutes included</p>
                  <p className="text-xs text-muted-foreground mt-1 font-light">~$0.14 per additional minute</p>
                </div>
                <div className="border-t border-border/40 pt-8 mb-10 flex-1">
                  <ul className="space-y-4">
                    {[
                      "Autumn answers every call",
                      "Appointment scheduling",
                      "Appointment cancellations",
                      "Pricing & service inquiries",
                      "Text confirmations to clients",
                      "1 salon phone number",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground font-light">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" className="w-full rounded-none border-primary/40 hover:border-primary hover:bg-primary/5 text-foreground py-6 transition-all duration-300" data-testid="btn-starter">
                  Get Started
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4 font-light">Perfect for boutique & solo studios</p>
              </div>
            </FadeIn>

            {/* Classic — Featured */}
            <FadeIn delay={0.2}>
              <div className="relative border border-primary bg-card p-10 flex flex-col h-full shadow-[0_0_60px_-10px_rgba(201,168,76,0.25)]" data-testid="pricing-classic">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-primary px-5 py-1.5 text-xs uppercase tracking-widest font-semibold text-background">
                    <Star className="w-3 h-3 fill-background" />
                    Most Popular
                  </div>
                </div>
                <div className="mb-8 mt-4">
                  <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Classic</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-5xl font-serif font-medium">$89</span>
                    <span className="text-muted-foreground mb-2 font-light">/month</span>
                  </div>
                  <p className="text-sm text-primary font-medium">600 minutes included</p>
                  <p className="text-xs text-muted-foreground mt-1 font-light">~$0.14 per additional minute</p>
                </div>
                <div className="border-t border-primary/30 pt-8 mb-10 flex-1">
                  <ul className="space-y-4">
                    {[
                      "Everything in Starter",
                      "Multi-stylist scheduling",
                      "Waitlist management",
                      "Cancellation policy enforcement",
                      "Deposit collection prompts",
                      "2 salon phone numbers",
                      "Priority support",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground font-light">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 py-6 transition-all duration-300" data-testid="btn-classic">
                  Get Started
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4 font-light">Ideal for established salons</p>
              </div>
            </FadeIn>

            {/* Deluxe */}
            <FadeIn delay={0.3}>
              <div className="relative border border-border/60 bg-card p-10 flex flex-col h-full group hover:border-primary/40 transition-colors duration-500" data-testid="pricing-deluxe">
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Deluxe</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-5xl font-serif font-medium">$179</span>
                    <span className="text-muted-foreground mb-2 font-light">/month</span>
                  </div>
                  <p className="text-sm text-primary font-medium">1,200 minutes included</p>
                  <p className="text-xs text-muted-foreground mt-1 font-light">~$0.14 per additional minute</p>
                </div>
                <div className="border-t border-border/40 pt-8 mb-10 flex-1">
                  <ul className="space-y-4">
                    {[
                      "Everything in Classic",
                      "Unlimited phone numbers",
                      "VIP client recognition",
                      "Custom Autumn voice persona",
                      "Analytics dashboard",
                      "Dedicated account manager",
                      "White-glove onboarding",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground font-light">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" className="w-full rounded-none border-primary/40 hover:border-primary hover:bg-primary/5 text-foreground py-6 transition-all duration-300" data-testid="btn-deluxe">
                  Get Started
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4 font-light">For high-volume multi-chair salons</p>
              </div>
            </FadeIn>

          </div>

          {/* Cost transparency note */}
          <FadeIn delay={0.4}>
            <div className="mt-12 text-center border border-border/40 bg-card/50 px-8 py-6 max-w-3xl mx-auto">
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Pricing is based on OpenAI Realtime voice AI at approximately $0.08/min and Twilio telephony at $0.0085/min, with a 60% margin applied to cover infrastructure, support, and ongoing model improvements.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 md:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center bg-card">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-card to-card"></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-serif mb-8">Ready to elevate your front desk?</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xl text-muted-foreground mb-12 font-light">
              Join the exclusive waitlist of premium salons upgrading their client experience with Autumn.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-7 text-lg group transition-all" data-testid="footer-cta-primary">
                Request Access
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-none border-border hover:border-primary hover:text-primary px-10 py-7 text-lg transition-all bg-transparent" data-testid="footer-cta-secondary">
                Hear a Live Demo
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 md:px-12 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-2xl font-medium tracking-wide">Autumn</div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
          </div>
          <div className="text-sm text-muted-foreground font-light">
            © {new Date().getFullYear()} Autumn AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
