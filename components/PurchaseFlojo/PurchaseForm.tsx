"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { PayBlock } from "../Pay";
import { useState } from "react";

const axios = require("axios");

const PurchaseForm = () => {
  const [error, setError] = useState<string | null>(null);
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

  const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
  const STOREFRONT_ACCESS_TOKEN = process.env.STOREFRONT_ACCESS_TOKEN;

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
    try {
      const paymentSuccessful = await PayBlock.handlePay(values);
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
