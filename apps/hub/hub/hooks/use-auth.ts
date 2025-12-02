/**
 * Authentication Hook
 * Provides authentication utilities and state
 */

import { useAuthStore } from '@/store/auth-store';
import { authApi, type LoginCredentials, type RegisterData } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
  } = useAuthStore();

  /**
   * Login user
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);

      if (!response.success) {
        toast.error(response.error || 'Login failed');
        return { success: false, error: response.error };
      }

      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register user
   */
  const handleRegister = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await authApi.register(data);

      if (!response.success) {
        toast.error(response.error || 'Registration failed');
        if (response.details) {
          response.details.forEach((detail) => {
            toast.error(detail.message);
          });
        }
        return { success: false, error: response.error };
      }

      login(response.data.user, response.data.token);
      toast.success('Registration successful!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string) => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    hasRole,
    hasAnyRole,
  };
}

