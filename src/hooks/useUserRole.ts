import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserAppRole = 'admin' | 'manager' | 'staff' | 'guest';

export interface UserRole {
  id: string;
  user_id: string;
  role: UserAppRole;
  created_at: string;
}

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserRole | null;
    },
    enabled: !!user?.id,
  });
}

export function useHasRole(requiredRole: UserAppRole | UserAppRole[]) {
  const { data: userRole, isLoading } = useUserRole();
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasRole = userRole ? roles.includes(userRole.role) : false;
  
  return { hasRole, isLoading, role: userRole?.role };
}

// Role hierarchy for permission checks
const roleHierarchy: Record<UserAppRole, number> = {
  admin: 4,
  manager: 3,
  staff: 2,
  guest: 1,
};

export function useHasMinimumRole(minimumRole: UserAppRole) {
  const { data: userRole, isLoading } = useUserRole();
  
  const hasMinimumRole = userRole 
    ? roleHierarchy[userRole.role] >= roleHierarchy[minimumRole]
    : false;
  
  return { hasMinimumRole, isLoading, role: userRole?.role };
}
