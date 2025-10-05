'use client';
import { useQuery } from '@tanstack/react-query';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

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
    text: '#00ff41', // Neon green like infographics
    muted: '#00cc33',
    headerBg: '#0a0a0a',
    rowAlt: '#000000',
    hover: '#001a00',
    shadow: '0 2px 8px rgba(0, 255, 65, 0.3)', // Green glow
    boxShadow: 'inset 0 0 5px rgba(0, 255, 65, 0.2)'
  };

  const hudFont = 'Courier New, monospace'; // Pixel-retro like maps

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg, color: theme.text, fontFamily: hudFont, padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' as const }}>
        loading yields...
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: hudFont, padding: '1rem', textAlign: 'center' as const, fontSize: '0.75rem', textTransform: 'uppercase' as const }}>
        <div style={{ color: '#ff4444' }}>error—retry.</div>
        <button onClick={() => window.location.reload()} style={{ textDecoration: 'underline', color: theme.text }}>retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', backgroundColor: theme.bg, color: theme.text, fontFamily: hudFont, fontSize: '0.7rem', textTransform: 'uppercase' as const }}>
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <div style={{ overflowX: 'auto', boxShadow: theme.shadow, borderRadius: '0.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: theme.bg, borderRadius: '0.25rem', overflow: 'hidden' }}>
              <thead style={{ backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>
                <tr>
                  <th colSpan={1} rowSpan={2} style={{ padding: '0.25rem 0.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.7rem', color: theme.text }}>dex ↗</th>
                  <th colSpan={1} rowSpan={2} style={{ padding: '0.25rem 0.5rem', textAlign: 'left' as const, fontWeight: 700, fontSize: '0.7rem', color: theme.text }}>24h vol</th>
                  <th colSpan={6} style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.7rem', color: theme.text }}>yield</th>
                </tr>
                <tr>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.6rem', color: theme.text }}>24h</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.6rem', color: theme.text }}>7d ma</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.6rem', color: theme.text }}>1m ma</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.6rem', color: theme.text }}>3m ma</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.6rem', color: theme.text }}>6m ma</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' as const, fontWeight: 700, fontSize: '0.6rem', color: theme.text }}>1y ma</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.dex} style={{ transition: 'background 0.2s ease', backgroundColor: i % 2 === 0 ? theme.bg : theme.rowAlt }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? theme.bg : theme.rowAlt}>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', fontWeight: 700, color: theme.text, whiteSpace: 'nowrap' as const, backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>
                      {row.dex}
                      <button
                        onClick={() => handleArrowClick(row.url)}
                        style={{
                          backgroundColor: theme.text,
                          color: theme.bg,
                          border: 'none',
                          width: '0.8rem',
                          height: '0.8rem',
                          fontSize: '0.6rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '0.25rem',
                          borderRadius: '0.125rem',
                          boxShadow: theme.shadow
                        }}
                      >
                        ↗
                      </button>
                    </td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.muted, backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>${(row.volume / 1e9).toFixed(1)}b</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.7rem', backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>{row.yields?.periods?.['24h']?.toFixed(2) || 'n/a'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.7rem', backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>{row.yields?.periods?.['7d']?.toFixed(2) || 'n/a'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.7rem', backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>{row.yields?.periods?.['1m']?.toFixed(2) || 'n/a'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.7rem', backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>{row.yields?.periods?.['3m']?.toFixed(2) || 'n/a'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.7rem', backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>{row.yields?.periods?.['6m']?.toFixed(2) || 'n/a'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle', color: theme.text, fontWeight: 600, fontSize: '0.7rem', backgroundColor: theme.headerBg, boxShadow: theme.boxShadow }}>{row.yields?.periods?.['1y']?.toFixed(2) || 'n/a'}</td>
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