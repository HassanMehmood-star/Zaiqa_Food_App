import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=60';

export default function CartPage() {
  const { cart, loading, refreshCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => { refreshCart(); }, [refreshCart]);

  if (loading && !cart) return <LoadingSpinner full />;

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          message="Browse restaurants and add some delicious meals to get started."
          action={<Link to="/restaurants" className="btn-primary">Explore restaurants</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-2">Your cart</h1>
      {cart.restaurant && <p className="text-muted mb-6">Ordering from <span className="font-medium text-ink">{cart.restaurant.name}</span></p>}

      <div className="card divide-y divide-border mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <img src={item.meal_image || FALLBACK_IMG} alt={item.meal_name} className="h-16 w-16 rounded-lg object-cover shrink-0"
              onError={(e) => { e.target.src = FALLBACK_IMG; }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.meal_name}</p>
              <p className="text-xs text-muted font-mono">Rs {Number(item.unit_price).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
              <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 hover:text-primary">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-mono w-5 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="font-mono font-semibold w-20 text-right">Rs {item.subtotal.toLocaleString()}</span>
            <button onClick={() => removeItem(item.id)} className="p-2 text-muted hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 space-y-2 mb-6">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span className="font-mono">Rs {cart.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
          <span>Total</span>
          <span className="font-mono">Rs {cart.total.toLocaleString()}</span>
        </div>
      </div>

      <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-3">Proceed to checkout</button>
    </div>
  );
}
