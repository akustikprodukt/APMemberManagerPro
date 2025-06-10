import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  const recordConsentMutation = useMutation({
    mutationFn: async (accepted: boolean) => {
      await apiRequest("POST", "/api/cookie-consent", {
        accepted,
        userId: user?.id || null,
      });
    },
    onSuccess: () => {
      localStorage.setItem('cookiesAccepted', 'true');
      hideConsent();
    },
  });

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowConsent(true);
      // Show with animation after a delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const hideConsent = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowConsent(false);
    }, 300);
  };

  const handleAccept = () => {
    recordConsentMutation.mutate(true);
  };

  const handleDecline = () => {
    recordConsentMutation.mutate(false);
    localStorage.setItem('cookiesAccepted', 'false');
    hideConsent();
  };

  if (!showConsent) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-500 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Card className="max-w-4xl mx-auto glow-border bg-cyber-dark/95 backdrop-blur-sm border-neon-cyan">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-neon-cyan rounded-full flex items-center justify-center">
                <Cookie className="text-cyber-dark text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">COOKIE EINSTELLUNGEN</h4>
                <p className="text-sm text-gray-300">
                  Wir verwenden Cookies zur Verbesserung der Benutzererfahrung und zur Einhaltung der DSGVO-Bestimmungen.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleAccept}
                className="cyber-button hover-glow"
                disabled={recordConsentMutation.isPending}
              >
                {recordConsentMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                ) : null}
                AKZEPTIEREN
              </Button>
              <Button 
                onClick={handleDecline}
                className="cyber-button-outline hover-glow"
                disabled={recordConsentMutation.isPending}
              >
                ABLEHNEN
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
