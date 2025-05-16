import { Link } from 'lucide-react'; // Using Link icon for LinkUP

export function Header() {
  return (
    <header className="py-6 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-center sm:justify-start">
        <Link className="h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">LinkUP</h1>
      </div>
    </header>
  );
}
