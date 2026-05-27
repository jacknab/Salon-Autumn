import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2, 
  PhoneCall, 
  Package, 
  Settings,
  Menu,
  PhoneForwarded
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Businesses", href: "/businesses", icon: Building2 },
  { name: "Calls", href: "/calls", icon: PhoneCall },
  { name: "Packages", href: "/packages", icon: Package },
  { name: "Integration Guide", href: "/settings", icon: Settings },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
              location === item.href || (item.href !== "/" && location.startsWith(item.href))
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </div>
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card/50">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <PhoneForwarded className="h-6 w-6" />
            <span>AI Receptionist</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile/Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card/50 flex items-center justify-between px-4 lg:hidden">
          <div className="flex items-center gap-2 font-bold text-primary">
            <PhoneForwarded className="h-5 w-5" />
            <span>AI Receptionist</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-16 flex items-center px-6 border-b">
                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                  <PhoneForwarded className="h-6 w-6" />
                  <span>AI Receptionist</span>
                </div>
              </div>
              <nav className="px-4 py-6 space-y-1">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
