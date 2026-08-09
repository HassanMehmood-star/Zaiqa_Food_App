import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ deliveryName: user?.full_name || '', deliveryPhone: '', deliveryAddress: '' });
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', form);
      setPlacedOrder(data.order);
      refreshCart();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary-light flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-secondary" />
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">Your order has been placed successfully!</h1>
        <div className="card p-5 text-left my-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">Order ID</span><span className="font-mono">#{placedOrder.id}</span></div>
          <div className="flex justify-between"><span className="text-muted">Restaurant</span><span>{placedOrder.restaurant_name}</span></div>
          <div className="flex justify-between"><span className="text-muted">Total</span><span className="font-mono font-semibold">Rs {Number(placedOrder.total_amount).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted">Status</span><span className="badge bg-amber-light text-amber">Placed</span></div>
        </div>
        <button onClick={() => navigate(`/orders/${placedOrder.id}`)} className="btn-primary w-full">Track order</button>
      </div>
    );
  }

  if (!cart) return <LoadingSpinner full />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-8">Checkout</h1>

      <div className="card p-5 mb-6">
        <h2 className="font-semibold mb-3 text-sm text-muted uppercase tracking-wide">Order summary</h2>
        <p className="text-sm mb-3">Restaurant: <span className="font-medium">{cart.restaurant?.name}</span></p>
        <div className="space-y-1.5 text-sm">
          {cart.items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>{i.quantity} × {i.meal_name}</span>
              <span className="font-mono">Rs {i.subtotal.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-semibold pt-3 mt-3 border-t border-border">
          <span>Total</span>
          <span className="font-mono">Rs {cart.total.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="card p-5 space-y-4">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide">Delivery information</h2>
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.deliveryName} onChange={(e) => setForm({ ...form, deliveryName: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input required className="input" value={form.deliveryPhone} onChange={(e) => setForm({ ...form, deliveryPhone: e.target.value })} />
        </div>
        <div>
          <label className="label">Delivery address</label>
          <textarea required rows={3} className="input" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
        </div>
        <button type="submit" disabled={placing} className="btn-primary w-full py-3">
          {placing ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
