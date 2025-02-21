import { useQuery } from "@tanstack/react-query";
import { Listing } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import HeroSection from "@/components/hero-section";
import CategoryGrid from "@/components/category-grid";
import ListingCard from "@/components/listing-card";
import Footer from "@/components/footer";

export default function HomePage() {
  const { user } = useAuth();
  const { data: listings = [] } = useQuery<Listing[]>({ 
    queryKey: ["/api/listings"]
  });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />
        
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">Browse Categories</h2>
          <CategoryGrid />
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Latest Repair Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
