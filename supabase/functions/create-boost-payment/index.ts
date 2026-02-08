import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BOOST_PRICES: Record<string, number> = {
  vedette: 600, // 6€ in cents
  urgent: 300,  // 3€ in cents
  remontee: 150, // 1.50€ in cents
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use anon key for auth verification
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Use service role to bypass RLS for ad verification
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Autorisation requise");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !data.user) {
      throw new Error("Utilisateur non authentifié");
    }
    
    const user = data.user;

    const { adId, boostType } = await req.json();
    
    if (!adId || !boostType) {
      throw new Error("ID d'annonce et type de boost requis");
    }

    if (!BOOST_PRICES[boostType]) {
      throw new Error("Type de boost invalide");
    }

    // Verify the ad belongs to the user using service role
    const { data: ad, error: adError } = await supabaseAdmin
      .from('ads')
      .select('id, title, user_id, status')
      .eq('id', adId)
      .single();

    if (adError || !ad) {
      console.error("Ad lookup error:", adError);
      throw new Error("Annonce non trouvée");
    }

    // Verify ownership
    if (ad.user_id !== user.id) {
      throw new Error("Vous n'êtes pas autorisé à booster cette annonce");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const boostNames: Record<string, string> = {
      vedette: "Boost Vedette",
      urgent: "Boost Urgent", 
      remontee: "Remontée",
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: boostNames[boostType],
              description: `${boostNames[boostType]} pour: ${ad.title}`,
            },
            unit_amount: BOOST_PRICES[boostType],
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/mes-annonces?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/mes-annonces`,
      metadata: {
        adId: adId,
        boostType: boostType,
        userId: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating boost payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
