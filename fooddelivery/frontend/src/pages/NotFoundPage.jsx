import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <UtensilsCrossed className="h-12 w-12 text-primary mb-4" />
      <h1 className="font-display text-3xl font-semibold mb-2">Page not found</h1>
      <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
