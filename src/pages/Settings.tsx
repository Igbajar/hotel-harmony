import { useState } from 'react';
import { useCurrency, currencies, Currency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { currency, baseCurrency, customRates, setBaseCurrency, updateCustomRate, resetRates, lastUpdated } = useCurrency();
  const [editingRates, setEditingRates] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRateChange = (code: string, value: string) => {
    setEditingRates(prev => ({ ...prev, [code]: value }));
  };

  const saveRate = (code: string) => {
    const rate = parseFloat(editingRates[code]);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Invalid rate",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }
    updateCustomRate(code, rate);
    setEditingRates(prev => {
      const updated = { ...prev };
      delete updated[code];
      return updated;
    });
    toast({
      title: "Rate updated",
      description: `${code} rate has been updated to ${rate}`,
    });
  };

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    // Simulate API call to fetch latest rates
    await new Promise(resolve => setTimeout(resolve, 1500));
    resetRates();
    setEditingRates({});
    setIsRefreshing(false);
    toast({
      title: "Rates refreshed",
      description: "Exchange rates have been reset to default values",
    });
  };

  const handleBaseCurrencyChange = (code: string) => {
    const newBase = currencies.find(c => c.code === code);
    if (newBase) {
      setBaseCurrency(newBase);
      toast({
        title: "Base currency updated",
        description: `Base currency is now ${newBase.name} (${newBase.symbol})`,
      });
    }
  };

  const getCurrentRate = (code: string): number => {
    return customRates[code] ?? currencies.find(c => c.code === code)?.rate ?? 1;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configure currency settings and exchange rates
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Base Currency Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Base Currency</CardTitle>
            <CardDescription>
              Select the primary currency for your hotel. All prices will be stored in this currency.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="base-currency">Primary Currency</Label>
              <Select value={baseCurrency.code} onValueChange={handleBaseCurrencyChange}>
                <SelectTrigger id="base-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">{c.symbol}</span>
                        <span>{c.name}</span>
                        <span className="text-muted-foreground">({c.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Currently displaying prices in: <span className="font-semibold text-foreground">{currency.name} ({currency.symbol})</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You can change the display currency from the header dropdown.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rate Refresh */}
        <Card>
          <CardHeader>
            <CardTitle>Exchange Rate Updates</CardTitle>
            <CardDescription>
              Refresh exchange rates or reset to default values.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">
                  {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
                </span>
              </div>
              <Separator />
              <Button 
                onClick={handleRefreshRates} 
                disabled={isRefreshing}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Reset to Default Rates'}
              </Button>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> In production, this would fetch live exchange rates from a financial API.
                Currently using mock default rates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Exchange Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Exchange Rates</CardTitle>
          <CardDescription>
            Set custom exchange rates relative to USD. These rates will be used for price conversions throughout the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currencies.map((c) => {
              const currentRate = getCurrentRate(c.code);
              const isEditing = c.code in editingRates;
              const hasCustomRate = c.code in customRates;

              return (
                <div
                  key={c.code}
                  className={`rounded-lg border p-4 space-y-3 transition-colors ${
                    hasCustomRate ? 'border-primary/50 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-semibold text-primary">{c.symbol}</span>
                      <span className="font-medium">{c.code}</span>
                    </div>
                    {hasCustomRate && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`rate-${c.code}`} className="sr-only">
                        Rate for {c.code}
                      </Label>
                      <Input
                        id={`rate-${c.code}`}
                        type="number"
                        step="0.0001"
                        min="0"
                        value={isEditing ? editingRates[c.code] : currentRate}
                        onChange={(e) => handleRateChange(c.code, e.target.value)}
                        className="font-mono"
                        placeholder="Enter rate"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveRate(c.code)}
                      disabled={!isEditing}
                      variant={isEditing ? "default" : "outline"}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1 USD = {currentRate.toLocaleString()} {c.code}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
