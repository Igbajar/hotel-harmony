import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const moduleInfo: Record<string, { title: string; description: string }> = {
  '/billing': { title: 'Billing & Payments', description: 'Manage invoices, payments, and financial transactions' },
  '/housekeeping': { title: 'Housekeeping', description: 'Manage room cleaning tasks and staff assignments' },
  '/restaurant': { title: 'Restaurant & Bar', description: 'Manage menu, orders, and table reservations' },
  '/room-service': { title: 'Room Service', description: 'Handle room service orders and deliveries' },
  '/events': { title: 'Events & Conferences', description: 'Manage event hall bookings and conferences' },
  '/staff': { title: 'Staff Management', description: 'Manage employees, schedules, and performance' },
  '/online-booking': { title: 'Online Booking', description: 'Configure online reservations and channel management' },
  '/security': { title: 'Security & Access', description: 'Manage user permissions and activity logs' },
  '/mobile-app': { title: 'Mobile App', description: 'Configure mobile app settings for staff and guests' },
  '/marketing': { title: 'Marketing & Promotions', description: 'Manage campaigns, discounts, and promotions' },
  '/reports': { title: 'Analytics & Reports', description: 'View detailed reports and business analytics' },
  '/settings': { title: 'Settings', description: 'Configure system preferences and integrations' },
};

export default function ComingSoon() {
  const location = useLocation();
  const info = moduleInfo[location.pathname] || { 
    title: 'Coming Soon', 
    description: 'This feature is under development' 
  };

  return (
    <div className="min-h-screen">
      <Header title={info.title} subtitle={info.description} />

      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-md w-full text-center animate-fade-in">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Construction className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">{info.title}</CardTitle>
            <CardDescription className="text-base">
              {info.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This module is currently under development. We're working hard to bring you the best hotel management experience.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
