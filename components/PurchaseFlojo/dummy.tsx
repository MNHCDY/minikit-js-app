"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { PayBlock } from "../Pay";
import { useEffect, useState } from "react";
import { Token, WETH9, ChainId } from "@uniswap/sdk-core";
import { Pool, Route } from "@uniswap/v3-sdk";
import { ethers, JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider(
  "https://mainnet.infura.io/v3/e44f049baec044b393d4c5c8a62fade5"
);

const USDC = new Token(
  ChainId.MAINNET,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  6
);
const DAI = new Token(
  ChainId.MAINNET,
  "0x163f8C2467924be0ae7B5347228CABF260318753",
  18
);
const WETH = new Token(
  ChainId.MAINNET,
  "0x163f8C2467924be0ae7B5347228CABF260318753",
  18
); // Native WETH

// Pool Addresses
const POOL_USDC_WETH = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"; // WETH/USDC (0.3%)
const POOL_WETH_DAI = "0x841820459769cd629B10a36FD12E603938cc2679"; // DAI/USDC (0.05%)

// Uniswap Pool ABI
const poolAbi = [
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() view returns (uint128)",
];

async function fetchPoolState(poolAddress: string) {
  const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);

  const [slot0, liquidity] = await Promise.all([
    poolContract.slot0(),
    poolContract.liquidity(),
  ]);

  return { slot0, liquidity };
}

async function createPool(
  tokenA: Token,
  tokenB: Token,
  fee: number,
  poolAddress: string
): Promise<Pool> {
  const { slot0, liquidity } = await fetchPoolState(poolAddress);
  const { sqrtPriceX96, tick } = slot0;
  const tickInt = parseInt(tick);
  console.log("tick", typeof tickInt, tickInt);

  return new Pool(
    tokenA,
    tokenB,
    fee,
    sqrtPriceX96.toString(),
    liquidity.toString(),
    tickInt
  );
}

async function getConversionRate() {
  // Create pools
  const poolUSDCWETH = await createPool(USDC, WETH, 3000, POOL_USDC_WETH);
  const poolDAIUSDC = await createPool(WETH, DAI, 3000, POOL_WETH_DAI);

  // Create a multi-hop route: WETH -> USDC -> DAI
  const route = new Route([poolUSDCWETH, poolDAIUSDC], USDC, DAI);
  console.log("route", route);

  // Get the mid-price for the route
  const midPrice = route.midPrice.toSignificant(6);
  console.log(`1 WETH -> ${midPrice} DAI`);

  return midPrice;
}

getConversionRate().catch(console.error);
const axios = require("axios");

const PurchaseForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [priceInWLD, setPriceInWLD] = useState<number | null>(null);
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
        const conversionRate = 0.241151;
        const convertedPrice = priceInSGD * conversionRate;

        setPriceInWLD(convertedPrice);
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
    // fetchWLDPrice();
  }, []);

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
              PAY WITH 2.0 WLD
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default PurchaseForm;
