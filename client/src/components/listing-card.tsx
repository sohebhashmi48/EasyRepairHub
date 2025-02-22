import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Trash2, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import BidForm from "./bid-form";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/listings/${listing.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    try {
      await apiRequest("POST", `/api/listings/${listing.id}/accept-bid/${bidId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Success",
        description: "Bid accepted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept bid",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <div 
        className="aspect-video w-full bg-cover bg-center rounded-t-lg"
        style={{ 
          backgroundImage: `url(${listing.imageUrl})`,
          backgroundColor: '#f3f4f6' // Fallback color
        }}
      />
      {listing.budget && (
        <div className="px-6 py-2 bg-muted">
          <p className="text-sm font-medium">
            Budget: ${listing.budget}
          </p>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{listing.title}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistance(new Date(listing.createdAt), new Date(), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={listing.status === "open" ? "default" : "secondary"}>
              {listing.status}
            </Badge>
            {user?.id === listing.userId && (
              <Button 
                variant="destructive" 
                size="icon"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {listing.description}
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="outline">{listing.category}</Badge>
          {user?.isRepairman && listing.status === "open" && (
            <BidForm listingId={listing.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}