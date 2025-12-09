import { createContext, useContext, useState, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Default exchange rate relative to USD
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1550 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.67 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.50 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rate: 15.50 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
];

interface CurrencyContextType {
  currency: Currency;
  baseCurrency: Currency;
  customRates: Record<string, number>;
  lastUpdated: string | null;
  setCurrency: (currency: Currency) => void;
  setBaseCurrency: (currency: Currency) => void;
  updateCustomRate: (code: string, rate: number) => void;
  resetRates: () => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  getRate: (code: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Display currency
  const [baseCurrency, setBaseCurrency] = useState<Currency>(currencies[0]); // Base currency (USD default)
  const [customRates, setCustomRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const getRate = (code: string): number => {
    // Return custom rate if set, otherwise default rate
    if (customRates[code] !== undefined) {
      return customRates[code];
    }
    return currencies.find(c => c.code === code)?.rate ?? 1;
  };

  const updateCustomRate = (code: string, rate: number) => {
    setCustomRates(prev => ({ ...prev, [code]: rate }));
    setLastUpdated(new Date().toISOString());
  };

  const resetRates = () => {
    setCustomRates({});
    setLastUpdated(new Date().toISOString());
  };

  const convertPrice = (amountInUSD: number): number => {
    const rate = getRate(currency.code);
    return amountInUSD * rate;
  };

  const formatPrice = (amountInUSD: number): string => {
    const converted = convertPrice(amountInUSD);
    
    // Format based on currency
    if (currency.code === 'NGN' || currency.code === 'GHS' || currency.code === 'ZAR') {
      // For currencies with large values, no decimals
      return `${currency.symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    
    return `${currency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      baseCurrency,
      customRates,
      lastUpdated,
      setCurrency, 
      setBaseCurrency,
      updateCustomRate,
      resetRates,
      formatPrice, 
      convertPrice,
      getRate
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
