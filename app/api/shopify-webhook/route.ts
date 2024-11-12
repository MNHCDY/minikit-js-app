import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";
import supabase from "@/components/Supabase/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const rawBody = await getRawBody(req);

      // Verify the Shopify webhook (recommended for security)
      const isValid = verifyShopifyWebhook(req, rawBody);
      if (!isValid) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const data = JSON.parse(rawBody); // Parse the JSON data after verification
      const userId = data.customer?.id;

      if (!userId) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }

      // Update database to reflect purchase completion
      const { error } = await supabase
        .from("users")
        .update({ purchase_completed: true })
        .eq("shopify_customer_id", userId);

      if (error) {
        return res.status(500).json({ error: "Database update failed" });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

// Helper function to get raw body data
async function getRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}

// Function to verify the webhook
function verifyShopifyWebhook(req: NextApiRequest, rawBody: string): boolean {
  const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
  const hmac = req.headers["x-shopify-hmac-sha256"] as string;

  if (!hmac) {
    console.warn("No HMAC signature found in request headers");
    return false;
  }

  const generatedHmac = createHmac("sha256", shopifySecret)
    .update(rawBody, "utf8")
    .digest("base64");

  return hmac === generatedHmac;
}
