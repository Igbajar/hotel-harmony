import { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Rooms', icon: BedDouble, path: '/rooms' },
  { label: 'Reservations', icon: CalendarDays, path: '/reservations', badge: 4 },
  { label: 'Guests', icon: Users, path: '/guests' },
  { label: 'Billing', icon: Receipt, path: '/billing' },
];

const operationsItems: NavItem[] = [
  { label: 'Housekeeping', icon: ClipboardList, path: '/housekeeping' },
  { label: 'Restaurant', icon: Utensils, path: '/restaurant' },
  { label: 'Room Service', icon: ConciergeBell, path: '/room-service' },
  { label: 'Events', icon: Calendar, path: '/events' },
];

const managementItems: NavItem[] = [
  { label: 'Staff', icon: UserCog, path: '/staff' },
  { label: 'Online Booking', icon: Globe, path: '/online-booking' },
  { label: 'Security', icon: Shield, path: '/security' },
  { label: 'Mobile App', icon: Smartphone, path: '/mobile-app' },
  { label: 'Marketing', icon: Megaphone, path: '/marketing' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50 mb-2">
          {title}
        </p>
      )}
      {items.map((item) => (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                    : 'text-sidebar-foreground/80',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'h-5 w-5')} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground px-1.5">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.label}
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground px-1.5">
                  {item.badge}
                </span>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      ))}
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          collapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-sidebar-foreground">HotelPro</span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                Management
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          <NavSection title="Main" items={mainNavItems} />
          <NavSection title="Operations" items={operationsItems} />
          <NavSection title="Management" items={managementItems} />
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/80',
                    collapsed && 'justify-center px-2'
                  )
                }
              >
                <Settings className="h-5 w-5" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>

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
