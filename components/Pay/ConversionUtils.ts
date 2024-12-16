import { JsonRpcProvider } from "ethers";
import { Token, ChainId } from "@uniswap/sdk-core";
import { Contract } from "ethers";

// Uniswap V3 Factory ABI
const uniswapV3FactoryAbi = [
  "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)",
];

// Uniswap V3 Pool ABI (to fetch state)
const uniswapV3PoolAbi = [
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() view returns (uint128)",
];

// Provider setup
const provider = new JsonRpcProvider(
  "https://mainnet.infura.io/v3/e44f049baec044b393d4c5c8a62fade5"
);

// Uniswap V3 Factory Address (Mainnet)
const UNISWAP_V3_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// Fee tier (e.g., 0.3% = 3000)
const FEE_TIER = 3000;

// Function to fetch the pool address for the given token pair and fee tier
export async function getV3PoolAddress(
  tokenA: Token,
  tokenB: Token,
  fee: number
): Promise<string> {
  const factoryContract = new Contract(
    UNISWAP_V3_FACTORY_ADDRESS,
    uniswapV3FactoryAbi,
    provider
  );

  const poolAddress = await factoryContract.getPool(
    tokenA.address,
    tokenB.address,
    fee
  );

  if (
    !poolAddress ||
    poolAddress === "0x0000000000000000000000000000000000000000"
  ) {
    throw new Error(
      "Pool does not exist for the given token pair and fee tier."
    );
  }
  return poolAddress;
}

// Function to fetch the Uniswap V3 pool and calculate conversion rates
export async function getConversionRate(
  tokenA: Token,
  tokenB: Token
): Promise<string> {
  try {
    const poolAddress = await getV3PoolAddress(tokenA, tokenB, FEE_TIER);
    console.log("V3 Pool Address:", poolAddress);

    const poolContract = new Contract(poolAddress, uniswapV3PoolAbi, provider);

    // Fetch pool state
    const [slot0, liquidity] = await Promise.all([
      poolContract.slot0(),
      poolContract.liquidity(),
    ]);

    const { sqrtPriceX96 } = slot0;

    // Convert BigInt sqrtPriceX96 to a number for calculations
    const sqrtPrice = Number(sqrtPriceX96) / Math.pow(2, 96);
    const price = Math.pow(sqrtPrice, 2);

    // Return price as string for React component to display
    return `Price of 1 ${tokenB.symbol} in terms of ${
      tokenA.symbol
    }: ${price}, Price of 1 ${tokenA.symbol} in terms of ${tokenB.symbol}: ${
      1 / price
    }`;
  } catch (error) {
    console.error("Error fetching conversion rate:", error.message);
    throw error;
  }
}
