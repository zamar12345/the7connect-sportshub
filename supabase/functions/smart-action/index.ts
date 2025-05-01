
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const message = body.message || 'No message provided';
    
    console.log("Received message:", message);

    // Process the request (you can customize this part)
    const response = {
      status: 'success',
      message: `You said: "${message}"`,
      timestamp: new Date().toISOString()
    };
    
    // Return the response with CORS headers
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        error: error.message || 'Unknown error' 
      }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
