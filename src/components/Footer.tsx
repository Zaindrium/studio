export function Footer() {
  return (
    <footer className="py-6 mt-12 border-t border-border">
      <div className="container mx-auto text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LinkUP. All rights reserved.</p>
        <p className="text-sm">Craft your digital presence.</p>
      </div>
    </footer>
  );
}
