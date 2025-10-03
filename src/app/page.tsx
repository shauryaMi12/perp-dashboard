'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const PERIODS = ['24h', '7d', '1m', '3m', '6m', '1y', 'all-time'] as const;
type Period = typeof PERIODS[number];

const VAULT_URLS = {
  Hyperliquid: 'https://app.hyperliquid.xyz/vaults/0xdfc24b077bc1425ad1dea75bcb6f8158e10df303',
  Lighter: 'https://app.lighter.xyz/public-pools/281474976710654'
} as const;

const SUPPORTED_ASSETS = {
  Hyperliquid: 'USDC',
  Lighter: 'USDC'
} as const;

export default function Dashboard() {
  const [selectedPeriods, setSelectedPeriods] = useState<Period[]>(['24h', '7d', '1m']);

  const { data: volumes, isLoading: volumesLoading, error: volumesError } = useQuery({
    queryKey: ['volumes'],
    queryFn: () => fetch('/api/volumes').then(res => res.json())
  });
  const { data: hlYields, isLoading: hlLoading, error: hlError } = useQuery({
    queryKey: ['hlYields'],
    queryFn: () => fetch('/api/yields').then(res => res.json())
  });
  const { data: lighterYields, isLoading: lighterLoading, error: lighterError } = useQuery({
    queryKey: ['lighterYields'],
    queryFn: () => fetch('/api/lighter-yields').then(res => res.json())
  });

  const isLoading = volumesLoading || hlLoading || lighterLoading;
  const hasError = volumesError || hlError || lighterError;

  interface VolumeData {
    dex: string;
    volume: number;
  }

  interface YieldsData {
    dex: string;
    current: number;
    periods: Record<string, number>;
    tvl: number;
  }

  const rows: {
    dex: string;
    volume: number;
    yields: YieldsData | undefined;
    assets: string;
    url: string;
  }[] = [
      {
        dex: 'Hyperliquid',
        volume: volumes?.find((v: VolumeData) => v.dex === 'Hyperliquid')?.volume || 0,
        yields: hlYields,
        assets: SUPPORTED_ASSETS.Hyperliquid,
        url: VAULT_URLS.Hyperliquid
      },
      {
        dex: 'Lighter',
        volume: volumes?.find((v: VolumeData) => v.dex === 'Lighter')?.volume || 0,
        yields: lighterYields,
        assets: SUPPORTED_ASSETS.Lighter,
        url: VAULT_URLS.Lighter
      }
    ];

  const handleFilterChange = (period: Period) => {
    setSelectedPeriods(prev =>
      prev.includes(period)
        ? prev.filter(p => p !== period)
        : [...prev.slice(0, 2), period].slice(0, 3)
    );
  };

  const handleInvest = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading perp vault yields...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="text-red-400">Error loading vault data—retry or check console.</div>
        <button onClick={() => window.location.reload()} className="mt-2 underline">Retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center py-8">Perp DEX Vault Dashboard</h1>

          <div className="filter-panel mb-8">
            <h2 className="text-xl font-semibold mb-4">Yield Filters (Select up to 3 Periods)</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {PERIODS.map(p => (
                <label key={p} className="flex items-center cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(p)}
                    onChange={() => handleFilterChange(p)}
                    className="mr-2 w-4 h-4 text-orange-500"
                  />
                  <span className="capitalize">{p.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table><thead><tr><th>DEX</th><th>24h Volume</th><th>Current Yield (%)</th><th>Selected Yields (%)</th><th>Assets</th><th>Invest</th></tr></thead><tbody>{rows.map((row, index) => (<tr key={row.dex}><td className="font-semibold text-white">{row.dex}</td><td>${(row.volume / 1e9).toFixed(1)}B</td><td className="yield-cell">{row.yields?.current?.toFixed(2) || 'N/A'}</td><td>{selectedPeriods.length > 0 ? (<div className="space-y-1">{selectedPeriods.map(p => (<div key={p} className="text-sm yield-cell">{p.replace('-', ' ')}: {row.yields?.periods?.[p]?.toFixed(2) || 'N/A'}%</div>))}</div>) : (<span className="text-gray-500">Select periods</span>)}</td><td className="font-mono text-sm">{row.assets}</td><td><button onClick={() => handleInvest(row.url)}>Invest</button></td></tr>))}</tbody></table>
          </div>

          <div className="footer-note">
            <p>Click "Invest" to redirect to official vault for secure deposits in major perp trading apps.</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}