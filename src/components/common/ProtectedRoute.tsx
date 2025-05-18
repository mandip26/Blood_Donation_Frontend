import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from '@tanstack/react-router';
import useAuth from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * A component that protects routes based on authentication status
 * @param {ReactNode} children - The child components to render
 * @param {boolean} requireAuth - Whether authentication is required (true) or forbidden (false)
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);
  
  // Only show loading state if it takes more than 100ms to determine auth status
  // Making this faster since we're using localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowLoading(true);
      }
    }, 100);
    
    if (!isLoading) {
      setShowLoading(false);
    }
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;
    
    // For protected routes: if not authenticated, redirect to login
    if (requireAuth && !isLoggedIn) {
      console.log("Not authenticated, redirecting to login");
      navigate({ to: '/login' });
    }
    
    // For auth routes (login/signup): if already authenticated, redirect to dashboard
    if (!requireAuth && isLoggedIn) {
      console.log("Already authenticated, redirecting to dashboard");
      navigate({ to: '/dashboard' });
    }
  }, [requireAuth, isLoggedIn, isLoading, navigate]);
  
  // If we're loading for longer than our threshold, show spinner
  if (isLoading && showLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-magenta"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Skip rendering anything while initial auth check is happening
  if (isLoading) {
    return null;
  }

  // For protected routes: redirect if not authenticated
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // For auth routes: redirect if already authenticated
  if (!requireAuth && isLoggedIn) {
    return <Navigate to="/dashboard" />;
  }

  // Render children if conditions are met
  return <>{children}</>;
}

export default ProtectedRoute;
