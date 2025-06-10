import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AnimatedBackground from "@/components/ui/animated-background";
import PricingCard from "@/components/ui/pricing-card";
import WebRadio from "@/components/ui/web-radio";
import GallerySection from "@/components/ui/gallery-section";
import NewsSection from "@/components/ui/news-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MicOff, 
  Rocket, 
  Settings, 
  Clock, 
  User, 
  Star, 
  Crown, 
  Gem,
  Database,
  ShieldX,
  Shield,
  Mail
} from "lucide-react";

export default function Landing() {
  const [showDsgvo, setShowDsgvo] = useState(false);

  const { data: membershipTiers = [] } = useQuery({
    queryKey: ["/api/membership/tiers"],
  });

  const { data: membershipBenefits = [] } = useQuery({
    queryKey: ["/api/membership/benefits"],
  });

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case "TAGESMITGLIED": return <Clock className="text-2xl" />;
      case "PASSIV": return <User className="text-2xl" />;
      case "AKTIV": return <Star className="text-2xl" />;
      case "VIP": return <Crown className="text-2xl text-yellow-400" />;
      case "SPONSOR": return <Gem className="text-2xl" />;
      default: return <User className="text-2xl" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case "TAGESMITGLIED": return "from-gray-600 to-gray-800";
      case "PASSIV": return "from-blue-500 to-blue-700";
      case "AKTIV": return "from-cyan-500 to-pink-500";
      case "VIP": return "from-purple-500 to-pink-500";
      case "SPONSOR": return "from-yellow-400 to-orange-500";
      default: return "from-gray-500 to-gray-700";
    }
  };

  const getBenefitsForTier = (tierName: string) => {
    return membershipBenefits.filter(benefit => benefit.tierName === tierName);
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light relative">
      <AnimatedBackground />
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8 animate-float">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink neon-text mb-6">
              WILLKOMMEN IM
              <br />AKUSTIK UNIVERSUM
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Verwalte deine Mitgliedschaft im futuristischen Cyberpunk-Style. 
              Wähle dein Level und tauche ein in die Welt der elektronischen Musik.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={scrollToPricing}
              className="cyber-button px-8 py-4 text-lg hover-glow"
            >
              <Rocket className="mr-2" />
              MITGLIED WERDEN
            </Button>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="cyber-button-pink px-8 py-4 text-lg hover-glow"
            >
              <Settings className="mr-2" />
              ADMIN BEREICH
            </Button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-6 h-6 bg-neon-pink rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-20 w-2 h-2 bg-neon-cyan rounded-full animate-ping"></div>
      </section>

      {/* Web Radio Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <WebRadio />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neon-cyan neon-text mb-4">
              MITGLIEDSCHAFTS LEVEL
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Wähle dein perfektes Level und genieße exklusive Vorteile im Akustik Produkt Universum
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {membershipTiers.map((tier) => (
              <PricingCard
                key={tier.name}
                tier={tier}
                icon={getTierIcon(tier.name)}
                colorClass={getTierColor(tier.name)}
                benefits={getBenefitsForTier(tier.name)}
                isPopular={tier.name === "AKTIV"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* DSGVO Section */}
      <section id="dsgvo" className="py-20 px-4 sm:px-6 lg:px-8 bg-cyber-darker/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neon-pink neon-text mb-4">
              DATENSCHUTZ & DSGVO
            </h2>
            <p className="text-xl text-gray-300">
              Transparenz und Sicherheit deiner Daten
            </p>
          </div>
          
          <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0">
            <CardContent className="p-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-cyber-dark/50">
                  <TabsTrigger value="overview" className="text-neon-cyan">Übersicht</TabsTrigger>
                  <TabsTrigger value="data" className="text-neon-cyan">Daten</TabsTrigger>
                  <TabsTrigger value="rights" className="text-neon-cyan">Rechte</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-neon-cyan mb-4 flex items-center">
                      <Shield className="mr-3" />
                      DATENSCHUTZERKLÄRUNG
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Der Verein Akustik Produkt, Florastrasse 10, 8610 Uster, info@akustik-produkt.ch, 
                      verarbeitet Ihre Daten gemäß dem Schweizer Datenschutzgesetz. Wir erfassen Vorname, 
                      Nachname, E-Mail, Adresse, PLZ, Ort, Avatar, SoundCloud-Links und Werbedaten zur 
                      Verwaltung Ihrer Mitgliedschaft und Werbung. Daten werden nicht an Dritte weitergegeben, 
                      außer gesetzlich erforderlich. Sie haben das Recht auf Auskunft, Berichtigung, Löschung 
                      und Einschränkung der Verarbeitung. Cookies werden für die Funktionalität der Website verwendet.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="mt-8">
                  <div className="p-6 bg-cyber-dark/50 rounded-lg border border-cyber-gray">
                    <h4 className="text-xl font-bold text-neon-cyan mb-3 flex items-center">
                      <Database className="mr-2" />
                      ERFASSTE DATEN
                    </h4>
                    <ul className="text-gray-300 space-y-2">
                      <li className="flex items-center"><span className="text-neon-cyan mr-2">✓</span>Vorname & Nachname</li>
                      <li className="flex items-center"><span className="text-neon-cyan mr-2">✓</span>E-Mail Adresse</li>
                      <li className="flex items-center"><span className="text-neon-cyan mr-2">✓</span>Postadresse</li>
                      <li className="flex items-center"><span className="text-neon-cyan mr-2">✓</span>Profilbild (Avatar)</li>
                      <li className="flex items-center"><span className="text-neon-cyan mr-2">✓</span>SoundCloud Links</li>
                      <li className="flex items-center"><span className="text-neon-cyan mr-2">✓</span>Werbedaten</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="rights" className="mt-8">
                  <div className="p-6 bg-cyber-dark/50 rounded-lg border border-cyber-gray">
                    <h4 className="text-xl font-bold text-neon-pink mb-3 flex items-center">
                      <ShieldX className="mr-2" />
                      IHRE RECHTE
                    </h4>
                    <ul className="text-gray-300 space-y-2">
                      <li className="flex items-center"><span className="text-neon-pink mr-2">✓</span>Recht auf Auskunft</li>
                      <li className="flex items-center"><span className="text-neon-pink mr-2">✓</span>Recht auf Berichtigung</li>
                      <li className="flex items-center"><span className="text-neon-pink mr-2">✓</span>Recht auf Löschung</li>
                      <li className="flex items-center"><span className="text-neon-pink mr-2">✓</span>Einschränkung der Verarbeitung</li>
                      <li className="flex items-center"><span className="text-neon-pink mr-2">✓</span>Datenportabilität</li>
                      <li className="flex items-center"><span className="text-neon-pink mr-2">✓</span>Widerspruchsrecht</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="text-center mt-8">
                <p className="text-gray-400 mb-6">
                  Bei Fragen zum Datenschutz kontaktieren Sie uns unter:
                </p>
                <Button className="cyber-button hover-glow">
                  <Mail className="mr-2" />
                  info@akustik-produkt.ch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection />

      {/* News Section */}
      <NewsSection />

      <Footer />
    </div>
  );
}
