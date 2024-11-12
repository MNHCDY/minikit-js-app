import { createHmac } from "crypto";
import supabase from "@/components/Supabase/supabaseClient";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // Verify the Shopify webhook (recommended for security)
    const isValid = verifyShopifyWebhook(req, rawBody);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    const data = JSON.parse(rawBody); // Parse the JSON data after verification
    const userId = data.customer?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid customer ID" }), {
        status: 400,
      });
    }

    // Update database to reflect purchase completion
    const { error } = await supabase
      .from("users")
      .update({ purchase_completed: true })
      .eq("shopify_customer_id", userId);

    if (error) {
      return new Response(JSON.stringify({ error: "Database update failed" }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

// Function to verify the webhook
function verifyShopifyWebhook(req: Request, rawBody: string): boolean {
  const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
  const hmac = req.headers.get("x-shopify-hmac-sha256");

  if (!hmac) {
    console.warn("No HMAC signature found in request headers");
    return false;
  }

  const generatedHmac = createHmac("sha256", shopifySecret)
    .update(rawBody, "utf8")
    .digest("base64");

  return hmac === generatedHmac;
}
