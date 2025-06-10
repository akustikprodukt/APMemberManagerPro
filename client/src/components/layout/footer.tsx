import { Mail, MapPin, Phone, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-cyber-darker border-t border-neon-cyan py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="text-2xl font-bold text-neon-cyan neon-text mb-4">
              <MicOff className="inline mr-2" />
              Akustik Produkt
            </div>
            <p className="text-gray-400">
              Die Zukunft der elektronischen Musik im Cyberpunk-Universum.
            </p>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">KONTAKT</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-neon-cyan" />
                Florastrasse 10, 8610 Uster
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-neon-cyan" />
                info@akustik-produkt.ch
              </p>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-neon-cyan" />
                +41 XX XXX XX XX
              </p>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">LINKS</h4>
            <div className="space-y-2">
              <button 
                onClick={() => scrollToSection('pricing')}
                className="block text-gray-400 hover:text-neon-cyan transition-colors"
              >
                Preise
              </button>
              <button 
                onClick={() => scrollToSection('dsgvo')}
                className="block text-gray-400 hover:text-neon-cyan transition-colors"
              >
                Datenschutz
              </button>
              <a href="#" className="block text-gray-400 hover:text-neon-cyan transition-colors">
                Impressum
              </a>
              <a href="#" className="block text-gray-400 hover:text-neon-cyan transition-colors">
                AGB
              </a>
            </div>
          </div>
          
          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">SOCIAL</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors text-xl">
                <i className="fab fa-soundcloud"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-pink transition-colors text-xl">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors text-xl">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-pink transition-colors text-xl">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-cyber-gray text-center text-gray-400">
          <p>&copy; 2024 Akustik Produkt. Alle Rechte vorbehalten. | Powered by Cyberpunk Technology</p>
        </div>
      </div>
    </footer>
  );
}
