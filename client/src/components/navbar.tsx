import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Button variant="link" className="text-xl font-bold text-primary p-0" asChild>
          <Link href="/">EasyRepair</Link>
        </Button>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/browse">Browse Repairs</Link>
              </Button>
              {!user.isRepairman && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/my-devices">My Devices</Link>
                  </Button>
                  <Button variant="default" className="gap-2" asChild>
                    <Link href="/create-listing">
                      <Plus className="h-4 w-4" />
                      Create Listing
                    </Link>
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Button asChild>
                    <Link href="/dashboard">
                      <DropdownMenuItem>
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                  </Button>
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 mr-2" />
                    ) : (
                      <Moon className="h-4 w-4 mr-2" />
                    )}
                    {theme === "dark" ? "Light" : "Dark"} Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => logoutMutation.mutate()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}