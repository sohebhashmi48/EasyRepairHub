import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();

  return (
    <Card className="overflow-hidden">
      <div 
        className="aspect-video w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${listing.imageUrl})` }}
      />
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{listing.title}</CardTitle>
          <Badge variant={listing.status === "open" ? "default" : "secondary"}>
            {listing.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {listing.description}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline">{listing.category}</Badge>
          {user?.isRepairman && listing.status === "open" && (
            <Button size="sm">Place Bid</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
