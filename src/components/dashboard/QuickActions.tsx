import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CalendarPlus, 
  UserPlus, 
  BedDouble,
  FileText
} from 'lucide-react';
import { AddRoomDialog } from '@/components/dialogs/AddRoomDialog';
import { AddGuestDialog } from '@/components/dialogs/AddGuestDialog';
import { NewReservationDialog } from '@/components/dialogs/NewReservationDialog';
import { NewInvoiceDialog } from '@/components/dialogs/NewInvoiceDialog';

const actions = [
  { label: 'Add Room', icon: BedDouble, color: 'bg-[hsl(var(--chart-4))]', dialog: 'room' },
  { label: 'New Reservation', icon: CalendarPlus, color: 'bg-[hsl(var(--chart-1))]', dialog: 'reservation' },
  { label: 'Add Guest', icon: UserPlus, color: 'bg-[hsl(var(--chart-3))]', dialog: 'guest' },
  { label: 'New Invoice', icon: FileText, color: 'bg-[hsl(var(--chart-2))]', dialog: 'invoice' },
];

export function QuickActions() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Common tasks</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col gap-2 py-4 hover:bg-secondary/80"
              onClick={() => setOpenDialog(action.dialog)}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <AddRoomDialog open={openDialog === 'room'} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <AddGuestDialog open={openDialog === 'guest'} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <NewReservationDialog open={openDialog === 'reservation'} onOpenChange={(open) => !open && setOpenDialog(null)} />
      <NewInvoiceDialog open={openDialog === 'invoice'} onOpenChange={(open) => !open && setOpenDialog(null)} />
    </>
  );
}
