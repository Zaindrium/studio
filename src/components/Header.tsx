import { Link } from 'lucide-react'; // Using Link icon for LinkUP

export function Header() {
  return (
    <header className="py-6 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="flex items-center">
          <Link className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">LinkUP</h1>
        </div>
        <p className="text-sm text-primary-foreground/80 mt-1">
          Modern Digital Cards, Effortless Networking.
        </p>
      </div>
    </header>
  );
}
