import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test users to create
    const testUsers = [
      { email: 'vanderoliver@bjjoss.com', password: 'Entrar2026@', name: 'Vander Oliver', role: 'super_admin' },
      { email: 'adminct_test@academia.com', password: 'test123', name: 'Carlos Eduardo Silva', role: 'admin_ct' },
      { email: 'proftest@academia.com', password: 'test123', name: 'Mestre João Paulo Santos', role: 'professor' },
      { email: 'atendtest@academia.com', password: 'test123', name: 'Maria Aparecida Santos', role: 'atendente' },
      { email: 'alunotest@email.com', password: 'test123', name: 'Pedro Henrique Costa', role: 'aluno' },
    ];

    const results = [];

    for (const testUser of testUsers) {
      // Check if user already exists in auth.users
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);
      
      let authUserId: string;
      
      if (existingUser) {
        authUserId = existingUser.id;
        console.log(`User ${testUser.email} already exists with id ${authUserId}`);
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: { name: testUser.name }
        });

        if (authError) {
          console.error(`Error creating user ${testUser.email}:`, authError);
          results.push({ email: testUser.email, error: authError.message });
          continue;
        }

        authUserId = authData.user!.id;
        console.log(`Created user ${testUser.email} with id ${authUserId}`);
      }

      // Get the old profile
      const { data: oldProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', testUser.email)
        .single();

      if (oldProfile) {
        const oldUserId = oldProfile.user_id;

        // Update profile with correct user_id
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ user_id: authUserId })
          .eq('email', testUser.email);

        if (profileError) {
          console.error(`Error updating profile for ${testUser.email}:`, profileError);
        }

        // Update user_roles with correct user_id
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .update({ user_id: authUserId })
          .eq('user_id', oldUserId);

        if (roleError) {
          console.error(`Error updating role for ${testUser.email}:`, roleError);
        }

        results.push({ 
          email: testUser.email, 
          success: true, 
          authUserId,
          oldUserId,
          role: testUser.role
        });
      } else {
        // Create new profile
        const { error: insertProfileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: authUserId,
            name: testUser.name,
            email: testUser.email
          });

        if (insertProfileError) {
          console.error(`Error creating profile for ${testUser.email}:`, insertProfileError);
        }

        // Create user role
        const { error: insertRoleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: authUserId,
            role: testUser.role
          });

        if (insertRoleError) {
          console.error(`Error creating role for ${testUser.email}:`, insertRoleError);
        }

        results.push({ 
          email: testUser.email, 
          success: true, 
          authUserId,
          created: true,
          role: testUser.role
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test users created/updated successfully',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
