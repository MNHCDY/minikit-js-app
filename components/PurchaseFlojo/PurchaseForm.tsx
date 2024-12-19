"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { PayBlock } from "../Pay";
import { useEffect, useState } from "react";
import { ChainId, Token, WETH9 } from "@uniswap/sdk-core";
import { getConversionRate } from "../Pay/ConversionUtils";
import { useSession } from "next-auth/react";
import supabase from "../Supabase/supabaseClient";
const axios = require("axios");

const PurchaseForm = () => {
  const [worldID, setWorldID] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [priceInWLD, setPriceInWLD] = useState<number | null>(null);
  const [priceInUSD, setPriceInUSD] = useState<number | null>(null);
  const [priceInSGD, setPriceInSGD] = useState<number | null>(null);
  const [conversionRateUSDC_WLD, setConversionRateUSDC_WLD] = useState<
    number | string | null
  >(null);
  const [conversionRateSGD_USD, setConversionRateSGD_USD] = useState<
    number | string | null
  >(null);
  const [points, setPoints] = useState<any | null>(null);

  const { data: session } = useSession();

  // Set the worldID when the session changes
  useEffect(() => {
    if (session) {
      setWorldID(session.user?.name || ""); // Set worldID if session exists
    }
  }, [session]);

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
    address2: Yup.string().required("Address line 2 is required"),
    postalCode: Yup.string()
      .required("Postal code is required")
      .matches(/^\d{6}(-\d{6})?$/, "Invalid postal code"),
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
        // console.log(amount);
        const priceInSGD = parseFloat(amount);
        setPriceInSGD(priceInSGD);
      } else {
        console.error("Variant price not found");
        setPriceInSGD(null);
      }
    } catch (error) {
      console.error(
        "Error fetching variant price:",
        error.response ? error.response.data : error.message
      );
      setPriceInSGD(null);
    }
  };

  useEffect(() => {
    getVariantPrice();
    const fetchConversionRateSGD_USD = async () => {
      try {
        setError(null);
        const rate = await fetchSGDToUSDC();
        // console.log("rate sgd to usd", rate);
        setConversionRateSGD_USD("loading....");
        setConversionRateSGD_USD(rate);
      } catch (err) {
        console.error(err);
        setError("Error fetching conversion rate from sgd to usd");
        setConversionRateSGD_USD(null);
      }
    };
    fetchConversionRateSGD_USD();
    const fetchConversionRate = async () => {
      try {
        setError(null); // Reset any previous error
        // Call the getConversionRate function with dynamic tokens (ETH and WLD)
        const rate1 = await getConversionRate(WLD, WETH);
        const rate2 = await getConversionRate(WETH, USDC);
        setConversionRateUSDC_WLD("Loading...");
        // Call the getConversionRate function with dynamic tokens (ETH and WLD)
        const actualPriceWETH_WLD = 1 / rate1;
        // console.log("for WLD/WETH", actualPriceWETH_WLD);

        const pow = 10 ** -12;
        const actualPriceWETH_USDC = rate2 * pow;
        // console.log("for WETH/USDC", actualPriceWETH_USDC);
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

  console.log("conversionRate USDC to WLD", conversionRateUSDC_WLD);
  console.log("conversionRate SGD to USD", conversionRateSGD_USD);

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
        try {
          const { data: existingEntry, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("world_id", worldID)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Supabase Fetch Error:", fetchError);
            setError("Error checking world ID in Supabase.");
            return;
          }
          const { data } = await supabase
            .from("users")
            .select("points")
            .eq("world_id", worldID);

          setPoints(data);

          if (existingEntry) {
            const { error: updateError } = await supabase
              .from("users")
              .update({ purchase_completed: true, points: `${points + 40}` })
              .eq("world_id", worldID);

            if (updateError) {
              setError("already rewarded");
            }
          }
        } catch (error) {
          setError("An unexpected error occurred.");
        }
        setError(null); // Clear any previous errors
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchSGDToUSDC = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: "usd-coin", // ID for USDC
            vs_currencies: "sgd", // Compare against SGD
          },
        }
      );

      const data = response.data;
      if (data["usd-coin"] && data["usd-coin"].sgd) {
        const sgdToUSDC = 1 / data["usd-coin"].sgd; // Conversion: SGD → USDC
        // console.log(`1 SGD = ${sgdToUSDC} USDC`);
        return sgdToUSDC;
      } else {
        throw new Error("Conversion rate not available.");
      }
    } catch (error) {
      console.error("Error fetching SGD to USDC rate:", error.message);
      return null;
    }
  };

  // Example usage

  useEffect(() => {
    if (
      priceInSGD &&
      conversionRateSGD_USD &&
      typeof priceInSGD === "number" &&
      typeof conversionRateSGD_USD === "number"
    ) {
      const rate = priceInSGD * conversionRateSGD_USD;
      // const rate = 33
      setPriceInUSD(rate);
    } else {
      setPriceInWLD(0); // Default value
    }
  }, [priceInSGD, conversionRateSGD_USD]);

  useEffect(() => {
    if (
      priceInUSD &&
      conversionRateUSDC_WLD &&
      typeof priceInUSD === "number" &&
      typeof conversionRateUSDC_WLD === "number"
    ) {
      setPriceInWLD(priceInUSD * conversionRateUSDC_WLD);
    } else {
      setPriceInWLD(0); // Default value
    }
  }, [priceInUSD, conversionRateUSDC_WLD]);

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
                placeholder="Enter your address line 1"
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
                placeholder="Enter your address line 2"
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
              className={`w-full bg-[#07494E] text-white py-[4vw] px-[2vw] mt-[8vw] rounded-lg hover:bg-[#07494ebd] transition ${
                priceInUSD && conversionRateUSDC_WLD ? "" : "disable"
              }`}
            >
              PAY WITH {priceInWLD !== null ? Math.round(priceInWLD) : 0} WLD
              {/* Number(priceInWLD.toFixed(3)) */}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default PurchaseForm;
