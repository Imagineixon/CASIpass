import { RouterProvider } from 'react-router';
import { Toaster, toast } from 'sonner';
import { router } from './routes';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth-store';
import { tokenStorage } from './services/api';

export default function App() {
  const logout = useAuthStore((s) => s.logout);

  // Listen for JWT session expiry from API interceptor
  useEffect(() => {
    const handler = () => {
      logout();
      tokenStorage.clear();
      toast.error('Sessão expirada. Faça login novamente.');
    };
    window.addEventListener('casipass:session-expired', handler);
    return () => window.removeEventListener('casipass:session-expired', handler);
  }, [logout]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            borderRadius: '0.5rem',
            border: '1px solid #e0ddd8',
          },
        }}
      />
    </>
  );
}