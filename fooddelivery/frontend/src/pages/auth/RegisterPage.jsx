import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UtensilsCrossed, User, Store, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'regular_user' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Password show/hide states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to Zaiqa, ${user.full_name.split(' ')[0]}!`);
      navigate(user.role === 'restaurant_owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <span className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </span>
        </div>
        <h1 className="text-2xl font-display font-semibold text-center mb-1">Create your account</h1>
        <p className="text-sm text-muted text-center mb-8">Join Zaiqa and start ordering</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setForm({ ...form, role: 'regular_user' })}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-medium transition-colors ${form.role === 'regular_user' ? 'border-primary bg-primary-light text-primary-dark' : 'border-border text-muted'}`}
              >
                <User className="h-5 w-5" /> Customer
              </button>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, role: 'restaurant_owner' })}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-medium transition-colors ${form.role === 'restaurant_owner' ? 'border-primary bg-primary-light text-primary-dark' : 'border-border text-muted'}`}
              >
                <Store className="h-5 w-5" /> Restaurant Owner
              </button>
            </div>
          </div>

          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input pr-10" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="label">Confirm password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                className="input pr-10" 
                value={form.confirmPassword} 
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}