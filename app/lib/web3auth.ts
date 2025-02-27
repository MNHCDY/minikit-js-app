import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { BrowserProvider } from "ethers"; // ✅ Correct import for Ethers v6

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || ""; // Ensure it's always a string

export const initWeb3Auth = async () => {
  if (!clientId) {
    throw new Error("Web3Auth Client ID is missing! Check your .env file.");
  }

  // asd
  // ✅ Create a private key provider (WITH required arguments)
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: {
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155, // Ethereum-based chains
        chainId: "0x1", // Ethereum Mainnet
        rpcTarget:
          "https://mainnet.infura.io/v3/a6f0ddebcc1743b697e496f094c7e15c", // Replace with your Infura RPC
      },
    },
  });

  const web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: "sapphire_devnet", // Use "mainnet" when deploying to production
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x1",
      rpcTarget:
        "https://mainnet.infura.io/v3/a6f0ddebcc1743b697e496f094c7e15c",
    },
    privateKeyProvider, // ✅ Now correctly initialized
  });

  await web3auth.initModal();
  return web3auth;
};

export const getWalletAddress = async (web3auth: Web3Auth) => {
  if (!web3auth || !web3auth.provider) return null;

  const provider = new BrowserProvider(web3auth.provider);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  console.log("Wallet Address:", address);
  return address;
};
