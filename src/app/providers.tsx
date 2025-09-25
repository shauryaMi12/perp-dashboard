'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const HYPERLIQUID_RPC = 'https://api.hyperliquid.xyz/rpc';  // Custom RPC

const HYPERLIQUID_TESTNET = {
  id: 31337,
  name: 'Hyperliquid Testnet',
  nativeCurrency: {
    decimals: 6,
    name: 'USDC',  // Placeholder for testnet
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: [HYPERLIQUID_RPC] },
  },
  blockExplorers: {
    default: { name: 'Hyperliquid Explorer', url: 'https://explorer.hyperliquid.xyz' },  // Placeholder
  },
  testnet: true,
} as const;

const config = createConfig({
  chains: [arbitrum, HYPERLIQUID_TESTNET],
  transports: {
    [arbitrum.id]: http(),
    [HYPERLIQUID_TESTNET.id]: http(),  // Fixed: Added [] around key
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}