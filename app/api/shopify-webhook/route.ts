import type { NextApiRequest, NextApiResponse } from "next";

import { createHmac } from "crypto"; // Import createHmac directly from crypto
import supabase from "@/components/Supabase/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const data = req.body;

      // Verify the Shopify webhook (optional but recommended)
      const isValid = verifyShopifyWebhook(req, data);
      if (!isValid) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Extract necessary data and update points or set purchase completed
      const userId = data.customer?.id;

      const { error } = await supabase
        .from("users")
        .update({ purchase_completed: true })
        .eq("shopify_customer_id", userId);

      if (error) {
        return res.status(500).json({ error: "Database update failed" });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

// Function to verify the webhook
function verifyShopifyWebhook(req: NextApiRequest, data: any): boolean {
  const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
  const hmac = req.headers["x-shopify-hmac-sha256"] as string;
  const generatedHmac = createHmac("sha256", shopifySecret)
    .update(JSON.stringify(data), "utf8")
    .digest("base64");

  return hmac === generatedHmac;
}
