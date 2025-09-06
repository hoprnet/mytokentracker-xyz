import './App.css';
import './civic.css';
import React from "react";
import Portfolio from './Portfolio';
import Logs from './Logs'

// Civic
import { embeddedWallet } from "@civic/auth-web3/wagmi";
import { CivicAuthProvider, UserButton } from "@civic/auth-web3/react";

// Web3
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet } from "viem/chains";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";

const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
      [mainnet.id]: http()
  },
  connectors: [
    embeddedWallet(),
  ],
});
const queryClient = new QueryClient();

function App() {
  const clientId = import.meta.env.VITE_CIVIC_CLIENT_ID;

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider
          clientId={clientId}
        >
          <div className="App">
            <Portfolio/>
            <Logs/>
          </div>
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
