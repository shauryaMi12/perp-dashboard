import { NextResponse } from 'next/server';

const VAULT_ADDR = '0xdfc24b077bc1425ad1dea75bcb6f8158e10df303';

export async function GET() {
  try {
    const res = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'vaultDetails',
        vaultAddress: VAULT_ADDR,
        user: '0x0000000000000000000000000000000000000000'  // Dummy for public data
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'API error');

    // Calc yields from portfolio (simplified % from PnL)
    const portfolio = data.portfolio || {};
    const periods = {
      '24h': calculateYield(portfolio.day?.pnlHistory || [], portfolio.day?.accountValueHistory || []),
      '7d': calculateYield(portfolio.week?.pnlHistory || [], portfolio.week?.accountValueHistory || []),
      '1m': calculateYield(portfolio.month?.pnlHistory || [], portfolio.month?.accountValueHistory || []),
      '3m': calculateYield(portfolio.threeMonth?.pnlHistory || [], portfolio.threeMonth?.accountValueHistory || []),
      '6m': calculateYield(portfolio.sixMonth?.pnlHistory || [], portfolio.sixMonth?.accountValueHistory || []),
      '1y': calculateYield(portfolio.year?.pnlHistory || [], portfolio.year?.accountValueHistory || []),
      'all-time': calculateYield(portfolio.allTime?.pnlHistory || [], portfolio.allTime?.accountValueHistory || []),
    };
    const current = (data.apr || 0) * 100;  // % APR

    return NextResponse.json({ dex: 'Hyperliquid', current, periods, tvl: data.tvl || 0 });
  } catch  {
    return NextResponse.json({ error: 'Failed to fetch Hyperliquid yields' }, { status: 500 });
  }
}

function calculateYield(pnlHistory: [number, string][], valueHistory: [number, string][]) {
  if (pnlHistory.length === 0) return 0;
  const latestPnl = parseFloat(pnlHistory[pnlHistory.length - 1][1]);
  const latestValue = parseFloat(valueHistory[valueHistory.length - 1][1]);
  return (latestPnl / latestValue) * 100;  // Simple % yield
}