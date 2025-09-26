'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WalletConnectButton } from './WalletConnect';

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
    return <div className="container mx-auto p-4 text-center">Loading dashboard...</div>;
  }

  if (hasError) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error loading data—retry or check console. <button onClick={() => window.location.reload()} className="ml-2 underline">Retry</button></div>;
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Perp DEX Vault Dashboard</h1>
        <div className="mb-6 text-center">
          <WalletConnectButton />
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Yield Filters (Select up to 3 Periods)</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {PERIODS.map(p => (
              <label key={p} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedPeriods.includes(p)} 
                  onChange={() => handleFilterChange(p)}
                  className="mr-2"
                />
                <span className="capitalize text-sm">{p.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full bg-white border-collapse border border-gray-300">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-3 text-left font-semibold">DEX</th>
                <th className="border px-4 py-3 text-left font-semibold">24h Volume</th>
                <th className="border px-4 py-3 text-left font-semibold">Current Yield (%)</th>
                <th className="border px-4 py-3 text-left font-semibold">Yields (%)</th>
                <th className="border px-4 py-3 text-left font-semibold">Assets</th>
                <th className="border px-4 py-3 text-left font-semibold">Invest</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.dex} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-4 py-3 font-medium">{row.dex}</td>
                  <td className="border px-4 py-3">${(row.volume / 1e9).toFixed(1)}B</td>
                  <td className="border px-4 py-3 text-green-600 font-semibold">{row.yields?.current?.toFixed(2) || 'N/A'}</td>
                  <td className="border px-4 py-3">
                    {selectedPeriods.length > 0 ? (
                      <div className="space-y-1">
                        {selectedPeriods.map(p => (
                          <div key={p} className="text-sm">
                            {p.replace('-', ' ')}: {row.yields?.periods?.[p]?.toFixed(2) || 'N/A'}%
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Select periods to view</span>
                    )}
                  </td>
                  <td className="border px-4 py-3 text-sm font-mono">{row.assets}</td>
                  <td className="border px-4 py-3">
                    <button
                      onClick={() => handleInvest(row.url)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-semibold shadow-md transition-colors w-full sm:w-auto"
                    >
                      Invest
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Click &quot;Invest&quot; to be redirected to the official vault/pool site for secure deposits.</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}