import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MicOff, Menu, User, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const NavLinks = () => (
    <>
      <button 
        onClick={() => scrollToSection('pricing')}
        className="hover:text-neon-cyan transition-colors duration-300"
      >
        Preise
      </button>
      <button 
        onClick={() => scrollToSection('dsgvo')}
        className="hover:text-neon-cyan transition-colors duration-300"
      >
        DSGVO
      </button>
    </>
  );

  return (
    <nav className="relative z-50 bg-cyber-dark/95 backdrop-blur-sm border-b border-neon-cyan sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer">
              <div className="text-2xl font-bold text-neon-cyan neon-text">
                <MicOff className="inline mr-2" />
                Akustik Produkt
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button className="cyber-button-outline hover-glow">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button className="cyber-button-pink hover-glow">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
                <Button 
                  onClick={() => window.location.href = "/api/logout"}
                  className="cyber-button-outline hover-glow"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="cyber-button-outline hover-glow"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="cyber-button hover-glow"
                >
                  Registrieren
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neon-cyan">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-cyber-dark border-neon-cyan">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                  
                  {isAuthenticated ? (
                    <>
                      <Link href="/">
                        <Button className="cyber-button-outline w-full hover-glow" onClick={() => setIsOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/admin">
                        <Button className="cyber-button-pink w-full hover-glow" onClick={() => setIsOpen(false)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Admin
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => window.location.href = "/api/logout"}
                        className="cyber-button-outline w-full hover-glow"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => window.location.href = "/api/login"}
                        className="cyber-button-outline w-full hover-glow"
                      >
                        Login
                      </Button>
                      <Button 
                        onClick={() => window.location.href = "/api/login"}
                        className="cyber-button w-full hover-glow"
                      >
                        Registrieren
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
