import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Calendar } from "lucide-react";

export default function GallerySection() {
  const { data: galleryImages = [] } = useQuery({
    queryKey: ["/api/gallery"],
  });

  if (galleryImages.length === 0) return null;

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neon-pink neon-text mb-4">
            GALERIE
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Impressionen aus unserem Cyberpunk-Universum
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryImages.map((image) => (
            <Card 
              key={image.id} 
              className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0 hover-glow transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.title || "Gallery Image"}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-neon-cyan text-cyber-dark">
                    <Image className="mr-1 h-3 w-3" />
                    FOTO
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-neon-cyan mb-2">
                  {image.title || "Untitled"}
                </h3>
                {image.description && (
                  <p className="text-gray-300 text-sm mb-4">
                    {image.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(image.createdAt).toLocaleDateString('de-DE')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}