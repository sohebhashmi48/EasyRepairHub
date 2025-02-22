import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Listing, Bid } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Trash2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import BidForm from "./bid-form";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatDialog from "./chat-dialog";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBids, setShowBids] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  const { data: bids = [] } = useQuery<Bid[]>({
    queryKey: [`/api/listings/${listing.id}/bids`],
    enabled: showBids,
  });

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
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${listing.id}/bids`] });
      const acceptedBid = bids.find(bid => bid.id === bidId);
      if (acceptedBid) {
        setSelectedBid(acceptedBid);
        setShowChat(true);
      }
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

  useEffect(() => {
    if (listing.status === "in_progress" && bids.length > 0) {
      const accepted = bids.find(bid => bid.status === "accepted");
      if (accepted) {
        setSelectedBid(accepted);
      }
    }
  }, [listing.status, bids]);

  return (
    <>
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

          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">{listing.category}</Badge>
            {user?.isRepairman && listing.status === "open" && (
              <BidForm listingId={listing.id} />
            )}
          </div>

          {(user?.id === listing.userId || user?.isRepairman) && (
            <div className="mt-4 border-t pt-4">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between"
                onClick={() => setShowBids(!showBids)}
              >
                Show Bids {showBids ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showBids && (
                <div className="mt-4 space-y-4">
                  {bids.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No bids yet</p>
                  ) : (
                    bids.map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">${bid.amount}</p>
                          {bid.comment && (
                            <p className="text-sm text-muted-foreground mt-1">{bid.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistance(new Date(bid.createdAt), new Date(), { addSuffix: true })}
                          </p>
                        </div>
                        {user?.id === listing.userId && listing.status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptBid(bid.id)}
                          >
                            Accept Bid
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {listing.status === "in_progress" && selectedBid && selectedBid.status === "accepted" && (
            <div className="mt-4 border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowChat(true)}
              >
                Chat with {user?.id === listing.userId ? "Repairman" : "Customer"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBid && (
        <ChatDialog
          open={showChat}
          onOpenChange={setShowChat}
          listingId={listing.id}
          recipientId={user?.id === listing.userId ? selectedBid.repairmanId : listing.userId}
        />
      )}
    </>
  );
}