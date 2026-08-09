import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-semibold mb-8">Your profile</h1>
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white font-display text-xl font-semibold">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{user.full_name}</p>
            <p className="text-sm text-muted capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted" /> {user.email}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted" /> Account created {new Date(user.created_at || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
