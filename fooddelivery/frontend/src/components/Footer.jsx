import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, UtensilsCrossed } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-display text-lg font-semibold mb-3">
            <span className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </span>
            Zaiqa
          </div>
          <p className="text-sm text-muted">Delicious food, delivered to your door.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Follow us</h4>
          <div className="flex gap-3">
            <a href="#" className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-colors"><Instagram size={16} /></a>
            <a href="#" className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-colors"><Facebook size={16} /></a>
            <a href="#" className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-colors"><Twitter size={16} /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Zaiqa. All rights reserved.
      </div>
    </footer>
  );
}
