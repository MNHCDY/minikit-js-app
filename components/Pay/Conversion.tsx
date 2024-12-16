import { ethers } from "ethers";
import { ChainId, Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Pair } from "@uniswap/v2-sdk";

// Define Tokens
const USDC = new Token(
  ChainId.MAINNET,
  "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USDC contract address
  6 // USDC has 6 decimals
);

const WLD = new Token(
  ChainId.MAINNET,
  "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // Replace with WLD contract address
  18 // WLD has 18 decimals
);

// Define Uniswap V2 ABI
const uniswapV2poolABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

// Set up an Ethereum provider (e.g., Infura or Alchemy)
const provider = new ethers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/e44f049baec044b393d4c5c8a62fade5"
);

// Convert USDC to WLD
export async function convertUsdcToWld(amountInUsdc: string): Promise<string> {
  try {
    // Get the pair address for USDC-WLD
    const pairAddress = Pair.getAddress(USDC, WLD);
    console.log("pairaddress", pairAddress);
    console.log("provider", provider);
    // Check if the pair exists
    const code = await provider.getCode(pairAddress);
    console.log("code", code);
    if (code === "0x") {
      throw new Error("No Uniswap V2 pool exists for the given token pair.");
    }

    // Fetch the pair contract
    const pairContract = new ethers.Contract(
      pairAddress,
      uniswapV2poolABI,
      provider
    );

    // Fetch the reserves
    const [reserve0, reserve1] = await pairContract.getReserves();

    // Sort tokens (Uniswap requires lexicographical order)
    const [token0, token1] = USDC.sortsBefore(WLD) ? [USDC, WLD] : [WLD, USDC];
    const reserveToken0 = token0 === USDC ? reserve0 : reserve1;
    const reserveToken1 = token1 === WLD ? reserve1 : reserve0;

    // Convert input amount to raw units
    const amountInUsdcRaw = ethers.parseUnits(amountInUsdc, USDC.decimals);

    // Calculate the equivalent amount of WLD
    const amountInWldRaw =
      (BigInt(amountInUsdcRaw.toString()) * BigInt(reserveToken1.toString())) /
      BigInt(reserveToken0.toString());

    // Convert to human-readable format
    return ethers.formatUnits(amountInWldRaw, WLD.decimals);
  } catch (error) {
    console.error("Error converting USDC to WLD:", error);
    throw error;
  }
}
