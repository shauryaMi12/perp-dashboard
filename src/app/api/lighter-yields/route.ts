import { NextResponse } from 'next/server';

export async function GET() {
  // Mock for Lighter (expand with subgraph/contract query later)
  const mockPeriods = { '24h': 12.5, '7d': 8.2, '1m': 15.3, '3m': 45.0, '6m': 89.2, '1y': 200.5, 'all-time': 450.1 };
  const current = 10.2;  // Example APR

  return NextResponse.json({ dex: 'Lighter', current, periods: mockPeriods, tvl: 5000000 });
}