import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Clock, 
  User, 
  Send,
  Newspaper,
  Calendar
} from "lucide-react";

const commentSchema = z.object({
  content: z.string().min(1, "Kommentar darf nicht leer sein").max(500, "Kommentar zu lang"),
});

export default function NewsSection() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());

  const { data: newsPosts = [] } = useQuery({
    queryKey: ["/api/news"],
  });

  const togglePost = (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  return (
    <section id="news" className="py-20 px-4 sm:px-6 lg:px-8 bg-cyber-darker/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neon-cyan neon-text mb-4">
            NEWS & UPDATES
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Bleibe auf dem Laufenden mit den neuesten Entwicklungen
          </p>
        </div>
        
        <div className="space-y-8">
          {newsPosts.map((post: any) => (
            <NewsPost 
              key={post.id} 
              post={post} 
              isExpanded={expandedPosts.has(post.id)}
              onToggle={() => togglePost(post.id)}
              user={user}
              isAuthenticated={isAuthenticated}
            />
          ))}
          
          {newsPosts.length === 0 && (
            <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0">
              <CardContent className="p-8 text-center">
                <Newspaper className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                <p className="text-gray-400">Noch keine News verfügbar</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

function NewsPost({ post, isExpanded, onToggle, user, isAuthenticated }: any) {
  const { toast } = useToast();
  const [showCommentForm, setShowCommentForm] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/news", post.id, "comments"],
    enabled: isExpanded,
  });

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof commentSchema>) => {
      await apiRequest("POST", `/api/news/${post.id}/comments`, data);
    },
    onSuccess: () => {
      toast({
        title: "Kommentar erstellt",
        description: "Ihr Kommentar wurde erfolgreich hinzugefügt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/news", post.id, "comments"] });
      form.reset();
      setShowCommentForm(false);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof commentSchema>) => {
    createCommentMutation.mutate(data);
  };

  return (
    <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0">
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-neon-cyan mb-2">
              {post.title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString('de-DE')}
              </div>
              <div className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                {comments.length} Kommentare
              </div>
            </div>
          </div>
          <Badge className="bg-neon-pink text-cyber-dark">
            NEWS
          </Badge>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="mb-6">
            <p className="text-gray-300 leading-relaxed">
              {post.content}
            </p>
          </div>
          
          <Separator className="my-6 bg-cyber-gray" />
          
          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-neon-cyan">
                Kommentare ({comments.length})
              </h4>
              {isAuthenticated && (
                <Button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="cyber-button-outline hover-glow"
                  size="sm"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Kommentieren
                </Button>
              )}
            </div>

            {/* Comment Form */}
            {showCommentForm && isAuthenticated && (
              <Card className="bg-cyber-dark/50 border border-cyber-gray">
                <CardContent className="p-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400">Ihr Kommentar</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Teilen Sie Ihre Gedanken mit..."
                                className="cyber-input resize-none"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          onClick={() => setShowCommentForm(false)}
                          className="cyber-button-outline"
                        >
                          Abbrechen
                        </Button>
                        <Button 
                          type="submit" 
                          className="cyber-button hover-glow"
                          disabled={createCommentMutation.isPending}
                        >
                          {createCommentMutation.isPending ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          Senden
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3 p-4 bg-cyber-dark/30 rounded-lg border border-cyber-gray">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-neon-cyan text-cyber-dark text-xs">
                      {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-neon-cyan">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>Noch keine Kommentare vorhanden</p>
                  {!isAuthenticated && (
                    <p className="text-xs mt-2">
                      <a href="/api/login" className="text-neon-cyan hover:underline">
                        Melden Sie sich an
                      </a> um zu kommentieren
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}