import { useWeb3Auth } from "../../app/hooks/useWeb3Auth";
import { useState } from "react";

const LoginButton = () => {
  const { login, logout, user, provider, getWalletAddress } = useWeb3Auth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleGetAddress = async () => {
    if (!provider) return;
    const address = await getWalletAddress();
    setWalletAddress(address ?? null); // Ensure we always pass a string or null
  };
  return (
    <div className="flex flex-col items-center">
      {user ? (
        <>
          <button
            onClick={logout}
            className="bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>
          <button
            onClick={handleGetAddress}
            className="bg-green-500 text-white p-2 rounded mt-2"
          >
            Get Wallet Address
          </button>
          {walletAddress && (
            <p className="mt-2 text-gray-700">Address: {walletAddress}</p>
          )}
        </>
      ) : (
        <button onClick={login} className="bg-blue-500 text-white p-2 rounded">
          Login with Web3Auth
        </button>
      )}
    </div>
  );
};

export default LoginButton;
