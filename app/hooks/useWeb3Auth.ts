import { useState, useEffect } from "react";
import { Web3Auth } from "@web3auth/modal";
import { initWeb3Auth } from "../lib/web3auth"; // Import your Web3Auth setup
import { BrowserProvider } from "ethers"; // ✅ Correct import for Ethers v6

export const useWeb3Auth = () => {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null); // ✅ Use BrowserProvider
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = await initWeb3Auth();
        setWeb3auth(web3authInstance);
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
      }
    };
    init();
  }, []);

  const login = async () => {
    if (!web3auth) return;
    try {
      const userInfo = await web3auth.connect();
      setUser(userInfo);

      // ✅ Use BrowserProvider instead of Web3Provider
      const web3Provider = new BrowserProvider(web3auth.provider as any);
      setProvider(web3Provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) return;
    try {
      await web3auth.logout();
      setUser(null);
      setProvider(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getWalletAddress = async (): Promise<string | null> => {
    if (!provider) return null; // Ensure we return null if provider is not available
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log("Wallet Address:", address);
      return address;
    } catch (error) {
      console.error("Failed to get wallet address:", error);
      return null;
    }
  };

  return { web3auth, provider, user, login, logout, getWalletAddress };
};
