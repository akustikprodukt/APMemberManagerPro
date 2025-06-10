import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  tier: {
    name: string;
    amount: number;
    currency: string;
    interval: string;
  };
  icon: React.ReactNode;
  colorClass: string;
  benefits: Array<{ benefit: string }>;
  isPopular?: boolean;
}

export default function PricingCard({ tier, icon, colorClass, benefits, isPopular }: PricingCardProps) {
  const handleSelect = () => {
    // Redirect to registration/login
    window.location.href = "/api/login";
  };

  return (
    <Card 
      className={`glow-border bg-cyber-gray/50 backdrop-blur-sm border-0 hover-glow transition-all duration-300 ${
        isPopular ? 'transform scale-105' : ''
      } hover:scale-105 cursor-pointer`}
      onClick={handleSelect}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-neon-cyan to-neon-pink text-cyber-dark px-4 py-1 text-sm font-bold">
            BELIEBT
          </Badge>
        </div>
      )}
      
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
        
        <div className="mb-4">
          {tier.amount > 0 ? (
            <>
              <div className="text-3xl font-black text-neon-cyan">
                {tier.currency} {tier.amount}
              </div>
              <div className="text-sm text-gray-400">/{tier.interval}</div>
            </>
          ) : (
            <div className="text-3xl font-black text-neon-cyan">KOSTENLOS</div>
          )}
        </div>
        
        <ul className="text-sm text-gray-300 space-y-2 mb-6">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center justify-center">
              <span className="text-neon-cyan mr-2">✓</span>
              {benefit.benefit}
            </li>
          ))}
        </ul>
        
        <Button 
          className={`w-full py-2 ${
            isPopular 
              ? 'cyber-button' 
              : tier.name === 'TAGESMITGLIED'
                ? 'cyber-button-outline'
                : `bg-gradient-to-r ${colorClass} text-white hover:shadow-neon-cyan transition-all duration-300`
          }`}
          onClick={handleSelect}
        >
          AUSWÄHLEN
        </Button>
      </CardContent>
    </Card>
  );
}
