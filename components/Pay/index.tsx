import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";

const sendPayment = async (formValues: any) => {
  try {
    const res = await fetch(`/api/initiate-payment`, { method: "POST" });
    const { id } = await res.json();

    const payload: PayCommandInput = {
      reference: id,
      to: process.env.PAYMENT_ADDRESS as string, // Ensure PAYMENT_ADDRESS is set
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(0.5, Tokens.WLD).toString(),
        },
        {
          symbol: Tokens.USDCE,
          token_amount: tokenToDecimals(0.1, Tokens.USDCE).toString(),
        },
      ],
      description: `Order for ${formValues.firstName} ${formValues.lastName}, Address: ${formValues.address1}, ${formValues.address2}, Postal Code: ${formValues.postalCode}`,
    };

    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    return null;
  } catch (error: unknown) {
    console.error("Error sending payment", error);
    return null;
  }
};

export const PayBlock = {
  handlePay: async (formValues: any) => {
    if (!MiniKit.isInstalled()) {
      console.error("MiniKit is not installed");
      return false;
    }

    const sendPaymentResponse = await sendPayment(formValues);
    const response = sendPaymentResponse?.finalPayload;

    if (!response) {
      return false;
    }

    if (response.status === "success") {
      const res = await fetch(`/api/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: response }),
      });

      const payment = await res.json();
      return payment.success;
    }
    return false;
  },
};
