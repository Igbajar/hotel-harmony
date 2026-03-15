import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Database, Loader2, CheckCircle2, AlertTriangle, HardDrive } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BACKUP_TABLES = [
  { key: 'rooms', label: 'Rooms', description: 'Room inventory and configurations' },
  { key: 'guests', label: 'Guests', description: 'Guest profiles and contact info' },
  { key: 'reservations', label: 'Reservations', description: 'Booking records' },
  { key: 'invoices', label: 'Invoices', description: 'Billing records' },
  { key: 'invoice_items', label: 'Invoice Items', description: 'Line items for invoices' },
  { key: 'staff', label: 'Staff', description: 'Employee records' },
  { key: 'menu_items', label: 'Menu Items', description: 'Restaurant menu' },
  { key: 'bar_categories', label: 'Bar Categories', description: 'Drink categories' },
  { key: 'bar_drinks', label: 'Bar Drinks', description: 'Drink catalog' },
  { key: 'bar_drink_measures', label: 'Drink Measures', description: 'Serving sizes and prices' },
  { key: 'bar_inventory', label: 'Bar Inventory', description: 'Stock levels' },
  { key: 'bar_orders', label: 'Bar Orders', description: 'Bar order history' },
  { key: 'bar_order_items', label: 'Bar Order Items', description: 'Bar order line items' },
  { key: 'vendors', label: 'Vendors', description: 'Supplier directory' },
  { key: 'campaigns', label: 'Campaigns', description: 'Marketing campaigns' },
  { key: 'promotions', label: 'Promotions', description: 'Discount codes and offers' },
  { key: 'housekeeping_staff', label: 'Housekeeping Staff', description: 'Housekeeping team' },
  { key: 'housekeeping_tasks', label: 'Housekeeping Tasks', description: 'Cleaning schedules' },
  { key: 'site_settings', label: 'Site Settings', description: 'Branding and configuration' },
  { key: 'activity_logs', label: 'Activity Logs', description: 'Audit trail' },
] as const;

type TableKey = typeof BACKUP_TABLES[number]['key'];

export default function BackupRestore() {
  const [selectedTables, setSelectedTables] = useState<Set<TableKey>>(new Set(BACKUP_TABLES.map(t => t.key)));
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const toggleTable = (key: TableKey) => {
    setSelectedTables(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelectedTables(new Set(BACKUP_TABLES.map(t => t.key)));
  const selectNone = () => setSelectedTables(new Set());

  const handleExport = async () => {
    if (selectedTables.size === 0) {
      toast({ title: 'No tables selected', description: 'Please select at least one table to export.', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    try {
      const backup: Record<string, any[]> = {};
      const errors: string[] = [];

      for (const key of selectedTables) {
        const { data, error } = await (supabase.from(key as any).select('*') as any);
        if (error) {
          errors.push(`${key}: ${error.message}`);
        } else {
          backup[key] = data || [];
        }
      }

      const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        tables: backup,
        table_count: Object.keys(backup).length,
        total_records: Object.values(backup).reduce((sum, arr) => sum + arr.length, 0),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hotelpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toISOString());
      toast({
        title: 'Backup complete',
        description: `Exported ${exportData.total_records} records from ${exportData.table_count} tables.${errors.length ? ` (${errors.length} errors)` : ''}`,
      });
    } catch (err) {
      toast({ title: 'Export failed', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.version || !data.tables) {
          toast({ title: 'Invalid backup file', description: 'The selected file is not a valid HotelPro backup.', variant: 'destructive' });
          setIsImporting(false);
          return;
        }

        let imported = 0;
        let errors = 0;

        for (const [table, rows] of Object.entries(data.tables)) {
          if (!selectedTables.has(table as TableKey)) continue;
          if (!Array.isArray(rows) || rows.length === 0) continue;

          const { error } = await (supabase.from(table as any).upsert(rows as any[], { onConflict: 'id' }) as any);
          if (error) {
            console.error(`Import error for ${table}:`, error);
            errors++;
          } else {
            imported += (rows as any[]).length;
          }
        }

        toast({
          title: 'Import complete',
          description: `Restored ${imported} records.${errors > 0 ? ` ${errors} table(s) had errors.` : ''}`,
        });
      } catch {
        toast({ title: 'Import failed', description: 'Could not parse the backup file.', variant: 'destructive' });
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <HardDrive className="h-8 w-8 text-primary" />
          Backup & Restore
        </h1>
        <p className="mt-1 text-muted-foreground">
          Export and import your hotel data for safekeeping or migration.
        </p>
      </div>

      {/* Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{BACKUP_TABLES.length}</p>
                <p className="text-sm text-muted-foreground">Available Tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{selectedTables.size}</p>
                <p className="text-sm text-muted-foreground">Selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'}</p>
                <p className="text-sm text-muted-foreground">Last Backup</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Tables</CardTitle>
              <CardDescription>Choose which data tables to include in the backup or restore.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="outline" size="sm" onClick={selectNone}>Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BACKUP_TABLES.map(table => (
              <label
                key={table.key}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedTables.has(table.key) ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={selectedTables.has(table.key)}
                  onCheckedChange={() => toggleTable(table.key)}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm">{table.label}</p>
                  <p className="text-xs text-muted-foreground">{table.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Export your data as a JSON file or restore from a previous backup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Export Backup</h3>
              </div>
              <p className="text-sm text-muted-foreground">Download selected tables as a JSON file.</p>
              <Button onClick={handleExport} disabled={isExporting || selectedTables.size === 0} className="w-full">
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {isExporting ? 'Exporting...' : 'Export Selected'}
              </Button>
            </div>

            <Separator orientation="vertical" className="hidden sm:block" />
            <Separator className="sm:hidden" />

            <div className="flex-1 rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Restore from Backup</h3>
                <Badge variant="outline" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Caution
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Upload a backup file to restore data. Existing records with matching IDs will be overwritten.</p>
              <Button variant="outline" onClick={handleImport} disabled={isImporting || selectedTables.size === 0} className="w-full">
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isImporting ? 'Importing...' : 'Import Backup File'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
