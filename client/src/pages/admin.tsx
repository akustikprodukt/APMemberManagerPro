import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AnimatedBackground from "@/components/ui/animated-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  DollarSign, 
  Save, 
  Edit, 
  Trash, 
  Plus,
  Settings,
  UserCog,
  LogOut
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const tierUpdateSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().min(1),
  interval: z.string().min(1),
});

const benefitsUpdateSchema = z.object({
  benefits: z.array(z.string().min(1).max(200)),
});

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editingBenefits, setEditingBenefits] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: membershipTiers = [] } = useQuery({
    queryKey: ["/api/membership/tiers"],
  });

  const { data: membershipBenefits = [] } = useQuery({
    queryKey: ["/api/membership/benefits"],
  });

  const updateMembershipMutation = useMutation({
    mutationFn: async ({ userId, membershipTier }: { userId: string; membershipTier: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/membership`, { membershipTier });
    },
    onSuccess: () => {
      toast({
        title: "Mitgliedschaft aktualisiert",
        description: "Die Mitgliedschaft wurde erfolgreich geändert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Nicht autorisiert",
          description: "Sie werden abgemeldet. Loggen Sie sich erneut ein...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Fehler",
        description: "Mitgliedschaft konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ tierName, data }: { tierName: string; data: z.infer<typeof tierUpdateSchema> }) => {
      await apiRequest("PUT", `/api/membership/tiers/${tierName}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Preise aktualisiert",
        description: "Die Preiseinstellungen wurden erfolgreich gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/membership/tiers"] });
      setEditingTier(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Preise konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const updateBenefitsMutation = useMutation({
    mutationFn: async ({ tierName, benefits }: { tierName: string; benefits: string[] }) => {
      await apiRequest("PUT", `/api/membership/benefits/${tierName}`, { benefits });
    },
    onSuccess: () => {
      toast({
        title: "Vorteile aktualisiert",
        description: "Die Vorteile wurden erfolgreich gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/membership/benefits"] });
      setEditingBenefits(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Vorteile konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getBenefitsForTier = (tierName: string) => {
    return membershipBenefits.filter(benefit => benefit.tierName === tierName);
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light relative">
      <AnimatedBackground />
      
      <Navbar />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neon-pink neon-text mb-2">
              ADMIN CONTROL CENTER
            </h1>
            <p className="text-xl text-gray-300">
              Vollständige Kontrolle über Mitgliederverwaltung, Preise und Systemeinstellungen
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="cyber-button-pink hover-glow"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Member Management Panel */}
          <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-neon-cyan flex items-center">
                <UserCog className="mr-3" />
                MITGLIEDERVERWALTUNG
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Lade Mitglieder...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-cyber-dark/50 rounded border border-cyber-gray hover:border-neon-cyan transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={member.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-r from-neon-cyan to-neon-pink text-cyber-dark font-bold">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={member.membershipTier}
                          onValueChange={(value) => {
                            updateMembershipMutation.mutate({
                              userId: member.id,
                              membershipTier: value,
                            });
                          }}
                        >
                          <SelectTrigger className="cyber-input w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {membershipTiers.map((tier) => (
                              <SelectItem key={tier.name} value={tier.name}>
                                {tier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Management Panel */}
          <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-neon-pink flex items-center">
                <DollarSign className="mr-3" />
                PREISMANAGEMENT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {membershipTiers.map((tier) => (
                  <TierEditCard
                    key={tier.name}
                    tier={tier}
                    benefits={getBenefitsForTier(tier.name)}
                    isEditingTier={editingTier === tier.name}
                    isEditingBenefits={editingBenefits === tier.name}
                    onEditTier={() => setEditingTier(editingTier === tier.name ? null : tier.name)}
                    onEditBenefits={() => setEditingBenefits(editingBenefits === tier.name ? null : tier.name)}
                    onUpdateTier={(data) => updateTierMutation.mutate({ tierName: tier.name, data })}
                    onUpdateBenefits={(benefits) => updateBenefitsMutation.mutate({ tierName: tier.name, benefits })}
                    isUpdating={updateTierMutation.isPending || updateBenefitsMutation.isPending}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

interface TierEditCardProps {
  tier: any;
  benefits: any[];
  isEditingTier: boolean;
  isEditingBenefits: boolean;
  onEditTier: () => void;
  onEditBenefits: () => void;
  onUpdateTier: (data: any) => void;
  onUpdateBenefits: (benefits: string[]) => void;
  isUpdating: boolean;
}

function TierEditCard({
  tier,
  benefits,
  isEditingTier,
  isEditingBenefits,
  onEditTier,
  onEditBenefits,
  onUpdateTier,
  onUpdateBenefits,
  isUpdating,
}: TierEditCardProps) {
  const tierForm = useForm({
    resolver: zodResolver(tierUpdateSchema),
    defaultValues: {
      amount: tier.amount,
      currency: tier.currency,
      interval: tier.interval,
    },
  });

  const [benefitsText, setBenefitsText] = useState(
    benefits.map(b => b.benefit).join('\n')
  );

  const handleTierSubmit = (data: z.infer<typeof tierUpdateSchema>) => {
    onUpdateTier(data);
  };

  const handleBenefitsSubmit = () => {
    const benefitsList = benefitsText
      .split('\n')
      .map(b => b.trim())
      .filter(b => b.length > 0);
    onUpdateBenefits(benefitsList);
  };

  return (
    <div className="p-4 bg-cyber-dark/50 rounded-lg border border-cyber-gray">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-neon-cyan">{tier.name}</h4>
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={onEditTier}
            className={isEditingTier ? "cyber-button-pink" : "cyber-button-outline"}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={onEditBenefits}
            className={isEditingBenefits ? "cyber-button-pink" : "cyber-button-outline"}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isEditingTier ? (
        <Form {...tierForm}>
          <form onSubmit={tierForm.handleSubmit(handleTierSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={tierForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-400">Betrag</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="cyber-input"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tierForm.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-400">Währung</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cyber-input">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CHF">CHF</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tierForm.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-400">Intervall</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="cyber-input">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Jahr">Jahr</SelectItem>
                        <SelectItem value="Monat">Monat</SelectItem>
                        <SelectItem value="Tag">Tag</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="cyber-button w-full" disabled={isUpdating}>
              <Save className="mr-2 h-4 w-4" />
              SPEICHERN
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-sm text-gray-300 mb-4">
          {tier.amount > 0 ? `${tier.currency} ${tier.amount}/${tier.interval}` : "KOSTENLOS"}
        </div>
      )}

      {isEditingBenefits ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Vorteile (ein Vorteil pro Zeile, max. 200 Zeichen)
            </label>
            <Textarea
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              className="cyber-input h-32 resize-none"
              placeholder="Vorteil 1&#10;Vorteil 2&#10;Vorteil 3"
            />
          </div>
          <Button onClick={handleBenefitsSubmit} className="cyber-button w-full" disabled={isUpdating}>
            <Save className="mr-2 h-4 w-4" />
            VORTEILE SPEICHERN
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <Badge key={index} variant="outline" className="border-neon-cyan text-neon-cyan text-xs">
              {benefit.benefit}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
