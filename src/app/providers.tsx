'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const HYPERLIQUID_RPC = 'https://rpc.hyperliquid.xyz';  // Valid HyperEVM mainnet RPC

const HYPERLIQUID_MAINNET = {
  id: 999,
  name: 'Hyperliquid Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: [HYPERLIQUID_RPC] },
  },
  blockExplorers: {
    default: { name: 'Hyperliquid Explorer', url: 'https://explorer.hyperliquid.xyz' },
  },
} as const;

const config = createConfig({
  chains: [arbitrum, HYPERLIQUID_MAINNET],
  transports: {
    [arbitrum.id]: http(),
    [HYPERLIQUID_MAINNET.id]: http(),  // Key is number 999 via .id
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