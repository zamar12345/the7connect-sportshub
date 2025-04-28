
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// This function needs to be public (no JWT verification)
// For now, we'll accept all requests without webhook signature verification

serve(async (req) => {
  try {
    // Get the raw body as text
    const body = await req.text();
    const event = JSON.parse(body);
    
    console.log("Received webhook event:", event.type);

    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event without Stripe signature verification for now
    // In production, you should verify the signature using Stripe's webhook secret
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
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        console.log("Successfully updated donation status to completed for session:", session.id);
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
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        console.log("Successfully updated donation status to expired for session:", session.id);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error processing webhook:`, error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
