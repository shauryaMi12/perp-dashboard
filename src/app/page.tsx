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
    url: string;
  }[] = [
      {
        dex: 'Hyperliquid',
        volume: volumes?.find((v: VolumeData) => v.dex === 'Hyperliquid')?.volume || 0,
        yields: hlYields,
        url: VAULT_URLS.Hyperliquid
      },
      {
        dex: 'Lighter',
        volume: volumes?.find((v: VolumeData) => v.dex === 'Lighter')?.volume || 0,
        yields: lighterYields,
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

  const handleArrowClick = (url: string) => {
    window.open(url, '_blank');
  };

  const theme = {
    bg: '#000000',
    text: '#f97316',
    muted: '#a1a1aa',
    headerBg: '#111111',
    rowAlt: '#0a0a0a',
    hover: '#1a1a1a',
    buttonBg: '#f97316',
    buttonHover: '#ea580c',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.7)' // Subtle cockpit glow
  };

  const cockpitFont = 'Courier New, monospace'; // Pixel-retro feel

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg, color: theme.text, fontFamily: cockpitFont, padding: '1rem', fontSize: '0.75rem' }}>
        Loading yields...
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: cockpitFont, padding: '1rem', textAlign: 'center' as const, fontSize: '0.75rem' }}>
        <div style={{ color: '#ef4444' }}>Error—retry.</div>
        <button onClick={() => window.location.reload()} style={{ textDecoration: 'underline', color: theme.text }}>Retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', backgroundColor: theme.bg, color: theme.text, fontFamily: cockpitFont, fontSize: '0.75rem' }}>
        <div style={{ maxWidth: '800px', width: '100%' }}> {/* Compact width */}
          <div style={{ backgroundColor: theme.headerBg, borderRadius: '0.25rem', padding: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' as const, color: theme.text, boxShadow: theme.shadow }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Filters (up to 3)</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.25rem' }}>
              {PERIODS.map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: theme.text, fontSize: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(p)}
                    onChange={() => handleFilterChange(p)}
                    style={{ marginRight: '0.25rem', width: '0.75rem', height: '0.75rem', accentColor: theme.text }}
                  />
                  <span style={{ textTransform: 'capitalize' as const }}>{p.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto', boxShadow: theme.shadow, borderRadius: '0.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: theme.bg, borderRadius: '0.25rem', overflow: 'hidden', color: theme.text }}>
              <thead style={{ backgroundColor: theme.headerBg }}>
                <tr>
                  <th colSpan={1} rowSpan={2} style={{ padding: '0.25rem 0.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' as const, color: theme.text }}>DEX</th>
                  <th colSpan={1} rowSpan={2} style={{ padding: '0.25rem 0.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' as const, color: theme.text }}>24h Vol</th>
                  <th colSpan={5} style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' as const, color: theme.text }}>Yield</th>
                  <th colSpan={1} rowSpan={2} style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' as const, color: theme.text }}>↖</th>
                </tr>
                <tr>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.625rem', color: theme.text }}>7d MA</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.625rem', color: theme.text }}>1m MA</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.625rem', color: theme.text }}>3m MA</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.625rem', color: theme.text }}>6m MA</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.625rem', color: theme.text }}>1y MA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.dex} style={{ transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.rowAlt}>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', fontWeight: 600, color: theme.text }}>{row.dex}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text }}>${(row.volume / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['24h']?.toFixed(2) || 'N/A'}</td> {/* 24h Yield */}
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['7d']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['1m']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['3m']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['6m']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['1y']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', textAlign: 'center' as const }}>
                      <button
                        onClick={() => handleArrowClick(row.url)}
                        style={{
                          backgroundColor: 'transparent',
                          color: theme.text,
                          border: 'none',
                          width: '1.5rem',
                          height: '1.5rem',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0.25rem'
                        }}
                      >
                        ↖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}