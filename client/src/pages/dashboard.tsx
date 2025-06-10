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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Star, 
  Save, 
  Camera, 
  Clock, 
  Crown, 
  Gem,
  LogOut,
  Zap
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const profileSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional(),
  address: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  soundcloudUrl: z.string().url("Ungültige URL").optional().or(z.literal("")),
});

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: membershipTiers = [] } = useQuery({
    queryKey: ["/api/membership/tiers"],
  });

  const { data: membershipBenefits = [] } = useQuery({
    queryKey: ["/api/membership/benefits"],
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      zip: user?.zip || "",
      city: user?.city || "",
      soundcloudUrl: user?.soundcloudUrl || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Profil konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getMembershipIcon = (tier: string) => {
    switch (tier) {
      case "TAGESMITGLIED": return <Clock className="h-8 w-8" />;
      case "PASSIV": return <User className="h-8 w-8" />;
      case "AKTIV": return <Star className="h-8 w-8" />;
      case "VIP": return <Crown className="h-8 w-8 text-yellow-400" />;
      case "SPONSOR": return <Gem className="h-8 w-8" />;
      default: return <User className="h-8 w-8" />;
    }
  };

  const getCurrentTier = () => {
    return membershipTiers.find(tier => tier.name === user?.membershipTier);
  };

  const getBenefitsForTier = (tierName: string) => {
    return membershipBenefits.filter(benefit => benefit.tierName === tierName);
  };

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-cyber-light">Laden...</p>
        </div>
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const currentBenefits = getBenefitsForTier(user?.membershipTier || "TAGESMITGLIED");

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-light relative">
      <AnimatedBackground />
      
      <Navbar />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neon-cyan neon-text mb-2">
              USER DASHBOARD
            </h1>
            <p className="text-xl text-gray-300">
              Verwalte dein Profil und deine Mitgliedschaft
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-neon-cyan flex items-center">
                  <User className="mr-3" />
                  PROFIL INFORMATION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400">Vorname</FormLabel>
                            <FormControl>
                              <Input {...field} className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400">Nachname</FormLabel>
                            <FormControl>
                              <Input {...field} className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400">E-Mail</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400">Telefon</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-400">Adresse</FormLabel>
                            <FormControl>
                              <Input {...field} className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400">PLZ</FormLabel>
                            <FormControl>
                              <Input {...field} className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400">Ort</FormLabel>
                            <FormControl>
                              <Input {...field} className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="soundcloudUrl"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-400">SoundCloud Link</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" className="cyber-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="cyber-button hover-glow w-full md:w-auto"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      PROFIL SPEICHERN
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Membership Status */}
          <div>
            <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-neon-pink flex items-center">
                  <Zap className="mr-3" />
                  MITGLIEDSCHAFT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-cyber-dark/50 rounded-lg border border-neon-cyan">
                  <div className="w-20 h-20 bg-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4">
                    {getMembershipIcon(user?.membershipTier || "TAGESMITGLIED")}
                  </div>
                  <h4 className="text-xl font-bold text-neon-cyan mb-2">
                    {user?.membershipTier || "TAGESMITGLIED"}
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Mitglied seit {new Date(user?.createdAt || Date.now()).getFullYear()}
                  </p>
                  {currentTier && (
                    <div className="text-2xl font-bold text-neon-cyan mb-4">
                      {currentTier.amount > 0 ? (
                        `${currentTier.currency} ${currentTier.amount}/${currentTier.interval}`
                      ) : (
                        "KOSTENLOS"
                      )}
                    </div>
                  )}
                  
                  {/* Benefits */}
                  <div className="mt-4">
                    <h5 className="text-sm font-bold text-gray-400 mb-2">VORTEILE:</h5>
                    <div className="space-y-1">
                      {currentBenefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="border-neon-cyan text-neon-cyan text-xs">
                          {benefit.benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Upload */}
            <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neon-pink">
                  PROFILBILD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-neon-cyan text-cyber-dark text-2xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="border-2 border-dashed border-cyber-gray rounded-lg p-6 hover:border-neon-cyan transition-colors cursor-pointer">
                    <Camera className="text-3xl text-gray-500 mb-2 mx-auto" />
                    <p className="text-sm text-gray-400">Klicken zum Hochladen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
