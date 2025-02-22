import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistance } from "date-fns";
import { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  recipientId: number;
}

export default function ChatDialog({ open, onOpenChange, listingId, recipientId }: ChatDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !user) return;

    // Connect to WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnecting(false);
      // Authenticate the connection
      ws.send(JSON.stringify({
        type: 'auth',
        data: { userId: user.id }
      }));

      // Load existing messages
      fetch(`/api/listings/${listingId}/messages`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(error => {
          console.error('Error loading messages:', error);
          toast({
            title: "Error loading messages",
            description: "Failed to load chat history",
            variant: "destructive",
          });
        });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data.data]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
      toast({
        title: "Connection error",
        description: "Failed to connect to chat server",
        variant: "destructive",
      });
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [open, user, listingId, toast]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!socket || !message.trim() || !user) return;

    const messageData = {
      type: 'chat',
      data: {
        message: message.trim(),
        listingId,
        senderId: user.id,
        recipientId
      }
    };

    try {
      socket.send(JSON.stringify(messageData));
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat</DialogTitle>
        </DialogHeader>
        {isConnecting ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.senderId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistance(new Date(msg.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}