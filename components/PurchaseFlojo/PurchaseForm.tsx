"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { PayBlock } from "../Pay";
import { useEffect, useState } from "react";
// import { JsonRpcProvider } from "ethers";
import { ChainId, Token, WETH9 } from "@uniswap/sdk-core";
import { getConversionRate } from "../Pay/ConversionUtils";
// import { Contract } from "ethers";

// // Uniswap V3 Factory ABI
// const uniswapV3FactoryAbi = [
//   "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)",
// ];

// // Uniswap V3 Pool ABI (to fetch state)
// const uniswapV3PoolAbi = [
//   "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
//   "function liquidity() view returns (uint128)",
// ];

// // Provider setup
// const provider = new JsonRpcProvider(
//   "https://mainnet.infura.io/v3/e44f049baec044b393d4c5c8a62fade5"
// );

// // Tokens
// const WLD = new Token(
//   ChainId.MAINNET,
//   "0x163f8C2467924be0ae7B5347228CABF260318753",
//   18
// );
// const WETH = new Token(
//   ChainId.MAINNET,
//   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//   18
// ); // Native WETH token on Mainnet

// // Uniswap V3 Factory Address (Mainnet)
// const UNISWAP_V3_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// // Fee tier (e.g., 0.3% = 3000)
// const FEE_TIER = 3000;

// // Function to fetch the pool address for the given token pair and fee tier
// async function getV3PoolAddress(
//   tokenA: Token,
//   tokenB: Token,
//   fee: number
// ): Promise<string> {
//   const factoryContract = new Contract(
//     UNISWAP_V3_FACTORY_ADDRESS,
//     uniswapV3FactoryAbi,
//     provider
//   );

//   const poolAddress = await factoryContract.getPool(
//     tokenA.address,
//     tokenB.address,
//     fee
//   );

//   if (
//     !poolAddress ||
//     poolAddress === "0x0000000000000000000000000000000000000000"
//   ) {
//     throw new Error(
//       "Pool does not exist for the given token pair and fee tier."
//     );
//   }
//   return poolAddress;
// }

// // Function to fetch the Uniswap V3 pool and calculate conversion rates
// // Function to fetch the Uniswap V3 pool and calculate conversion rates
// async function getConversionRate(): Promise<void> {
//   try {
//     const poolAddress = await getV3PoolAddress(WLD, WETH, FEE_TIER);
//     console.log("V3 Pool Address:", poolAddress);

//     const poolContract = new Contract(poolAddress, uniswapV3PoolAbi, provider);

//     // Fetch pool state
//     const [slot0, liquidity] = await Promise.all([
//       poolContract.slot0(),
//       poolContract.liquidity(),
//     ]);

//     const { sqrtPriceX96 } = slot0;

//     // Convert BigInt sqrtPriceX96 to a number for calculations
//     const sqrtPrice = Number(sqrtPriceX96) / Math.pow(2, 96);
//     const price = Math.pow(sqrtPrice, 2);

//     // Output prices
//     console.log(`Price of 1 WETH in terms of WLD: ${price}`);
//     console.log(`Price of 1 WLD in terms of WETH: ${1 / price}`);
//   } catch (error) {
//     console.error("Error fetching conversion rate:", error.message);
//     throw error;
//   }
// }

// // Main function
// async function main() {
//   await getConversionRate();
// }

// main().catch(console.error);
const axios = require("axios");

const PurchaseForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [priceInWLD, setPriceInWLD] = useState<number | null>(null);
  const [conversionRateUSDC_WLD, setConversionRateUSDC_WLD] = useState<
    number | string | null
  >(null);

  // Create token instances (WLD and WETH)
  const WLD = new Token(
    ChainId.MAINNET,
    "0x163f8C2467924be0ae7B5347228CABF260318753",
    18
  );
  const WETH = new Token(
    ChainId.MAINNET,
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    18
  );
  const USDC = new Token(
    ChainId.MAINNET,
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    6
  );
  // Validation Schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    address1: Yup.string().required("Address line 1 is required"),
    address2: Yup.string(),
    postalCode: Yup.string()
      .required("Postal code is required")
      .matches(/^\d{5}(-\d{4})?$/, "Invalid postal code"),
  });

  // Initial Form Values
  const initialValues = {
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    postalCode: "",
  };

  const SHOPIFY_STORE_DOMAIN = "26b521-91.myshopify.com";
  const STOREFRONT_ACCESS_TOKEN = "3f7a1d4c22df631b66f3fb0dd65f8fdc";

  const variantId = "49823391547714"; // Your numeric variant ID
  const globalVariantId = Buffer.from(
    `gid://shopify/ProductVariant/${variantId}`
  ).toString("base64");
  const quantity = 1; // Adjust the quantity as needed
  const axiosInstance = axios.create({
    baseURL: `https://${SHOPIFY_STORE_DOMAIN}/api/2023-07/graphql.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
    },
  });

  // const fetchWLDPrice = async () => {
  //   const uniswapGraphQLUrl =
  //     "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
  //   const poolAddress = "0x610E319b3A3Ab56A0eD5562927D37c233774ba39"; // Replace with actual pool address

  //   try {
  //     const response = await axios.post(uniswapGraphQLUrl, {
  //       query: `
  //         query {
  //           pool(id: "${poolAddress}") {
  //             token0 {
  //               symbol
  //             }
  //             token1 {
  //               symbol
  //             }
  //             token0Price
  //             token1Price
  //           }
  //         }
  //       `,
  //     });

  //     const data = response.data.data;
  //     if (data?.pool) {
  //       const { token0Price, token1Price } = data.pool;
  //       const priceInUSDC = parseFloat(token0Price); // Assuming token0 is WLD and token1 is USDC
  //       console.log(`WLD Price in USDC: ${priceInUSDC}`);
  //       return priceInUSDC;
  //     } else {
  //       console.error("Pool not found or data missing.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching WLD price from Uniswap:", error.message);
  //   }
  // };

  const getVariantPrice = async () => {
    try {
      const response = await axiosInstance.post("", {
        query: `
          query GetVariantPrice($id: ID!) {
            node(id: $id) {
              ... on ProductVariant {
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        `,
        variables: { id: globalVariantId },
      });

      const data = response.data.data;
      if (data?.node?.priceV2) {
        const { amount, currencyCode } = data.node.priceV2;
        console.log(amount);
        const priceInSGD = parseFloat(amount);

        // Example Conversion: Assuming 1 SGD = 0.25 WLD

        if (
          conversionRateUSDC_WLD &&
          typeof conversionRateUSDC_WLD === "number"
        ) {
          const convertSGD_USD = priceInSGD * 1.35;
          const convertedPrice = convertSGD_USD * conversionRateUSDC_WLD;
          setPriceInWLD(convertedPrice);
        } else {
          const conversionRate = 0.241151;
          const convertedPrice = conversionRate * conversionRate;

          setPriceInWLD(convertedPrice);
        }
      } else {
        console.error("Variant price not found");
        setPriceInWLD(null);
      }
    } catch (error) {
      console.error(
        "Error fetching variant price:",
        error.response ? error.response.data : error.message
      );
      setPriceInWLD(null);
    }
  };

  useEffect(() => {
    getVariantPrice();
    const fetchConversionRate = async () => {
      try {
        setError(null); // Reset any previous error
        // Call the getConversionRate function with dynamic tokens (ETH and WLD)
        const rate1 = await getConversionRate(WLD, WETH);
        const rate2 = await getConversionRate(WETH, USDC);
        setConversionRateUSDC_WLD("Loading...");
        // Call the getConversionRate function with dynamic tokens (ETH and WLD)
        const actualPriceWETH_WLD = 1 / rate1;
        console.log("for WLD/WETH", actualPriceWETH_WLD);

        const pow = 10 ** -12;
        const actualPriceWETH_USDC = rate2 * pow;
        console.log("for WETH/USDC", actualPriceWETH_USDC);
        const conversionRate = actualPriceWETH_WLD * actualPriceWETH_USDC;
        setConversionRateUSDC_WLD(conversionRate); // Update state with conversion rate
      } catch (err) {
        console.error(err); // Log the error
        setError("Error fetching conversion rate.");
        setConversionRateUSDC_WLD(null); // Reset conversion rate in case of error
      }
    };

    // Call the function to fetch the conversion rate when the component mounts
    fetchConversionRate();
  }, []);

  console.log("conversionRate", conversionRateUSDC_WLD);

  async function createCheckout(values: any) {
    try {
      const response = await axiosInstance.post("", {
        query: `
          mutation {
            checkoutCreate(input: {
              lineItems: [{ variantId: "${globalVariantId}", quantity: ${quantity} }],
                        customAttributes: [
                            { key: "firstName", value: "${values.firstName}" },
                            { key: "lastName", value: "${values.lastName}" },
                            { key: "address1", value: "${values.address1}" },
                            { key: "address2", value: "${values.address2}" },
                            { key: "postalCode", value: "${values.postalCode}" }
                        ]
            }) {
              checkout {
                id
                webUrl
              }
              checkoutUserErrors {
                code
                field
                message
              }
            }
          }
        `,
      });

      if (response.data.errors) {
        console.error("Error creating checkout:", response.data.errors);
      } else {
        console.log(
          "Checkout created successfully:",
          response.data.data.checkoutCreate.checkout
        );
      }
    } catch (error) {
      console.error(
        "Error creating checkout:",
        error.response ? error.response.data : error.message
      );
    }
  }

  //fetching the real time price of product

  // const getVariantPrice = async (variantId: any) => {
  //   try {
  //     const response = await axiosInstance.post("", {
  //       query: `
  //         query GetVariantPrice($id: ID!) {
  //           node(id: $id) {
  //             ... on ProductVariant {
  //               id
  //               priceV2 {
  //                 amount
  //                 currencyCode
  //               }
  //             }
  //           }
  //         }
  //       `,
  //       variables: { id: variantId },
  //     });

  //     const data = response.data.data;
  //     if (data?.node?.priceV2) {
  //       const { amount, currencyCode } = data.node.priceV2;
  //       console.log(`Price: ${amount} ${currencyCode}`);
  //       return { amount, currencyCode };
  //     } else {
  //       console.error("Variant price not found");
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error fetching variant price:",
  //       error.response ? error.response.data : error.message
  //     );
  //     return null;
  //   }
  // };

  // const fetchPrice = async () => {
  //   const variantPrice = await getVariantPrice(globalVariantId);
  //   if (variantPrice) {
  //     console.log(
  //       `Variant Price: ${variantPrice.amount} ${variantPrice.currencyCode}`
  //     );
  //   }
  // };

  // useEffect(() => {
  //   fetchPrice();
  // }, []);

  // Submit Handler
  const handleSubmit = async (values: any) => {
    if (!priceInWLD) {
      setError("Unable to fetch product price. Please try again later.");
      return;
    }

    try {
      const paymentSuccessful = await PayBlock.handlePay(values, priceInWLD);

      if (paymentSuccessful) {
        await createCheckout(values);
        setError(null); // Clear any previous errors
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="h-full flex items-center justify-center pt-0 p-6">
      <div className="w-full max-w-lg  py-[5vw] pt-[2vw] ">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            {/* First Name */}
            <div className="mb-[3vw]">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="firstName"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Last Name */}
            <div className="mb-[3vw]">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="lastName"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Address Line 1 */}
            <div className="mb-[3vw]">
              <label
                htmlFor="address1"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="address1"
                name="address1"
                placeholder="Enter your address"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="address1"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Address Line 2 */}
            <div className="mb-[3vw]">
              <label
                htmlFor="address2"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="address2"
                name="address2"
                placeholder="Enter your address (optional)"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
            </div>

            {/* Postal Code */}
            <div className="mb-[3vw]">
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="postalCode"
                name="postalCode"
                placeholder="Enter your postal code"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="postalCode"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#07494E] text-white py-[4vw] px-[2vw] mt-[8vw] rounded-lg hover:bg-[#07494ebd] transition"
            >
              PAY WITH {priceInWLD} WLD
              {/* Number(priceInWLD.toFixed(3)) */}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default PurchaseForm;
