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
import { useTheme } from "./theme-provider"; // Added import for theme hook

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme(); // Added theme context

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Button variant="link" className="text-xl font-bold text-primary p-0" asChild>
          <Link href="/">EasyRepair</Link>
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button> {/* Added theme toggle button */}
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