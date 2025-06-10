export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Animated Grid */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-neon-cyan rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-6 h-6 bg-neon-pink rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-20 w-2 h-2 bg-neon-cyan rounded-full animate-ping"></div>
      <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-neon-pink rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-neon-cyan rounded-full animate-ping delay-1000"></div>
    </div>
  );
}
