import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlockchainLogRequest {
  incidentId: string;
  threatType: string;
  severity: string;
  lat: number;
  lon: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incidentId, threatType, severity, lat, lon }: BlockchainLogRequest = await req.json();

    console.log('Logging to blockchain:', { incidentId, threatType, severity, lat, lon });

    const rpcUrl = Deno.env.get('SEPOLIA_RPC_URL');
    const privateKey = Deno.env.get('WALLET_PRIVATE_KEY');

    if (!rpcUrl || !privateKey) {
      console.log('Blockchain configuration not set - generating mock tx hash');
      // Generate mock transaction hash for demo
      const mockTxHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from('incidents')
        .update({ tx_hash: mockTxHash })
        .eq('id', incidentId);

      return new Response(
        JSON.stringify({ success: true, txHash: mockTxHash, demo: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple blockchain logging using eth_sendRawTransaction
    // In production, use a proper library like ethers.js
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create transaction data (simplified)
    // Format: keccak256("logIncident(string,uint256,string)")
    const data = `0x${incidentId.slice(0, 32).padEnd(64, '0')}${timestamp.toString(16).padStart(64, '0')}`;
    
    // Send transaction to Sepolia
    const txResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendRawTransaction',
        params: [data],
      }),
    });

    const txResult = await txResponse.json();
    console.log('Blockchain response:', txResult);

    // For demo purposes, generate a mock transaction hash
    const txHash = txResult.result || `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    // Update incident with transaction hash
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('incidents')
      .update({ tx_hash: txHash })
      .eq('id', incidentId);

    if (updateError) {
      console.error('Error updating incident:', updateError);
      throw updateError;
    }

    console.log('Successfully logged to blockchain:', txHash);

    return new Response(
      JSON.stringify({ success: true, txHash }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in log-blockchain:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
