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

  const theme = {
    bg: '#000000',
    text: '#f97316',
    muted: '#a1a1aa',
    headerBg: '#111111',
    rowAlt: '#0a0a0a',
    hover: '#1a1a1a',
    border: '#333333',
    buttonBg: '#f97316',
    buttonHover: '#ea580c',
    shadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg, color: theme.text, fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>Loading perp vault yields...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: 'Inter, sans-serif', padding: '2rem', textAlign: 'center' as const }}>
        <div style={{ color: '#ef4444' }}>Error loading vault data—retry or check console.</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: '0.5rem', textDecoration: 'underline', color: theme.text }}>Retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: theme.bg, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1200px', width: '100%' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' as const, padding: '2rem 0', color: theme.text }}>Perp DEX Vault Dashboard</h1>

          <div style={{ backgroundColor: theme.headerBg, border: `1px solid ${theme.border}`, borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'center' as const, color: theme.text }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Yield Filters (Select up to 3 Periods)</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {PERIODS.map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: theme.text }}>
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(p)}
                    onChange={() => handleFilterChange(p)}
                    style={{ marginRight: '0.5rem', width: '1rem', height: '1rem', accentColor: theme.text }}
                  />
                  <span style={{ textTransform: 'capitalize' as const }}>{p.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto', boxShadow: theme.shadow, borderRadius: '0.75rem', border: `1px solid ${theme.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: theme.bg, borderRadius: '0.75rem', overflow: 'hidden' }}>
              <thead style={{ backgroundColor: theme.headerBg, position: 'sticky', top: 0, zIndex: 10 as number }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>DEX</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>24h Volume</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Current Yield (%)</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Selected Yields (%)</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Assets</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>Invest</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.dex} style={{ transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.rowAlt}>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.border}`, verticalAlign: 'middle', fontWeight: 600, color: '#ffffff' }}>{row.dex}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.border}`, verticalAlign: 'middle', color: theme.muted }}>${(row.volume / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.border}`, verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '1rem' }}>{row.yields?.current?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.border}`, verticalAlign: 'middle' }}>
                      {selectedPeriods.length > 0 ? (
                        <div style={{ lineHeight: 1.5 }}>
                          {selectedPeriods.map(p => (
                            <div key={p} style={{ fontSize: '0.875rem', color: theme.text, fontWeight: 600 }}>
                              {p.replace('-', ' ')}: {row.yields?.periods?.[p]?.toFixed(2) || 'N/A'}%
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Select periods</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.border}`, verticalAlign: 'middle', fontSize: '0.875rem', fontFamily: 'monospace', color: theme.muted }}>{row.assets}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${theme.border}`, verticalAlign: 'middle' }}>
                      <button
                        onClick={() => handleInvest(row.url)}
                        style={{
                          backgroundColor: theme.buttonBg,
                          color: '#000000',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          width: '100%',
                          minWidth: '120px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.buttonHover}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.buttonBg}
                      >
                        Invest
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ color: theme.muted, fontSize: '0.875rem', textAlign: 'center' as const, marginTop: '2rem', padding: '1rem', borderTop: `1px solid ${theme.border}` }}>
            <p>Click &quot;Invest&quot; to redirect to official vault for secure deposits in major perp trading apps.</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}