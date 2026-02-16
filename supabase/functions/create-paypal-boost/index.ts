import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BOOST_PRICES: Record<string, string> = {
  vedette: "6.00",
  urgent: "3.00",
  remontee: "1.50",
};

const BOOST_NAMES: Record<string, string> = {
  vedette: "Boost Vedette",
  urgent: "Boost Urgent",
  remontee: "Remontée",
};

const PAYPAL_API_URL = "https://api-m.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");

  if (!clientId || !secret) {
    throw new Error("PayPal credentials not configured");
  }

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("PayPal auth error:", data);
    throw new Error("Failed to authenticate with PayPal");
  }

  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Autorisation requise");

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !data.user) throw new Error("Utilisateur non authentifié");

    const user = data.user;
    const { adId, boostType } = await req.json();

    if (!adId || !boostType) throw new Error("ID d'annonce et type de boost requis");
    if (!BOOST_PRICES[boostType]) throw new Error("Type de boost invalide");

    // Verify ad ownership
    const { data: ad, error: adError } = await supabaseAdmin
      .from("ads")
      .select("id, title, user_id")
      .eq("id", adId)
      .single();

    if (adError || !ad) throw new Error("Annonce non trouvée");
    if (ad.user_id !== user.id) throw new Error("Vous n'êtes pas autorisé à booster cette annonce");

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    const origin = req.headers.get("origin") || "https://bonplan-comores.lovable.app";

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: BOOST_PRICES[boostType],
            },
            description: `${BOOST_NAMES[boostType]} pour: ${ad.title}`,
            custom_id: JSON.stringify({ adId, boostType, userId: user.id }),
          },
        ],
        application_context: {
          brand_name: "BonPlan Comores",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${origin}/payment-success?provider=paypal`,
          cancel_url: `${origin}/mes-annonces`,
        },
      }),
    });

    const order = await orderResponse.json();
    if (!orderResponse.ok) {
      console.error("PayPal order error:", order);
      throw new Error("Erreur lors de la création de la commande PayPal");
    }

    // Find the approval URL
    const approvalLink = order.links?.find((link: any) => link.rel === "approve");
    if (!approvalLink) throw new Error("Lien de paiement PayPal non trouvé");

    return new Response(
      JSON.stringify({ url: approvalLink.href, orderId: order.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating PayPal boost payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
