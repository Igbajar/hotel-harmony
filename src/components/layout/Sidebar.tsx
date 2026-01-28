import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Receipt,
  ClipboardList,
  Utensils,
  ConciergeBell,
  Calendar,
  UserCog,
  Globe,
  Shield,
  Smartphone,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hotel,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

import type { UserAppRole } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  minRole?: UserAppRole; // Minimum role required to see this item
}

interface NavGroup {
  title: string;
  items: NavItem[];
  minRole?: UserAppRole; // Minimum role required to see this group
}

const navGroups: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Rooms', icon: BedDouble, path: '/rooms' },
      { label: 'Reservations', icon: CalendarDays, path: '/reservations', badge: 4 },
      { label: 'Guests', icon: Users, path: '/guests' },
      { label: 'Billing', icon: Receipt, path: '/billing', minRole: 'manager' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Housekeeping', icon: ClipboardList, path: '/housekeeping' },
      { label: 'Restaurant', icon: Utensils, path: '/restaurant' },
      { label: 'Room Service', icon: ConciergeBell, path: '/room-service' },
      { label: 'Events', icon: Calendar, path: '/events' },
    ],
  },
  {
    title: 'Management',
    minRole: 'manager',
    items: [
      { label: 'Staff', icon: UserCog, path: '/staff', minRole: 'manager' },
      { label: 'Online Booking', icon: Globe, path: '/online-booking' },
      { label: 'Security', icon: Shield, path: '/security', minRole: 'admin' },
      { label: 'Mobile App', icon: Smartphone, path: '/mobile-app' },
      { label: 'Marketing', icon: Megaphone, path: '/marketing', minRole: 'manager' },
      { label: 'Reports', icon: BarChart3, path: '/reports', minRole: 'manager' },
    ],
  },
];

// Role hierarchy for filtering
const roleHierarchy: Record<UserAppRole, number> = {
  admin: 4,
  manager: 3,
  staff: 2,
  guest: 1,
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, userRole } = useAuth();

  // Check if user has access to an item based on role
  const hasAccess = (minRole?: UserAppRole) => {
    if (!minRole) return true;
    if (!userRole) return false;
    return roleHierarchy[userRole] >= roleHierarchy[minRole];
  };

  // Filter nav groups and items based on user role
  const filteredNavGroups = navGroups
    .filter(group => hasAccess(group.minRole))
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasAccess(item.minRole)),
    }))
    .filter(group => group.items.length > 0);
  
  // Track which sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Initialize all sections as open
    const initial: Record<string, boolean> = {};
    navGroups.forEach(group => {
      initial[group.title] = true;
    });
    return initial;
  });

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/auth');
  };

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = isActiveRoute(item.path);
    
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <NavLink
            to={item.path}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              'hover:bg-sidebar-accent/80',
              isActive
                ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            {/* Active indicator */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-accent" />
            )}
            
            <item.icon className={cn(
              'h-5 w-5 flex-shrink-0 transition-transform duration-200',
              isActive && 'scale-110',
              !isActive && 'group-hover:scale-105'
            )} />
            
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="flex items-center gap-2 font-medium">
            {item.label}
            {item.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  const NavSection = ({ group }: { group: NavGroup }) => {
    const isOpen = openSections[group.title];
    const hasActiveItem = group.items.some(item => isActiveRoute(item.path));
    
    if (collapsed) {
      return (
        <div className="space-y-1">
          {group.items.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </div>
      );
    }
    
    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleSection(group.title)}>
        <CollapsibleTrigger asChild>
          <button className={cn(
            'flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
            hasActiveItem ? 'text-sidebar-foreground' : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/70'
          )}>
            <span>{group.title}</span>
            <ChevronDown className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isOpen ? 'rotate-0' : '-rotate-90'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          {group.items.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4 gap-3',
          collapsed && 'justify-center px-2'
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 shadow-lg">
            <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">HotelPro</span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                Management
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-4">
            {filteredNavGroups.map((group) => (
              <NavSection key={group.title} group={group} />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <NavItemComponent item={{ label: 'Settings', icon: Settings, path: '/settings' }} />

          {/* User Email & Logout */}
          {user && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={cn(
                    'w-full text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10',
                    collapsed ? 'justify-center' : 'justify-start gap-3'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && (
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-xs truncate w-full text-left">{user.email}</span>
                      {userRole && (
                        <span className="text-[10px] text-sidebar-foreground/40 capitalize">{userRole}</span>
                      )}
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <div className="text-xs">
                    <p className="font-medium">{user.email}</p>
                    {userRole && <p className="text-muted-foreground capitalize">{userRole}</p>}
                    <p className="text-muted-foreground mt-1">Click to logout</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed ? 'justify-center' : 'justify-start gap-3'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}

// Mobile Sidebar Component
interface MobileSidebarProps {
  onNavigate: () => void;
}

export function MobileSidebar({ onNavigate }: MobileSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, userRole } = useAuth();
  
  // Check if user has access to an item based on role
  const hasAccess = (minRole?: UserAppRole) => {
    if (!minRole) return true;
    if (!userRole) return false;
    return roleHierarchy[userRole] >= roleHierarchy[minRole];
  };

  // Filter nav groups and items based on user role
  const filteredNavGroups = navGroups
    .filter(group => hasAccess(group.minRole))
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasAccess(item.minRole)),
    }))
    .filter(group => group.items.length > 0);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach(group => {
      initial[group.title] = true;
    });
    return initial;
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    onNavigate();
    navigate('/auth');
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const MobileNavItem = ({ item }: { item: NavItem }) => {
    const isActive = isActiveRoute(item.path);
    
    return (
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:bg-sidebar-accent/80',
          isActive
            ? 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground shadow-md'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-accent" />
        )}
        
        <item.icon className={cn(
          'h-5 w-5 flex-shrink-0 transition-transform duration-200',
          isActive && 'scale-110',
          !isActive && 'group-hover:scale-105'
        )} />
        
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5 animate-pulse">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  const MobileNavSection = ({ group }: { group: NavGroup }) => {
    const isOpen = openSections[group.title];
    const hasActiveItem = group.items.some(item => isActiveRoute(item.path));
    
    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleSection(group.title)}>
        <CollapsibleTrigger asChild>
          <button className={cn(
            'flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
            hasActiveItem ? 'text-sidebar-foreground' : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/70'
          )}>
            <span>{group.title}</span>
            <ChevronDown className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isOpen ? 'rotate-0' : '-rotate-90'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          {group.items.map((item) => (
            <MobileNavItem key={item.path} item={item} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 shadow-lg">
          <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight">HotelPro</span>
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Management
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-4">
          {filteredNavGroups.map((group) => (
            <MobileNavSection key={group.title} group={group} />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <MobileNavItem item={{ label: 'Settings', icon: Settings, path: '/settings' }} />
        
        {/* User Email & Logout */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="text-xs truncate w-full text-left">{user.email}</span>
              {userRole && (
                <span className="text-[10px] text-sidebar-foreground/40 capitalize">{userRole}</span>
              )}
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
