import { NextResponse } from 'next/server';

const VAULT_ADDR = '0xdfc24b077bc1425ad1dea75bcb6f8158e10df303';

interface HistoryEntry {
  0: number; // timestamp
  1: string; // value (PnL or account)
}

interface PortfolioData {
  pnlHistory: HistoryEntry[];
  accountValueHistory: HistoryEntry[];
}

interface PortfolioItem {
  0: string; // period key (e.g., 'day')
  1: PortfolioData;
}

interface ApiResponse {
  portfolio: PortfolioItem[];
  apr: number;
}

interface ApiError {
  msg: string;
}

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
    const data = await res.json() as ApiResponse | ApiError;
    if (!res.ok) throw new Error((data as ApiError).msg || 'API error');

    // Narrow to ApiResponse (since !res.ok already thrown if ApiError)
    const apiData = data as ApiResponse;

    // Derive TVL from latest allTime account value
    const allTimePortfolio = apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'allTime')?.[1];
    const latestAccountValue = allTimePortfolio?.accountValueHistory?.slice(-1)[0]?.[1] || '0';
    const tvl = parseFloat(latestAccountValue) || 0;

    const currentAprPct = (apiData.apr || 0) * 100;  // Annualized APR %

    // Calc raw yields, then annualize
    const periods = {
      '24h': annualizeYield(calculateRawYield(apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'day')?.[1] || {} as PortfolioData, currentAprPct, 1), 1),
      '7d': annualizeYield(calculateRawYield(apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'week')?.[1] || {} as PortfolioData, currentAprPct, 7), 7),
      '1m': annualizeYield(calculateRawYield(apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'month')?.[1] || {} as PortfolioData, currentAprPct, 30), 30),
      '3m': annualizeYield(calculateRawYield(apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'threeMonth')?.[1] || {} as PortfolioData, currentAprPct, 90), 90),
      '6m': annualizeYield(calculateRawYield(apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'sixMonth')?.[1] || {} as PortfolioData, currentAprPct, 182), 182),
      '1y': annualizeYield(calculateRawYield(apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'year')?.[1] || {} as PortfolioData, currentAprPct, 365), 365),
      'all-time': annualizeYield(calculateRawYield(apiData.portfolio?.find((p: PortfolioItem) => p[0] === 'allTime')?.[1] || {} as PortfolioData, currentAprPct, 365), 365),  // Treat all-time as annual equiv
    };

    return NextResponse.json({ dex: 'Hyperliquid', current: currentAprPct, periods, tvl });
  } catch (err) {
    console.error('Yields API error:', err);
    // Fallback: prorated from sample APR
    const fallbackApr = 7.29;
    const fallbackPeriods = {
      '24h': fallbackApr / 365,
      '7d': fallbackApr / 52,
      '1m': fallbackApr / 12,
      '3m': fallbackApr / 4,
      '6m': fallbackApr / 2,
      '1y': fallbackApr,
      'all-time': fallbackApr,
    };
    return NextResponse.json({
      dex: 'Hyperliquid',
      current: fallbackApr,
      periods: fallbackPeriods,
      tvl: 329265
    });
  }
}

// Raw yield % for period (PnL / value * 100)
function calculateRawYield(portfolioPeriod: PortfolioData, currentAprPct: number, daysInPeriod: number): number {
  const pnlHistory = portfolioPeriod.pnlHistory || [];
  const valueHistory = portfolioPeriod.accountValueHistory || [];
  if (pnlHistory.length === 0 || valueHistory.length === 0) {
    // Prorate current APR for this period
    return currentAprPct * (daysInPeriod / 365);
  }
  const latestPnl = parseFloat(pnlHistory[pnlHistory.length - 1][1]);
  const latestValue = parseFloat(valueHistory[valueHistory.length - 1][1]);
  let rawYield = (latestPnl / latestValue) * 100;
  if (rawYield === 0) {
    // Prorate if flat
    rawYield = currentAprPct * (daysInPeriod / 365);
  }
  return rawYield;
}

// Annualize raw period yield: raw * (365 / days_in_period)
function annualizeYield(rawYield: number, daysInPeriod: number): number {
  return rawYield * (365 / daysInPeriod);
}