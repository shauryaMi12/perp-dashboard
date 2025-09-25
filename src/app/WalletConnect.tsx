'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from '@wagmi/connectors';  // Updated import for v2

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();  // No connector in options
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button 
        onClick={() => disconnect()} 
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Disconnect {address?.slice(0,6)}...
      </button>
    );
  }
  return (
    <button 
      onClick={() => connect({ connector: injected() })}  // Pass connector here for v2
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
    >
      Connect Wallet
    </button>
  );
}