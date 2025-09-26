import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Hyperliquid volume from CoinGecko
    const hlRes = await fetch('https://api.coingecko.com/api/v3/exchanges/hyperliquid/volume_chart?days=1');
    const hlData = await hlRes.json();
    const hlVolume = hlData[0]?.total_volume || 10500000000;  // Fallback $10.5B

    // Lighter mock (expand with search)
    const lighterVolume = 6180000000;  // Example $6.18B

    return NextResponse.json([
      { dex: 'Hyperliquid', volume: hlVolume },
      { dex: 'Lighter', volume: lighterVolume }
    ]);
  } catch (err) {
    console.error('Volumes API error:', err);
    // Fallback
    return NextResponse.json([
      { dex: 'Hyperliquid', volume: 10500000000 },
      { dex: 'Lighter', volume: 6180000000 }
    ]);
  }
}