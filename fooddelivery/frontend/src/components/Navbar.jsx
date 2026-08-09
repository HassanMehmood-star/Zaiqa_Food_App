import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Menu, X, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const guestLinks = [
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/about', label: 'About' },
  ];
  const userLinks = [
    { to: '/', label: 'Home' },
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/orders', label: 'Orders' },
  ];
  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Dashboard' },
    { to: '/owner/restaurants', label: 'Restaurants' },
    { to: '/owner/orders', label: 'Orders' },
  ];

  const links = !user ? guestLinks : user.role === 'restaurant_owner' ? ownerLinks : userLinks;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <UtensilsCrossed className="h-4.5 w-4.5 text-white" size={18} />
          </span>
          Zaiqa
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-ink/80 hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user?.role === 'regular_user' && (
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-primary-light transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          {!user ? (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm font-medium text-ink/80 hover:text-primary">
                {user.full_name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-outline">Log out</button>
            </div>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium py-1.5">
              {l.label}
            </Link>
          ))}
          {user?.role === 'regular_user' && (
            <Link to="/cart" onClick={() => setOpen(false)} className="block text-sm font-medium py-1.5">
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
          )}
          {!user ? (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>Sign up</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn-outline w-full mt-2">Log out</button>
          )}
        </div>
      )}
    </header>
  );
}
