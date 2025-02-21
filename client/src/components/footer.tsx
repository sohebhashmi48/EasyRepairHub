import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">EasyRepair</h3>
            <p className="text-sm text-gray-600">
              Connecting users with skilled repair technicians for reliable electronics repairs.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Button variant="link" asChild>
                <Link href="/">Home</Link>
              </Button>
              <br />
              <Button variant="link" asChild>
                <Link href="/browse">Browse Repairs</Link>
              </Button>
              <br />
              <Button variant="link" asChild>
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <div className="space-y-2">
              <Button variant="link">Smartphones</Button>
              <br />
              <Button variant="link">Laptops</Button>
              <br />
              <Button variant="link">TVs</Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <Button variant="link">Contact Us</Button>
              <br />
              <Button variant="link">FAQ</Button>
              <br />
              <Button variant="link">Terms of Service</Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} EasyRepair. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
