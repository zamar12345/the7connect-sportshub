
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// This function needs to be public (no JWT verification)
// We'll verify the Stripe signature instead

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
      });
    }

    // Get the raw body as text
    const body = await req.text();

    // Verify the event using the raw body and signature
    let event;
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret || "");
    } catch (error) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed` }), {
        status: 400,
      });
    }

    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Update the donation status to complete
        const { error } = await supabaseAdmin
          .from('donations')
          .update({ status: 'completed' })
          .eq('stripe_session_id', session.id);
          
        if (error) {
          console.error("Error updating donation status:", error);
        }
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object;
        
        // Update the donation status to failed
        const { error } = await supabaseAdmin
          .from('donations')
          .update({ status: 'expired' })
          .eq('stripe_session_id', session.id);
          
        if (error) {
          console.error("Error updating donation status:", error);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to Stripe to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
});
