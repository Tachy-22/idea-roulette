'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AdminAuthProps {
  children: React.ReactNode;
}

// Admin user emails - in production, this should be in environment variables or Firestore
const ADMIN_EMAILS = [
  'entekumejeffrey@gmail.com',
  // Add your admin email here
];

export function AdminAuth({ children }: AdminAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Check if user is admin
        const userIsAdmin = ADMIN_EMAILS.includes(user.email || '');
        setIsAdmin(userIsAdmin);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-dvh bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access the admin dashboard.
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go to Main App
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full h-dvh bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-2">
            You don&apos;t have admin permissions to access this dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Signed in as: {user.email}
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go to Main App
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}