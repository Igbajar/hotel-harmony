import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useBarDrinks, useBarCategories, useCreateBarDrink } from '@/hooks/useBar';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedDrink {
  name: string;
  category: string;
  description: string;
  reorder_point: number;
  measures: { measure_name: string; measure_ml: number; price: number; stock_deduction: number }[];
  status: 'valid' | 'error';
  error?: string;
}

export function DrinkImportExport() {
  const { data: drinks = [] } = useBarDrinks();
  const { data: categories = [] } = useBarCategories();
  const createDrink = useCreateBarDrink();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [parsedDrinks, setParsedDrinks] = useState<ParsedDrink[]>([]);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    if (drinks.length === 0) {
      toast({ title: 'No drinks to export', description: 'Add some drinks first', variant: 'destructive' });
      return;
    }

    const rows: Record<string, string | number>[] = [];
    for (const drink of drinks) {
      const categoryName = categories.find(c => c.id === drink.category_id)?.name || '';
      if (!drink.measures || drink.measures.length === 0) {
        rows.push({
          Name: drink.name,
          Category: categoryName,
          Description: drink.description || '',
          Reorder_Point: drink.reorder_point,
          Measure_Name: '',
          Measure_ML: '',
          Price: '',
          Stock_Deduction: '',
        });
      } else {
        drink.measures.forEach((m, i) => {
          rows.push({
            Name: i === 0 ? drink.name : '',
            Category: i === 0 ? categoryName : '',
            Description: i === 0 ? (drink.description || '') : '',
            Reorder_Point: i === 0 ? drink.reorder_point : '',
            Measure_Name: m.measure_name,
            Measure_ML: m.measure_ml || '',
            Price: m.price,
            Stock_Deduction: m.stock_deduction,
          });
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drinks');

    // Add a template sheet with instructions
    const instructions = [
      { Instructions: 'How to fill in the import template:' },
      { Instructions: '1. Name, Category are required for each drink' },
      { Instructions: '2. For multiple measures per drink, repeat on next rows with Name/Category blank' },
      { Instructions: '3. Category must match an existing category name exactly' },
      { Instructions: '4. Available categories: ' + categories.map(c => c.name).join(', ') },
      { Instructions: '5. Each measure needs: Measure_Name and Price (required)' },
    ];
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 14 },
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 16 },
    ];

    XLSX.writeFile(wb, `drinks_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast({ title: 'Exported', description: `${drinks.length} drinks exported to Excel` });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        if (rows.length === 0) {
          toast({ title: 'Empty file', description: 'No data found in the spreadsheet', variant: 'destructive' });
          return;
        }

        // Parse rows into drinks with measures
        const parsed: ParsedDrink[] = [];
        let currentDrink: ParsedDrink | null = null;

        for (const row of rows) {
          const name = String(row.Name || row.name || '').trim();
          const category = String(row.Category || row.category || '').trim();
          const measureName = String(row.Measure_Name || row.measure_name || row['Measure Name'] || '').trim();
          const price = parseFloat(row.Price || row.price || 0);

          if (name) {
            // New drink
            if (currentDrink) parsed.push(currentDrink);

            const matchedCategory = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
            const error = !category ? 'Missing category' : !matchedCategory ? `Unknown category: "${category}"` : undefined;

            currentDrink = {
              name,
              category,
              description: String(row.Description || row.description || '').trim(),
              reorder_point: parseInt(row.Reorder_Point || row.reorder_point || row['Reorder Point'] || 5),
              measures: [],
              status: error ? 'error' : 'valid',
              error,
            };

            if (measureName) {
              currentDrink.measures.push({
                measure_name: measureName,
                measure_ml: parseInt(row.Measure_ML || row.measure_ml || row['Measure ML'] || 0),
                price,
                stock_deduction: parseFloat(row.Stock_Deduction || row.stock_deduction || row['Stock Deduction'] || 1),
              });
            }
          } else if (currentDrink && measureName) {
            // Additional measure for current drink
            currentDrink.measures.push({
              measure_name: measureName,
              measure_ml: parseInt(row.Measure_ML || row.measure_ml || row['Measure ML'] || 0),
              price,
              stock_deduction: parseFloat(row.Stock_Deduction || row.stock_deduction || row['Stock Deduction'] || 1),
            });
          }
        }
        if (currentDrink) parsed.push(currentDrink);

        // Mark drinks with no measures as having an error
        parsed.forEach(d => {
          if (d.measures.length === 0 && d.status === 'valid') {
            d.status = 'error';
            d.error = 'No measures/prices defined';
          }
        });

        setParsedDrinks(parsed);
        setPreviewOpen(true);
      } catch {
        toast({ title: 'Parse Error', description: 'Could not read the file. Ensure it is a valid Excel file.', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleImport = async () => {
    const validDrinks = parsedDrinks.filter(d => d.status === 'valid');
    if (validDrinks.length === 0) {
      toast({ title: 'No valid drinks', description: 'Fix errors before importing', variant: 'destructive' });
      return;
    }

    setImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const drink of validDrinks) {
      try {
        const categoryObj = categories.find(c => c.name.toLowerCase() === drink.category.toLowerCase());
        if (!categoryObj) continue;

        await createDrink.mutateAsync({
          name: drink.name,
          category_id: categoryObj.id,
          description: drink.description || undefined,
          reorder_point: drink.reorder_point,
          measures: drink.measures.filter(m => m.measure_name && m.price > 0),
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setImporting(false);
    setPreviewOpen(false);
    setParsedDrinks([]);

    toast({
      title: 'Import Complete',
      description: `${successCount} drinks imported${failCount > 0 ? `, ${failCount} failed` : ''}`,
    });
  };

  const validCount = parsedDrinks.filter(d => d.status === 'valid').length;
  const errorCount = parsedDrinks.filter(d => d.status === 'error').length;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" /> Import
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
        <Download className="h-4 w-4" /> Export
      </Button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Import Preview
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-3 mb-4">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3 text-primary" /> {validCount} valid
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> {errorCount} errors
              </Badge>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Measures</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedDrinks.map((drink, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {drink.status === 'valid' ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{drink.name}</TableCell>
                  <TableCell>{drink.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {drink.measures.map((m, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {m.measure_name}: {m.price}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-destructive">{drink.error || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={importing || validCount === 0} className="gap-2">
              {importing ? 'Importing...' : `Import ${validCount} Drinks`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
