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
    shadow: '0 4px 12px rgba(0, 0, 0, 0.7)'
  };

  const cockpitFont = 'Courier New, monospace';

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
        <div style={{ maxWidth: '800px', width: '100%' }}>
          <div style={{ overflowX: 'auto', boxShadow: theme.shadow, borderRadius: '0.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: theme.bg, borderRadius: '0.25rem', overflow: 'hidden', color: theme.text }}>
              <thead style={{ backgroundColor: theme.headerBg }}>
                <tr>
                  <th colSpan={1} rowSpan={2} style={{ padding: '0.25rem 0.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' as const, color: theme.text }}>DEX ↗</th> {/* Inline header hint */}
                  <th colSpan={1} rowSpan={2} style={{ padding: '0.25rem 0.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' as const, color: theme.text }}>24h Vol</th>
                  <th colSpan={6} style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' as const, color: theme.text }}>Yield</th>
                </tr>
                <tr>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.625rem', color: theme.text }}>24h</th>
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
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', fontWeight: 600, color: theme.text, whiteSpace: 'nowrap' as const }}>
                      {row.dex}
                      <button
                        onClick={() => handleArrowClick(row.url)}
                        style={{
                          backgroundColor: 'transparent',
                          color: theme.text,
                          border: 'none',
                          width: '1rem',
                          height: '1rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '0.25rem',
                          verticalAlign: 'middle'
                        }}
                      >
                        ↗
                      </button>
                    </td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text }}>${(row.volume / 1e9).toFixed(1)}B</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['24h']?.toFixed(2) || 'N/A'}</td> {/* 24h Yield fixed */}
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['7d']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['1m']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['3m']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['6m']?.toFixed(2) || 'N/A'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.75rem' }}>{row.yields?.periods?.['1y']?.toFixed(2) || 'N/A'}</td>
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