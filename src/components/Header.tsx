import { Button } from '@/components/ui/button';
import { Link as LinkIcon, LogOut } from 'lucide-react'; // Using Link icon for LinkUP, added LogOut

export function Header() {
  return (
    <header className="py-6 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Invisible spacer to help center the logo/title when justify-between is used with a right-aligned item */}
        <div className="w-24 flex-shrink-0"> {/* Adjust width as needed or make it invisible but take space */}
          {/* This div is intentionally left empty or could hold a placeholder if needed for balance */}
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <LinkIcon className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">LinkUP</h1>
          </div>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Modern Digital Cards, Effortless Networking.
          </p>
        </div>

        <Button 
          variant="outline" 
          className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground w-24 flex-shrink-0"
          onClick={() => {
            // Placeholder for logout logic
            // In a real app, this would redirect to /login after clearing auth state
            console.log("Logout clicked");
            // Example: router.push('/login'); 
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
