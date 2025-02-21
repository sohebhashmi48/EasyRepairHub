import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <div className="relative">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://images.unsplash.com/photo-1597424216540-64533fe46ef8)`,
          filter: 'brightness(0.3)'
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get Your Electronics Fixed by Trusted Professionals
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Upload photos of your faulty devices and receive competitive repair quotes from verified technicians.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {user?.isRepairman ? (
              <Button size="lg" className="bg-primary/90 hover:bg-primary">
                Browse Repair Requests
              </Button>
            ) : (
              <Button size="lg" className="bg-primary/90 hover:bg-primary">
                List Your Device
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
